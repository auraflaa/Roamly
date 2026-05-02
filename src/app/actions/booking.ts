'use server';

import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export interface BookingData {
  userId: string;
  userName: string;
  guideId: string;
  guideName: string;
  gemId: string;
  gemTitle: string;
  bookingDate: string;
  status: 'pending' | 'accepted' | 'confirmed' | 'completed' | 'cancelled';
  mode: 'self' | 'online' | 'in-person';
  paymentStatus: 'pending' | 'held' | 'released' | 'refunded';
  price: number;
  identityConfirmedTraveler: boolean;
  identityConfirmedGuide: boolean;
  locationShared: boolean;
  sosTriggered: boolean;
}

/**
 * Creates a new booking request in Firestore
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
    console.error('Booking failed:', error);
    return { success: false, error: error.message };
  }
}
