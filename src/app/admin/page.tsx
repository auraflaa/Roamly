'use client';

import React from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { Users, ShieldAlert, Flag, CheckCircle } from 'lucide-react';

export default function AdminDashboard() {
  const { userData } = useAuth();
  const router = useRouter();

  // Basic client-side protection for MVP
  if (!userData || userData.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
        <ShieldAlert size={48} className="text-brand-ember mb-4" />
        <h2 className="text-h2 mb-2" style={{ color: 'var(--primary-text)' }}>Access Denied</h2>
        <p className="text-body mb-6" style={{ color: 'var(--secondary-text)' }}>
          You need administrator privileges to view this page.
        </p>
        <button
          onClick={() => router.push('/')}
          className="px-6 py-3 rounded-full bg-brand-ember text-white font-medium hover:bg-brand-sienna transition-colors"
        >
          Return Home
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-[1280px] mx-auto px-4 lg:px-6 py-6">
      <div className="mb-8">
        <h1 className="text-display mb-2" style={{ color: 'var(--primary-text)' }}>Admin Dashboard</h1>
        <p className="text-body" style={{ color: 'var(--secondary-text)' }}>Manage platform safety, guides, and content</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="p-6 rounded-[22px]" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center mb-4">
            <CheckCircle size={24} className="text-orange-500" />
          </div>
          <h3 className="text-h2 mb-1" style={{ color: 'var(--primary-text)' }}>12</h3>
          <p className="text-sm font-medium" style={{ color: 'var(--secondary-text)' }}>Pending Guide Approvals</p>
        </div>

        <div className="p-6 rounded-[22px]" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center mb-4">
            <Flag size={24} className="text-red-500" />
          </div>
          <h3 className="text-h2 mb-1" style={{ color: 'var(--primary-text)' }}>4</h3>
          <p className="text-sm font-medium" style={{ color: 'var(--secondary-text)' }}>Flagged Posts</p>
        </div>

        <div className="p-6 rounded-[22px]" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4">
            <Users size={24} className="text-blue-500" />
          </div>
          <h3 className="text-h2 mb-1" style={{ color: 'var(--primary-text)' }}>3,492</h3>
          <p className="text-sm font-medium" style={{ color: 'var(--secondary-text)' }}>Total Users</p>
        </div>
      </div>

      <div className="rounded-[22px] p-8 text-center" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        <p className="text-body" style={{ color: 'var(--secondary-text)' }}>
          Detailed admin views (Verification Queue, Moderation, User Management) will be implemented in the next phase.
        </p>
      </div>
    </div>
  );
}
