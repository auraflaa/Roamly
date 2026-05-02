import { collection, doc, setDoc, Timestamp } from 'firebase/firestore';
import { db } from './firebase';

const SEED_GEMS = [
  {
    id: 'gem-1',
    title: 'Sunrise Fort Trail Hidden Viewpoint',
    description: 'A breathtaking sunrise spot only known to locals, perched on an ancient fort wall that overlooks the entire valley. The golden hour here paints the landscape in amber and rose, with mist rolling through the ravines below. Best visited during autumn when the air is crisp and the skies are clear.',
    photos: [
      'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1000'
    ],
    location: { lat: 26.9124, lng: 75.7873, address: 'Old Fort, Jaipur', city: 'Jaipur', nearestLandmark: 'Nahargarh Fort' },
    vibes: ['Adventure', 'Nature'],
    bestTime: { timeOfDay: 'Sunrise', season: 'Autumn' },
    whatToBring: ['Water bottle', 'Camera', 'Comfortable shoes'],
    isCommunityGem: false,
    guideId: 'guide-1',
    moderationStatus: 'approved' as const,
    flagCount: 0,
    rating: 4.8,
    reviewCount: 24,
    createdAt: Timestamp.now(),
    price: 2500,
  },
  {
    id: 'gem-2',
    title: 'Secret Spice Market Alley',
    description: 'Tucked behind the main bazaar, this narrow alley is where local chefs buy their spices. The air is thick with the scent of cardamom, turmeric, and fresh cinnamon. A 200-year-old family-run stall here still grinds spices by hand using traditional stone mills. Taste rare blends you won\'t find anywhere else.',
    photos: [
      'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1532336414038-cf19250c5757?auto=format&fit=crop&q=80&w=1000'
    ],
    location: { lat: 26.9236, lng: 75.8237, address: 'Johari Bazaar, Jaipur', city: 'Jaipur', nearestLandmark: 'Hawa Mahal' },
    vibes: ['Food', 'Culture'],
    bestTime: { timeOfDay: 'Morning', season: 'Any' },
    whatToBring: ['Cash', 'Shopping bags', 'Curious palate'],
    isCommunityGem: false,
    guideId: 'guide-2',
    moderationStatus: 'approved' as const,
    flagCount: 0,
    rating: 4.9,
    reviewCount: 42,
    createdAt: Timestamp.now(),
    price: 1500,
  },
  {
    id: 'gem-3',
    title: 'Moonlit Rooftop Temple Meditation',
    description: 'An ancient rooftop temple accessible through a hidden staircase in the old quarter. During full moon nights, local monks lead silent meditation sessions open to visitors. The panoramic view of the sleeping city under moonlight is absolutely transformative. Arrive 30 minutes early for the best spot.',
    photos: [
      'https://images.unsplash.com/photo-1545389336-cf090694435e?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=1000'
    ],
    location: { lat: 27.1751, lng: 78.0421, address: 'Old Quarter, Agra', city: 'Agra', nearestLandmark: 'Near Taj Mahal East Gate' },
    vibes: ['Spiritual', 'Relaxation'],
    bestTime: { timeOfDay: 'Night', season: 'Full Moon' },
    whatToBring: ['Meditation cushion', 'Light shawl', 'Open mind'],
    isCommunityGem: false,
    guideId: 'guide-1',
    moderationStatus: 'approved' as const,
    flagCount: 0,
    rating: 4.7,
    reviewCount: 18,
    createdAt: Timestamp.now(),
    price: 0,
  },
  {
    id: 'gem-4',
    title: 'Underground Art Gallery District',
    description: 'Beneath an old textile factory lies a thriving underground art scene. Local and international artists display their work in converted basement galleries. Street art murals cover the approach walls, and every second Saturday hosts a live art jam session with music and food trucks.',
    photos: [
      'https://images.unsplash.com/photo-1561214115-f2f134cc4912?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1578301978693-85fa9fd0c9d4?auto=format&fit=crop&q=80&w=1000'
    ],
    location: { lat: 19.0760, lng: 72.8777, address: 'Worli Art District, Mumbai', city: 'Mumbai', nearestLandmark: 'Lower Parel Station' },
    vibes: ['Art', 'Culture'],
    bestTime: { timeOfDay: 'Evening', season: 'Any' },
    whatToBring: ['Camera', 'Notebook', 'Art appreciation'],
    isCommunityGem: true,
    postedBy: 'user-1',
    moderationStatus: 'approved' as const,
    flagCount: 0,
    rating: 4.6,
    reviewCount: 31,
    createdAt: Timestamp.now(),
    price: 500,
  },
  {
    id: 'gem-5',
    title: 'Dawn Fisherman Beach Walk',
    description: 'Join local fishermen at dawn as they pull in their morning catch on this quiet stretch of beach. Watch traditional fishing techniques passed down for generations. The fish market sets up right on the sand—buy the freshest seafood imaginable and have it cooked at a nearby shack.',
    photos: [
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&q=80&w=1000'
    ],
    location: { lat: 15.2993, lng: 74.1240, address: 'Benaulim Beach, Goa', city: 'Goa', nearestLandmark: 'Benaulim Church' },
    vibes: ['Nature', 'Food', 'Culture'],
    bestTime: { timeOfDay: 'Dawn', season: 'Winter' },
    whatToBring: ['Sunscreen', 'Cash', 'Early wake-up alarm'],
    isCommunityGem: false,
    guideId: 'guide-3',
    moderationStatus: 'approved' as const,
    flagCount: 0,
    rating: 4.5,
    reviewCount: 15,
    createdAt: Timestamp.now(),
    price: 2000,
  },
  {
    id: 'gem-6',
    title: 'Heritage Stepwell Photography Tour',
    description: 'Explore a magnificent 11th-century stepwell that few tourists know about. The geometric patterns of the descending stairs create incredible photography opportunities. At noon, the sunlight hits the water at a perfect angle, creating a mirror-like reflection of the intricate carvings above.',
    photos: [
      'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1590050751624-c79b0150d7dc?auto=format&fit=crop&q=80&w=1000'
    ],
    location: { lat: 23.8583, lng: 72.1365, address: 'Rani ki Vav Area, Patan', city: 'Patan', nearestLandmark: 'Patan Bus Station' },
    vibes: ['Architecture', 'Culture', 'Art'],
    bestTime: { timeOfDay: 'Noon', season: 'Spring' },
    whatToBring: ['Camera with wide lens', 'Water', 'Sun hat'],
    isCommunityGem: false,
    guideId: 'guide-2',
    moderationStatus: 'approved' as const,
    flagCount: 0,
    rating: 4.9,
    reviewCount: 37,
    createdAt: Timestamp.now(),
    price: 3000,
  },
];

