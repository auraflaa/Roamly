# ROAMLY — LLM Technical Build Specification
## Objective: Deploy on Vercel with Firebase as the primary backend/database

---

## 1. EXECUTIVE SUMMARY

Build Roamly, a premium travel platform connecting tourists with verified local insiders. The app enables authentic, off-the-beaten-path experiences through guided and self-guided exploration. Deploy the frontend on Vercel. Use Firebase (Firestore, Auth, Storage, Functions) as the entire backend layer.

**Product Pillars:**
- Authentic local discovery (hidden gems curated by verified insiders)
- Safety-first design (verified guides, identity checks, female-only guide options)
- Flexible exploration (self-guided, virtual, or in-person modes)
- Community trust (ratings, reviews, community-posted gems)
- AI-enhanced matching (smart recommendations and guide pairing)

**Platforms:**
- Mobile App (iOS/Android via responsive PWA or React Native Web)
- Web Platform (responsive, SSR/SSG on Vercel)
- Admin Panel (web-based, protected route)

---

## 2. TECH STACK

| Layer | Technology |
|-------|------------|
| Frontend Framework | Next.js 14+ (App Router) |
| Deployment | Vercel |
| Language | TypeScript |
| Styling | Tailwind CSS |
| UI Components | shadcn/ui + custom components |
| Icons | Lucide React |
| Fonts | Inter (Google Fonts), JetBrains Mono |
| State Management | Zustand or React Context |
| Maps | Mapbox GL JS or Google Maps JS API |
| Auth | Firebase Authentication |
| Database | Cloud Firestore |
| Storage | Firebase Storage |
| Serverless Logic | Firebase Cloud Functions (Node.js) |
| Payments | Stripe (client + server integration via Cloud Functions) |
| Video Calls | Jitsi Meet iframe API or Daily.co |
| Push Notifications | Firebase Cloud Messaging |
| Analytics | Firebase Analytics |
| Email | Firebase Extensions (Trigger Email) or Resend via Cloud Functions |

---

## 3. FIREBASE PROJECT STRUCTURE

### 3.1 Firebase Services Configuration
- **Authentication:** Email/Password, Google OAuth, Apple OAuth. Phone OTP enabled.
- **Firestore:** Native mode, single-region (us-central1 recommended for Vercel edge).
- **Storage:** Buckets for `guide_documents/`, `gem_photos/`, `community_photos/`, `profile_photos/`.
- **Functions:** HTTPS callable and HTTP triggers for Stripe, moderation, notifications.
- **Security Rules:** Strict per-user and per-role access control.
- **Indexes:** Composite indexes for geoqueries, booking lookups, feed sorting.

### 3.2 Environment Variables (Vercel)
```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_MAPBOX_TOKEN= (or GOOGLE_MAPS_API_KEY)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
FIREBASE_ADMIN_PRIVATE_KEY=
FIREBASE_ADMIN_CLIENT_EMAIL=
JITSI_DOMAIN=meet.jit.si
```

---

## 4. DATABASE SCHEMA (FIRESTORE)

### Collection: `users`
```typescript
interface User {
  uid: string;                    // Firebase Auth UID
  email: string;
  phone?: string;
  displayName: string;
  photoURL?: string;
  role: 'traveler' | 'guide' | 'admin';
  createdAt: Timestamp;
  vibes?: string[];               // Adventure, Culture, Food, Nature, Relaxation, Art
  savedGems: string[];            // Array of gem IDs
  wishlist: string[];
  trustedContacts?: { name: string; phone: string }[];
  isFemale?: boolean;             // For female-guide-only filter
  locationEnabled?: boolean;
  fcmToken?: string;
}
```

