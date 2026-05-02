'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { collection, query, where, orderBy, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  CheckCircle, 
  XCircle, 
  User, 
  MessageSquare, 
  MoreVertical,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { getTimeAgo } from '@/lib/utils';

export default function BookingsPage() {
  const { firebaseUser } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (firebaseUser) {
      loadBookings();
    }
  }, [firebaseUser]);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, 'bookings'),
        where('userId', '==', firebaseUser?.uid),
        orderBy('createdAt', 'desc')
      );
      const snap = await getDocs(q);
      setBookings(snap.docs.map(d => ({ ...d.data(), id: d.id })));
    } catch (err) {
      console.error('Error loading bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this request?')) return;
    try {
      await updateDoc(doc(db, 'bookings', id), {
        status: 'cancelled',
        updatedAt: new Date().toISOString()
      });
      loadBookings();
    } catch (err) {
      console.error('Cancellation failed:', err);
    }
  };

  if (loading) return (
    <div className="max-w-[1280px] mx-auto px-4 py-12 space-y-6">
      <div className="h-12 w-48 bg-surface/50 rounded-full animate-pulse" />
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="h-32 bg-surface/50 rounded-[32px] animate-pulse" />
      ))}
    </div>
  );

  return (
    <div className="max-w-[1280px] mx-auto px-4 lg:px-6 py-12 animate-fade-in pb-32">
      <div className="mb-12">
        <h1 className="text-4xl lg:text-display font-bold text-primary-text mb-2">My Adventures</h1>
        <p className="text-secondary-text">Track your upcoming local experiences and match requests.</p>
      </div>

      {bookings.length === 0 ? (
        <div className="text-center py-24 bg-card rounded-[40px] border border-border">
          <div className="w-20 h-20 bg-brand-ember/10 rounded-full flex items-center justify-center mx-auto mb-6 text-brand-ember">
            <Calendar size={40} />
          </div>
          <h2 className="text-2xl font-bold text-primary-text mb-2">No bookings yet</h2>
          <p className="text-secondary-text mb-8 max-w-sm mx-auto">Discover hidden gems and connect with local insiders to start your journey.</p>
          <button 
            onClick={() => window.location.href = '/explore'}
            className="px-8 py-4 rounded-2xl bg-brand-ember text-white font-bold transition-all hover:scale-105 shadow-lg shadow-brand-ember/20"
          >
            Explore Gems
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {bookings.map(booking => (
            <div 
              key={booking.id}
              className="bg-card rounded-[32px] border border-border p-6 lg:p-8 flex flex-col lg:flex-row gap-8 items-center group transition-all hover:border-brand-ember/30 shadow-xl"
            >
              {/* Gem Thumbnail Placeholder */}
              <div className="w-full lg:w-48 aspect-square lg:aspect-video rounded-2xl bg-elevated flex items-center justify-center relative overflow-hidden flex-shrink-0 border border-border">
                <MapPin className="text-brand-ember/20" size={40} />
                <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md text-[10px] font-bold text-white border border-white/10 uppercase tracking-widest">
                  {booking.mode}
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 space-y-2 text-center lg:text-left">
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mb-1">
                  <h3 className="text-2xl font-bold text-primary-text">{booking.gemTitle}</h3>
                  <span className={`px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                    booking.status === 'confirmed' ? 'bg-green-500/10 border-green-500/30 text-green-500' :
                    booking.status === 'pending' ? 'bg-brand-ember/10 border-brand-ember/30 text-brand-ember' :
                    'bg-elevated border-border text-secondary-text'
                  }`}>
                    {booking.status}
                  </span>
                </div>
                
                <div className="flex flex-wrap justify-center lg:justify-start gap-4 text-sm text-secondary-text">
                  <div className="flex items-center gap-1.5">
                    <User size={16} className="text-brand-ember" />
                    <span>Guide: <b>{booking.guideName}</b></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock size={16} className="text-brand-ember" />
                    <span>{getTimeAgo(new Date(booking.bookingDate))}</span>
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-center lg:justify-start gap-3">
                   {booking.status === 'pending' && (
                     <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-ember/5 border border-brand-ember/10 text-brand-ember text-xs font-bold animate-pulse">
                        <AlertCircle size={14} /> Waiting for guide to accept
                     </div>
                   )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-row lg:flex-col gap-3 w-full lg:w-auto">
                <button 
                  className="flex-1 lg:flex-none px-6 py-3 rounded-2xl bg-elevated/10 border border-border text-sm font-bold text-primary-text hover:bg-elevated/20 transition-all flex items-center justify-center gap-2"
                >
                  <MessageSquare size={16} />
                  Message
                </button>
                {booking.status === 'pending' && (
                  <button 
                    onClick={() => cancelBooking(booking.id)}
                    className="flex-1 lg:flex-none px-6 py-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-sm font-bold text-red-500 hover:bg-red-500/20 transition-all flex items-center justify-center gap-2"
                  >
                    <XCircle size={16} />
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
