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

      <img
        src={src}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        className={`w-full h-full object-cover transition-all duration-700 ease-out ${
          isLoaded ? 'opacity-100 scale-100 blur-0' : 'opacity-0 scale-105 blur-lg'
        }`}
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
      />

      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-elevated/5 text-secondary-text text-[10px] font-bold uppercase tracking-widest">
          Failed to load image
        </div>
      )}
    </div>
  );
}
