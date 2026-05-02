'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Compass, Users, MessageSquare, CalendarCheck, User } from 'lucide-react';

const tabs = [
  { href: '/explore', label: 'Explore', icon: Compass },
  { href: '/guides', label: 'Guides', icon: Users },
  { href: '/community', label: 'Community', icon: MessageSquare },
  { href: '/bookings', label: 'Bookings', icon: CalendarCheck },
  { href: '/profile', label: 'Profile', icon: User },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 lg:hidden safe-bottom"
      style={{
        background: 'var(--surface)',
        borderTop: '1px solid var(--border)',
      }}
    >
      <div className="flex items-center justify-around px-2 py-2">
        {tabs.map(({ href, label, icon: Icon }) => {
          const isActive = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200"
              style={{
                color: isActive ? 'var(--color-brand-ember)' : 'var(--secondary-text)',
              }}
            >
              <Icon
                size={22}
                strokeWidth={isActive ? 2.5 : 1.8}
                className="transition-all duration-200"
                style={isActive ? { filter: 'drop-shadow(0 0 6px rgba(232, 96, 26, 0.4))' } : {}}
              />
              <span className="text-[10px] font-medium tracking-wide">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
