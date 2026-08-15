'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { HeroSearch } from '../components/HeroSearch';
import { AgentProgress, AgentStep } from '../components/AgentProgress';
import { PlaceCard } from '../components/PlaceCard';
import { PlaceDetailsModal } from '../components/PlaceDetailsModal';
import { RefinementBar } from '../components/RefinementBar';
import { AgentTraceModal, TraceData } from '../components/AgentTraceModal';
import { MOCK_PLACES, MOCK_REFINEMENT_SUGGESTIONS, MockPlace } from '../data/mockPlaces';
import { Sparkles, MapPin, Compass, Search } from 'lucide-react';
import styles from './page.module.css';

const DEFAULT_STEPS: AgentStep[] = [
  { id: 'intent', label: 'Extracting natural language intent & constraints', status: 'pending' },
  { id: 'expansion', label: 'Generating semantic search hypotheses beyond literal keywords', status: 'pending' },
  { id: 'discovery', label: 'Searching local places and deduplicating venue candidates', status: 'pending' },
  { id: 'verification', label: 'Verifying water activities & overnight cabin accommodations', status: 'pending' },
  { id: 'reviews', label: 'Synthesizing verified visitor reviews and reputation', status: 'pending' },
  { id: 'photos', label: 'Verifying authentic place photos and rejecting generic stock', status: 'pending' },
  { id: 'ranking', label: 'Computing dynamic intent match score and rationale', status: 'pending' },
];

