export interface MockPlace {
  id: string;
  name: string;
  category: string;
  matchScore: number;
  matchReason: string;
  potentialDownside: string;
  distance: string;
  travelTime: string;
  address: string;
  coordinates: { lat: number; lng: number };
  rating: number;
  reviewCount: number;
  description: string;
  activities: string[];
  amenities: string[];
  accommodation: {
    available: boolean;
    type: string;
    details: string;
    verified: boolean;
  };
  openingHours: string;
  reputation: {
    pros: string[];
    cons: string[];
    summary: string;
  };
  photos: {
    url: string;
    caption: string;
    verified: boolean;
    source: string;
  }[];
  sources: {
    name: string;
    url?: string;
    claim: string;
  }[];
  tags: string[];
}

export const MOCK_PLACES: MockPlace[] = [
  {
    id: 'wakepark-chisinau',
    name: 'WakePark Ghidighici & Lakeside Cabins',
    category: 'Wake Park & Countryside Resort',
    matchScore: 96,
    matchReason: 'Perfect fit for a quiet Sunday evening with cable wakeboarding, lakefront eco-cabins, and peaceful sunset water sessions outside the city.',
    potentialDownside: 'Cafe kitchen closes at 20:30; pre-order dinner recommended for late arrivals.',
    distance: '18 km from center',
    travelTime: '25 min drive',
    address: 'Ghidighici Reservoir Shore, Vatra, Moldova',
    coordinates: { lat: 47.0792, lng: 28.7294 },
    rating: 4.8,
    reviewCount: 342,
    description: 'Premier water sports park featuring a two-tower and full-size cable wakeboarding system, standalone wooden cabins surrounded by pine trees, and a quiet private beach.',
    activities: ['🌊 Cable Wakeboarding', '🏄 SUP Boarding', '🏊 Private Beach Lake Swimming', '🧖 Wood-Fired Sauna'],
    amenities: ['Lakeside Cottages', 'Equipment Rental', 'Instructor Coaching', 'Lounge Terrace', 'Free Parking', 'Wi-Fi'],
    accommodation: {
      available: true,
      type: 'Scandinavian Wooden Cabins (2-4 guests)',
      details: 'Heated lakeside cabins with private decks, panoramic water views, and breakfast included.',
      verified: true,
    },
    openingHours: 'Sun: 09:00 - 22:00 (Water equipment active until sunset)',
    reputation: {
      pros: [
        'Superb clean water and modern wake gear with patient instructors',
        'Quiet evening atmosphere away from highway noise',
        'Cozy warm cabins with breathtaking sunset views over the reservoir',
      ],
      cons: [
        'Access road from main highway has a 500m unpaved section',
        'Advance booking required for overnight stays on weekends',
      ],
      summary: 'Visitors consistently highlight the serene water experience, top-tier wakeboarding gear, and peaceful rustic overnight lodging.',
    },
    photos: [
      {
        url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80',
        caption: 'Cable wakeboarding line across Ghidighici reservoir during golden hour',
        verified: true,
        source: 'Official Venue Photography',
      },
      {
        url: 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=1200&q=80',
        caption: 'Lakeside Scandinavian cabin deck nestled in pines',
        verified: true,
        source: 'Verified Guest Listing',
      },
      {
        url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
        caption: 'Sunset water lounge and calm swimming dock',
        verified: true,
        source: 'Local Map Submission',
      },
    ],
    sources: [
      { name: 'Official Website', claim: 'Overnight eco-cabins & full wakeboard setup' },
      { name: 'Google Maps Reviews (340+)', claim: '4.8/5 verified visitor rating' },
      { name: 'Water Sports Federation Mold', claim: 'Certified cable wake park facility' },
    ],
    tags: ['Water Sports', 'Overnight Cabins', 'Quiet', 'Sunset Views', 'Outside City'],
  },
  {
    id: 'costesti-lake-resort',
    name: 'Costești Lakeside Complex & Eco Villas',
    category: 'Lake Resort & Water Recreation',
    matchScore: 91,
    matchReason: 'Excellent countryside water destination with SUP rentals, jet skis, lakeside bungalows, and a tranquil nature ambiance.',
    potentialDownside: 'Can be lively around the pool area during mid-day, but becomes exceptionally quiet after 19:00.',
    distance: '24 km south',
    travelTime: '32 min drive',
    address: 'Costești Lake Shore, Ialoveni District, Moldova',
    coordinates: { lat: 46.8672, lng: 28.7758 },
    rating: 4.6,
    reviewCount: 489,
    description: 'Expansive lakeside recreation base featuring lake boating, water ski towing, modern eco-villas with panoramic glass walls, and fine local dining.',
    activities: ['🏄 SUP & Hydro-bikes', '🚤 Boat Towing & Tubes', '🎣 Catch & Release Fishing', '🏊 Outdoor Heated Pool'],
    amenities: ['Lakeside Hotel & Villas', 'Terrace Restaurant', 'Sauna Complex', 'BBQ Gazebos', 'Secure Parking'],
    accommodation: {
      available: true,
      type: 'Lakeside Boutique Rooms & Private Villas',
      details: 'Comfortable air-conditioned rooms overlooking the lake with en-suite bathrooms and room service.',
      verified: true,
    },
    openingHours: 'Sun: 08:00 - 23:00 (Hotel check-in 24/7)',
    reputation: {
      pros: [
        'Well-maintained grounds and spotless lakeside rooms',
        'Great watercraft rentals and sunset boat rides',
        'High quality Moldovan cuisine at the water terrace',
      ],
      cons: [
        'Pool area busy on hot Sunday afternoons before quiet evening',
      ],
      summary: 'Renowned for scenic lake views, good water activities, and relaxing overnight accommodations.',
    },
    photos: [
      {
        url: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=1200&q=80',
        caption: 'Lakeside villa terrace with private water access',
        verified: true,
        source: 'Resort Official Listing',
      },
      {
        url: 'https://images.unsplash.com/photo-1508873696983-2df5293cb32b?auto=format&fit=crop&w=1200&q=80',
        caption: 'Paddle boarding on calm Costesti lake waters',
        verified: true,
        source: 'Verified Traveler Photo',
      },
    ],
    sources: [
      { name: 'Direct Booking Platform', claim: 'Active villa reservations & lake activities' },
      { name: 'TripAdvisor & Google Reviews', claim: '4.6/5 aggregate rating across 480+ visits' },
    ],
    tags: ['Lakefront', 'Eco Villas', 'Water Skiing', 'Restaurant', 'Scenic'],
  },
  {
    id: 'dniester-glamping-haven',
    name: 'Nistru River Glamping & Kayak Haven',
    category: 'Eco Glamping & River Adventures',
    matchScore: 88,
    matchReason: 'Unmatched tranquil riverfront location with sunset kayaking, safari tent glamping, and deep nature silence.',
    potentialDownside: 'No motorized wakeboards (pure paddle and kayak); limited cellular reception for ultimate digital detox.',
    distance: '38 km east',
    travelTime: '45 min drive',
    address: 'Vadul lui Vodă - Molovata Riverbank, Moldova',
    coordinates: { lat: 47.1952, lng: 29.0831 },
    rating: 4.9,
    reviewCount: 178,
    description: 'Secluded riverfront glamping retreat offering premium safari tents with plush king beds, guided sunset kayak tours along limestone cliffs, and campfire dining.',
    activities: ['🛶 River Kayaking', '🏄 Sunset Paddleboarding', '🔥 Campfire Stargazing', '🌲 Forest Hiking Trails'],
    amenities: ['Luxury Safari Tents', 'Private Bathhouses', 'Campfire Lounge', 'Farm-to-table Breakfast', 'Kayak Rentals'],
    accommodation: {
      available: true,
      type: 'Insulated Glamping Safari Domes & Tents',
      details: 'Furnished luxury tents with wood-burning stoves, electrical hookups, and plush orthopedic beds.',
      verified: true,
    },
    openingHours: 'Sun: 08:00 - 22:00',
    reputation: {
      pros: [
        'Total peaceful silence and natural river scenery',
        'Crystal clear night sky and magical campfire atmosphere',
        'Top condition kayaks and safety equipment provided',
      ],
      cons: [
        'Must walk 150m from car parking to riverfront tents',
      ],
      summary: 'Beloved by couples and quiet-seekers for pure nature immersion and effortless sunset paddling.',
    },
    photos: [
      {
        url: 'https://images.unsplash.com/photo-1526772662000-3f88f10405ff?auto=format&fit=crop&w=1200&q=80',
        caption: 'Luxury glamping dome illuminated beside the calm river at dusk',
        verified: true,
        source: 'Official Glamping Host',
      },
      {
        url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80',
        caption: 'Kayaking at dusk under dramatic river canyon cliffs',
        verified: true,
        source: 'Verified River Tour Guide',
      },
    ],
    sources: [
      { name: 'Eco-Tourism Moldova Registry', claim: 'Certified sustainable glamping site' },
      { name: 'Airbnb Superhost & Google', claim: '4.9/5 stars from 175+ reviews' },
    ],
    tags: ['Glamping', 'Kayaking', 'Ultra Quiet', 'Riverfront', 'Romantic'],
  },
  {
    id: 'suruceni-lake-club',
    name: 'Suruceni Aqua Lodge & Lake House',
    category: 'Lake Lodge & Family Relaxation',
    matchScore: 84,
    matchReason: 'Very close to city (15 min), offers electric catamaran rentals, quiet lakefront fishing, and wooden chalets for overnight stay.',
    potentialDownside: 'Smaller water area without high-speed wakeboard cable.',
    distance: '14 km west',
    travelTime: '18 min drive',
    address: 'Suruceni Lake, Ialoveni, Moldova',
    coordinates: { lat: 46.9785, lng: 28.6678 },
    rating: 4.5,
    reviewCount: 215,
    description: 'Peaceful lake retreat with private family chalets, electric boat rentals, lush green lawns, and outdoor BBQ spaces.',
    activities: ['⛵ Electric Catamarans', '🎣 Lake Fishing', '🚲 Lakeside Cycling', '🍖 Private BBQ'],
    amenities: ['Wooden Chalets', 'Terraces', 'Children Playground', 'Firepits'],
    accommodation: {
      available: true,
      type: '2-Story Wooden Lake Chalets',
      details: 'Self-contained chalets with kitchenettes and lakeside balconies.',
      verified: true,
    },
    openingHours: 'Sun: 08:00 - 22:00',
    reputation: {
      pros: ['Very quick drive from Chișinău', 'Peaceful, calm water and easy boat rental'],
      cons: ['Limited food menu on Sunday evenings'],
      summary: 'Great quick getaway near the capital with serene water views.',
    },
    photos: [
      {
        url: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1200&q=80',
        caption: 'Quiet morning boat dock on Suruceni lake',
        verified: true,
        source: 'Lodge Listing',
      },
    ],
    sources: [
      { name: 'Local Business Registry', claim: 'Active chalet and boat rental' },
    ],
    tags: ['Close to City', 'Lake Lodges', 'Catamarans', 'Family Friendly'],
  },
];

export const MOCK_REFINEMENT_SUGGESTIONS: Record<string, MockPlace[]> = {
  closer: [
    MOCK_PLACES[3], // Suruceni (14km)
    MOCK_PLACES[0], // Ghidighici (18km)
    MOCK_PLACES[1], // Costesti (24km)
  ],
  quieter: [
    MOCK_PLACES[2], // Nistru Glamping (4.9 quiet)
    MOCK_PLACES[0], // WakePark Ghidighici
    MOCK_PLACES[3], // Suruceni
  ],
  cheaper: [
    MOCK_PLACES[3], // Suruceni
    MOCK_PLACES[2], // Nistru Glamping
    MOCK_PLACES[0], // Ghidighici
  ],
  more_activities: [
    MOCK_PLACES[0], // WakePark (wake, SUP, swimming, sauna)
    MOCK_PLACES[1], // Costesti (ski, boats, pool)
    MOCK_PLACES[2], // Nistru
  ],
};
