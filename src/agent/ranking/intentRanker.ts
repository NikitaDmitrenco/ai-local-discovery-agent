import { SearchIntent, PlaceCandidate, IntentMatchResult } from '../../domain/types';

export class IntentRanker {
  /**
   * Ranks candidates based on user intent and computes dynamic weighted scores and explanations
   */
  rankCandidates(candidates: PlaceCandidate[], intent: SearchIntent): PlaceCandidate[] {
    const weights = intent.priorityWeights || {
      activity: 0.35,
      atmosphere: 0.3,
      accommodation: 0.25,
      distance: 0.1,
      reputation: 0.05,
    };

    const totalWeight =
      weights.activity +
      weights.atmosphere +
      weights.accommodation +
      weights.distance +
      weights.reputation || 1.0;

    const wAct = weights.activity / totalWeight;
    const wAtm = weights.atmosphere / totalWeight;
    const wAcc = weights.accommodation / totalWeight;
    const wDist = weights.distance / totalWeight;
    const wRep = weights.reputation / totalWeight;

    const scoredCandidates = candidates.map((candidate) => {
      // 1. Activity Match Factor
      const actPool = (candidate.activities.join(' ') + ' ' + candidate.category + ' ' + candidate.tags.join(' ')).toLowerCase();
      let activityScore = 0.5;

      const isWaterRequested = intent.activities.some((a) => a.includes('water') || a.includes('wake') || a.includes('swim'));
      const isDiningRequested = intent.activities.some((a) => a.includes('dining') || a.includes('celebration') || a.includes('wine'));
      const isSpaRequested = intent.activities.some((a) => a.includes('spa') || a.includes('banya') || a.includes('sauna'));

      const hasWater = actPool.includes('wake') || actPool.includes('water') || actPool.includes('вейк') || actPool.includes('вод') || actPool.includes('sup');
      const hasDining = actPool.includes('dining') || actPool.includes('restaurant') || actPool.includes('steak') || actPool.includes('gourmet') || actPool.includes('wine');
      const hasSpa = actPool.includes('spa') || actPool.includes('banya') || actPool.includes('sauna') || actPool.includes('thermal');

      if (isWaterRequested) {
        activityScore = hasWater ? 0.99 : 0.35;
      } else if (isDiningRequested) {
        activityScore = hasDining ? 0.99 : 0.35;
      } else if (isSpaRequested) {
        activityScore = hasSpa ? 0.99 : 0.35;
      } else if (
        intent.activities.some((a) => actPool.includes(a.toLowerCase()))
      ) {
        activityScore = 0.98;
      }

      // 2. Atmosphere Match Factor
      const atmPool = (candidate.description + ' ' + candidate.tags.join(' ')).toLowerCase();
      let atmosphereScore = 0.6;
      if (
        intent.atmosphere.some((atm) => atmPool.includes(atm.toLowerCase())) ||
        atmPool.includes('quiet') ||
        atmPool.includes('тихо') ||
        atmPool.includes('nature')
      ) {
        atmosphereScore = 0.95;
      }

      // 3. Accommodation Match Factor
      let accommodationScore = 0.7;
      if (intent.accommodation.required) {
        accommodationScore = candidate.accommodation.available && candidate.accommodation.verified ? 0.98 : 0.2;
      } else {
        accommodationScore = 0.9;
      }

      // 4. Distance & Accessibility Match Factor (Closer = higher, but scaled smoothly)
      const distKm = candidate.distanceKm || 20;
      const distanceScore = Math.max(0.5, Math.min(1.0, 1.0 - (distKm / 100) * 0.5));

      // 5. Reputation & Confidence Score
      const repScore = Math.min(1.0, (candidate.reviewSummary.rating / 5.0) * (candidate.reviewSummary.confidence === 'high' ? 1.0 : 0.9));

      // Compute Weighted Composite Score (Scaled 0 to 100)
      const rawScore =
        activityScore * wAct +
        atmosphereScore * wAtm +
        accommodationScore * wAcc +
        distanceScore * wDist +
        repScore * wRep;

      const finalScore = Math.max(65, Math.min(99, Math.round(rawScore * 100)));

      // Generate Contextual "Why AI picked this" explanation
      const matchReasons: string[] = [];
      if (candidate.tags.length > 0) {
        matchReasons.push(candidate.tags.slice(0, 2).join(' & '));
      } else if (activityScore > 0.8) {
        matchReasons.push('verified experiential activities');
      }
      if (candidate.activities.length > 0) {
        matchReasons.push(candidate.activities[0].replace(/^[^\w\sа-яА-ЯёЁ]+/, '').trim());
      }
      if (accommodationScore > 0.8 && intent.accommodation.required) matchReasons.push('verified overnight stay');
      if (distanceScore > 0.75) matchReasons.push(`accessible drive (${candidate.travelTimeMinutes} min from city)`);

      const explanation = `Top fit for your experience: combines ${matchReasons.slice(0, 3).join(', ')} perfectly aligned with your request.`;

      // Potential downside detection
      let potentialDownside = candidate.intentMatch.potentialDownside;
      if (!potentialDownside && candidate.reviewSummary.negativeThemes.length > 0) {
        potentialDownside = candidate.reviewSummary.negativeThemes[0];
      } else if (!potentialDownside && distKm > 30) {
        potentialDownside = `Located ${distKm} km from center; allow ${candidate.travelTimeMinutes} min driving time.`;
      }

      const intentMatch: IntentMatchResult = {
        score: finalScore,
        explanation,
        potentialDownside,
        factorScores: {
          activityMatch: activityScore,
          atmosphereMatch: atmosphereScore,
          accommodationMatch: accommodationScore,
          distanceMatch: distanceScore,
          reputationScore: repScore,
        },
      };

      return {
        ...candidate,
        intentMatch,
      };
    });

    // Sort candidates descending by match score
    return scoredCandidates.sort((a, b) => b.intentMatch.score - a.intentMatch.score);
  }
}
