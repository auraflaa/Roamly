'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Settings, ChevronLeft, Moon, Sun, Globe, Bell } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export default function PreferencesPage() {
  const router = useRouter();
  const { userData, updateUserPreferences } = useAuth();

  const notificationsEnabled = userData?.notificationsEnabled ?? true;

  const handleToggleNotifications = async () => {
    await updateUserPreferences({ notificationsEnabled: !notificationsEnabled });
  };

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
          <div className="p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Globe size={20} className="text-brand-ember" />
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--primary-text)' }}>Language</p>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-secondary-text">English (current platform language)</p>
                  <span className="text-[10px] bg-brand-ember/10 text-brand-ember px-1.5 py-0.5 rounded font-bold uppercase">Coming Soon: ES, FR, HI</span>
                </div>
              </div>
            </div>
            <span className="text-sm font-medium text-brand-ember">English</span>
          </div>

          <div className="p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell size={20} className="text-brand-ember" />
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--primary-text)' }}>Notifications</p>
                <p className="text-xs text-secondary-text">In-site alerts and community updates</p>
              </div>
            </div>
            <button 
              onClick={handleToggleNotifications}
              className={`w-10 h-5 rounded-full transition-colors relative ${notificationsEnabled ? 'bg-brand-ember' : 'bg-surface border border-border'}`}
            >
               <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${notificationsEnabled ? 'right-0.5' : 'left-0.5'}`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