### Collection: `guides`
```typescript
interface Guide {
  uid: string;                    // Same as users.uid
  bio: string;
  languages: { language: string; proficiency: 'basic' | 'conversational' | 'fluent' | 'native' }[];
  city: string;
  specialties: string[];          // Max 5 vibe tags
  verificationStatus: 'pending' | 'approved' | 'rejected';
  verificationDocs: {
    idFront: string;              // Storage URL
    idBack: string;
    additional?: string;
  };
  rejectionReason?: string;
  responseRate: number;           // Calculated %
  rating: number;                 // 0-5
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
  earningsBalance: number;        // In cents
  bankAccount?: {
    accountNumberLast4: string;
    routingNumber?: string;
    currency: string;
  };
  trainingCompleted: boolean;
  trustScore?: number;            // Future: algorithmic
}
```

### Collection: `gems`
```typescript
interface Gem {
  id: string;
  title: string;                  // 3-8 words
  description: string;            // 60-200 words
  photos: string[];               // Storage URLs, 2-10, 16:9 or 4:3
  location: {
    lat: number;
    lng: number;
    address: string;
    nearestLandmark: string;
  };
  vibes: string[];                // 1-3 from approved list
  bestTime: { timeOfDay: string; season: string };
  whatToBring: string[];
  guideId?: string;               // Null if community gem
  isCommunityGem: boolean;
  postedBy?: string;              // User UID if community
  moderationStatus: 'approved' | 'pending' | 'rejected' | 'flagged';
  flagCount: number;
  rating: number;
  reviewCount: number;
  createdAt: Timestamp;
  price?: number;                 // In cents, if applicable
}
```

### Collection: `bookings`
```typescript
interface Booking {
  id: string;
  travelerId: string;
  guideId: string;
  gemId: string;
  mode: 'self' | 'online' | 'in-person';
  status: 'pending' | 'accepted' | 'rejected' | 'confirmed' | 'completed' | 'cancelled' | 'disputed';
  scheduledAt?: Timestamp;        // For online/in-person
  requestExpiresAt?: Timestamp;   // 15 min window for in-person
  paymentStatus: 'pending' | 'held' | 'released' | 'refunded';
  paymentIntentId?: string;       // Stripe
  amount: number;                 // In cents
  platformFee: number;            // In cents
  guidePayout: number;            // In cents
  cancellationPolicy: 'free' | 'partial' | 'none';
  cancelledBy?: string;
  cancelledAt?: Timestamp;
  completedAt?: Timestamp;
  createdAt: Timestamp;
  // Safety fields
  identityConfirmedTraveler: boolean;
  identityConfirmedGuide: boolean;
  locationShared: boolean;
  sosTriggered: boolean;
  trustedContactNotified: boolean;
}
```

### Collection: `reviews`
```typescript
interface Review {
  id: string;
  bookingId: string;
  gemId: string;
  reviewerId: string;
  revieweeId: string;             // Guide or Gem author
  rating: number;                 // 1-5
  text: string;
  reply?: string;
  createdAt: Timestamp;
}
```

### Collection: `community_posts`
```typescript
interface CommunityPost {
  id: string;
  authorId: string;
  gemId?: string;                 // Optional link to gem
  photos: string[];
  title: string;
  description: string;
  locationPin?: { lat: number; lng: number };
  vibeTags: string[];
  moderationStatus: 'pending' | 'approved' | 'rejected' | 'flagged';
  flagCount: number;
  flaggedBy: string[];
  likes: number;
  likedBy: string[];
  commentCount: number;
  createdAt: Timestamp;
}
```

### Collection: `itineraries`
```typescript
interface Itinerary {
  id: string;
  authorId: string;
  title: string;
  gemIds: string[];               // 3-6 gems
  description?: string;
  isPublic: boolean;
  likes: number;
  createdAt: Timestamp;
}
```

### Collection: `notifications`
```typescript
interface Notification {
  id: string;
  userId: string;
  type: 'booking_request' | 'booking_accepted' | 'booking_rejected' | 'payment_received' | 'review_received' | 'gem_approved' | 'gem_flagged' | 'moderation_action';
  title: string;
  body: string;
  data: Record<string, any>;
  read: boolean;
  createdAt: Timestamp;
}
```

