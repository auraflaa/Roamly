'use client';

import useSWR from 'swr';
import { collection, query, where, getDocs, limit, doc, getDoc, getDocFromServer } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Gem, Guide } from '@/lib/types';

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
      try {
        const sanitizedId = id?.replace(/%20| /g, '-');
        const docRef = doc(db, 'gems', sanitizedId);
        
        // Try cache first
        let snap = await getDoc(docRef);
        
        // Fallback to server if not found in cache
        if (!snap.exists()) {
          console.log(`Gem ${id} not found in cache, forcing server fetch...`);
          snap = await getDocFromServer(docRef);
          
          if (!snap.exists()) {
            console.error(`Gem ${id} definitely does not exist.`);
            return null;
          }
        }
        
        return { ...snap.data(), id: snap.id } as Gem;
      } catch (err) {
        console.error('Error fetching gem:', err);
        return null;
      }
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
    city ? `guides/${city}` : 'guides/all',
    async () => {
      const q = city 
        ? query(collection(db, 'guides'), where('city', '==', city), limit(20))
        : query(collection(db, 'guides'), where('verificationStatus', '==', 'approved'), limit(20));
      
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

/**
 * Hook to fetch multiple gems by IDs.
 */
export function useSavedGems(ids: string[]) {
  const { data, error, isLoading, mutate } = useSWR(
    ids && ids.length > 0 ? `saved-gems/${ids.join(',')}` : null,
    async () => {
      try {
        // Firestore 'in' query is limited to 10-30 items depending on version
        // We'll take the first 30 for the list view
        const targetIds = ids.slice(0, 30);
        const q = query(
          collection(db, 'gems'),
          where('__name__', 'in', targetIds)
        );
        const snap = await getDocs(q);
        return snap.docs.map(d => ({ ...d.data(), id: d.id } as Gem));
      } catch (err) {
        console.error('Error fetching saved gems:', err);
        return [];
      }
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  );

  return {
    gems: data || [],
    error,
    isLoading,
    mutate
  };
}
