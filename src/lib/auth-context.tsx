'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
  type User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import type { User } from '@/lib/types';

interface AuthContextType {
  firebaseUser: FirebaseUser | null;
  userData: User | null;
  loading: boolean;
  /** Signs in a user with email and password */
  signIn: (email: string, password: string) => Promise<void>;
  /** Registers a new user with role and initial profile data */
  signUp: (email: string, password: string, displayName: string, role: 'traveler' | 'guide') => Promise<void>;
  /** Authenticates using Google OAuth and creates a user record if first login */
  signInWithGoogle: (role?: 'traveler' | 'guide') => Promise<void>;
  /** Logs out the current user and clears session data */
  signOut: () => Promise<void>;
  /** Manually triggers a re-fetch of the user's Firestore data */
  refreshUserData: () => Promise<void>;
  /** Updates current user preferences in Firestore and local state */
  updateUserPreferences: (prefs: Partial<User>) => Promise<void>;
}

/**
 * Global authentication state provider.
 * Manages Firebase Auth state and synchronizes it with the 'users' collection in Firestore.
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async (uid: string) => {
    // Try to get from cache first for instant UI response
    const cached = localStorage.getItem(`roamly_user_${uid}`);
    if (cached) {
      const parsed = JSON.parse(cached);
      setUserData(parsed);
    }

    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      const data = userDoc.data() as User;
      setUserData(data);
      // Update cache with fresh data
      localStorage.setItem(`roamly_user_${uid}`, JSON.stringify(data));
      return data;
    }
    return null;
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        await fetchUserData(user.uid);
      } else {
        setUserData(null);
        // Clean up caches if we wanted to be strict, but keeping them for now
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    await fetchUserData(cred.user.uid);
  };

  const signUp = async (email: string, password: string, displayName: string, role: 'traveler' | 'guide') => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName });
    const newUser: User = {
      uid: cred.user.uid,
      email,
      displayName,
      role,
      createdAt: serverTimestamp() as any,
      savedGems: [],
      wishlist: [],
      vibes: [],
      notificationsEnabled: true,
    };
    await setDoc(doc(db, 'users', cred.user.uid), newUser);
    setUserData(newUser);
  };

  const signInWithGoogle = async (role: 'traveler' | 'guide' = 'traveler') => {
    const provider = new GoogleAuthProvider();
    const cred = await signInWithPopup(auth, provider);
    const existing = await fetchUserData(cred.user.uid);
    if (!existing) {
      const newUser: User = {
        uid: cred.user.uid,
        email: cred.user.email || '',
        displayName: cred.user.displayName || 'Traveler',
        photoURL: cred.user.photoURL || undefined,
        role,
        createdAt: serverTimestamp() as any,
        savedGems: [],
        wishlist: [],
        vibes: [],
        notificationsEnabled: true,
      };
      await setDoc(doc(db, 'users', cred.user.uid), newUser);
      setUserData(newUser);
    }
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    setUserData(null);
  };

  const refreshUserData = async () => {
    if (firebaseUser) {
      await fetchUserData(firebaseUser.uid);
    }
  };

  const updateUserPreferences = async (prefs: Partial<User>) => {
    if (!firebaseUser || !userData) return;
    
    const updatedUser = { ...userData, ...prefs };
    setUserData(updatedUser);
    localStorage.setItem(`roamly_user_${firebaseUser.uid}`, JSON.stringify(updatedUser));
    
    try {
      await setDoc(doc(db, 'users', firebaseUser.uid), prefs, { merge: true });
    } catch (err) {
      console.error("Error updating user preferences:", err);
      // Rollback on error if necessary, but keep for now
    }
  };

  return (
    <AuthContext.Provider
      value={{ 
        firebaseUser, 
        userData, 
        loading, 
        signIn, 
        signUp, 
        signInWithGoogle, 
        signOut, 
        refreshUserData,
        updateUserPreferences 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
