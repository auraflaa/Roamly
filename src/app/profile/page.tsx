'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { Calendar, User, Settings, Star, MapPin, Heart, Shield, LogOut, Check, X } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function ProfilePage() {
  const { userData, loading, signOut, refreshUserData } = useAuth();
  const router = useRouter();
  
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (userData?.displayName) {
      setEditName(userData.displayName);
    }
  }, [userData]);

  if (loading) {
    return <div className="flex justify-center items-center min-h-[60vh]">Loading...</div>;
  }

  if (!userData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <h2 className="text-h2 mb-4" style={{ color: 'var(--primary-text)' }}>Sign in to view your profile</h2>
        <button
          onClick={() => router.push('/login')}
          className="px-6 py-3 rounded-full bg-brand-ember text-white font-medium hover:bg-brand-sienna transition-colors"
        >
          Sign In
        </button>
      </div>
    );
  }

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const handleSaveName = async () => {
    if (!editName.trim() || editName === userData.displayName) {
      setIsEditingName(false);
      return;
    }
    setIsSaving(true);
    try {
      await updateDoc(doc(db, 'users', userData.uid), {
        displayName: editName.trim()
      });
      await refreshUserData();
      setIsEditingName(false);
    } catch (error) {
      console.error('Failed to update name:', error);
      alert('Failed to update name. Check Firestore rules.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-[768px] mx-auto px-4 py-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-20 h-20 rounded-full bg-brand-ember flex items-center justify-center text-white text-3xl font-bold flex-shrink-0 shadow-lg shadow-brand-ember/20">
          {userData.displayName?.[0]?.toUpperCase() || 'U'}
        </div>
        <div>
          <h1 className="text-h1 mb-1" style={{ color: 'var(--primary-text)' }}>{userData.displayName}</h1>
          <p className="text-body" style={{ color: 'var(--secondary-text)' }}>{userData.email}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="px-2 py-0.5 rounded-md text-[10px] font-medium capitalize" style={{
              background: 'var(--color-brand-ember-15)',
              color: 'var(--color-brand-ember)'
            }}>
              {userData.role}
            </span>
          </div>
        </div>
      </div>

      {/* Menu items */}
      <div className="space-y-4">
        <div className="rounded-[16px] overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          {isEditingName ? (
            <div className="w-full flex items-center justify-between p-4" style={{ borderBottom: '1px solid var(--border)' }}>
              <div className="flex items-center gap-3 w-full">
                <User size={20} className="text-brand-ember flex-shrink-0" />
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="flex-1 bg-transparent border-none outline-none text-sm font-medium"
                  style={{ color: 'var(--primary-text)' }}
                  autoFocus
                />
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setIsEditingName(false)} className="p-1 text-secondary-text hover:text-primary-text">
                  <X size={18} />
                </button>
                <button onClick={handleSaveName} disabled={isSaving} className="p-1 text-brand-ember hover:text-brand-sienna">
                  <Check size={18} />
                </button>
              </div>
            </div>
          ) : (
            <button onClick={() => setIsEditingName(true)} className="w-full flex items-center justify-between p-4 transition-colors hover:bg-black/5 dark:hover:bg-white/5" style={{ borderBottom: '1px solid var(--border)' }}>
              <div className="flex items-center gap-3">
                <User size={20} className="text-brand-ember" />
                <span className="text-sm font-medium" style={{ color: 'var(--primary-text)' }}>Personal Information</span>
              </div>
              <span className="text-xs text-brand-ember">Edit</span>
            </button>
          )}
          
          <button className="w-full flex items-center justify-between p-4 transition-colors hover:bg-black/5 dark:hover:bg-white/5" style={{ borderBottom: '1px solid var(--border)' }}>
            <div className="flex items-center gap-3">
              <Shield size={20} className="text-brand-ember" />
              <span className="text-sm font-medium" style={{ color: 'var(--primary-text)' }}>Safety & Identity</span>
            </div>
            <span className="text-secondary-text">›</span>
          </button>

          <button className="w-full flex items-center justify-between p-4 transition-colors hover:bg-black/5 dark:hover:bg-white/5">
            <div className="flex items-center gap-3">
              <Settings size={20} className="text-brand-ember" />
              <span className="text-sm font-medium" style={{ color: 'var(--primary-text)' }}>Preferences</span>
            </div>
            <span className="text-secondary-text">›</span>
          </button>
        </div>

        <div className="rounded-[16px] overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <button className="w-full flex items-center justify-between p-4 transition-colors hover:bg-black/5 dark:hover:bg-white/5" style={{ borderBottom: '1px solid var(--border)' }}>
            <div className="flex items-center gap-3">
              <Heart size={20} className="text-brand-ember" />
              <span className="text-sm font-medium" style={{ color: 'var(--primary-text)' }}>Saved Gems</span>
            </div>
            <span className="text-secondary-text">›</span>
          </button>

          <button className="w-full flex items-center justify-between p-4 transition-colors hover:bg-black/5 dark:hover:bg-white/5" style={{ borderBottom: '1px solid var(--border)' }}>
            <div className="flex items-center gap-3">
              <Star size={20} className="text-brand-ember" />
              <span className="text-sm font-medium" style={{ color: 'var(--primary-text)' }}>My Reviews</span>
            </div>
            <span className="text-secondary-text">›</span>
          </button>

          <button className="w-full flex items-center justify-between p-4 transition-colors hover:bg-black/5 dark:hover:bg-white/5">
            <div className="flex items-center gap-3">
              <MapPin size={20} className="text-brand-ember" />
              <span className="text-sm font-medium" style={{ color: 'var(--primary-text)' }}>My Itineraries</span>
            </div>
            <span className="text-secondary-text">›</span>
          </button>
        </div>

        {userData.role === 'guide' && (
          <button
            onClick={() => router.push('/guide-dashboard')}
            className="w-full flex items-center justify-between p-4 rounded-[16px] transition-all hover:scale-[1.01]"
            style={{ background: 'var(--color-brand-ember-15)', border: '1px solid var(--color-brand-ember-30)' }}
          >
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-brand-ember">Go to Guide Dashboard</span>
            </div>
            <span className="text-brand-ember">›</span>
          </button>
        )}

        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 p-4 rounded-[16px] transition-colors"
          style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--error-text)' }}
        >
          <LogOut size={20} />
          <span className="text-sm font-medium">Sign Out</span>
        </button>
      </div>
    </div>
  );
}
