'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/auth-context';
import { useThemeStore } from '@/lib/store';

export default function LoginPage() {
  const router = useRouter();
  const { theme } = useThemeStore();
  const { signIn, signInWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signIn(email, password);
      router.push('/explore');
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError('');
    setLoading(true);
    try {
      await signInWithGoogle();
      router.push('/explore');
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with Google');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{ background: 'var(--bg)' }}>
      {/* Background gradient */}
      <div className="fixed inset-0" style={{
        background: 'radial-gradient(ellipse at 50% 0%, rgba(232, 96, 26, 0.1) 0%, transparent 50%)',
      }} />

      <div className="relative w-full max-w-md animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center group">
            <div className="relative w-40 h-12 transition-transform duration-300 group-hover:scale-105">
              <AnimatePresence mode="wait">
                <motion.div
                  key={theme}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0"
                >
                  <Image 
                    src={theme === 'dark' ? "/assets/logos/02_horizontal_lockup_dark.png" : "/assets/logos/01_horizontal_lockup_light.png"}
                    alt="Roamly Logo" 
                    fill
                    sizes="160px"
                    className="object-contain"
                    priority
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          </Link>
          <p className="text-body" style={{ color: 'var(--secondary-text)' }}>Welcome back, explorer</p>
        </div>

        {/* Form card */}
        <div
          className="rounded-[22px] p-6 lg:p-8"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
        >
          {error && (
            <div className="mb-4 p-3 rounded-xl text-sm" style={{ background: 'var(--error-bg)', color: 'var(--error-text)' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-label block mb-2" style={{ color: 'var(--secondary-text)' }}>Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--secondary-text)' }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full h-[52px] lg:h-12 pl-11 pr-4 rounded-xl text-sm outline-none transition-all focus-ring"
                  style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    color: 'var(--primary-text)',
                  }}
                />
              </div>
            </div>

            <div>
              <label className="text-label block mb-2" style={{ color: 'var(--secondary-text)' }}>Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--secondary-text)' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full h-[52px] lg:h-12 pl-11 pr-11 rounded-xl text-sm outline-none transition-all focus-ring"
                  style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    color: 'var(--primary-text)',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--secondary-text)' }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-[52px] lg:h-12 rounded-full bg-brand-ember text-white font-medium text-sm transition-all hover:bg-brand-sienna disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02]"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
            <span className="text-caption" style={{ color: 'var(--secondary-text)' }}>OR</span>
            <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
          </div>

          <button
            onClick={handleGoogle}
            disabled={loading}
            className="w-full h-[52px] lg:h-12 rounded-full text-sm font-medium flex items-center justify-center gap-3 transition-all hover:scale-[1.02] disabled:opacity-50"
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              color: 'var(--primary-text)',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>
        </div>

        <p className="text-center mt-6 text-body" style={{ color: 'var(--secondary-text)' }}>
          Don't have an account?{' '}
          <Link href="/signup" className="text-brand-ember font-medium hover:text-brand-sienna transition-colors">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
