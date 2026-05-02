'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc, collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Star, MapPin, Globe, ShieldCheck, Heart, Share2, ArrowLeft, MessageSquare, Calendar, ChevronRight, Award, Sparkles } from 'lucide-react';
import { SEED_GUIDES } from '@/lib/seed';
import type { Guide, Gem } from '@/lib/types';
import GemCard from '@/components/cards/GemCard';

export default function GuideProfilePage() {
  const params = useParams();
  const router = useRouter();
  const [guide, setGuide] = useState<any>(null);
  const [gems, setGems] = useState<Gem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params?.id) {
      loadGuideData();
    }
  }, [params?.id]);

  const loadGuideData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Guide Profile
      const guideDoc = await getDoc(doc(db, 'guides', params.id as string));
      let guideData = null;

      if (guideDoc.exists()) {
        guideData = { ...guideDoc.data(), uid: guideDoc.id };
      } else {
        const seedGuide = SEED_GUIDES.find(g => g.uid === params.id);
        if (seedGuide) guideData = seedGuide;
      }

      setGuide(guideData);

      // 2. Fetch Guide's Gems
      if (guideData) {
        const gemsQuery = query(
          collection(db, 'gems'),
          where('authorId', '==', guideData.uid),
          limit(6)
        );
        const gemsSnap = await getDocs(gemsQuery);
        setGems(gemsSnap.docs.map(d => ({ ...d.data(), id: d.id } as Gem)));
      }
    } catch (err) {
      console.error("Error loading guide:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="max-w-[1280px] mx-auto px-4 py-12 animate-pulse">
      <div className="h-64 rounded-[40px] bg-surface mb-8" />
      <div className="h-12 w-1/3 bg-surface rounded-full mb-4" />
      <div className="h-4 w-1/2 bg-surface rounded-full" />
    </div>
  );

  if (!guide) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <h2 className="text-3xl font-bold text-primary-text mb-2">Guide not found</h2>
      <p className="text-secondary-text mb-6">This local expert might have wandered off the grid.</p>
      <button onClick={() => router.back()} className="text-brand-ember font-bold flex items-center gap-2">
        <ArrowLeft size={18} /> Go Back
      </button>
    </div>
  );

  return (
    <div className="max-w-[1280px] mx-auto pb-20 animate-fade-in">
      {/* Header Profile Section */}
      <div className="relative pt-12 lg:pt-20 px-4 lg:px-6">
        <div className="bg-card rounded-[40px] border border-border p-8 lg:p-12 relative overflow-hidden">
          {/* Decorative background blobs */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-ember/10 blur-[100px] rounded-full -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-sienna/10 blur-[100px] rounded-full -ml-32 -mb-32" />

          <div className="relative flex flex-col lg:flex-row gap-10 items-center lg:items-start">
            {/* Profile Photo */}
            <div className="relative group">
              <div className="w-32 h-32 lg:w-48 lg:h-48 rounded-[48px] overflow-hidden border-4 border-brand-ember/20 shadow-2xl transition-transform group-hover:scale-105 duration-500">
                <img 
                  src={guide.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${guide.uid}`} 
                  alt={guide.displayName}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-2 -right-2 bg-brand-ember text-white p-3 rounded-2xl shadow-xl border-4 border-surface">
                <ShieldCheck size={24} />
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center lg:text-left">
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mb-4">
                <h1 className="text-4xl lg:text-5xl font-bold text-primary-text">{guide.displayName || 'Local Expert'}</h1>
                <div className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-elevated/5 border border-border text-brand-ember text-sm font-bold uppercase tracking-widest">
                  <Star size={14} className="fill-brand-ember" />
                  {guide.rating || '5.0'}
                </div>
              </div>

              <div className="flex flex-wrap justify-center lg:justify-start gap-6 text-secondary-text mb-8">
                <div className="flex items-center gap-2">
                  <MapPin size={18} className="text-brand-ember" />
                  <span className="font-medium">{guide.city}, India</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe size={18} className="text-brand-ember" />
                  <span className="font-medium">{guide.languages?.join(', ') || 'English, Hindi'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award size={18} className="text-brand-ember" />
                  <span className="font-medium">Pro Guide</span>
                </div>
              </div>

              <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                <button className="px-8 py-4 rounded-2xl bg-brand-ember hover:bg-brand-sienna text-white font-bold transition-all shadow-lg shadow-brand-ember/20 flex items-center gap-2">
                  <MessageSquare size={18} />
                  Message Guide
                </button>
                <button className="p-4 rounded-2xl bg-elevated/10 border border-border text-primary-text hover:bg-elevated/20 transition-all">
                  <Heart size={20} />
                </button>
                <button className="p-4 rounded-2xl bg-elevated/10 border border-border text-primary-text hover:bg-elevated/20 transition-all">
                  <Share2 size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="px-4 lg:px-6 py-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left Column: Bio & Specialties */}
        <div className="lg:col-span-2 space-y-12">
          <section>
            <h2 className="text-3xl font-bold text-primary-text mb-6">About Me</h2>
            <p className="text-lg leading-relaxed text-secondary-text">
              {guide.bio || `I'm a passionate local explorer in ${guide.city} with over 5 years of experience uncovering hidden spots that aren't on any map. My tours focus on authentic culture, street food gems, and the untold stories of our streets.`}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-primary-text mb-6">Specialties</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {guide.specialties?.map((spec: string) => (
                <div key={spec} className="p-5 rounded-3xl bg-surface border border-border flex items-center gap-4 group hover:border-brand-ember/30 transition-all">
                  <div className="w-10 h-10 rounded-xl bg-brand-ember/10 text-brand-ember flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Sparkles size={20} />
                  </div>
                  <span className="font-bold text-primary-text">{spec}</span>
                </div>
              ))}
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-primary-text">Gems I Guide</h2>
              <button className="text-brand-ember font-bold text-sm flex items-center gap-2">
                View All <ChevronRight size={16} />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {gems.length > 0 ? gems.map(gem => (
                <GemCard key={gem.id} gem={gem} />
              )) : (
                <div className="col-span-2 p-12 rounded-[32px] border-2 border-dashed border-border text-center">
                  <p className="text-secondary-text italic">No gems uploaded yet by this guide.</p>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Right Column: Experience & Stats */}
        <div className="lg:col-span-1 space-y-8">
          <div className="p-8 rounded-[40px] bg-surface border border-border shadow-xl">
            <h3 className="text-xl font-bold text-primary-text mb-6">Expertise Stats</h3>
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-secondary-text">Trips Completed</span>
                <span className="text-2xl font-bold text-brand-ember">124+</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-secondary-text">Happy Travelers</span>
                <span className="text-2xl font-bold text-brand-ember">450+</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-secondary-text">Local Verification</span>
                <span className="text-sm font-bold text-green-500 flex items-center gap-1.5">
                  <ShieldCheck size={16} /> Verified
                </span>
              </div>
            </div>
            
            <hr className="my-8 border-border" />
            
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-elevated/5 border border-border">
                <Calendar className="text-brand-ember" size={20} />
                <div className="flex-1">
                  <p className="text-xs font-bold text-secondary-text uppercase tracking-widest">Next Available</p>
                  <p className="text-sm font-bold text-primary-text">Tomorrow, 10:00 AM</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8 rounded-[40px] bg-brand-ember/10 border border-brand-ember/20">
             <h4 className="font-bold text-brand-ember mb-2">Want to book {guide.displayName?.split(' ')[0]}?</h4>
             <p className="text-sm text-secondary-text leading-relaxed mb-6">
               Requests are usually confirmed within 2 hours. Local insiders handle everything from directions to hidden food spots.
             </p>
             <button className="w-full py-4 rounded-2xl bg-brand-ember hover:bg-brand-sienna text-white font-bold transition-all shadow-lg shadow-brand-ember/20">
               Check Itinerary
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
