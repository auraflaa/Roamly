/**
 * @file booking.ts
 * @description Core marketplace transaction logic for Roamly.
 * Handles the creation and management of bookings between travelers and local insiders.
 */

'use server';

import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

/**
 * Detailed representation of a booking transaction.
 * Includes safety flags and payment state for marketplace integrity.
 * @interface BookingData
 */
export interface BookingData {
  userId: string;
  userName: string;
  guideId: string;
  guideName: string;
  gemId: string;
  gemTitle: string;
  bookingDate: string;
  /** 'pending' is the initial state; 'confirmed' requires guide action */
  status: 'pending' | 'accepted' | 'confirmed' | 'completed' | 'cancelled';
  /** 'self' = digital guidebook; 'in-person' = local expert accompaniment */
  mode: 'self' | 'online' | 'in-person';
  /** 'held' indicates payment is in escrow via Stripe (mocked for MVP) */
  paymentStatus: 'pending' | 'held' | 'released' | 'refunded';
  price: number;
  /** Safety: Requires mobile app identity verification (Gated in MVP) */
  identityConfirmedTraveler: boolean;
  identityConfirmedGuide: boolean;
  locationShared: boolean;
  sosTriggered: boolean;
}

/**
 * Creates a new booking request in the Firestore 'bookings' collection.
 * 
 * @async
 * @function createBooking
 * @param {BookingData} data - The full booking object including metadata and safety flags.
 * @returns {Promise<{success: boolean, id?: string, error?: string}>}
 */
export async function createBooking(data: BookingData) {
  try {
    const bookingsCol = collection(db, 'bookings');
    const docRef = await addDoc(bookingsCol, {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    return { success: true, id: docRef.id };
  } catch (error: any) {
    console.error('Booking creation failed in Firestore:', error);
    return { success: false, error: error.message };
  }
}
