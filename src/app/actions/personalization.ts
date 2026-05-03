"use server";

import { collection, query, orderBy, limit, getDocs, where, doc, updateDoc, getDoc, setDoc, increment } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { CommunityPost } from '@/lib/types';

/**
 * Tracks a user's interaction with a specific vibe or category.
 * Used to build the personalization profile.
 */
export async function trackInteraction(userId: string, vibe: string, type: 'view' | 'like' | 'save') {
  if (!userId || !vibe) return;

  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) return;

    // Use a nested update for affinities
    // Weighting: view=1, like=5, save=10
    const weight = type === 'view' ? 1 : type === 'like' ? 5 : 10;
    
    await updateDoc(userRef, {
      [`vibeAffinities.${vibe}.score`]: increment(weight),
      [`vibeAffinities.${vibe}.lastInteraction`]: new Date(),
      [`vibeAffinities.${vibe}.count`]: increment(1)
    });
  } catch (err) {
    console.error("Error tracking interaction:", err);
  }
}

/**
 * Ranks community posts based on a simple affinity score.
 */
export async function getPersonalizedFeed(userId: string, userVibes: string[] = [], vibeAffinities: Record<string, any> = {}) {
  try {
    const postsCol = collection(db, 'community_posts');
    const q = query(postsCol, orderBy('createdAt', 'desc'), limit(50));
    const snap = await getDocs(q);
    const posts = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as CommunityPost));

    // Simple Scoring Algorithm
    const rankedPosts = posts.map(post => {
      let score = 0;

      // 1. Vibe Matching (High weight)
      if (post.vibeTags) {
        post.vibeTags.forEach(tag => {
          // Check explicit vibes
          if (userVibes.includes(tag)) score += 10;
          
          // Check historical affinities
          if (vibeAffinities && vibeAffinities[tag]) {
            score += (vibeAffinities[tag].score || 0) * 2;
          }
        });
      }

      // 2. Popularity (Medium weight)
      score += (post.likes || 0) * 2;
      score += (post.commentCount || 0) * 3;
      score += (post.viewCount || 0) * 0.1;

      // 3. Recency (Decay)
      if (post.createdAt?.toDate) {
        const ageInHours = (Date.now() - post.createdAt.toDate().getTime()) / (1000 * 60 * 60);
        score -= ageInHours * 0.5;
      }

      return { 
        ...post, 
        createdAt: post.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        personalizationScore: score 
      };
    });

    // Sort by score
    return JSON.parse(JSON.stringify(rankedPosts.sort((a: any, b: any) => b.personalizationScore - a.personalizationScore)));
  } catch (err) {
    console.error("Error generating personalized feed:", err);
    return [];
  }
}

/**
 * Suggests "Top Storytellers" based on engagement.
 */
export async function getTopStorytellers() {
    try {
      const postsCol = collection(db, 'community_posts');
      const q = query(postsCol, orderBy('likes', 'desc'), limit(20));
      const snap = await getDocs(q);
      
      const authorMap = new Map();
      snap.docs.forEach(doc => {
        const data = doc.data();
        const authorId = data.authorId;
        if (!authorId) return;

        if (!authorMap.has(authorId)) {
          authorMap.set(authorId, {
            id: authorId,
            name: data.authorName || 'Traveler',
            photo: data.authorPhoto || '',
            likes: 0,
            postCount: 0
          });
        }
        const stats = authorMap.get(authorId);
        stats.likes += (data.likes || 0);
        stats.postCount += 1;
      });

      const storytellers = Array.from(authorMap.values())
        .sort((a: any, b: any) => b.likes - a.likes)
        .slice(0, 5);
        
      return JSON.parse(JSON.stringify(storytellers));
    } catch (err) {
      console.error("Error fetching top storytellers:", err);
      return [];
    }
}
