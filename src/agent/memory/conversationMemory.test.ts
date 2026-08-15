import { ConversationMemoryManager } from './conversationMemory';
import { SearchIntent } from '../../domain/types';

async function runConversationMemoryTests() {
  const sessionId = 'test-session-123';
  ConversationMemoryManager.clearSession(sessionId);

  // Turn 1
  const turn1Intent: SearchIntent = {
    rawQuery: 'Хочу вечерком воскресным отдохнуть в тихом местечке где можно покататься на воде и поспать за городом',
    location: { name: 'Chișinău, Moldova', radiusKm: 50, coordinates: { lat: 47.02, lng: 28.83 } },
    temporal: { day: 'Sunday', period: 'evening', isWeekend: true },
    experience: ['relaxation', 'water'],
    activities: ['wakeboarding', 'water sports'],
    atmosphere: ['quiet', 'outside city'],
    accommodation: { required: true, preferredType: 'cabin', verifiedOnly: true },
    priorityWeights: { activity: 0.35, atmosphere: 0.3, accommodation: 0.25, distance: 0.1, reputation: 0.05 },
    unknowns: [],
  };

  console.log('Testing Turn 1 initialization...');
  const res1 = ConversationMemoryManager.mergeTurn(sessionId, turn1Intent.rawQuery, turn1Intent);
  ConversationMemoryManager.recordTurn(sessionId, turn1Intent.rawQuery, res1.mergedIntent, 4, ['p1', 'p2', 'p3', 'p4']);

  console.log('Turn 1 Recorded. Current turn count:', res1.session.turns.length);

  // Turn 2: Follow-up question without repeating entire prompt: "А есть среди них что-то с сауной?"
  const turn2Intent: SearchIntent = {
    rawQuery: 'А есть среди них что-то с сауной?',
    location: { name: 'Chișinău, Moldova', radiusKm: 50 },
    temporal: { period: 'afternoon', isWeekend: false },
    experience: [],
    activities: ['wood-fired sauna'],
    atmosphere: [],
    accommodation: { required: false },
    priorityWeights: { activity: 0.4, atmosphere: 0.2, accommodation: 0.2, distance: 0.1, reputation: 0.1 },
    unknowns: [],
  };

  console.log('\nTesting Turn 2 multi-turn context merge...');
  const res2 = ConversationMemoryManager.mergeTurn(sessionId, turn2Intent.rawQuery, turn2Intent);
  ConversationMemoryManager.recordTurn(sessionId, turn2Intent.rawQuery, res2.mergedIntent, 2, ['p1', 'p3']);

  console.log('Turn 2 Merged Intent Result:');
  console.log(`- Day preserved: ${res2.mergedIntent.temporal.day}`);
  console.log(`- Period preserved: ${res2.mergedIntent.temporal.period}`);
  console.log(`- Accommodation required preserved: ${res2.mergedIntent.accommodation.required}`);
  console.log(`- Activities accumulated:`, res2.mergedIntent.activities);
  console.log(`- Location preserved: ${res2.mergedIntent.location.name}`);

  // Assertions
  const dayPreserved = res2.mergedIntent.temporal.day === 'Sunday';
  const overnightPreserved = res2.mergedIntent.accommodation.required === true;
  const hasWakeAndSauna =
    res2.mergedIntent.activities.some((a) => a.includes('wake')) &&
    res2.mergedIntent.activities.some((a) => a.includes('sauna'));
  const hasTurnHistory = res2.session.turns.length === 2;

  console.log('\n--- Conversational Memory Acceptance Checks ---');
  console.log('✓ Sunday temporal context preserved:', dayPreserved);
  console.log('✓ Overnight accommodation constraint carried over:', overnightPreserved);
  console.log('✓ Wakeboard + Sauna activities combined across turns:', hasWakeAndSauna);
  console.log('✓ Full session turn history recorded:', hasTurnHistory);

  if (!dayPreserved || !overnightPreserved || !hasWakeAndSauna || !hasTurnHistory) {
    throw new Error('ConversationMemoryManager failed core acceptance criteria.');
  }

  console.log('\nAll Milestone 13 Conversational Memory acceptance criteria PASSED!');
}

runConversationMemoryTests().catch((e) => {
  console.error('Test failed:', e);
  process.exit(1);
});
