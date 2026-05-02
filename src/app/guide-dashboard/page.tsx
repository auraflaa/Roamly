'use client';

import React from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { Plus, Map, Calendar, DollarSign, Settings } from 'lucide-react';
import Link from 'next/link';

export default function GuideDashboardPage() {
  const { userData } = useAuth();
  const router = useRouter();

  if (!userData || userData.role !== 'guide') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p>You must be an approved guide to view this page.</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1280px] mx-auto px-4 lg:px-6 py-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-h1 lg:text-display mb-1" style={{ color: 'var(--primary-text)' }}>
            Guide Dashboard
          </h1>
          <p className="text-body" style={{ color: 'var(--secondary-text)' }}>
            Welcome back, {userData.displayName}
          </p>
        </div>
        <button className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-brand-ember text-white font-medium text-sm transition-all hover:bg-brand-sienna">
          <Plus size={18} /> Add New Gem
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Earnings', value: '$450.00', icon: DollarSign, color: 'text-green-500', bg: 'bg-green-500/10' },
          { label: 'Upcoming Bookings', value: '3', icon: Calendar, color: 'text-brand-ember', bg: 'bg-brand-ember-15' },
          { label: 'Active Gems', value: '5', icon: Map, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { label: 'Profile Settings', value: 'Manage', icon: Settings, color: 'text-purple-500', bg: 'bg-purple-500/10', link: '/profile' }
        ].map((stat, i) => (
          <div key={i} className="p-5 rounded-[16px]" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg}`}>
                <stat.icon size={24} className={stat.color} />
              </div>
              <div>
                <p className="text-caption mb-0.5" style={{ color: 'var(--secondary-text)' }}>{stat.label}</p>
                {stat.link ? (
                  <Link href={stat.link} className="text-h3 font-semibold text-brand-ember hover:underline">
                    {stat.value}
                  </Link>
                ) : (
                  <p className="text-h2 font-semibold" style={{ color: 'var(--primary-text)' }}>{stat.value}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-[22px] p-6" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <h2 className="text-h2 mb-4" style={{ color: 'var(--primary-text)' }}>Recent Bookings</h2>
            <div className="text-center py-12">
              <p className="text-body" style={{ color: 'var(--secondary-text)' }}>No recent bookings to display.</p>
            </div>
          </div>
        </div>
        
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-[22px] p-6" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <h2 className="text-h2 mb-4" style={{ color: 'var(--primary-text)' }}>Availability</h2>
            <div className="space-y-3">
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day) => (
                <div key={day} className="flex items-center justify-between p-3 rounded-lg" style={{ background: 'var(--surface)' }}>
                  <span className="text-sm font-medium" style={{ color: 'var(--primary-text)' }}>{day}</span>
                  <span className="text-xs" style={{ color: 'var(--secondary-text)' }}>09:00 - 17:00</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