### Collection: `admin_logs`
```typescript
interface AdminLog {
  id: string;
  adminId: string;
  action: 'approve_guide' | 'reject_guide' | 'approve_post' | 'remove_post' | 'suspend_user' | 'resolve_dispute';
  targetId: string;
  targetType: string;
  reason?: string;
  createdAt: Timestamp;
}
```

---

## 5. DESIGN SYSTEM (TAILWIND CONFIG)

### Colors
```javascript
// tailwind.config.ts
const colors = {
  brand: {
    ember: '#E8601A',
    sienna: '#C94F10',
    sunrise: '#F5A06A',
  },
  dark: {
    bg: '#0C0804',
    surface: '#141009',
    card: '#1E1610',
    elevated: '#2A2018',
    'primary-text': '#F0E6D6',
    'secondary-text': '#8C7E6E',
    border: '#3A2E22',
  },
  light: {
    bg: '#FAF5EE',
    surface: '#F5F0E8',
    card: '#FFFCF8',
    elevated: '#FFFFFF',
    'primary-text': '#1A1008',
    'secondary-text': '#7A6B5A',
    border: '#E2D8C8',
  },
  semantic: {
    success: { dark: { bg: '#4A7C59', text: '#D4EDDE' }, light: { bg: '#D4EDDE', text: '#1A4A2E' } },
    error: { dark: { bg: '#8B3030', text: '#FCCACA' }, light: { bg: '#FDDEDE', text: '#7A1A1A' } },
    warning: { dark: { bg: '#6B5000', text: '#FFD97A' }, light: { bg: '#FFF3CC', text: '#6B5000' } },
    info: { dark: { bg: '#1A3A5C', text: '#93C5FD' }, light: { bg: '#DBEAFE', text: '#1E40AF' } },
  },
  mode: {
    self: '#F5F0E8',      // parchment
    online: '#4A7C59',    // forest
    inperson: '#FDDCC8',  // warm cream
  }
};
```

### Typography
```javascript
fontFamily: {
  sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
  mono: ['JetBrains Mono', 'Courier New', 'monospace'],
},
fontSize: {
  'display': ['32px', { lineHeight: '1.2', letterSpacing: '-0.03em', fontWeight: '500' }],
  'h1': ['26px', { lineHeight: '1.2', letterSpacing: '-0.02em', fontWeight: '500' }],
  'h2': ['20px', { lineHeight: '1.2', letterSpacing: '-0.01em', fontWeight: '500' }],
  'h3': ['17px', { lineHeight: '1.3', letterSpacing: '0em', fontWeight: '500' }],
  'body-lg': ['15px', { lineHeight: '1.7', letterSpacing: '0em', fontWeight: '400' }],
  'body': ['14px', { lineHeight: '1.7', letterSpacing: '0em', fontWeight: '400' }],
  'label': ['12px', { lineHeight: '1.4', letterSpacing: '0.04em', fontWeight: '500' }],
  'caption': ['11px', { lineHeight: '1.4', letterSpacing: '0.07em', fontWeight: '500' }],
  'micro': ['10px', { lineHeight: '1.4', letterSpacing: '0.08em', fontWeight: '500' }],
}
```

### Spacing & Radius
```javascript
spacing: {
  '1': '4px',
  '2': '8px',
  '3': '12px',
  '4': '16px',
  '5': '20px',
  '6': '24px',
  '8': '32px',
  '10': '40px',
  '12': '48px',
  '16': '64px',
},
borderRadius: {
  'sm': '8px',
  'md': '12px',
  'lg': '16px',
  'xl': '22px',
  'full': '9999px',
}
```

### Layout Tokens
```javascript
screens: {
  'mobile': '640px',
  'tablet': '1024px',
  'desktop': '1280px',
},
maxWidth: {
  'mobile-content': '420px',
  'web-content': '1280px',
}
```

---

## 6. COMPONENT INVENTORY

### Layout Components
- `AppShell` — handles bottom nav (mobile) / top nav (web), safe areas, theme provider
- `BottomNav` — 5 tabs: Explore, Guides, Community, Bookings, Profile
- `TopBar` — Back arrow + title + optional action
- `TopNav` — Logo, links, CTA, profile (web)
- `MobileDrawer` — Hamburger menu overlay (web mobile)
- `Footer` — 3-column brand + links + social

