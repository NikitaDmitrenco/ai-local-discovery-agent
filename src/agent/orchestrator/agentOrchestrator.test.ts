import { DiscoveryAgentOrchestrator } from './agentOrchestrator';
import { MockPlaceProvider } from '../../providers/mock/MockPlaceProvider';
import { MockLLMProvider } from '../../providers/mock/MockLLMProvider';
import { MockGeocodingProvider } from '../../providers/mock/MockGeocodingProvider';

async function runOrchestratorTests() {
  const placeProvider = new MockPlaceProvider();
  const llmProvider = new MockLLMProvider();
  const geoProvider = new MockGeocodingProvider();

  const orchestrator = new DiscoveryAgentOrchestrator(
    placeProvider,
    llmProvider,
    geoProvider
  );

  const query =
    'Хочу вечерком воскресным отдохнуть в каком-нибудь тихом местечке где можно покататься на воде и поспать за городом';

  console.log('Testing DiscoveryAgentOrchestrator with query:', query);
  const result = await orchestrator.runDiscovery(query, 'Chișinău, Moldova');

  console.log('Orchestration Result summary:');
  console.log(`- Places found: ${result.places.length}`);
  console.log(`- Top Match: ${result.places[0]?.name} (${result.places[0]?.intentMatch.score}%)`);
  console.log(`- Tool Invocations: ${result.trace.toolInvocations.length}`);
  console.log(`- Hypotheses: ${result.trace.searchHypotheses.length}`);
  console.log(`- Total Execution Time: ${result.trace.executionTimeMs}ms`);

  // Assertions
  const hasMultipleTools = result.trace.toolInvocations.length >= 4;
  const topPlace = result.places[0];
  const hasWakeOrWaterPlace = result.places.some(
    (p) => p.category.toLowerCase().includes('wake') || p.activities.some((a) => a.includes('Wake'))
  );
  const hasVerifications = topPlace.verifications.length > 0;
  const hasReviews = topPlace.reviewSummary.reviewCount > 0;

  console.log('\n--- Orchestrator Acceptance Checks ---');
  console.log('✓ Multi-step tool invocations occurred:', hasMultipleTools);
  console.log('✓ Discovered matching wake/water place:', hasWakeOrWaterPlace);
  console.log('✓ Claims verified:', hasVerifications);
  console.log('✓ Reviews synthesized:', hasReviews);

  if (!hasMultipleTools || !hasWakeOrWaterPlace || !hasVerifications || !hasReviews) {
    throw new Error('DiscoveryAgentOrchestrator failed core acceptance criteria.');
  }

  console.log('\nAll Milestone 7 Agent Orchestration acceptance criteria PASSED!');
}

runOrchestratorTests().catch((e) => {
  console.error('Test failed:', e);
  process.exit(1);
});
