import { collection, doc, setDoc, Timestamp } from 'firebase/firestore';
import { db } from './firebase';

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
  'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&q=80&w=1000',
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1000',
  'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&q=80&w=1000',
  'https://images.unsplash.com/photo-1532336414038-cf19250c5757?auto=format&fit=crop&q=80&w=1000',
  'https://images.unsplash.com/photo-1545389336-cf090694435e?auto=format&fit=crop&q=80&w=1000',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=1000',
  'https://images.unsplash.com/photo-1561214115-f2f134cc4912?auto=format&fit=crop&q=80&w=1000',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=1000',
  'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&q=80&w=1000',
  'https://images.unsplash.com/photo-1514222139-b57c44ce073d?auto=format&fit=crop&q=80&w=1000',
  'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&q=80&w=1000',
  'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&q=80&w=1000',
  'https://images.unsplash.com/photo-1526772662000-3f88f10405ff?auto=format&fit=crop&q=80&w=1000',
  'https://images.unsplash.com/photo-1513415277900-a62401e19be4?auto=format&fit=crop&q=80&w=1000',
  'https://images.unsplash.com/photo-1548013146-72479768bbaa?auto=format&fit=crop&q=80&w=1000',
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
  try {
    // Seed gems
    for (const gem of SEED_GEMS) {
      await setDoc(doc(db, 'gems', gem.id), gem);
    }
    // Seed users
    for (const user of SEED_USERS) {
      await setDoc(doc(db, 'users', user.uid), user);
    }
    // Seed guides
    for (const guide of SEED_GUIDES) {
      await setDoc(doc(db, 'guides', guide.uid), guide);
    }
    // Seed community posts
    for (const post of SEED_COMMUNITY_POSTS) {
      await setDoc(doc(db, 'community_posts', post.id), post);
    }
    console.log('Database seeded with 100+ items successfully!');
    return true;
  } catch (error) {
    console.error('Error seeding database:', error);
    return false;
  }
}

export { SEED_GEMS, SEED_GUIDES, SEED_COMMUNITY_POSTS, SEED_USERS };
