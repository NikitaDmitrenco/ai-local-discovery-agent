import { PlaceVerifier } from './placeVerifier';
import { SearchIntent } from '../../domain/types';
import { RawPlaceItem, RawReviewItem } from '../../providers/types';

async function runPlaceVerifierTests() {
  const verifier = new PlaceVerifier();

  const sampleIntent: SearchIntent = {
    rawQuery: 'Хочу вечерком воскресным отдохнуть в каком-нибудь тихом местечке где можно покататься на воде и поспать за городом',
    location: {
      name: 'Chișinău, Moldova',
      coordinates: { lat: 47.0245, lng: 28.8322 },
      radiusKm: 50,
    },
    temporal: {
      day: 'Sunday',
      period: 'evening',
      isWeekend: true,
    },
    experience: ['relaxation', 'water', 'nature'],
    activities: ['wakeboarding', 'water sports'],
    atmosphere: ['quiet', 'outside city'],
    accommodation: {
      required: true,
      preferredType: 'cabin',
      verifiedOnly: true,
    },
    priorityWeights: {
      activity: 0.35,
      atmosphere: 0.3,
      accommodation: 0.25,
      distance: 0.1,
      reputation: 0.05,
    },
    unknowns: [],
  };

  const validPlace: RawPlaceItem = {
    id: 'test-wake-park',
    name: 'Ghidighici Wake Park & Cottages',
    category: 'Wake Park',
    address: 'Vatra, Moldova',
    coordinates: { lat: 47.0792, lng: 28.7294 },
    rating: 4.8,
    userRatingsTotal: 300,
    openingHours: ['Sunday: 09:00 – 22:00'],
    rawAttributes: {
      hasCableWakeboard: true,
      allowsNightStay: true,
      hasCabins: true,
      noiseLevel: 'low',
    },
  };

  const reviews: RawReviewItem[] = [
    {
      authorName: 'Alex',
      rating: 5,
      text: 'Great wakeboarding and quiet peaceful cabins at night.',
    },
  ];

  console.log('Testing PlaceVerifier with valid candidate...');
  const outcomeValid = verifier.verifyCandidate(validPlace, reviews, sampleIntent);

  console.log('Valid Place Outcome:', {
    isQualified: outcomeValid.isQualified,
    confidenceScore: outcomeValid.confidenceScore,
    claimsCount: outcomeValid.verifications.length,
  });

  const invalidPlace: RawPlaceItem = {
    id: 'test-party-beach',
    name: 'City Party Night Club & Pool',
    category: 'Night Club',
    address: 'City Center, Chișinău',
    coordinates: { lat: 47.0200, lng: 28.8300 },
    rating: 3.8,
    userRatingsTotal: 80,
    openingHours: ['Sunday: 20:00 – 05:00'],
    rawAttributes: {
      allowsNightStay: false,
      noiseLevel: 'high',
    },
  };

  console.log('\nTesting PlaceVerifier with invalid party venue...');
  const outcomeInvalid = verifier.verifyCandidate(invalidPlace, [], sampleIntent);

  console.log('Invalid Place Outcome:', {
    isQualified: outcomeInvalid.isQualified,
    disqualificationReason: outcomeInvalid.disqualificationReason,
  });

  // Assertions
  const validPassed = outcomeValid.isQualified === true && outcomeValid.verifications.length === 6;
  const invalidRejected = outcomeInvalid.isQualified === false;
  const claimsHaveEvidence = outcomeValid.verifications.every((c) => Boolean(c.evidenceText && c.confidence > 0));

  console.log('\n--- Verification Acceptance Checks ---');
  console.log('✓ Valid candidate qualified with 6 verified claims:', validPassed);
  console.log('✓ Incompatible candidate rejected with explicit reason:', invalidRejected);
  console.log('✓ All claims have explicit grounding evidence:', claimsHaveEvidence);

  if (!validPassed || !invalidRejected || !claimsHaveEvidence) {
    throw new Error('PlaceVerifier failed core acceptance criteria.');
  }

  console.log('\nAll Milestone 8 Place Verification acceptance criteria PASSED!');
}

runPlaceVerifierTests().catch((e) => {
  console.error('Test failed:', e);
  process.exit(1);
});
