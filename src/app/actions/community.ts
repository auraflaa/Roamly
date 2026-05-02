'use server';

import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, doc, updateDoc, increment, arrayUnion, arrayRemove } from 'firebase/firestore';

export interface PostData {
  authorId: string;
  authorName: string;
  authorPhoto?: string;
  photos: string[];
  title: string;
  description: string;
  vibeTags: string[];
  gemId?: string;
}

/**
 * Creates a new community post in Firestore
 */
export async function createPost(data: PostData) {
  try {
    const postsCol = collection(db, 'community_posts');
    const docRef = await addDoc(postsCol, {
      ...data,
      moderationStatus: 'approved', // Auto-approve for MVP as per spec Section 10
      flagCount: 0,
      flaggedBy: [],
      likes: 0,
      likedBy: [],
      commentCount: 0,
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
