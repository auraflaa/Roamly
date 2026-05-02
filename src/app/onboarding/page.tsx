'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/auth-context';
import { VIBES } from '@/lib/types';
import { Sparkles, Check, ArrowRight } from 'lucide-react';

const vibeEmojis: Record<string, string> = {
  Adventure: '🏔️',
  Culture: '🏛️',
  Food: '🍜',
  Nature: '🌿',
  Relaxation: '🧘',
  Art: '🎨',
  Architecture: '🏰',
  Spiritual: '🕊️',
};

export default function OnboardingPage() {
  const router = useRouter();
  const { userData, refreshUserData } = useAuth();
  const [selectedVibes, setSelectedVibes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const toggleVibe = (vibe: string) => {
    setSelectedVibes(prev =>
      prev.includes(vibe)
        ? prev.filter(v => v !== vibe)
        : prev.length < 3
          ? [...prev, vibe]
          : prev
    );
  };

  const handleContinue = async () => {
    if (!userData || selectedVibes.length === 0) return;
    setLoading(true);
    try {
      await updateDoc(doc(db, 'users', userData.uid), { vibes: selectedVibes });
      await refreshUserData();
      router.push('/explore');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{ background: 'var(--bg)' }}>
      <div className="fixed inset-0" style={{
        background: 'radial-gradient(ellipse at 30% 20%, rgba(232, 96, 26, 0.08) 0%, transparent 50%)',
      }} />

      <div className="relative w-full max-w-lg animate-slide-up">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4" style={{
            background: 'var(--color-brand-ember-15)',
            border: '1px solid var(--color-brand-ember-30)',
          }}>
            <Sparkles size={14} className="text-brand-ember" />
            <span className="text-caption text-brand-ember">Step 1 of 1</span>
          </div>
          <h1 className="text-display mb-3" style={{ color: 'var(--primary-text)' }}>
            What's your travel vibe?
          </h1>
          <p className="text-body-lg" style={{ color: 'var(--secondary-text)' }}>
            Pick 1-3 vibes. We'll use them to show you the most relevant gems.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-8">
          {VIBES.map(vibe => {
            const isSelected = selectedVibes.includes(vibe);
            return (
              <button
                key={vibe}
                onClick={() => toggleVibe(vibe)}
                className="relative p-5 rounded-[16px] text-left transition-all duration-200 hover:scale-[1.02]"
                style={{
                  background: isSelected ? 'var(--color-brand-ember-15)' : 'var(--card)',
                  border: `2px solid ${isSelected ? 'var(--color-brand-ember)' : 'var(--border)'}`,
                }}
              >
                {isSelected && (
                  <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-brand-ember flex items-center justify-center">
                    <Check size={12} className="text-white" />
                  </div>
                )}
                <span className="text-2xl block mb-2">{vibeEmojis[vibe]}</span>
                <span className="text-sm font-medium" style={{
                  color: isSelected ? 'var(--color-brand-ember)' : 'var(--primary-text)',
                }}>{vibe}</span>
              </button>
            );
          })}
        </div>

        <button
          onClick={handleContinue}
          disabled={loading || selectedVibes.length === 0}
          className="w-full h-[52px] rounded-full bg-brand-ember text-white font-medium flex items-center justify-center gap-2 transition-all hover:bg-brand-sienna disabled:opacity-40 hover:scale-[1.02]"
        >
          {loading ? 'Saving...' : 'Continue'} <ArrowRight size={18} />
        </button>

        <button
          onClick={() => router.push('/explore')}
          className="w-full mt-3 text-sm font-medium py-3 transition-colors hover:text-brand-ember"
          style={{ color: 'var(--secondary-text)' }}
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}
