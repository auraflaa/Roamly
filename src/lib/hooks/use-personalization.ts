'use client';

import useSWR from 'swr';
import { getPersonalizedFeed, getTopStorytellers } from '@/app/actions/personalization';
import type { CommunityPost } from '@/lib/types';

/**
 * Hook to fetch a personalized community feed based on user vibes.
 * Uses SWR for caching to ensure instant tab switching.
 */
export function usePersonalizedFeed(userId: string | undefined, userVibes: string[], vibeAffinities: any) {
  const { data, error, isLoading, mutate } = useSWR(
    userId ? ['personalized-feed', userId, userVibes.join(','), JSON.stringify(vibeAffinities)] : null,
    async () => {
      if (!userId) return [];
      return await getPersonalizedFeed(userId, userVibes, vibeAffinities);
    },
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
      dedupingInterval: 300000, // 5 minutes
    }
  );

  return {
    rankedPosts: data || [],
    isLoading,
    error,
    mutate
  };
}

/**
 * Hook to fetch top storytellers.
 */
export function useTopStorytellers() {
  const { data, error, isLoading } = useSWR(
    'top-storytellers',
    async () => await getTopStorytellers(),
    {
      revalidateOnFocus: false,
      dedupingInterval: 600000, // 10 minutes
    }
  );

  return {
    storytellers: data || [],
    isLoading,
    error
  };
}
