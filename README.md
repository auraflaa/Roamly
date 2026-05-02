# Roamly

Roamly is a premium, story-driven travel platform designed to connect travelers with authentic, local-insider experiences ("Gems"). Unlike generic travel aggregators, Roamly focuses on human connection and hidden locations that aren't found in traditional guidebooks.

## Current Stage: MVP (Highly Polished)

The project is currently in the late MVP stage, featuring a high-fidelity frontend with a cinematic landing experience, fully integrated backend services, and a production-ready image storage system.

### Key Features Implemented

*   **Cinematic Landing Experience**: A high-end hero section with parallax motion, staggered animations, and a warm, journal-inspired aesthetic.
*   **Gem Explorer**: A horizontal-scroll horizontal explorer for "Loved by Locals" featuring image-centric storytelling and micro-interactions.
*   **Authentication**: Complete Google Authentication flow with real-time profile synchronization and role-based access (User, Guide, Admin).
*   **Hugging Face Bucket Integration**: Production-ready image storage system using S3-compatible HF Buckets for high-performance image delivery and direct browser uploads.
*   **Database Architecture**: Real-time Firestore integration for Gems, Guides, and Community Posts with a specialized admin seeding utility.
*   **Premium UI System**: A custom design system built with Tailwind v4 and Framer Motion, optimized for a warm, human-centered feel.

## Technical Stack

*   **Frontend**: Next.js 15+ (App Router), React 19, Tailwind CSS v4.
*   **Motion**: Framer Motion.
*   **Backend/BaaS**: Firebase (Firestore, Auth).
*   **Storage**: Hugging Face Buckets (S3-compatible).
*   **Icons**: Lucide React.
*   **State Management**: Zustand.

## Getting Started

### Prerequisites

*   Node.js 18+
*   Hugging Face Account (for Bucket storage)
*   Firebase Project

### Environment Setup

Create a `.env.local` file in the root directory with the following variables:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Hugging Face Configuration
HF_TOKEN=your_fine_grained_token_with_write_access
```

### Installation

1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```

## Repository Structure

*   `/src/app`: Next.js App Router pages and server actions.
*   `/src/components`: Reusable UI components (Layout, Debug, etc.).
*   `/src/lib`: Core utility logic (Firebase, S3 config, Auth context).
*   `/src/app/actions`: Server actions for secure database and storage operations.

## Roadmap (Next Steps)

1.  **Payment Integration**: Implementing Stripe for guide bookings.
2.  **Advanced Search**: Vector-based search for gems using HF models.
3.  **Mobile App**: Transitioning the responsive web UI to a native experience.
