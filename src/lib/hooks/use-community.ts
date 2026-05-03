'use client';

import useSWR from 'swr';
import { collection, query, getDocs, limit, doc, getDoc, orderBy, getDocFromServer } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { CommunityPost, Comment } from '@/lib/types';

/**
 * Hook to fetch and cache community posts.
 * Uses Firestore Lite to avoid Grpc/Listen stream issues in browser.
 */
export function useCommunityPosts() {
  const { data, error, isLoading, mutate } = useSWR(
    'community/posts',
    async () => {
      try {
        const q = query(
          collection(db, 'community_posts'),
          limit(50)
        );
        const snap = await getDocs(q);
        return snap.docs.map(d => ({ ...d.data(), id: d.id } as CommunityPost));
      } catch (err: any) {
        console.error("Error fetching community posts:", err);
        throw err;
      }
    },
    {
      revalidateOnFocus: true,
      dedupingInterval: 30000, // 30 seconds
    }
  );

  return {
    posts: data || [],
    error,
    isLoading,
    mutate
  };
}

/**
 * Hook to fetch a single community post and its comments.
 */
export function useCommunityPost(id: string) {
  // Strip any hash fragments (e.g., #comments) and replace spaces/encoded spaces
  const sanitizedId = id?.split('#')[0]?.replace(/%20| /g, '-');
  
  const { data, error, isLoading, mutate } = useSWR(
    sanitizedId ? `community/post/${sanitizedId}` : null,
    async () => {
      try {
        const postRef = doc(db, 'community_posts', sanitizedId);
        
        // Try to get document (hits cache first)
        let postSnap = await getDoc(postRef);
        
        // If not found in cache or local state, force a server check
        if (!postSnap.exists()) {
          console.log(`Post ${sanitizedId} not found in cache, forcing server fetch...`);
          postSnap = await getDocFromServer(postRef);
          
          if (!postSnap.exists()) {
            console.error(`Post ${sanitizedId} definitely does not exist on server.`);
            return null;
          }
        }
        
        const postData = { ...postSnap.data(), id: postSnap.id } as CommunityPost;
        
        // Fetch comments
        const commentsRef = collection(db, 'community_posts', sanitizedId, 'comments');
        const commentsQuery = query(commentsRef, orderBy('createdAt', 'desc'), limit(50));
        const commentsSnap = await getDocs(commentsQuery);
        
        const commentsData = commentsSnap.docs.map(d => ({ 
          ...d.data(), 
          id: d.id 
        } as Comment));
        
        return { post: postData, comments: commentsData };
      } catch (err: any) {
        console.error("Error fetching community post:", err);
        throw err; // Throwing allows SWR to set the 'error' state
      }
    }
  );

  return {
    post: data?.post || null,
    comments: data?.comments || [],
    error,
    isLoading,
    mutate
  };
}
