'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Star, MapPin, Clock, ArrowLeft, Heart, Share2, CheckCircle, Backpack, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import type { Gem, Guide } from '@/lib/types';
import { SEED_GEMS, SEED_GUIDES } from '@/lib/seed';

export default function GemDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [gem, setGem] = useState<Gem | null>(null);
  const [guides, setGuides] = useState<(Guide & { displayName?: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPhoto, setCurrentPhoto] = useState(0);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    loadGem();
  }, [params.id]);

  const loadGem = async () => {
    setLoading(true);
    try {
      const gemDoc = await getDoc(doc(db, 'gems', params.id as string));
      if (gemDoc.exists()) {
        setGem({ ...gemDoc.data(), id: gemDoc.id } as Gem);
      } else {
        const seedGem = SEED_GEMS.find(g => g.id === params.id);
        if (seedGem) setGem(seedGem as unknown as Gem);
      }
      // Load guides
      setGuides(SEED_GUIDES as unknown as (Guide & { displayName?: string })[]);
    } catch (err) {
      const seedGem = SEED_GEMS.find(g => g.id === params.id);
      if (seedGem) setGem(seedGem as unknown as Gem);
      setGuides(SEED_GUIDES as unknown as (Guide & { displayName?: string })[]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-[1280px] mx-auto px-4 py-6">
        <div className="h-[300px] lg:h-[450px] rounded-[22px] animate-shimmer mb-6" />
        <div className="space-y-4">
          <div className="h-8 w-2/3 rounded-full animate-shimmer" />
          <div className="h-4 w-1/2 rounded-full animate-shimmer" />
          <div className="h-32 rounded-xl animate-shimmer" />
        </div>
      </div>
    );
  }

  if (!gem) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-h2 mb-2" style={{ color: 'var(--primary-text)' }}>Gem not found</p>
          <Link href="/explore" className="text-brand-ember hover:text-brand-sienna">Back to Explore</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1280px] mx-auto animate-fade-in">
      {/* Photo Carousel */}
      <div className="relative h-[300px] sm:h-[400px] lg:h-[450px] lg:mx-6 lg:mt-6 lg:rounded-[22px] overflow-hidden">
        <div
          className="w-full h-full bg-cover bg-center transition-all duration-500"
          style={{ backgroundImage: `url(${gem.photos[currentPhoto]})`, backgroundColor: 'var(--surface)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

        {/* Top bar */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-full glass transition-all hover:scale-110"
          >
            <ArrowLeft size={20} className="text-white" />
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => setIsSaved(!isSaved)}
              className="p-2 rounded-full glass transition-all hover:scale-110"
            >
              <Heart size={20} className={isSaved ? 'fill-brand-ember text-brand-ember' : 'text-white'} />
            </button>
            <button className="p-2 rounded-full glass transition-all hover:scale-110">
              <Share2 size={20} className="text-white" />
            </button>
          </div>
        </div>

        {/* Photo nav */}
        {gem.photos.length > 1 && (
          <>
            <button
              onClick={() => setCurrentPhoto(p => (p - 1 + gem.photos.length) % gem.photos.length)}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full glass transition-all hover:scale-110"
            >
              <ChevronLeft size={20} className="text-white" />
            </button>
            <button
              onClick={() => setCurrentPhoto(p => (p + 1) % gem.photos.length)}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full glass transition-all hover:scale-110"
            >
              <ChevronRight size={20} className="text-white" />
            </button>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
              {gem.photos.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPhoto(i)}
                  className="w-2 h-2 rounded-full transition-all"
                  style={{ background: i === currentPhoto ? '#fff' : 'rgba(255,255,255,0.4)' }}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Content */}
      <div className="px-4 lg:px-6 py-6 lg:grid lg:grid-cols-3 lg:gap-8">
        <div className="lg:col-span-2">
          {/* Vibes */}
          <div className="flex gap-2 mb-3">
            {gem.vibes.map(vibe => (
              <span key={vibe} className="px-3 py-1 rounded-full text-xs font-medium" style={{
                background: 'var(--color-brand-ember-15)',
                color: 'var(--color-brand-ember)',
                border: '1px solid var(--color-brand-ember-30)',
              }}>
                {vibe}
              </span>
            ))}
            {!gem.isCommunityGem && (
              <span className="px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1" style={{
                background: 'var(--success-bg)', color: 'var(--success-text)',
              }}>
                <CheckCircle size={10} /> Verified Guide
              </span>
            )}
          </div>

          <h1 className="text-display mb-2" style={{ color: 'var(--primary-text)' }}>{gem.title}</h1>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-1">
              <Star size={16} className="fill-brand-ember text-brand-ember" />
              <span className="text-sm font-semibold" style={{ color: 'var(--primary-text)' }}>{gem.rating}</span>
              <span className="text-sm" style={{ color: 'var(--secondary-text)' }}>({gem.reviewCount} reviews)</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin size={14} style={{ color: 'var(--secondary-text)' }} />
              <span className="text-sm" style={{ color: 'var(--secondary-text)' }}>{gem.location.address}</span>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-h2 mb-3" style={{ color: 'var(--primary-text)' }}>About this gem</h2>
            <p className="text-body-lg leading-relaxed" style={{ color: 'var(--secondary-text)' }}>
              {gem.description}
            </p>
          </div>

          {/* Details cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {gem.bestTime && (
              <div className="p-4 rounded-[16px]" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <Clock size={16} className="text-brand-ember" />
                  <span className="text-label" style={{ color: 'var(--secondary-text)' }}>Best Time</span>
                </div>
                <p className="text-sm font-medium" style={{ color: 'var(--primary-text)' }}>
                  {gem.bestTime.timeOfDay} · {gem.bestTime.season}
                </p>
              </div>
            )}
            {gem.whatToBring && gem.whatToBring.length > 0 && (
              <div className="p-4 rounded-[16px]" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <Backpack size={16} className="text-brand-ember" />
                  <span className="text-label" style={{ color: 'var(--secondary-text)' }}>What to Bring</span>
                </div>
                <p className="text-sm" style={{ color: 'var(--primary-text)' }}>{gem.whatToBring.join(', ')}</p>
              </div>
            )}
            <div className="p-4 rounded-[16px]" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <div className="flex items-center gap-2 mb-2">
                <MapPin size={16} className="text-brand-ember" />
                <span className="text-label" style={{ color: 'var(--secondary-text)' }}>Nearest Landmark</span>
              </div>
              <p className="text-sm font-medium" style={{ color: 'var(--primary-text)' }}>
                {gem.location.nearestLandmark}
              </p>
            </div>
          </div>
        </div>

        {/* Sidebar - Available Guides */}
        <div className="lg:col-span-1">
          <div
            className="rounded-[22px] p-5 sticky top-24"
            style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
          >
            {gem.price && gem.price > 0 && (
              <div className="mb-4">
                <span className="text-2xl font-bold text-brand-ember">${(gem.price / 100).toFixed(0)}</span>
                <span className="text-sm ml-1" style={{ color: 'var(--secondary-text)' }}>/ person</span>
              </div>
            )}

            <h3 className="text-h3 mb-4" style={{ color: 'var(--primary-text)' }}>Available Guides</h3>

            <div className="space-y-3">
              {guides.slice(0, 3).map(guide => (
                <Link
                  key={guide.uid}
                  href={`/guide/${guide.uid}`}
                  className="flex items-center gap-3 p-3 rounded-xl transition-all hover:bg-brand-ember-15"
                  style={{ border: '1px solid var(--border)' }}
                >
                  <div className="w-10 h-10 rounded-full bg-brand-ember flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {guide.displayName?.[0] || 'G'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: 'var(--primary-text)' }}>
                      {guide.displayName}
                    </p>
                    <div className="flex items-center gap-1">
                      <Star size={10} className="fill-brand-ember text-brand-ember" />
                      <span className="text-caption" style={{ color: 'var(--secondary-text)' }}>
                        {guide.rating} · {guide.city}
                      </span>
                    </div>
                  </div>
                  {guide.isOnline && <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />}
                </Link>
              ))}
            </div>

            <div className="mt-4 space-y-2">
              <button className="w-full py-3 rounded-full bg-brand-ember text-white font-medium text-sm transition-all hover:bg-brand-sienna hover:scale-[1.02]">
                Book a Guide
              </button>
              <button
                className="w-full py-3 rounded-full text-sm font-medium transition-all hover:scale-[1.02]"
                style={{ border: '2px solid var(--border)', color: 'var(--primary-text)' }}
              >
                Self Explore
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
