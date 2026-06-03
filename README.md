<div align="center">

# Roamly


[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE) [![TypeScript](https://img.shields.io/badge/TypeScript-4.0-blue.svg)](https://www.typescriptlang.org/)

</div>

---

Roamly is a premium, story-driven travel marketplace designed to connect travelers with authentic, local-insider experiences ("Gems"). 

Unlike generic travel aggregators, Roamly is built on a **Behavioral Growth Engine** that prioritizes human connection, trust, and decision clarity to transform casual browsers into committed explorers.

---

## Behavioral Growth System

Roamly isn't just feature-complete; it's optimized for user behavior:

### 1. Recency-Aware Personalization

*   **The Engine**: A time-decay algorithm (`src/app/actions/personalization.ts`) that scores user interests.
*   **The Loop**: Recent interactions (views, saves, bookings) carry more weight, ensuring your "Explore" feed evolves with your current travel mood.
*   **Curiosity Trigger**: "Today's Pick" on the homepage creates a daily reason to return.

### 2. Decision Momentum (The Funnel)

*   **Predictive Trust**: Gem pages feature reliability signals (*"94% would book again"*) and "Local Heart" humanization blocks.
*   **Clarity Roadmap**: A 3-step progress indicator on gem details removes the "What happens next?" anxiety from the booking process.
*   **Actionable Urgency**: Real-time signals (*"Last slot available"*) trigger momentum without feeling like "dark patterns."

---

## Technical Architecture

*   **Framework**: Next.js 15+ (App Router, Server Actions).
*   **Styling**: Tailwind CSS v4 (Custom Design Tokens).
*   **Motion**: Framer Motion (Orchestrated Staggered Animations).
*   **Database**: Cloud Firestore (Talk-with-Zeno named instance).
*   **Auth**: Firebase Auth (Role-based: Traveler, Guide, Admin).
*   **Storage**: Firestore Native (Optimized Base64 WebP Compression).
*   **State**: Zustand (Local store) + AuthContext (Global session).

---

## Getting Started

### Prerequisites

*   Node.js 18+
*   Firebase Project (Firestore enabled)

### Environment Setup

Create a `.env.local` file:

```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=xxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=xxx
NEXT_PUBLIC_FIREBASE_PROJECT_ID=xxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=xxx
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=xxx
NEXT_PUBLIC_FIREBASE_APP_ID=xxx
```

### Installation

```bash
npm install
npm run dev
```

### Initial Data Sync

1. Navigate to `/admin` (ensure you are logged in as admin).
2. Click **"Reset & Seed"** to populate initial data.
3. Click **"Sync Assets"** to download, compress, and store images directly in Firestore.

---

## Codebase Documentation

We maintain high documentation standards using JSDoc:

*   **[`/src/app/actions`](file:///src/app/actions)**: Documented server-side logic for personalization and transactions.
*   **[`/src/components`](file:///src/components)**: Component-level documentation including behavioral intent.
*   **[`/src/lib`](file:///src/lib)**: Core utilities and Firebase configuration.

---

## Deployment (Vercel)

Roamly is optimized for **Vercel Free Tier**:

1.  Connect your GitHub repository to Vercel.
2.  Add the environment variables from `.env.local`.
3.  Vercel will automatically detect Next.js and build the project.
4.  **Note**: Assets are stored natively in Firestore, so no external storage bucket configuration is required after the initial sync.

### Optional: Server-side image uploads (recommended)

If you'd like server-side processing and uploads (so posts store Firebase Storage URLs instead of large inline data URLs), set the following environment variable in Vercel:

- `FIREBASE_SERVICE_ACCOUNT_KEY` — the JSON service account object as a single-line string (copy the service account JSON and paste into the Vercel secret).
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` — your Firebase Storage bucket name (e.g. `your-project.appspot.com`)

When `FIREBASE_SERVICE_ACCOUNT_KEY` is present, the server actions will upload images to Storage and store the public Storage URL in Firestore. If not present, the app will continue to store inline Base64 WebP data.

---

## License

Internal Project - All Rights Reserved.
