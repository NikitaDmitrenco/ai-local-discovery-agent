# Project Context & Developer Reference

## 1. Quick Repository Map

```text
c:\Users\dmitr\Desktop\AI_Agent\
├── src/
│   ├── app/
│   │   ├── layout.tsx                # App root layout, fonts, metadata
│   │   ├── page.tsx                  # Primary page orchestrating state, memory & modals
│   │   ├── page.module.css           # Grid, layout, hero, and container styles
│   │   ├── globals.css               # Design tokens, color palette, animations
│   │   └── api/
│   │       └── discover/
│   │           └── route.ts          # POST endpoint accepting query, location, sessionId
│   ├── components/
│   │   ├── Header.tsx                # App header, location selector, trace launcher
│   │   ├── HeroSearch.tsx            # Experiential natural language search input
│   │   ├── AgentProgress.tsx         # Live multi-step execution visualization
│   │   ├── PlaceCard.tsx             # Place candidate card with match score & photo
│   │   ├── PlaceDetailsModal.tsx     # Comprehensive place modal with verification claims
│   │   ├── RefinementBar.tsx         # Dynamic AI refinement chips & follow-up input
│   │   ├── LocationModal.tsx         # Geolocation detector and city picker
│   │   └── AgentTraceModal.tsx       # Detailed execution trace viewer
│   ├── domain/
│   │   └── types.ts                  # Typed domain models
│   ├── providers/
│   │   ├── types.ts                  # Provider interfaces
│   │   ├── factory.ts                # ProviderFactory singleton
│   │   ├── real/
│   │   │   ├── AggregatedPlaceProvider.ts
│   │   │   ├── NominatimGeocodingProvider.ts
│   │   │   ├── OverpassPlaceProvider.ts
│   │   │   ├── SerperPlaceProvider.ts
│   │   │   ├── GeminiLLMProvider.ts
│   │   │   └── OpenAILLMProvider.ts
│   │   └── mock/
│   │       ├── MockPlaceProvider.ts
│   │       ├── MockGeocodingProvider.ts
│   │       └── MockLLMProvider.ts
│   ├── agent/
│   │   ├── intent/
│   │   │   ├── intentParser.ts
│   │   │   └── intentParser.test.ts
│   │   ├── expansion/
│   │   │   ├── queryExpander.ts
│   │   │   └── queryExpander.test.ts
│   │   ├── tools/
│   │   │   ├── agentTool.ts
│   │   │   └── discoveryTools.ts
│   │   ├── orchestrator/
│   │   │   ├── agentOrchestrator.ts
│   │   │   └── agentOrchestrator.test.ts
│   │   ├── verification/
│   │   │   ├── placeVerifier.ts
│   │   │   └── placeVerifier.test.ts
│   │   ├── reputation/
│   │   │   ├── reputationAnalyzer.ts
│   │   │   └── reputationAnalyzer.test.ts
│   │   ├── photos/
│   │   │   ├── photoVerifier.ts
│   │   │   └── photoVerifier.test.ts
│   │   ├── ranking/
│   │   │   ├── intentRanker.ts
│   │   │   └── intentRanker.test.ts
│   │   ├── refinement/
│   │   │   ├── refinementEngine.ts
│   │   │   └── refinementEngine.test.ts
│   │   └── memory/
│   │       ├── conversationMemory.ts
│   │       └── conversationMemory.test.ts
│   ├── utils/
│   │   └── geo.ts                    # Haversine distance, driving time, deduplication
│   ├── services/
│   │   └── discoveryService.ts       # Application service facade
│   └── qa/
│       └── e2eTestSuite.ts           # 15-scenario end-to-end test battery
├── MASTER_PROMPT.md
├── PROJECT_STATUS.md
├── ARCHITECTURE.md
├── DECISIONS.md
├── README.md
├── .env.example
├── package.json
└── tsconfig.json
```

## 2. Key Commands Reference

```bash
# Run local dev server
npm run dev

# Run full 15-scenario test battery
npx tsx src/qa/e2eTestSuite.ts

# Production build, typecheck, and lint
npm run build
npm run typecheck
npm run lint
```
