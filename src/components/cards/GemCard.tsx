/**
 * @file GemCard.tsx
 * @description A high-end, image-dominant card component for displaying travel 'gems'.
 * Supports interaction tracking via personalized badges and hover animations.
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { Star, Heart, MapPin, Clock, Sparkles } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import type { Gem } from '@/lib/types';

/**
 * @interface GemCardProps
 * @property {Gem} gem - The complete gem data object.
 * @property {(id: string) => void} [onSave] - Optional callback for saving to wishlist.
 * @property {boolean} [isSaved] - Current saved state for UI rendering.
 * @property {boolean} [personalized] - If true, displays a 'For You' recognition badge.
 */
interface GemCardProps {
  gem: Gem;
  onSave?: (id: string) => void;
  isSaved?: boolean;
  personalized?: boolean;
}

/**
 * GemCard Component
 * Renders a visual preview of a hidden gem with title, rating, price, and vibe tags.
 * 
 * @component
 * @param {GemCardProps} props - Component properties.
 */
import OptimizedImage from '@/components/ui/OptimizedImage';
import { useSWRConfig } from 'swr';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function GemCard({ gem, onSave, isSaved: initialIsSaved, personalized }: GemCardProps) {
  const { mutate } = useSWRConfig();
  const [isSaved, setIsSaved] = React.useState(initialIsSaved);

  React.useEffect(() => {
    setIsSaved(initialIsSaved);
  }, [initialIsSaved]);

  const prefetchData = () => {
    mutate(`gem/${gem.id}`, async () => {
      const docRef = doc(db, 'gems', gem.id);
      const snap = await getDoc(docRef);
      return { ...snap.data(), id: snap.id } as Gem;
    }, { revalidate: false });
  };

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onSave) {
      setIsSaved(!isSaved);
      onSave(gem.id);
    }
  };

  return (
    <Link 
      href={`/gem/${gem.id}`} 
      className="group block"
      onMouseEnter={prefetchData}
    >
      <div
        className="rounded-[22px] overflow-hidden card-hover"
        style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
      >
        {/* Image Section */}
        <div className="relative overflow-hidden">
          <OptimizedImage 
            src={gem.photos[0]} 
            alt={gem.title}
            aspectRatio="16/10"
            className="group-hover:scale-105 transition-transform duration-700"
          />
          {/* Gradient overlay for text legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

          {/* Personalized Badge: Behavioral Recognition */}
          {personalized && (
            <div className="absolute top-3 left-3 px-2 py-1 rounded-md bg-brand-ember text-[9px] font-black text-white uppercase tracking-tighter shadow-lg flex items-center gap-1">
              <Sparkles size={10} className="fill-white" /> For You
            </div>
          )}

          {/* Quick Save Action */}
          {onSave && (
            <button
              onClick={handleSave}
              className="absolute top-3 right-3 p-2 rounded-full glass transition-all hover:scale-110 active:scale-95 z-10"
            >
              <Heart
                size={16}
                className={isSaved ? 'fill-brand-ember text-brand-ember' : 'text-white'}
              />
            </button>
          )}

          {/* Vibe Tags: Categorical preview */}
          <div className="absolute bottom-3 left-3 flex gap-1.5">
            {Array.from(new Set(gem.vibes)).slice(0, 2).map((vibe) => (
              <span
                key={vibe}
                className="px-2.5 py-1 rounded-full text-[10px] font-medium backdrop-blur-md"
                style={{
                  background: 'rgba(232, 96, 26, 0.15)',
                  color: '#F5A06A',
                  border: '1px solid rgba(232, 96, 26, 0.25)',
                }}
              >
                {vibe}
              </span>
            ))}
          </div>
        </div>

        {/* Text Content Section */}
        <div className="p-4">
          <h3 className="text-h3 mb-1 line-clamp-1" style={{ color: 'var(--primary-text)' }}>
            {gem.title}
          </h3>

          <div className="flex items-center gap-3 mb-2">
            {/* Rating Summary */}
            <div className="flex items-center gap-1">
              <Star size={13} className="fill-brand-ember text-brand-ember" />
              <span className="text-caption font-semibold" style={{ color: 'var(--primary-text)' }}>
                {gem.rating.toFixed(1)}
              </span>
              <span className="text-caption" style={{ color: 'var(--secondary-text)' }}>
                ({gem.reviewCount})
              </span>
            </div>
            {/* Geographical Context */}
            {gem.location?.address && (
              <div className="flex items-center gap-1">
                <MapPin size={11} style={{ color: 'var(--secondary-text)' }} />
                <span className="text-caption line-clamp-1" style={{ color: 'var(--secondary-text)' }}>
                  {gem.location.address}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            {/* Contextual Cues: Time of Day */}
            {gem.bestTime && (
              <div className="flex items-center gap-1">
                <Clock size={11} style={{ color: 'var(--secondary-text)' }} />
                <span className="text-caption" style={{ color: 'var(--secondary-text)' }}>
                  {gem.bestTime.timeOfDay}
                </span>
              </div>
            )}
            {/* Pricing (Stored in cents/paisa) */}
            {gem.price && gem.price > 0 && (
              <span className="text-label text-brand-ember font-semibold">
                {formatPrice(gem.price)}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
