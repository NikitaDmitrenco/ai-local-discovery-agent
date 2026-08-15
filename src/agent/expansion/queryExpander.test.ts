import { IntentParser } from '../intent/intentParser';
import { SemanticQueryExpander } from './queryExpander';
import { MockLLMProvider } from '../../providers/mock/MockLLMProvider';

async function runSemanticExpansionTests() {
  const llm = new MockLLMProvider();
  const parser = new IntentParser(llm);
  const expander = new SemanticQueryExpander(llm);

  const primaryDemoQuery =
    'Хочу вечерком воскресным отдохнуть в каком-нибудь тихом местечке где можно покататься на воде и поспать за городом';

  console.log('Testing Semantic Query Expansion with:', primaryDemoQuery);
  const intent = await parser.parseIntent(primaryDemoQuery, 'Chișinău, Moldova');
  const expansion = await expander.expandIntent(intent);

  console.log('Expanded Hypotheses:', JSON.stringify(expansion, null, 2));

  const allHypothesesText = expansion.hypotheses.join(' ').toLowerCase();
  const allCategoriesText = expansion.categories.join(' ').toLowerCase();

  const hasWakePark =
    allHypothesesText.includes('wake park') ||
    allCategoriesText.includes('wake park') ||
    allHypothesesText.includes('wakeboard');

  const hasLakeResort =
    allHypothesesText.includes('lake resort') ||
    allCategoriesText.includes('lake resort') ||
    allHypothesesText.includes('recreation base');

  const hasWaterGlamping =
    allHypothesesText.includes('glamping') ||
    allHypothesesText.includes('cabins') ||
    allHypothesesText.includes('camping');

  const hasWaterSports =
    allHypothesesText.includes('water sports') ||
    expansion.activityTerms.some((t) => t.includes('water') || t.includes('wake'));

  console.log('\n--- Semantic Expansion Acceptance Checks ---');
  console.log('✓ Wake park / wakeboard concept discovered:', hasWakePark);
  console.log('✓ Lake resort / recreation base concept discovered:', hasLakeResort);
  console.log('✓ Camping / glamping / cabins near water discovered:', hasWaterGlamping);
  console.log('✓ Water sports activity concepts discovered:', hasWaterSports);

  if (!hasWakePark || !hasLakeResort || !hasWaterGlamping || !hasWaterSports) {
    throw new Error('Semantic Query Expander failed core acceptance criteria.');
  }

  console.log('\nAll Milestone 6 semantic query expansion acceptance criteria PASSED!');
}

runSemanticExpansionTests().catch((e) => {
  console.error('Test failed:', e);
  process.exit(1);
});
