'use client';

import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useThemeStore } from '@/lib/store';
import BottomNav from './BottomNav';
import TopNav from './TopNav';

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const { setTheme } = useThemeStore();

  // Initialize theme from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('roamly-theme') as 'light' | 'dark' | null;
    const theme = saved || 'dark';
    setTheme(theme);
  }, [setTheme]);

  const isAuthPage = ['/login', '/signup', '/onboarding', '/guide-registration'].some(p =>
    pathname.startsWith(p)
  );
  const isAdminPage = pathname.startsWith('/admin');
  const isLandingPage = pathname === '/';

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)', color: 'var(--primary-text)' }}>
      {!isAuthPage && <TopNav />}
      <main className={`flex-1 ${!isAuthPage && !isLandingPage ? 'pt-16' : ''} ${!isAuthPage && !isAdminPage ? 'pb-20 lg:pb-0' : ''}`}>
        {children}
      </main>
      {!isAuthPage && !isAdminPage && <BottomNav />}
    </div>
  );
}
