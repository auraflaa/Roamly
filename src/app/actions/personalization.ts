/**
 * @file personalization.ts
 * @description Recency-Aware Personalization Engine for Roamly.
 * Handles the calculation of user 'vibe affinities' using a time-decay algorithm
 * to ensure current interests outweigh stale historical data.
 */

import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

/**
 * Represents the affinity a user has for a specific travel 'vibe'.
 * @interface VibeAffinity
 * @property {number} score - The cumulative engagement score (higher = higher affinity).
 * @property {string} lastUpdated - ISO timestamp of the last interaction for decay calculation.
 */
interface VibeAffinity {
  score: number;
  lastUpdated: string;
}

/**
 * Tracks a user interaction with a gem and updates their vibe affinity profile.
 * Applies a mathematical decay to existing scores based on time elapsed since the last update.
 * 
 * Score Formula: NewScore = (OldScore / (1 + DaysSinceLastUpdate)) + InteractionPoints
 * 
 * @async
 * @function trackInteraction
 * @param {string} userId - The Firebase UID of the traveler.
 * @param {string} vibe - The primary vibe of the gem being interacted with (e.g., 'Adventurous').
 * @param {'view' | 'save' | 'book'} type - The type of interaction (view=1pt, save=3pt, book=10pt).
 * @returns {Promise<void>}
 */
export async function trackInteraction(userId: string, vibe: string, type: 'view' | 'save' | 'book') {
  if (!userId || !vibe) return;

  const points = {
    view: 1,
    save: 3,
    book: 10
  };

  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  
  if (!userSnap.exists()) return;

  const data = userSnap.data();
  const affinities: Record<string, VibeAffinity> = data.vibeAffinities || {};
  
  const current = affinities[vibe] || { score: 0, lastUpdated: new Date().toISOString() };
  
  // Calculate recency decay for existing score
  const lastUpdate = new Date(current.lastUpdated);
  const daysSince = Math.max(0, (new Date().getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24));
  const decayedScore = current.score / (1 + daysSince);

  // Update with new points
  const newScore = decayedScore + points[type];

  await updateDoc(userRef, {
    [`vibeAffinities.${vibe}`]: {
      score: newScore,
      lastUpdated: new Date().toISOString()
    }
  });
}

/**
 * Processes a user's affinity map and returns vibes ordered by descending relevance.
 * 
 * @function getPersonalizedVibes
 * @param {Record<string, VibeAffinity>} [vibeAffinities={}] - The affinity map from the user's document.
 * @returns {string[]} An array of vibe names sorted by current relevance score.
 */
export function getPersonalizedVibes(vibeAffinities: Record<string, VibeAffinity> = {}): string[] {
  return Object.entries(vibeAffinities)
    .sort(([, a], [, b]) => b.score - a.score)
    .map(([vibe]) => vibe);
}