const SEED_GUIDES = [
  {
    uid: 'guide-1',
    displayName: 'Arjun Mehta',
    bio: 'Born and raised in the heart of Rajasthan, I\'ve spent 15 years uncovering hidden trails, secret temples, and forgotten stories of this magnificent land. As a certified heritage guide, I specialize in connecting travelers with the authentic spirit of India that exists beyond the tourist brochures.',
    languages: [
      { language: 'English', proficiency: 'fluent' as const },
      { language: 'Hindi', proficiency: 'native' as const },
      { language: 'French', proficiency: 'conversational' as const },
    ],
    city: 'Jaipur',
    specialties: ['Adventure', 'Culture', 'Spiritual', 'Architecture'],
    verificationStatus: 'approved' as const,
    verificationDocs: { idFront: '', idBack: '' },
    responseRate: 96,
    rating: 4.8,
    reviewCount: 67,
    isFemale: false,
    isOnline: true,
    availability: {
      Monday: { online: true, inPerson: true, slots: [{ start: '08:00', end: '18:00' }] },
      Tuesday: { online: true, inPerson: true, slots: [{ start: '08:00', end: '18:00' }] },
      Wednesday: { online: true, inPerson: false, slots: [{ start: '10:00', end: '14:00' }] },
      Thursday: { online: true, inPerson: true, slots: [{ start: '08:00', end: '18:00' }] },
      Friday: { online: true, inPerson: true, slots: [{ start: '08:00', end: '18:00' }] },
      Saturday: { online: true, inPerson: true, slots: [{ start: '06:00', end: '20:00' }] },
      Sunday: { online: false, inPerson: false, slots: [] },
    },
    earningsBalance: 45000,
    trainingCompleted: true,
    trustScore: 92,
  },
  {
    uid: 'guide-2',
    displayName: 'Priya Sharma',
    bio: 'Food is my love language and exploring hidden food lanes is my passion. After training as a chef in Paris, I returned home to discover that the most extraordinary flavors were always right here. I now share these culinary secrets with travelers who want to taste India beyond butter chicken.',
    languages: [
      { language: 'English', proficiency: 'fluent' as const },
      { language: 'Hindi', proficiency: 'native' as const },
      { language: 'Gujarati', proficiency: 'native' as const },
    ],
    city: 'Jaipur',
    specialties: ['Food', 'Culture', 'Art'],
    verificationStatus: 'approved' as const,
    verificationDocs: { idFront: '', idBack: '' },
    responseRate: 98,
    rating: 4.9,
    reviewCount: 89,
    isFemale: true,
    isOnline: true,
    availability: {
      Monday: { online: true, inPerson: true, slots: [{ start: '09:00', end: '17:00' }] },
      Tuesday: { online: true, inPerson: true, slots: [{ start: '09:00', end: '17:00' }] },
      Wednesday: { online: true, inPerson: true, slots: [{ start: '09:00', end: '17:00' }] },
      Thursday: { online: false, inPerson: false, slots: [] },
      Friday: { online: true, inPerson: true, slots: [{ start: '09:00', end: '17:00' }] },
      Saturday: { online: true, inPerson: true, slots: [{ start: '08:00', end: '20:00' }] },
      Sunday: { online: true, inPerson: false, slots: [{ start: '10:00', end: '14:00' }] },
    },
    earningsBalance: 67500,
    trainingCompleted: true,
    trustScore: 97,
  },
  {
    uid: 'guide-3',
    displayName: 'Rohan D\'Souza',
    bio: 'A marine biologist turned local guide, I specialize in coastal and nature experiences in Goa. From secret beaches to wildlife spotting, I help travelers connect with the natural beauty that makes this coast magical. Sustainability and respect for local ecosystems are at the heart of every tour I lead.',
    languages: [
      { language: 'English', proficiency: 'native' as const },
      { language: 'Konkani', proficiency: 'native' as const },
      { language: 'Portuguese', proficiency: 'conversational' as const },
    ],
    city: 'Goa',
    specialties: ['Nature', 'Adventure', 'Food', 'Relaxation'],
    verificationStatus: 'approved' as const,
    verificationDocs: { idFront: '', idBack: '' },
    responseRate: 91,
    rating: 4.7,
    reviewCount: 34,
    isFemale: false,
    isOnline: false,
    availability: {
      Monday: { online: false, inPerson: true, slots: [{ start: '06:00', end: '12:00' }] },
      Tuesday: { online: false, inPerson: true, slots: [{ start: '06:00', end: '12:00' }] },
      Wednesday: { online: true, inPerson: true, slots: [{ start: '06:00', end: '18:00' }] },
      Thursday: { online: false, inPerson: true, slots: [{ start: '06:00', end: '12:00' }] },
      Friday: { online: false, inPerson: true, slots: [{ start: '06:00', end: '12:00' }] },
      Saturday: { online: true, inPerson: true, slots: [{ start: '05:00', end: '20:00' }] },
      Sunday: { online: true, inPerson: true, slots: [{ start: '05:00', end: '20:00' }] },
    },
    earningsBalance: 28000,
    trainingCompleted: true,
    trustScore: 88,
  },
];

