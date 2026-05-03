import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { s3Client, BUCKET_NAME, PROJECT_FOLDER } from '@/lib/s3';
import { PutObjectCommand } from '@aws-sdk/client-s3';

/**
 * Helper to add a delay between operations
 */
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Downloads an image with retry logic and browser headers
 */
async function downloadImageWithRetry(url: string, retries = 2) {
  for (let i = 0; i <= retries; i++) {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
          'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
          'Referer': 'https://unsplash.com/'
        },
        redirect: 'follow'
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return Buffer.from(await response.arrayBuffer());
    } catch (err) {
      if (i === retries) throw err;
      console.log(`Retry ${i + 1} for ${url}...`);
      await sleep(1000 * (i + 1)); // Exponential backoff
    }
  }
}

/**
 * Migration Script: Downloads existing external photos and uploads them to HF Bucket.
 * PRODUCTION READY: Includes retries, rate-limiting, and validation.
 */
export async function syncPhotosToBucket() {
  try {
    const gemsCol = collection(db, 'gems');
    const snapshot = await getDocs(gemsCol);
    
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
        
        // Skip if already in bucket
        if (url.includes('huggingface.co/buckets')) {
          newBucketUrls.push(url);
          continue;
        }

        try {
          // 1. Download with retry
          const imageBuffer = await downloadImageWithRetry(url);
          const key = `${PROJECT_FOLDER}/gems/${gemId}/photo-${i}.jpg`;

          // 2. Upload to HF Bucket
          await s3Client.send(new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
            Body: imageBuffer,
            ContentType: 'image/jpeg',
            CacheControl: 'max-age=31536000' // 1 year cache
          }));

          const bucketUrl = `https://huggingface.co/buckets/${BUCKET_NAME}/${key}`;
          newBucketUrls.push(bucketUrl);
          photoCount++;
          
          // Rate limiting to be polite to external servers
          await sleep(200); 
        } catch (err) {
          console.warn(`[SYNC] Skipping broken photo ${i} for gem ${gemId} after retries.`);
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
 * Simple metadata-only migration (no downloads)
 */
export async function migrateGemsToBucket() {
  // ... existing code
}
