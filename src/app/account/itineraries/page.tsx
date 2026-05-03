'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, ChevronLeft } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export default function ItinerariesPage() {
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
          <MapPin size={24} />
        </div>
        <div>
          <h1 className="text-h1" style={{ color: 'var(--primary-text)' }}>My Itineraries</h1>
          <p className="text-sm text-secondary-text">{userData?.itineraryCount || 0} journeys planned</p>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center text-secondary-text mb-4">
          <MapPin size={32} />
        </div>
        <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--primary-text)' }}>No itineraries yet</h3>
        <p className="text-sm text-secondary-text max-w-xs mb-8">Start planning your next adventure by adding gems to an itinerary.</p>
        <button 
          onClick={() => router.push('/explore')}
          className="px-6 py-3 rounded-full bg-brand-ember text-white font-medium hover:bg-brand-sienna transition-colors"
        >
          Plan a Trip
        </button>
      </div>
    </div>
  );
}
