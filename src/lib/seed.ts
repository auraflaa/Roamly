import { collection, doc, setDoc, getDocs, updateDoc, Timestamp } from 'firebase/firestore/lite';
import { db } from './firebase-server';

// Helper to generate IDs
const gid = (prefix: string, index: number) => `${prefix}-${index}`;

// Vibe categories
const VIBES = ['Adventure', 'Nature', 'Food', 'Culture', 'Spiritual', 'Relaxation', 'Art', 'Architecture', 'Nightlife', 'Hidden', 'Traditional'];

const CITIES = ['Jaipur', 'Goa', 'Mumbai', 'Agra', 'Varanasi', 'Udaipur', 'Kochi', 'Delhi', 'Ladakh', 'Hampi'];

const REAL_GUIDE_NAMES = [
  'Arjun Sharma', 'Priya Nair', 'Vikram Mehta', 'Ananya Iyer', 'Zaid Khan', 
  'Meera Deshmukh', 'Rahul Verma', 'Sneha Kapoor', 'Amit Das', 'Kavita Reddy'
];

const PHOTOS = [
  'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1502791451862-7bd8c1df43a7?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1503220317375-aaad61436b1b?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1512100356956-c1227c3464bb?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80',
];

const GEM_TITLES = [
  'Emerald Garden Sanctuary', 'Echoing Steps of Nahargarh', 'The Weaver\'s Hidden Loft', 'Citrus Blossom Courtyard', 
  'Abandoned Haveli of Chandni Chowk', 'Midnight Jazz at Blue Note', 'Lotus Pond Meditation Grove', 'Saffron & Silk Spice Walk',
  'Ancient Panna Meena View', 'Banyan Tree Spirit Shrine', 'Netted Dawn: Fisherman\'s Cove', 'Backstreet Mural Odyssey',
  'Secluded Hilltop Pagoda', 'The Indigo Master\'s Studio', 'Old City Masala Tavern'
];

const DESCRIPTIONS = [
  'A serene escape known only to heritage conservationists, offering a panoramic view of the ancient city walls as the sky turns to fire.',
  'An 11th-century architectural masterpiece tucked away from the main safari trail, where the silence is only broken by the temple bells.',
  'Sit with 4th-generation National Award-winning artisans as they reveal the meditative process of block printing and natural dyes.',
  'A cascading oasis that requires a trek through teak forests, rewarding explorers with crystal-clear pools and absolute solitude.',
  'Navigate the crumbling grandeur of a merchant\'s mansion, where stained glass and teak beams whisper stories of a forgotten golden age.',
  'The pulse of the city\'s bohemian underground. No stage, just raw talent and the smell of old wood and vinyl.',
  'A journey through the twilight canals, passing under low bridges where the water reflects the flickering oil lamps of the old town.',
  'An aromatic sanctuary where rare botanicals are cultivated using centuries-old organic techniques passed down through generations.',
];

// Generate 100 Gems
const SEED_GEMS = Array.from({ length: 100 }, (_, i) => ({
  id: gid('gem', i + 1),
  title: `${GEM_TITLES[i % GEM_TITLES.length]} ${Math.floor(i / GEM_TITLES.length) + 1}`,
  description: DESCRIPTIONS[i % DESCRIPTIONS.length],
  photos: [PHOTOS[i % PHOTOS.length], PHOTOS[(i + 1) % PHOTOS.length]],
  location: { 
    lat: 10 + Math.random() * 20, 
    lng: 70 + Math.random() * 20, 
    address: `Street ${i + 1}, ${CITIES[i % CITIES.length]}`, 
    city: CITIES[i % CITIES.length], 
    nearestLandmark: 'Local Center' 
  },
  vibes: Array.from(new Set([VIBES[i % VIBES.length], VIBES[(i + 2) % VIBES.length]])),
  bestTime: { timeOfDay: 'Morning', season: 'Any' },
  whatToBring: ['Water', 'Camera', 'Curiosity'],
  isCommunityGem: i % 5 === 0,
  guideId: i % 5 === 0 ? null : gid('guide', (i % 10) + 1),
  postedBy: i % 5 === 0 ? gid('user', (i % 20) + 1) : null,
  moderationStatus: 'approved' as const,
  flagCount: 0,
  rating: 4.0 + Math.random() * 1.0,
  reviewCount: Math.floor(Math.random() * 100),
  createdAt: Timestamp.now(),
  localHeart: CITIES[i % CITIES.length] === 'Delhi' ? {
    note: "I grew up exploring these hidden corners. To me, this isn't just a destination—it's a story of our heritage that most tourists never get to hear. I can't wait to show you the real Delhi.",
    guideName: REAL_GUIDE_NAMES[i % REAL_GUIDE_NAMES.length],
    guideId: gid('guide', (i % 10) + 1)
  } : null,
  price: Math.floor(Math.random() * 5000),
}));

