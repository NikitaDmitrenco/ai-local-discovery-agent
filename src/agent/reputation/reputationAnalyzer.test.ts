import { ReputationAnalyzer } from './reputationAnalyzer';
import { MockLLMProvider } from '../../providers/mock/MockLLMProvider';
import { RawReviewItem } from '../../providers/types';

async function runReputationTests() {
  const llm = new MockLLMProvider();
  const analyzer = new ReputationAnalyzer(llm);

  const reviews: RawReviewItem[] = [
    {
      authorName: 'Alex M.',
      rating: 5,
      text: 'Best wakeboarding in Moldova! Cable system is top notch and instructors are patient. Stayed in the wooden cabin overnight, sunset was incredible.',
    },
    {
      authorName: 'Elena V.',
      rating: 5,
      text: 'Super peaceful on Sunday evenings. Very quiet outside the city. The cabins are warm and clean.',
    },
    {
      authorName: 'Dumitru C.',
      rating: 4,
      text: 'Great spot for water sports. Road is slightly rough the last 500 meters, but totally worth it.',
    },
  ];

  console.log('Testing ReputationAnalyzer with rich reviews...');
  const resultRich = await analyzer.analyzeReputation(
    'WakePark Ghidighici',
    reviews,
    4.8,
    342
  );

  console.log('Rich Reputation Result:', JSON.stringify(resultRich, null, 2));

  console.log('\nTesting ReputationAnalyzer with empty reviews (limited evidence)...');
  const resultEmpty = await analyzer.analyzeReputation(
    'Unreviewed Spot',
    [],
    undefined,
    0
  );

  console.log('Empty Reputation Result:', JSON.stringify(resultEmpty, null, 2));

  // Assertions
  const hasRatingAndCount = resultRich.rating === 4.8 && resultRich.reviewCount === 342;
  const hasPositiveThemes = resultRich.positiveThemes.length >= 2;
  const hasNegativeThemes = resultRich.negativeThemes.length >= 1;
  const hasSummary = Boolean(resultRich.summary && resultRich.summary.length > 20);
  const emptyHandledWithoutFabrication = resultEmpty.confidence === 'limited' || resultEmpty.summary.includes('Limited review evidence');

  console.log('\n--- Reputation Acceptance Checks ---');
  console.log('✓ Rating and count preserved accurately:', hasRatingAndCount);
  console.log('✓ Positive themes extracted:', hasPositiveThemes);
  console.log('✓ Caveats / negative themes extracted:', hasNegativeThemes);
  console.log('✓ Grounded reputation summary provided:', hasSummary);
  console.log('✓ Empty evidence gracefully handled without fabrication:', emptyHandledWithoutFabrication);

  if (
    !hasRatingAndCount ||
    !hasPositiveThemes ||
    !hasNegativeThemes ||
    !hasSummary ||
    !emptyHandledWithoutFabrication
  ) {
    throw new Error('ReputationAnalyzer failed core acceptance criteria.');
  }

  console.log('\nAll Milestone 9 Reviews & Reputation acceptance criteria PASSED!');
}

runReputationTests().catch((e) => {
  console.error('Test failed:', e);
  process.exit(1);
});
