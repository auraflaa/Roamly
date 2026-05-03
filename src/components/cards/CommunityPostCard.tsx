'use client';

import React from 'react';
import { Heart, MessageCircle, Bookmark, MoreHorizontal } from 'lucide-react';
import type { CommunityPost } from '@/lib/types';
import { getTimeAgo, getInitials } from '@/lib/utils';
import Link from 'next/link';
import OptimizedImage from '@/components/ui/OptimizedImage';
import { useSWRConfig } from 'swr';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface CommunityPostCardProps {
  post: CommunityPost;
  onLike?: () => void;
  isLiked?: boolean;
}

export default function CommunityPostCard({ post, onLike, isLiked }: CommunityPostCardProps) {
  const { mutate } = useSWRConfig();
  const [timeAgo, setTimeAgo] = React.useState<string>('Just now');

  React.useEffect(() => {
    if (post.createdAt) {
      setTimeAgo(getTimeAgo(post.createdAt));
    }
  }, [post.createdAt]);

  const prefetchPost = () => {
    mutate(`community/post/${post.id}`, async () => {
      const docRef = doc(db, 'community_posts', post.id);
      const snap = await getDoc(docRef);
      if (!snap.exists()) return null;
      return { ...snap.data(), id: snap.id };
    }, { revalidate: false });
  };

  return (
    <div
      className="group py-8 border-b border-border last:border-none"
      onMouseEnter={prefetchPost}
    >
      <div className="flex justify-between gap-8">
        <div className="flex-1 min-w-0">
          {/* Author */}
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-full bg-brand-ember flex items-center justify-center text-white text-[10px] font-bold overflow-hidden">
              {post.authorPhoto ? (
                <OptimizedImage
                  src={post.authorPhoto}
                  alt={post.authorName || 'Author'}
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

          {/* Content */}
          <Link href={`/community/post/${post.id}`} className="block group">
            <h2 className="text-2xl font-bold text-primary-text mb-2 leading-tight group-hover:text-brand-ember transition-colors line-clamp-2">
              {post.title}
            </h2>
            <p className="text-secondary-text text-base leading-relaxed line-clamp-3 mb-6 font-serif">
              {post.subtitle || post.description}
            </p>
          </Link>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="px-2.5 py-1 rounded-full bg-elevated/5 border border-border text-[10px] font-bold text-secondary-text uppercase tracking-wider">
                {post.vibeTags?.[0] || 'Discovery'}
              </span>
              <span className="text-xs text-secondary-text">{post.readingTime || '3 min read'}</span>

              <div className="flex items-center gap-4 ml-4">
                {/* Like button — local state drives the visual immediately */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onLike?.();
                  }}
                  className="flex items-center gap-1.5 text-xs"
                  aria-label={isLiked ? 'Unlike post' : 'Like post'}
                >
                  <Heart
                    size={16}
                    className="transition-colors duration-150"
                    style={{
                      color: isLiked ? '#E8601A' : 'var(--secondary-text)',
                      fill: isLiked ? '#E8601A' : 'none',
                    }}
                  />
                  <span
                    className="font-bold transition-colors duration-150"
                    style={{ color: isLiked ? '#E8601A' : 'var(--secondary-text)' }}
                  >
                    {post.likes}
                  </span>
                </button>

                <Link
                  href={`/community/post/${post.id}#comments`}
                  className="flex items-center gap-1.5 text-xs text-secondary-text hover:text-brand-ember transition-colors duration-150"
                >
                  <MessageCircle size={16} />
                  <span className="font-bold">{post.commentCount}</span>
                </Link>
              </div>
            </div>

            <div className="flex items-center gap-3 text-secondary-text">
              <button data-coming-soon="Save/bookmark coming soon" type="button" className="hover:text-brand-ember transition-colors duration-150">
                <Bookmark size={18} />
              </button>
              <button data-coming-soon="More actions coming soon" type="button" className="hover:text-brand-ember transition-colors duration-150">
                <MoreHorizontal size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Thumbnail */}
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
