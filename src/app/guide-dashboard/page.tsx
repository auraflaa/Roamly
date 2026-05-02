'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { collection, query, where, orderBy, getDocs, doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  MapPin, 
  User, 
  ChevronRight, 
  LayoutDashboard, 
  PlusCircle, 
  MessageSquare,
  ShieldAlert,
  Loader2,
  Calendar
} from 'lucide-react';
import { getTimeAgo } from '@/lib/utils';
import Link from 'next/link';

export default function GuideDashboard() {
  const { firebaseUser, userData } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ pending: 0, active: 0, completed: 0 });

  useEffect(() => {
    if (firebaseUser && userData?.role === 'guide') {
      const q = query(
        collection(db, 'bookings'),
        where('guideId', '==', firebaseUser.uid),
        orderBy('createdAt', 'desc')
      );

      const unsubscribe = onSnapshot(q, (snap) => {
        const docs = snap.docs.map(d => ({ ...d.data() as any, id: d.id }));
        setBookings(docs);
        setStats({
          pending: docs.filter(d => d.status === 'pending').length,
          active: docs.filter(d => d.status === 'confirmed').length,
          completed: docs.filter(d => d.status === 'completed').length
        });
        setLoading(false);
      });

      return () => unsubscribe();
    }
  }, [firebaseUser, userData]);

  const updateStatus = async (id: string, status: string) => {
    try {
      await updateDoc(doc(db, 'bookings', id), {
        status,
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      console.error('Update failed:', err);
    }
  };

  if (!userData || userData.role !== 'guide') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <ShieldAlert size={64} className="text-brand-ember mb-6" />
        <h2 className="text-3xl font-bold text-primary-text mb-2">Access Restricted</h2>
        <p className="text-secondary-text mb-8 max-w-md">Only verified local insiders can access the command center. If you want to become a guide, please register first.</p>
        <Link href="/guide-registration" className="px-8 py-4 rounded-2xl bg-brand-ember text-white font-bold transition-all hover:scale-105">
          Become a Guide
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[1280px] mx-auto px-4 lg:px-6 py-12 animate-fade-in pb-32">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h1 className="text-4xl lg:text-display font-bold text-primary-text mb-2">Command Center</h1>
          <p className="text-secondary-text flex items-center gap-2">
            Welcome back, <b className="text-brand-ember">{userData.displayName}</b>. Here are your latest match requests.
          </p>
        </div>
        <Link 
          href="/guide-registration/add-gem" 
          className="px-6 py-4 rounded-2xl bg-brand-ember hover:bg-brand-sienna text-white font-bold transition-all flex items-center gap-2 shadow-lg shadow-brand-ember/20"
        >
          <PlusCircle size={20} />
          Create New Gem
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
        {[
          { label: 'Pending Requests', value: stats.pending, icon: Clock, color: 'text-brand-ember' },
          { label: 'Active Sessions', value: stats.active, icon: MapPin, color: 'text-green-500' },
          { label: 'Completed Tours', value: stats.completed, icon: CheckCircle, color: 'text-blue-500' }
        ].map((s, i) => (
          <div key={i} className="bg-card rounded-[32px] p-6 border border-border flex items-center gap-6 shadow-xl relative overflow-hidden group">
            <div className={`w-14 h-14 rounded-2xl bg-elevated/10 flex items-center justify-center ${s.color} group-hover:scale-110 transition-transform`}>
              <s.icon size={28} />
            </div>
            <div>
              <p className="text-xs font-bold text-secondary-text uppercase tracking-widest">{s.label}</p>
              <h3 className="text-3xl font-bold text-primary-text">{s.value}</h3>
            </div>
            {/* Decoration */}
            <div className={`absolute top-0 right-0 w-24 h-full bg-gradient-to-l from-brand-ember/5 to-transparent`} />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Feed: Booking Requests */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-2xl font-bold text-primary-text flex items-center gap-3">
            Active Requests
            {stats.pending > 0 && <span className="px-3 py-1 rounded-full bg-brand-ember text-white text-[10px] font-bold animate-pulse">{stats.pending} NEW</span>}
          </h2>

          {loading ? (
             <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 size={40} className="text-brand-ember animate-spin" />
                <p className="text-secondary-text">Loading match requests...</p>
             </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-24 bg-card rounded-[40px] border border-border opacity-60">
              <Calendar size={48} className="mx-auto mb-6 text-secondary-text" />
              <p className="text-lg font-bold text-secondary-text">No active requests found.</p>
              <p className="text-sm text-secondary-text">Your gems are live! We'll notify you when a traveler matches.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {bookings.map(booking => (
                <div key={booking.id} className="bg-card rounded-[32px] border border-border p-6 lg:p-8 flex flex-col sm:flex-row gap-6 items-center shadow-xl group transition-all hover:border-brand-ember/30">
                  <div className="w-16 h-16 rounded-2xl bg-brand-ember flex items-center justify-center text-white text-2xl font-bold flex-shrink-0 shadow-lg">
                    {booking.userName[0]}
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mb-1">
                       <h4 className="text-xl font-bold text-primary-text">{booking.userName}</h4>
                       <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                         booking.status === 'pending' ? 'bg-brand-ember/10 text-brand-ember border border-brand-ember/20' : 'bg-green-500/10 text-green-500 border border-green-500/20'
                       }`}>
                         {booking.status}
                       </span>
                    </div>
                    <p className="text-sm text-secondary-text mb-4">Wants to explore <b>{booking.gemTitle}</b> · {booking.mode}</p>
                    <div className="flex items-center justify-center sm:justify-start gap-4 text-xs text-secondary-text">
                      <span className="flex items-center gap-1.5"><Clock size={14} /> {getTimeAgo(new Date(booking.createdAt?.toDate?.() || booking.createdAt))}</span>
                      <span className="flex items-center gap-1.5"><User size={14} /> ID Verified</span>
                    </div>
                  </div>
                  <div className="flex gap-3 w-full sm:w-auto">
                    {booking.status === 'pending' ? (
                      <>
                        <button 
                          onClick={() => updateStatus(booking.id, 'confirmed')}
                          className="flex-1 sm:flex-none px-6 py-3 rounded-xl bg-brand-ember hover:bg-brand-sienna text-white font-bold transition-all text-sm flex items-center justify-center gap-2"
                        >
                          <CheckCircle size={16} /> Accept
                        </button>
                        <button 
                          onClick={() => updateStatus(booking.id, 'cancelled')}
                          className="flex-1 sm:flex-none px-6 py-3 rounded-xl bg-elevated/10 hover:bg-elevated/20 text-primary-text font-bold transition-all text-sm flex items-center justify-center gap-2 border border-border"
                        >
                          <XCircle size={16} /> Decline
                        </button>
                      </>
                    ) : (
                      <button className="flex-1 sm:flex-none px-6 py-3 rounded-xl bg-elevated/10 hover:bg-elevated/20 text-brand-ember font-bold transition-all text-sm flex items-center justify-center gap-2 border border-border">
                        <MessageSquare size={16} /> Message
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar: Tips & Performance */}
        <div className="lg:col-span-1 space-y-8">
           <div className="p-8 rounded-[40px] bg-card border border-border shadow-xl">
             <h3 className="text-xl font-bold text-primary-text mb-6">Local Insight Tips</h3>
             <div className="space-y-6">
                <div className="p-4 rounded-2xl bg-brand-ember/5 border border-brand-ember/10">
                  <p className="text-xs font-bold text-brand-ember uppercase tracking-widest mb-1">Growth Hack</p>
                  <p className="text-sm text-secondary-text">Update your gem photos to increase match rates by 40%.</p>
                </div>
                <div className="p-4 rounded-2xl bg-elevated/10 border border-border">
                  <p className="text-xs font-bold text-secondary-text uppercase tracking-widest mb-1">Security Reminder</p>
                  <p className="text-sm text-secondary-text">Always verify the traveler's phone ID via the Roamly app before meeting.</p>
                </div>
             </div>
           </div>

           <div className="p-8 rounded-[40px] bg-gradient-to-br from-brand-ember/20 to-brand-sienna/20 border border-brand-ember/20">
             <h4 className="text-brand-ember font-bold mb-2">Need Help?</h4>
             <p className="text-sm text-secondary-text mb-6 leading-relaxed">Our curation team is here to help you optimize your listings or handle disputes.</p>
             <button className="w-full py-4 rounded-2xl bg-brand-ember text-white font-bold hover:bg-brand-sienna transition-all shadow-lg shadow-brand-ember/20">
                Contact Support
             </button>
           </div>
        </div>
      </div>
    </div>
  );
}
