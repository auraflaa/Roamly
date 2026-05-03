'use client';

import React from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { Users, ShieldAlert, Flag, CheckCircle, Database, Loader2, AlertTriangle, X } from 'lucide-react';
import { seedDatabase } from '@/lib/seed';
import { migrateGemsToBucket, syncPhotosToBucket } from '@/app/actions/migrate';
import { collection, getCountFromServer, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import BucketTest from '@/components/debug/BucketTest';

export default function AdminDashboard() {
  const { userData } = useAuth();
  const router = useRouter();
  const [seeding, setSeeding] = React.useState(false);
  const [syncing, setSyncing] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);
  const [statusMessage, setStatusMessage] = React.useState('');
  const [stats, setStats] = React.useState({ users: 0, pendingGuides: 0, flagged: 0 });
  const [loadingStats, setLoadingStats] = React.useState(true);
  const isMounted = React.useRef(true);

  React.useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  React.useEffect(() => {
    async function fetchStats() {
      try {
        const [usersCount, guidesCount, postsCount] = await Promise.all([
          getCountFromServer(collection(db, 'users')),
          getCountFromServer(query(collection(db, 'guides'), where('verificationStatus', '==', 'pending'))),
          getCountFromServer(query(collection(db, 'community_posts'), where('flagCount', '>', 0)))
        ]);

        if (isMounted.current) {
          setStats({
            users: usersCount.data().count,
            pendingGuides: guidesCount.data().count,
            flagged: postsCount.data().count
          });
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        if (isMounted.current) {
          setLoadingStats(false);
        }
      }
    }
    fetchStats();
  }, []);

  const handleSeed = async () => {
    setSeeding(true);
    setStatusMessage('Seeding database...');
    const success = await seedDatabase();
    if (isMounted.current) {
      setSeeding(false);
      setStatusMessage(success ? 'Database seeded successfully!' : 'Error seeding database.');
      setTimeout(() => {
        if (isMounted.current) setStatusMessage('');
      }, 3000);
    }
  };

  const handleSyncPhotos = async () => {
    setShowConfirm(false);
    setSyncing(true);
    setStatusMessage('Syncing images to Hugging Face bucket...');
    const result = await syncPhotosToBucket();
    if (isMounted.current) {
      setSyncing(true);
      setSyncing(false);
      if (result.success) {
        setStatusMessage(`Sync complete: ${result.photos} images processed across ${result.gems} gems.`);
      } else {
        setStatusMessage(`Sync failed: ${result.error}`);
      }
      setTimeout(() => {
        if (isMounted.current) setStatusMessage('');
      }, 8000);
    }
  };

  if (!userData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
        <ShieldAlert size={48} className="text-brand-ember mb-4" />
        <h2 className="text-h2 mb-2" style={{ color: 'var(--primary-text)' }}>Access Denied</h2>
        <p className="text-body mb-6" style={{ color: 'var(--secondary-text)' }}>Please sign in to access admin tools.</p>
        <button onClick={() => router.push('/login')} className="px-6 py-3 rounded-full bg-brand-ember text-white font-medium hover:bg-brand-sienna transition-colors">
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-[1280px] mx-auto px-4 lg:px-6 py-12 animate-in fade-in duration-700">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-5xl font-bold mb-3 tracking-tight bg-gradient-to-r from-brand-ember to-brand-sienna bg-clip-text text-transparent">
          Command Center
        </h1>
        <p className="text-lg text-secondary-text max-w-2xl">
          Core infrastructure management, content moderation, and system-wide operations.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        {[
          { icon: CheckCircle, label: 'Pending Approvals', value: stats.pendingGuides, color: 'text-orange-500', bg: 'bg-orange-500/10' },
          { icon: Flag, label: 'Flagged Content', value: stats.flagged, color: 'text-red-500', bg: 'bg-red-500/10' },
          { icon: Users, label: 'Active Travelers', value: stats.users.toLocaleString(), color: 'text-blue-500', bg: 'bg-blue-500/10' },
        ].map((stat, i) => (
          <div key={i} className="relative group p-8 rounded-[32px] bg-surface border border-border hover:border-brand-ember/30 transition-all duration-300">
            <div className={`w-14 h-14 rounded-2xl ${stat.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
              <stat.icon size={28} className={stat.color} />
            </div>
            <h3 className="text-4xl font-bold text-primary-text mb-1">
              {loadingStats ? <div className="h-10 w-16 bg-elevated/10 rounded animate-pulse" /> : stat.value}
            </h3>
            <p className="text-sm font-semibold text-secondary-text uppercase tracking-widest">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Main Actions Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="rounded-[32px] bg-surface border border-border p-10">
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-3 text-primary-text">
              <Database className="text-brand-ember" size={24} />
              System Operations
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={handleSeed}
                disabled={seeding || syncing}
                className="group p-6 rounded-2xl bg-elevated/5 border border-border hover:bg-elevated/10 hover:border-brand-ember/30 transition-all text-left flex flex-col gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-brand-ember/20 flex items-center justify-center text-brand-ember">
                  {seeding ? <Loader2 size={20} className="animate-spin" /> : <Database size={20} />}
                </div>
                <div>
                  <h4 className="font-bold text-primary-text">Reset & Seed</h4>
                  <p className="text-xs text-secondary-text mt-1">Populate platform with fresh initial data.</p>
                </div>
              </button>

              <button
                onClick={() => setShowConfirm(true)}
                disabled={syncing || seeding}
                className="group p-6 rounded-2xl bg-brand-ember/5 border border-brand-ember/10 hover:bg-brand-ember/10 transition-all text-left flex flex-col gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-brand-ember flex items-center justify-center text-white shadow-lg shadow-brand-ember/20">
                  {syncing ? <Loader2 size={20} className="animate-spin" /> : <ShieldAlert size={20} />}
                </div>
                <div>
                  <h4 className="font-bold text-brand-ember">Sync Bucket</h4>
                  <p className="text-xs text-brand-ember/60 mt-1">Migrate all images to HF Bucket storage.</p>
                </div>
              </button>
            </div>

            {statusMessage && (
              <div className="mt-8 p-4 rounded-xl bg-elevated/5 border border-brand-ember/20 flex items-center gap-3 animate-in slide-in-from-bottom-2">
                <div className="w-2 h-2 rounded-full bg-brand-ember animate-pulse" />
                <p className="text-sm font-medium text-primary-text">{statusMessage}</p>
              </div>
            )}
          </div>

          <div className="rounded-[32px] bg-surface border border-border overflow-hidden">
            <BucketTest />
          </div>
        </div>

        {/* Sidebar Log/Info */}
        <div className="rounded-[32px] bg-surface border border-border p-8 flex flex-col justify-between">
          <div>
            <h4 className="text-lg font-bold mb-4 uppercase tracking-widest text-secondary-text opacity-50">System Logs</h4>
            <div className="space-y-4 font-mono text-[10px]">
              <div className="flex gap-3 text-green-500/60">
                <span>[19:30:12]</span>
                <span>AUTHENTICATED AS SUPERADMIN</span>
              </div>
              <div className="flex gap-3 text-primary-text/40">
                <span>[19:30:15]</span>
                <span>METRICS FETCHED SUCCESSFULLY</span>
              </div>
              {syncing && (
                <div className="flex gap-3 text-brand-ember">
                  <span>[LIVE]</span>
                  <span className="animate-pulse">UPLOADING ASSETS TO HF BUCKET...</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-8 p-6 rounded-2xl bg-elevated/5 border border-border">
            <p className="text-xs text-secondary-text leading-relaxed italic">
              "Infrastructure is the silent heartbeat of Roamly. Ensure all assets are synced before deployment."
            </p>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--overlay-bg)] backdrop-blur-md animate-in fade-in duration-300">
          <div className="max-w-md w-full bg-surface border border-border rounded-[40px] p-10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-ember to-brand-sienna" />
            
            <div className="w-16 h-16 rounded-3xl bg-brand-ember/20 flex items-center justify-center mb-8 text-brand-ember">
              <AlertTriangle size={32} />
            </div>
            
            <h3 className="text-3xl font-bold mb-4 text-primary-text">Execute Sync?</h3>
            <p className="text-secondary-text mb-10 leading-relaxed">
              This process will download all external photos from external URLs and migrate them to your <span className="font-bold text-primary-text">Hugging Face Bucket</span>. This will modify live documents in Firestore.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={handleSyncPhotos}
                className="flex-1 px-8 py-4 rounded-2xl bg-brand-ember text-white font-bold hover:bg-brand-sienna transition-all shadow-lg shadow-brand-ember/20"
              >
                Continue Execution
              </button>
              <button 
                onClick={() => setShowConfirm(false)}
                className="flex-1 px-8 py-4 rounded-2xl bg-elevated/10 border border-border font-bold hover:bg-elevated/20 transition-all text-primary-text"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
