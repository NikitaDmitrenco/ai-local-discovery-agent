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
    const rawLower = intent.rawQuery.toLowerCase();
    const isWater = intent.activities.some((a) =>
      a.includes('water') || a.includes('wake') || a.includes('swim') || a.includes('кататься') || a.includes('каяк')
    );
    const isOvernight = intent.accommodation.required;
    const isQuiet = intent.atmosphere.some((a) => a.includes('quiet') || a.includes('peaceful'));
    const isCelebration = rawLower.includes('др') || rawLower.includes('день рождения') || rawLower.includes('отпраздновать') || rawLower.includes('банкет') || rawLower.includes('праздник') || rawLower.includes('юбилей');
    const isDining = rawLower.includes('ресторан') || rawLower.includes('кафе') || rawLower.includes('поужинать') || rawLower.includes('пообедать') || rawLower.includes('стейк') || rawLower.includes('кухн') || isCelebration;
    const isWine = rawLower.includes('вин') || rawLower.includes('wine') || rawLower.includes('сомель') || rawLower.includes('энотек');
    const isBarNightlife = rawLower.includes('бар') || rawLower.includes('паб') || rawLower.includes('коктейл') || rawLower.includes('пив') || rawLower.includes('спикизи') || rawLower.includes('диджей') || rawLower.includes('клуб') || rawLower.includes('кальян');
    const isWork = rawLower.includes('поработать') || rawLower.includes('ноутбук') || rawLower.includes('коворкинг') || rawLower.includes('wi-fi') || rawLower.includes('кофе') || rawLower.includes('встреч');
    const isSpa =
      (rawLower.includes('спа') && !rawLower.includes('поспать') && !rawLower.includes('спать') && !rawLower.includes('спасибо')) ||
      rawLower.includes(' spa') ||
      rawLower.includes('spa ') ||
      rawLower.includes('хаммам') ||
      rawLower.includes('чан') ||
      rawLower.includes('массаж') ||
      rawLower.includes('баня') ||
      rawLower.includes('бане') ||
      rawLower.includes('саун');
    const isSports = rawLower.includes('квадроцикл') || rawLower.includes('багги') || rawLower.includes('лошад') || rawLower.includes('конн') || rawLower.includes('хайкинг') || rawLower.includes('водопад');
    const isFamily = rawLower.includes('дет') || rawLower.includes('семь') || rawLower.includes('зоопарк') || rawLower.includes('аниматор');

    const hypotheses: string[] = [];
    const categories: string[] = [];
    const activityTerms: string[] = [];
    const accommodationTerms: string[] = [];

    if (isCelebration || isDining) {
      hypotheses.push('restaurant celebration', 'fine dining banquet', 'steakhouse terrace', 'gourmet restaurant');
      categories.push('restaurant', 'steakhouse', 'banquet_hall', 'terrace');
      activityTerms.push('gourmet dinner', 'celebration', 'private room', 'wine and steaks');
    } else if (isWine) {
      hypotheses.push('wine bar enoteca', 'sommelier wine shop', 'tapas wine lounge');
      categories.push('wine_bar', 'enoteca', 'lounge');
      activityTerms.push('wine tasting', 'cheese pairings', 'sommelier consultation');
    } else if (isBarNightlife) {
      hypotheses.push('speakeasy cocktail bar', 'craft beer pub', 'nightlife dance lounge', 'hookah lounge');
      categories.push('cocktail_bar', 'speakeasy', 'pub', 'lounge');
      activityTerms.push('craft cocktails', 'craft beer', 'vinyl music', 'shisha lounge');
    } else if (isWork) {
      hypotheses.push('specialty coffee laptop friendly', 'coworking space', 'quiet business cafe', 'hotel lobby lounge');
      categories.push('cafe', 'coworking', 'coffee_shop', 'workspace');
      activityTerms.push('laptop work', 'fast wifi', 'specialty espresso', 'business meeting');
    } else if (isSpa) {
      hypotheses.push('thermal spa wellness', 'wood-fired banya lake plunge', 'herbal hot chans forest', 'spa resort');
      categories.push('spa', 'sauna', 'banya', 'thermal_baths');
      activityTerms.push('thermal bath', 'hammam', 'steam banya', 'massage');
      if (isOvernight) accommodationTerms.push('forest chalet', 'spa hotel');
    } else if (isSports) {
      hypotheses.push('quad biking safari', 'horse riding club forest', 'canyon hiking trail', 'waterfalls trek');
      categories.push('atv_tours', 'horse_riding', 'hiking_trail', 'nature_reserve');
      activityTerms.push('quad biking', 'horse trails', 'canyon hike', 'waterfall walk');
    } else if (isFamily) {
      hypotheses.push('family winery estate restaurant', 'petting zoo eco resort', 'children indoor play club', 'city zoo park');
      categories.push('family_restaurant', 'resort', 'kids_club', 'park');
      activityTerms.push('family dining', 'kids playground', 'animal petting', 'stroller walk');
    } else if (isWater) {
      hypotheses.push('wake park', 'cable wakeboarding center', 'water sports club', 'lake resort');
      categories.push('wake park', 'water sports complex', 'cable wakeboard facility', 'lake resort');
      activityTerms.push('wakeboarding', 'water ski', 'paddleboarding', 'SUP rental', 'lake swimming');
      if (isOvernight) {
        hypotheses.push('lakeside cabins overnight', 'camping and glamping near water');
        accommodationTerms.push('lakeside cabin', 'glamping safari dome', 'wooden chalet', 'eco villa');
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
