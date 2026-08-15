import { RefinementEngine } from './refinementEngine';
import { SearchIntent, PlaceCandidate } from '../../domain/types';

async function runRefinementEngineTests() {
  const engine = new RefinementEngine();

  const baseIntent: SearchIntent = {
    rawQuery: 'Хочу вечерком воскресным отдохнуть в каком-нибудь тихом местечке где можно покататься на воде и поспать за городом',
    location: { name: 'Chișinău', radiusKm: 50 },
    temporal: { day: 'Sunday', period: 'evening', isWeekend: true },
    experience: ['relaxation', 'water'],
    activities: ['wakeboarding', 'water sports'],
    atmosphere: ['quiet'],
    accommodation: { required: true, preferredType: 'cabin', verifiedOnly: true },
    priorityWeights: { activity: 0.35, atmosphere: 0.3, accommodation: 0.25, distance: 0.1, reputation: 0.05 },
    unknowns: [],
  };

  const samplePlaces: PlaceCandidate[] = [
    {
      id: 'p1',
      name: 'WakePark Ghidighici',
      category: 'Wake Park',
      address: 'Ghidighici',
      coordinates: { lat: 47.08, lng: 28.73 },
      distanceKm: 18,
      travelTimeMinutes: 25,
      description: '',
      activities: ['Wakeboarding', 'Sauna'],
      amenities: [],
      openingHours: '',
      accommodation: { available: true, type: 'Cabin', details: '', verified: true },
      reviewSummary: { rating: 4.8, reviewCount: 200, positiveThemes: [], negativeThemes: [], summary: '', confidence: 'high', source: '' },
      photos: [],
      sources: [],
      verifications: [],
      intentMatch: { score: 95, explanation: '', factorScores: { activityMatch: 1, atmosphereMatch: 1, accommodationMatch: 1, distanceMatch: 1, reputationScore: 1 } },
      tags: [],
    },
    {
      id: 'p2',
      name: 'Nistru Far Lodge',
      category: 'Lodge',
      address: 'Vadul lui Voda',
      coordinates: { lat: 47.10, lng: 29.08 },
      distanceKm: 38,
      travelTimeMinutes: 45,
      description: '',
      activities: ['Boating'],
      amenities: [],
      openingHours: '',
      accommodation: { available: true, type: 'Cabin', details: '', verified: true },
      reviewSummary: { rating: 4.5, reviewCount: 120, positiveThemes: [], negativeThemes: [], summary: '', confidence: 'high', source: '' },
      photos: [],
      sources: [],
      verifications: [],
      intentMatch: { score: 85, explanation: '', factorScores: { activityMatch: 0.8, atmosphereMatch: 1, accommodationMatch: 1, distanceMatch: 0.7, reputationScore: 0.9 } },
      tags: [],
    },
  ];

  console.log('Testing RefinementEngine.generateSmartChips...');
  const chips = engine.generateSmartChips(baseIntent, samplePlaces);
  console.log('Generated Chips:', chips);

  console.log('\nTesting RefinementEngine.applyRefinement for "closer"...');
  const refCloser = engine.applyRefinement(baseIntent, 'closer');
  console.log('Closer Refinement:', refCloser);

  console.log('\nTesting RefinementEngine.applyRefinement for "with sauna"...');
  const refSauna = engine.applyRefinement(baseIntent, 'Хочу еще чтобы была сауна на дровах');
  console.log('Sauna Refinement:', refSauna);

  // Assertions
  const hasSmartChips = chips.length >= 3;
  const closerTightenedRadius = (refCloser.updatedIntent.location.radiusKm || 0) < 50;
  const closerBoostedDistanceWeight = (refCloser.updatedIntent.priorityWeights?.distance || 0) > 0.1;
  const saunaRequiresReSearch = refSauna.requiresReSearch === true;

  console.log('\n--- Refinement Acceptance Checks ---');
  console.log('✓ Dynamic smart chips generated:', hasSmartChips);
  console.log('✓ "Closer" refinement reduces radius & prioritizes distance:', closerTightenedRadius && closerBoostedDistanceWeight);
  console.log('✓ "Sauna" refinement requires targeted re-search:', saunaRequiresReSearch);

  if (!hasSmartChips || !closerTightenedRadius || !closerBoostedDistanceWeight || !saunaRequiresReSearch) {
    throw new Error('RefinementEngine failed core acceptance criteria.');
  }

  console.log('\nAll Milestone 12 Contextual Refinement acceptance criteria PASSED!');
}

runRefinementEngineTests().catch((e) => {
  console.error('Test failed:', e);
  process.exit(1);
});
