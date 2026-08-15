import { IntentParser } from './intentParser';
import { MockLLMProvider } from '../../providers/mock/MockLLMProvider';

async function runIntentParserTests() {
  const llm = new MockLLMProvider();
  const parser = new IntentParser(llm);

  const primaryDemoQuery =
    'Хочу вечерком воскресным отдохнуть в каком-нибудь тихом местечке где можно покататься на воде и поспать за городом';

  console.log('Testing IntentParser with primary demo query:', primaryDemoQuery);
  const intent = await parser.parseIntent(primaryDemoQuery, 'Chișinău, Moldova');

  console.log('Extracted Intent Result:', JSON.stringify(intent, null, 2));

  // Assertions
  const isSunday = intent.temporal.day === 'Sunday';
  const isEvening = intent.temporal.period === 'evening';
  const hasWaterActivity = intent.activities.some(
    (a) => a.includes('water') || a.includes('wake') || a.includes('кататься')
  );
  const isQuiet = intent.atmosphere.some(
    (a) => a.includes('quiet') || a.includes('peaceful')
  );
  const isOutsideCity = intent.atmosphere.some(
    (a) => a.includes('outside city') || a.includes('nature')
  );
  const isOvernightRequired = intent.accommodation.required === true;

  console.log('\n--- Assertion Checks ---');
  console.log('✓ Sunday detected:', isSunday);
  console.log('✓ Evening detected:', isEvening);
  console.log('✓ Water activity detected:', hasWaterActivity);
  console.log('✓ Quiet atmosphere detected:', isQuiet);
  console.log('✓ Outside city detected:', isOutsideCity);
  console.log('✓ Overnight accommodation required:', isOvernightRequired);

  if (
    !isSunday ||
    !isEvening ||
    !hasWaterActivity ||
    !isQuiet ||
    !isOutsideCity ||
    !isOvernightRequired
  ) {
    throw new Error('Intent Parser failed one or more core acceptance criteria.');
  }

  console.log('\nAll Milestone 5 intent extraction acceptance criteria PASSED!');
}

runIntentParserTests().catch((e) => {
  console.error('Test execution error:', e);
  process.exit(1);
});
