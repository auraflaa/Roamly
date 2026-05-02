'use client';

import React from 'react';
import Link from 'next/link';
import { Star, Heart, MapPin, Clock } from 'lucide-react';
import type { Gem } from '@/lib/types';

interface GemCardProps {
  gem: Gem;
  onSave?: (id: string) => void;
  isSaved?: boolean;
}

export default function GemCard({ gem, onSave, isSaved }: GemCardProps) {
  return (
    <Link href={`/gem/${gem.id}`} className="group block">
      <div
        className="rounded-[22px] overflow-hidden card-hover"
        style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
      >
        {/* Image */}
        <div className="relative h-[160px] lg:h-[220px] overflow-hidden">
          <div
            className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
            style={{
              backgroundImage: gem.photos[0] ? `url(${gem.photos[0]})` : undefined,
              backgroundColor: 'var(--surface)',
            }}
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

          {/* Save button */}
          {onSave && (
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onSave(gem.id); }}
              className="absolute top-3 right-3 p-2 rounded-full glass transition-all hover:scale-110"
            >
              <Heart
                size={16}
                className={isSaved ? 'fill-brand-ember text-brand-ember' : 'text-white'}
              />
            </button>
          )}

          {/* Vibe tags */}
          <div className="absolute bottom-3 left-3 flex gap-1.5">
            {gem.vibes.slice(0, 2).map((vibe) => (
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

        {/* Content */}
        <div className="p-4">
          <h3 className="text-h3 mb-1 line-clamp-1" style={{ color: 'var(--primary-text)' }}>
            {gem.title}
          </h3>

          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center gap-1">
              <Star size={13} className="fill-brand-ember text-brand-ember" />
              <span className="text-caption font-semibold" style={{ color: 'var(--primary-text)' }}>
                {gem.rating.toFixed(1)}
              </span>
              <span className="text-caption" style={{ color: 'var(--secondary-text)' }}>
                ({gem.reviewCount})
              </span>
            </div>
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
            {gem.bestTime && (
              <div className="flex items-center gap-1">
                <Clock size={11} style={{ color: 'var(--secondary-text)' }} />
                <span className="text-caption" style={{ color: 'var(--secondary-text)' }}>
                  {gem.bestTime.timeOfDay}
                </span>
              </div>
            )}
            {gem.price && gem.price > 0 && (
              <span className="text-label text-brand-ember font-semibold">
                ${(gem.price / 100).toFixed(0)}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