// Generate 10 Guides
const SEED_GUIDES = Array.from({ length: 10 }, (_, i) => ({
  uid: gid('guide', i + 1),
  displayName: REAL_GUIDE_NAMES[i],
  bio: `Native of ${CITIES[i % CITIES.length]} with a decade spent unearthing its secrets. Specialist in ${VIBES[i % VIBES.length]} and community storytelling.`,
  languages: [
    { language: 'English', proficiency: 'fluent' as const },
    { language: 'Hindi', proficiency: 'native' as const }
  ],
  city: CITIES[i % CITIES.length],
  specialties: [VIBES[i % VIBES.length], VIBES[(i + 1) % VIBES.length]],
  verificationStatus: 'approved' as const,
  verificationDocs: { idFront: '', idBack: '' },
  responseRate: 90 + Math.random() * 10,
  rating: 4.5 + Math.random() * 0.5,
  reviewCount: Math.floor(Math.random() * 200),
  isFemale: i % 2 === 0,
  isOnline: true,
  availability: {
    Monday: { online: true, inPerson: true, slots: [{ start: '09:00', end: '17:00' }] },
    Tuesday: { online: true, inPerson: true, slots: [{ start: '09:00', end: '17:00' }] },
    Wednesday: { online: true, inPerson: true, slots: [{ start: '09:00', end: '17:00' }] },
    Thursday: { online: true, inPerson: true, slots: [{ start: '09:00', end: '17:00' }] },
    Friday: { online: true, inPerson: true, slots: [{ start: '09:00', end: '17:00' }] },
    Saturday: { online: true, inPerson: true, slots: [{ start: '09:00', end: '17:00' }] },
    Sunday: { online: true, inPerson: true, slots: [{ start: '09:00', end: '17:00' }] },
  },
  earningsBalance: 0,
  trainingCompleted: true,
  trustScore: 90,
}));

// Generate 20 Users
const SEED_USERS = Array.from({ length: 20 }, (_, i) => ({
  uid: i < 10 ? gid('guide', i + 1) : gid('user', i - 9),
  email: i < 10 ? `${REAL_GUIDE_NAMES[i].toLowerCase().replace(' ', '.')}@roamly.com` : `traveler.${i - 9}@roamly.com`,
  displayName: i < 10 ? REAL_GUIDE_NAMES[i] : `Traveler ${i - 9}`,
  role: i < 10 ? 'guide' as const : 'traveler' as const,
  createdAt: Timestamp.now(),
  savedGems: [],
  wishlist: [],
  vibes: [VIBES[i % VIBES.length]],
  identityVerified: i % 3 === 0,
  reviewsCount: Math.floor(Math.random() * 10),
  itineraryCount: Math.floor(Math.random() * 5),
  preferredLanguage: 'English',
  bio: i < 10 ? `Native guide in ${CITIES[i % CITIES.length]}.` : 'Passionate explorer and storyteller.'
}));

// Generate 50 Community Posts (Medium-like)
const SEED_COMMUNITY_POSTS = Array.from({ length: 50 }, (_, i) => ({
  id: gid('post', i + 1),
  authorId: i % 2 === 0 ? gid('user', (i % 10) + 1) : gid('guide', (i % 10) + 1),
  authorName: i % 2 === 0 ? `Explorer ${ (i % 10) + 1 }` : REAL_GUIDE_NAMES[i % REAL_GUIDE_NAMES.length],
  photos: [PHOTOS[(i + 5) % PHOTOS.length], PHOTOS[(i + 10) % PHOTOS.length]],
  title: `${GEM_TITLES[i % GEM_TITLES.length]} - A Deep Dive`,
  description: `This discovery changed how I view ${CITIES[i % CITIES.length]}. ${DESCRIPTIONS[i % DESCRIPTIONS.length]}
  
  Walking through the backstreets of ${CITIES[i % CITIES.length]}, you realize that the real magic isn't in the landmarks, but in the people you meet. Mentions: @User-1, @Guide-2.
  
  What I loved most about this experience was the authenticity. There were no tourists around, just the sound of the local artisans working. If you're looking for something truly off the beaten path, this is it.`,
  vibeTags: Array.from(new Set([VIBES[i % VIBES.length], 'Authentic', 'Hidden'])),
  moderationStatus: 'approved' as const,
  flagCount: 0,
  flaggedBy: [],
  likes: Math.floor(Math.random() * 200),
  likedBy: [],
  commentCount: Math.floor(Math.random() * 50),
  createdAt: Timestamp.now(),
}));


