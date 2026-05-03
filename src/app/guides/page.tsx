'use client';

import React, { useState } from 'react';
import { Search } from 'lucide-react';
import GuideCard from '@/components/cards/GuideCard';
import { SkeletonGuideCard } from '@/components/ui/Skeleton';
import type { Guide } from '@/lib/types';
import { SEED_GUIDES } from '@/lib/seed';

import { useGuides } from '@/lib/hooks/use-gems';
import OptimizedImage from '@/components/ui/OptimizedImage';

export default function GuidesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const { guides, isLoading: loading } = useGuides(); // Fetches all approved guides

  const filtered = guides.filter(g => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      g.displayName?.toLowerCase().includes(q) ||
      g.city.toLowerCase().includes(q) ||
      g.specialties.some(s => s.toLowerCase().includes(q))
    );
  });

  return (
    <div className="max-w-[1280px] mx-auto px-4 lg:px-6 py-6">
      <div className="mb-6">
        <h1 className="text-h1 lg:text-display mb-2" style={{ color: 'var(--primary-text)' }}>
          Local Guides
        </h1>
        <p className="text-body" style={{ color: 'var(--secondary-text)' }}>
          Verified locals ready to share their city with you
        </p>
      </div>

      <div className="relative mb-6">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--secondary-text)' }} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name, city, or specialty..."
          className="w-full h-11 pl-11 pr-4 rounded-full text-sm outline-none focus-ring"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--primary-text)' }}
        />
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonGuideCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-h2 mb-2" style={{ color: 'var(--primary-text)' }}>No guides found</p>
          <p className="text-body" style={{ color: 'var(--secondary-text)' }}>Try a different search</p>
        </div>
      ) : (
        <div className="space-y-4 stagger-children">
          {filtered.map(guide => (
            <GuideCard key={guide.uid} guide={guide} />
          ))}
        </div>
      )}
    </div>
  );
}