### Cards
- `GemCard` — Image 160px (mobile) / 220px (web), title, rating, guide avatar, CTA, radius-xl
- `GemCardWeb` — Hover: border-color → ember orange 30% opacity, scale 1.01
- `GuideCard` — Horizontal, 48px avatar with orange ring (if verified), name, rating, mode chips
- `CommunityPostCard` — Photo grid, author, likes, comments
- `ItineraryCard` — Gem chain preview, title, author
- `BookingCard` — Status badge, date, guide info, actions

### Inputs
- `TextField` — 52px mobile / 48px web, radius-md, 1px border, 2px ember on focus
- `SearchBar` — Full-width, 44px, rounded-full, inside top bar
- `TextArea` — For descriptions, bios
- `ImageUploader` — Multi-photo, max 5 (community) / 10 (gems), preview grid
- `LocationPicker` — Map pin drop, address autocomplete

### Buttons
- `ButtonPrimary` — Ember orange bg, white text, radius-full, padding 12px 28px
- `ButtonSecondary` — Outline, 2px border (dark/light aware)
- `ButtonGhost` — Surface bg, primary text
- `ButtonDanger` — Error bg
- `ModeChip` — Icon + label, bg varies by mode (self/online/in-person)
- `HiddenGemBadge` — Radius-full, ember 15% bg, ember 40% border

### Feedback
- `SkeletonCard` — Pulse animation between surface and elevated colors, 1.5s loop
- `Toast` — Success (green checkmark scale-in 250ms), error, info
- `Modal` — Elevated card bg, slide-down animation, backdrop blur
- `BottomSheet` — Mobile modals, draggable

### Safety Components
- `SOSButton` — Long-press or dedicated button, prominent red styling
- `IdentityCheckBanner` — Shows confirmation status before meeting
- `LocationShareToggle` — Real-time location sharing toggle
- `FemaleOnlyToggle` — Filter toggle with clear labeling

---

## 7. PAGE ROUTES & FEATURES (NEXT.JS APP ROUTER)

### Public Routes
| Route | Purpose | Key Features |
|-------|---------|--------------|
| `/` | Landing | Hero, value prop, featured gems, guide highlights, signup CTA, marketing copy |
| `/explore` | Discovery | Filterable gem grid, map view toggle, search, "Loved by locals" featured section, vibe/distance/mode/rating/price filters |
| `/gem/[id]` | Gem Detail | Hero images, verified badge, rating, description, location, best time, what to bring, available guides list, community posts, save to wishlist |
| `/guide/[id]` | Guide Profile | Bio, listings, reviews, availability calendar, booking CTA, response rate, languages |
| `/community` | Community Feed | Posts + micro-itineraries, chronological + algorithmic mix, save/like/comment/share, create post CTA |
| `/itinerary/[id]` | Itinerary Detail | Chain of 3-6 gems, map route, shareable URL |

### Protected Routes (Traveler)
| Route | Purpose |
|-------|---------|
| `/bookings` | Upcoming, past, leave reviews, cancel |
| `/profile` | Account settings, vibe preferences, saved gems, wishlist, trusted contacts, payment methods |
| `/onboarding` | Vibe selection (1-3), location permission explanation |

### Protected Routes (Guide)
| Route | Purpose |
|-------|---------|
| `/guide-dashboard` | Upcoming bookings, earnings summary, availability calendar, listing management, booking requests, payout settings |
| `/guide-dashboard/listings` | Add/edit gems, upload photos, descriptions, tips |
| `/guide-dashboard/earnings` | Balance, payout history, bank account management |
| `/guide-dashboard/reviews` | All reviews with reply option |

### Protected Routes (Admin)
| Route | Purpose |
|-------|---------|
| `/admin` | Dashboard with analytics overview |
| `/admin/verification` | Guide document review queue, approve/reject with reason |
| `/admin/moderation` | Flagged posts/community gems, approve/remove/request edit |
| `/admin/users` | Account list, suspend/ban with reason, reset verification |
| `/admin/disputes` | Booking disputes, release/refund escrow, resolution notes |
| `/admin/analytics` | DAU/MAU, booking volume, top guides/gems, revenue by region |

