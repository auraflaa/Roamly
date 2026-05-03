'use client';

import React from 'react';
import { SWRConfig } from 'swr';

/**
 * Global SWR Provider.
 * This makes the app feel "instant" by serving stale data from the cache
 * while revalidating in the background.
 * Note: LocalStorage persistence disabled to avoid QuotaExceededError with large Base64 images.
 */
export function SWRProvider({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig 
      value={{
        provider: () => new Map(),
        revalidateOnFocus: false,
        revalidateIfStale: true,
        dedupingInterval: 5000,
      }}
    >
      {children}
    </SWRConfig>
  );
}
