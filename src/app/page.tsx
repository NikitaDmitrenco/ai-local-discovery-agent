'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { HeroSearch } from '../components/HeroSearch';
import { AgentProgress, AgentStep } from '../components/AgentProgress';
import { PlaceCard } from '../components/PlaceCard';
import { PlaceDetailsModal } from '../components/PlaceDetailsModal';
import { RefinementBar } from '../components/RefinementBar';
import { AgentTraceModal } from '../components/AgentTraceModal';
import { InteractiveMap } from '../components/InteractiveMap';
import { ItineraryModal } from '../components/ItineraryModal';
import { PlaceCandidate, AgentExecutionTrace, DiscoveryResult } from '../domain/types';
import { Sparkles, RotateCcw, LayoutGrid, Map as MapIcon, Bookmark } from 'lucide-react';
import styles from './page.module.css';

const DEFAULT_STEPS: AgentStep[] = [
  { id: 'intent', label: 'Extracting natural language intent & constraints', status: 'pending' },
  { id: 'expansion', label: 'Generating semantic search hypotheses beyond literal keywords', status: 'pending' },
  { id: 'discovery', label: 'Searching local places and deduplicating venue candidates', status: 'pending' },
  { id: 'verification', label: 'Verifying water activities & overnight cabin accommodations', status: 'pending' },
  { id: 'reviews', label: 'Synthesizing verified visitor reviews and reputation', status: 'pending' },
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
  const [sessionId, setSessionId] = useState<string>('');
  const [turnCount, setTurnCount] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [savedPlaces, setSavedPlaces] = useState<PlaceCandidate[]>([]);
  const [isItineraryOpen, setIsItineraryOpen] = useState(false);

  // Initialize unique session ID & restore saved places
  useEffect(() => {
    const newSessionId = `session-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    setSessionId(newSessionId);

    try {
      const saved = localStorage.getItem('local_agent_saved_places');
      if (saved) {
        setSavedPlaces(JSON.parse(saved));
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  // Save to localStorage when savedPlaces changes
  useEffect(() => {
    try {
      localStorage.setItem('local_agent_saved_places', JSON.stringify(savedPlaces));
    } catch {
      // Ignore localStorage errors
    }
  }, [savedPlaces]);

  // Global keyboard shortcuts (Escape to close open modals)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedPlace) setSelectedPlace(null);
        if (isTraceOpen) setIsTraceOpen(false);
        if (isItineraryOpen) setIsItineraryOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedPlace, isTraceOpen, isItineraryOpen]);

  const handleToggleSave = (place: PlaceCandidate) => {
    setSavedPlaces((prev) => {
      const exists = prev.some((p) => p.id === place.id);
      if (exists) {
        return prev.filter((p) => p.id !== place.id);
      } else {
        return [...prev, place];
      }
    });
  };

  const handleRemoveSavedPlace = (placeId: string) => {
    setSavedPlaces((prev) => prev.filter((p) => p.id !== placeId));
  };

  const executeDiscovery = async (searchQuery: string, refinementKey?: string) => {
    setIsSearching(true);
    setHasSearched(false);
    if (!refinementKey) {
      setResults([]);
      setActiveRefinement(null);
    }

    const newSteps = DEFAULT_STEPS.map((s) => ({ ...s, status: 'pending' as const }));
    setSteps(newSteps);
    setCurrentStepId('intent');
    setStepSummary('Understanding request...');

    try {
      // Attempt Server-Sent Events (SSE) streaming request
      const response = await fetch('/api/discover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: searchQuery,
          locationName: location,
          refinementKey,
          sessionId,
          stream: true,
        }),
      });

      if (response.headers.get('content-type')?.includes('text/event-stream') && response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (!line.trim()) continue;
            const eventMatch = line.match(/^event:\s*(\w+)/m);
            const dataMatch = line.match(/^data:\s*(.+)$/m);

            if (eventMatch && dataMatch) {
              const eventType = eventMatch[1];
              try {
                const eventData = JSON.parse(dataMatch[1]);

                if (eventType === 'step') {
                  const { id, status, detail, summary } = eventData;
                  setCurrentStepId(id);
                  if (summary) setStepSummary(summary);
                  setSteps((prev) =>
                    prev.map((s) =>
                      s.id === id
                        ? { ...s, status, detail: detail || s.detail }
                        : s
                    )
                  );
                } else if (eventType === 'result') {
                  const resultData = eventData as DiscoveryResult;
                  setResults(resultData.places || []);
                  setTraceData(resultData.trace || null);
                } else if (eventType === 'done') {
                  setSteps((prev) => prev.map((s) => ({ ...s, status: 'completed' })));
                  setIsSearching(false);
                  setHasSearched(true);
                  setCurrentStepId(undefined);
                  setStepSummary('Discovery complete');
                  setTurnCount((prev) => prev + 1);
                }
              } catch (parseErr) {
                console.error('Error parsing SSE event data:', parseErr);
              }
            }
          }
        }
      } else {
        // Fallback to standard JSON response
        const data: DiscoveryResult = await response.json();
        setSteps((prev) => prev.map((s) => ({ ...s, status: 'completed' })));
        setIsSearching(false);
        setHasSearched(true);
        setCurrentStepId(undefined);
        setStepSummary('Discovery complete');
        setResults(data.places || []);
        setTraceData(data.trace || null);
        setTurnCount((prev) => prev + 1);
      }
    } catch (error) {
      console.error('Failed to discover places:', error);
      setIsSearching(false);
    }
  };

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    executeDiscovery(searchQuery);
  };

  const handleRefinement = (key: string) => {
    setActiveRefinement(key);
    executeDiscovery(query || 'Water sports and overnight stay', key);
  };

  const handleConversationalRefine = (text: string) => {
    const updatedQuery = `${query} (${text})`;
    setQuery(updatedQuery);
    executeDiscovery(updatedQuery);
  };

  const handleResetConversation = () => {
    const newSessionId = `session-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    setSessionId(newSessionId);
    setQuery('');
    setResults([]);
    setHasSearched(false);
    setTurnCount(0);
    setActiveRefinement(null);
  };

  return (
    <div className={styles.appContainer}>
      <Header
        currentLocation={location}
        onSelectLocation={setLocation}
        onOpenTrace={() => setIsTraceOpen(true)}
        hasActiveSearch={hasSearched || isSearching}
        savedCount={savedPlaces.length}
        onOpenItinerary={() => setIsItineraryOpen(true)}
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <h2 className={styles.resultsTitle}>
                    Top Verified Places Matching Your Experience
                  </h2>
                  {turnCount > 1 && (
                    <span style={{ fontSize: '0.75rem', background: '#1e293b', border: '1px solid #334155', padding: '0.15rem 0.5rem', borderRadius: '1rem', color: '#94a3b8' }}>
                      Turn {turnCount}
                    </span>
                  )}
                </div>
                <p className={styles.resultsSubtitle}>
                  Ranked by intent match for &quot;{query}&quot; around {location}
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                {/* View Mode Toggle (Grid / Map) */}
                <div className={styles.viewToggleGroup}>
                  <button
                    className={`${styles.viewToggleBtn} ${viewMode === 'grid' ? styles.activeViewBtn : ''}`}
                    onClick={() => setViewMode('grid')}
                    title="Card Grid View"
                  >
                    <LayoutGrid size={14} />
                    <span>Grid</span>
                  </button>
                  <button
                    className={`${styles.viewToggleBtn} ${viewMode === 'map' ? styles.activeViewBtn : ''}`}
                    onClick={() => setViewMode('map')}
                    title="Interactive Map View"
                  >
                    <MapIcon size={14} />
                    <span>Map View</span>
                  </button>
                </div>

                {turnCount > 1 && (
                  <button
                    className={styles.traceLinkBtn}
                    onClick={handleResetConversation}
                    title="Start fresh search session"
                  >
                    <RotateCcw size={14} color="#94a3b8" />
                    <span>Reset Context</span>
                  </button>
                )}

                <button
                  className={styles.traceLinkBtn}
                  onClick={() => setIsTraceOpen(true)}
                >
                  <Sparkles size={14} color="#38bdf8" />
                  <span>View Agent Trace</span>
                </button>
              </div>
            </div>

            {/* Dynamic AI Refinement Bar */}
            <RefinementBar
              activeRefinement={activeRefinement}
              onSelectRefinement={handleRefinement}
              onConversationalRefine={handleConversationalRefine}
              isLoading={isSearching}
            />

            {/* Interactive Map View */}
            {viewMode === 'map' && (
              <InteractiveMap
                places={results}
                userLocationName={location}
                selectedPlaceId={selectedPlace?.id}
                onSelectPlace={setSelectedPlace}
              />
            )}

            {/* Places Grid */}
            <div className={styles.placesGrid}>
              {results.map((place, idx) => (
                <PlaceCard
                  key={place.id}
                  place={place}
                  rankIndex={idx}
                  onSelect={setSelectedPlace}
                  isSaved={savedPlaces.some((p) => p.id === place.id)}
                  onToggleSave={handleToggleSave}
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
        isSaved={selectedPlace ? savedPlaces.some((p) => p.id === selectedPlace.id) : false}
        onToggleSave={handleToggleSave}
      />

      {/* Agent Trace Modal */}
      <AgentTraceModal
        isOpen={isTraceOpen}
        onClose={() => setIsTraceOpen(false)}
        trace={traceData}
      />

      {/* Custom Trip Itinerary Modal */}
      <ItineraryModal
        isOpen={isItineraryOpen}
        onClose={() => setIsItineraryOpen(false)}
        savedPlaces={savedPlaces}
        onRemovePlace={handleRemoveSavedPlace}
        userLocation={location}
        onSelectPlace={setSelectedPlace}
      />
    </div>
  );
}
