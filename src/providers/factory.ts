import { PlaceSearchProvider, LLMProvider, GeocodingProvider } from './types';
import { AggregatedPlaceProvider } from './real/AggregatedPlaceProvider';
import { GeminiLLMProvider } from './real/GeminiLLMProvider';
import { OpenAILLMProvider } from './real/OpenAILLMProvider';
import { MockLLMProvider } from './mock/MockLLMProvider';
import { NominatimGeocodingProvider } from './real/NominatimGeocodingProvider';
import { MockPlaceProvider } from './mock/MockPlaceProvider';
import { MockGeocodingProvider } from './mock/MockGeocodingProvider';

export class ProviderFactory {
  private static placeProviderInstance: PlaceSearchProvider | null = null;
  private static llmProviderInstance: LLMProvider | null = null;
  private static geocodingProviderInstance: GeocodingProvider | null = null;

  static getPlaceProvider(): PlaceSearchProvider {
    if (!this.placeProviderInstance) {
      const isPureMock = process.env.NEXT_PUBLIC_DEMO_MODE === 'pure_mock';
      this.placeProviderInstance = isPureMock
        ? new MockPlaceProvider()
        : new AggregatedPlaceProvider();
    }
    return this.placeProviderInstance;
  }

  static getLLMProvider(): LLMProvider {
    if (!this.llmProviderInstance) {
      const geminiKey = process.env.GEMINI_API_KEY;
      const openaiKey = process.env.OPENAI_API_KEY;
      const groqKey = process.env.GROQ_API_KEY;

      if (geminiKey) {
        this.llmProviderInstance = new GeminiLLMProvider(geminiKey);
      } else if (openaiKey) {
        this.llmProviderInstance = new OpenAILLMProvider(openaiKey);
      } else if (groqKey) {
        this.llmProviderInstance = new OpenAILLMProvider(groqKey, 'https://api.groq.com/openai/v1', 'llama-3.3-70b-versatile');
      } else {
        this.llmProviderInstance = new MockLLMProvider();
      }
    }
    return this.llmProviderInstance;
  }

  static getGeocodingProvider(): GeocodingProvider {
    if (!this.geocodingProviderInstance) {
      const isPureMock = process.env.NEXT_PUBLIC_DEMO_MODE === 'pure_mock';
      this.geocodingProviderInstance = isPureMock
        ? new MockGeocodingProvider()
        : new NominatimGeocodingProvider();
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
