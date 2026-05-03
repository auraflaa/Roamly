'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc, collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/auth-context';
import { useUserActions } from '@/lib/hooks/use-user';
import { ArrowLeft, Heart, MessageCircle, Share2, Sparkles, Loader2, Bookmark, MoreHorizontal } from 'lucide-react';
import { getTimeAgo, getInitials } from '@/lib/utils';
import type { CommunityPost, Comment } from '@/lib/types';
import Link from 'next/link';
import OptimizedImage from '@/components/ui/OptimizedImage';
import { useCommunityPost } from '@/lib/hooks/use-community';

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { firebaseUser } = useAuth();
  const id = params?.id as string;

  const { toggleLike, addComment } = useUserActions();

  const { post, comments, isLoading: loading, mutate } = useCommunityPost(id);
  const [isLiked, setIsLiked] = useState(false);
  const [showComments, setShowComments] = useState(true);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    if (post) {
      setIsLiked(post.likedBy?.includes(firebaseUser?.uid || '') || false);
    }
  }, [post, firebaseUser]);

  // Handle anchor scroll
  useEffect(() => {
    if (!loading && post && typeof window !== 'undefined') {
      const hash = window.location.hash;
      if (hash === '#comments') {
        const timer = setTimeout(() => {
          const element = document.getElementById('comments');
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
        return () => clearTimeout(timer);
      }
    }
  }, [loading, post]);

  const handleLike = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (!firebaseUser || !post) return;
    
    try {
      const newIsLiked = !isLiked;
      setIsLiked(newIsLiked);
      
      // Optimistic UI update
      mutate({
        post: {
          ...post,
          likes: post.likes + (newIsLiked ? 1 : -1),
          likedBy: newIsLiked 
            ? [...(post.likedBy || []), firebaseUser.uid]
            : (post.likedBy || []).filter(uid => uid !== firebaseUser.uid)
        },
        comments
      }, false);

      const result = await toggleLike(post.id, newIsLiked);
      if (!result.success) {
        console.error("Like failed:", result.error);
        // Rollback
        setIsLiked(!newIsLiked);
        mutate();
      }
    } catch (err) {
      console.error("Liking error:", err);
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseUser || !post || !newComment.trim()) return;

    const commentText = newComment.trim();
    setNewComment('');
    
    // Create temporary comment for optimistic update
    const tempComment: Comment = {
      id: 'temp-' + Date.now(),
      postId: post.id,
      authorId: firebaseUser.uid,
      authorName: (firebaseUser.displayName || 'Traveler') as string,
      authorPhoto: firebaseUser.photoURL || undefined,
      text: commentText,
      createdAt: { seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 } as any
    };

    // Optimistic UI update via mutate
    const optimisticData = {
      post: { ...post, commentCount: post.commentCount + 1 },
      comments: [tempComment, ...comments]
    };
    mutate(optimisticData, false);

    const result = await addComment(post.id, commentText);
    
    if (!result.success) {
      console.error("Comment failed:", result.error);
      mutate(); // Rollback
    } else {
      mutate(); // Sync final state
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: post?.title || 'Roamly Story',
      text: post?.subtitle || post?.description || 'Check out this discovery on Roamly!',
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error("Error sharing:", err);
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        window.dispatchEvent(new CustomEvent('roamly:coming-soon', { 
          detail: { message: 'Link copied to clipboard!' } 
        }));
      } catch (err) {
        console.error("Error copying to clipboard:", err);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="animate-spin text-brand-ember" size={32} />
        <p className="text-secondary-text font-medium animate-pulse">Loading story...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-primary-text mb-4">Story not found</h2>
        <Link href="/community" className="text-brand-ember hover:underline font-bold">Back to Community</Link>
      </div>
    );
  }

  return (
    <div className="bg-bg min-h-screen">
      {/* Post Navigation */}
      <nav className="sticky top-0 z-50 bg-bg/80 backdrop-blur-md border-b border-border px-4 py-3">
        <div className="max-w-[740px] mx-auto flex items-center justify-between">
          <button onClick={() => router.back()} className="p-2 hover:bg-elevated/20 rounded-full transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-brand-ember" />
            <span className="text-xs font-bold uppercase tracking-widest text-brand-ember">Discovery Story</span>
          </div>
          <button data-coming-soon="Story actions coming soon" type="button" className="p-2 hover:bg-elevated/20 rounded-full transition-colors">
            <MoreHorizontal size={20} />
          </button>
        </div>
      </nav>

      <article className="max-w-[740px] mx-auto px-4 py-12">
        {/* Post Header */}
        <header className="mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold text-primary-text mb-4 leading-tight">
            {post.title}
          </h1>
          {post.subtitle && (
            <p className="text-xl lg:text-2xl text-secondary-text mb-8 leading-relaxed font-medium">
              {post.subtitle}
            </p>
          )}

          {/* Author info */}
          <div className="flex items-center justify-between py-6 border-y border-border">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-brand-ember flex items-center justify-center text-white font-bold text-lg shadow-inner overflow-hidden">
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
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-bold text-primary-text hover:underline cursor-pointer">
                    {post.authorName}
                  </p>
                  <button data-coming-soon="Follow is coming soon" type="button" className="text-xs font-bold text-brand-ember hover:text-brand-sienna">Follow</button>
                </div>
                <p className="text-xs text-secondary-text">
                  {post.readingTime || '3 min read'} · {getTimeAgo(post.createdAt)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-secondary-text">
              <button data-coming-soon="Save/bookmark coming soon" type="button" className="hover:text-brand-ember transition-colors"><Bookmark size={20} /></button>
              <button onClick={handleShare} type="button" className="hover:text-brand-ember transition-colors"><Share2 size={20} /></button>
            </div>
          </div>
        </header>

        {/* Post Content */}
        {post.photos && post.photos.length > 0 && (
          <div className="mb-12 rounded-[40px] overflow-hidden shadow-2xl">
            <OptimizedImage 
              src={post.photos[0]} 
              alt="Post Cover" 
              aspectRatio="16/9"
              className="w-full object-cover" 
            />
          </div>
        )}

        <div className="prose prose-lg max-w-none text-primary-text leading-relaxed whitespace-pre-wrap text-xl mb-16 font-serif">
          {post.content || post.description}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-12">
          {post.vibeTags?.map(tag => (
            <span key={tag} className="px-4 py-1.5 rounded-full bg-elevated/5 border border-border text-xs font-bold text-secondary-text hover:border-brand-ember/30 cursor-pointer transition-colors">
              {tag}
            </span>
          ))}
        </div>

        {/* Post Footer / Actions */}
        <footer className="py-8 border-t border-border">
          <div className="flex items-center gap-8">
            <button 
              onClick={handleLike}
              className={`flex items-center gap-2 transition-all hover:scale-110 ${isLiked ? 'text-brand-ember' : 'text-secondary-text'}`}
            >
              <Heart size={24} className={isLiked ? 'fill-current' : ''} />
              <span className="font-bold">{post.likes}</span>
            </button>
            <button 
              onClick={() => setShowComments(!showComments)}
              className="flex items-center gap-2 text-secondary-text hover:text-brand-ember transition-all"
            >
              <MessageCircle size={24} />
              <span className="font-bold">{post.commentCount}</span>
            </button>
            <button 
              onClick={handleShare}
              className="flex items-center gap-2 text-secondary-text hover:text-brand-ember transition-all"
            >
              <Share2 size={24} />
            </button>
          </div>
        </footer>

        {/* Comments Section */}
        {showComments && (
          <div id="comments" className="mt-12 animate-in slide-in-from-top duration-500">
            <h3 className="text-xl font-bold text-primary-text mb-8">Responses ({post.commentCount})</h3>
            
            {firebaseUser && (
              <form onSubmit={handleComment} className="mb-12 p-6 rounded-3xl bg-elevated/5 border border-border">
                <textarea 
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="What are your thoughts?"
                  className="w-full bg-transparent border-none outline-none text-primary-text resize-none mb-4"
                  rows={3}
                />
                <div className="flex justify-end">
                  <button 
                    disabled={!newComment.trim()}
                    className="px-6 py-2 rounded-full bg-brand-ember text-white text-sm font-bold hover:bg-brand-sienna transition-all disabled:opacity-50"
                  >
                    Respond
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-8">
              {comments.map(comment => (
                <div key={comment.id} className="group">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-brand-ember flex items-center justify-center text-white text-xs font-bold overflow-hidden">
                      {comment.authorPhoto ? (
                        <OptimizedImage 
                          src={comment.authorPhoto} 
                          alt={comment.authorName} 
                          aspectRatio="square"
                          className="w-full h-full rounded-full object-cover" 
                        />
                      ) : (
                        getInitials(comment.authorName)
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-primary-text">{comment.authorName}</p>
                      <p className="text-[10px] text-secondary-text">{getTimeAgo(comment.createdAt)}</p>
                    </div>
                  </div>
                  <p className="text-secondary-text leading-relaxed pl-11">{comment.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </article>

      {/* Suggested Reading */}
      <section className="bg-elevated/5 py-20 px-4">
        <div className="max-w-[740px] mx-auto">
          <h2 className="text-2xl font-bold text-primary-text mb-8">More from Roamly Community</h2>
          <div className="grid grid-cols-1 gap-12">
            {/* Minimal cards for suggested reading */}
            <div className="group cursor-pointer">
               <p className="text-xs font-bold text-brand-ember uppercase tracking-widest mb-2">Next Story</p>
               <h3 className="text-2xl font-bold text-primary-text group-hover:text-brand-ember transition-colors mb-2">The Secret Waterfalls of Ubud</h3>
               <p className="text-secondary-text line-clamp-2">A guide to the hidden gems that tourists usually miss when visiting the central highlands of Bali...</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
