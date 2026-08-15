import { Coordinates, PhotoEvidence, ReviewSummary, VerificationClaim } from '../domain/types';

export interface RawPlaceItem {
  id: string;
  name: string;
  category: string;
  address: string;
  coordinates: Coordinates;
  rating?: number;
  userRatingsTotal?: number;
  openingHours?: string[];
  types?: string[];
  photoUrls?: string[];
  website?: string;
  phoneNumber?: string;
  rawAttributes?: Record<string, unknown>;
}

export interface RawReviewItem {
  authorName: string;
  rating: number;
  text: string;
  relativeTimeDescription?: string;
  time?: number;
}

export interface PlaceSearchProvider {
  name: string;
  searchPlaces(
    queries: string[],
    location: Coordinates,
    radiusKm: number
  ): Promise<RawPlaceItem[]>;
  getPlaceDetails(placeId: string): Promise<RawPlaceItem | null>;
  getReviews(placeId: string): Promise<RawReviewItem[]>;
  getPhotos(placeId: string): Promise<string[]>;
}

export interface LLMOptions {
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
}

export interface LLMProvider {
  name: string;
  generateText(prompt: string, options?: LLMOptions): Promise<string>;
  generateStructured<T>(
    prompt: string,
    schemaDescription: string,
    options?: LLMOptions
  ): Promise<T>;
}

export interface GeocodingResult {
  city: string;
  region?: string;
  country: string;
  formattedAddress: string;
  coordinates: Coordinates;
}

export interface GeocodingProvider {
  name: string;
  reverseGeocode(coordinates: Coordinates): Promise<GeocodingResult>;
  forwardGeocode(query: string): Promise<GeocodingResult | null>;
}
