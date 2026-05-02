import React from 'react';
import Link from 'next/link';
import { MapPin, Camera, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)' }}>
      <div className="max-w-[1280px] mx-auto px-4 lg:px-6 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-brand-ember flex items-center justify-center text-white font-bold text-sm">
                R
              </div>
              <span className="text-h3 font-semibold">Roamly</span>
            </Link>
            <p className="text-body mb-4" style={{ color: 'var(--secondary-text)' }}>
              Discover hidden gems through the eyes of locals. Authentic experiences, real connections.
            </p>
            <div className="flex gap-3">
              <a href="#" className="p-2 rounded-full transition-all hover:bg-brand-ember-15" style={{ color: 'var(--secondary-text)' }}>
                <Camera size={18} />
              </a>
              <a href="#" className="p-2 rounded-full transition-all hover:bg-brand-ember-15" style={{ color: 'var(--secondary-text)' }}>
                <Mail size={18} />
              </a>
              <a href="#" className="p-2 rounded-full transition-all hover:bg-brand-ember-15" style={{ color: 'var(--secondary-text)' }}>
                <MapPin size={18} />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-label mb-4" style={{ color: 'var(--secondary-text)' }}>Platform</h3>
            <div className="flex flex-col gap-2">
              <Link href="/explore" className="text-body transition-colors hover:text-brand-ember" style={{ color: 'var(--primary-text)' }}>Explore Gems</Link>
              <Link href="/guides" className="text-body transition-colors hover:text-brand-ember" style={{ color: 'var(--primary-text)' }}>Find Guides</Link>
              <Link href="/community" className="text-body transition-colors hover:text-brand-ember" style={{ color: 'var(--primary-text)' }}>Community</Link>
              <Link href="/signup" className="text-body transition-colors hover:text-brand-ember" style={{ color: 'var(--primary-text)' }}>Become a Guide</Link>
            </div>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-label mb-4" style={{ color: 'var(--secondary-text)' }}>Support</h3>
            <div className="flex flex-col gap-2">
              <a href="#" className="text-body transition-colors hover:text-brand-ember" style={{ color: 'var(--primary-text)' }}>Help Center</a>
              <a href="#" className="text-body transition-colors hover:text-brand-ember" style={{ color: 'var(--primary-text)' }}>Safety Guidelines</a>
              <a href="#" className="text-body transition-colors hover:text-brand-ember" style={{ color: 'var(--primary-text)' }}>Privacy Policy</a>
              <a href="#" className="text-body transition-colors hover:text-brand-ember" style={{ color: 'var(--primary-text)' }}>Terms of Service</a>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6" style={{ borderTop: '1px solid var(--border)' }}>
          <p className="text-caption text-center" style={{ color: 'var(--secondary-text)' }}>
            © {new Date().getFullYear()} Roamly. All rights reserved. Discover the world through local eyes.
          </p>
        </div>
      </div>
    </footer>
  );
}
