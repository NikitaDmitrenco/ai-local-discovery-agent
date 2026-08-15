import { SearchIntent, PlaceCandidate, RefinementOption } from '../../domain/types';

export interface RefinementResult {
  updatedIntent: SearchIntent;
  requiresReSearch: boolean;
  activeRefinementKey: string;
  explanation: string;
}

export class RefinementEngine {
  /**
   * Generates dynamic, context-aware refinement chips based on current results and intent
   */
  generateSmartChips(intent: SearchIntent, candidates: PlaceCandidate[]): RefinementOption[] {
    const chips: RefinementOption[] = [];

    // Check distances
    const maxDist = Math.max(...candidates.map((c) => c.distanceKm || 0), 0);
    if (maxDist > 25) {
      chips.push({
        id: 'closer',
        label: '📍 Ближе к Кишинёву',
        prompt: 'Сделай подборку поближе к городу (в пределах 20-25 км)',
      });
    }

    // Check activities
    const hasSauna = intent.activities.some((a) => a.includes('sauna') || a.includes('бан'));
    if (!hasSauna) {
      chips.push({
        id: 'with_sauna',
        label: '🧖 С баней / сауной',
        prompt: 'Найди места где есть баня или сауна на дровах у воды',
      });
    }

    // Quietness & atmosphere
    chips.push({
      id: 'quieter',
      label: '🤫 Максимально тихо',
      prompt: 'Покажи только самые тихие и уединенные локации без шумных компаний',
    });

    // Activities count
    chips.push({
      id: 'more_activities',
      label: '🏄 Больше активностей',
      prompt: 'Хочу место с максимумом водных развлечений: вейк, сапы, каяки',
    });

    // Budget
    chips.push({
      id: 'budget_friendly',
      label: '💳 Подешевле',
      prompt: 'Предложи более бюджетные варианты размещения и аренды',
    });

    return chips.slice(0, 4);
  }

  /**
   * Applies a refinement prompt to update SearchIntent and determines search action
   */
  applyRefinement(
    currentIntent: SearchIntent,
    refinementTextOrKey: string
  ): RefinementResult {
    const lower = refinementTextOrKey.toLowerCase();
    const updated: SearchIntent = JSON.parse(JSON.stringify(currentIntent));
    let requiresReSearch = false;
    let explanation = 'Applied search refinement.';
    let activeKey = refinementTextOrKey;

    if (lower.includes('close') || lower.includes('ближ') || lower === 'closer') {
      activeKey = 'closer';
      updated.location.radiusKm = Math.max(15, (currentIntent.location.radiusKm || 50) - 20);
      updated.priorityWeights = {
        ...updated.priorityWeights,
        distance: 0.35,
        activity: 0.25,
      };
      explanation = 'Приоритет отдан локациям ближе к городу.';
    } else if (lower.includes('quiet') || lower.includes('тиш') || lower.includes('уединен') || lower === 'quieter') {
      activeKey = 'quieter';
      updated.atmosphere.push('extra quiet', 'secluded');
      updated.priorityWeights = {
        ...updated.priorityWeights,
        atmosphere: 0.45,
        activity: 0.25,
      };
      explanation = 'Выбраны самые спокойные и уединенные места с высоким рейтингом тишины.';
    } else if (lower.includes('sauna') || lower.includes('бан') || lower.includes('with_sauna')) {
      activeKey = 'with_sauna';
      if (!updated.activities.includes('wood-fired sauna')) {
        updated.activities.push('wood-fired sauna');
      }
      updated.priorityWeights = {
        ...updated.priorityWeights,
        activity: 0.4,
      };
      requiresReSearch = true;
      explanation = 'Добавлен фильтр наличия сауны и бани у воды.';
    } else if (lower.includes('activ') || lower.includes('активн') || lower === 'more_activities') {
      activeKey = 'more_activities';
      updated.activities.push('kayaking', 'paddleboarding', 'catamaran');
      updated.priorityWeights = {
        ...updated.priorityWeights,
        activity: 0.5,
      };
      explanation = 'Отфильтрованы локации с максимальным количеством водных видов спорта.';
    } else if (lower.includes('cheap') || lower.includes('дешев') || lower.includes('бюджет') || lower === 'budget_friendly') {
      activeKey = 'budget_friendly';
      updated.budget = 'budget';
      explanation = 'Приоритет отдан более доступным вариантам аренды и проживания.';
    } else {
      // General natural language modifier
      activeKey = 'custom';
      updated.rawQuery = `${currentIntent.rawQuery} (Уточнение: ${refinementTextOrKey})`;
      requiresReSearch = true;
      explanation = `Учтено пожелание: "${refinementTextOrKey}".`;
    }

    return {
      updatedIntent: updated,
      requiresReSearch,
      activeRefinementKey: activeKey,
      explanation,
    };
  }
}
