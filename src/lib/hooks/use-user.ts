'use client';

import { doc, updateDoc, arrayUnion, arrayRemove, increment } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/auth-context';

/**
 * Hook for user-related actions that require authentication.
 * Uses the client-side SDK to ensure Firestore security rules are satisfied.
 */
export function useUserActions() {
  const { firebaseUser, refreshUserData } = useAuth();

  const trackInteraction = async (vibe: string, type: 'view' | 'like' | 'save') => {
    if (!firebaseUser || !vibe) return;

    try {
      const userRef = doc(db, 'users', firebaseUser.uid);
      const weight = type === 'view' ? 1 : type === 'like' ? 5 : 10;
      
      await updateDoc(userRef, {
        [`vibeAffinities.${vibe}.score`]: increment(weight),
        [`vibeAffinities.${vibe}.lastInteraction`]: new Date(),
        [`vibeAffinities.${vibe}.count`]: increment(1)
      });
    } catch (err) {
      console.error("Error tracking interaction:", err);
    }
  };

  const toggleSavedGem = async (gemId: string, isSaving: boolean, vibe?: string) => {
    if (!firebaseUser || !gemId) return { success: false, error: 'Auth required' };

    try {
      const userRef = doc(db, 'users', firebaseUser.uid);
      
      await updateDoc(userRef, {
        savedGems: isSaving ? arrayUnion(gemId) : arrayRemove(gemId)
      });

      if (isSaving && vibe) {
        await trackInteraction(vibe, 'save');
      }

      await refreshUserData();
      return { success: true };
    } catch (err: any) {
      console.error('Error toggling saved gem:', err);
      return { success: false, error: err.message };
    }
  };

  const toggleWishlist = async (gemId: string, isWishlisting: boolean) => {
    if (!firebaseUser || !gemId) return { success: false, error: 'Auth required' };

    try {
      const userRef = doc(db, 'users', firebaseUser.uid);
      
      await updateDoc(userRef, {
        wishlist: isWishlisting ? arrayUnion(gemId) : arrayRemove(gemId)
      });

      await refreshUserData();
      return { success: true };
    } catch (err: any) {
      console.error('Error toggling wishlist:', err);
      return { success: false, error: err.message };
    }
  };

  return {
    trackInteraction,
    toggleSavedGem,
    toggleWishlist
  };
}
