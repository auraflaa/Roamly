'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { Compass, Users, Shield, Star, MapPin, Sparkles, ArrowRight, ChevronRight, Play, Loader2 } from 'lucide-react';
import { collection, getDocs, query, limit, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Footer from '@/components/layout/Footer';
import type { Gem } from '@/lib/types';

// Animation Variants
const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 }
  }
};

const staggerItem = {
  hidden: { opacity: 0, y: 30 },
  show: { 
    opacity: 1, 
    y: 0,
    transition: { type: 'spring', stiffness: 80, damping: 20 }
  }
};

const sectionReveal = {
  hidden: { opacity: 0, y: 50 },
  show: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } // Custom easing for premium feel
  }
};

const features = [
  { icon: Compass, title: 'Hidden Gems', description: 'Discover authentic places curated by verified local insiders — far from the tourist traps.' },
  { icon: Users, title: 'Local Guides', description: 'Connect with passionate locals who share their city through guided, virtual, or self-paced tours.' },
  { icon: Shield, title: 'Safety First', description: 'Verified guides, identity checks, real-time location sharing, and SOS features for peace of mind.' },
  { icon: Sparkles, title: 'Smart Matching', description: 'AI-powered recommendations pair you with guides and gems that match your travel vibes.' },
];

const stats = [
  { value: '500+', label: 'Hidden Gems' },
  { value: '120+', label: 'Local Guides' },
  { value: '15K+', label: 'Happy Travelers' },
  { value: '4.8', label: 'Avg Rating' },
];

const BACKGROUND_IMAGES = [
  'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=2000&q=80', // Paris
  'https://images.unsplash.com/photo-1534008897995-27a23e859048?auto=format&fit=crop&w=2000&q=80', // Kyoto
  'https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=2000&q=80', // Tropical Beach
  'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=2000&q=80', // Mountains
];

