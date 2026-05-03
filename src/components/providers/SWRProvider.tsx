'use client';

import React from 'react';
import { SWRConfig } from 'swr';

/**
 * Global SWR Provider with LocalStorage persistence.
 * This makes the app feel "instant" by serving stale data from the cache
 * while revalidating in the background.
 */
export function SWRProvider({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig 
      value={{
        provider: () => {
            // When initializing, we restore the data from `localStorage` into a Map.
            if (typeof window === 'undefined') return new Map();
            
            const map = new Map(JSON.parse(localStorage.getItem('app-cache') || '[]'));

            // Before unloading the app, we write back all the data into `localStorage`.
            window.addEventListener('beforeunload', () => {
                const appCache = JSON.stringify(Array.from(map.entries()));
                localStorage.setItem('app-cache', appCache);
            });

            // We still use the map for write & read for performance.
            return map as any;
        },
        revalidateOnFocus: false,
        revalidateIfStale: true,
        dedupingInterval: 5000,
      }}
    >
      {children}
    </SWRConfig>
  );
}
