"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc, collection, getDocs, query, where, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Star, MapPin, Clock, ArrowLeft, Heart, Share2, CheckCircle, Backpack, Calendar, ChevronLeft, ChevronRight, Loader2, PartyPopper, Users, Sparkles, ArrowRight, X } from 'lucide-react';
import Link from 'next/link';
import type { Gem, Guide } from '@/lib/types';
import { SEED_GEMS, SEED_GUIDES } from '@/lib/seed';
import { useAuth } from '@/lib/auth-context';
import { createBooking } from '@/app/actions/booking';
import { useUserActions } from '@/lib/hooks/use-user';

import { useGem, useGuides } from '@/lib/hooks/use-gems';
import { formatPrice } from '@/lib/utils';
import OptimizedImage from '@/components/ui/OptimizedImage';

export default function GemDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { firebaseUser, userData } = useAuth();
  
  const id = params?.id as string;
  const { gem, isLoading: gemLoading } = useGem(id);
  const { guides, isLoading: guidesLoading } = useGuides(gem?.location.city);
  
  const [currentPhoto, setCurrentPhoto] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  
  useEffect(() => {
    if (userData?.savedGems && gem?.id) {
      setIsSaved(userData.savedGems.includes(gem.id));
    }
  }, [userData, gem?.id]);

  const [bookingStatus, setBookingStatus] = useState<'idle' | 'booking' | 'success' | 'error' | 'not-supported'>('idle');
  const [selectedGuide, setSelectedGuide] = useState<string | null>(null);
  const { toggleSavedGem, trackInteraction } = useUserActions();

  const loading = gemLoading || (gem && guidesLoading);

  const handleToggleSave = async () => {
    if (!firebaseUser) {
      router.push('/login');
      return;
    }
    const newSaved = !isSaved;
    setIsSaved(newSaved); // Optimistic UI
    
    try {
      await toggleSavedGem(id, newSaved, gem?.vibes?.[0]);
    } catch (err) {
      setIsSaved(!newSaved); // Rollback
      console.error("Error in handleToggleSave:", err);
    }
  };

  useEffect(() => {
    if (firebaseUser && gem?.vibes?.[0]) {
      trackInteraction(gem.vibes[0], 'view');
    }
  }, [firebaseUser, gem?.id]);

  const [bookingMode, setBookingMode] = useState<'self' | 'in-person'>('in-person');

  const handleBooking = async () => {
    if (!firebaseUser) {
      router.push('/login');
      return;
    }

    setBookingStatus('not-supported');
    setTimeout(() => setBookingStatus('idle'), 3000); // Reset after 3s
  };

  if (loading) {
    return (
      <div className="max-w-[1280px] mx-auto px-4 py-6">
        <div className="h-[300px] lg:h-[450px] rounded-[32px] animate-shimmer mb-6" />
        <div className="space-y-4">
          <div className="h-8 w-2/3 rounded-full animate-shimmer" />
          <div className="h-4 w-1/2 rounded-full animate-shimmer" />
          <div className="h-32 rounded-3xl animate-shimmer" />
        </div>
      </div>
    );
  }

  if (!gem) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-h2 mb-2" style={{ color: 'var(--primary-text)' }}>Gem not found</p>
          <Link href="/explore" className="text-brand-ember hover:text-brand-sienna">Back to Explore</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1280px] mx-auto animate-fade-in">
      {/* Photo Carousel */}
      <div className="relative h-[300px] sm:h-[400px] lg:h-[500px] lg:mx-6 lg:mt-6 lg:rounded-[40px] overflow-hidden shadow-2xl">
        <OptimizedImage 
          src={gem.photos[currentPhoto]} 
          alt={gem.title}
          aspectRatio="unset"
          className="w-full h-full object-cover transition-all duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

        {/* Top bar */}
        <div className="absolute top-6 left-6 right-6 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="p-3 rounded-2xl glass transition-all hover:scale-110 active:scale-95"
          >
            <ArrowLeft size={20} className="text-white" />
          </button>
            <div className="flex gap-3">
            <button
              onClick={handleToggleSave}
              className="p-3 rounded-2xl glass transition-all hover:scale-110 active:scale-95"
            >
              <Heart size={20} className={isSaved ? 'fill-brand-ember text-brand-ember' : 'text-white'} />
            </button>
            <button data-coming-soon="Share features coming soon" type="button" className="p-3 rounded-2xl glass transition-all hover:scale-110 active:scale-95">
              <Share2 size={20} className="text-white" />
            </button>
          </div>
        </div>

        {/* Info Overlay */}
        <div className="absolute bottom-10 left-10 right-10">
           <div className="flex gap-2 mb-4">
            {Array.from(new Set(gem.vibes)).map(vibe => (
              <span key={vibe} className="px-4 py-1.5 rounded-full text-xs font-bold backdrop-blur-md bg-white/10 text-white border border-white/20">
                {vibe}
              </span>
            ))}
          </div>
          <h1 className="text-4xl lg:text-6xl font-bold text-white mb-2">{gem.title}</h1>
          <div className="flex items-center gap-4 text-white/80">
            <div className="flex items-center gap-1.5">
              <MapPin size={18} className="text-brand-ember" />
              <span className="font-medium">{gem.location.address}</span>
            </div>
          </div>
        </div>

        {/* Photo nav dots */}
        {gem.photos.length > 1 && (
          <div className="absolute bottom-6 right-10 flex gap-2">
            {gem.photos.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPhoto(i)}
                className="h-1.5 rounded-full transition-all"
                style={{ 
                  width: i === currentPhoto ? '24px' : '6px',
                  background: i === currentPhoto ? '#F56E0F' : 'rgba(255,255,255,0.3)' 
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Content Grid */}
      <div className="px-4 lg:px-6 py-12 lg:grid lg:grid-cols-3 lg:gap-12">
        <div className="lg:col-span-2">
          <div className="flex items-center gap-6 mb-8 p-6 rounded-3xl bg-surface border border-border">
            <div className="text-center border-r border-border pr-6">
              <div className="flex items-center gap-1 justify-center mb-1">
                <Star size={20} className="fill-brand-ember text-brand-ember" />
                <span className="text-2xl font-bold text-primary-text">{(Number(gem.rating) || 5).toFixed(1)}</span>
              </div>
              <p className="text-xs text-secondary-text uppercase tracking-widest font-bold">{gem.reviewCount} Reviews</p>
            </div>
            
            <div className="flex-1">
               <div className="flex items-center gap-3 text-brand-ember mb-1">
                <CheckCircle size={18} />
                <span className="font-bold">Verified Roamly Gem</span>
               </div>
               <p className="text-sm text-secondary-text">Hand-picked and verified by our local curation team.</p>
            </div>
          </div>

            <div className="mb-12">
              <h2 className="text-3xl font-bold mb-6 text-primary-text">Authentic Local Experience</h2>
              <p className="text-lg leading-relaxed text-secondary-text mb-8">
                {gem.description}
              </p>
              
              {gem.localHeart && (
                <div className="mb-12 p-8 lg:p-12 rounded-[40px] bg-brand-ember/5 border border-brand-ember/10 relative overflow-hidden group">
                  {/* Decorative background element */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-brand-ember/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-brand-ember/10 transition-all duration-700" />
                  
                  <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="w-12 h-12 rounded-2xl bg-brand-ember flex items-center justify-center text-white shadow-lg shadow-brand-ember/20">
                         <Sparkles size={24} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-primary-text">Local Heart</h3>
                        <p className="text-sm text-brand-ember font-bold uppercase tracking-widest">A note from {gem.localHeart.guideName}</p>
                      </div>
                    </div>
                    
                    <blockquote className="text-2xl lg:text-3xl font-medium text-primary-text leading-tight mb-8 italic">
                      "{gem.localHeart.note}"
                    </blockquote>
                    
                    <div className="flex items-center gap-3">
                      <div className="h-px flex-1 bg-brand-ember/20" />
                      <button 
                        onClick={() => router.push(`/guides/${gem.localHeart?.guideId}`)}
                        className="text-sm font-bold text-brand-ember hover:text-brand-sienna transition-colors flex items-center gap-2 group/btn"
                      >
                        Meet the Guide <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="p-6 rounded-3xl bg-surface border border-border group hover:border-brand-ember/30 transition-all">
                  <div className="w-12 h-12 rounded-2xl bg-brand-ember/10 flex items-center justify-center text-brand-ember mb-4 group-hover:scale-110 transition-transform">
                    <Clock size={24} />
                  </div>
                  <h4 className="font-bold text-primary-text mb-1">Perfect Timing</h4>
                <p className="text-sm text-secondary-text">{gem.bestTime?.timeOfDay} · {gem.bestTime?.season}</p>
              </div>

              <div className="p-6 rounded-3xl bg-surface border border-border group hover:border-brand-ember/30 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-brand-ember/10 flex items-center justify-center text-brand-ember mb-4 group-hover:scale-110 transition-transform">
                  <Backpack size={24} />
                </div>
                <h4 className="font-bold text-primary-text mb-1">Preparation</h4>
                <p className="text-sm text-secondary-text">{gem.whatToBring?.join(', ') || 'Just your curiosity'}</p>
              </div>
            </div>
          </div>

          {/* Humanization Layer: The Local Why */}
          <div className="mb-12 p-8 rounded-[32px] bg-brand-ember/5 border border-brand-ember/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Sparkles size={120} className="text-brand-ember" />
            </div>
            <div className="relative z-10">
               <div className="flex items-center gap-4 mb-6">
                 <div className="w-16 h-16 rounded-full bg-brand-ember flex items-center justify-center text-white font-bold text-2xl shadow-xl">
                   {guides[0]?.displayName?.[0] || 'L'}
                 </div>
                 <div>
                   <h4 className="text-lg font-bold text-primary-text">Local Heart</h4>
                   <p className="text-xs text-brand-ember font-bold uppercase tracking-widest">A note from {guides[0]?.displayName || 'your local guide'}</p>
                 </div>
               </div>
               <blockquote className="text-xl font-medium text-primary-text italic leading-relaxed">
                 "I grew up exploring these hidden corners. To me, this isn't just a destination—it's a story of our heritage that most tourists never get to hear. I can't wait to show you the real {gem.location.city || 'area'}."
               </blockquote>
            </div>
          </div>
        </div>

        {/* Matching Sidebar */}
        <div className="lg:col-span-1">
          <div className="rounded-[40px] p-8 sticky top-24 bg-card border border-border shadow-xl">
            {/* Mode Selector */}
            <div className="flex p-1.5 rounded-2xl bg-elevated/10 border border-border mb-8">
              <button
                onClick={() => setBookingMode('in-person')}
                className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${
                  bookingMode === 'in-person' ? 'bg-brand-ember text-white shadow-lg' : 'text-secondary-text hover:text-primary-text'
                }`}
              >
                Local Insider
              </button>
              <button
                onClick={() => setBookingMode('self')}
                className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${
                  bookingMode === 'self' ? 'bg-brand-ember text-white shadow-lg' : 'text-secondary-text hover:text-primary-text'
                }`}
              >
                Self Explore
              </button>
            </div>

            <div className="flex items-center justify-between mb-8">
               <div>
                 <p className="text-sm text-secondary-text font-bold uppercase tracking-widest mb-1">
                   {bookingMode === 'in-person' ? 'Expert Led' : 'Digital Guide'}
                 </p>
                 <h3 className="text-2xl font-bold text-primary-text leading-tight">
                   {bookingMode === 'in-person' ? 'Match with a Local' : 'Digital Guidebook'}
                 </h3>
                 {bookingMode === 'in-person' && (
                   <div className="flex items-center gap-1.5 mt-2">
                     <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                     <p className="text-[10px] font-bold text-green-500 uppercase tracking-wider">Usually responds in 2h</p>
                   </div>
                 )}
               </div>
               <div className="text-right">
                  <span className="text-3xl font-bold text-brand-ember">
                    {bookingMode === 'self' ? 'Free' : formatPrice(gem?.price || 0)}
                  </span>
                  {bookingMode === 'in-person' && <p className="text-[10px] text-secondary-text font-bold uppercase">PER PERSON</p>}
               </div>
            </div>

            {bookingMode === 'in-person' ? (
              <div className="space-y-4 mb-8">
                <p className="text-xs font-bold text-secondary-text uppercase tracking-widest">Matched Guides in {gem.location.city || 'this area'}</p>
                {guides.map(guide => (
                  <button
                    key={guide.uid}
                    onClick={() => setSelectedGuide(guide.uid)}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all border-2 ${
                      selectedGuide === guide.uid 
                      ? 'bg-brand-ember/10 border-brand-ember' 
                      : 'bg-elevated/10 border-transparent hover:bg-elevated/20'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-full bg-brand-ember flex items-center justify-center text-white font-bold text-lg shadow-lg">
                      {guide.displayName?.[0] || 'G'}
                    </div>
                    <div className="flex-1 text-left">
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-primary-text">{guide.displayName}</p>
                        <span className="text-[10px] font-bold text-brand-ember bg-brand-ember/10 px-2 py-0.5 rounded-md uppercase tracking-tighter">Pro</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Star size={12} className="fill-brand-ember text-brand-ember" />
                        <span className="text-xs text-secondary-text">{(Number(guide.rating) || 5).toFixed(1)} · 98% Response</span>
                      </div>
                    </div>
                  </button>
                ))}
                {/* Predictive Trust & Urgency */}
                <div className="mt-4 space-y-3">
                   <div className="p-3 rounded-2xl bg-green-500/5 border border-green-500/10 flex items-center gap-3">
                      <Star size={16} className="text-green-500" />
                      <p className="text-[11px] text-secondary-text font-medium leading-tight">
                        <b>Highly Rated:</b> 94% of travelers would book this expert again.
                      </p>
                   </div>
                   <div className="p-3 rounded-2xl bg-brand-ember/5 border border-brand-ember/10 flex items-center gap-3">
                      <Clock size={16} className="text-brand-ember" />
                      <p className="text-[11px] text-secondary-text font-medium leading-tight">
                        <b>Last Slot:</b> Only 1 opening left for this session today.
                      </p>
                   </div>
                </div>
              </div>
            ) : (
              <div className="p-6 rounded-3xl bg-elevated/10 border border-border mb-8">
                <p className="text-sm text-secondary-text leading-relaxed">
                  Get instant access to coordinates, local tips, and history. Explore at your own pace without a guide.
                </p>
              </div>
            )}

            <button
              onClick={handleBooking}
              disabled={bookingStatus === 'booking' || bookingStatus === 'success'}
              className="w-full py-5 rounded-[22px] bg-brand-ember text-white font-bold text-lg transition-all hover:bg-brand-sienna hover:scale-[1.02] active:scale-95 disabled:opacity-50 shadow-lg shadow-brand-ember/20 flex items-center justify-center gap-3"
            >
              {bookingStatus === 'booking' ? (
                <>
                  <Loader2 className="animate-spin" />
                  Requesting...
                </>
              ) : bookingStatus === 'success' ? (
                <>
                  <CheckCircle />
                  Request Sent
                </>
              ) : bookingStatus === 'not-supported' ? (
                <>
                  <X size={20} />
                  Payment not supported rn
                </>
              ) : (
                <>
                  <Sparkles size={20} className="text-white/80" />
                  {bookingMode === 'in-person' ? 'Match with Guide' : 'Unlock Guidebook'}
                </>
              )}
            </button>
            <p className="text-center text-[10px] text-secondary-text mt-4 px-4">
              Secure escrow: Payment only released after the session is complete.
            </p>

            {/* Decision Clarity: What Happens Next */}
            <div className="mt-8 pt-8 border-t border-border space-y-6">
              <h4 className="text-xs font-bold text-primary-text uppercase tracking-widest text-center">How it works</h4>
              <div className="space-y-4">
                {[
                  { step: 1, text: "Send a free match request", sub: "Takes 10 seconds, no payment yet." },
                  { step: 2, text: "Guide confirms details", sub: "Usually within 2 hours." },
                  { step: 3, text: "Meet & pay securely", sub: "Explore with confidence." }
                ].map((item) => (
                  <div key={item.step} className="flex gap-4">
                    <div className="w-6 h-6 rounded-full bg-elevated/10 border border-border flex items-center justify-center text-[10px] font-bold text-brand-ember flex-shrink-0">
                      {item.step}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-primary-text">{item.text}</p>
                      <p className="text-[10px] text-secondary-text">{item.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {bookingStatus === 'success' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--overlay-bg)] backdrop-blur-md animate-in fade-in">
          <div className="max-w-md w-full bg-card border border-border rounded-[40px] p-10 text-center shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-ember to-brand-sienna" />
            <div className="w-20 h-20 rounded-3xl bg-green-500/20 flex items-center justify-center mx-auto mb-8 text-green-500">
              <PartyPopper size={40} />
            </div>
            <h3 className="text-3xl font-bold mb-4 text-primary-text">Request Sent!</h3>
            <p className="text-secondary-text mb-8">
              Your match request for <span className="font-bold text-primary-text">{gem.title}</span> has been sent to our local experts. They'll reach out to finalize your itinerary!
            </p>
            <button
              onClick={() => setBookingStatus('idle')}
              className="w-full py-4 rounded-2xl bg-elevated/10 hover:bg-elevated/20 transition-all font-bold"
            >
              Back to Gem
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
