'use client';

import React, { useEffect, useState } from 'react';

export default function ComingSoonRoot() {
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    let hideTimer: number | undefined;

    const show = (message: string) => {
      setMsg(message || 'Feature coming soon');
      if (hideTimer) window.clearTimeout(hideTimer);
      hideTimer = window.setTimeout(() => setMsg(null), 2500);
    };

    const onCustom = (e: Event) => {
      const detail = (e as CustomEvent)?.detail;
      show(detail?.message || 'Feature coming soon');
    };

    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const el = target.closest && (target.closest('[data-coming-soon], .coming-soon') as HTMLElement | null);
      if (el) {
        const message = el.dataset?.comingSoon || 'Feature coming soon';
        e.preventDefault();
        e.stopPropagation();
        show(message);
      }
    };

    window.addEventListener('roamly:coming-soon', onCustom as EventListener);
    document.addEventListener('click', onClick, true);

    return () => {
      window.removeEventListener('roamly:coming-soon', onCustom as EventListener);
      document.removeEventListener('click', onClick, true);
      if (hideTimer) window.clearTimeout(hideTimer);
    };
  }, []);

  if (!msg) return null;

  return (
    <div aria-live="polite" style={{ position: 'fixed', top: 20, right: 20, zIndex: 9999 }}>
      <div className="px-4 py-2 rounded-lg bg-black/85 text-white text-sm shadow-lg">
        {msg}
      </div>
    </div>
  );
}