const SEED_USERS = [
  {
    uid: 'guide-1',
    email: 'arjun@roamly.com',
    displayName: 'Arjun Mehta',
    role: 'guide' as const,
    createdAt: Timestamp.now(),
    savedGems: [],
    wishlist: [],
    vibes: ['Adventure', 'Culture'],
  },
  {
    uid: 'guide-2',
    email: 'priya@roamly.com',
    displayName: 'Priya Sharma',
    role: 'guide' as const,
    createdAt: Timestamp.now(),
    savedGems: [],
    wishlist: [],
    vibes: ['Food', 'Culture'],
    isFemale: true,
  },
  {
    uid: 'guide-3',
    email: 'rohan@roamly.com',
    displayName: 'Rohan D\'Souza',
    role: 'guide' as const,
    createdAt: Timestamp.now(),
    savedGems: [],
    wishlist: [],
    vibes: ['Nature', 'Adventure'],
  },
];

const SEED_COMMUNITY_POSTS = [
  {
    id: 'post-1',
    authorId: 'user-1',
    authorName: 'Sarah Chen',
    photos: ['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800'],
    title: 'Found this magical sunrise spot!',
    description: 'Woke up at 4am and it was absolutely worth it. The fort ruins have this perfect gap in the wall that frames the sunrise. Ask locals for the "photographer\'s window"—they all know it!',
    vibeTags: ['Nature', 'Adventure'],
    moderationStatus: 'approved' as const,
    flagCount: 0,
    flaggedBy: [],
    likes: 42,
    likedBy: [],
    commentCount: 7,
    createdAt: Timestamp.now(),
  },
  {
    id: 'post-2',
    authorId: 'user-2',
    authorName: 'Marco Rodriguez',
    photos: ['https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800'],
    title: 'Best street food I\'ve ever had',
    description: 'Priya took me to this tiny stall behind the spice market. The masala chai and samosas were out of this world. I\'ve been trying to recreate the recipe since I got home!',
    vibeTags: ['Food', 'Culture'],
    moderationStatus: 'approved' as const,
    flagCount: 0,
    flaggedBy: [],
    likes: 78,
    likedBy: [],
    commentCount: 12,
    createdAt: Timestamp.now(),
  },
  {
    id: 'post-3',
    authorId: 'user-3',
    authorName: 'Emma Williams',
    photos: ['https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800'],
    title: 'The stepwell was breathtaking',
    description: 'If you love architecture and photography, this place is a dream. Go around noon when the light creates perfect shadows on the carved walls. Bring a wide-angle lens!',
    vibeTags: ['Architecture', 'Art'],
    moderationStatus: 'approved' as const,
    flagCount: 0,
    flaggedBy: [],
    likes: 56,
    likedBy: [],
    commentCount: 9,
    createdAt: Timestamp.now(),
  },
];

export async function seedDatabase() {
  try {
    // Seed gems
    for (const gem of SEED_GEMS) {
      await setDoc(doc(db, 'gems', gem.id), gem);
    }

    // Seed users (guide users)
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

    console.log('Database seeded successfully!');
    return true;
  } catch (error) {
    console.error('Error seeding database:', error);
    return false;
  }
}

// Export seed data for use without Firestore (fallback display)
export { SEED_GEMS, SEED_GUIDES, SEED_COMMUNITY_POSTS, SEED_USERS };
