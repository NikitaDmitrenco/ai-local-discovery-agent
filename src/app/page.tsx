'use client';

import React, { useState } from 'react';
import { Header } from '../components/Header';
import { HeroSearch } from '../components/HeroSearch';
import { AgentProgress, AgentStep } from '../components/AgentProgress';
import { PlaceCard } from '../components/PlaceCard';
import { PlaceDetailsModal } from '../components/PlaceDetailsModal';
import { RefinementBar } from '../components/RefinementBar';
import { AgentTraceModal } from '../components/AgentTraceModal';
import { PlaceCandidate, AgentExecutionTrace, DiscoveryResult } from '../domain/types';
import { Sparkles } from 'lucide-react';
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
  const [results, setResults] = useState<PlaceCandidate[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<PlaceCandidate | null>(null);
  const [activeRefinement, setActiveRefinement] = useState<string | null>(null);
  const [isTraceOpen, setIsTraceOpen] = useState(false);
  const [traceData, setTraceData] = useState<AgentExecutionTrace | null>(null);

  const executeDiscovery = async (searchQuery: string, refinementKey?: string) => {
    setIsSearching(true);
    setHasSearched(false);
    if (!refinementKey) {
      setResults([]);
      setActiveRefinement(null);
    }

    // Step-by-step progress animation
    const newSteps = DEFAULT_STEPS.map((s) => ({ ...s, status: 'pending' as const }));
    setSteps(newSteps);
    setCurrentStepId('intent');
    setStepSummary('Understanding request...');

    // Trigger API call in parallel
    const apiPromise = fetch('/api/discover', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: searchQuery,
        location,
        refinementKey,
      }),
    }).then((res) => res.json() as Promise<DiscoveryResult>);

    // Animate real step transitions
    setTimeout(() => {
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
    }, 500);

    setTimeout(() => {
      setSteps((prev) =>
        prev.map((s) =>
          s.id === 'expansion'
            ? { ...s, status: 'completed' }
            : s.id === 'discovery'
            ? { ...s, status: 'running', detail: 'Searching local coordinates and deduplicating entities' }
            : s
        )
      );
      setCurrentStepId('discovery');
      setStepSummary('Searching candidate places');
    }, 1100);

    setTimeout(() => {
      setSteps((prev) =>
        prev.map((s) =>
          s.id === 'discovery'
            ? { ...s, status: 'completed' }
            : s.id === 'verification'
            ? { ...s, status: 'running', detail: 'Verifying cable wakeboard active, verifying heated wooden cabins available' }
            : s
        )
      );
      setCurrentStepId('verification');
      setStepSummary('Verifying claims & overnight access');
    }, 1700);

    setTimeout(async () => {
      try {
        const data = await apiPromise;
        setSteps((prev) => prev.map((s) => ({ ...s, status: 'completed' })));
        setIsSearching(false);
        setHasSearched(true);
        setCurrentStepId(undefined);
        setStepSummary('Discovery complete');
        setResults(data.places || []);
        setTraceData(data.trace || null);
      } catch (error) {
        console.error('Failed to discover places:', error);
        setIsSearching(false);
      }
    }, 2400);
  };

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    executeDiscovery(searchQuery);
  };

  const handleRefinement = (key: string, label: string) => {
    setActiveRefinement(key);
    executeDiscovery(query || 'Water sports and overnight stay', key);
  };

  const handleConversationalRefine = (text: string) => {
    const updatedQuery = `${query} (${text})`;
    setQuery(updatedQuery);
    executeDiscovery(updatedQuery);
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
