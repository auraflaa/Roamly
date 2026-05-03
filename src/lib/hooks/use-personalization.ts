'use client';

import useSWR from 'swr';
import { getPersonalizedFeed } from '@/app/actions/personalization';
import type { CommunityPost } from '@/lib/types';

/**
 * Hook to fetch a personalized community feed based on user vibes.
 * Uses SWR for caching to ensure instant tab switching.
 */
import React from 'react';

export function usePersonalizedFeed(userId: string | undefined, userVibes: string[], vibeAffinities: any) {
  // Sanitize vibeAffinities to remove non-plain objects (like Firestore Timestamps)
  const sanitizedAffinities = React.useMemo(() => {
    if (!vibeAffinities) return {};
    const sanitized: any = {};
    for (const [key, val] of Object.entries(vibeAffinities)) {
      const v = val as any;
      sanitized[key] = {
        ...v,
        lastInteraction: v.lastInteraction?.toDate?.()?.toISOString() || v.lastInteraction || null
      };
    }
    return sanitized;
  }, [vibeAffinities]);

  const { data, error, isLoading, mutate } = useSWR(
    userId ? ['personalized-feed', userId, userVibes.join(','), JSON.stringify(sanitizedAffinities)] : null,
    async () => {
      if (!userId) return [];
      return await getPersonalizedFeed(userId, userVibes, sanitizedAffinities);
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

