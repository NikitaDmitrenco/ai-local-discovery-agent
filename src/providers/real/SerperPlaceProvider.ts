import { PlaceSearchProvider, RawPlaceItem, RawReviewItem } from '../types';
import { Coordinates } from '../../domain/types';

export class SerperPlaceProvider implements PlaceSearchProvider {
  name = 'SerperGooglePlaces';
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async searchPlaces(
    queries: string[],
    location: Coordinates,
    radiusKm: number
  ): Promise<RawPlaceItem[]> {
    if (!this.apiKey) return [];

    try {
      const places: RawPlaceItem[] = [];

      // Query the first 2-3 most distinct hypotheses
      const selectedQueries = queries.slice(0, 3);

      for (const q of selectedQueries) {
        const response = await fetch('https://google.serper.dev/places', {
          method: 'POST',
          headers: {
            'X-API-KEY': this.apiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            q: `${q} near Chisinau Moldova`,
            gl: 'md',
            hl: 'ru',
          }),
        });

        if (!response.ok) continue;

        const data = await response.json();
        const items = data.places || [];

        for (const item of items) {
          if (!item.title || !item.latitude || !item.longitude) continue;

          places.push({
            id: `serper-${item.cid || item.title.toLowerCase().replace(/\s+/g, '-')}`,
            name: item.title,
            category: item.category || 'Recreation Center',
            address: item.address || 'Moldova',
            coordinates: { lat: item.latitude, lng: item.longitude },
            rating: item.rating || 4.5,
            userRatingsTotal: item.ratingCount || 100,
            phoneNumber: item.phoneNumber,
            website: item.website,
            photoUrls: item.thumbnail ? [item.thumbnail] : [],
          });
        }
      }

      return places;
    } catch (error) {
      console.warn('Serper place search error:', error);
      return [];
    }
  }

  async getPlaceDetails(placeId: string): Promise<RawPlaceItem | null> {
    return null;
  }

  async getReviews(placeId: string): Promise<RawReviewItem[]> {
    return [];
  }

  async getPhotos(placeId: string): Promise<string[]> {
    return [];
  }
}
