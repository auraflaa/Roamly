'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Compass, Users, Shield, Star, MapPin, Sparkles, ArrowRight, ChevronRight } from 'lucide-react';
import Footer from '@/components/layout/Footer';
import { SEED_GEMS } from '@/lib/seed';

const features = [
  {
    icon: Compass,
    title: 'Hidden Gems',
    description: 'Discover authentic places curated by verified local insiders — far from the tourist traps.',
  },
  {
    icon: Users,
    title: 'Local Guides',
    description: 'Connect with passionate locals who share their city through guided, virtual, or self-paced tours.',
  },
  {
    icon: Shield,
    title: 'Safety First',
    description: 'Verified guides, identity checks, real-time location sharing, and SOS features for peace of mind.',
  },
  {
    icon: Sparkles,
    title: 'Smart Matching',
    description: 'AI-powered recommendations pair you with guides and gems that match your travel vibes.',
  },
];

const stats = [
  { value: '500+', label: 'Hidden Gems' },
  { value: '120+', label: 'Local Guides' },
  { value: '15K+', label: 'Happy Travelers' },
  { value: '4.8', label: 'Avg Rating' },
];

export default function LandingPage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden pt-24 pb-16">
        {/* Background gradient */}
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(ellipse at 50% 0%, rgba(232, 96, 26, 0.15) 0%, transparent 60%)',
        }} />
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(ellipse at 80% 80%, rgba(245, 160, 106, 0.08) 0%, transparent 50%)',
        }} />

        {/* Floating orbs */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full opacity-20 animate-float" style={{
          background: 'radial-gradient(circle, var(--color-brand-ember) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }} />
        <div className="absolute bottom-1/3 right-1/4 w-48 h-48 rounded-full opacity-15 animate-float" style={{
          background: 'radial-gradient(circle, var(--color-brand-sunrise) 0%, transparent 70%)',
          filter: 'blur(50px)',
          animationDelay: '1.5s',
        }} />

        <motion.div 
          className="relative z-10 max-w-[1280px] mx-auto px-4 lg:px-6 text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, type: 'spring', stiffness: 100, damping: 20 }}
        >
          <div>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6" style={{
              background: 'var(--color-brand-ember-15)',
              border: '1px solid var(--color-brand-ember-30)',
            }}>
              <Sparkles size={14} className="text-brand-ember" />
              <span className="text-caption text-brand-ember">Travel Like a Local</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-semibold tracking-tight mb-6 max-w-4xl mx-auto" style={{
              lineHeight: '1.1',
              letterSpacing: '-0.03em',
            }}>
              Discover Hidden Gems
              <br />
              <span className="bg-gradient-to-r from-brand-ember via-brand-sunrise to-brand-ember bg-clip-text text-transparent">
                Through Local Eyes
              </span>
            </h1>

            <p className="text-body-lg max-w-2xl mx-auto mb-10" style={{ color: 'var(--secondary-text)' }}>
              Connect with verified local insiders who reveal the authentic soul of every city.
              Guided tours, hidden trails, secret food spots — experiences you won't find in any guidebook.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/explore"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-brand-ember text-white font-medium text-base hover:bg-brand-sienna transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-brand-ember/20"
              >
                Start Exploring <ArrowRight size={18} />
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-medium text-base transition-all duration-300 hover:scale-105"
                style={{
                  background: 'var(--card)',
                  border: '1px solid var(--border)',
                  color: 'var(--primary-text)',
                }}
              >
                Become a Guide <ChevronRight size={18} />
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-3xl mx-auto animate-fade-in" style={{ animationDelay: '0.3s' }}>
            {stats.map(({ value, label }) => (
              <div key={label} className="text-center p-4">
                <p className="text-2xl lg:text-3xl font-bold text-brand-ember">{value}</p>
                <p className="text-caption mt-1" style={{ color: 'var(--secondary-text)' }}>{label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-20 lg:py-28" style={{ background: 'var(--surface)' }}>
        <div className="max-w-[1280px] mx-auto px-4 lg:px-6">
          <div className="text-center mb-16">
            <span className="text-label text-brand-ember mb-3 block">Why Roamly</span>
            <h2 className="text-h1 lg:text-display" style={{ color: 'var(--primary-text)' }}>
              Travel experiences, reimagined
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(({ icon: Icon, title, description }, index) => (
              <motion.div
                key={title}
                className="p-6 rounded-[22px] group cursor-pointer"
                style={{ background: 'var(--card)' }}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.1, type: "spring", stiffness: 120, damping: 20 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform" style={{
                  background: 'var(--color-brand-ember-15)',
                }}>
                  <Icon size={22} className="text-brand-ember" />
                </div>
                <h3 className="text-h3 mb-2" style={{ color: 'var(--primary-text)' }}>{title}</h3>
                <p className="text-body" style={{ color: 'var(--secondary-text)' }}>{description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Gems Section */}
      <section className="py-20 lg:py-28">
        <div className="max-w-[1280px] mx-auto px-4 lg:px-6">
          <div className="flex items-end justify-between mb-10">
            <div>
              <span className="text-label text-brand-ember mb-3 block">Featured</span>
              <h2 className="text-h1 lg:text-display" style={{ color: 'var(--primary-text)' }}>
                Loved by locals
              </h2>
            </div>
            <Link
              href="/explore"
              className="hidden sm:flex items-center gap-1 text-sm font-medium text-brand-ember hover:text-brand-sienna transition-colors"
            >
              View All <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {SEED_GEMS.slice(0, 3).map((gem, index) => (
              <motion.div 
                key={gem.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.1, type: "spring", stiffness: 100, damping: 22 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link href={`/gem/${gem.id}`} className="group block h-full">
                  <div
                    className="rounded-[22px] overflow-hidden h-full"
                    style={{ background: 'var(--card)' }}
                  >
                  <div className="relative h-[200px] lg:h-[260px] overflow-hidden">
                    <div
                      className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                      style={{ backgroundImage: `url(${gem.photos[0]})` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute bottom-3 left-3 flex gap-1.5">
                      {gem.vibes.slice(0, 2).map(v => (
                        <span key={v} className="px-2.5 py-1 rounded-full text-[10px] font-medium backdrop-blur-md" style={{
                          background: 'rgba(232, 96, 26, 0.2)',
                          color: '#F5A06A',
                          border: '1px solid rgba(232, 96, 26, 0.3)',
                        }}>{v}</span>
                      ))}
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="text-h3 mb-2" style={{ color: 'var(--primary-text)' }}>{gem.title}</h3>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <Star size={14} className="fill-brand-ember text-brand-ember" />
                        <span className="text-sm font-semibold" style={{ color: 'var(--primary-text)' }}>{gem.rating}</span>
                        <span className="text-caption" style={{ color: 'var(--secondary-text)' }}>({gem.reviewCount})</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin size={12} style={{ color: 'var(--secondary-text)' }} />
                        <span className="text-caption" style={{ color: 'var(--secondary-text)' }}>{gem.location.address}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="mt-8 text-center sm:hidden">
            <Link href="/explore" className="inline-flex items-center gap-1 text-sm font-medium text-brand-ember hover:text-brand-sienna transition-colors">
              View All Gems <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-28" style={{ background: 'var(--surface)' }}>
        <div className="max-w-[1280px] mx-auto px-4 lg:px-6">
          <motion.div
            className="rounded-[22px] p-8 lg:p-16 text-center relative overflow-hidden"
            style={{ background: 'var(--card)' }}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, type: "spring", stiffness: 80, damping: 20 }}
          >
            <div className="absolute inset-0" style={{
              background: 'radial-gradient(ellipse at 50% 100%, rgba(232, 96, 26, 0.1) 0%, transparent 60%)',
            }} />
            <div className="relative z-10">
              <h2 className="text-h1 lg:text-display mb-4" style={{ color: 'var(--primary-text)' }}>
                Ready to explore like a local?
              </h2>
              <p className="text-body-lg max-w-xl mx-auto mb-8" style={{ color: 'var(--secondary-text)' }}>
                Join thousands of travelers discovering authentic experiences. Sign up free and start your journey today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-brand-ember text-white font-medium hover:bg-brand-sienna transition-all hover:scale-105"
                >
                  Create Free Account
                </Link>
                <Link
                  href="/signup?role=guide"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-medium transition-all hover:scale-105"
                  style={{ border: '2px solid var(--border)', color: 'var(--primary-text)' }}
                >
                  Apply as a Guide
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
