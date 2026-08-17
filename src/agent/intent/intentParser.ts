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
    const queryString = typeof rawQuery === 'string' ? rawQuery : (rawQuery as any)?.rawQuery || (rawQuery as any)?.query || String(rawQuery || '');
    const lower = queryString.toLowerCase();

    // Temporal detection
    const isSunday = lower.includes('воскрес') || lower.includes('sunday');
    const isSaturday = lower.includes('суббот') || lower.includes('saturday');
    const isFriday = lower.includes('пятниц') || lower.includes('friday');
    const isWeekend = isSunday || isSaturday || isFriday || lower.includes('выходн') || lower.includes('weekend');
    const isEvening = lower.includes('вечер') || lower.includes('evening') || lower.includes('sunset') || lower.includes('закат') || lower.includes('ночь') || lower.includes('night');
    const isMorning = lower.includes('утр') || lower.includes('morning') || lower.includes('завтрак') || lower.includes('рассвет');

    let day: string | undefined = undefined;
    if (isSunday) day = 'Sunday';
    else if (isSaturday) day = 'Saturday';
    else if (isFriday) day = 'Friday';

    const period = isEvening ? 'evening' : isMorning ? 'morning' : 'afternoon';

    // Domain / Scenario Classification
    const drRegex = /(^|\s|[.,!?])(др|dr)([.,!?]|\s|$)/i;
    const isCelebration =
      drRegex.test(lower) ||
      lower.includes('день рождения') ||
      lower.includes('рождени') ||
      lower.includes('отпраздновать') ||
      lower.includes('банкет') ||
      lower.includes('юбилей') ||
      lower.includes('мальчишник') ||
      lower.includes('свадеб') ||
      lower.includes('праздник') ||
      lower.includes('celebrat') ||
      lower.includes('birthday') ||
      lower.includes('party');

    const isDining =
      lower.includes('ресторан') ||
      lower.includes('кафе') ||
      lower.includes('поужинать') ||
      lower.includes('пообедать') ||
      lower.includes('еда') ||
      lower.includes('кухн') ||
      lower.includes('стейк') ||
      lower.includes('паста') ||
      lower.includes('гастро') ||
      lower.includes('restaurant') ||
      lower.includes('dining') ||
      isCelebration;

    const isWine =
      lower.includes('вин') ||
      lower.includes('wine') ||
      lower.includes('сомель') ||
      lower.includes('энотек') ||
      lower.includes('enoteca') ||
      lower.includes('дегустац');

    const isBarNightlife =
      lower.includes('бар') ||
      lower.includes('паб') ||
      lower.includes('коктейл') ||
      lower.includes('пив') ||
      lower.includes('спикизи') ||
      lower.includes('диджей') ||
      lower.includes('клуб') ||
      lower.includes('кальян') ||
      lower.includes('bar') ||
      lower.includes('pub') ||
      lower.includes('cocktail') ||
      lower.includes('beer') ||
      lower.includes('shisha') ||
      lower.includes('nightlife');

    const isWork =
      lower.includes('поработать') ||
      lower.includes('ноутбук') ||
      lower.includes('коворкинг') ||
      lower.includes('wi-fi') ||
      lower.includes('вайфай') ||
      lower.includes('встреч') ||
      lower.includes('переговор') ||
      lower.includes('делов') ||
      lower.includes('кофе') ||
      lower.includes('розеток') ||
      lower.includes('coworking') ||
      lower.includes('work');

    const isSpa =
      (lower.includes('спа') && !lower.includes('поспать') && !lower.includes('спать') && !lower.includes('спасибо')) ||
      lower.includes(' spa') ||
      lower.includes('spa ') ||
      lower.includes('хаммам') ||
      lower.includes('чан') ||
      lower.includes('массаж') ||
      lower.includes('термаль') ||
      lower.includes('баня') ||
      lower.includes('бан ') ||
      lower.includes('бане') ||
      lower.includes('бани') ||
      lower.includes('баню') ||
      lower.includes('саун') ||
      lower.includes('sauna') ||
      lower.includes('banya');

    const isWater =
      lower.includes('вод') ||
      lower.includes('water') ||
      lower.includes('вейк') ||
      lower.includes('wake') ||
      lower.includes('сап') ||
      lower.includes('sup') ||
      lower.includes('катер') ||
      lower.includes('лодка') ||
      lower.includes('каяк') ||
      lower.includes('бассейн') ||
      lower.includes('pool');

    const isSportsAdventure =
      lower.includes('квадроцикл') ||
      lower.includes('atv') ||
      lower.includes('багги') ||
      lower.includes('лошад') ||
      lower.includes('конн') ||
      lower.includes('хайкинг') ||
      lower.includes('троп') ||
      lower.includes('водопад') ||
      lower.includes('пеший') ||
      lower.includes('скал') ||
      lower.includes('hiking') ||
      lower.includes('horses') ||
      lower.includes('adventure');

    const isFamily =
      lower.includes('дет') ||
      lower.includes('семь') ||
      lower.includes('зоопарк') ||
      lower.includes('аниматор') ||
      lower.includes('коляск') ||
      lower.includes('игров') ||
      lower.includes('family') ||
      lower.includes('kids');

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
      lower.includes('на природ') ||
      lower.includes('лесу') ||
      lower.includes('днестр') ||
      lower.includes('орхей') ||
      lower.includes('квест') ||
      isSportsAdventure ||
      (isWater && !lower.includes('валя морилор'));

    const isRomantic = lower.includes('романтич') || lower.includes('romantic') || lower.includes('двоих') || lower.includes('девушк') || lower.includes('свидани');

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
      lower.includes('glamping') ||
      lower.includes('глэмпинг') ||
      lower.includes('палатк') ||
      lower.includes('кемпинг') ||
      lower.includes('hotel');

    // Build activities list
    const activities: string[] = [];
    if (isCelebration) activities.push('celebration dinner', 'private party', 'banquet');
    if (isDining) activities.push('gourmet dining', 'outdoor terrace');
    if (isWine) activities.push('wine tasting', 'sommelier selection');
    if (isBarNightlife) activities.push('craft cocktails', 'craft beer', 'nightlife music');
    if (isWork) activities.push('laptop workspace', 'specialty coffee', 'business meeting');
    if (isSpa) activities.push('thermal spa', 'wood-fired banya', 'massage');
    if (isWater) activities.push('water sports', 'wakeboarding', 'sup paddleboarding');
    if (isSportsAdventure) activities.push('quad biking', 'horse riding', 'nature hiking');
    if (isFamily) activities.push('kids playground', 'family leisure');
    if (activities.length === 0) activities.push('outdoor leisure', 'relaxation');

    // Build atmosphere list
    const atmosphere: string[] = [];
    if (isQuiet) atmosphere.push('quiet', 'peaceful');
    if (isOutsideCity) atmosphere.push('outside city', 'nature');
    if (isRomantic) atmosphere.push('romantic', 'sunset views', 'intimate');
    if (isCelebration || isBarNightlife) atmosphere.push('lively', 'festive', 'cheerful');
    if (isWork) atmosphere.push('productive', 'cozy');
    if (atmosphere.length === 0) atmosphere.push('relaxing', 'pleasant');

    const partyType = isRomantic ? 'couple' : isFamily ? 'family' : lower.includes('друзь') || isCelebration ? 'friends' : isWork ? 'solo' : null;

    // Search radius: City venues get tight radius (5-8km), Countryside gets expanded radius (35-75km)
    const searchRadiusKm = isOutsideCity ? 60 : (isDining || isBarNightlife || isWork) ? 8 : 25;

    return {
      rawQuery,
      location: {
        name: userLocationName,
        coordinates: userCoordinates || { lat: 47.0245, lng: 28.8322 },
        radiusKm: searchRadiusKm,
      },
      temporal: {
        day,
        period,
        isWeekend,
      },
      experience: [
        isCelebration ? 'celebration_party' : isDining ? 'dining_experience' : isSpa ? 'wellness_spa' : isWater ? 'water_recreation' : isWork ? 'work_coffee' : isBarNightlife ? 'nightlife_drinks' : isSportsAdventure ? 'active_adventure' : 'nature_escape',
      ],
      activities,
      atmosphere,
      accommodation: {
        required: isOvernight,
        preferredType: lower.includes('глэмпинг') ? 'glamping' : lower.includes('палатк') ? 'camping' : 'cabin',
        verifiedOnly: true,
      },
      budget: null,
      partyType,
      priorityWeights: {
        activity: isWater || isSportsAdventure ? 0.35 : 0.25,
        atmosphere: isRomantic || isQuiet || isCelebration ? 0.35 : 0.25,
        accommodation: isOvernight ? 0.3 : 0.1,
        distance: isOutsideCity ? 0.1 : 0.3,
        reputation: 0.2,
      },
      unknowns: [],
    };
  }
}
