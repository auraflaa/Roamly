'use server';

import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, doc, updateDoc, increment, arrayUnion, arrayRemove } from 'firebase/firestore';

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
    throw new Error('Community posts support one Firestore image in prototype mode.');
  }

  for (const photo of photos) {
    if (!photo.startsWith('data:image/')) {
      throw new Error('Please upload an image instead of pasting an external URL.');
    }

    if (getUtf8Bytes(photo) > COMMUNITY_IMAGE_LIMIT_BYTES) {
      throw new Error('Image is too large for Firestore prototype storage.');
    }
  }
}

/**
 * Creates a new community post in Firestore
 */
export async function createPost(data: PostData) {
  try {
    validateFirestorePhotos(data.photos || []);

    const postsCol = collection(db, 'community_posts');
    const docRef = await addDoc(postsCol, {
      ...data,
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
  try {
    const postRef = doc(db, 'community_posts', postId);
    await updateDoc(postRef, {
      likes: increment(isLiking ? 1 : -1),
      likedBy: isLiking ? arrayUnion(userId) : arrayRemove(userId)
    });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Adds a comment to a post
 */
export async function addComment(postId: string, userId: string, userName: string, text: string) {
  try {
    const commentsCol = collection(db, 'community_posts', postId, 'comments');
    await addDoc(commentsCol, {
      userId,
      userName,
      text,
      createdAt: serverTimestamp()
    });

    const postRef = doc(db, 'community_posts', postId);
    await updateDoc(postRef, {
      commentCount: increment(1)
    });

    return { success: true };
  } catch (error: any) {
    console.error('Add comment failed:', error);
    return { success: false, error: error.message };
  }
}
