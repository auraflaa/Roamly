'use client';

import { useLayoutEffect } from 'react';

/**
 * A tiny client component that initializes the theme
 * immediately upon mounting to prevent flickering.
 */
export function ThemeInitializer() {
  useLayoutEffect(() => {
    try {
      const theme = localStorage.getItem('roamly-theme') || 'dark';
      document.documentElement.setAttribute('data-theme', theme);
    } catch (e) {}
  }, []);

  return null;
}
