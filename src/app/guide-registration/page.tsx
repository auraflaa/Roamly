'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Map, Upload, ArrowRight, Camera } from 'lucide-react';
import type { Guide } from '@/lib/types';

export default function GuideRegistrationPage() {
  const { userData } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    bio: '',
    city: '',
    languages: [{ language: 'English', proficiency: 'fluent' as const }],
    specialties: [] as string[],
  });

  // Basic client-side protection
  if (!userData) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p>Please sign in first.</p>
      </div>
    );
  }

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const guideData: Partial<Guide> = {
        uid: userData.uid,
        bio: formData.bio,
        city: formData.city,
        languages: formData.languages,
        specialties: formData.specialties,
        verificationStatus: 'pending',
        rating: 5.0,
        reviewCount: 0,
        responseRate: 100,
        isFemale: userData.isFemale || false,
        isOnline: true,
        availability: {},
        earningsBalance: 0,
        trainingCompleted: false,
      };

      await setDoc(doc(db, 'guides', userData.uid), guideData);
      
      // Update user role if needed
      if (userData.role !== 'guide') {
        await setDoc(doc(db, 'users', userData.uid), { role: 'guide' }, { merge: true });
      }

      setStep(3); // Go to success step
    } catch (err) {
      console.error(err);
      alert('Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[768px] mx-auto px-4 py-12 animate-fade-in">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-6">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 1 ? 'bg-brand-ember text-white' : 'bg-black/10 text-black/40'}`}>1</div>
          <div className={`flex-1 h-1 rounded-full ${step >= 2 ? 'bg-brand-ember' : 'bg-black/10'}`} />
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 2 ? 'bg-brand-ember text-white' : 'bg-black/10 text-black/40'}`}>2</div>
          <div className={`flex-1 h-1 rounded-full ${step >= 3 ? 'bg-brand-ember' : 'bg-black/10'}`} />
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 3 ? 'bg-brand-ember text-white' : 'bg-black/10 text-black/40'}`}>3</div>
        </div>
      </div>

      <div className="rounded-[22px] p-6 lg:p-8" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        {step === 1 && (
          <div className="animate-slide-up">
            <h2 className="text-h1 mb-2" style={{ color: 'var(--primary-text)' }}>Tell us about yourself</h2>
            <p className="text-body mb-6" style={{ color: 'var(--secondary-text)' }}>This helps travelers get to know you better.</p>

            <div className="space-y-4">
              <div>
                <label className="text-label block mb-2" style={{ color: 'var(--secondary-text)' }}>Where are you based?</label>
                <div className="relative">
                  <Map size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--secondary-text)' }} />
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                    placeholder="e.g. Jaipur, India"
                    className="w-full h-12 pl-11 pr-4 rounded-xl text-sm outline-none focus-ring"
                    style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--primary-text)' }}
                  />
                </div>
              </div>

              <div>
                <label className="text-label block mb-2" style={{ color: 'var(--secondary-text)' }}>Your Bio</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Share your story, your connection to the city, and why you love showing people around..."
                  rows={4}
                  className="w-full p-4 rounded-xl text-sm outline-none focus-ring resize-none"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--primary-text)' }}
                />
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={!formData.city || !formData.bio}
                className="w-full h-12 rounded-full bg-brand-ember text-white font-medium flex items-center justify-center gap-2 mt-6 disabled:opacity-50 transition-all hover:bg-brand-sienna"
              >
                Continue <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-slide-up">
            <h2 className="text-h1 mb-2" style={{ color: 'var(--primary-text)' }}>Verify your identity</h2>
            <p className="text-body mb-6" style={{ color: 'var(--secondary-text)' }}>Safety is our top priority. Please provide a government-issued ID.</p>

            <div className="space-y-4 mb-8">
              <div className="border-2 border-dashed rounded-xl p-8 text-center transition-colors hover:bg-black/5 cursor-pointer" style={{ borderColor: 'var(--border)' }}>
                <Camera size={32} className="mx-auto mb-3" style={{ color: 'var(--secondary-text)' }} />
                <p className="text-sm font-medium mb-1" style={{ color: 'var(--primary-text)' }}>Upload ID Front</p>
                <p className="text-xs" style={{ color: 'var(--secondary-text)' }}>Passport, Driver's License, or National ID</p>
              </div>
              <div className="border-2 border-dashed rounded-xl p-8 text-center transition-colors hover:bg-black/5 cursor-pointer" style={{ borderColor: 'var(--border)' }}>
                <Camera size={32} className="mx-auto mb-3" style={{ color: 'var(--secondary-text)' }} />
                <p className="text-sm font-medium mb-1" style={{ color: 'var(--primary-text)' }}>Upload ID Back</p>
                <p className="text-xs" style={{ color: 'var(--secondary-text)' }}>If applicable</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="px-6 py-3 rounded-full font-medium"
                style={{ border: '1px solid var(--border)', color: 'var(--primary-text)' }}
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 h-12 rounded-full bg-brand-ember text-white font-medium flex items-center justify-center gap-2 disabled:opacity-50 transition-all hover:bg-brand-sienna"
              >
                {loading ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="text-center py-8 animate-slide-up">
            <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
              <Upload size={32} className="text-green-500" />
            </div>
            <h2 className="text-display mb-3" style={{ color: 'var(--primary-text)' }}>Application Received!</h2>
            <p className="text-body-lg max-w-md mx-auto mb-8" style={{ color: 'var(--secondary-text)' }}>
              Our team will review your application within 48 hours. We'll send you an email once your guide profile is approved.
            </p>
            <button
              onClick={() => router.push('/explore')}
              className="px-8 py-4 rounded-full bg-brand-ember text-white font-medium hover:bg-brand-sienna transition-all"
            >
              Explore Meanwhile
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
