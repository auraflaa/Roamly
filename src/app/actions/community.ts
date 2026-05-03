'use server';

import { db } from '@/lib/firebase-server';
import { collection, addDoc, serverTimestamp, doc, updateDoc, increment, arrayUnion, arrayRemove } from 'firebase/firestore/lite';
import { initFirebaseAdmin, uploadBufferToStorage } from '@/lib/firebase-admin';
import { Buffer } from 'node:buffer';
import sharp from 'sharp';

const COMMUNITY_IMAGE_LIMIT_BYTES = 620 * 1024;

export interface PostData {
  authorId: string;
  authorName: string;
  authorPhoto?: string;
  photos: string[];
  title: string;
  subtitle?: string;
  description: string;
  content: string;
  vibeTags: string[];
  gemId?: string;
  readingTime?: string;
}

function getUtf8Bytes(value: string) {
  return Buffer.byteLength(value, 'utf8');
}

function validateFirestorePhotos(photos: string[]) {
  if (photos.length > 1) {
    throw new Error('Community posts support one image in prototype mode.');
  }

  for (const photo of photos) {
    if (photo.startsWith('data:image/')) {
      if (getUtf8Bytes(photo) > COMMUNITY_IMAGE_LIMIT_BYTES) {
        throw new Error('Image is too large for prototype storage.');
      }
    } else if (photo.startsWith('http://') || photo.startsWith('https://')) {
      // External URLs are allowed; migration will attempt to copy them to Storage.
    } else {
      throw new Error('Please upload an image or provide an http(s) URL.');
    }
  }
}

/**
 * Creates a new community post in Firestore. If images are provided as data URLs
 * and a Firebase Admin service account is configured (FIREBASE_SERVICE_ACCOUNT_KEY),
 * the server will upload images to Firebase Storage and store the public URL in the doc.
 */
export async function createPost(data: PostData) {
  try {
    validateFirestorePhotos(data.photos || []);

    const postsCol = collection(db, 'community_posts');

    // Create the document without photos first so we have an ID for storage paths
    const docRef = await addDoc(postsCol, {
      ...data,
      photos: [],
      moderationStatus: 'approved',
      flagCount: 0,
      flaggedBy: [],
      likes: 0,
      likedBy: [],
      commentCount: 0,
      viewCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    const adm = initFirebaseAdmin();
    const processedPhotos: string[] = [];

    for (let i = 0; i < (data.photos || []).length; i++) {
      const photo = data.photos[i];

      if (photo.startsWith('data:image/')) {
        // Try to upload to Storage when Admin is configured
        if (adm) {
          try {
            const match = photo.match(/^data:(image\/[a-zA-Z0-9+.]+);base64,(.*)$/);
            const b64 = match ? match[2] : photo.split(',')[1];
            const buffer = Buffer.from(b64, 'base64');

            // Re-encode/normalize to webp for consistent delivery
            const compressed = await sharp(buffer)
              .resize(900, 900, { fit: 'inside', withoutEnlargement: true })
              .webp({ quality: 80 })
              .toBuffer();

            const destPath = `community/${docRef.id}/photo-${i}.webp`;
            const publicUrl = await uploadBufferToStorage(compressed, destPath, 'image/webp');
            processedPhotos.push(publicUrl);
          } catch (err) {
            console.warn('Upload to Storage failed, falling back to inline data URL', err);
            processedPhotos.push(photo);
          }
        } else {
          // No admin configured - keep the inline data URL
          processedPhotos.push(photo);
        }
      } else if (photo.startsWith('http://') || photo.startsWith('https://')) {
        // External URL - keep it (migration can copy it later)
        processedPhotos.push(photo);
      } else {
        // Unexpected format - include as-is
        processedPhotos.push(photo);
      }
    }

    // Update the doc with processed photo URLs
    await updateDoc(doc(db, 'community_posts', docRef.id), { photos: processedPhotos, updatedAt: serverTimestamp() });

    return { success: true, id: docRef.id };
  } catch (error: any) {
    console.error('Create post failed:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Toggles a like on a post
 */
export async function toggleLike(postId: string, userId: string, isLiking: boolean) {
  const sanitizedId = postId?.replace(/%20| /g, '-');
  try {
    const postRef = doc(db, 'community_posts', sanitizedId);
    await updateDoc(postRef, {
      likes: increment(isLiking ? 1 : -1),
      likedBy: isLiking ? arrayUnion(userId) : arrayRemove(userId)
    });
    return { success: true };
  } catch (error: any) {
    console.error('Toggle like failed:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Adds a comment to a post
 */
export async function addComment(postId: string, userId: string, userName: string, text: string) {
  const sanitizedId = postId?.replace(/%20| /g, '-');
  try {
    const commentsCol = collection(db, 'community_posts', sanitizedId, 'comments');
    await addDoc(commentsCol, {
      userId,
      userName,
      text,
      createdAt: serverTimestamp()
    });

    const postRef = doc(db, 'community_posts', sanitizedId);
    await updateDoc(postRef, {
      commentCount: increment(1)
    });

    return { success: true };
  } catch (error: any) {
    console.error('Add comment failed:', error);
    return { success: false, error: error.message };
  }
}
