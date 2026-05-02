'use client';

import React from 'react';

export function SkeletonCard() {
  return (
    <div
      className="rounded-[22px] overflow-hidden"
      style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
    >
      <div className="h-[160px] lg:h-[220px] animate-shimmer" />
      <div className="p-4 space-y-3">
        <div className="h-4 w-3/4 rounded-full animate-shimmer" />
        <div className="h-3 w-1/2 rounded-full animate-shimmer" />
        <div className="h-3 w-1/3 rounded-full animate-shimmer" />
      </div>
    </div>
  );
}

export function SkeletonGuideCard() {
  return (
    <div
      className="flex items-center gap-4 p-4 rounded-[16px]"
      style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
    >
      <div className="w-12 h-12 rounded-full animate-shimmer flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-1/2 rounded-full animate-shimmer" />
        <div className="h-3 w-1/3 rounded-full animate-shimmer" />
        <div className="flex gap-1.5">
          <div className="h-5 w-12 rounded-full animate-shimmer" />
          <div className="h-5 w-14 rounded-full animate-shimmer" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonPostCard() {
  return (
    <div
      className="rounded-[16px] overflow-hidden"
      style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
    >
      <div className="flex items-center gap-3 p-4">
        <div className="w-9 h-9 rounded-full animate-shimmer" />
        <div className="space-y-1.5 flex-1">
          <div className="h-3 w-24 rounded-full animate-shimmer" />
          <div className="h-2 w-16 rounded-full animate-shimmer" />
        </div>
      </div>
      <div className="h-48 mx-4 rounded-xl animate-shimmer" />
      <div className="p-4 space-y-2">
        <div className="h-4 w-2/3 rounded-full animate-shimmer" />
        <div className="h-3 w-full rounded-full animate-shimmer" />
      </div>
    </div>
  );
}
