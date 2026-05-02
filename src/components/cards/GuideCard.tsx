'use client';

import React from 'react';
import Link from 'next/link';
import { Star, CheckCircle, Globe, MapPin, Users } from 'lucide-react';
import type { Guide } from '@/lib/types';
import { getInitials } from '@/lib/utils';

interface GuideCardProps {
  guide: Guide & { displayName?: string; photoURL?: string };
}

export default function GuideCard({ guide }: GuideCardProps) {
  const name = guide.displayName || 'Local Guide';

  return (
    <Link href={`/guide/${guide.uid}`} className="group block">
      <div
        className="flex items-center gap-4 p-4 rounded-[16px] card-hover"
        style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
      >
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm bg-brand-ember"
            style={guide.verificationStatus === 'approved' ? {
              boxShadow: '0 0 0 2.5px var(--card), 0 0 0 4.5px var(--color-brand-ember)',
            } : {}}
          >
            {guide.photoURL ? (
              <img src={guide.photoURL} alt={name} className="w-full h-full rounded-full object-cover" />
            ) : (
              getInitials(name)
            )}
          </div>
          {guide.verificationStatus === 'approved' && (
            <CheckCircle
              size={16}
              className="absolute -bottom-0.5 -right-0.5 fill-brand-ember text-white"
            />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className="text-h3 truncate" style={{ color: 'var(--primary-text)' }}>{name}</h3>
            {guide.isOnline && (
              <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
            )}
          </div>
          <div className="flex items-center gap-3 mb-1.5">
            <div className="flex items-center gap-1">
              <Star size={12} className="fill-brand-ember text-brand-ember" />
              <span className="text-caption font-semibold" style={{ color: 'var(--primary-text)' }}>
                {guide.rating.toFixed(1)}
              </span>
              <span className="text-caption" style={{ color: 'var(--secondary-text)' }}>
                ({guide.reviewCount})
              </span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin size={11} style={{ color: 'var(--secondary-text)' }} />
              <span className="text-caption" style={{ color: 'var(--secondary-text)' }}>{guide.city}</span>
            </div>
          </div>
          {/* Mode chips */}
          <div className="flex gap-1.5">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium" style={{ background: 'var(--mode-self-bg)', color: 'var(--mode-self-text)' }}>
              Self
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium" style={{ background: 'var(--mode-online-bg)', color: 'var(--mode-online-text)' }}>
              Online
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium" style={{ background: 'var(--mode-inperson-bg)', color: 'var(--mode-inperson-text)' }}>
              In-Person
            </span>
          </div>
        </div>

        {/* Languages */}
        <div className="hidden sm:flex flex-col items-end gap-1 flex-shrink-0">
          <Globe size={14} style={{ color: 'var(--secondary-text)' }} />
          <span className="text-caption" style={{ color: 'var(--secondary-text)' }}>
            {guide.languages.length} lang{guide.languages.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
    </Link>
  );
}
