import { PlaceSearchProvider, LLMProvider, GeocodingProvider } from './types';
import { MockPlaceProvider } from './mock/MockPlaceProvider';
import { MockLLMProvider } from './mock/MockLLMProvider';
import { MockGeocodingProvider } from './mock/MockGeocodingProvider';

export class ProviderFactory {
  private static placeProviderInstance: PlaceSearchProvider | null = null;
  private static llmProviderInstance: LLMProvider | null = null;
  private static geocodingProviderInstance: GeocodingProvider | null = null;

  static getPlaceProvider(): PlaceSearchProvider {
    if (!this.placeProviderInstance) {
      // Default to MockPlaceProvider in demo mode or when API keys are not supplied
      this.placeProviderInstance = new MockPlaceProvider();
    }
    return this.placeProviderInstance;
  }

  static getLLMProvider(): LLMProvider {
    if (!this.llmProviderInstance) {
      // Default to MockLLMProvider in demo mode or when API keys are not supplied
      this.llmProviderInstance = new MockLLMProvider();
    }
    return this.llmProviderInstance;
  }

  static getGeocodingProvider(): GeocodingProvider {
    if (!this.geocodingProviderInstance) {
      this.geocodingProviderInstance = new MockGeocodingProvider();
    }
    return this.geocodingProviderInstance;
  }

  static setPlaceProvider(provider: PlaceSearchProvider) {
    this.placeProviderInstance = provider;
  }

  static setLLMProvider(provider: LLMProvider) {
    this.llmProviderInstance = provider;
  }

  static setGeocodingProvider(provider: GeocodingProvider) {
    this.geocodingProviderInstance = provider;
  }
}
