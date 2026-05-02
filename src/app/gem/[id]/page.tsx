"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc, collection, getDocs, query, where, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Star, MapPin, Clock, ArrowLeft, Heart, Share2, CheckCircle, Backpack, Calendar, ChevronLeft, ChevronRight, Loader2, PartyPopper } from 'lucide-react';
import Link from 'next/link';
import type { Gem, Guide } from '@/lib/types';
import { SEED_GEMS, SEED_GUIDES } from '@/lib/seed';
import { useAuth } from '@/lib/auth-context';
import { createBooking } from '@/app/actions/booking';

export default function GemDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, userData } = useAuth();
  const [gem, setGem] = useState<Gem | null>(null);
  const [guides, setGuides] = useState<(Guide & { displayName?: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPhoto, setCurrentPhoto] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [bookingStatus, setBookingStatus] = useState<'idle' | 'booking' | 'success' | 'error'>('idle');
  const [selectedGuide, setSelectedGuide] = useState<string | null>(null);

  useEffect(() => {
    if (params?.id) {
      loadGem();
    }
  }, [params?.id]);

  const loadGem = async () => {
    setLoading(true);
    try {
      const gemDoc = await getDoc(doc(db, 'gems', params.id as string));
      let gemData: Gem | null = null;
      
      if (gemDoc.exists()) {
        gemData = { ...gemDoc.data(), id: gemDoc.id } as Gem;
      } else {
        const seedGem = SEED_GEMS.find(g => g.id === params.id);
        if (seedGem) gemData = seedGem as unknown as Gem;
      }
      
      setGem(gemData);

      // Smart Matching: Find guides in the same city
      if (gemData?.location.city) {
        const guidesQuery = query(
          collection(db, 'guides'),
          where('city', '==', gemData.location.city),
          limit(5)
        );
        const guideSnap = await getDocs(guidesQuery);
        if (!guideSnap.empty) {
          setGuides(guideSnap.docs.map(d => ({ ...d.data(), uid: d.id } as Guide)));
        } else {
          // Fallback to random seed guides if no city match in DB
          setGuides(SEED_GUIDES.slice(0, 3) as unknown as Guide[]);
        }
      }
    } catch (err) {
      console.error("Load error:", err);
      const seedGem = SEED_GEMS.find(g => g.id === params.id);
      if (seedGem) setGem(seedGem as unknown as Gem);
      setGuides(SEED_GUIDES.slice(0, 3) as unknown as Guide[]);
    } finally {
      setLoading(false);
    }
  };

  const [bookingMode, setBookingMode] = useState<'self' | 'in-person'>('in-person');

  const handleBooking = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (bookingMode === 'in-person' && !selectedGuide && guides.length > 0) {
      alert('Please select a guide first');
      return;
    }

    setBookingStatus('booking');
    
    // For self-guided, we don't need a specific guide
    const guide = bookingMode === 'self' 
      ? { uid: 'system', displayName: 'Self Guided' }
      : (guides.find(g => g.uid === selectedGuide) || guides[0]);
    
    const result = await createBooking({
      userId: user.uid,
      userName: userData?.displayName || 'Traveler',
      guideId: guide.uid,
      guideName: guide.displayName || 'Local Expert',
      gemId: gem!.id,
      gemTitle: gem!.title,
      bookingDate: new Date().toISOString(),
      status: 'pending',
      mode: bookingMode,
      paymentStatus: 'pending',
      price: bookingMode === 'self' ? 0 : (gem!.price || 0),
      identityConfirmedTraveler: false,
      identityConfirmedGuide: false,
      locationShared: false,
      sosTriggered: false
    });

    if (result.success) {
      setBookingStatus('success');
    } else {
      setBookingStatus('error');
    }
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
        <div
          className="w-full h-full bg-cover bg-center transition-all duration-700"
          style={{ backgroundImage: `url(${gem.photos[currentPhoto]})`, backgroundColor: 'var(--surface)' }}
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
              onClick={() => setIsSaved(!isSaved)}
              className="p-3 rounded-2xl glass transition-all hover:scale-110 active:scale-95"
            >
              <Heart size={20} className={isSaved ? 'fill-brand-ember text-brand-ember' : 'text-white'} />
            </button>
            <button className="p-3 rounded-2xl glass transition-all hover:scale-110 active:scale-95">
              <Share2 size={20} className="text-white" />
            </button>
          </div>
        </div>

        {/* Info Overlay */}
        <div className="absolute bottom-10 left-10 right-10">
           <div className="flex gap-2 mb-4">
            {gem.vibes.map(vibe => (
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
          <div className="flex items-center gap-6 mb-8 p-6 rounded-3xl bg-dark-surface border border-dark-border">
            <div className="text-center border-r border-dark-border pr-6">
              <div className="flex items-center gap-1 justify-center mb-1">
                <Star size={20} className="fill-brand-ember text-brand-ember" />
                <span className="text-2xl font-bold text-dark-primary-text">{gem.rating}</span>
              </div>
              <p className="text-xs text-dark-secondary-text uppercase tracking-widest font-bold">{gem.reviewCount} Reviews</p>
            </div>
            
            <div className="flex-1">
               <div className="flex items-center gap-3 text-brand-ember mb-1">
                <CheckCircle size={18} />
                <span className="font-bold">Verified Roamly Gem</span>
               </div>
               <p className="text-sm text-dark-secondary-text">Hand-picked and verified by our local curation team.</p>
            </div>
          </div>

          <div className="mb-12">
            <h2 className="text-3xl font-bold mb-6 text-dark-primary-text">Authentic Local Experience</h2>
            <p className="text-lg leading-relaxed text-dark-secondary-text mb-8">
              {gem.description}
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="p-6 rounded-3xl bg-dark-surface border border-dark-border group hover:border-brand-ember/30 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-brand-ember/10 flex items-center justify-center text-brand-ember mb-4 group-hover:scale-110 transition-transform">
                  <Clock size={24} />
                </div>
                <h4 className="font-bold text-dark-primary-text mb-1">Perfect Timing</h4>
                <p className="text-sm text-dark-secondary-text">{gem.bestTime?.timeOfDay} · {gem.bestTime?.season}</p>
              </div>

              <div className="p-6 rounded-3xl bg-dark-surface border border-dark-border group hover:border-brand-ember/30 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-brand-ember/10 flex items-center justify-center text-brand-ember mb-4 group-hover:scale-110 transition-transform">
                  <Backpack size={24} />
                </div>
                <h4 className="font-bold text-dark-primary-text mb-1">Preparation</h4>
                <p className="text-sm text-dark-secondary-text">{gem.whatToBring?.join(', ') || 'Just your curiosity'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Matching Sidebar */}
        <div className="lg:col-span-1">
          <div className="rounded-[40px] p-8 sticky top-24 bg-dark-surface border border-dark-border shadow-xl">
            {/* Mode Selector */}
            <div className="flex p-1.5 rounded-2xl bg-white/5 border border-white/5 mb-8">
              <button
                onClick={() => setBookingMode('in-person')}
                className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${
                  bookingMode === 'in-person' ? 'bg-brand-ember text-white shadow-lg' : 'text-dark-secondary-text hover:text-dark-primary-text'
                }`}
              >
                Local Insider
              </button>
              <button
                onClick={() => setBookingMode('self')}
                className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${
                  bookingMode === 'self' ? 'bg-brand-ember text-white shadow-lg' : 'text-dark-secondary-text hover:text-dark-primary-text'
                }`}
              >
                Self Explore
              </button>
            </div>

            <div className="flex items-center justify-between mb-8">
               <div>
                 <p className="text-sm text-dark-secondary-text font-bold uppercase tracking-widest mb-1">
                   {bookingMode === 'in-person' ? 'Expert Led' : 'Digital Guide'}
                 </p>
                 <h3 className="text-2xl font-bold text-dark-primary-text">
                   {bookingMode === 'in-person' ? 'Match with a Local' : 'Explore Privately'}
                 </h3>
               </div>
                  <span className="text-3xl font-bold text-brand-ember">
                    {bookingMode === 'self' ? 'Free' : `$${(gem.price / 100).toFixed(0)}`}
                  </span>
                  {bookingMode === 'in-person' && <p className="text-[10px] text-dark-secondary-text font-bold uppercase">PER PERSON</p>}
               </div>
            </div>

            {bookingMode === 'in-person' ? (
              <div className="space-y-4 mb-8">
                <p className="text-xs font-bold text-dark-secondary-text uppercase tracking-widest">Matched Guides in {gem.location.city || 'this area'}</p>
                {guides.map(guide => (
                  <button
                    key={guide.uid}
                    onClick={() => setSelectedGuide(guide.uid)}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all border-2 ${
                      selectedGuide === guide.uid 
                      ? 'bg-brand-ember/10 border-brand-ember' 
                      : 'bg-white/5 border-transparent hover:bg-white/10'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-full bg-brand-ember flex items-center justify-center text-white font-bold text-lg shadow-lg">
                      {guide.displayName?.[0] || 'G'}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-bold text-dark-primary-text">{guide.displayName}</p>
                      <div className="flex items-center gap-2">
                        <Star size={12} className="fill-brand-ember text-brand-ember" />
                        <span className="text-xs text-dark-secondary-text">{guide.rating} · Local Expert</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-6 rounded-3xl bg-white/5 border border-white/5 mb-8">
                <p className="text-sm text-dark-secondary-text leading-relaxed">
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
              ) : (
                'Request to Book'
              )}
            </button>
            <p className="text-center text-[10px] text-dark-secondary-text mt-4 px-4">
              No immediate payment required. Your guide will contact you within 24 hours to confirm details.
            </p>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {bookingStatus === 'success' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="max-w-md w-full bg-dark-surface border border-dark-border rounded-[40px] p-10 text-center shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-ember to-brand-sienna" />
            <div className="w-20 h-20 rounded-3xl bg-green-500/20 flex items-center justify-center mx-auto mb-8 text-green-500">
              <PartyPopper size={40} />
            </div>
            <h3 className="text-3xl font-bold mb-4 text-dark-primary-text">Request Sent!</h3>
            <p className="text-dark-secondary-text mb-8">
              Your match request for **{gem.title}** has been sent to our local experts. They'll reach out to finalize your itinerary!
            </p>
            <button
              onClick={() => setBookingStatus('idle')}
              className="w-full py-4 rounded-2xl bg-white/10 hover:bg-white/20 transition-all font-bold"
            >
              Back to Gem
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
