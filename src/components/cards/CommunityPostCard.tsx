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
  const timeAgo = post.createdAt?.toDate ? getTimeAgo(post.createdAt.toDate()) : '';

  return (
    <div
      className="rounded-[16px] overflow-hidden animate-fade-in"
      style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
    >
      {/* Author */}
      <div className="flex items-center gap-3 p-4 pb-2">
        <div className="w-9 h-9 rounded-full bg-brand-ember flex items-center justify-center text-white text-xs font-bold">
          {post.authorName?.[0]?.toUpperCase() || 'U'}
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium" style={{ color: 'var(--primary-text)' }}>
            {post.authorName || 'Anonymous'}
          </p>
          <p className="text-caption" style={{ color: 'var(--secondary-text)' }}>{timeAgo}</p>
        </div>
      </div>

      {/* Photos */}
      {post.photos.length > 0 && (
        <div className="px-4 pb-2">
          <div className={`grid gap-1 rounded-xl overflow-hidden ${post.photos.length > 1 ? 'grid-cols-2' : ''}`}>
            {post.photos.slice(0, 4).map((photo, i) => (
              <div
                key={i}
                className="aspect-[4/3] bg-cover bg-center"
                style={{ backgroundImage: `url(${photo})`, backgroundColor: 'var(--surface)' }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="px-4 py-2">
        <h4 className="text-h3 mb-1" style={{ color: 'var(--primary-text)' }}>{post.title}</h4>
        <p className="text-body line-clamp-3" style={{ color: 'var(--secondary-text)' }}>
          {post.description}
        </p>
        {post.vibeTags.length > 0 && (
          <div className="flex gap-1.5 mt-2 flex-wrap">
            {post.vibeTags.map(tag => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded-full text-[10px] font-medium"
                style={{ background: 'var(--color-brand-ember-15)', color: 'var(--color-brand-ember)' }}
              >
                {tag}
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
