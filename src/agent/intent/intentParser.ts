import { LLMProvider } from '../../providers/types';
import { SearchIntent, Coordinates } from '../../domain/types';

export class IntentParser {
  private llm: LLMProvider;

  constructor(llm: LLMProvider) {
    this.llm = llm;
  }

  /**
   * Parses natural language user input into typed SearchIntent
   */
  async parseIntent(
    rawQuery: string,
    userLocationName = 'Chișinău, Moldova',
    userCoordinates?: Coordinates
  ): Promise<SearchIntent> {
    const prompt = `
Extract structured local discovery intent from this natural language query:
"${rawQuery}"

Target origin location: "${userLocationName}"

Requirements:
1. Identify temporal constraints (day e.g. "Sunday", period e.g. "evening", "morning", "afternoon", "weekend").
2. Extract desired activities (e.g. water sports, wakeboarding, boating, swimming, hiking, sauna).
3. Extract desired atmosphere / vibe (e.g. quiet, nature, secluded, outside city, romantic, lively).
4. Identify if overnight accommodation is required (e.g. words like "поспать", "переночевать", "ночевка", "stay overnight", "sleep").
5. Determine dynamic priority weights (activity, atmosphere, accommodation, distance, reputation) summing to 1.0 based on user emphasis.
6. Identify explicitly unspecified unknowns.
`;

    const schemaDescription = `
{
  "rawQuery": string,
  "location": {
    "name": string,
    "radiusKm": number
  },
  "temporal": {
    "day": string or null,
    "period": "morning" | "afternoon" | "evening" | "night" | "full_day" | "weekend",
    "isWeekend": boolean
  },
  "experience": string[],
  "activities": string[],
  "atmosphere": string[],
  "accommodation": {
    "required": boolean,
    "preferredType": "cabin" | "glamping" | "hotel" | "villa" | "camping" | "any",
    "verifiedOnly": boolean
  },
  "budget": "budget" | "moderate" | "luxury" | null,
  "partyType": "solo" | "couple" | "friends" | "family" | null,
  "priorityWeights": {
    "activity": number,
    "atmosphere": number,
    "accommodation": number,
    "distance": number,
    "reputation": number
  },
  "unknowns": string[]
}
`;

    try {
      const extracted = await this.llm.generateStructured<SearchIntent>(
        prompt,
        schemaDescription,
        { temperature: 0.1 }
      );

      // Ensure full normalized fields are present
      return this.normalizeIntent(extracted, rawQuery, userLocationName, userCoordinates);
    } catch (e) {
      console.warn('LLM structured extraction failed or offline, applying deterministic rule-based semantic extractor:', e);
      return this.ruleBasedExtract(rawQuery, userLocationName, userCoordinates);
    }
  }

  private normalizeIntent(
    extracted: Partial<SearchIntent>,
    rawQuery: string,
    userLocationName: string,
    userCoordinates?: Coordinates
  ): SearchIntent {
    const fallback = this.ruleBasedExtract(rawQuery, userLocationName, userCoordinates);

    return {
      rawQuery,
      location: {
        name: extracted.location?.name || userLocationName,
        coordinates: userCoordinates || fallback.location.coordinates,
        radiusKm: extracted.location?.radiusKm || 50,
      },
      temporal: {
        day: extracted.temporal?.day || fallback.temporal.day,
        period: extracted.temporal?.period || fallback.temporal.period,
        isWeekend: extracted.temporal?.isWeekend ?? fallback.temporal.isWeekend,
      },
      experience: extracted.experience?.length ? extracted.experience : fallback.experience,
      activities: extracted.activities?.length ? extracted.activities : fallback.activities,
      atmosphere: extracted.atmosphere?.length ? extracted.atmosphere : fallback.atmosphere,
      accommodation: {
        required: extracted.accommodation?.required ?? fallback.accommodation.required,
        preferredType: extracted.accommodation?.preferredType || fallback.accommodation.preferredType,
        verifiedOnly: true,
      },
      budget: extracted.budget || fallback.budget,
      partyType: extracted.partyType || fallback.partyType,
      priorityWeights: extracted.priorityWeights || fallback.priorityWeights,
      unknowns: extracted.unknowns || fallback.unknowns,
    };
  }

