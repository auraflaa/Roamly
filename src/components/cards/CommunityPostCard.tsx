'use client';

import React from 'react';
import { Heart, MessageCircle, Bookmark, MoreHorizontal } from 'lucide-react';
import type { CommunityPost } from '@/lib/types';
import { getTimeAgo, getInitials } from '@/lib/utils';
import Link from 'next/link';
import OptimizedImage from '@/components/ui/OptimizedImage';

interface CommunityPostCardProps {
  post: CommunityPost;
  onLike?: () => void;
  isLiked?: boolean;
}

import { useSWRConfig } from 'swr';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function CommunityPostCard({ post, onLike, isLiked }: CommunityPostCardProps) {
  const { mutate } = useSWRConfig();
  const [timeAgo, setTimeAgo] = React.useState<string>('Just now');

  React.useEffect(() => {
    if (post.createdAt?.toDate) {
      setTimeAgo(getTimeAgo(post.createdAt.toDate()));
    }
  }, [post.createdAt]);

  const prefetchPost = () => {
    mutate(`community/post/${post.id}`, async () => {
      const docRef = doc(db, 'community_posts', post.id);
      const snap = await getDoc(docRef);
      if (!snap.exists()) return null;
      // Note: In a real app, we'd ensure this data matches the detail page's expectations
      return { ...snap.data(), id: snap.id };
    }, { revalidate: false });
  };

  return (
    <div 
      className="group py-8 border-b border-border last:border-none animate-fade-in"
      onMouseEnter={prefetchPost}
    >
      <div className="flex justify-between gap-8">
        <div className="flex-1 min-w-0">
          {/* Author info */}
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-full bg-brand-ember flex items-center justify-center text-white text-[10px] font-bold overflow-hidden">
              {post.authorPhoto ? (
                <OptimizedImage 
                  src={post.authorPhoto} 
                  alt={post.authorName} 
                  aspectRatio="square"
                  className="w-full h-full rounded-full object-cover" 
                />
              ) : (
                getInitials(post.authorName || 'T')
              )}
            </div>
            <p className="text-sm font-bold text-primary-text hover:underline cursor-pointer">
              {post.authorName}
            </p>
            <span className="text-secondary-text">·</span>
            <span className="text-xs text-secondary-text">{timeAgo}</span>
          </div>

          {/* Post content */}
          <Link href={`/community/post/${post.id}`} className="block group">
            <h2 className="text-2xl font-bold text-primary-text mb-2 leading-tight group-hover:text-brand-ember transition-colors line-clamp-2">
              {post.title}
            </h2>
            <p className="text-secondary-text text-base leading-relaxed line-clamp-3 mb-6 font-serif">
              {post.subtitle || post.description}
            </p>
          </Link>

          {/* Metadata & Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="px-2.5 py-1 rounded-full bg-elevated/5 border border-border text-[10px] font-bold text-secondary-text uppercase tracking-wider">
                {post.vibeTags?.[0] || 'Discovery'}
              </span>
              <span className="text-xs text-secondary-text">{post.readingTime || '3 min read'}</span>
              
              <div className="flex items-center gap-4 ml-4">
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    onLike?.();
                  }}
                  className={`flex items-center gap-1.5 text-xs transition-all hover:scale-110 ${isLiked ? 'text-brand-ember' : 'text-secondary-text'}`}
                >
                  <Heart size={16} className={isLiked ? 'fill-current' : ''} />
                  <span className="font-bold">{post.likes}</span>
                </button>
                <div className="flex items-center gap-1.5 text-xs text-secondary-text">
                  <MessageCircle size={16} />
                  <span className="font-bold">{post.commentCount}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 text-secondary-text">
              <button className="hover:text-brand-ember transition-colors"><Bookmark size={18} /></button>
              <button className="hover:text-brand-ember transition-colors"><MoreHorizontal size={18} /></button>
            </div>
          </div>
        </div>

        {/* Post Thumbnail */}
        {post.photos && post.photos.length > 0 && (
          <Link href={`/community/post/${post.id}`} className="hidden sm:block shrink-0 w-32 h-32 lg:w-40 lg:h-40 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all">
            <OptimizedImage 
              src={post.photos[0]} 
              alt={post.title} 
              aspectRatio="1/1"
              className="group-hover:scale-105 transition-transform duration-700" 
            />
          </Link>
        )}
      </div>
    </div>
  );
}
