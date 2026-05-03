'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  aspectRatio?: string;
  priority?: boolean;
}

/**
 * A premium image component that handles smooth loading,
 * blur-up transitions, and error states.
 */
export default function OptimizedImage({ src, alt, className = '', aspectRatio = '16/9', priority = false }: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  return (
    <div 
      className={`relative overflow-hidden bg-elevated/5 ${className}`}
      style={{ aspectRatio }}
    >
      {/* Skeleton / Blur placeholder */}
      <AnimatePresence>
        {!isLoaded && !hasError && (
          <motion.div 
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-elevated/10 animate-shimmer z-10"
          />
        )}
      </AnimatePresence>

      {hasError ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-elevated/10 text-secondary-text p-4 text-center">
          <div className="w-8 h-8 rounded-full bg-brand-ember/10 flex items-center justify-center mb-2">
            <span className="text-[10px] font-bold text-brand-ember">!</span>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">Visual Unavailable</span>
        </div>
      ) : (
        <img
          src={src || 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&q=80&w=1000'}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          className={`w-full h-full object-cover transition-all duration-700 ease-out ${
            isLoaded ? 'opacity-100 scale-100 blur-0' : 'opacity-0 scale-105 blur-lg'
          }`}
          onLoad={() => setIsLoaded(true)}
          onError={(e) => {
            console.warn(`Image load failed: ${src}. Using fallback.`);
            setHasError(false); // Don't show error state, just use fallback src
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&q=80&w=1000';
          }}
        />
      )}
    </div>
  );
}