export default function LandingPage() {
  const [currentBg, setCurrentBg] = useState(0);
  const [gems, setGems] = useState<Gem[]>([]);
  const [loading, setLoading] = useState(true);
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 500], [0, 150]);
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBg((prev) => (prev + 1) % BACKGROUND_IMAGES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    async function fetchGems() {
      try {
        const q = query(
          collection(db, 'gems'),
          orderBy('rating', 'desc'),
          limit(6)
        );
        const querySnapshot = await getDocs(q);
        const fetchedGems = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Gem[];
        setGems(fetchedGems);
      } catch (error) {
        console.error("Error fetching gems:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchGems();
  }, []);

  return (
    <div className="flex flex-col bg-[#FAFAF9] dark:bg-[#121212]"> {/* Off-white warm background */}
      
      {/* 1. HERO SECTION - Immersive, Cinematic, Parallax */}
      <section className="relative min-h-[95vh] flex items-center justify-center overflow-hidden">
        {/* Animated Slideshow Background */}
        <AnimatePresence mode="popLayout">
          <motion.div
            key={currentBg}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1.1 }} // Slow zoom effect
            exit={{ opacity: 0 }}
            transition={{ duration: 6, ease: 'linear' }}
            className="absolute inset-0 z-0"
            style={{
              backgroundImage: `url(${BACKGROUND_IMAGES[currentBg]})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
        </AnimatePresence>

        {/* Premium Dark Gradient Overlay for Contrast */}
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-black/60 via-black/40 to-[#FAFAF9] dark:to-[#121212]" />
        
        {/* Content Container with Parallax */}
        <motion.div 
          className="relative z-10 max-w-[1280px] mx-auto px-4 lg:px-6 w-full pt-32 pb-16"
          style={{ y: heroY, opacity: heroOpacity }}
        >
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="max-w-4xl"
          >
            {/* Badge */}
            <motion.div variants={staggerItem} className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 backdrop-blur-md bg-white/10 border border-white/20">
              <Sparkles size={14} className="text-brand-ember" />
              <span className="text-sm font-medium tracking-wide text-white/90">Curated Travel Journal</span>
            </motion.div>

            {/* Headline */}
            <motion.h1 variants={staggerItem} className="text-5xl sm:text-6xl lg:text-[80px] font-semibold tracking-tight mb-6 text-white leading-[1.05]">
              Discover the soul of <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-ember to-[#FFB787]">every destination.</span>
            </motion.h1>

            {/* Subtext */}
            <motion.p variants={staggerItem} className="text-xl sm:text-2xl text-white/80 max-w-2xl mb-12 font-light leading-relaxed">
              Step away from the tourist traps. Connect with passionate local insiders who reveal the hidden gems of their city.
            </motion.p>

            {/* CTAs */}
            <motion.div variants={staggerItem} className="flex flex-col sm:flex-row gap-5">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href="/explore"
                  className="inline-flex items-center justify-center gap-2 h-14 px-8 rounded-full bg-brand-ember text-white font-medium shadow-lg shadow-brand-ember/25 transition-all hover:shadow-brand-ember/40"
                >
                  Start Exploring <ArrowRight size={18} />
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center gap-2 h-14 px-8 rounded-full backdrop-blur-md bg-white/10 border border-white/20 text-white font-medium hover:bg-white/20 transition-all"
                >
                  <Play size={18} className="fill-white" /> Watch Stories
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Stats below fold */}
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl border-t border-white/10 pt-8"
          >
            {stats.map(({ value, label }) => (
              <motion.div key={label} variants={staggerItem}>
                <p className="text-3xl font-light text-white mb-1">{value}</p>
                <p className="text-sm font-medium tracking-wide text-brand-ember uppercase">{label}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* 2. FEATURED GEMS - Horizontal Scroll & Image Dominant */}
      <section className="py-24 lg:py-32 relative z-10 -mt-10 rounded-t-[40px] bg-[#FAFAF9] dark:bg-[#121212] shadow-[0_-20px_40px_rgba(0,0,0,0.1)]">
        <div className="max-w-[1280px] mx-auto px-4 lg:px-6">
          <motion.div 
            initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }}
            variants={sectionReveal}
            className="flex items-end justify-between mb-12"
          >
            <div className="max-w-2xl">
              <span className="text-sm font-bold tracking-widest uppercase text-brand-ember mb-3 block">Featured Collections</span>
              <h2 className="text-4xl lg:text-5xl font-semibold tracking-tight" style={{ color: 'var(--primary-text)' }}>
                Loved by locals
              </h2>
            </div>
            <motion.div whileHover={{ x: 5 }}>
              <Link href="/explore" className="hidden sm:flex items-center gap-2 text-sm font-medium text-brand-ember">
                View all gems <ArrowRight size={16} />
              </Link>
            </motion.div>
          </motion.div>

          {/* Horizontal Scroll Snap Container */}
          <div 
            className="flex gap-6 overflow-x-auto overflow-y-hidden pb-8 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 lg:mx-0 lg:px-0 scroll-smooth"
            onWheel={(e) => {
              // Only trigger horizontal scroll if user is scrolling vertically with a mouse wheel
              // Touchpads usually trigger both deltaX and deltaY or small deltas
              if (Math.abs(e.deltaY) > 0 && Math.abs(e.deltaX) === 0) {
                e.currentTarget.scrollLeft += e.deltaY;
                e.preventDefault();
              }
            }}
          >
            {loading ? (
              // Loading Skeleton
              [1, 2, 3].map((i) => (
                <div key={i} className="snap-center shrink-0 w-[300px] sm:w-[380px] lg:w-[420px] h-[480px] rounded-[28px] bg-neutral-200 dark:bg-neutral-800 animate-pulse flex items-center justify-center">
                  <Loader2 className="text-neutral-400 animate-spin" size={32} />
                </div>
              ))
            ) : gems.length > 0 ? (
              gems.map((gem, index) => (
                <motion.div 
                  key={gem.id}
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
                  className="snap-center shrink-0 w-[300px] sm:w-[380px] lg:w-[420px]"
                >
                  <Link href={`/gem/${gem.id}`} className="group block relative h-[480px] rounded-[28px] overflow-hidden">
                    {/* Dominant Image */}
                    <motion.div 
                      className="absolute inset-0 bg-cover bg-center"
                      style={{ backgroundImage: `url(${gem.photos?.[0] || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800'})` }}
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                    {/* Gradient Overlay for Text */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    {/* Hover Overlay Details */}
                    <div className="absolute inset-0 bg-brand-ember/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-[2px]" />

                    {/* Content on Image */}
                    <div className="absolute bottom-0 left-0 right-0 p-8 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 ease-out">
                      <div className="flex gap-2 mb-4">
                        {gem.vibes?.slice(0, 2).map(v => (
                          <span key={v} className="px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md bg-white/20 text-white border border-white/20 shadow-sm">
                            {v}
                          </span>
                        ))}
                      </div>
                      <h3 className="text-2xl font-semibold text-white mb-2 leading-tight">{gem.title}</h3>
                      <div className="flex items-center gap-4 text-white/90 text-sm">
                        <div className="flex items-center gap-1">
                          <MapPin size={14} />
                          <span>{gem.location?.address?.split(',')[0] || 'Unknown'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star size={14} className="fill-brand-ember text-brand-ember" />
                          <span className="font-semibold">{gem.rating || '5.0'}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))
            ) : (
              <div className="w-full text-center py-20 text-secondary-text">
                No gems found. Try seeding the database in the admin panel.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 3. WHY ROAMLY - Redesigned Cards */}
      <section className="py-24 lg:py-32 relative bg-white dark:bg-[#1A1A1A]">
        <div className="max-w-[1280px] mx-auto px-4 lg:px-6">
          <motion.div 
            initial="hidden" whileInView="show" viewport={{ once: true }} variants={sectionReveal}
            className="text-center mb-16 max-w-2xl mx-auto"
          >
            <span className="text-sm font-bold tracking-widest uppercase text-brand-ember mb-3 block">The Roamly Difference</span>
            <h2 className="text-4xl lg:text-5xl font-semibold tracking-tight mb-6" style={{ color: 'var(--primary-text)' }}>
              Travel experiences, reimagined
            </h2>
            <p className="text-lg text-secondary-text font-light">
              We believe travel is about human connection. We built a platform that brings travelers and locals together for unforgettable stories.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(({ icon: Icon, title, description }, index) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="p-8 rounded-[28px] group cursor-pointer bg-[#FAFAF9] dark:bg-[#222222] border border-neutral-200 dark:border-neutral-800 shadow-sm hover:shadow-xl hover:shadow-brand-ember/5 transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 bg-brand-ember/10 group-hover:bg-brand-ember transition-colors duration-300">
                  <Icon size={24} className="text-brand-ember group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="text-xl font-semibold mb-3" style={{ color: 'var(--primary-text)' }}>{title}</h3>
                <p className="font-light leading-relaxed" style={{ color: 'var(--secondary-text)' }}>{description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. CTA SECTION - Warm, Human-centered */}
      <section className="py-24 lg:py-32 bg-[#FAFAF9] dark:bg-[#121212]">
        <div className="max-w-[1000px] mx-auto px-4 lg:px-6">
          <motion.div
            className="rounded-[40px] p-10 lg:p-20 text-center relative overflow-hidden shadow-2xl"
            initial="hidden" whileInView="show" viewport={{ once: true }} variants={sectionReveal}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#2D2A26] to-[#1A1816]" /> {/* Premium dark journal feel */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-brand-ember/20 rounded-full blur-[100px] opacity-50" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-sunrise/20 rounded-full blur-[100px] opacity-50" />
            
            <div className="relative z-10">
              <span className="text-sm font-bold tracking-widest uppercase text-brand-sunrise mb-4 block">Join the Community</span>
              <h2 className="text-4xl lg:text-6xl font-semibold tracking-tight mb-6 text-white">
                Ready to explore <br/>like a local?
              </h2>
              <p className="text-lg lg:text-xl text-white/70 max-w-xl mx-auto mb-10 font-light">
                Join thousands of travelers discovering authentic experiences. Sign up free and start your journey today.
              </p>
              <div className="flex flex-col sm:flex-row gap-5 justify-center">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    href="/signup"
                    className="inline-flex items-center justify-center h-14 px-8 rounded-full bg-brand-ember text-white font-medium shadow-lg hover:bg-brand-sienna transition-colors"
                  >
                    Create Free Account
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    href="/signup?role=guide"
                    className="inline-flex items-center justify-center h-14 px-8 rounded-full border border-white/30 text-white font-medium hover:bg-white/10 transition-colors backdrop-blur-sm"
                  >
                    Apply as a Guide
                  </Link>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
