'use client';

import React from 'react';
import { Heart, MessageCircle, Flag } from 'lucide-react';
import type { CommunityPost } from '@/lib/types';
import { getTimeAgo } from '@/lib/utils';

interface CommunityPostCardProps {
  post: CommunityPost;
  onLike?: (id: string) => void;
  isLiked?: boolean;
}

export default function CommunityPostCard({ post, onLike, isLiked }: CommunityPostCardProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const timeAgo = post.createdAt?.toDate ? getTimeAgo(post.createdAt.toDate()) : '';

  const renderDescription = (text: string) => {
    if (!text) return null;
    const parts = text.split(/(@[\w-]+)/g);
    return parts.map((part, i) => {
      if (part.startsWith('@')) {
        return <span key={i} className="font-bold text-brand-ember cursor-pointer hover:underline">{part}</span>;
      }
      return part;
    });
  };

  const isLong = post.description?.length > 280;
  const displayDescription = isLong && !isExpanded 
    ? post.description.slice(0, 280) + '...' 
    : post.description;

  return (
    <div
      className="rounded-[24px] overflow-hidden animate-fade-in bg-card border border-border shadow-sm hover:shadow-md transition-all"
    >
      {/* Author */}
      <div className="flex items-center gap-3 p-5 pb-3">
        <div className="w-10 h-10 rounded-full bg-brand-ember flex items-center justify-center text-white text-sm font-bold shadow-sm">
          {post.authorName?.[0]?.toUpperCase() || 'U'}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
             <p className="text-sm font-bold text-primary-text">
               {post.authorName || 'Anonymous'}
             </p>
             {post.authorId?.startsWith('guide-') && (
               <span className="px-1.5 py-0.5 rounded-md bg-brand-ember/10 text-[9px] font-black text-brand-ember uppercase tracking-tighter">
                 Guide
               </span>
             )}
          </div>
          <p className="text-caption text-secondary-text">{timeAgo}</p>
        </div>
      </div>

      {/* Photos */}
      {post.photos.length > 0 && (
        <div className="px-5 pb-3">
          <div className={`grid gap-1.5 rounded-2xl overflow-hidden ${post.photos.length > 1 ? 'grid-cols-2' : ''}`}>
            {post.photos.slice(0, 4).map((photo, i) => (
              <div
                key={i}
                className="aspect-[4/3] bg-cover bg-center bg-surface"
                style={{ backgroundImage: `url(${photo})` }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="px-5 py-3">
        <h4 className="text-xl font-bold mb-3 text-primary-text leading-tight">{post.title}</h4>
        <div className="text-body-lg text-secondary-text whitespace-pre-wrap leading-relaxed">
          {renderDescription(displayDescription)}
          {isLong && (
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="ml-2 text-brand-ember font-bold hover:underline"
            >
              {isExpanded ? 'Read less' : 'Read more'}
            </button>
          )}
        </div>
        {post.vibeTags.length > 0 && (
          <div className="flex gap-2 mt-4 flex-wrap">
            {post.vibeTags.map(tag => (
              <span
                key={tag}
                className="px-3 py-1 rounded-full text-[11px] font-bold bg-brand-ember/10 text-brand-ember"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4 px-4 py-3" style={{ borderTop: '1px solid var(--border)' }}>
        <button
          onClick={() => onLike?.(post.id)}
          className="flex items-center gap-1.5 text-sm transition-all hover:scale-105"
          style={{ color: isLiked ? 'var(--color-brand-ember)' : 'var(--secondary-text)' }}
        >
          <Heart size={16} className={isLiked ? 'fill-current' : ''} />
          <span>{post.likes}</span>
        </button>
        <div className="flex items-center gap-1.5 text-sm" style={{ color: 'var(--secondary-text)' }}>
          <MessageCircle size={16} />
          <span>{post.commentCount}</span>
        </div>
      </div>
    </div>
  );
}
