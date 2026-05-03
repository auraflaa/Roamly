'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Compass, Users, Shield, Star, MapPin, Sparkles, ArrowRight, ChevronRight, Play, Loader2, X } from 'lucide-react';
import { collection, getDocs, query, limit, orderBy, getCountFromServer } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Footer from '@/components/layout/Footer';
import type { Gem } from '@/lib/types';
import { useAuth } from '@/lib/auth-context';
import { getPersonalizedVibes } from '@/app/actions/personalization';
import { useGems } from '@/lib/hooks/use-gems';
import { useCommunityPosts } from '@/lib/hooks/use-community';
import OptimizedImage from '@/components/ui/OptimizedImage';

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
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as any }
  }
};

const sectionReveal = {
  hidden: { opacity: 0, y: 50 },
  show: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as any } // Custom easing for premium feel
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
  const router = useRouter();
  const [currentBg, setCurrentBg] = useState(0);
  const [showRecommendation, setShowRecommendation] = useState(false);
  const [isRecommendationDismissed, setIsRecommendationDismissed] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const [platformStats, setPlatformStats] = useState({ gems: '500+', guides: '120+', travelers: '15K+', rating: '4.8' });
  const isMounted = React.useRef(true);

  const { firebaseUser, userData } = useAuth();

  const topVibe = userData?.vibeAffinities && Object.keys(userData.vibeAffinities).length > 0
    ? Object.entries(userData.vibeAffinities).sort((a, b) => b[1].score - a[1].score)[0]?.[0]
    : userData?.vibes?.[0] || null;

  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 500], [0, 150]);
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);

  useEffect(() => {
    setHasMounted(true);
    document.body.classList.add('main-page');

    // Fetch real stats
    const fetchStats = async () => {
      try {
        const gemsCount = await getCountFromServer(collection(db, 'gems'));
        const guidesCount = await getCountFromServer(collection(db, 'guides'));
        const travelersCount = await getCountFromServer(collection(db, 'users'));
        
        setPlatformStats({
          gems: `${gemsCount.data().count}+`,
          guides: `${guidesCount.data().count}+`,
          travelers: `${Math.max(15, travelersCount.data().count)}K+`, // Keep some prestige but use base
          rating: '4.8'
        });
      } catch (e) {
        console.error('Error fetching stats:', e);
      }
    };
    fetchStats();

    const timer = setInterval(() => {
      setCurrentBg((prev) => (prev + 1) % BACKGROUND_IMAGES.length);
    }, 6000);

    // Show recommendation after 3 seconds
    const recTimer = setTimeout(() => {
      if (!isRecommendationDismissed) {
        setShowRecommendation(true);
      }
    }, 3000);

    return () => {
      document.body.classList.remove('main-page');
      clearInterval(timer);
      clearTimeout(recTimer);
    };
  }, [isRecommendationDismissed]);

  const { gems, isLoading: gemsLoading } = useGems({ limit: 6 });
  const { posts: communityPosts, isLoading: communityLoading } = useCommunityPosts();

  useEffect(() => {
    const fetchPlatformStats = async () => {
      try {
        const [gemsCount, guidesCount, usersCount] = await Promise.all([
          getCountFromServer(collection(db, 'gems')),
          getCountFromServer(collection(db, 'guides')),
          getCountFromServer(collection(db, 'users'))
        ]);
        
        if (isMounted.current) {
          setPlatformStats({
            gems: `${gemsCount.data().count}+`,
            guides: `${guidesCount.data().count}+`,
            travelers: `${usersCount.data().count}+`,
            rating: '4.9'
          });
        }
      } catch (err) {
        // Silently fail to fallback stats if network issues occur
      }
    };

    fetchPlatformStats();
  }, [setPlatformStats]);

  return (
    <div className="flex flex-col" style={{ background: 'var(--bg)' }}>
      
      {/* 1. HERO SECTION - Immersive, Cinematic, Parallax */}
      <section className="relative min-h-[95vh] flex items-center justify-center overflow-hidden">
        {/* Animated Slideshow Background */}
        <AnimatePresence mode="popLayout">
          <motion.div
            key={currentBg}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1.15 }} // Continuous slow zoom
            exit={{ opacity: 0 }}
            transition={{ duration: 6, ease: 'linear' }}
            className="absolute inset-0 z-0"
          >
            <OptimizedImage 
              src={BACKGROUND_IMAGES[currentBg]} 
              alt="Travel background" 
              aspectRatio="unset"
              className="absolute inset-0 w-full h-full object-cover"
            />
          </motion.div>
        </AnimatePresence>

        {/* Premium Dark Gradient Overlay for Contrast */}
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-black/60 via-black/40 to-[var(--hero-fade)]" />
        
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
                  {topVibe ? `Find more ${topVibe} gems` : 'Start Exploring'} <ArrowRight size={18} />
                </Link>
              </motion.div>
              
              {firebaseUser ? (
                <div className="flex flex-col sm:flex-row items-center gap-5">
                  {topVibe && (
                    <motion.button 
                      onClick={() => router.push(`/explore?vibe=${topVibe}`)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center gap-3 px-6 h-14 rounded-full bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 transition-all text-left"
                    >
                      <div className="w-8 h-8 rounded-full bg-brand-ember/20 flex items-center justify-center">
                          <Sparkles size={14} className="text-brand-ember" />
                      </div>
                      <div>
                          <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Continue Your Journey</p>
                          <p className="text-sm font-bold text-white">Exploring {topVibe} spots</p>
                      </div>
                    </motion.button>
                  )}
                  
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link
                      href="/community"
                      className="inline-flex items-center justify-center gap-2 h-14 px-8 rounded-full backdrop-blur-md bg-white/10 border border-white/20 text-white font-medium hover:bg-white/20 transition-all"
                    >
                      <Play size={18} className="fill-white" /> Watch Stories
                    </Link>
                  </motion.div>
                </div>
              ) : (
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    href="/signup"
                    className="inline-flex items-center justify-center gap-2 h-14 px-8 rounded-full backdrop-blur-md bg-white/10 border border-white/20 text-white font-medium hover:bg-white/20 transition-all"
                  >
                    <Play size={18} className="fill-white" /> Watch Stories
                  </Link>
                </motion.div>
              )}
            </motion.div>
          </motion.div>

          {/* Stats below fold */}
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl border-t border-white/10 pt-8"
          >
            {[
              { value: platformStats.gems, label: 'Hidden Gems' },
              { value: platformStats.guides, label: 'Local Guides' },
              { value: platformStats.travelers, label: 'Happy Travelers' },
              { value: platformStats.rating, label: 'Avg Rating' },
            ].map(({ value, label }) => (
              <motion.div key={label} variants={staggerItem}>
                <p className="text-3xl font-light text-white mb-1">{value}</p>
                <p className="text-sm font-medium tracking-wide text-brand-ember uppercase">{label}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* 2. DAILY CURATED PICK - Subtle Floating Notification */}
      <AnimatePresence>
        {showRecommendation && gems[0] && (
          <motion.div 
            initial={{ opacity: 0, y: -20, x: 20 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: -20, x: 20 }}
            className="fixed top-24 right-4 lg:right-8 z-50 w-[320px] group"
          >
            <div className="relative p-0.5 rounded-[20px] bg-gradient-to-br from-brand-ember/30 to-transparent backdrop-blur-xl border border-border shadow-2xl overflow-hidden">
              <div className="bg-surface/80 p-4 rounded-[18px]">
                {/* Close Button */}
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    setShowRecommendation(false);
                    setIsRecommendationDismissed(true);
                  }}
                  className="absolute top-3 right-3 z-20 w-6 h-6 rounded-full bg-elevated/20 hover:bg-elevated/40 backdrop-blur-md flex items-center justify-center text-primary-text transition-all"
                >
                  <X size={14} />
                </button>

                <Link href={`/gem/${gems[0].id}`} className="flex items-start gap-4">
                  <div className="relative shrink-0 w-16 h-16 rounded-xl overflow-hidden">
                    <OptimizedImage 
                      src={gems[0]?.photos[0]} 
                      alt="Daily Pick"
                      aspectRatio="square"
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div className="flex-1 pr-4">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Sparkles size={10} className="text-brand-ember" />
                      <span className="text-[8px] font-bold text-brand-ember uppercase tracking-widest">Recommended</span>
                    </div>
                    <h3 className="text-sm font-bold text-primary-text mb-1 group-hover:text-brand-ember transition-colors line-clamp-1">
                      {gems[0]?.title}
                    </h3>
                    <p className="text-[11px] text-secondary-text line-clamp-2 leading-tight opacity-90">
                      {gems[0]?.description}
                    </p>
                  </div>
                </Link>
              </div>

              {/* Progress bar timer */}
              <motion.div 
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 10, ease: "linear" }}
                className="absolute bottom-0 left-0 h-0.5 bg-brand-ember/40"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. FEATURED GEMS - Horizontal Scroll & Image Dominant */}
      <section className="py-24 lg:py-32 relative z-10 rounded-t-[40px] border-t border-border/50" style={{ background: 'var(--bg)' }}>
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
              if (Math.abs(e.deltaY) > 0 && Math.abs(e.deltaX) === 0) {
                e.currentTarget.scrollLeft += e.deltaY;
                e.preventDefault();
              }
            }}
          >
            {!hasMounted || gemsLoading ? (
              // Loading Skeleton
              [1, 2, 3].map((i) => (
                <div key={i} className="snap-center shrink-0 w-[300px] sm:w-[380px] lg:w-[420px] h-[480px] rounded-[28px] bg-elevated/50 animate-pulse flex items-center justify-center">
                  <Loader2 className="text-secondary-text opacity-30 animate-spin" size={32} />
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
                    <OptimizedImage 
                      src={gem.photos?.[0] || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800'} 
                      alt={gem.title}
                      aspectRatio="unset"
                      className="absolute inset-0 group-hover:scale-105 transition-transform duration-700"
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
      <section className="py-24 lg:py-32 relative" style={{ background: 'var(--bg)' }}>
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
                className="p-8 rounded-[28px] group cursor-pointer transition-all duration-300"
                style={{ 
                  background: 'var(--surface)', 
                  border: '1px solid var(--border)',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
                }}
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
      {/* 4. COMMUNITY STORIES - Narrative discovery preview */}
      <section className="py-24 lg:py-32 relative" style={{ background: 'var(--bg)' }}>
        <div className="max-w-[1280px] mx-auto px-4 lg:px-6">
          <motion.div 
            initial="hidden" whileInView="show" viewport={{ once: true }} variants={sectionReveal}
            className="flex items-end justify-between mb-12"
          >
            <div className="max-w-2xl">
              <span className="text-sm font-bold tracking-widest uppercase text-brand-ember mb-3 block">From the Community</span>
              <h2 className="text-4xl lg:text-5xl font-semibold tracking-tight" style={{ color: 'var(--primary-text)' }}>
                Stories from the road
              </h2>
            </div>
            <Link href="/community" className="hidden sm:flex items-center gap-2 text-sm font-medium text-brand-ember hover:underline">
              Read all stories <ArrowRight size={16} />
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {!hasMounted || communityLoading ? (
              // Loading Skeleton
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-80 rounded-3xl bg-elevated/50 animate-pulse flex flex-col gap-4 p-4">
                  <div className="aspect-[16/10] bg-elevated/80 rounded-2xl" />
                  <div className="h-6 w-3/4 bg-elevated/80 rounded-lg" />
                  <div className="h-4 w-1/2 bg-elevated/80 rounded-lg" />
                </div>
              ))
            ) : communityPosts.length > 0 ? communityPosts.map((story, i) => (
              <motion.div
                key={story.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group cursor-pointer"
                onClick={() => router.push(`/community/post/${story.id}`)}
              >
                <div className="relative aspect-[16/10] rounded-3xl overflow-hidden mb-6 shadow-lg shadow-black/5">
                  <OptimizedImage 
                    src={story.photos?.[0] || "https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?auto=format&fit=crop&w=800&q=80"} 
                    alt={story.title} 
                    aspectRatio="16/10"
                    className="group-hover:scale-105 transition-transform duration-700" 
                  />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-[10px] font-bold text-white uppercase tracking-widest">Travel Log</span>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-primary-text group-hover:text-brand-ember transition-colors mb-3 line-clamp-2 leading-tight">
                  {story.title}
                </h3>
                <p className="text-sm text-secondary-text line-clamp-3 mb-4 leading-relaxed font-serif">
                  {story.subtitle || story.description}
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-brand-ember/20 flex items-center justify-center text-[10px] font-bold text-brand-ember">
                    {story.authorName?.[0] || 'T'}
                  </div>
                  <span className="text-xs font-bold text-primary-text">{story.authorName}</span>
                  <span className="text-xs text-secondary-text">·</span>
                  <span className="text-[10px] text-secondary-text uppercase tracking-widest font-bold">{story.readingTime || '3 min read'}</span>
                </div>
              </motion.div>
            )) : (
              <div className="col-span-full py-12 text-center bg-elevated/50 rounded-3xl border border-dashed border-border">
                <p className="text-secondary-text font-medium">No stories have been shared yet. Be the first!</p>
              </div>
            )}
          </div>
          <div className="mt-12 sm:hidden">
            <Link href="/community" className="flex items-center justify-center gap-2 h-14 w-full rounded-full border border-border text-primary-text font-bold">
              View All Stories
            </Link>
          </div>
        </div>
      </section>

      {/* 4. CTA SECTION - Warm, Human-centered */}
      <section className="py-24 lg:py-32 relative" style={{ background: 'var(--surface)' }}>
        <div className="max-w-[1000px] mx-auto px-4 lg:px-6">
          <motion.div
            className="rounded-[40px] p-10 lg:p-20 text-center relative overflow-hidden shadow-2xl"
            initial="hidden" whileInView="show" viewport={{ once: true }} variants={sectionReveal}
          >
            <div className="absolute inset-0" style={{ background: 'var(--cta-bg)' }} />
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
