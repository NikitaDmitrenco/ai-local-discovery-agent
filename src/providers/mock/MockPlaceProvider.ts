import { PlaceSearchProvider, RawPlaceItem, RawReviewItem } from '../types';
import { Coordinates } from '../../domain/types';

export class MockPlaceProvider implements PlaceSearchProvider {
  name = 'MockPlaceSearchEngine';

  private mockDatabase: RawPlaceItem[] = [
    {
      id: 'mock-ghidighici-wakepark',
      name: 'WakePark Ghidighici & Lakeside Cabins',
      category: 'Wake Park & Countryside Resort',
      address: 'Ghidighici Reservoir Shore, Vatra, Moldova',
      coordinates: { lat: 47.0792, lng: 28.7294 },
      rating: 4.8,
      userRatingsTotal: 342,
      openingHours: ['Sunday: 09:00 – 22:00', 'Monday: Closed', 'Tue-Sat: 10:00 – 21:00'],
      types: ['sports_complex', 'lodging', 'park', 'campground'],
      photoUrls: [
        'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
      ],
      website: 'https://wakepark-moldova.example.com',
      phoneNumber: '+373 69 123 456',
      rawAttributes: {
        hasCableWakeboard: true,
        hasCabins: true,
        cabinCount: 8,
        allowsNightStay: true,
        noiseLevel: 'low',
        environment: 'lake_nature',
      },
    },
    {
      id: 'mock-costesti-resort',
      name: 'Costești Lakeside Complex & Eco Villas',
      category: 'Lake Resort & Water Recreation',
      address: 'Costești Lake Shore, Ialoveni District, Moldova',
      coordinates: { lat: 46.8672, lng: 28.7758 },
      rating: 4.6,
      userRatingsTotal: 489,
      openingHours: ['Sunday: 08:00 – 23:00', 'Mon-Sat: 08:00 – 23:00'],
      types: ['resort_hotel', 'restaurant', 'water_sports'],
      photoUrls: [
        'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1508873696983-2df5293cb32b?auto=format&fit=crop&w=1200&q=80',
      ],
      website: 'https://costesti-resort.example.com',
      phoneNumber: '+373 22 888 999',
      rawAttributes: {
        hasBoatTowing: true,
        hasJetSki: true,
        hasVillas: true,
        allowsNightStay: true,
        noiseLevel: 'medium_afternoon_quiet_evening',
        environment: 'lake_resort',
      },
    },
    {
      id: 'mock-nistru-glamping',
      name: 'Nistru River Glamping & Kayak Haven',
      category: 'Eco Glamping & River Adventures',
      address: 'Vadul lui Vodă - Molovata Riverbank, Moldova',
      coordinates: { lat: 47.1952, lng: 29.0831 },
      rating: 4.9,
      userRatingsTotal: 178,
      openingHours: ['Sunday: 08:00 – 22:00', 'Mon-Sat: 08:00 – 22:00'],
      types: ['campground', 'lodging', 'adventure_sports'],
      photoUrls: [
        'https://images.unsplash.com/photo-1526772662000-3f88f10405ff?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80',
      ],
      website: 'https://nistru-glamping.example.com',
      phoneNumber: '+373 78 555 123',
      rawAttributes: {
        hasKayaks: true,
        hasPaddleboards: true,
        hasSafariDomes: true,
        allowsNightStay: true,
        noiseLevel: 'ultra_quiet',
        environment: 'river_nature',
      },
    },
    {
      id: 'mock-suruceni-lodge',
      name: 'Suruceni Aqua Lodge & Lake House',
      category: 'Lake Lodge & Family Relaxation',
      address: 'Suruceni Lake, Ialoveni, Moldova',
      coordinates: { lat: 46.9785, lng: 28.6678 },
      rating: 4.5,
      userRatingsTotal: 215,
      openingHours: ['Sunday: 08:00 – 22:00', 'Mon-Sat: 08:00 – 22:00'],
      types: ['lodging', 'park'],
      photoUrls: [
        'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1200&q=80',
      ],
      website: 'https://suruceni-lodge.example.com',
      phoneNumber: '+373 22 444 333',
      rawAttributes: {
        hasCatamarans: true,
        hasChalets: true,
        allowsNightStay: true,
        noiseLevel: 'quiet',
        environment: 'small_lake',
      },
    },
  ];

  private mockReviews: Record<string, RawReviewItem[]> = {
    'mock-ghidighici-wakepark': [
      {
        authorName: 'Alexandru M.',
        rating: 5,
        text: 'Best wakeboarding in Moldova! The cable system is top notch and the instructors are super helpful. Stayed in the wooden cabin overnight, sunset was incredible.',
        relativeTimeDescription: '2 weeks ago',
      },
      {
        authorName: 'Elena V.',
        rating: 5,
        text: 'Super peaceful on Sunday evenings. Very quiet outside the city. The cabins are warm and have clean showers.',
        relativeTimeDescription: 'a month ago',
      },
      {
        authorName: 'Dumitru C.',
        rating: 4,
        text: 'Great spot for water sports. Road is slightly rough the last 500 meters, but totally worth it.',
        relativeTimeDescription: '3 months ago',
      },
    ],
    'mock-costesti-resort': [
      {
        authorName: 'Sergiu R.',
        rating: 5,
        text: 'Lovely lake resort. Rented SUP boards and had a great dinner overlooking the water. Clean villas for overnight stay.',
        relativeTimeDescription: '1 month ago',
      },
      {
        authorName: 'Maria T.',
        rating: 4,
        text: 'Pool area was lively in the afternoon, but by 7 PM everything turned into a quiet, relaxing nature oasis.',
        relativeTimeDescription: '2 months ago',
      },
    ],
    'mock-nistru-glamping': [
      {
        authorName: 'Ion B.',
        rating: 5,
        text: 'Magical glamping right by the river. Complete silence, starry sky, and great morning kayaking along the canyon.',
        relativeTimeDescription: '3 weeks ago',
      },
      {
        authorName: 'Vera K.',
        rating: 5,
        text: 'The safari tents are luxurious with cozy beds and heated stoves. Ideal romantic getaway.',
        relativeTimeDescription: 'a month ago',
      },
    ],
    'mock-suruceni-lodge': [
      {
        authorName: 'Vitalie G.',
        rating: 5,
        text: 'Very close to Chisinau, only 15 minutes. Great peaceful lake, cozy wooden chalet for overnight sleep.',
        relativeTimeDescription: '2 months ago',
      },
    ],
  };

  async searchPlaces(
    queries: string[],
    location: Coordinates,
    radiusKm: number
  ): Promise<RawPlaceItem[]> {
    // Return all candidate places matching any of the semantic categories
    return this.mockDatabase;
  }

  async getPlaceDetails(placeId: string): Promise<RawPlaceItem | null> {
    return this.mockDatabase.find((p) => p.id === placeId) || null;
  }

  async getReviews(placeId: string): Promise<RawReviewItem[]> {
    return this.mockReviews[placeId] || [];
  }

  async getPhotos(placeId: string): Promise<string[]> {
    const place = this.mockDatabase.find((p) => p.id === placeId);
    return place?.photoUrls || [];
  }
}
