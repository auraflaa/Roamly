'use client';

import useSWR from 'swr';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

/**
 * Hook to fetch global application settings from the 'settings' collection.
 * Primarily used for marketing copy, hero images, and feature flags.
 */
export function useSettings(docId: string = 'homepage') {
  const { data, error, isLoading } = useSWR(
    `settings/${docId}`,
    async () => {
      const snap = await getDoc(doc(db, 'settings', docId));
      if (snap.exists()) {
        return snap.data();
      }
      return null;
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 3600000, // 1 hour
    }
  );

  return {
    settings: data,
    isLoading,
    error
  };
}