### Auth Routes
| Route | Purpose |
|-------|---------|
| `/login` | Email/password + OAuth (Google, Apple) |
| `/signup` | Role selection (traveler/guide), email verification |
| `/verify-phone` | OTP input, required before booking |
| `/guide-registration` | Step 1-6 flow: basic info → document upload → pending → training |

---

## 8. AUTHENTICATION & AUTHORIZATION

### Firebase Auth Flow
1. **Sign Up:** Email/password or OAuth → create `users` doc with role
2. **Phone Verification:** Firebase Phone Auth → update `users.phone`
3. **Role Selection:** On signup, route to traveler or guide onboarding
4. **Traveler Onboarding:** Vibe selection (1-3) → location permission → `/explore`
5. **Guide Registration:**
   - Step 1: Basic info (name, bio, languages, city)
   - Step 2: Document upload to Firebase Storage → `guides` doc created with `pending`
   - Step 3: Admin review (48hr SLA via Cloud Function trigger)
   - Step 4: Approval → mandatory training module (in-app, 15 min)
   - Step 5: Training complete → profile live

### Firestore Security Rules
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own profile
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }
    // Guides: public read, own write (except status fields)
    match /guides/{guideId} {
      allow read: if true;
      allow write: if request.auth.uid == guideId && !request.resource.data.diff(resource.data).affectedKeys().hasAny(['verificationStatus', 'earningsBalance']);
      allow write: if request.auth.token.admin == true;
    }
    // Gems: public read, create by guides only, update by owner/admin
    match /gems/{gemId} {
      allow read: if resource.data.moderationStatus == 'approved' || request.auth.token.admin == true || request.auth.uid == resource.data.guideId || request.auth.uid == resource.data.postedBy;
      allow create: if request.auth != null && (request.auth.token.guide == true || request.auth.token.admin == true);
      allow update, delete: if request.auth.uid == resource.data.guideId || request.auth.uid == resource.data.postedBy || request.auth.token.admin == true;
    }
    // Bookings: participant read, create by traveler, update by participant/admin
    match /bookings/{bookingId} {
      allow read: if request.auth != null && (request.auth.uid == resource.data.travelerId || request.auth.uid == resource.data.guideId || request.auth.token.admin == true);
      allow create: if request.auth != null && request.auth.uid == request.resource.data.travelerId;
      allow update: if request.auth != null && (request.auth.uid == resource.data.travelerId || request.auth.uid == resource.data.guideId || request.auth.token.admin == true);
    }
    // Reviews: public read, create by reviewer only
    match /reviews/{reviewId} {
      allow read: if true;
      allow create: if request.auth.uid == request.resource.data.reviewerId;
      allow update: if request.auth.uid == resource.data.revieweeId; // For replies
    }
    // Community posts: approved public read, create by any user, update by owner/admin
    match /community_posts/{postId} {
      allow read: if resource.data.moderationStatus == 'approved' || request.auth.uid == resource.data.authorId || request.auth.token.admin == true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth.uid == resource.data.authorId || request.auth.token.admin == true;
    }
    // Admin-only collections
    match /admin_logs/{logId} {
      allow read, write: if request.auth.token.admin == true;
    }
    match /notifications/{notifId} {
      allow read: if request.auth.uid == resource.data.userId;
      allow write: if request.auth.token.admin == true || request.auth.token.system == true;
    }
  }
}
```

### Custom Claims
- `admin: true` — Set via Firebase Admin SDK in Cloud Function after admin role assignment
- `guide: true` — Set after guide approval and training completion
- `verified: true` — Set after phone verification

---

## 9. CORE FEATURES IMPLEMENTATION

### 9.1 Explore Screen
- **Default View:** Geoquery for gems near user location (use Firestore geohash or GeoPoint with 10km radius)
- **Filters:** Vibe (multi-select), Distance (slider), Mode (chips), Rating (min stars), Price (range)
- **Map View:** Mapbox/GM pins with bottom sheet gem cards on pin tap
- **Search:** Full-text search via Algolia (recommended) or Firestore composite queries on title/tags
- **Featured Section:** Editorial flag on gem docs, curated by admin

### 9.2 Gem Detail
- Image carousel with pinch-zoom (mobile)
- Verified badge logic: check `guides.verificationStatus == 'approved'`
- Available guides: query `guides` where `city` matches gem city, filter by availability
- Community posts: query `community_posts` where `gemId` matches
- Save to wishlist: arrayUnion on `users.wishlist`
- Share: Web Share API + copy URL

### 9.3 Booking Flow

**Self Explore:**
- Save gem to offline map (localStorage/IndexedDB for PWA)
- "Get Directions" → deep link to Google Maps/Apple Maps with lat/lng

**Online Guide:**
1. Select guide from gem detail
2. View availability calendar (read from `guides.availability`)
3. Select slot → create `booking` doc with `status: 'pending'`, `mode: 'online'`
4. Stripe payment intent (Cloud Function)
5. On payment success → `status: 'confirmed'`
6. Generate Jitsi room URL: `https://meet.jit.si/Roamly-{bookingId}`
7. Both parties receive notification with link
8. At scheduled time: open Jitsi in iframe (web) or WebView (mobile)

