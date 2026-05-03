'use client';

import React, { useState } from 'react';
import CommunityPostCard from '@/components/cards/CommunityPostCard';
import OptimizedImage from '@/components/ui/OptimizedImage';
import { SkeletonPostCard } from '@/components/ui/Skeleton';
import type { CommunityPost } from '@/lib/types';
import { useAuth } from '@/lib/auth-context';
import { toggleLike } from '@/app/actions/community';
import dynamic from 'next/dynamic';

const CreatePostModal = dynamic(() => import('@/components/modals/CreatePostModal'), {
  ssr: false,
});
import { useCommunityPosts } from '@/lib/hooks/use-community';
import { usePersonalizedFeed, useTopStorytellers } from '@/lib/hooks/use-personalization';
import { Sparkles, TrendingUp, Users, Plus } from 'lucide-react';
import Link from 'next/link';

export default function CommunityPage() {
  const { firebaseUser, userData } = useAuth();
  const { posts, isLoading: loading, mutate } = useCommunityPosts();
  const { storytellers: topStorytellers, isLoading: storytellersLoading } = useTopStorytellers();
  const { rankedPosts, isLoading: rankedLoading } = usePersonalizedFeed(
    firebaseUser?.uid,
    userData?.vibes || [],
    userData?.vibeAffinities || {}
  );

  const [hasMounted, setHasMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'for-you' | 'latest'>('for-you');

  React.useEffect(() => {
    setHasMounted(true);
  }, []);

  // Derived state for trending
  const trendingPosts = React.useMemo(() => {
    return [...posts].sort((a, b) => (b.likes + b.commentCount) - (a.likes + a.commentCount)).slice(0, 3);
  }, [posts]);

  // Derived state for display
  const displayPosts = activeTab === 'for-you' && firebaseUser ? rankedPosts : posts;
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

    await toggleLike(postId, firebaseUser.uid, isLiking);
    mutate();
  };

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-12 flex flex-col lg:flex-row gap-16">
      {/* Main Feed */}
      <div className="flex-1 max-w-[740px]">
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
          <div className="flex items-center gap-8 border-b border-border mb-8 overflow-x-auto">
            <button 
              onClick={() => setActiveTab('for-you')}
              className={`pb-4 text-sm whitespace-nowrap transition-all ${activeTab === 'for-you' ? 'border-b-2 border-primary-text font-bold text-primary-text' : 'text-secondary-text hover:text-primary-text font-medium'}`}
            >
              For you
            </button>
            <button 
              onClick={() => setActiveTab('latest')}
              className={`pb-4 text-sm whitespace-nowrap transition-all ${activeTab === 'latest' ? 'border-b-2 border-primary-text font-bold text-primary-text' : 'text-secondary-text hover:text-primary-text font-medium'}`}
            >
              Latest
            </button>
            <button className="pb-4 text-sm text-secondary-text hover:text-primary-text font-medium whitespace-nowrap">Adventure</button>
            <button className="pb-4 text-sm text-secondary-text hover:text-primary-text font-medium whitespace-nowrap">Local Culture</button>
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

      {/* Sidebar - Recommendations & Trending */}
      <aside className="w-full lg:w-[320px] space-y-12">
        <div className="sticky top-24">
          {/* Dynamic Trending */}
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp size={18} className="text-brand-ember" />
              <h3 className="text-sm font-black uppercase tracking-widest text-primary-text">Trending Discoveries</h3>
            </div>
            <div className="space-y-6">
              {trendingPosts.length > 0 ? trendingPosts.map((post, i) => (
                <Link key={post.id} href={`/community/post/${post.id}`} className="group block">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-5 h-5 rounded-full bg-brand-ember/10 flex items-center justify-center text-[10px] font-bold text-brand-ember">
                        {post.authorName?.[0]}
                    </div>
                    <span className="text-xs font-bold text-primary-text group-hover:underline">{post.authorName}</span>
                  </div>
                  <h4 className="text-sm font-bold text-primary-text group-hover:text-brand-ember transition-colors leading-snug line-clamp-2">
                    {post.title}
                  </h4>
                </Link>
              )) : (
                <p className="text-xs text-secondary-text">Stories warming up...</p>
              )}
            </div>
          </div>

          {/* Dynamic Top Storytellers */}
          <div className="space-y-6">
            <h3 className="text-sm font-black uppercase tracking-widest text-primary-text">Top Storytellers</h3>
            <div className="space-y-4">
              {topStorytellers.length > 0 ? topStorytellers.map((author, i) => (
                <div key={i} className="flex items-center gap-3 group">
                  <div className="w-10 h-10 rounded-full bg-brand-ember/10 flex items-center justify-center text-brand-ember font-bold text-sm group-hover:scale-105 transition-transform overflow-hidden">
                    {author.photo ? (
                      <OptimizedImage 
                        src={author.photo} 
                        alt={author.name} 
                        aspectRatio="square"
                        className="w-full h-full object-cover" 
                      />
                    ) : author.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-primary-text truncate">{author.name}</p>
                    <p className="text-[10px] text-secondary-text truncate">{author.likes} likes · {author.postCount} posts</p>
                  </div>
                  <button className="px-3 py-1 rounded-full border border-border text-[10px] font-bold hover:bg-elevated/10 transition-colors">Follow</button>
                </div>
              )) : (
                <p className="text-xs text-secondary-text">Finding legends...</p>
              )}
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
