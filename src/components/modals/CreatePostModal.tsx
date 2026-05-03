'use client';

import React, { useState } from 'react';
import { X, Sparkles, Loader2 } from 'lucide-react';
import { createPost } from '@/app/actions/community';
import { useAuth } from '@/lib/auth-context';
import { VIBES } from '@/lib/types';
import ImageUpload from '@/components/ui/ImageUpload';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreatePostModal({ isOpen, onClose, onSuccess }: CreatePostModalProps) {
  const { firebaseUser, userData } = useAuth();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedVibes, setSelectedVibes] = useState<string[]>([]);
  const [imageUrl, setImageUrl] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseUser) return;
    
    setLoading(true);
    const result = await createPost({
      authorId: firebaseUser.uid,
      authorName: userData?.displayName || 'Traveler',
      authorPhoto: userData?.photoURL || '',
      photos: imageUrl ? [imageUrl] : [],
      title,
      description,
      vibeTags: selectedVibes
    });

    setLoading(false);
    if (result.success) {
      onSuccess();
      onClose();
      // Reset form
      setTitle('');
      setDescription('');
      setSelectedVibes([]);
      setImageUrl('');
    } else {
      alert('Failed to create post. Please try again.');
    }
  };

  const toggleVibe = (vibe: string) => {
    setSelectedVibes(prev => 
      prev.includes(vibe) ? prev.filter(v => v !== vibe) : [...prev, vibe]
    );
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-[var(--overlay-bg)] backdrop-blur-md animate-fade-in"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-[500px] bg-card rounded-[32px] border border-border shadow-2xl overflow-hidden animate-scale-up">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-brand-ember/10 text-brand-ember">
              <Sparkles size={20} />
            </div>
            <h2 className="text-xl font-bold text-primary-text">Share a Discovery</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-elevated/20 rounded-full transition-colors text-secondary-text"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <ImageUpload
            label="Cover Image"
            onUploadComplete={setImageUrl}
            defaultImage={imageUrl}
          />

          <div className="space-y-2">
            <label className="text-xs font-bold text-secondary-text uppercase tracking-widest px-1">Title</label>
            <input 
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your discovery a name..."
              className="w-full h-12 bg-elevated/10 border border-border rounded-2xl px-4 text-sm text-primary-text focus:border-brand-ember/50 focus:ring-1 focus:ring-brand-ember/50 outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-secondary-text uppercase tracking-widest px-1">Story</label>
            <textarea 
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What makes this place special?"
              className="w-full bg-elevated/10 border border-border rounded-2xl p-4 text-sm text-primary-text focus:border-brand-ember/50 focus:ring-1 focus:ring-brand-ember/50 outline-none transition-all resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-secondary-text uppercase tracking-widest px-1">Vibes</label>
            <div className="flex flex-wrap gap-2">
              {VIBES.map(vibe => (
                <button
                  key={vibe}
                  type="button"
                  onClick={() => toggleVibe(vibe)}
                  className={`px-3 py-1.5 rounded-full text-[10px] font-bold transition-all border ${
                    selectedVibes.includes(vibe) 
                      ? 'bg-brand-ember/20 border-brand-ember text-brand-ember' 
                      : 'bg-elevated/10 border-transparent text-secondary-text hover:bg-elevated/20'
                  }`}
                >
                  {vibe}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-2xl bg-brand-ember hover:bg-brand-sienna text-white font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand-ember/20 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>Post to Community</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
