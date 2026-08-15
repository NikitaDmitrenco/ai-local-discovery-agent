import { SearchIntent, Coordinates } from '../../domain/types';

export interface ConversationTurn {
  turnIndex: number;
  userQuery: string;
  intent: SearchIntent;
  resultsCount: number;
  candidatePlaceIds: string[];
  timestamp: string;
}

export interface ConversationSession {
  sessionId: string;
  turns: ConversationTurn[];
  accumulatedIntent: SearchIntent;
  retainedLocation: {
    name: string;
    coordinates?: Coordinates;
  };
  lastUpdated: number;
}

export class ConversationMemoryManager {
  private static sessions = new Map<string, ConversationSession>();

  /**
   * Retrieves an existing session or creates a new one
   */
  static getOrCreateSession(sessionId: string, initialLocationName = 'Chișinău, Moldova'): ConversationSession {
    let session = this.sessions.get(sessionId);
    if (!session) {
      session = {
        sessionId,
        turns: [],
        accumulatedIntent: {
          rawQuery: '',
          location: { name: initialLocationName, radiusKm: 50 },
          temporal: { isWeekend: false, period: 'afternoon' },
          experience: [],
          activities: [],
          atmosphere: [],
          accommodation: { required: false },
          priorityWeights: { activity: 0.2, atmosphere: 0.2, accommodation: 0.2, distance: 0.2, reputation: 0.2 },
          unknowns: [],
        },
        retainedLocation: { name: initialLocationName },
        lastUpdated: Date.now(),
      };
      this.sessions.set(sessionId, session);
    }
    return session;
  }

  /**
   * Merges a new turn's parsed intent with prior conversational context
   */
  static mergeTurn(
    sessionId: string,
    newQuery: string,
    newIntent: SearchIntent
  ): { mergedIntent: SearchIntent; session: ConversationSession } {
    const session = this.getOrCreateSession(sessionId, newIntent.location.name);

    if (session.turns.length === 0) {
      // First turn: initialize accumulated intent
      session.accumulatedIntent = JSON.parse(JSON.stringify(newIntent));
      session.retainedLocation = {
        name: newIntent.location.name,
        coordinates: newIntent.location.coordinates,
      };
    } else {
      // Multi-turn continuation: carry forward stable attributes
      const prev = session.accumulatedIntent;

      // 1. Preserve location unless explicitly specified in new query
      const isLocationMentionedInNewQuery =
        newQuery.toLowerCase().includes('в кишинев') ||
        newQuery.toLowerCase().includes('в бельц') ||
        newQuery.toLowerCase().includes('in chisinau');

      const locationName = isLocationMentionedInNewQuery ? newIntent.location.name : session.retainedLocation.name;
      const coordinates = isLocationMentionedInNewQuery ? newIntent.location.coordinates : session.retainedLocation.coordinates;
      const radiusKm = newIntent.location.radiusKm || prev.location.radiusKm || 50;

      // 2. Carry over temporal context (e.g. Sunday evening) unless explicitly changed
      const day = newIntent.temporal.day || prev.temporal.day;
      const period = newIntent.temporal.period || prev.temporal.period;
      const isWeekend = newIntent.temporal.isWeekend || prev.temporal.isWeekend;

      // 3. Layer activities (combine previous activities with new ones, e.g. wakeboard + sauna)
      const combinedActivities = Array.from(
        new Set([...prev.activities, ...newIntent.activities])
      );

      // 4. Layer atmosphere
      const combinedAtmosphere = Array.from(
        new Set([...prev.atmosphere, ...newIntent.atmosphere])
      );

      // 5. Carry over accommodation requirement
      const accommodationRequired =
        newIntent.accommodation.required || prev.accommodation.required;

      session.accumulatedIntent = {
        rawQuery: `${prev.rawQuery} -> ${newQuery}`,
        location: { name: locationName, coordinates, radiusKm },
        temporal: { day, period, isWeekend },
        experience: Array.from(new Set([...prev.experience, ...newIntent.experience])),
        activities: combinedActivities,
        atmosphere: combinedAtmosphere,
        accommodation: {
          required: accommodationRequired,
          preferredType: newIntent.accommodation.preferredType || prev.accommodation.preferredType,
          verifiedOnly: true,
        },
        budget: newIntent.budget || prev.budget,
        partyType: newIntent.partyType || prev.partyType,
        priorityWeights: newIntent.priorityWeights || prev.priorityWeights,
        unknowns: newIntent.unknowns,
      };
    }

    session.lastUpdated = Date.now();
    return { mergedIntent: session.accumulatedIntent, session };
  }

  /**
   * Records completed turn results into session history
   */
  static recordTurn(
    sessionId: string,
    query: string,
    intent: SearchIntent,
    resultsCount: number,
    candidatePlaceIds: string[]
  ): void {
    const session = this.getOrCreateSession(sessionId);
    session.turns.push({
      turnIndex: session.turns.length + 1,
      userQuery: query,
      intent,
      resultsCount,
      candidatePlaceIds,
      timestamp: new Date().toISOString(),
    });
    session.lastUpdated = Date.now();
  }

  /**
   * Clears a session history
   */
  static clearSession(sessionId: string): void {
    this.sessions.delete(sessionId);
  }
}
