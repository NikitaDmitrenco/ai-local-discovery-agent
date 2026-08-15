import { IntentRanker } from './intentRanker';
import { SearchIntent, PlaceCandidate } from '../../domain/types';

async function runIntentRankerTests() {
  const ranker = new IntentRanker();

  const intent: SearchIntent = {
    rawQuery: 'Хочу вечерком воскресным отдохнуть в каком-нибудь тихом местечке где можно покататься на воде и поспать за городом',
    location: {
      name: 'Chișinău',
      radiusKm: 50,
    },
    temporal: { day: 'Sunday', period: 'evening', isWeekend: true },
    experience: ['relaxation', 'water', 'nature'],
    activities: ['wakeboarding', 'water sports'],
    atmosphere: ['quiet', 'outside city'],
    accommodation: { required: true, preferredType: 'cabin', verifiedOnly: true },
    priorityWeights: {
      activity: 0.4,
      atmosphere: 0.3,
      accommodation: 0.2,
      distance: 0.05,
      reputation: 0.05,
    },
    unknowns: [],
  };

  const candidateA: PlaceCandidate = {
    id: 'place-wake',
    name: 'WakePark Ghidighici',
    category: 'Wake Park',
    address: 'Ghidighici, Moldova',
    coordinates: { lat: 47.0792, lng: 28.7294 },
    distanceKm: 18,
    travelTimeMinutes: 25,
    description: 'Premier wakeboarding park with quiet lakefront cabins.',
    activities: ['🌊 Cable Wakeboarding', '🏄 SUP', '🏊 Swimming'],
    amenities: ['Cabins', 'Rental'],
    openingHours: 'Sun: 09:00 - 22:00',
    accommodation: { available: true, type: 'Cabins', details: 'Heated cabins', verified: true },
    reviewSummary: { rating: 4.8, reviewCount: 300, positiveThemes: ['Clean water'], negativeThemes: [], summary: 'Great spot', confidence: 'high', source: 'Reviews' },
    photos: [],
    sources: [],
    verifications: [],
    intentMatch: { score: 0, explanation: '', factorScores: { activityMatch: 0, atmosphereMatch: 0, accommodationMatch: 0, distanceMatch: 0, reputationScore: 0 } },
    tags: ['Water Sports', 'Quiet', 'Cabins'],
  };

  const candidateB: PlaceCandidate = {
    id: 'place-city-hotel',
    name: 'Downtown Business Hotel',
    category: 'Hotel',
    address: 'Center, Chișinău',
    coordinates: { lat: 47.0200, lng: 28.8300 },
    distanceKm: 2,
    travelTimeMinutes: 5,
    description: 'Busy business hotel in the city center.',
    activities: ['Gym'],
    amenities: ['Wi-Fi'],
    openingHours: '24/7',
    accommodation: { available: true, type: 'Hotel Room', details: 'Rooms', verified: true },
    reviewSummary: { rating: 4.9, reviewCount: 800, positiveThemes: ['City center'], negativeThemes: ['Noisy'], summary: 'Central', confidence: 'high', source: 'Reviews' },
    photos: [],
    sources: [],
    verifications: [],
    intentMatch: { score: 0, explanation: '', factorScores: { activityMatch: 0, atmosphereMatch: 0, accommodationMatch: 0, distanceMatch: 0, reputationScore: 0 } },
    tags: ['City', 'Business'],
  };

  console.log('Testing IntentRanker...');
  const ranked = ranker.rankCandidates([candidateB, candidateA], intent);

  console.log('Ranked Order:');
  ranked.forEach((p, idx) => {
    console.log(`#${idx + 1}: ${p.name} -> Score: ${p.intentMatch.score}% | ${p.intentMatch.explanation}`);
  });

  // Assertions
  const wakeParkIsFirst = ranked[0].id === 'place-wake';
  const hasHighMatchScore = ranked[0].intentMatch.score >= 90;
  const hasExplanation = ranked[0].intentMatch.explanation.includes('water');

  console.log('\n--- Intent Ranker Acceptance Checks ---');
  console.log('✓ Intent-matching wake park ranks above generic high-rated city hotel:', wakeParkIsFirst);
  console.log('✓ High match score computed from dynamic weights:', hasHighMatchScore);
  console.log('✓ Contextual "Why AI picked this" explanation generated:', hasExplanation);

  if (!wakeParkIsFirst || !hasHighMatchScore || !hasExplanation) {
    throw new Error('IntentRanker failed core acceptance criteria.');
  }

  console.log('\nAll Milestone 11 Intent Matching & Ranking acceptance criteria PASSED!');
}

runIntentRankerTests().catch((e) => {
  console.error('Test failed:', e);
  process.exit(1);
});
