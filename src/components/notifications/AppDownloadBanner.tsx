'use client';

import React from 'react';
import { Smartphone, Download, ShieldCheck, X } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export default function AppDownloadBanner() {
  const { userData } = useAuth();
  const [isVisible, setIsVisible] = React.useState(true);

  if (!isVisible || !userData) return null;

  return (
    <div className="fixed bottom-24 lg:bottom-8 left-4 right-4 lg:left-auto lg:right-8 lg:w-[400px] z-40 animate-slide-up">
      <div className="glass rounded-[32px] p-6 border border-white/10 shadow-2xl relative overflow-hidden group">
        {/* Glow effect */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-brand-ember/20 blur-[60px] rounded-full group-hover:bg-brand-ember/30 transition-all duration-700" />
        
        <button 
          onClick={() => setIsVisible(false)}
          className="absolute top-4 right-4 p-1 hover:bg-white/10 rounded-full transition-colors text-dark-secondary-text"
        >
          <X size={16} />
        </button>

        <div className="flex gap-5">
          <div className="w-14 h-14 rounded-2xl bg-brand-ember/10 flex items-center justify-center text-brand-ember flex-shrink-0">
            <Smartphone size={32} />
          </div>
          
          <div className="flex-1">
            <h4 className="font-bold text-dark-primary-text mb-1">
              {userData.role === 'guide' ? 'Verify Your Identity' : 'Ready to Travel?'}
            </h4>
            <p className="text-sm text-dark-secondary-text leading-relaxed mb-4">
              {userData.role === 'guide' 
                ? 'Guides are required to verify their phone number via the Roamly app before listings go live.' 
                : 'Download the app to access real-time SOS features and SOS contact sharing during your trip.'}
            </p>
            
            <div className="flex gap-3">
              <a 
                href="/downloads/roamly-v1.apk" 
                className="flex-1 py-3 px-4 rounded-xl bg-brand-ember hover:bg-brand-sienna text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand-ember/20"
              >
                <Download size={14} />
                Download APK
              </a>
              <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 border border-white/5 text-[10px] font-bold text-brand-ember uppercase tracking-wider">
                <ShieldCheck size={12} />
                Secure
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
