# PROJECT CONTEXT

## Product Vision

An AI-native local discovery agent where users describe their desired experience in natural human language without knowing place names, categories, or keywords. The AI extracts structured intent, semantically expands search hypotheses, searches for real places, rigorously verifies claims, analyzes authentic reviews and place-specific photos, ranks candidates by true intent match, and presents recommendations through an intuitive, aesthetic consumer web app.

## Product Principles

1. **Experience Over Category**: Users describe what they want to feel, do, and experience; the agent bridges human desires to business real-world offerings.
2. **Authenticity & Data Integrity**: Never fabricate places, ratings, review quotes, opening hours, or photos. If data is unknown or unverifiable, explicitly state it.
3. **Photo Trust Rule**: Prefer "No verified photo" over showing a photo of a wrong/generic place or stock image. Photo relevance is a data-trust problem.
4. **Active Multi-Step Reasoning**: Discovery is an iterative agent loop (intent -> hypothesis expansion -> search -> evaluate -> verify -> rank), not a single-shot prompt.
5. **Dynamic Refinement**: User refinements (e.g., "Ближе", "Тише", "Подешевле") update the underlying agent search strategy and re-verify candidates, rather than simply filtering a static client-side list.

## UX Decisions

- **Hero Natural Language Input**: Prominent, welcoming, intuitive input box with rich placeholder and example suggestions.
- **Transparent Execution Trace**: High-level visual step progression ("Understanding request", "Expanding search ideas", "Verifying accommodation") without leaking raw chain-of-thought tokens.
- **Consumer Luxury Aesthetic**: Slate/neutral dark-and-light luxury palette, crisp typography, large media cards, contextual badge tags, no dashboard clichés.
- **First-Class Geolocation**: Auto-detect with graceful manual fallback; clear indicator (e.g. 📍 Chișinău).

## Architecture Decisions

- **Modular Layer Separation**:
  - UI (Components, State, Responsive views)
  - Application Layer (Use cases, session orchestration)
  - Agent Layer (Intent parser, Query expansion, Orchestrator loop, Verification engine, Ranker)
  - Tool Layer (Search tool, Details tool, Reviews tool, Photo tool)
  - Provider Abstraction Layer (`PlaceSearchProvider`, `LLMProvider`, `GeocodingProvider`)
  - External Implementations (Google Places/Serper/Overpass/Gemini/OpenAI/Mock)
- **High-Fidelity Mock Mode**: Ensures the app is 100% testable, demoable, and resilient even when external API credits or credentials are restricted.

## Provider Decisions

- Pluggable `LLMProvider` interface (Gemini / OpenAI / Groq / Mock).
- Pluggable `PlaceSearchProvider` interface (Google Places API / Serper Places / Geoapify / High-Fidelity Mock).
- Separation of raw provider responses from normalized internal `PlaceCandidate` domain models.

## Important Constraints

- No native mobile app code in initial web repo — responsive web-first ready for PWA.
- Never commit secrets or API keys.
- Strictly sequential milestone execution (M0 through M17).

## Things We Explicitly Do NOT Do

- No fake animations simulating agent actions; states reflect real async tasks.
- No generic wakeboarding stock photos shown for a specific local wake park.
- No client-side decorative rating fabrication.
- No corporate dashboard aesthetic (no purple on dark, no glowing borders, no icon-stuffed bento boxes).

## Known Tradeoffs

- Multi-step verification takes slightly more processing time than single-shot search; mitigated with progressive UI feedback and parallelized tool evaluation.

## Important Bugs / Edge Cases

- Geolocation permission denied by browser -> graceful fallback to default city selector with manual override.
- Places with zero verified photos -> render elegant placeholder card with category icon instead of random photo.
- Ambiguous query -> expand broader semantic hypotheses while requesting optional contextual refinement.

## Photo Search Rules

1. Place listing official photos (priority 1).
2. User-submitted photos with direct place metadata match (priority 2).
3. Verified context matching (priority 3).
4. Reject stock photos or photos from different geographic entities.

## Agent Behavior Rules

- Guard against infinite loops with step limits (max 5 tool iterations per user turn).
- Deduplicate candidates across queries by normalized name and coordinate proximity.
- Respect explicit user constraints as hard bounds and implicit preferences as ranking multipliers.

## Naming Conventions

- TypeScript types: PascalCase (`PlaceCandidate`, `SearchIntent`, `VerificationClaim`)
- Components: PascalCase (`HeroSearch`, `PlaceCard`, `RefinementChips`, `AgentTrace`)
- Modules / utils: kebab-case (`place-provider.ts`, `intent-parser.ts`, `photo-verifier.ts`)
- CSS Modules: `[name].module.css`

## Future Ideas

- PWA manifest and offline caching of saved places.
- Multi-day trip itinerary planning mode.
- Direct booking / reservation deep links.
