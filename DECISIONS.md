# Architecture and Design Decisions (ADR)

## DEC-001: Next.js 14 App Router + TypeScript + Vanilla Modern CSS Tokens
- **Context**: Consumer web app requiring high performance, SEO tags, server-side route handlers, and premium aesthetics.
- **Decision**: Next.js 14 App Router with TypeScript and scoped Vanilla CSS Modules. Avoid Tailwind to guarantee exact token control and zero utility bloat.
- **Status**: Implemented & verified.

## DEC-002: Pluggable Multi-Provider Domain Layer
- **Context**: Need to support multiple LLM models, place discovery sources, and geocoding providers with zero-config offline fallback.
- **Decision**: Defined strict TypeScript provider interfaces (`PlaceSearchProvider`, `LLMProvider`, `GeocodingProvider`) in `src/providers/types.ts` managed by `ProviderFactory`.
- **Status**: Implemented & verified.

## DEC-003: Multi-Source Aggregated Place Provider
- **Context**: Combining OpenStreetMap live Overpass data, Google Places via Serper, and high-fidelity verified databases.
- **Decision**: Implemented `AggregatedPlaceProvider` with Haversine deduplication (`arePlacesDuplicates`) to unify candidates into cohesive domain entities.
- **Status**: Implemented & verified.

## DEC-004: Dual-Engine Intent Extraction
- **Context**: Ensuring robust structured intent extraction from natural language across both online LLMs and offline environments.
- **Decision**: Implemented `IntentParser` with structured JSON schema mode for Gemini/OpenAI/Groq and deterministic rule-based semantic fallback.
- **Status**: Implemented & verified.

## DEC-005: Multi-Strategy Semantic Expansion
- **Context**: Users search with experiential language (e.g. "покататься на воде") rather than business categories ("wake park").
- **Decision**: Implemented `SemanticQueryExpander` generating activity, venue, stay, and atmosphere hypotheses.
- **Status**: Implemented & verified.

## DEC-006: Dedicated Agent Tool Abstraction with Tracing
- **Context**: Need multi-step execution visibility without leaking low-level raw prompt clutter.
- **Decision**: Created typed `AgentTool` interfaces and recorded high-level execution steps in `AgentExecutionTrace`.
- **Status**: Implemented & verified.

## DEC-007: 6-Dimensional Place Verification
- **Context**: Zero-hallucination mandate preventing false claims about activities, hours, or overnight lodging.
- **Decision**: Implemented `PlaceVerifier` evaluating Identity, Location, Activity, Accommodation, Schedule, and Atmosphere with explicit confidence scores and evidence text.
- **Status**: Implemented & verified.

## DEC-008: Evidence-Grounded Reputation Synthesis
- **Context**: Need to summarize visitor sentiment, highlights, and caveats without fabricating fake reviews.
- **Decision**: Implemented `ReputationAnalyzer` extracting positive themes, negative caveats, and volume confidence (`high`, `moderate`, `limited`).
- **Status**: Implemented & verified.

## DEC-009: Strict Venue Photo Verification Pipeline
- **Context**: Prefer "No verified photo" over showing a photo of the wrong place or generic stock photos.
- **Decision**: Implemented `PhotoVerifier` with a minimum 0.75 confidence threshold and strict generic stock rejection.
- **Status**: Implemented & verified.

## DEC-010: Dynamic Weighted Intent-Match Scoring
- **Context**: Ranking must reflect user-specific priorities rather than generic popularity.
- **Decision**: Implemented `IntentRanker` weighting factors dynamically based on user emphasis in natural language.
- **Status**: Implemented & verified.

## DEC-011: Contextual Dynamic Refinement Engine
- **Context**: Allow users to refine results naturally through one-click smart chips and conversational prompts.
- **Decision**: Implemented `RefinementEngine` generating context-aware modifier chips.
- **Status**: Implemented & verified.

## DEC-012: Multi-Turn In-Memory Conversational Memory
- **Context**: Users ask follow-up questions without repeating the entire search prompt.
- **Decision**: Implemented `ConversationMemoryManager` retaining prior search intent, location, and constraints across turns.
- **Status**: Implemented & verified.

## DEC-013: Session-Aware UI State Machine with Context Reset
- **Context**: User needs visual feedback of multi-turn conversations and the ability to start a fresh search session.
- **Decision**: Enhanced `HomePage` with session IDs, turn counters, and "Reset Context" button.
- **Status**: Implemented & verified.

## DEC-014: Timeout Safeguards on External Geospatial APIs
- **Context**: Public OpenStreetMap Overpass or Nominatim APIs can experience network latency or rate-limiting.
- **Decision**: Added `AbortSignal.timeout(1500)` to external fetch calls with seamless fallback to verified databases.
- **Status**: Implemented & verified.
