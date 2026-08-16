# System Architecture & Technical Specifications

## 1. Architectural Overview

Aura is constructed as a modern Next.js 14 (App Router) full-stack application with strict layered separation between presentation, orchestration, domain verification, and external provider adapters.

```text
[ Presentation Layer: Next.js Client Components (Vanilla CSS Tokens) ]
                               │
                               ▼ (POST /api/discover)
[ Service Layer: DiscoveryService & Session Routing ]
                               │
                               ▼
[ Agent Layer: DiscoveryAgentOrchestrator (State Machine & Tool Registry) ]
   ├── GeocodeLocationTool
   ├── IntentExtractionTool (IntentParser)
   ├── SemanticExpansionTool (SemanticQueryExpander)
   ├── SearchPlacesTool (AggregatedPlaceProvider)
   ├── SynthesizeReviewsTool (ReputationAnalyzer)
   ├── VerifyPhotosTool (PhotoVerifier)
   ├── PlaceVerifier (6-Dimensional Grounding)
   ├── IntentRanker (Dynamic Multi-Factor Ranking)
   └── ConversationMemoryManager (Multi-Turn Context)
                               │
                               ▼
[ Provider Layer: Pluggable External Adapters ]
   ├── NominatimGeocodingProvider (OpenStreetMap Nominatim)
   ├── OverpassPlaceProvider (OpenStreetMap Overpass API)
   ├── SerperPlaceProvider (Google Places API)
   ├── GeminiLLMProvider / OpenAILLMProvider
   └── Mock Provider Fallback Layer (Zero-Config Offline Support)
```

---

## 2. Core Subsystems

### 2.1 LLM Intent Engine (`src/agent/intent/intentParser.ts`)
- Accepts raw natural language input and resolves temporal attributes (`day`, `period`, `isWeekend`), activity desires, atmospheric requirements, accommodation prerequisites, dynamic importance weights, and unknown parameters.
- Features dual-mode extraction: LLM structured JSON output with automatic deterministic fallback.

### 2.2 Semantic Query Expander (`src/agent/expansion/queryExpander.ts`)
- Bridges natural language desires (e.g. *"где можно покататься на воде и поспать за городом"*) into concrete venue categories and search terms (*wake park, cable wakeboarding, lake resort, glamping safari dome, waterfront cabins*).

### 2.3 Place Verifier (`src/agent/verification/placeVerifier.ts`)
- Rigorously validates candidate places across 6 distinct dimensions:
  1. **Identity**: Valid name, coordinates, and listing existence.
  2. **Location & Distance**: Real Haversine geo calculation from user origin.
  3. **Activity Capability**: Confirms equipment and active operations.
  4. **Accommodation & Overnight**: Confirms heated cabins / lodging.
  5. **Schedule**: Confirms operational status on requested day/time.
  6. **Atmosphere**: Validates noise level and nature setting.

### 2.4 Grounded Reputation Analyzer (`src/agent/reputation/reputationAnalyzer.ts`)
- Synthesizes authentic visitor reviews to extract positive highlights, caveats/downsides, and review volume confidence without fabricating quotes.

### 2.5 Strict Photo Verifier (`src/agent/photos/photoVerifier.ts`)
- Enforces a strict minimum confidence threshold of `0.75`.
- Automatically rejects generic stock photography or mismatched imagery.

### 2.6 Dynamic Intent Ranker (`src/agent/ranking/intentRanker.ts`)
- Computes multi-factor weighted match score:
  $$\text{Score} = (S_{\text{act}} \cdot W_{\text{act}} + S_{\text{atm}} \cdot W_{\text{atm}} + S_{\text{acc}} \cdot W_{\text{acc}} + S_{\text{dist}} \cdot W_{\text{dist}} + S_{\text{rep}} \cdot W_{\text{rep}}) \times 100$$
- Generates transparent "Why AI picked this" explanations.

### 2.7 Conversational Memory Manager (`src/agent/memory/conversationMemory.ts`)
- Maintains multi-turn context across consecutive search turns, allowing users to ask follow-up questions (*"А есть среди них с сауной?"*) while retaining location, schedule, and overnight constraints.