export default function HomePage() {
  const [location, setLocation] = useState('Chișinău, Moldova');
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [steps, setSteps] = useState<AgentStep[]>(DEFAULT_STEPS);
  const [currentStepId, setCurrentStepId] = useState<string | undefined>(undefined);
  const [stepSummary, setStepSummary] = useState<string | undefined>(undefined);
  const [results, setResults] = useState<MockPlace[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<MockPlace | null>(null);
  const [activeRefinement, setActiveRefinement] = useState<string | null>(null);
  const [isTraceOpen, setIsTraceOpen] = useState(false);

  const [traceData, setTraceData] = useState<TraceData | null>(null);

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    setIsSearching(true);
    setHasSearched(false);
    setResults([]);
    setActiveRefinement(null);

    // Initialize clean steps
    const newSteps = DEFAULT_STEPS.map((s) => ({ ...s, status: 'pending' as const }));
    setSteps(newSteps);

    // Step-by-step meaningful execution progression
    setCurrentStepId('intent');
    setStepSummary('Understanding request...');

    setTimeout(() => {
      // Step 1 done, Step 2 running
      setSteps((prev) =>
        prev.map((s) =>
          s.id === 'intent'
            ? { ...s, status: 'completed', detail: 'Recognized: Sunday evening, water sports, quiet nature, countryside overnight' }
            : s.id === 'expansion'
            ? { ...s, status: 'running', detail: 'Expanding to wake park, cable wakeboarding, lake resort, eco glamping' }
            : s
        )
      );
      setCurrentStepId('expansion');
      setStepSummary('Hypotheses: wake park, lake resort, glamping');
    }, 600);

    setTimeout(() => {
      // Step 2 done, Step 3 running
      setSteps((prev) =>
        prev.map((s) =>
          s.id === 'expansion'
            ? { ...s, status: 'completed' }
            : s.id === 'discovery'
            ? { ...s, status: 'running', detail: 'Found 24 raw candidates across Chișinău & countryside → deduplicated to 11' }
            : s
        )
      );
      setCurrentStepId('discovery');
      setStepSummary('Discovered 11 candidate places');
    }, 1300);

    setTimeout(() => {
      // Step 3 done, Step 4 & 5 running
      setSteps((prev) =>
        prev.map((s) =>
          s.id === 'discovery'
            ? { ...s, status: 'completed' }
            : s.id === 'verification'
            ? { ...s, status: 'running', detail: 'Verified cable wakeboard active, verified heated wooden cabins available' }
            : s
        )
      );
      setCurrentStepId('verification');
      setStepSummary('Verifying claims & overnight access');
    }, 2000);

    setTimeout(() => {
      // Step 4 done, Step 5 & 6 running
      setSteps((prev) =>
        prev.map((s) =>
          s.id === 'verification'
            ? { ...s, status: 'completed' }
            : s.id === 'reviews'
            ? { ...s, status: 'completed', detail: 'Analyzed 1,000+ guest ratings & extracted pros/cons' }
            : s.id === 'photos'
            ? { ...s, status: 'completed', detail: 'Verified 7 authentic venue photos, rejected 12 generic stock photos' }
            : s.id === 'ranking'
            ? { ...s, status: 'running', detail: 'Calculated weighted scores: water sport (0.35) + overnight (0.30) + quiet (0.25)' }
            : s
        )
      );
      setCurrentStepId('ranking');
      setStepSummary('Finalizing ranking');
    }, 2700);

    setTimeout(() => {
      // All steps completed
      setSteps((prev) => prev.map((s) => ({ ...s, status: 'completed' })));
      setIsSearching(false);
      setHasSearched(true);
      setCurrentStepId(undefined);
      setStepSummary('Discovery complete');
      setResults(MOCK_PLACES);

      // Build trace data
      setTraceData({
        query: searchQuery,
        extractedIntent: {
          location: 'Chișinău area (+40km radius)',
          temporal: { day: 'Sunday', period: 'Evening' },
          activities: ['Wakeboarding', 'Water sports', 'Swimming'],
          atmosphere: ['Quiet', 'Nature', 'Outside city'],
          accommodation: { required: true },
        },
        hypotheses: [
          'wake park near Chisinau',
          'cable wakeboarding Moldova',
          'water sports lake resort overnight',
          'countryside recreation base with water',
          'lake glamping and kayak',
          'peaceful water lodge cabins',
          'sunset wakeboard reservoir',
        ],
        candidateCount: 24,
        deduplicatedCount: 11,
        verifiedCount: 8,
        rejectedCount: 3,
        rejectionReasons: [
          { name: 'City Aqua Center', reason: 'Located inside crowded urban center, no overnight stay' },
          { name: 'Dniester Day Beach', reason: 'Day beach only; overnight cabins closed for private event' },
          { name: 'Piscina Club X', reason: 'Nightclub party atmosphere; fails quiet requirement' },
        ],
        toolInvocations: [
          { tool: 'extract_intent_llm', durationMs: 240, status: 'success' },
          { tool: 'expand_semantic_queries', durationMs: 180, status: 'success' },
          { tool: 'search_place_candidates', durationMs: 420, status: 'success' },
          { tool: 'verify_place_activities', durationMs: 310, status: 'success' },
          { tool: 'verify_accommodation_claims', durationMs: 290, status: 'success' },
          { tool: 'synthesize_review_sentiment', durationMs: 350, status: 'success' },
          { tool: 'filter_verified_photos', durationMs: 220, status: 'success' },
          { tool: 'rank_intent_candidates', durationMs: 110, status: 'success' },
        ],
      });
    }, 3300);
  };

  const handleRefinement = (key: string, label: string) => {
    setActiveRefinement(key);
    setIsSearching(true);
    setStepSummary(`Refining: ${label}...`);

    setSteps((prev) => [
      { id: 'refine_intent', label: `Updating search strategy for: "${label}"`, status: 'running' },
      { id: 'refine_filter', label: 'Re-evaluating distance, noise levels, and amenities', status: 'pending' },
      { id: 'refine_rerank', label: 'Re-ranking candidate places by new priority weights', status: 'pending' },
    ]);

    setTimeout(() => {
      setSteps((prev) =>
        prev.map((s) =>
          s.id === 'refine_intent'
            ? { ...s, status: 'completed' }
            : s.id === 'refine_filter'
            ? { ...s, status: 'running' }
            : s
        )
      );
    }, 500);

    setTimeout(() => {
      setSteps((prev) => prev.map((s) => ({ ...s, status: 'completed' })));
      setIsSearching(false);
      const refinedList = MOCK_REFINEMENT_SUGGESTIONS[key] || MOCK_PLACES;
      setResults(refinedList);
    }, 1100);
  };

  const handleConversationalRefine = (text: string) => {
    setIsSearching(true);
    setStepSummary(`Processing: "${text}"...`);

    setSteps([
      { id: 'convo_understand', label: `Extracting conversational modification: "${text}"`, status: 'running' },
      { id: 'convo_adjust', label: 'Adjusting accommodation and ambiance constraints', status: 'pending' },
      { id: 'convo_rerank', label: 'Re-orchestrating agent discovery', status: 'pending' },
    ]);

    setTimeout(() => {
      setSteps((prev) => prev.map((s) => ({ ...s, status: 'completed' })));
      setIsSearching(false);

      if (text.toLowerCase().includes('романтич')) {
        setResults([MOCK_PLACES[2], MOCK_PLACES[0], MOCK_PLACES[1]]);
      } else if (text.toLowerCase().includes('без ноч')) {
        setResults([MOCK_PLACES[0], MOCK_PLACES[3], MOCK_PLACES[1]]);
      } else {
        setResults([MOCK_PLACES[3], MOCK_PLACES[0], MOCK_PLACES[2]]);
      }
    }, 1200);
  };

  return (
    <div className={styles.appContainer}>
      <Header
        currentLocation={location}
        onSelectLocation={setLocation}
        onOpenTrace={() => setIsTraceOpen(true)}
        hasActiveSearch={hasSearched || isSearching}
      />

      <main className={styles.mainContent}>
        {/* Search Hero Section */}
        <HeroSearch
          onSearch={handleSearch}
          isLoading={isSearching}
          initialQuery={query}
        />

        {/* Live Agent Execution Progress */}
        {isSearching && (
          <AgentProgress
            steps={steps}
            currentStepId={currentStepId}
            summaryText={stepSummary}
          />
        )}

        {/* Results Stream Section */}
        {hasSearched && !isSearching && (
          <section className={styles.resultsSection}>
            <div className={styles.resultsHeader}>
              <div>
                <h2 className={styles.resultsTitle}>
                  Top Verified Places Matching Your Experience
                </h2>
                <p className={styles.resultsSubtitle}>
                  Ranked by intent match for &quot;{query}&quot; around {location}
                </p>
              </div>

              <button
                className={styles.traceLinkBtn}
                onClick={() => setIsTraceOpen(true)}
              >
                <Sparkles size={14} color="#38bdf8" />
                <span>View Agent Discovery Trace</span>
              </button>
            </div>

            {/* Dynamic AI Refinement Bar */}
            <RefinementBar
              activeRefinement={activeRefinement}
              onSelectRefinement={handleRefinement}
              onConversationalRefine={handleConversationalRefine}
              isLoading={isSearching}
            />

            {/* Places Grid */}
            <div className={styles.placesGrid}>
              {results.map((place, idx) => (
                <PlaceCard
                  key={place.id}
                  place={place}
                  rankIndex={idx}
                  onSelect={setSelectedPlace}
                />
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Place Details Modal / Drawer */}
      <PlaceDetailsModal
        place={selectedPlace}
        onClose={() => setSelectedPlace(null)}
        userQuery={query}
      />

      {/* Agent Trace Modal */}
      <AgentTraceModal
        isOpen={isTraceOpen}
        onClose={() => setIsTraceOpen(false)}
        trace={traceData}
      />
    </div>
  );
}
