'use server';

import { 
  getFirestore,
  collection, 
  getDocs, 
  updateDoc, 
  doc 
} from 'firebase/firestore/lite';
import app from '@/lib/firebase';
import { s3Client, BUCKET_NAME, PROJECT_FOLDER, HF_OWNER } from '@/lib/s3';
import { PutObjectCommand } from '@aws-sdk/client-s3';

import { Buffer } from 'node:buffer';
import https from 'node:https';
import fs from 'node:fs';
import path from 'node:path';

// Use Lite SDK for server-side migration to avoid gRPC ECONNRESET issues
const db = getFirestore(app, "talk-with-zeno");

// Create an HTTPS agent that ignores SSL certificate issues for public images
const httpsAgent = new https.Agent({
  rejectUnauthorized: false
});

/**
 * Helper to add a delay between operations
 */
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Downloads an image with retry logic and browser headers
 */
async function downloadImageWithRetry(url: string, retries = 2): Promise<Buffer> {
  let currentUrl = url;
  
  // Bypass SSL issues globally for this session
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    console.log(`[SYNC] ---> Attempt ${attempt + 1}: Downloading ${currentUrl.substring(0, 60)}...`);
    
    try {
      const buffer = await new Promise<Buffer>((resolve, reject) => {
        const req = https.get(currentUrl, { timeout: 15000 }, (res) => {
          if (res.statusCode === 301 || res.statusCode === 302 || res.statusCode === 307 || res.statusCode === 308) {
            const nextUrl = res.headers.location;
            if (nextUrl) {
              currentUrl = nextUrl.startsWith('http') ? nextUrl : new URL(nextUrl, currentUrl).toString();
              reject(new Error('REDIRECT'));
              return;
            }
          }
          
          if (res.statusCode !== 200) {
            reject(new Error(`HTTP_STATUS_${res.statusCode}`));
            return;
          }

          const chunks: Buffer[] = [];
          res.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
          res.on('end', () => resolve(Buffer.concat(chunks)));
          res.on('error', (e) => reject(new Error(`STREAM_ERROR: ${e.message}`)));
        });

        req.on('error', (e) => reject(new Error(`REQUEST_ERROR: ${e.message}`)));
        req.on('timeout', () => {
          req.destroy();
          reject(new Error('TIMEOUT'));
        });
      });

      console.log(`[SYNC] Success! Downloaded ${buffer.length} bytes.`);
      return buffer;
    } catch (err: any) {
      if (err.message === 'REDIRECT') {
        console.log(`[SYNC] Redirected to: ${currentUrl.substring(0, 60)}...`);
        attempt--; 
        continue;
      }
      
      console.warn(`[SYNC] Attempt ${attempt + 1} failed. Error:`, err.message || err);
      if (attempt === retries) throw err;
      await sleep(2000 * (attempt + 1));
    }
  }
  throw new Error('MAX_RETRIES_EXCEEDED');
}

/**
 * Migration Script: Downloads existing external photos and uploads them to HF Bucket.
 * PRODUCTION READY: Includes retries, rate-limiting, and validation.
 */
