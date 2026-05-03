'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Shield, ChevronLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export default function SafetyPage() {
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
          <Shield size={24} />
        </div>
        <div>
          <h1 className="text-h1" style={{ color: 'var(--primary-text)' }}>Safety & Identity</h1>
          <p className="text-sm text-secondary-text">Manage your account security and verification</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Verification Status */}
        <div className="p-6 rounded-2xl bg-card border border-border">
          <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--primary-text)' }}>Identity Verification</h3>
          <div className="flex items-center gap-3 p-4 rounded-xl bg-black/5 dark:bg-white/5">
            {userData?.identityVerified ? (
              <>
                <CheckCircle2 className="text-green-500" />
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--primary-text)' }}>Identity Verified</p>
                  <p className="text-xs text-secondary-text">Your identity has been confirmed with Roamly Trust.</p>
                </div>
              </>
            ) : (
                <>
                <AlertCircle className="text-brand-ember" />
                <div className="flex-1">
                  <p className="text-sm font-medium" style={{ color: 'var(--primary-text)' }}>Not Verified</p>
                  <p className="text-xs text-secondary-text">Verify your ID to unlock premium guides and bookings.</p>
                </div>
                <button data-coming-soon="Identity verification coming soon" type="button" className="px-4 py-2 rounded-lg bg-brand-ember text-white text-xs font-medium">Verify Now</button>
              </>
            )}
          </div>
        </div>

        {/* Emergency Contacts */}
        <div className="p-6 rounded-2xl bg-card border border-border">
          <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--primary-text)' }}>Emergency Contacts</h3>
          <p className="text-sm text-secondary-text mb-4">We'll notify these contacts in case of an SOS trigger during a trip.</p>
          <button data-coming-soon="Add emergency contact coming soon" type="button" className="w-full py-3 rounded-xl border border-dashed border-border text-sm font-medium text-brand-ember hover:bg-brand-ember/5 transition-colors">
            + Add Contact
          </button>
        </div>
      </div>
    </div>
  );
}
