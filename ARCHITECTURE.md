# System Architecture - AI Local Discovery Agent

## 1. High-Level Architecture Overview

The AI Local Discovery Agent is structured as a decoupled, layered system where user intent in natural language flows through semantic expansion, agentic search and verification, reputation synthesis, and photo relevance scoring before reaching the frontend.

```
┌───────────────────────────────────────────────────────────────┐
│                    Client (Next.js React UI)                  │
│  ┌───────────────┐ ┌───────────────┐ ┌──────────────────────┐ │
│  │  Hero Search  │ │ Result Cards  │ │ Dynamic Refinements  │ │
│  └───────┬───────┘ └───────▲───────┘ └──────────┬───────────┘ │
│          │                 │                    │             │
│  ┌───────▼─────────────────┴────────────────────▼───────────┐ │
│  │            Agent Execution Trace & State Stream          │ │
│  └─────────────────────────┬────────────────────────────────┘ │
└────────────────────────────┼──────────────────────────────────┘
                             │ REST / Server Actions / SSE
┌────────────────────────────▼──────────────────────────────────┐
│                   Application / API Layer                     │
│               (/api/agent/discover, /api/places)              │
└────────────────────────────┬──────────────────────────────────┘
                             │
┌────────────────────────────▼──────────────────────────────────┐
│                     Agent Orchestrator                        │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ 1. Intent Extraction (LLM: temporal, activity, overnight)│ │
│  │ 2. Semantic Query Expansion (hypotheses generation)      │ │
│  │ 3. Candidate Search & Deduplication                      │ │
│  │ 4. Verification Loop (claims vs reality)                 │ │
│  │ 5. Review & Reputation Synthesis                         │ │
│  │ 6. Photo Relevance & Confidence Check                    │ │
│  │ 7. Weighted Intent Match Scoring & Explanation           │ │
│  │ 8. Contextual Refinement Suggestion Engine               │ │
│  └──────────────────────────┬───────────────────────────────┘ │
└─────────────────────────────┼─────────────────────────────────┘
                              │
┌─────────────────────────────▼─────────────────────────────────┐
│                   Provider Abstraction Layer                  │
│  ┌────────────────────┐ ┌───────────────────┐ ┌─────────────┐ │
│  │ PlaceSearchProvider│ │    LLMProvider    │ │GeocodingProv│ │
│  └─────────┬──────────┘ └─────────┬─────────┘ └──────┬──────┘ │
└────────────┼──────────────────────┼──────────────────┼────────┘
             ▼                      ▼                  ▼
┌───────────────────────┐ ┌───────────────────┐ ┌───────────────┐
│ Google Places / Serper│ │ Gemini / OpenAI / │ │ OpenStreetMap │
│ / Mock Discovery Engine│ │ High-Fid Mock LLM │ │ / Browser Geo │
└───────────────────────┘ └───────────────────┘ └───────────────┘
```

## 2. Key Modules & Subsystems

### 2.1 Intent Parser (`src/agent/intent/`)
Transforms freeform text into a typed `SearchIntent` object:
- Temporal constraints (day of week, time of day).
- Desired experiences and activities.
- Atmosphere (quiet, vibrant, secluded, romantic).
- Accommodation / overnight requirements (required, optional, forbidden).
- Proximity & budget boundaries.

### 2.2 Semantic Query Expander (`src/agent/expansion/`)
Generates 5-10 distinct search hypotheses spanning direct synonyms, adjacent categories, and activity venues (e.g. from "water riding and countryside sleep" -> `wake park`, `wakeboarding`, `lake resort`, `water glamping`, `countryside recreation base`).

### 2.3 Multi-Step Agent Loop (`src/agent/orchestrator/`)
Executes an iterative tool-use loop with step limits to prevent infinite cycles:
1. Search candidate places across generated hypotheses.
2. Deduplicate candidate entities by name, geo-distance, and category.
3. Verify candidate capability against specific user constraints (overnight availability, water sport infrastructure).
4. Aggregate reviews to extract authentic visitor sentiment, positive highlights, and potential caveats.
5. Score and filter place photos for verified relevance.
6. Calculate Intent Match Score and generate a personalized "Why it matches" explanation.

### 2.4 Provider Abstractions (`src/providers/`)
Clean interfaces decoupling external APIs from core application logic:
- `PlaceSearchProvider`: `searchPlaces`, `getPlaceDetails`, `getReviews`, `getPhotos`
- `LLMProvider`: `generateText`, `generateStructured<T>`
- `GeocodingProvider`: `reverseGeocode`, `forwardGeocode`

### 2.5 Presentation Layer (`src/components/`)
- Responsive consumer UI with mobile-first touch optimization.
- Live progress indicator reflecting real agent lifecycle stages.
- Rich Result Cards and Deep Place Detail views.
- Dynamic refinement pill bar updating agent search parameters.

## 3. Data Integrity & Verification Standards
- Zero hallucination policy: Missing or unverified claims explicitly flagged as `unverified` or `limited evidence`.
- Strict photo relevance pipeline: Discards generic stock or location-mismatched imagery.
