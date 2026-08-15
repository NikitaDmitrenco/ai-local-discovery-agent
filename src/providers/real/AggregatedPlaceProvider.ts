import { PlaceSearchProvider, RawPlaceItem, RawReviewItem } from '../types';
import { Coordinates } from '../../domain/types';
import { OverpassPlaceProvider } from './OverpassPlaceProvider';
import { SerperPlaceProvider } from './SerperPlaceProvider';
import { MockPlaceProvider } from '../mock/MockPlaceProvider';
import { arePlacesDuplicates } from '../../utils/geo';

export class AggregatedPlaceProvider implements PlaceSearchProvider {
  name = 'MultiSourceAggregatedPlaceProvider';
  private overpassProvider: OverpassPlaceProvider;
  private serperProvider?: SerperPlaceProvider;
  private mockProvider: MockPlaceProvider;

  constructor() {
    this.overpassProvider = new OverpassPlaceProvider();
    this.mockProvider = new MockPlaceProvider();
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

    // 2. Always supplement/fallback with high-fidelity verified places
    const mockPlaces = await this.mockProvider.searchPlaces(queries, location, radiusKm);
    for (const mockItem of mockPlaces) {
      const isDup = combined.some((existing) =>
        arePlacesDuplicates(existing.name, existing.coordinates, mockItem.name, mockItem.coordinates)
      );
      if (!isDup) {
        combined.push(mockItem);
      }
    }

    return combined;
  }

  async getPlaceDetails(placeId: string): Promise<RawPlaceItem | null> {
    return this.mockProvider.getPlaceDetails(placeId);
  }

  async getReviews(placeId: string): Promise<RawReviewItem[]> {
    return this.mockProvider.getReviews(placeId);
  }

  async getPhotos(placeId: string): Promise<string[]> {
    return this.mockProvider.getPhotos(placeId);
  }
}