**In-Person Guide:**
1. Select guide → Send request (create booking with `status: 'pending'`, 15-min expiry)
2. Guide receives push notification → Accept/Reject in app
3. If accepted: Stripe holds payment in escrow (`paymentStatus: 'held'`)
4. 30 min before meeting: both must confirm identity (Cloud Function check)
5. During session: optional location share (Geolocation API + Firestore real-time updates)
6. SOS: long-press volume button listener (mobile) or dedicated UI button
7. Completion: traveler taps "Session Complete" → payment released after 2 hours (Cloud Function scheduled)
8. Dispute: either party can flag within 2 hours → admin review

### 9.4 Safety Features
- **Female Guide Only:** Filter `guides` where `isFemale == true`
- **Identity Confirmation:** Cloud Function verifies both `identityConfirmed` flags before allowing session start
- **Location Share:** Firestore `onSnapshot` listener on booking doc, update geolocation every 30s
- **SOS:** Triggers Cloud Function to send SMS/email to trusted contacts + log incident

### 9.5 Community Features
- **Post Gem:** Form with image upload (Firebase Storage), title, description, location pin, vibe tags
- **Moderation Queue:** On create, `moderationStatus: 'pending'`. Cloud Function notifies admin.
- **Flagging:** `arrayUnion` on `flaggedBy`, increment `flagCount`. At 3 flags, auto-hold (`status: 'flagged'`)
- **Feed:** Composite query sorting by `createdAt` desc, filtered by user vibes preference
- **Micro-itineraries:** Drag-drop gem chain builder, save to `itineraries` collection

### 9.6 Guide Dashboard
- **Availability:** Weekly calendar UI, toggle on/off for online/in-person per day, time slot picker
- **Booking Requests:** Real-time listener on `bookings` where `guideId == currentUser` and `status == 'pending'`
- **Earnings:** Aggregate bookings where `guidePayout` released, display balance
- **Payouts:** Stripe Connect integration (Cloud Function) for guide bank transfers

---

## 10. CLOUD FUNCTIONS (FIREBASE)

