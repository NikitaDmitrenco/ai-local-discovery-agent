import { PlaceSearchProvider, RawPlaceItem, RawReviewItem } from '../types';
import { Coordinates } from '../../domain/types';
import { OverpassPlaceProvider } from './OverpassPlaceProvider';
import { SerperPlaceProvider } from './SerperPlaceProvider';
import { SupabasePlaceProvider } from './SupabasePlaceProvider';
import { arePlacesDuplicates } from '../../utils/geo';

export class AggregatedPlaceProvider implements PlaceSearchProvider {
  name = 'MultiSourceAggregatedPlaceProvider';
  private overpassProvider: OverpassPlaceProvider;
  private serperProvider?: SerperPlaceProvider;
  private supabaseProvider: SupabasePlaceProvider;

  constructor() {
    this.overpassProvider = new OverpassPlaceProvider();
    this.supabaseProvider = new SupabasePlaceProvider();
    const serperKey = process.env.SERPER_API_KEY;
    if (serperKey) {
      this.serperProvider = new SerperPlaceProvider(serperKey);
    }
  }

  async searchPlaces(
    queries: string[],
    location: Coordinates,
    radiusKm: number
  ): Promise<RawPlaceItem[]> {
    const combined: RawPlaceItem[] = [];

    // 1. Run live Overpass & Serper in parallel
    const searchPromises: Promise<RawPlaceItem[]>[] = [
      this.overpassProvider.searchPlaces(queries, location, radiusKm),
    ];

    if (this.serperProvider) {
      searchPromises.push(this.serperProvider.searchPlaces(queries, location, radiusKm));
    }

    try {
      const results = await Promise.allSettled(searchPromises);
      for (const res of results) {
        if (res.status === 'fulfilled' && Array.isArray(res.value)) {
          for (const item of res.value) {
            const isDup = combined.some((existing) =>
              arePlacesDuplicates(existing.name, existing.coordinates, item.name, item.coordinates)
            );
            if (!isDup) {
              combined.push(item);
            }
          }
        }
      }
    } catch (e) {
      console.warn('Aggregated search error, falling back:', e);
    }

    // 2. Supplement and rank with verified Supabase Cloud Database places
    const supabasePlaces = await this.supabaseProvider.searchPlaces(queries, location, radiusKm);
    for (const placeItem of supabasePlaces) {
      const isDup = combined.some((existing) =>
        arePlacesDuplicates(existing.name, existing.coordinates, placeItem.name, placeItem.coordinates)
      );
      if (!isDup) {
        combined.push(placeItem);
      }
    }

    return combined;
  }

  async getPlaceDetails(placeId: string): Promise<RawPlaceItem | null> {
    return this.supabaseProvider.getPlaceDetails(placeId);
  }

  async getReviews(placeId: string): Promise<RawReviewItem[]> {
    return this.supabaseProvider.getReviews(placeId);
  }

  async getPhotos(placeId: string): Promise<string[]> {
    return this.supabaseProvider.getPhotos(placeId);
  }
}
