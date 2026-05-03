'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Smartphone, ChevronLeft, Download, ShieldCheck, Zap, Globe } from 'lucide-react';
import Image from 'next/image';
import { Smartphone as SmartphoneIcon } from 'lucide-react'; // Fallback if logo fails

export default function DownloadPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center px-4 py-12 animate-fade-in">
      <div className="w-full max-w-[768px]">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-secondary-text hover:text-primary-text mb-12 transition-colors group"
        >
          <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span>Back</span>
        </button>

        <div className="flex flex-col items-center text-center space-y-8">
          {/* Logo Section */}
          <div className="relative">
            <div className="w-24 h-24 relative rounded-[22%] overflow-hidden shadow-2xl animate-pulse-subtle border border-white/10">
              <Image 
                src="/assets/logos/09_app_icon_orange.png"
                alt="Roamly App Icon"
                fill
                className="object-cover"
              />
            </div>
            <div className="absolute -top-3 -right-6 bg-brand-ember text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg">
              MOBILE APP
            </div>
          </div>

          <div className="space-y-4 max-w-md">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight" style={{ color: 'var(--primary-text)' }}>
              Roamly in your <span className="text-brand-ember">Pocket</span>
            </h1>
            <p className="text-lg text-secondary-text">
              We're polishing the native experience to bring local insights even closer to you.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full mt-8">
            <div className="p-6 rounded-2xl bg-card border border-border flex flex-col items-center text-center space-y-3">
              <div className="w-10 h-10 rounded-full bg-brand-ember/5 flex items-center justify-center text-brand-ember">
                <Zap size={20} />
              </div>
              <h3 className="font-semibold" style={{ color: 'var(--primary-text)' }}>Real-time SOS</h3>
              <p className="text-xs text-secondary-text">Instant safety alerts and emergency contact sharing during your trip.</p>
            </div>
            
            <div className="p-6 rounded-2xl bg-card border border-border flex flex-col items-center text-center space-y-3">
              <div className="w-10 h-10 rounded-full bg-brand-ember/5 flex items-center justify-center text-brand-ember">
                <Globe size={20} />
              </div>
              <h3 className="font-semibold" style={{ color: 'var(--primary-text)' }}>Offline Maps</h3>
              <p className="text-xs text-secondary-text">Access your saved gems and itineraries even without a data connection.</p>
            </div>
          </div>

          {/* App Store Badges Placeholder */}
          <div className="flex gap-4 pt-12 opacity-40 grayscale pointer-events-none">
            <div className="h-10 w-32 bg-primary-text/10 rounded-lg flex items-center justify-center border border-border">
              <span className="text-[10px] font-bold">App Store</span>
            </div>
            <div className="h-10 w-32 bg-primary-text/10 rounded-lg flex items-center justify-center border border-border">
              <span className="text-[10px] font-bold">Google Play</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
