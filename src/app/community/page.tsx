'use client';

import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import CommunityPostCard from '@/components/cards/CommunityPostCard';
import { SkeletonPostCard } from '@/components/ui/Skeleton';
import type { CommunityPost } from '@/lib/types';
import { useAuth } from '@/lib/auth-context';
import { toggleLike } from '@/app/actions/community';
import CreatePostModal from '@/components/modals/CreatePostModal';

export default function CommunityPage() {
  const { firebaseUser } = useAuth();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'community_posts'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      setPosts(snap.docs.map(d => ({ ...d.data(), id: d.id } as CommunityPost)));
    } catch (err) {
      console.error('Error loading posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId: string) => {
    if (!firebaseUser) return;
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    const isLiking = !post.likedBy?.includes(firebaseUser.uid);
    
    // Optimistic UI update
    setPosts(prev => prev.map(p => {
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
    }));

    await toggleLike(postId, firebaseUser.uid, isLiking);
  };

  return (
    <div className="max-w-[768px] mx-auto px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-h1 lg:text-display mb-1" style={{ color: 'var(--primary-text)' }}>
            Community
          </h1>
          <p className="text-body" style={{ color: 'var(--secondary-text)' }}>
            See what other travelers are discovering
          </p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="hidden sm:block px-4 py-2 rounded-full bg-brand-ember text-white text-sm font-medium hover:bg-brand-sienna transition-colors"
        >
          Create Post
        </button>
      </div>

      <div className="sm:hidden mb-6">
        <button 
          onClick={() => setIsModalOpen(true)}
          className="w-full py-3 rounded-full bg-brand-ember text-white text-sm font-medium hover:bg-brand-sienna transition-colors"
        >
          Create Post
        </button>
      </div>

      <div className="space-y-6 stagger-children">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => <SkeletonPostCard key={i} />)
        ) : posts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-h2 mb-2" style={{ color: 'var(--primary-text)' }}>No posts yet</p>
            <p className="text-body" style={{ color: 'var(--secondary-text)' }}>Be the first to share a discovery!</p>
          </div>
        ) : (
          posts.map(post => (
            <CommunityPostCard 
              key={post.id} 
              post={post} 
              onLike={() => handleLike(post.id)}
              isLiked={firebaseUser ? post.likedBy?.includes(firebaseUser.uid) : false}
            />
          ))
        )}
      </div>

      <CreatePostModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={loadPosts}
      />
    </div>
  );
}
