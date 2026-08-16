import { ProviderFactory } from '../providers/factory';
import { DiscoveryAgentOrchestrator } from '../agent/orchestrator/agentOrchestrator';
import { DiscoveryResult } from '../domain/types';

export class DiscoveryService {
  /**
   * Execute the full discovery pipeline through the DiscoveryAgentOrchestrator
   */
  static async discoverPlaces(
    rawQuery: string,
    locationName = 'Chișinău, Moldova',
    refinementKey?: string,
    sessionId?: string,
    onProgress?: (step: { id: string; status: 'running' | 'completed'; detail?: string; summary?: string }) => void
  ): Promise<DiscoveryResult> {
    const placeProvider = ProviderFactory.getPlaceProvider();
    const llmProvider = ProviderFactory.getLLMProvider();
    const geocodingProvider = ProviderFactory.getGeocodingProvider();

    const orchestrator = new DiscoveryAgentOrchestrator(
      placeProvider,
      llmProvider,
      geocodingProvider
    );

    return orchestrator.runDiscovery(rawQuery, locationName, refinementKey, sessionId, onProgress);
  }
}
