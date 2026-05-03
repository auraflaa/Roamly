"use server";

import { collection, query, orderBy, limit, getDocs, where, doc, updateDoc, getDoc, setDoc, increment } from 'firebase/firestore/lite';
import { db } from '@/lib/firebase-server';
import type { CommunityPost } from '@/lib/types';

/**
 * Ranks community posts based on a simple affinity score.
 */
export async function getPersonalizedFeed(userId: string, userVibes: string[] = [], vibeAffinities: Record<string, any> = {}) {
  if (!userId) return [];
  
  try {
    const postsCol = collection(db, 'community_posts');
    const q = query(postsCol, limit(20)); // Reduced limit for speed
    const snap = await getDocs(q);
    
    // Use map for faster iteration
    const rankedPosts = snap.docs.map(docSnap => {
      const post = docSnap.data() as CommunityPost;
      const id = docSnap.id;
      let score = 0;

      // 1. Vibe Matching
      if (post.vibeTags) {
        for (const tag of post.vibeTags) {
          if (userVibes.includes(tag)) score += 10;
          if (vibeAffinities?.[tag]?.score) {
            score += vibeAffinities[tag].score * 2;
          }
        }
      }

      // 2. Popularity
      score += (post.likes || 0) * 2;
      score += (post.commentCount || 0) * 3;

      // 3. Recency
      if (post.createdAt?.toDate) {
        const postDate = post.createdAt.toDate();
        const ageInHours = (Date.now() - postDate.getTime()) / 3600000;
        score -= ageInHours * 0.5;
      }

      return { 
        ...post, 
        id,
        createdAt: post.createdAt?.toDate?.().toISOString() || new Date().toISOString(),
        personalizationScore: score 
      } as any;
    });

    return rankedPosts.sort((a, b) => b.personalizationScore - a.personalizationScore);
  } catch (err) {
    console.error("Error generating personalized feed:", err);
    return [];
  }
}
