'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home, ShieldQuestion } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Uncaught Application Error:', error);
  }, [error]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Animated Icon */}
        <div className="relative mx-auto w-24 h-24">
          <div className="absolute inset-0 bg-brand-ember/20 rounded-[32px] animate-pulse" />
          <div className="relative flex items-center justify-center w-full h-full text-brand-ember">
            <AlertTriangle size={48} strokeWidth={1.5} />
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl font-bold text-primary-text tracking-tight">
            Something went wrong
          </h1>
          <p className="text-secondary-text leading-relaxed">
            We encountered an unexpected error while exploring. Don't worry, your data is safe.
          </p>
          {error.digest && (
            <p className="text-[10px] font-mono text-secondary-text opacity-40">
              Error ID: {error.digest}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <button
            onClick={() => reset()}
            className="flex items-center justify-center gap-2 px-8 py-3 rounded-full bg-brand-ember text-white font-bold hover:bg-brand-sienna transition-all hover:scale-105 shadow-lg shadow-brand-ember/20"
          >
            <RefreshCw size={18} />
            Try Again
          </button>
          
          <Link
            href="/"
            className="flex items-center justify-center gap-2 px-8 py-3 rounded-full bg-elevated/5 border border-border text-primary-text font-bold hover:bg-elevated/10 transition-all"
          >
            <Home size={18} />
            Go Home
          </Link>
        </div>

        <div className="pt-8 border-t border-border/50">
          <div className="flex items-center justify-center gap-2 text-xs text-secondary-text opacity-60">
            <ShieldQuestion size={14} />
            <span>Need help? <Link href="/community" className="underline hover:text-brand-ember">Ask the community</Link></span>
          </div>
        </div>
      </div>
    </div>
  );
}
