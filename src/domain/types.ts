/**
 * Core Domain Models for Aura (AI Local Discovery Agent)
 * Encapsulates normalized business entities, intent representations,
 * verification claims, and reputation summaries.
 */

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface TemporalConstraint {
  day?: string; // e.g. "Sunday"
  period?: 'morning' | 'afternoon' | 'evening' | 'night' | 'full_day' | 'weekend';
  isWeekend?: boolean;
}

export interface AccommodationRequirement {
  required: boolean;
  preferredType?: 'cabin' | 'glamping' | 'hotel' | 'villa' | 'camping' | 'any';
  verifiedOnly?: boolean;
}

export interface SearchIntent {
  rawQuery: string;
  location: {
    name: string;
    coordinates?: Coordinates;
    radiusKm: number;
  };
  temporal: TemporalConstraint;
  experience: string[]; // e.g. ["relaxation", "nature", "water"]
  activities: string[]; // e.g. ["wakeboarding", "swimming", "kayaking"]
  atmosphere: string[]; // e.g. ["quiet", "secluded", "scenic"]
  accommodation: AccommodationRequirement;
  budget?: 'budget' | 'moderate' | 'luxury' | null;
  partyType?: 'solo' | 'couple' | 'friends' | 'family' | null;
  priorityWeights: {
    activity: number;
    atmosphere: number;
    accommodation: number;
    distance: number;
    reputation: number;
  };
  unknowns: string[];
}

export interface PhotoEvidence {
  id: string;
  url: string;
  caption: string;
  verified: boolean;
  source: string;
  confidence: number; // 0.0 to 1.0
  rejectionReason?: string;
}

export interface ReviewSummary {
  rating: number; // 0.0 to 5.0
  reviewCount: number;
  positiveThemes: string[];
  negativeThemes: string[];
  summary: string;
  confidence: 'high' | 'moderate' | 'limited';
  source: string;
}

export interface VerificationClaim {
  aspect: 'identity' | 'activity' | 'accommodation' | 'schedule' | 'atmosphere' | 'location';
  claim: string;
  isVerified: boolean;
  evidenceText: string;
  sourceName: string;
  sourceUrl?: string;
  confidence: number; // 0.0 to 1.0
}

export interface PlaceSource {
  name: string;
  url?: string;
  claim: string;
  retrievedAt: string;
}

export interface AccommodationInfo {
  available: boolean;
  type: string;
  details: string;
  verified: boolean;
  source?: string;
}

export interface IntentMatchResult {
  score: number; // 0 to 100
  explanation: string;
  potentialDownside?: string;
  factorScores: {
    activityMatch: number;
    atmosphereMatch: number;
    accommodationMatch: number;
    distanceMatch: number;
    reputationScore: number;
  };
}

export interface PlaceCandidate {
  id: string;
  name: string;
  category: string;
  address: string;
  coordinates: Coordinates;
  distanceKm: number;
  travelTimeMinutes: number;
  description: string;
  activities: string[];
  amenities: string[];
  openingHours: string;
  accommodation: AccommodationInfo;
  reviewSummary: ReviewSummary;
  photos: PhotoEvidence[];
  sources: PlaceSource[];
  verifications: VerificationClaim[];
  intentMatch: IntentMatchResult;
  tags: string[];
}

export interface ToolInvocationTrace {
  tool: string;
  durationMs: number;
  status: 'success' | 'warning' | 'error';
  summary?: string;
}

export interface RejectionTrace {
  placeName: string;
  reason: string;
  category?: string;
}

export interface AgentExecutionTrace {
  query: string;
  extractedIntent: SearchIntent;
  searchHypotheses: string[];
  candidateCount: number;
  deduplicatedCount: number;
  verifiedCount: number;
  rejectedCount: number;
  rejections: RejectionTrace[];
  toolInvocations: ToolInvocationTrace[];
  executionTimeMs: number;
}

export interface DiscoveryResult {
  places: PlaceCandidate[];
  trace: AgentExecutionTrace;
  query: string;
  totalFound: number;
  timestamp: string;
}

export interface RefinementOption {
  id: string;
  label: string;
  prompt: string;
  icon?: string;
}

