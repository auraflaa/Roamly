'use client';

import useSWR from 'swr';
import { collection, query, where, getDocs, limit, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Gem, Guide } from '@/lib/types';
import { SEED_GEMS, SEED_GUIDES } from '@/lib/seed';

/**
 * Hook to fetch and cache a list of gems with SWR.
 */
export function useGems(options: { limit?: number; vibe?: string } = {}) {
  const { data, error, isLoading, mutate } = useSWR(
    ['gems', options.limit, options.vibe],
    async () => {
      try {
        const q = query(
          collection(db, 'gems'),
          where('moderationStatus', '==', 'approved'),
          limit(options.limit || 20)
        );
        const snap = await getDocs(q);
        return snap.docs.map(d => ({ ...d.data(), id: d.id } as Gem));
      } catch (err) {
        console.error('Error fetching gems:', err);
        return [];
      }
    },
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
      dedupingInterval: 60000, // 1 minute
    }
  );

  return {
    gems: data || [],
    error,
    isLoading,
    mutate
  };
}

/**
 * Hook to fetch and cache a single gem.
 */
export function useGem(id: string) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? `gem/${id}` : null,
    async () => {
      const docRef = doc(db, 'gems', id);
      const snap = await getDoc(docRef);
      if (!snap.exists()) throw new Error('Gem not found');
      return { ...snap.data(), id: snap.id } as Gem;
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 300000, // 5 minutes
    }
  );

  return {
    gem: data,
    error,
    isLoading,
    mutate
  };
}

/**
 * Hook to fetch and cache guides by city.
 */
export function useGuides(city?: string) {
  const { data, error, isLoading, mutate } = useSWR(
    city ? `guides/${city}` : null,
    async () => {
      const q = query(
        collection(db, 'guides'),
        where('city', '==', city),
        limit(5)
      );
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ ...d.data(), uid: d.id } as Guide));
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 600000, // 10 minutes
    }
  );

  return {
    guides: data || [],
    error,
    isLoading,
    mutate
  };
}
