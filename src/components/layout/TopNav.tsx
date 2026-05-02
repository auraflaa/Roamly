'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Menu, X, LogOut, Shield, Compass } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useThemeStore } from '@/lib/store';

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

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled || !isLanding ? 'bg-white/70 dark:bg-black/70 backdrop-blur-xl border-b border-neutral-200 dark:border-neutral-800 shadow-sm' : 'bg-transparent'
        }`}
      >
        <div className="max-w-[1280px] mx-auto px-4 lg:px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-brand-ember to-brand-sienna shadow-lg shadow-brand-ember/20 group-hover:scale-105 transition-transform duration-300">
              <Compass size={20} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="text-h3 font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-neutral-400" style={{ color: 'var(--primary-text)' }}>
              Roamly
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map(({ href, label }) => {
              const isActive = pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className="px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 relative group/link"
                  style={{
                    color: isActive ? 'var(--color-brand-ember)' : 'var(--secondary-text)',
                  }}
                >
                  <span className="relative z-10">{label}</span>
                  {isActive && (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute inset-0 rounded-full bg-brand-ember-15 z-0"
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
              className="p-2 rounded-full transition-all duration-200 hover:bg-brand-ember-15"
              style={{ color: 'var(--secondary-text)' }}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {userData ? (
              <div className="hidden lg:flex items-center gap-3">
                {userData.role === 'admin' && (
                  <Link
                    href="/admin"
                    className="p-2 rounded-full transition-all hover:bg-brand-ember-15"
                    style={{ color: 'var(--secondary-text)' }}
                  >
                    <Shield size={18} />
                  </Link>
                )}
                {userData.role === 'guide' && (
                  <Link
                    href="/guide-dashboard"
                    className="text-sm font-medium px-4 py-2 rounded-full transition-all hover:bg-brand-ember-15"
                    style={{ color: 'var(--secondary-text)' }}
                  >
                    Dashboard
                  </Link>
                )}
                <Link
                  href="/profile"
                  className="w-8 h-8 rounded-full bg-brand-ember flex items-center justify-center text-white text-xs font-bold hover:scale-105 transition-transform"
                >
                  {userData.displayName?.[0]?.toUpperCase() || 'U'}
                </Link>
                <button
                  onClick={signOut}
                  className="p-2 rounded-full transition-all hover:bg-brand-ember-15"
                  style={{ color: 'var(--secondary-text)' }}
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <div className="hidden lg:flex items-center gap-2">
                <Link
                  href="/login"
                  className="text-sm font-medium px-4 py-2 rounded-full transition-all hover:bg-brand-ember-15"
                  style={{ color: 'var(--secondary-text)' }}
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  className="text-sm font-medium px-5 py-2 rounded-full bg-brand-ember text-white hover:bg-brand-sienna transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 rounded-full transition-all hover:bg-brand-ember-15"
              style={{ color: 'var(--secondary-text)' }}
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
