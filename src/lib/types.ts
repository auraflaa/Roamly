import { Timestamp } from 'firebase/firestore';

export interface User {
  uid: string;
  email: string;
  phone?: string;
  displayName: string;
  photoURL?: string;
  role: 'traveler' | 'guide' | 'admin';
  createdAt: Timestamp;
  vibes?: string[];
  savedGems: string[];
  wishlist: string[];
  trustedContacts?: { name: string; phone: string }[];
  isFemale?: boolean;
  locationEnabled?: boolean;
  fcmToken?: string;
  vibeAffinities?: Record<string, { score: number; lastUpdated: string }>;
  identityVerified?: boolean;
  reviewsCount?: number;
  itineraryCount?: number;
  preferredLanguage?: string;
  bio?: string;
}

export interface Guide {
  uid: string;
  bio: string;
  languages: { language: string; proficiency: 'basic' | 'conversational' | 'fluent' | 'native' }[];
  city: string;
  specialties: string[];
  verificationStatus: 'pending' | 'approved' | 'rejected';
  verificationDocs: {
    idFront: string;
    idBack: string;
    additional?: string;
  };
  rejectionReason?: string;
  responseRate: number;
  rating: number;
  reviewCount: number;
  isFemale: boolean;
  isOnline: boolean;
  availability: {
    [dayOfWeek: string]: {
      online: boolean;
      inPerson: boolean;
      slots: { start: string; end: string }[];
    };
  };
  earningsBalance: number;
  bankAccount?: {
    accountNumberLast4: string;
    routingNumber?: string;
    currency: string;
  };
  trainingCompleted: boolean;
  trustScore?: number;
}

export interface Gem {
  id: string;
  title: string;
  description: string;
  photos: string[];
  location: {
    lat: number;
    lng: number;
    address: string;
    city: string;
    nearestLandmark: string;
  };
  vibes: string[];
  bestTime: { timeOfDay: string; season: string };
  whatToBring: string[];
  guideId?: string;
  isCommunityGem: boolean;
  postedBy?: string;
  moderationStatus: 'approved' | 'pending' | 'rejected' | 'flagged';
  flagCount: number;
  rating: number;
  reviewCount: number;
  createdAt: Timestamp;
  price?: number;
  localHeart?: {
    note: string;
    guideName: string;
    guideId: string;
  };
}

export interface Booking {
  id: string;
  travelerId: string;
  guideId: string;
  gemId: string;
  mode: 'self' | 'online' | 'in-person';
  status: 'pending' | 'accepted' | 'rejected' | 'confirmed' | 'completed' | 'cancelled' | 'disputed';
  scheduledAt?: Timestamp;
  requestExpiresAt?: Timestamp;
  paymentStatus: 'pending' | 'held' | 'released' | 'refunded';
  amount: number;
  platformFee: number;
  guidePayout: number;
  cancellationPolicy: 'free' | 'partial' | 'none';
  cancelledBy?: string;
  cancelledAt?: Timestamp;
  completedAt?: Timestamp;
  createdAt: Timestamp;
  identityConfirmedTraveler: boolean;
  identityConfirmedGuide: boolean;
  locationShared: boolean;
  sosTriggered: boolean;
  trustedContactNotified: boolean;
}

export interface Review {
  id: string;
  bookingId: string;
  gemId: string;
  reviewerId: string;
  revieweeId: string;
  rating: number;
  text: string;
  reply?: string;
  createdAt: Timestamp;
}

export interface CommunityPost {
  id: string;
  authorId: string;
  authorName?: string;
  authorPhoto?: string;
  gemId?: string;
  photos: string[];
  title: string;
  subtitle?: string;
  description: string; // Brief excerpt for feed
  content: string;     // Full rich-text or markdown content
  readingTime?: string;
  locationPin?: { lat: number; lng: number };
  vibeTags: string[];
  moderationStatus: 'pending' | 'approved' | 'rejected' | 'flagged';
  flagCount: number;
  flaggedBy: string[];
  likes: number;
  likedBy: string[];
  commentCount: number;
  viewCount?: number;
  createdAt: Timestamp;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorPhoto?: string;
  text: string;
  createdAt: Timestamp;
}

export interface Itinerary {
  id: string;
  authorId: string;
  title: string;
  gemIds: string[];
  description?: string;
  isPublic: boolean;
  likes: number;
  createdAt: Timestamp;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'booking_request' | 'booking_accepted' | 'booking_rejected' | 'payment_received' | 'review_received' | 'gem_approved' | 'gem_flagged' | 'moderation_action';
  title: string;
  body: string;
  data: Record<string, unknown>;
  read: boolean;
  createdAt: Timestamp;
}

export const VIBES = ['Adventure', 'Culture', 'Food', 'Nature', 'Relaxation', 'Art', 'Architecture', 'Spiritual'] as const;
export type Vibe = typeof VIBES[number];
