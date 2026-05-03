'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Loader2, ArrowLeft, Send, Save, Eye } from 'lucide-react';
import { createPost } from '@/app/actions/community';
import { useAuth } from '@/lib/auth-context';
import { VIBES } from '@/lib/types';
import { estimateReadingTime, truncate } from '@/lib/utils';
import ImageUpload from '@/components/ui/ImageUpload';
import OptimizedImage from '@/components/ui/OptimizedImage';

export default function WritePage() {
  const router = useRouter();
  const { firebaseUser, userData } = useAuth();
  const [loading, setLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  
  // Form State
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [selectedVibes, setSelectedVibes] = useState<string[]>([]);

  useEffect(() => {
    if (!firebaseUser && !loading) {
      // Small delay to allow auth to load
      const timer = setTimeout(() => {
        if (!firebaseUser) router.push('/login');
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [firebaseUser]);

  const handleSubmit = async () => {
    if (!firebaseUser) return;
    if (!title || !content) {
      alert('Please add a title and some story content.');
      return;
    }
    
    setLoading(true);
    const result = await createPost({
      authorId: firebaseUser.uid,
      authorName: userData?.displayName || 'Traveler',
      authorPhoto: userData?.photoURL || '',
      photos: imageUrl ? [imageUrl] : [],
      title,
      subtitle,
      description: truncate(content, 160), // Auto-generate excerpt
      content,
      vibeTags: selectedVibes,
      readingTime: estimateReadingTime(content)
    });

    if (result.success) {
      router.push(`/community/post/${result.id}`);
    } else {
      setLoading(false);
      alert('Failed to publish. Please try again.');
    }
  };

  const toggleVibe = (vibe: string) => {
    setSelectedVibes(prev => 
      prev.includes(vibe) ? prev.filter(v => v !== vibe) : [...prev, vibe]
    );
  };

  if (!firebaseUser) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-brand-ember" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg">
      {/* Editor Header */}
      <nav className="sticky top-0 z-50 bg-bg/80 backdrop-blur-md border-b border-border px-4 py-3">
        <div className="max-w-[1000px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="p-2 hover:bg-elevated/20 rounded-full transition-colors">
              <ArrowLeft size={20} />
            </button>
            <div className="h-4 w-px bg-border hidden sm:block" />
            <p className="text-sm font-medium text-secondary-text hidden sm:block">
              Draft in {userData?.displayName || 'Traveler'}'s Journal
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setPreviewMode(!previewMode)}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium hover:bg-elevated/20 transition-all"
            >
              <Eye size={18} />
              {previewMode ? 'Edit' : 'Preview'}
            </button>
            <button 
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2 rounded-full bg-brand-ember text-white text-sm font-bold hover:bg-brand-sienna transition-all shadow-lg shadow-brand-ember/20 disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : <><Send size={18} /> Publish</>}
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-[740px] mx-auto px-4 py-12">
        {previewMode ? (
          <article className="animate-fade-in">
             {imageUrl && (
              <OptimizedImage 
                src={imageUrl} 
                alt="Cover" 
                aspectRatio="video"
                className="w-full rounded-3xl mb-12 shadow-xl" 
              />
            )}
            <h1 className="text-5xl lg:text-6xl font-bold text-primary-text mb-4 leading-tight">{title || 'Untitled Story'}</h1>
            {subtitle && <p className="text-2xl text-secondary-text mb-8 leading-relaxed font-medium">{subtitle}</p>}
            <div className="flex items-center gap-4 mb-12">
              <div className="w-12 h-12 rounded-full bg-brand-ember flex items-center justify-center text-white font-bold text-lg">
                {userData?.displayName?.[0] || 'T'}
              </div>
              <div>
                <p className="font-bold text-primary-text">{userData?.displayName || 'Traveler'}</p>
                <p className="text-xs text-secondary-text">{estimateReadingTime(content)} · Just now</p>
              </div>
            </div>
            <div className="prose prose-lg max-w-none text-primary-text leading-relaxed whitespace-pre-wrap text-xl">
              {content || 'Start writing your story...'}
            </div>
          </article>
        ) : (
          <div className="space-y-12 animate-fade-in">
            {/* Cover Image Upload */}
            <ImageUpload onUploadComplete={setImageUrl} defaultImage={imageUrl} />

            {/* Title Field */}
            <div className="space-y-4">
              <textarea 
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                rows={1}
                className="w-full text-5xl lg:text-6xl font-bold bg-transparent border-none outline-none placeholder:text-border text-primary-text resize-none overflow-hidden"
              />
              <textarea 
                placeholder="Subtitle or short summary..."
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                rows={1}
                className="w-full text-2xl font-medium bg-transparent border-none outline-none placeholder:text-border text-secondary-text resize-none overflow-hidden"
              />
            </div>

            {/* Content Field */}
            <textarea 
              placeholder="Tell your story..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full min-h-[400px] text-xl leading-relaxed bg-transparent border-none outline-none placeholder:text-border text-primary-text resize-none"
            />

            {/* Vibes Section */}
            <div className="pt-12 border-t border-border">
              <p className="text-xs font-bold text-secondary-text uppercase tracking-widest mb-4">Add vibe tags to help discovery</p>
              <div className="flex flex-wrap gap-2">
                {VIBES.map(vibe => (
                  <button
                    key={vibe}
                    onClick={() => toggleVibe(vibe)}
                    className={`px-4 py-2 rounded-full text-sm font-bold transition-all border ${
                      selectedVibes.includes(vibe) 
                        ? 'bg-brand-ember text-white border-brand-ember shadow-md' 
                        : 'bg-elevated/5 border-border text-secondary-text hover:border-brand-ember/30'
                    }`}
                  >
                    {vibe}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
