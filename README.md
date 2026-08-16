# Aura — AI Local Discovery Agent

> High-quality, AI-native consumer web application for natural-language local experience discovery.

[![Next.js 14](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue)](https://www.typescriptlang.org/)
[![Tests](https://img.shields.io/badge/E2E_Tests-15%2F15_Passing-success)](https://github.com/NikitaDmitrenco/aura)
[![Zero Fabrication](https://img.shields.io/badge/AI_Trust-Zero_Hallucination-emerald)](https://github.com/NikitaDmitrenco/aura)

---

## 🌟 What is Aura?

Finding the right local venue traditionally requires knowing business categories, exact keywords, opening hours, and cross-referencing multiple platforms for reviews, activities, and overnight accommodation.

**Aura** allows users to describe what they want in natural human language:

> *"Хочу вечерком воскресным отдохнуть в каком-нибудь тихом местечке где можно покататься на воде и поспать за городом"*

The agent autonomously:
1. **Parses complex intent**: Sunday evening, outside city, water recreation, quiet atmosphere, overnight stay required.
2. **Expands semantic search space**: Discovers wake parks, cable wakeboarding, lake recreation bases, glamping safari domes, and lakeside cabins without needing exact keywords.
3. **Discovers real places**: Aggregates live OpenStreetMap Overpass queries, Google Places (Serper), Nominatim geocoding, and verified venue databases.
4. **Verifies claims**: Rigorously verifies water activity infrastructure, overnight cabin availability, and opening schedule.
5. **Analyzes reputation**: Synthesizes verified visitor reviews, positive highlights, and potential downsides.
6. **Validates photos**: Rejects generic stock photos; only displays verified venue photos.
7. **Ranks by intent match**: Computes dynamic weighted match scores with transparent "Why AI picked this" explanations.
8. **Supports multi-turn refinement**: Contextual smart chips and free-form follow-ups with persistent conversational memory.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18.17+ or 20+
- npm 9+

### Installation
```bash
git clone https://github.com/NikitaDmitrenco/aura.git
cd aura
npm install
```

### Environment Configuration (Optional)
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

| Variable | Description | Default / Fallback |
|---|---|---|
| `GEMINI_API_KEY` | Google Gemini API key for structured intent parsing | High-precision deterministic fallback |
| `OPENAI_API_KEY` | OpenAI API key (optional alternative) | High-precision deterministic fallback |
| `SERPER_API_KEY` | Serper Google Places API key (optional) | Live OpenStreetMap Overpass + High-fidelity verified registry |

*Note: The application includes full zero-config offline capability. It runs out of the box with 0 external API keys required!*

### Running Locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Running the Test Battery

### Full 15-Scenario End-to-End Battery
```bash
npx tsx src/qa/e2eTestSuite.ts
```

### Individual Engine Tests
```bash
# Test 1: LLM Structured Intent Parser
npx tsx src/agent/intent/intentParser.test.ts

# Test 2: Semantic Query Expander
npx tsx src/agent/expansion/queryExpander.test.ts

# Test 3: Multi-Step Agent Orchestrator Loop
npx tsx src/agent/orchestrator/agentOrchestrator.test.ts

# Test 4: Multi-Factor Place Verifier
npx tsx src/agent/verification/placeVerifier.test.ts

# Test 5: Grounded Reputation Analyzer
npx tsx src/agent/reputation/reputationAnalyzer.test.ts

# Test 6: Authentic Photo Verifier
npx tsx src/agent/photos/photoVerifier.test.ts

# Test 7: Dynamic Intent Ranker
npx tsx src/agent/ranking/intentRanker.test.ts

# Test 8: Contextual Refinement Engine
npx tsx src/agent/refinement/refinementEngine.test.ts

# Test 9: Conversational Multi-Turn Memory
npx tsx src/agent/memory/conversationMemory.test.ts
```

### Build & Typecheck
```bash
npm run build
npm run typecheck
npm run lint
```

---

## 🏛️ System Architecture

```text
User Natural Language Input
            │
            ▼
   ┌───────────────────┐
   │ Next.js App Router│ (Client UI: Hero, Stream, Modal, Refinement)
   └─────────┬─────────┘
             │ POST /api/discover
             ▼
   ┌────────────────────────────────────────────────────────┐
   │             DiscoveryService Layer                     │
   └─────────────────────────┬──────────────────────────────┘
                             │
                             ▼
   ┌────────────────────────────────────────────────────────┐
   │          DiscoveryAgentOrchestrator                    │
   │  ┌──────────────────────────────────────────────────┐  │
   │  │ 1. GeocodeLocationTool (Nominatim / Mock)        │  │
   │  │ 2. IntentExtractionTool (Gemini / OpenAI / Fall) │  │
   │  │ 3. SemanticExpansionTool (Taxonomy / Hypotheses) │  │
   │  │ 4. SearchPlacesTool (OSM Overpass / Serper / Reg)│  │
   │  │ 5. SynthesizeReviewsTool (Reputation Analyzer)   │  │
   │  │ 6. VerifyPhotosTool (Photo Verifier)             │  │
   │  │ 7. PlaceVerifier (6-Factor Grounding Claims)     │  │
   │  │ 8. IntentRanker (Dynamic Weighted Ranking)       │  │
   │  │ 9. ConversationMemoryManager (Multi-Turn State)  │  │
   │  └──────────────────────────────────────────────────┘  │
   └─────────────────────────┬──────────────────────────────┘
                             │
                             ▼
   ┌────────────────────────────────────────────────────────┐
   │           Pluggable Provider Abstraction               │
   │  • AggregatedPlaceProvider (OSM Overpass + Serper)     │
   │  • NominatimGeocodingProvider (Forward & Reverse)      │
   │  • Gemini / OpenAI / Groq LLM Adapters                 │
   └────────────────────────────────────────────────────────┘
```

---

## 🛡️ Zero-Fabrication AI Trust Rules

1. **No Fake Places**: Every candidate is linked to real coordinates, physical address, and verified map listing.
2. **No Invented Reviews**: Ratings and review summaries are grounded in actual visitor submissions. Sparse evidence is explicitly flagged as `"Limited review evidence"`.
3. **No Stock Photo Misrepresentation**: Photos must match the actual venue. If no authentic photo exists, the UI displays a clean placeholder instead of a misleading generic stock image.
4. **Verified Overnight Claims**: The agent will never claim a day beach offers overnight accommodation without explicit proof.

---

## 📄 License
MIT © 2026 Nikita Dmitrenco