export async function seedDatabase() {
  console.log('Starting Force-Seed...');
  try {
    // 1. Seed Gems
    const gemsCol = collection(db, 'gems');
    const gemSnapshot = await getDocs(gemsCol);
    
    // Create gems if they don't exist, otherwise update their photos
    if (gemSnapshot.size === 0) {
      console.log('Creating 100 new gems...');
      for (let i = 1; i <= 100; i++) {
        const gemId = `gem-${i}`;
        const photos = [
          PHOTOS[i % PHOTOS.length],
          PHOTOS[(i + 1) % PHOTOS.length]
        ];
        await setDoc(doc(db, 'gems', gemId), {
          title: `${GEM_TITLES[i % GEM_TITLES.length]} ${i}`,
          description: `An amazing place to visit. Experience the beauty of ${GEM_TITLES[i % GEM_TITLES.length]}.`,
          location: 'Vibrant City, India',
          photos: photos,
          category: VIBES[i % VIBES.length],
          rating: 4 + Math.random(),
          reviewCount: Math.floor(Math.random() * 200),
          guideId: `guide-${(i % 10) + 1}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
    } else {
      console.log('Updating photos for 100 existing gems...');
      for (const gemDoc of gemSnapshot.docs) {
        const i = parseInt(gemDoc.id.split('-')[1]) || 0;
        await updateDoc(doc(db, 'gems', gemDoc.id), {
          photos: [
            PHOTOS[i % PHOTOS.length],
            PHOTOS[(i + 1) % PHOTOS.length]
          ],
          updatedAt: new Date().toISOString()
        });
      }
    }

    // 2. Seed Community Posts & Comments
    const postsCol = collection(db, 'community_posts');
    const postSnapshot = await getDocs(postsCol);
    
    if (postSnapshot.size === 0) {
      console.log('Creating 50 new community posts with comments...');
      for (let i = 1; i <= 50; i++) {
        const postId = `post-${i}`;
        await setDoc(doc(db, 'community_posts', postId), {
          title: `Adventure in ${GEM_TITLES[i % GEM_TITLES.length]}`,
          content: 'Just had the best time exploring this hidden gem! Highly recommend checking it out.',
          authorId: `user-${(i % 10) + 1}`,
          authorName: 'Traveler Explorer',
          photos: [
            PHOTOS[(i + 2) % PHOTOS.length],
            PHOTOS[(i + 3) % PHOTOS.length]
          ],
          likes: Math.floor(Math.random() * 500),
          commentCount: 3, // Set to a fixed number for seeding
          flagCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });

        // Seed 3 comments for each post
        const commentsCol = collection(db, 'community_posts', postId, 'comments');
        for (let j = 1; j <= 3; j++) {
          await setDoc(doc(commentsCol, `comment-${j}`), {
            text: `This looks like such an amazing ${VIBES[j % VIBES.length]} experience! Thanks for sharing.`,
            authorId: `user-${(j + i) % 10 + 1}`,
            authorName: `Explorer ${ (j + i) % 10 + 1 }`,
            createdAt: new Date().toISOString()
          });
        }
      }
    } else {
      console.log('Updating photos for 50 existing posts...');
      for (const postDoc of postSnapshot.docs) {
        const i = parseInt(postDoc.id.split('-')[1]) || 0;
        await updateDoc(doc(db, 'community_posts', postDoc.id), {
          photos: [
            PHOTOS[(i + 2) % PHOTOS.length],
            PHOTOS[(i + 3) % PHOTOS.length]
          ],
          updatedAt: new Date().toISOString()
        });

        // Ensure comments subcollection has some data if empty
        const commentsCol = collection(db, 'community_posts', postDoc.id, 'comments');
        const commSnap = await getDocs(commentsCol);
        if (commSnap.size === 0) {
          for (let j = 1; j <= 2; j++) {
            await setDoc(doc(commentsCol, `comment-${j}`), {
              text: "Wow, this looks incredible! Added to my wishlist.",
              authorId: 'user-1',
              authorName: "Vibe Explorer",
              createdAt: new Date().toISOString()
            });
          }
          await updateDoc(doc(db, 'community_posts', postDoc.id), { commentCount: 2 });
        }
      }
    }
    return { success: true, message: 'Database force-seeded with working URLs' };
  } catch (error: any) {
    console.error('Seed failed:', error);
    return { success: false, error: error.message };
  }
}

export async function seedHomepageSettings() {
  console.log('Seeding Homepage Settings...');
  try {
    await setDoc(doc(db, 'settings', 'homepage'), {
      heroImages: [
        'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=2000&q=80',
        'https://images.unsplash.com/photo-1534008897995-27a23e859048?auto=format&fit=crop&w=2000&q=80',
        'https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=2000&q=80',
        'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=2000&q=80',
      ],
      features: [
        { icon: 'Compass', title: 'Hidden Gems', description: 'Discover authentic places curated by verified local insiders — far from the tourist traps.' },
        { icon: 'Users', title: 'Local Guides', description: 'Connect with passionate locals who share their city through guided, virtual, or self-paced tours.' },
        { icon: 'Shield', title: 'Safety First', description: 'Verified guides, identity checks, real-time location sharing, and SOS features for peace of mind.' },
        { icon: 'Sparkles', title: 'Smart Matching', description: 'AI-powered recommendations pair you with guides and gems that match your travel vibes.' },
      ],
      updatedAt: new Date().toISOString()
    });
    return { success: true, message: 'Homepage settings seeded successfully!' };
  } catch (error: any) {
    console.error('Settings seed failed:', error);
    return { success: false, error: error.message };
  }
}

export { SEED_GEMS, SEED_GUIDES, SEED_COMMUNITY_POSTS, SEED_USERS };
