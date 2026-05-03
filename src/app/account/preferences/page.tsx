'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Settings, ChevronLeft, Moon, Sun, Globe, Bell } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export default function PreferencesPage() {
  const router = useRouter();
  const { userData } = useAuth();

  return (
    <div className="max-w-[768px] mx-auto px-4 py-6 animate-fade-in">
      <button 
        onClick={() => router.back()}
        className="flex items-center gap-2 text-secondary-text hover:text-primary-text mb-8 transition-colors"
      >
        <ChevronLeft size={20} />
        <span>Back</span>
      </button>

      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-xl bg-brand-ember/10 flex items-center justify-center text-brand-ember">
          <Settings size={24} />
        </div>
        <div>
          <h1 className="text-h1" style={{ color: 'var(--primary-text)' }}>Preferences</h1>
          <p className="text-sm text-secondary-text">Customize your Roamly experience</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="rounded-2xl bg-card border border-border divide-y divide-border">
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Globe size={20} className="text-brand-ember" />
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--primary-text)' }}>Language</p>
                <p className="text-xs text-secondary-text">English (current platform language)</p>
              </div>
            </div>
            <span className="text-sm font-medium text-brand-ember opacity-50">English</span>
          </div>

          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell size={20} className="text-brand-ember" />
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--primary-text)' }}>Notifications</p>
                <p className="text-xs text-secondary-text">In-site alerts and community updates</p>
              </div>
            </div>
            <div className="w-10 h-5 rounded-full bg-brand-ember relative">
               <div className="absolute right-0.5 top-0.5 w-4 h-4 rounded-full bg-white shadow-sm" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
