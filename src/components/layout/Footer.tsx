import React from 'react';
import Link from 'next/link';
import { MapPin, Camera, Mail, Send } from 'lucide-react';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="bg-surface text-primary-text border-t border-border">
      <div className="max-w-[1280px] mx-auto px-4 lg:px-6 py-16 lg:py-24">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand & Story */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-6 group">
              <div className="relative w-9 h-9 rounded-xl overflow-hidden group-hover:scale-105 transition-transform duration-300">
                <Image 
                  src="/logos/non-transparent/07_icon_orange_bg.png" 
                  alt="Roamly Icon" 
                  fill
                  className="object-contain"
                />
              </div>
              <span className="text-xl font-bold tracking-tight">Roamly</span>
            </Link>
            <p className="text-sm leading-relaxed text-secondary-text mb-8 font-light">
              We believe travel is about human connection. Discover the world's most authentic hidden gems through the eyes of local storytellers.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-elevated/10 flex items-center justify-center transition-all hover:bg-brand-ember hover:text-white text-secondary-text">
                <Camera size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-elevated/10 flex items-center justify-center transition-all hover:bg-brand-ember hover:text-white text-secondary-text">
                <Send size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-elevated/10 flex items-center justify-center transition-all hover:bg-brand-ember hover:text-white text-secondary-text">
                <Mail size={18} />
              </a>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="grid grid-cols-2 md:grid-cols-3 md:col-span-3 gap-8">
            <div>
              <h3 className="text-xs font-bold tracking-widest uppercase text-brand-sunrise mb-6">Explore</h3>
              <ul className="space-y-4">
                <li><Link href="/explore" className="text-sm text-secondary-text hover:text-brand-ember transition-colors font-light">All Hidden Gems</Link></li>
                <li><Link href="/guides" className="text-sm text-secondary-text hover:text-brand-ember transition-colors font-light">Verified Guides</Link></li>
                <li><Link href="/community" className="text-sm text-secondary-text hover:text-brand-ember transition-colors font-light">Travel Stories</Link></li>
                <li><Link href="/collections" className="text-sm text-secondary-text hover:text-brand-ember transition-colors font-light">Curated Lists</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-bold tracking-widest uppercase text-brand-sunrise mb-6">Community</h3>
              <ul className="space-y-4">
                <li><Link href="/signup?role=guide" className="text-sm text-secondary-text hover:text-brand-ember transition-colors font-light">Become a Guide</Link></li>
                <li><Link href="/host" className="text-sm text-secondary-text hover:text-brand-ember transition-colors font-light">Host a Gem</Link></li>
                <li><Link href="/partners" className="text-sm text-secondary-text hover:text-brand-ember transition-colors font-light">Partner with Us</Link></li>
                <li><Link href="/refer" className="text-sm text-secondary-text hover:text-brand-ember transition-colors font-light">Refer a Traveler</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-bold tracking-widest uppercase text-brand-sunrise mb-6">Support</h3>
              <ul className="space-y-4">
                <li><Link href="/help" className="text-sm text-secondary-text hover:text-brand-ember transition-colors font-light">Help Center</Link></li>
                <li><Link href="/safety" className="text-sm text-secondary-text hover:text-brand-ember transition-colors font-light">Safety Guidelines</Link></li>
                <li><Link href="/privacy" className="text-sm text-secondary-text hover:text-brand-ember transition-colors font-light">Privacy Policy</Link></li>
                <li><Link href="/terms" className="text-sm text-secondary-text hover:text-brand-ember transition-colors font-light">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-20 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-secondary-text/40 font-light">
            © {new Date().getFullYear()} Roamly. Handcrafted for travelers worldwide.
          </p>
          <div className="flex items-center gap-2 text-xs text-secondary-text/40 font-light">
            <MapPin size={12} className="text-brand-ember" />
            <span>Made with passion in Kyoto & Paris</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
