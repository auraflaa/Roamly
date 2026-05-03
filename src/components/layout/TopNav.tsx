'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Menu, X, LogOut, Shield } from 'lucide-react';
import Image from 'next/image';
import { useAuth } from '@/lib/auth-context';
import { useThemeStore } from '@/lib/store';
import OptimizedImage from '@/components/ui/OptimizedImage';

const navLinks = [
  { href: '/explore', label: 'Explore' },
  { href: '/guides', label: 'Guides' },
  { href: '/community', label: 'Community' },
];

export default function TopNav() {
  const pathname = usePathname();
  const { userData, signOut } = useAuth();
  const { theme, toggleTheme } = useThemeStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const isLanding = pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial state
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isTransparent = isLanding && !scrolled;

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          !isTransparent 
            ? 'bg-surface/80 backdrop-blur-xl border-b border-border shadow-sm' 
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-[1280px] mx-auto px-4 lg:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center group">
            <div className="relative w-32 h-10 transition-transform duration-300 group-hover:scale-105">
              <AnimatePresence mode="wait">
                <motion.div
                  key={isTransparent || theme === 'dark' ? 'dark-logo' : 'light-logo'}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0"
                >
                  <Image 
                    src={isTransparent || theme === 'dark' ? "/assets/logos/02_horizontal_lockup_dark.png" : "/assets/logos/01_horizontal_lockup_light.png"}
                    alt="Roamly Logo" 
                    fill
                    sizes="128px"
                    className="object-contain"
                    priority
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map(({ href, label }) => {
              const isActive = pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className="px-4 py-2 rounded-full text-sm font-bold transition-all duration-300 relative group/link"
                  style={{
                    color: isActive 
                      ? 'var(--color-brand-ember)' 
                      : (isTransparent ? 'rgba(255,255,255,0.8)' : 'var(--secondary-text)'),
                  }}
                >
                  <span className="relative z-10">{label}</span>
                  {isActive && (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute inset-0 rounded-full bg-brand-ember/10 z-0"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span className="absolute bottom-1 left-4 right-4 h-0.5 bg-brand-ember transform scale-x-0 group-hover/link:scale-x-100 transition-transform duration-300 origin-left" />
                </Link>
              );
            })}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full transition-all duration-300 hover:bg-brand-ember/10"
              style={{ color: isTransparent ? 'white' : 'var(--secondary-text)' }}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {userData ? (
              <div className="hidden lg:flex items-center gap-3">
                {userData.role === 'admin' && (
                  <Link
                    href="/admin"
                    className="p-2 rounded-full transition-all hover:bg-brand-ember/10"
                    style={{ color: isTransparent ? 'white' : 'var(--secondary-text)' }}
                  >
                    <Shield size={18} />
                  </Link>
                )}
                {userData.role === 'guide' && (
                  <Link
                    href="/guide-dashboard"
                    className="text-sm font-bold px-4 py-2 rounded-full transition-all hover:bg-brand-ember/10"
                    style={{ color: isTransparent ? 'white' : 'var(--secondary-text)' }}
                  >
                    Dashboard
                  </Link>
                )}
                <Link
                  href="/profile"
                  className="w-8 h-8 rounded-full bg-brand-ember flex items-center justify-center text-white text-xs font-bold hover:scale-105 transition-transform overflow-hidden shadow-sm"
                >
                  {userData.photoURL ? (
                    <OptimizedImage 
                      src={userData.photoURL} 
                      alt={userData.displayName || "User"} 
                      aspectRatio="square"
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    userData.displayName?.[0]?.toUpperCase() || 'U'
                  )}
                </Link>
                <button
                  onClick={signOut}
                  className="p-2 rounded-full transition-all hover:bg-brand-ember/10"
                  style={{ color: isTransparent ? 'white' : 'var(--secondary-text)' }}
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <div className="hidden lg:flex items-center gap-2">
                <Link
                  href="/login"
                  className="text-sm font-bold px-4 py-2 rounded-full transition-all hover:bg-brand-ember/10"
                  style={{ color: isTransparent ? 'white' : 'var(--secondary-text)' }}
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  className="text-sm font-bold px-5 py-2 rounded-full bg-brand-ember text-white hover:bg-brand-sienna transition-all shadow-md shadow-brand-ember/20"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 rounded-full transition-all hover:bg-brand-ember/10"
              style={{ color: isTransparent ? 'white' : 'var(--secondary-text)' }}
              aria-label="Menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div 
            className="fixed inset-0 z-40 lg:hidden" 
            onClick={() => setMobileOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            <motion.div
              className="absolute top-16 right-4 w-64 rounded-xl p-4 shadow-2xl"
              style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
            <div className="flex flex-col gap-1">
              {navLinks.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className="px-4 py-3 rounded-lg text-sm font-medium transition-all hover:bg-brand-ember-15"
                  style={{ color: pathname.startsWith(href) ? 'var(--color-brand-ember)' : 'var(--primary-text)' }}
                >
                  {label}
                </Link>
              ))}
              <div className="my-2 h-px" style={{ background: 'var(--border)' }} />
              {userData ? (
                <>
                  <Link
                    href="/bookings"
                    onClick={() => setMobileOpen(false)}
                    className="px-4 py-3 rounded-lg text-sm font-medium transition-all hover:bg-brand-ember-15"
                    style={{ color: 'var(--primary-text)' }}
                  >
                    My Bookings
                  </Link>
                  <Link
                    href="/profile"
                    onClick={() => setMobileOpen(false)}
                    className="px-4 py-3 rounded-lg text-sm font-medium transition-all hover:bg-brand-ember-15"
                    style={{ color: 'var(--primary-text)' }}
                  >
                    Profile
                  </Link>
                  {userData.role === 'guide' && (
                    <Link
                      href="/guide-dashboard"
                      onClick={() => setMobileOpen(false)}
                      className="px-4 py-3 rounded-lg text-sm font-medium transition-all hover:bg-brand-ember-15"
                      style={{ color: 'var(--primary-text)' }}
                    >
                      Guide Dashboard
                    </Link>
                  )}
                  {userData.role === 'admin' && (
                    <Link
                      href="/admin"
                      onClick={() => setMobileOpen(false)}
                      className="px-4 py-3 rounded-lg text-sm font-medium transition-all hover:bg-brand-ember-15"
                      style={{ color: 'var(--primary-text)' }}
                    >
                      Admin Panel
                    </Link>
                  )}
                  <button
                    onClick={() => { signOut(); setMobileOpen(false); }}
                    className="px-4 py-3 rounded-lg text-sm font-medium text-left transition-all hover:bg-brand-ember-15"
                    style={{ color: 'var(--error-text)' }}
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setMobileOpen(false)}
                    className="px-4 py-3 rounded-lg text-sm font-medium transition-all hover:bg-brand-ember-15"
                    style={{ color: 'var(--primary-text)' }}
                  >
                    Log In
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setMobileOpen(false)}
                    className="px-4 py-3 rounded-lg text-sm font-medium bg-brand-ember text-white text-center transition-colors hover:bg-brand-sienna"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
