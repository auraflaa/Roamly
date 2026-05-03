'use client';

import React, { useState } from 'react';
import CommunityPostCard from '@/components/cards/CommunityPostCard';
import OptimizedImage from '@/components/ui/OptimizedImage';
import { SkeletonPostCard } from '@/components/ui/Skeleton';
import type { CommunityPost } from '@/lib/types';
import { useAuth } from '@/lib/auth-context';
import { useUserActions } from '@/lib/hooks/use-user';
import dynamic from 'next/dynamic';

const CreatePostModal = dynamic(() => import('@/components/modals/CreatePostModal'), {
  ssr: false,
});
import { useCommunityPosts } from '@/lib/hooks/use-community';
import { usePersonalizedFeed } from '@/lib/hooks/use-personalization';
import { Sparkles, Plus } from 'lucide-react';
import Link from 'next/link';

export default function CommunityPage() {
  const { firebaseUser, userData } = useAuth();
  const { posts, isLoading: loading, mutate } = useCommunityPosts();
  const { toggleLike } = useUserActions();
  
  const notificationsEnabled = userData?.notificationsEnabled ?? true;

  const { rankedPosts, isLoading: rankedLoading } = usePersonalizedFeed(
    (firebaseUser?.uid && notificationsEnabled) ? firebaseUser.uid : undefined,
    userData?.vibes || [],
    userData?.vibeAffinities || {}
  );

  const [hasMounted, setHasMounted] = useState(false);

  const tabs = React.useMemo(() => {
    const baseTabs = [
      { id: 'latest', label: 'Latest' },
      { id: 'Adventure', label: 'Adventure' },
      { id: 'Culture', label: 'Local Culture' }
    ];
    if (notificationsEnabled && firebaseUser) {
      return [{ id: 'for-you', label: 'For you' }, ...baseTabs];
    }
    return baseTabs;
  }, [notificationsEnabled, firebaseUser]);

  const [activeTab, setActiveTab] = useState<string>(notificationsEnabled && firebaseUser ? 'for-you' : 'latest');

  // Switch tab if current tab is hidden
  React.useEffect(() => {
    if (activeTab === 'for-you' && (!notificationsEnabled || !firebaseUser)) {
      setActiveTab('latest');
    }
  }, [notificationsEnabled, firebaseUser, activeTab]);

  React.useEffect(() => {
    setHasMounted(true);
  }, []);

  // Derived state for display
  const displayPosts = React.useMemo(() => {
    if (activeTab === 'for-you' && firebaseUser && notificationsEnabled) return rankedPosts;
    if (activeTab === 'latest') return posts;
    
    // Vibe filtering
    return posts.filter(post => 
      post.vibeTags?.some(tag => tag.toLowerCase() === activeTab.toLowerCase())
    );
  }, [activeTab, posts, rankedPosts, firebaseUser, notificationsEnabled]);

  const isDisplayLoading = loading || (activeTab === 'for-you' && rankedLoading);

  const handleLike = async (postId: string) => {
    if (!firebaseUser) return;
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    const isLiking = !post.likedBy?.includes(firebaseUser.uid);
    
    // Optimistic UI update via SWR mutate
    mutate(
      posts.map(p => {
        if (p.id === postId) {
          return {
            ...p,
            likes: p.likes + (isLiking ? 1 : -1),
            likedBy: isLiking 
              ? [...(p.likedBy || []), firebaseUser.uid] 
              : (p.likedBy || []).filter(id => id !== firebaseUser.uid)
          };
        }
        return p;
      }),
      false
    );

    await toggleLike(postId, isLiking);
    mutate();
  };

  return (
    <div className="max-w-[740px] mx-auto px-4 py-12">
      {/* Main Feed */}
      <div className="w-full">
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-4xl lg:text-5xl font-bold text-primary-text tracking-tight">
              Community Stories
            </h1>
            <Link 
              href="/community/write"
              className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-brand-ember text-white text-sm font-bold hover:bg-brand-sienna transition-all shadow-lg shadow-brand-ember/20"
            >
              <Plus size={18} /> Write
            </Link>
          </div>

          {/* Navigation/Tabs */}
          <div className="flex items-center gap-8 border-b border-border mb-8 overflow-x-auto no-scrollbar">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`pb-4 text-sm whitespace-nowrap transition-all relative ${
                    isActive
                      ? 'font-bold text-primary-text'
                      : 'text-secondary-text hover:text-primary-text font-medium'
                  }`}
                >
                  {tab.label}
                  {isActive && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-text rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          {!hasMounted || isDisplayLoading ? (
            Array.from({ length: 3 }).map((_, i) => <SkeletonPostCard key={i} />)
          ) : displayPosts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-2xl font-bold text-primary-text mb-2">No stories yet</p>
              <p className="text-secondary-text mb-8">Be the first to share a discovery!</p>
              <Link href="/community/write" className="text-brand-ember font-bold hover:underline">Start writing</Link>
            </div>
          ) : (
            displayPosts.map(post => (
              <CommunityPostCard 
                key={post.id} 
                post={post} 
                onLike={() => handleLike(post.id)}
                isLiked={firebaseUser ? post.likedBy?.includes(firebaseUser.uid) : false}
              />
            ))
          )}
        </div>
      </div>

    </div>
  );
}