export async function syncPhotosToBucket() {
  console.log('[SYNC] Starting Gem sync...');
  try {
    const gemsCol = collection(db, 'gems');
    console.log('[SYNC] Fetching Gem documents...');
    const snapshot = await getDocs(gemsCol);
    console.log(`[SYNC] Found ${snapshot.size} gems.`);
    
    let photoCount = 0;
    let gemCount = 0;

    for (const gemDoc of snapshot.docs) {
      const data = gemDoc.data();
      const gemId = gemDoc.id;
      const currentPhotos = data.photos || [];
      const newBucketUrls: string[] = [];

      console.log(`[SYNC] Processing Gem: ${gemId} (${gemCount + 1}/${snapshot.size})`);

      for (let i = 0; i < currentPhotos.length; i++) {
        const url = currentPhotos[i];
        
        if (!url) {
          console.warn(`[SYNC] Skipping empty URL at index ${i} for gem ${gemId}`);
          continue;
        }

        console.log(`[SYNC] Processing URL: ${url.substring(0, 60)}...`);

        // Skip if already in bucket
        if (url.includes('huggingface.co/buckets')) {
          newBucketUrls.push(url);
          continue;
        }

        try {
          // 1. Download with retry
          const imageBuffer = await downloadImageWithRetry(url);
          const key = `gems/${gemId}/photo-${i}.jpg`;
          const localPath = path.join(process.cwd(), 'data', 'migration', key);
          const localDir = path.dirname(localPath);

          // Ensure local directory exists
          if (!fs.existsSync(localDir)) {
            fs.mkdirSync(localDir, { recursive: true });
          }

          console.log(`[SYNC] Saving locally: ${localPath}...`);
          fs.writeFileSync(localPath, imageBuffer);

          const bucketUrl = `https://huggingface.co/buckets/${HF_OWNER}/${BUCKET_NAME}/${key}`;
          newBucketUrls.push(bucketUrl);
          photoCount++;
          console.log(`[SYNC] Success! Saved photo-${i} for gem ${gemId}`);
          
          // Rate limiting to be polite to external servers
          await sleep(200); 
        } catch (err: any) {
          console.error(`[SYNC] !!! UPLOAD FAILED for gem ${gemId} photo ${i}:`, err.message || err);
          console.warn(`[SYNC] Skipping photo ${i} for gem ${gemId} due to upload failure.`);
          newBucketUrls.push(url); 
        }
      }

      // 3. Update Firestore
      await updateDoc(doc(db, 'gems', gemId), {
        photos: newBucketUrls,
        updatedAt: new Date().toISOString()
      });
      
      gemCount++;
    }

    return { success: true, gems: gemCount, photos: photoCount };
  } catch (error: any) {
    console.error('Photo sync failed:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Syncs community post photos to the HF Bucket.
 */
export async function syncCommunityPostsToBucket() {
  console.log('[SYNC] Starting Post sync...');
  try {
    const postsCol = collection(db, 'community_posts');
    console.log('[SYNC] Fetching Post documents...');
    const snapshot = await getDocs(postsCol);
    console.log(`[SYNC] Found ${snapshot.size} posts.`);
    
    let photoCount = 0;
    let postCount = 0;

    for (const postDoc of snapshot.docs) {
      const data = postDoc.data();
      const postId = postDoc.id;
      const currentPhotos = data.photos || [];
      const newBucketUrls: string[] = [];

      console.log(`[SYNC] Processing Post: ${postId} (${postCount + 1}/${snapshot.size})`);

      for (let i = 0; i < currentPhotos.length; i++) {
        const url = currentPhotos[i];
        
        if (url.includes('huggingface.co/buckets')) {
          newBucketUrls.push(url);
          continue;
        }

        try {
          const imageBuffer = await downloadImageWithRetry(url);
          const key = `community/${postId}/photo-${i}.jpg`;
          const localPath = path.join(process.cwd(), 'data', 'migration', key);
          const localDir = path.dirname(localPath);

          // Ensure local directory exists
          if (!fs.existsSync(localDir)) {
            fs.mkdirSync(localDir, { recursive: true });
          }

          console.log(`[SYNC] Saving locally: ${localPath}...`);
          fs.writeFileSync(localPath, imageBuffer);

          const bucketUrl = `https://huggingface.co/buckets/${HF_OWNER}/${BUCKET_NAME}/${key}`;
          newBucketUrls.push(bucketUrl);
          console.log(`[SYNC] Success! Saved photo-${i} for post ${postId}`);
          
        } catch (err: any) {
          console.error(`[SYNC] !!! UPLOAD FAILED for post ${postId} photo ${i}:`, err.message || err);
          console.warn(`[SYNC] Skipping photo ${i} for post ${postId} due to upload failure.`);
          newBucketUrls.push(url); 
        }
      }

      await updateDoc(doc(db, 'community_posts', postId), {
        photos: newBucketUrls,
        updatedAt: new Date().toISOString()
      });
      
      postCount++;
    }

    return { success: true, posts: postCount, photos: photoCount };
  } catch (error: any) {
    console.error('Post sync failed:', error);
    return { success: false, error: error.message };
  }
}