  /**
   * Deterministic high-precision fallback parser for offline/mock or edge cases
   */
  public ruleBasedExtract(
    rawQuery: string,
    userLocationName: string,
    userCoordinates?: Coordinates
  ): SearchIntent {
    const lower = rawQuery.toLowerCase();

    // Temporal detection
    const isSunday = lower.includes('воскрес') || lower.includes('sunday');
    const isSaturday = lower.includes('суббот') || lower.includes('saturday');
    const isWeekend = isSunday || isSaturday || lower.includes('выходн') || lower.includes('weekend');
    const isEvening = lower.includes('вечер') || lower.includes('evening') || lower.includes('sunset') || lower.includes('закат');
    const isMorning = lower.includes('утр') || lower.includes('morning');

    let day: string | undefined = undefined;
    if (isSunday) day = 'Sunday';
    else if (isSaturday) day = 'Saturday';

    const period = isEvening ? 'evening' : isMorning ? 'morning' : 'afternoon';

    // Activity detection
    const isWater =
      lower.includes('вод') ||
      lower.includes('water') ||
      lower.includes('вейк') ||
      lower.includes('wake') ||
      lower.includes('сап') ||
      lower.includes('sup') ||
      lower.includes('катер') ||
      lower.includes('катал');

    const isKayak = lower.includes('каяк') || lower.includes('kayak') || lower.includes('байдарк');
    const isSauna = lower.includes('саун') || lower.includes('бан') || lower.includes('sauna');

    const activities: string[] = [];
    if (isWater) activities.push('water sports', 'wakeboarding', 'swimming');
    if (isKayak) activities.push('kayaking', 'paddleboarding');
    if (isSauna) activities.push('wood-fired sauna');
    if (activities.length === 0) activities.push('outdoor leisure', 'nature walk');

    // Atmosphere detection
    const isQuiet =
      lower.includes('тих') ||
      lower.includes('quiet') ||
      lower.includes('уединен') ||
      lower.includes('secluded') ||
      lower.includes('природ') ||
      lower.includes('nature') ||
      lower.includes('спокойн');

    const isOutsideCity =
      lower.includes('за город') ||
      lower.includes('outside city') ||
      lower.includes('countryside') ||
      lower.includes('на природ');

    const isRomantic = lower.includes('романтич') || lower.includes('romantic') || lower.includes('двоих');

    const atmosphere: string[] = [];
    if (isQuiet) atmosphere.push('quiet', 'peaceful');
    if (isOutsideCity) atmosphere.push('outside city', 'nature');
    if (isRomantic) atmosphere.push('romantic', 'sunset views');
    if (atmosphere.length === 0) atmosphere.push('relaxing', 'scenic');

    // Accommodation detection
    const isOvernight =
      lower.includes('поспать') ||
      lower.includes('ноч') ||
      lower.includes('переночевать') ||
      lower.includes('домик') ||
      lower.includes('номер') ||
      lower.includes('sleep') ||
      lower.includes('stay overnight') ||
      lower.includes('cabin') ||
      lower.includes('hotel');

    const partyType = isRomantic ? 'couple' : lower.includes('друзь') ? 'friends' : lower.includes('семь') ? 'family' : null;

    return {
      rawQuery,
      location: {
        name: userLocationName,
        coordinates: userCoordinates || { lat: 47.0245, lng: 28.8322 },
        radiusKm: isOutsideCity ? 45 : 25,
      },
      temporal: {
        day,
        period,
        isWeekend,
      },
      experience: ['relaxation', 'outdoors', isWater ? 'water_recreation' : 'nature_escape'],
      activities,
      atmosphere,
      accommodation: {
        required: isOvernight,
        preferredType: lower.includes('глэмпинг') ? 'glamping' : 'cabin',
        verifiedOnly: true,
      },
      budget: null,
      partyType,
      priorityWeights: {
        activity: isWater ? 0.35 : 0.2,
        atmosphere: isQuiet ? 0.3 : 0.2,
        accommodation: isOvernight ? 0.25 : 0.1,
        distance: 0.1,
        reputation: 0.05,
      },
      unknowns: ['explicit budget limit', 'vehicle type'],
    };
  }
}