| Function | Trigger | Purpose |
|----------|---------|---------|
| `onUserCreated` | Auth onCreate | Create `users` doc, send welcome email |
| `onGuideSubmitted` | Firestore onCreate guides | Notify admin, start 48hr SLA timer |
| `processGuideApproval` | HTTPS Callable | Admin approves → set custom claim `guide: true`, send email, create notification |
| `processGuideRejection` | HTTPS Callable | Admin rejects → send reason email, update doc |
| `createPaymentIntent` | HTTPS Callable | Stripe payment intent creation for bookings |
| `releaseEscrow` | Firestore onUpdate | When booking status → completed, schedule 2hr delay then release funds |
| `processRefund` | HTTPS Callable | Handle cancellations per policy (free/partial/none) |
| `checkBookingExpiry` | Pub/Sub scheduled | Every minute, reject pending in-person bookings past 15-min window |
| `onPostFlagged` | Firestore onUpdate | If flagCount >= 3, auto-hold and notify admin |
| `sendNotification` | Firestore onCreate notifications | Send FCM push notification |
| `generateItinerary` | HTTPS Callable | Future: AI itinerary generator |
| `calculateGuideMetrics` | Pub/Sub scheduled | Daily recalculation of responseRate, rating, trustScore |
| `moderationAutoApprove` | Pub/Sub scheduled | Auto-approve community posts after 24hr if no flags |

---

## 11. INTEGRATIONS

### Stripe
- **Products:** Booking payments, platform fees, guide payouts
- **Connect:** Onboard guides as Express/Custom connected accounts
- **Escrow:** PaymentIntent with `capture_method: 'manual'`, capture on completion
- **Webhooks:** `payment_intent.succeeded`, `charge.dispute.created` → Cloud Function endpoints

### Maps
- **Display:** Mapbox GL JS or Google Maps JS API for gem pins, route display
- **Geocoding:** Convert addresses to lat/lng on gem creation
- **Navigation:** External deep links to Google Maps / Apple Maps

### Video Calling
- **Jitsi:** iframe embed with custom room name per booking
- **Daily.co:** Alternative if Jitsi UI needs heavy customization

### Push Notifications
- **FCM:** Token registration per device, topic subscriptions for guide notifications
- **Permissions:** Request on booking-related actions, not on app launch

### Email
- **Trigger Email Firebase Extension:** For transactional emails (receipts, approvals)
- **Resend/SendGrid:** Via Cloud Functions for rich HTML templates

---

## 12. PERFORMANCE & SEO REQUIREMENTS

### Performance Targets
- First Contentful Paint < 1.5s
- Time to Interactive < 3s (cold)
- API response < 500ms p95
- Image loading: Next.js Image component with blur placeholder, Firebase Storage CDN
- LCP < 2.5s, CLS < 0.1

### Next.js Specifics
- `/explore`, `/gem/[id]`, `/guide/[id]`: Static generation where possible, ISR for gem updates
- OG meta tags for all gem/guide/itinerary pages (`og:title`, `og:description`, `og:image`)
- `generateMetadata()` for dynamic SEO
- PWA manifest for mobile installability
- Service worker for offline saved gems/maps

### Firebase Performance
- Use Firestore `onSnapshot` for real-time features (bookings, notifications)
- Use batched writes for multi-doc updates (booking + notification + gem stats)
- Pagination: Cursor-based for feeds and explore grids (limit 20)
- Composite indexes required for:
  - `gems`: `moderationStatus` + `vibes` + `location` (geoquery)
  - `bookings`: `travelerId` + `createdAt`, `guideId` + `status`
  - `community_posts`: `moderationStatus` + `vibeTags` + `createdAt`

---

## 13. SECURITY REQUIREMENTS

- JWT via Firebase Auth (short-lived ID tokens, refresh automatically)
- Guide documents: Firebase Storage path `guide_documents/{uid}/`, rules restrict to owner + admin
- Payment data: Never stored in Firestore. Only Stripe PaymentIntent IDs.
- Live location: Write to ephemeral `sessions/{bookingId}/location` collection with TTL policy (delete after 24h)
- Rate limiting: Firebase App Check + Cloud Function rate limiting on public endpoints
- GDPR: Data export/deletion Cloud Functions for user account termination
- All contractor access via Firebase IAM, no service account key sharing

---

## 14. IMPLEMENTATION ROADMAP

### Phase 1: Foundation (Week 1-2)
- Next.js setup on Vercel, Tailwind + shadcn/ui
- Firebase project setup, Auth, Firestore, Storage
- Design system implementation (colors, typography, spacing)
- Bottom nav, top bar, layout shell
- Dark/light mode toggle with localStorage persistence

