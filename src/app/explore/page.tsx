'use client';

import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import GemCard from '@/components/cards/GemCard';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { VIBES, type Gem } from '@/lib/types';
import { SEED_GEMS } from '@/lib/seed';
import { useExploreStore } from '@/lib/store';
import { useAuth } from '@/lib/auth-context';
import { Sparkles } from 'lucide-react';

import { useGems } from '@/lib/hooks/use-gems';

export default function ExplorePage() {
  const { gems, isLoading: loading } = useGems({ limit: 40 });
  const [showFilters, setShowFilters] = useState(false);
  const { filters, setVibeFilter, setModeFilter, setSearchQuery, resetFilters } = useExploreStore();
  const { userData } = useAuth();

  // Filter gems client-side
  const filteredGems = gems.filter(gem => {
    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      if (!gem.title.toLowerCase().includes(q) && !gem.description.toLowerCase().includes(q)) return false;
    }
    if (filters.vibes.length > 0) {
      if (!gem.vibes.some(v => filters.vibes.includes(v))) return false;
    }
    if (filters.minRating > 0 && gem.rating < filters.minRating) return false;
    return true;
  }).sort((a, b) => {
    // PERSONALIZATION LOGIC: Boost gems matching user's top vibes
    if (!userData?.vibeAffinities) return 0;
    
    const scoreA = a.vibes.reduce((acc, v) => acc + (userData.vibeAffinities?.[v]?.score || 0), 0);
    const scoreB = b.vibes.reduce((acc, v) => acc + (userData.vibeAffinities?.[v]?.score || 0), 0);
    
    return scoreB - scoreA;
  });

  const activeFilterCount = filters.vibes.length + (filters.minRating > 0 ? 1 : 0) + (filters.mode ? 1 : 0);

  return (
    <div className="max-w-[1280px] mx-auto px-4 lg:px-6 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-h1 lg:text-display mb-2" style={{ color: 'var(--primary-text)' }}>
          Explore Hidden Gems
        </h1>
        <p className="text-body" style={{ color: 'var(--secondary-text)' }}>
          Discover authentic experiences curated by locals
        </p>
      </div>

      {/* Search & Filters */}
      <div className="flex gap-3 mb-6">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--secondary-text)' }} />
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search gems, places, experiences..."
            className="w-full h-11 pl-11 pr-4 rounded-full text-sm outline-none focus-ring"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--primary-text)' }}
          />
          {filters.searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2"
              style={{ color: 'var(--secondary-text)' }}
            >
              <X size={14} />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="h-11 px-4 rounded-full flex items-center gap-2 text-sm font-medium transition-all hover:scale-105"
          style={{
            background: activeFilterCount > 0 ? 'var(--color-brand-ember-15)' : 'var(--surface)',
            border: `1px solid ${activeFilterCount > 0 ? 'var(--color-brand-ember)' : 'var(--border)'}`,
            color: activeFilterCount > 0 ? 'var(--color-brand-ember)' : 'var(--primary-text)',
          }}
        >
          <SlidersHorizontal size={16} />
          <span className="hidden sm:inline">Filters</span>
          {activeFilterCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-brand-ember text-white text-[10px] flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div
          className="mb-6 p-5 rounded-[16px] animate-slide-down"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-h3" style={{ color: 'var(--primary-text)' }}>Filters</h3>
            <button onClick={resetFilters} className="text-caption text-brand-ember hover:text-brand-sienna transition-colors">
              Reset All
            </button>
          </div>

          {/* Vibes */}
          <div className="mb-4">
            <p className="text-label mb-2" style={{ color: 'var(--secondary-text)' }}>Vibes</p>
            <div className="flex flex-wrap gap-2">
              {VIBES.map(vibe => {
                const isActive = filters.vibes.includes(vibe);
                return (
                  <button
                    key={vibe}
                    onClick={() => setVibeFilter(
                      isActive ? filters.vibes.filter(v => v !== vibe) : [...filters.vibes, vibe]
                    )}
                    className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                    style={{
                      background: isActive ? 'var(--color-brand-ember-15)' : 'var(--surface)',
                      border: `1px solid ${isActive ? 'var(--color-brand-ember)' : 'var(--border)'}`,
                      color: isActive ? 'var(--color-brand-ember)' : 'var(--primary-text)',
                    }}
                  >
                    {vibe}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mode */}
          <div className="mb-4">
            <p className="text-label mb-2" style={{ color: 'var(--secondary-text)' }}>Mode</p>
            <div className="flex gap-2">
              {['self', 'online', 'in-person'].map(mode => {
                const isActive = filters.mode === mode;
                const colors: Record<string, { bg: string; color: string }> = {
                  self: { bg: 'var(--mode-self-bg)', color: 'var(--mode-self-text)' },
                  online: { bg: 'var(--mode-online-bg)', color: 'var(--mode-online-text)' },
                  'in-person': { bg: 'var(--mode-inperson-bg)', color: 'var(--mode-inperson-text)' },
                };
                return (
                  <button
                    key={mode}
                    onClick={() => setModeFilter(isActive ? null : mode)}
                    className="px-3 py-1.5 rounded-full text-xs font-medium transition-all capitalize"
                    style={{
                      background: isActive ? colors[mode].bg : 'var(--surface)',
                      color: isActive ? colors[mode].color : 'var(--primary-text)',
                      border: `1px solid ${isActive ? 'transparent' : 'var(--border)'}`,
                    }}
                  >
                    {mode}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Rating */}
          <div>
            <p className="text-label mb-2" style={{ color: 'var(--secondary-text)' }}>Min Rating</p>
            <div className="flex gap-2">
              {[0, 3, 3.5, 4, 4.5].map(rating => (
                <button
                  key={rating}
                  onClick={() => useExploreStore.getState().setMinRating(rating)}
                  className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                  style={{
                    background: filters.minRating === rating ? 'var(--color-brand-ember-15)' : 'var(--surface)',
                    border: `1px solid ${filters.minRating === rating ? 'var(--color-brand-ember)' : 'var(--border)'}`,
                    color: filters.minRating === rating ? 'var(--color-brand-ember)' : 'var(--primary-text)',
                  }}
                >
                  {rating === 0 ? 'Any' : `${rating}+`}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filteredGems.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-h2 mb-2" style={{ color: 'var(--primary-text)' }}>No gems found</p>
          <p className="text-body" style={{ color: 'var(--secondary-text)' }}>Try adjusting your filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
          {filteredGems.map(gem => {
            const isPersonalized = userData?.vibeAffinities && gem.vibes.some(v => (userData.vibeAffinities?.[v]?.score || 0) > 5);
            return <GemCard key={gem.id} gem={gem} personalized={isPersonalized} />;
          })}
        </div>
      )}
    </div>
  );
}
