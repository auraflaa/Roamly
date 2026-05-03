'use server';

import { 
  getFirestore,
  collection, 
  getDocs, 
  updateDoc, 
  doc,
  increment,
} from 'firebase/firestore/lite';
import { db } from '@/lib/firebase-server';
import { Buffer } from 'node:buffer';
import https from 'node:https';
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const httpsAgent = new https.Agent({
  rejectUnauthorized: false
});

/**
 * Downloads an image with retry logic
 */
async function downloadImageWithRetry(url: string, retries = 3): Promise<Buffer> {
  for (let i = 0; i < retries; i++) {
    try {
      return await new Promise((resolve, reject) => {
        const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      agent: httpsAgent
    };

    https.get(url, options, (res) => {
          if (res.statusCode === 301 || res.statusCode === 302) {
            return downloadImageWithRetry(res.headers.location!, retries - i).then(resolve).catch(reject);
          }
          if (res.statusCode !== 200) {
            console.warn(`[SYNC] Image download failed with ${res.statusCode} for ${url}. Using fallback.`);
            // Return a reliable fallback travel image Base64 if Unsplash fails
            const fallbackUrl = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=60';
            if (url !== fallbackUrl) {
              return downloadImageWithRetry(fallbackUrl, 1).then(resolve).catch(reject);
            }
            reject(new Error(`Failed: ${res.statusCode}`));
            return;
          }
          const chunks: any[] = [];
          res.on('data', (chunk) => chunks.push(chunk));
          res.on('end', () => resolve(Buffer.concat(chunks)));
          res.on('error', reject);
        }).on('error', reject);
      });
    } catch (err) {
      if (i === retries - 1) throw err;
      await new Promise(r => setTimeout(r, 1000));
    }
  }
  throw new Error('Retries failed');
}

/**
 * Compresses an image and returns a Base64 string
 */
async function processImage(url: string, localFolder: string, id: string, index: number): Promise<string> {
  let buffer: Buffer;

  // Try local first
  const localPath = path.join(process.cwd(), 'data', 'migration', localFolder, id, `photo-${index}.jpg`);
  if (fs.existsSync(localPath)) {
    console.log(`[SYNC] Using local file for ${id} photo-${index}`);
    buffer = fs.readFileSync(localPath);
  } else {
    console.log(`[SYNC] Downloading ${url}...`);
    buffer = await downloadImageWithRetry(url);
  }

  // Compress to WebP
  const compressed = await sharp(buffer)
    .resize(900, 900, { fit: 'inside', withoutEnlargement: true }) // Optimized for Firestore document limits
    .webp({ quality: 80 }) 
    .toBuffer();
  
  return `data:image/webp;base64,${compressed.toString('base64')}`;
}

export async function syncPhotosToFirestore() {
  console.log('[SYNC] Starting Firestore Base64 Migration...');

  try {
    // 1. Process Gems
    const snapshot = await getDocs(collection(db, 'gems'));
    console.log(`[SYNC] Found ${snapshot.size} gems.`);

    for (const gemDoc of snapshot.docs) {
      const gemId = gemDoc.id;
      const photos = gemDoc.data().photos || [];
      const newPhotos: string[] = [];

      console.log(`[SYNC] Processing Gem: ${gemId}`);
      for (let i = 0; i < photos.length; i++) {
        const url = photos[i];
        if (url.startsWith('data:image')) {
          newPhotos.push(url);
          continue;
        }

        try {
          const b64 = await processImage(url, 'gems', gemId, i);
          newPhotos.push(b64);
        } catch (e) {
          console.error(`[SYNC] Error processing gem ${gemId}:`, e);
          newPhotos.push(url);
        }
      }

      await updateDoc(doc(db, 'gems', gemId), { photos: newPhotos });
    }

    // 2. Process Community Posts
    const postsSnapshot = await getDocs(collection(db, 'community_posts'));
    console.log(`[SYNC] Found ${postsSnapshot.size} community posts.`);

    for (const postDoc of postsSnapshot.docs) {
      const postId = postDoc.id;
      const photos = postDoc.data().photos || [];
      const newPhotos: string[] = [];

      console.log(`[SYNC] Processing Post: ${postId}`);
      for (let i = 0; i < photos.length; i++) {
        const url = photos[i];
        if (url.startsWith('data:image')) {
          newPhotos.push(url);
          continue;
        }

        try {
          const b64 = await processImage(url, 'community', postId, i);
          newPhotos.push(b64);
        } catch (e) {
          console.error(`[SYNC] Error processing post ${postId}:`, e);
          newPhotos.push(url);
        }
      }

      await updateDoc(doc(db, 'community_posts', postId), { photos: newPhotos });
    }

    return { success: true, message: 'All photos compressed and stored in Firestore!' };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}
