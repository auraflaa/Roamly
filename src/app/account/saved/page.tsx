'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Heart, ChevronLeft, MapPin } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useSavedGems } from '@/lib/hooks/use-gems';
import GemCard from '@/components/cards/GemCard';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { useUserActions } from '@/lib/hooks/use-user';

export default function SavedGemsPage() {
  const router = useRouter();
  const { firebaseUser, userData } = useAuth();
  const { gems, isLoading } = useSavedGems(userData?.savedGems || []);
  const { toggleSavedGem } = useUserActions();

  const handleToggleSave = async (id: string) => {
    // Current state is saved because it's in this list
    await toggleSavedGem(id, false);
  };

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
          <Heart size={24} />
        </div>
        <div>
          <h1 className="text-h1" style={{ color: 'var(--primary-text)' }}>Saved Gems</h1>
          <p className="text-sm text-secondary-text">{userData?.savedGems?.length || 0} places you love</p>
        </div>
      </div>

      {!userData?.savedGems || userData.savedGems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center text-secondary-text mb-4">
            <Heart size={32} />
          </div>
          <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--primary-text)' }}>No saved gems yet</h3>
          <p className="text-sm text-secondary-text max-w-xs mb-8">Tap the heart on any discovery to save it for your next adventure.</p>
          <button 
            onClick={() => router.push('/explore')}
            className="px-6 py-3 rounded-full bg-brand-ember text-white font-medium hover:bg-brand-sienna transition-colors"
          >
            Explore Gems
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          ) : (
            gems.map(gem => (
              <GemCard 
                key={gem.id} 
                gem={gem} 
                isSaved={true}
                onSave={() => handleToggleSave(gem.id)}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}
