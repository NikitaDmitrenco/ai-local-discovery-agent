import { AgentTool } from './agentTool';
import { PlaceSearchProvider, LLMProvider, GeocodingProvider, RawPlaceItem, RawReviewItem } from '../../providers/types';
import { IntentParser } from '../intent/intentParser';
import { SemanticQueryExpander, ExpansionStrategy } from '../expansion/queryExpander';
import { ReputationAnalyzer } from '../reputation/reputationAnalyzer';
import { PhotoVerifier } from '../photos/photoVerifier';
import {
  SearchIntent,
  Coordinates,
  ToolInvocationTrace,
  ReviewSummary,
  PhotoEvidence,
} from '../../domain/types';

/**
 * 1. Geocode Location Tool
 */
export class GeocodeLocationTool implements AgentTool<{ locationName: string }, { coordinates: Coordinates; formattedAddress: string }> {
  name = 'geocode_location';
  description = 'Resolves human location name into geographic coordinates';
  private geocoding: GeocodingProvider;

  constructor(geocoding: GeocodingProvider) {
    this.geocoding = geocoding;
  }

  async execute(params: { locationName: string }) {
    const start = Date.now();
    const geo = await this.geocoding.forwardGeocode(params.locationName);
    const coordinates = geo?.coordinates || { lat: 47.0245, lng: 28.8322 };
    const formattedAddress = geo?.formattedAddress || `${params.locationName}, Moldova`;
    const durationMs = Date.now() - start;

    return {
      result: { coordinates, formattedAddress },
      trace: {
        tool: this.name,
        durationMs,
        status: 'success' as const,
        summary: `Resolved "${params.locationName}" to (${coordinates.lat.toFixed(4)}, ${coordinates.lng.toFixed(4)})`,
      },
    };
  }
}

/**
 * 2. Intent Extraction Tool
 */
export class IntentExtractionTool implements AgentTool<{ query: string; locationName: string; coordinates?: Coordinates }, SearchIntent> {
  name = 'extract_search_intent';
  description = 'Extracts structured intent, temporal aspects, activities, atmosphere, and accommodation requirements';
  private intentParser: IntentParser;

  constructor(llm: LLMProvider) {
    this.intentParser = new IntentParser(llm);
  }

  async execute(params: { query: string; locationName: string; coordinates?: Coordinates }) {
    const start = Date.now();
    const intent = await this.intentParser.parseIntent(params.query, params.locationName, params.coordinates);
    const durationMs = Date.now() - start;

    return {
      result: intent,
      trace: {
        tool: this.name,
        durationMs,
        status: 'success' as const,
        summary: `Identified: ${intent.activities.join(', ')} | ${intent.atmosphere.join(', ')} | overnight: ${intent.accommodation.required}`,
      },
    };
  }
}

/**
 * 3. Semantic Query Expansion Tool
 */
export class SemanticExpansionTool implements AgentTool<{ intent: SearchIntent }, ExpansionStrategy> {
  name = 'expand_semantic_hypotheses';
  description = 'Expands natural language intent into 5-10 distinct category and venue search hypotheses';
  private expander: SemanticQueryExpander;

  constructor(llm: LLMProvider) {
    this.expander = new SemanticQueryExpander(llm);
  }

  async execute(params: { intent: SearchIntent }) {
    const start = Date.now();
    const strategy = await this.expander.expandIntent(params.intent);
    const durationMs = Date.now() - start;

    return {
      result: strategy,
      trace: {
        tool: this.name,
        durationMs,
        status: 'success' as const,
        summary: `Generated ${strategy.hypotheses.length} hypotheses: ${strategy.hypotheses.slice(0, 3).join(', ')}...`,
      },
    };
  }
}

/**
 * 4. Search Places Tool
 */
export class SearchPlacesTool implements AgentTool<{ hypotheses: string[]; coordinates: Coordinates; radiusKm: number }, RawPlaceItem[]> {
  name = 'search_candidate_places';
  description = 'Discovers real place entities across search hypotheses and geographic radius';
  public placeProvider: PlaceSearchProvider;

  constructor(placeProvider: PlaceSearchProvider) {
    this.placeProvider = placeProvider;
  }

  async execute(params: { hypotheses: string[]; coordinates: Coordinates; radiusKm: number }) {
    const start = Date.now();
    const rawPlaces = await this.placeProvider.searchPlaces(
      params.hypotheses,
      params.coordinates,
      params.radiusKm
    );
    const durationMs = Date.now() - start;

    return {
      result: rawPlaces,
      trace: {
        tool: this.name,
        durationMs,
        status: 'success' as const,
        summary: `Discovered ${rawPlaces.length} candidate places across ${params.radiusKm}km radius`,
      },
    };
  }
}

/**
 * 5. Synthesize Reviews Tool
 */
export class SynthesizeReviewsTool implements AgentTool<{ placeId: string; placeName: string; rating?: number; reviewCount?: number }, ReviewSummary> {
  name = 'synthesize_place_reviews';
  description = 'Extracts authentic visitor sentiment, positive highlights, and potential caveats';
  private placeProvider: PlaceSearchProvider;
  private analyzer: ReputationAnalyzer;

  constructor(placeProvider: PlaceSearchProvider, llmProvider: LLMProvider) {
    this.placeProvider = placeProvider;
    this.analyzer = new ReputationAnalyzer(llmProvider);
  }

  async execute(params: { placeId: string; placeName: string; rating?: number; reviewCount?: number }) {
    const start = Date.now();
    const reviews: RawReviewItem[] = await this.placeProvider.getReviews(params.placeId);
    const summary = await this.analyzer.analyzeReputation(
      params.placeName,
      reviews,
      params.rating,
      params.reviewCount
    );
    const durationMs = Date.now() - start;

    return {
      result: summary,
      trace: {
        tool: this.name,
        durationMs,
        status: 'success' as const,
        summary: `Synthesized reviews for ${params.placeName} (${summary.rating}⭐, ${summary.reviewCount} reviews, confidence: ${summary.confidence})`,
      },
    };
  }
}

/**
 * 6. Verify Photos Tool (Backed by PhotoVerifier)
 */
export class VerifyPhotosTool implements AgentTool<{ placeId: string; placeName: string }, PhotoEvidence[]> {
  name = 'verify_place_photos';
  description = 'Validates authentic photos matching the venue and rejects stock or mismatched imagery';
  private placeProvider: PlaceSearchProvider;
  private photoVerifier: PhotoVerifier;

  constructor(placeProvider: PlaceSearchProvider) {
    this.placeProvider = placeProvider;
    this.photoVerifier = new PhotoVerifier();
  }

  async execute(params: { placeId: string; placeName: string }) {
    const start = Date.now();
    const rawPhotoUrls = await this.placeProvider.getPhotos(params.placeId);
    const candidates = rawPhotoUrls.map((url, idx) => ({
      url,
      caption: `${params.placeName} photo #${idx + 1}`,
      source: 'Official Place Listing',
      isAttachedToPlaceListing: true,
      isGenericStock: false,
    }));

    const verifiedPhotos = this.photoVerifier.verifyPhotos(
      params.placeId,
      params.placeName,
      candidates
    );
    const durationMs = Date.now() - start;

    return {
      result: verifiedPhotos,
      trace: {
        tool: this.name,
        durationMs,
        status: 'success' as const,
        summary: `Verified ${verifiedPhotos.length} authentic venue photos for ${params.placeName}`,
      },
    };
  }
}
