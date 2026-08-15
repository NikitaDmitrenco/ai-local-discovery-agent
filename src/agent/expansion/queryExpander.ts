import { LLMProvider } from '../../providers/types';
import { SearchIntent } from '../../domain/types';

export interface ExpansionStrategy {
  hypotheses: string[];
  categories: string[];
  activityTerms: string[];
  accommodationTerms: string[];
  priorityRankedQueries: string[];
}

export class SemanticQueryExpander {
  private llm: LLMProvider;

  constructor(llm: LLMProvider) {
    this.llm = llm;
  }

  /**
   * Expands natural language intent into multiple diverse search hypotheses
   */
  async expandIntent(intent: SearchIntent): Promise<ExpansionStrategy> {
    const prompt = `
Given this parsed local discovery intent:
- Query: "${intent.rawQuery}"
- Activities: ${intent.activities.join(', ')}
- Atmosphere: ${intent.atmosphere.join(', ')}
- Experience: ${intent.experience.join(', ')}
- Accommodation required: ${intent.accommodation.required ? 'YES (' + (intent.accommodation.preferredType || 'any') + ')' : 'NO'}
- Location: ${intent.location.name}

Generate semantic search hypotheses that bridge human experiential language to real-world business categories, venues, and activity places.
Crucial: If the user mentions riding on water or water fun, hypothesize wake parks, cable wakeboarding, lake recreation bases, water sports clubs, glamping near water, and lake resorts even if the user never explicitly said "wake park".

Return JSON matching:
{
  "hypotheses": string[],
  "categories": string[],
  "activityTerms": string[],
  "accommodationTerms": string[],
  "priorityRankedQueries": string[]
}
`;

    const schemaDescription = `
{
  "hypotheses": string[],
  "categories": string[],
  "activityTerms": string[],
  "accommodationTerms": string[],
  "priorityRankedQueries": string[]
}
`;

    try {
      const result = await this.llm.generateStructured<ExpansionStrategy>(
        prompt,
        schemaDescription,
        { temperature: 0.2 }
      );

      if (result && Array.isArray(result.hypotheses) && result.hypotheses.length >= 4) {
        return this.normalizeStrategy(result, intent);
      }
      return this.ruleBasedExpansion(intent);
    } catch (e) {
      console.warn('LLM semantic expansion failed, applying semantic taxonomy expander:', e);
      return this.ruleBasedExpansion(intent);
    }
  }

  private normalizeStrategy(
    extracted: ExpansionStrategy,
    intent: SearchIntent
  ): ExpansionStrategy {
    const fallback = this.ruleBasedExpansion(intent);
    const combinedHypotheses = Array.from(
      new Set([...extracted.hypotheses, ...fallback.hypotheses])
    );
    const combinedCategories = Array.from(
      new Set([...extracted.categories, ...fallback.categories])
    );

    return {
      hypotheses: combinedHypotheses,
      categories: combinedCategories,
      activityTerms: extracted.activityTerms?.length ? extracted.activityTerms : fallback.activityTerms,
      accommodationTerms: extracted.accommodationTerms?.length ? extracted.accommodationTerms : fallback.accommodationTerms,
      priorityRankedQueries: extracted.priorityRankedQueries?.length ? extracted.priorityRankedQueries : combinedHypotheses.slice(0, 5),
    };
  }

  /**
   * High-accuracy semantic taxonomy expander for guaranteed discovery
   */
  public ruleBasedExpansion(intent: SearchIntent): ExpansionStrategy {
    const isWater = intent.activities.some((a) =>
      a.includes('water') || a.includes('wake') || a.includes('swim') || a.includes('кататься')
    );
    const isOvernight = intent.accommodation.required;
    const isQuiet = intent.atmosphere.some((a) => a.includes('quiet') || a.includes('peaceful'));

    const hypotheses: string[] = [];
    const categories: string[] = [];
    const activityTerms: string[] = [];
    const accommodationTerms: string[] = [];

    if (isWater) {
      // 1. Direct and adjacent activity venues
      hypotheses.push('wake park', 'cable wakeboarding center', 'water sports club');
      categories.push('wake park', 'water sports complex', 'cable wakeboard facility');
      activityTerms.push('wakeboarding', 'water ski', 'paddleboarding', 'SUP rental', 'lake swimming');

      // 2. Lakeside resort & recreation bases
      hypotheses.push('lake resort', 'water recreation base', 'countryside lake club');
      categories.push('lake resort', 'recreation base', 'water recreation complex');

      // 3. Accommodation combinations if overnight requested
      if (isOvernight) {
        hypotheses.push(
          'lakeside cabins overnight',
          'camping and glamping near water',
          'waterfront eco cottages',
          'lake hotel with water activities'
        );
        accommodationTerms.push('lakeside cabin', 'glamping safari dome', 'wooden chalet', 'eco villa');
      }

      // 4. Atmosphere-specific combinations
      if (isQuiet) {
        hypotheses.push('quiet lake retreat outside city', 'peaceful reservoir haven');
      }
    } else {
      hypotheses.push('countryside recreation base', 'nature retreat', 'eco resort');
      categories.push('recreation base', 'resort', 'park');
      if (isOvernight) {
        hypotheses.push('countryside cabins', 'forest glamping', 'wooden chalets');
        accommodationTerms.push('cabin', 'chalet', 'cottage');
      }
    }

    const priorityRankedQueries = hypotheses.slice(0, 6);

    return {
      hypotheses,
      categories,
      activityTerms,
      accommodationTerms,
      priorityRankedQueries,
    };
  }
}
