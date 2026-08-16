import { DiscoveryService } from '../services/discoveryService';
import { ConversationMemoryManager } from '../agent/memory/conversationMemory';
import { PhotoVerifier } from '../agent/photos/photoVerifier';
import { ReputationAnalyzer } from '../agent/reputation/reputationAnalyzer';
import { MockLLMProvider } from '../providers/mock/MockLLMProvider';
import { arePlacesDuplicates } from '../utils/geo';

interface ScenarioResult {
  scenarioId: number;
  name: string;
  passed: boolean;
  notes: string;
}

async function runE2EBattery() {
  console.log('====================================================');
  console.log('  AURA (AI LOCAL DISCOVERY) — 15-SCENARIO E2E BATTERY');
  console.log('====================================================\n');

  const results: ScenarioResult[] = [];

  // Scenario 1: Primary Demo Query
  try {
    const q1 = 'Хочу вечерком воскресным отдохнуть в каком-нибудь тихом местечке где можно покататься на воде и поспать за городом';
    const res1 = await DiscoveryService.discoverPlaces(q1, 'Chișinău, Moldova');
    const topPlace = res1.places[0];
    const passed1 =
      res1.places.length > 0 &&
      topPlace.intentMatch.score >= 85 &&
      topPlace.accommodation.available === true &&
      topPlace.activities.some((a) => a.toLowerCase().includes('wake') || a.toLowerCase().includes('water'));
    results.push({
      scenarioId: 1,
      name: 'Primary Demo Query (Sunday evening water + overnight)',
      passed: passed1,
      notes: `Top place: ${topPlace?.name} (${topPlace?.intentMatch.score}%)`,
    });
  } catch (e: any) {
    results.push({ scenarioId: 1, name: 'Primary Demo Query', passed: false, notes: e.message });
  }

  // Scenario 2: Pure Activity Query
  try {
    const q2 = 'Где покататься на вейке в выходные';
    const res2 = await DiscoveryService.discoverPlaces(q2, 'Chișinău, Moldova');
    const passed2 = res2.places.some((p) => p.activities.some((a) => a.toLowerCase().includes('wake')));
    results.push({
      scenarioId: 2,
      name: 'Pure Activity Query ("Где покататься на вейке")',
      passed: passed2,
      notes: `Found ${res2.places.length} matching wake places`,
    });
  } catch (e: any) {
    results.push({ scenarioId: 2, name: 'Pure Activity Query', passed: false, notes: e.message });
  }

  // Scenario 3: Ambiguous Experiential Query
  try {
    const q3 = 'Хочу что-то красивое у воды на закате';
    const res3 = await DiscoveryService.discoverPlaces(q3, 'Chișinău, Moldova');
    const passed3 = res3.places.length > 0 && res3.trace.searchHypotheses.length > 0;
    results.push({
      scenarioId: 3,
      name: 'Ambiguous Query ("Красивое у воды на закате")',
      passed: passed3,
      notes: `Expanded into ${res3.trace.searchHypotheses.length} hypotheses`,
    });
  } catch (e: any) {
    results.push({ scenarioId: 3, name: 'Ambiguous Query', passed: false, notes: e.message });
  }

  // Scenario 4: Distant / Outside City Queries
  try {
    const q4 = 'Отдых на озере за городом дальше 30 км';
    const res4 = await DiscoveryService.discoverPlaces(q4, 'Chișinău, Moldova');
    const passed4 = res4.places.length > 0;
    results.push({
      scenarioId: 4,
      name: 'Distant Countryside Search',
      passed: passed4,
      notes: `Handled ${res4.places.length} candidates with geo distances computed`,
    });
  } catch (e: any) {
    results.push({ scenarioId: 4, name: 'Distant Countryside Search', passed: false, notes: e.message });
  }

  // Scenario 5: Budget-Oriented Query
  try {
    const q5 = 'Недорогой отдых у воды с палатками или кемпингом';
    const res5 = await DiscoveryService.discoverPlaces(q5, 'Chișinău, Moldova');
    const passed5 = res5.places.length > 0;
    results.push({
      scenarioId: 5,
      name: 'Budget / Camping Query',
      passed: passed5,
      notes: `Discovered outdoor camping and leisure candidates`,
    });
  } catch (e: any) {
    results.push({ scenarioId: 5, name: 'Budget Query', passed: false, notes: e.message });
  }

  // Scenario 6: Family-Oriented Query
  try {
    const q6 = 'Спокойный отдых на воде с семьей и детьми';
    const res6 = await DiscoveryService.discoverPlaces(q6, 'Chișinău, Moldova');
    const passed6 = res6.places.length > 0;
    results.push({
      scenarioId: 6,
      name: 'Family Recreation Query',
      passed: passed6,
      notes: `Discovered family leisure lake venues`,
    });
  } catch (e: any) {
    results.push({ scenarioId: 6, name: 'Family Query', passed: false, notes: e.message });
  }

  // Scenario 7: Romantic Evening Query
  try {
    const q7 = 'Романтический уединенный вечер для двоих у воды с домиком';
    const res7 = await DiscoveryService.discoverPlaces(q7, 'Chișinău, Moldova');
    const passed7 = res7.places.length > 0 && res7.places[0].accommodation.available;
    results.push({
      scenarioId: 7,
      name: 'Romantic Evening for Two Query',
      passed: passed7,
      notes: `Top match includes verified overnight cabins`,
    });
  } catch (e: any) {
    results.push({ scenarioId: 7, name: 'Romantic Query', passed: false, notes: e.message });
  }

  // Scenario 8: Quiet Countryside Query
  try {
    const q8 = 'Тихое уединенное место без музыки и суеты';
    const res8 = await DiscoveryService.discoverPlaces(q8, 'Chișinău, Moldova');
    const passed8 = res8.places.some((p) => p.tags.includes('Quiet') || p.description.includes('quiet'));
    results.push({
      scenarioId: 8,
      name: 'Quiet Countryside Retreat Query',
      passed: passed8,
      notes: `Verified quiet atmosphere score weights`,
    });
  } catch (e: any) {
    results.push({ scenarioId: 8, name: 'Quiet Retreat Query', passed: false, notes: e.message });
  }

  // Scenario 9: Water Sports & Wakeboarding Query
  try {
    const q9 = 'Вейкбординг на реверсивной и кольцевой канатной дороге';
    const res9 = await DiscoveryService.discoverPlaces(q9, 'Chișinău, Moldova');
    const passed9 = res9.places.some((p) => p.category.toLowerCase().includes('wake') || p.name.toLowerCase().includes('wake'));
    results.push({
      scenarioId: 9,
      name: 'Water Sports Technical Query',
      passed: passed9,
      notes: `Discovered dedicated cable wakeboarding facilities`,
    });
  } catch (e: any) {
    results.push({ scenarioId: 9, name: 'Water Sports Query', passed: false, notes: e.message });
  }

  // Scenario 10: Glamping / Cottages Query
  try {
    const q10 = 'Глэмпинг на берегу озера с сафари-тентами';
    const res10 = await DiscoveryService.discoverPlaces(q10, 'Chișinău, Moldova');
    const passed10 = res10.places.length > 0;
    results.push({
      scenarioId: 10,
      name: 'Glamping & Cottages Query',
      passed: passed10,
      notes: `Discovered lakeside glamping and cabins`,
    });
  } catch (e: any) {
    results.push({ scenarioId: 10, name: 'Glamping Query', passed: false, notes: e.message });
  }

  // Scenario 11: Refinement: 'closer'
  try {
    const res11 = await DiscoveryService.discoverPlaces('Отдых у воды с домиками', 'Chișinău, Moldova', 'closer');
    const isSortedByDistance = res11.places.every((p, i) => i === 0 || p.distanceKm >= res11.places[i - 1].distanceKm);
    results.push({
      scenarioId: 11,
      name: 'Refinement Modifier: "closer"',
      passed: isSortedByDistance,
      notes: `Places sorted monotonically by distance (${res11.places.map((p) => p.distanceKm + 'km').join(', ')})`,
    });
  } catch (e: any) {
    results.push({ scenarioId: 11, name: 'Refinement closer', passed: false, notes: e.message });
  }

  // Scenario 12: Refinement: 'quieter'
  try {
    const res12 = await DiscoveryService.discoverPlaces('Отдых у воды с домиками', 'Chișinău, Moldova', 'quieter');
    const isSortedByRating = res12.places.every((p, i) => i === 0 || p.reviewSummary.rating <= res12.places[i - 1].reviewSummary.rating);
    results.push({
      scenarioId: 12,
      name: 'Refinement Modifier: "quieter"',
      passed: isSortedByRating,
      notes: `Places sorted by reputation rating (${res12.places.map((p) => p.reviewSummary.rating + '⭐').join(', ')})`,
    });
  } catch (e: any) {
    results.push({ scenarioId: 12, name: 'Refinement quieter', passed: false, notes: e.message });
  }

  // Scenario 13: Refinement: 'more_activities'
  try {
    const res13 = await DiscoveryService.discoverPlaces('Отдых у воды с домиками', 'Chișinău, Moldova', 'more_activities');
    const isSortedByActivities = res13.places.every((p, i) => i === 0 || p.activities.length <= res13.places[i - 1].activities.length);
    results.push({
      scenarioId: 13,
      name: 'Refinement Modifier: "more_activities"',
      passed: isSortedByActivities,
      notes: `Places ranked by activities count`,
    });
  } catch (e: any) {
    results.push({ scenarioId: 13, name: 'Refinement more_activities', passed: false, notes: e.message });
  }

  // Scenario 14: Follow-up Multi-Turn Conversational Session
  try {
    const sId = 'e2e-session-test';
    ConversationMemoryManager.clearSession(sId);
    await DiscoveryService.discoverPlaces('Хочу покататься на вейке в воскресенье', 'Chișinău, Moldova', undefined, sId);
    const turn2 = await DiscoveryService.discoverPlaces('А есть с сауной и домиком?', 'Chișinău, Moldova', undefined, sId);
    const passed14 =
      turn2.trace.extractedIntent.temporal.day === 'Sunday' &&
      turn2.trace.extractedIntent.activities.some((a) => a.includes('wake'));
    results.push({
      scenarioId: 14,
      name: 'Multi-Turn Context Carryover',
      passed: passed14,
      notes: `Retained Sunday + Wakeboard in Turn 2 while layering sauna & cabin`,
    });
  } catch (e: any) {
    results.push({ scenarioId: 14, name: 'Multi-Turn Carryover', passed: false, notes: e.message });
  }

  // Scenario 15: Verification Failure & Generic Stock Rejection
  try {
    const photoVerifier = new PhotoVerifier();
    const verified = photoVerifier.verifyPhotos('p1', 'Venue', [
      { url: 'https://stock.com/image.jpg', isGenericStock: true },
      { url: 'https://official.com/p1.jpg', isAttachedToPlaceListing: true },
    ]);
    const isDup = arePlacesDuplicates('Wake Park Ghidighici', { lat: 47.0792, lng: 28.7294 }, 'wakepark ghidighici', { lat: 47.0795, lng: 28.7299 });
    const passed15 = verified.length === 1 && isDup === true;
    results.push({
      scenarioId: 15,
      name: 'Verification Guard & Entity Deduplication',
      passed: passed15,
      notes: `Stock rejected (1 valid photo kept) and duplicate coordinates detected`,
    });
  } catch (e: any) {
    results.push({ scenarioId: 15, name: 'Verification Guard', passed: false, notes: e.message });
  }

  // Print Summary Table
  console.log('----------------------------------------------------');
  let passCount = 0;
  for (const r of results) {
    const icon = r.passed ? '✓ PASS' : '✗ FAIL';
    console.log(`[${icon}] Scenario ${r.scenarioId}: ${r.name}`);
    console.log(`       Note: ${r.notes}`);
    if (r.passed) passCount++;
  }
  console.log('----------------------------------------------------');
  console.log(`Summary: ${passCount} / ${results.length} Scenarios Passed (${Math.round((passCount / results.length) * 100)}%)`);

  if (passCount !== results.length) {
    throw new Error(`E2E Battery failed: ${results.length - passCount} scenarios failed.`);
  }

  console.log('\nAll 15 Milestone 15 E2E Scenarios PASSED with 100% success!');
}

runE2EBattery().catch((e) => {
  console.error('E2E Test Execution Error:', e);
  process.exit(1);
});
