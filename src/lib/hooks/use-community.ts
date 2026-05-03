'use client';

import useSWR from 'swr';
import { collection, query, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { CommunityPost } from '@/lib/types';

/**
 * Hook to fetch and cache community posts.
 */
export function useCommunityPosts() {
  const { data, error, isLoading, mutate } = useSWR(
    'community/posts',
    async () => {
      const q = query(
        collection(db, 'community_posts'),
        orderBy('createdAt', 'desc'),
        limit(50)
      );
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ ...d.data(), id: d.id } as CommunityPost));
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