### Phase 2: Auth & Onboarding (Week 3)
- Login/signup with email + OAuth
- Phone verification flow
- Traveler onboarding (vibe selection)
- Guide registration flow (6 steps)
- Firestore security rules v1

### Phase 3: Explore & Gems (Week 4-5)
- Explore grid with filters
- Gem detail page
- Map integration with pins
- Search functionality
- Save to wishlist
- Community post creation (basic)

### Phase 4: Booking & Payments (Week 6-7)
- Self-explore mode (directions handoff)
- Online guide booking flow
- In-person request/accept flow
- Stripe integration (payments + escrow)
- Booking management screens
- Cancellation logic

### Phase 5: Guide Dashboard (Week 8)
- Guide dashboard UI
- Availability calendar
- Listing management (CRUD)
- Earnings view
- Booking request handling

### Phase 6: Safety & Community (Week 9)
- Female guide filter
- Identity confirmation flow
- Location sharing (real-time)
- SOS feature
- Community feed algorithm
- Flagging and moderation queue

### Phase 7: Admin Panel (Week 10)
- Admin route protection
- Guide verification queue
- Content moderation
- User management (suspend/ban)
- Dispute resolution UI
- Analytics dashboard (basic charts)

### Phase 8: Polish & Launch (Week 11-12)
- Push notifications
- Email templates
- PWA configuration
- SEO optimization
- Performance audit
- E2E testing (Playwright)
- Load testing

---

## 15. TESTING CHECKLIST

### Critical User Flows
- [ ] Sign up → Onboarding → Explore
- [ ] Search gem → View detail → Save → Book online → Pay → Join call
- [ ] Request in-person → Guide accepts → Identity check → Complete → Review
- [ ] Post community gem → Moderation → Approval → Appears in feed
- [ ] Guide registration → Upload docs → Admin approval → Training → Live
- [ ] Cancellation 24h+ (full refund), 2-24h (50%), <2h (none)
- [ ] SOS trigger → Trusted contact receives location
- [ ] Admin ban user → User cannot log in

### Security
- [ ] Firestore rules reject unauthorized cross-user reads
- [ ] Storage rules prevent document leakage
- [ ] Stripe webhooks verify signature
- [ ] Admin routes 403 for non-admins
- [ ] Cloud Functions validate auth tokens

---

## 16. APPENDIX: CONTENT GUIDELINES FOR SEED DATA

### Gem Seed Data Requirements
- Title: 3-8 words, specific (e.g., "Sunrise Fort Trail 2.3km from Old City")
- Description: 60-200 words, sensory details, best time, what makes it special
- Photos: Minimum 2 per gem, 16:9 ratio
- Vibes: 1-3 from [Adventure, Culture, Food, Nature, Relaxation, Art, Architecture, Spiritual]
- Location: Precise lat/lng, approximate address, nearest landmark

### Guide Seed Data Requirements
- Bio: 100-300 words, personal, why they know the place
- Languages: With proficiency levels
- Photo: 400x400px minimum, clear face, natural light
- Specialties: Up to 5 vibe tags

---

## 17. DEPLOYMENT NOTES

### Vercel Configuration
- Framework Preset: Next.js
- Build Command: `next build`
- Output Directory: `.next`
- Environment Variables: All `NEXT_PUBLIC_*` and server secrets added
- Regions: `iad1` (US East) recommended for Firebase us-central1 latency

### Firebase Deployment
- Hosting: Not needed (Vercel handles frontend)
- Functions: Deploy with `firebase deploy --only functions`
- Firestore Rules: Deploy with `firebase deploy --only firestore:rules`
- Storage Rules: Deploy with `firebase deploy --only storage`
- Indexes: Deploy with `firebase deploy --only firestore:indexes`

### Domain & SSL
- Custom domain on Vercel with automatic SSL
- Firebase Auth authorized domains must include Vercel production domain + preview domains (if using preview deployments)

---

END OF SPECIFICATION
