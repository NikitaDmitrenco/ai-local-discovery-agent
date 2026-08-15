import { LLMProvider, LLMOptions } from '../types';
import { SearchIntent } from '../../domain/types';

export class MockLLMProvider implements LLMProvider {
  name = 'MockLLMEngine';

  async generateText(prompt: string, options?: LLMOptions): Promise<string> {
    if (prompt.includes('refinement') || prompt.includes('refine')) {
      return 'Prioritizing quiet nature locations and excluding crowded day venues.';
    }
    return 'Detailed AI intent analysis for local discovery.';
  }

  async generateStructured<T>(
    prompt: string,
    schemaDescription: string,
    options?: LLMOptions
  ): Promise<T> {
    const lower = prompt.toLowerCase();

    // Default intent extraction for water + overnight + countryside
    const isWater = lower.includes('вод') || lower.includes('water') || lower.includes('вейк') || lower.includes('wake');
    const isOvernight = lower.includes('поспать') || lower.includes('ноч') || lower.includes('sleep') || lower.includes('stay');
    const isQuiet = lower.includes('тих') || lower.includes('quiet') || lower.includes('природ') || lower.includes('nature');
    const isSunday = lower.includes('воскрес') || lower.includes('sunday') || lower.includes('вечер') || lower.includes('evening');

    const defaultIntent: SearchIntent = {
      rawQuery: prompt,
      location: {
        name: 'Chișinău area',
        coordinates: { lat: 47.0245, lng: 28.8322 },
        radiusKm: 50,
      },
      temporal: {
        day: isSunday ? 'Sunday' : undefined,
        period: lower.includes('вечер') ? 'evening' : 'afternoon',
        isWeekend: isSunday || lower.includes('выходн'),
      },
      experience: ['relaxation', 'outdoors', isWater ? 'water_recreation' : 'nature_leisure'],
      activities: isWater ? ['wakeboarding', 'water_sports', 'swimming', 'paddleboarding'] : ['hiking', 'sightseeing'],
      atmosphere: isQuiet ? ['quiet', 'secluded', 'nature', 'outside_city'] : ['lively', 'social'],
      accommodation: {
        required: isOvernight,
        preferredType: 'cabin',
        verifiedOnly: true,
      },
      budget: null,
      partyType: lower.includes('двоих') ? 'couple' : lower.includes('друзь') ? 'friends' : null,
      priorityWeights: {
        activity: isWater ? 0.35 : 0.2,
        atmosphere: isQuiet ? 0.3 : 0.2,
        accommodation: isOvernight ? 0.25 : 0.1,
        distance: 0.1,
        reputation: 0.05,
      },
      unknowns: ['specific budget', 'transportation mode'],
    };

    return defaultIntent as unknown as T;
  }
}
