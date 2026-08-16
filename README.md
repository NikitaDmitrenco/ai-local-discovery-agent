# Aura — Autonomous AI Local Discovery Agent

<p align="center">
  <a href="https://aura-three-weld.vercel.app/"><img src="https://img.shields.io/badge/Live_Demo-aura--three--weld.vercel.app-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Live Demo" /></a>
  <img src="https://img.shields.io/badge/Next.js-14_App_Router-black?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js 14" />
  <img src="https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/E2E_Tests-15%2F15_Passing_(100%25)-059669?style=for-the-badge&logo=vitest&logoColor=white" alt="E2E Tests" />
  <img src="https://img.shields.io/badge/AI_Trust-Zero_Hallucination-10B981?style=for-the-badge" alt="AI Trust" />
</p>

> **"Tell me what kind of experience you want. I'll find, verify, and map the real places that can deliver that exact experience."**

---

## 🌐 Live Application & Deployment

* **Live Demo:** [https://aura-three-weld.vercel.app/](https://aura-three-weld.vercel.app/)
* **Source Repository:** [https://github.com/NikitaDmitrenco/aura](https://github.com/NikitaDmitrenco/aura)
* **Author Portfolio:** [Nikita Dmitrenco (GitHub Profile)](https://github.com/NikitaDmitrenco)

---

## 🛑 The Problem Traditional Search Cannot Solve

Finding the right local venue or weekend getaway is broken:

1. **Keyword Tyranny**: Searching *"I want a peaceful Sunday evening by the water where we can do wakeboarding and sleep in heated cabins outside the city"* in Google Maps or Yelp yields **0 relevant results**. Traditional platforms force you into rigid business categories (*"hotel"* OR *"sports club"*).
2. **Tab Overload**: Planning a simple weekend requires opening 15+ browser tabs — cross-referencing Instagram for real photos, Booking.com for cabins, Facebook for actual opening hours, and TripAdvisor for reviews.
3. **Hallucinations & False Claims**: Traditional search engines and generic AI chatbots often invent places, hallucinate activities that are closed for the season, or confuse day-use picnic spots with overnight lodging.

---

## ⚡ The Solution: How Aura Works

**Aura** is an autonomous, multi-step AI discovery agent built from the ground up for **experiential, vibe-first discovery** with rigorous zero-fabrication verification:

```text
User Natural Language / Voice Prompt
              │
              ▼
   ┌────────────────────────────────────────────────────────┐
   │ 1. Structured Intent Extraction (LLM / Dual Engine)    │
   │    • Temporal, Activity, Lodging, Atmosphere, Weights  │
   └──────────────────────────┬─────────────────────────────┘
                              ▼
   ┌────────────────────────────────────────────────────────┐
   │ 2. Semantic Query Expansion (Multi-Hypothesis)         │
   │    • Wake park, cable park, glamping, lakeside domes   │
   └──────────────────────────┬─────────────────────────────┘
                              ▼
   ┌────────────────────────────────────────────────────────┐
   │ 3. Multi-Source Discovery & Deduplication              │
   │    • OpenStreetMap Overpass + Serper + Verified DB     │
   │    • Haversine geo distance & boundary clustering      │
   └──────────────────────────┬─────────────────────────────┘
                              ▼
   ┌────────────────────────────────────────────────────────┐
   │ 4. 6-Dimensional Grounding Claim Verification          │
   │    • Identity, Location, Activity, Lodging, Schedule   │
   └──────────────────────────┬─────────────────────────────┘
                              ▼
   ┌────────────────────────────────────────────────────────┐
   │ 5. Review Synthesis & Photo Authenticity Validation    │
   │    • Highlights, caveats, confidence (Stock photos ❌) │
   └──────────────────────────┬─────────────────────────────┘
                              ▼
   ┌────────────────────────────────────────────────────────┐
   │ 6. Real-Time Streaming & Interactive Geospatial UI     │
   │    • Server-Sent Events (SSE) + Leaflet Dark Theme Map │
   │    • Custom Weekend Timeline Itinerary Planner         │
   └────────────────────────────────────────────────────────┘
```

---

## ✨ Key Features & Capabilities

### 🧠 1. Multi-Step Autonomous Agent Loop
Instead of a single black-box LLM call, Aura executes an inspectable agent loop coordinating typed tools: Geocoding, Intent Extraction, Semantic Query Expansion, Geospatial Discovery, Claim Verification, Reputation Synthesis, Photo Validation, and Dynamic Ranking.

### 🛰️ 2. Real-Time Server-Sent Events (SSE) Streaming
Watch the agent think in real time. Backend execution progress is piped to the client via `ReadableStream` SSE events (`event: step`, `event: result`, `event: done`), illuminating each pipeline phase without artificial timers.

### 🗺️ 3. Interactive Geospatial Map with Match Scores
Switch effortlessly between **Grid View** and **Map View**:
- Custom Leaflet interactive map powered by CartoDB dark tiles.
- Custom HTML pins with dynamic AI Match percentages (e.g. `97%`), pulsing beacons, and distance indicators.
- Rich popup previews with photo, category, drive time, and quick details navigation.

### 📅 4. Weekend Trip Itinerary Planner
- Click **"Save to Trip"** on any venue card to build a personalized excursion.
- Synthesizes chronological weekend schedules (14:30 Afternoon Activity $\rightarrow$ 19:30 Sunset Dinner $\rightarrow$ Overnight Cabin Stay).
- Calculates cumulative distance and total driving time.
- One-click formatted export to clipboard for sharing with friends.

### 🎙️ 5. Web Speech API Voice Search
Speak your request naturally. Integrated speech recognition (`ru-RU` / `en-US`) with pulsing audio border animations transcribes your spoken intent directly into the search engine.

### 💬 6. Conversational Memory & AI Refinement Chips
- Preserves context across multiple search turns (e.g., *"Make it closer to the city"* or *"Find something quieter"*).
- Dynamic contextual suggestion chips generate real-time refinement shortcuts.

---

## 🏛️ System Architecture

```text
src/
├── app/
│   ├── layout.tsx                # App root layout, fonts, SEO metadata
│   ├── page.tsx                  # Primary page orchestrating state, memory & modals
│   ├── page.module.css           # Glassmorphic layout, hero, grid & map styles
│   ├── globals.css               # Design tokens, modern color palette, animations
│   └── api/
│       └── discover/
│           └── route.ts          # Server-Sent Events (SSE) streaming API endpoint
├── components/
│   ├── Header.tsx                # Brand header, location picker, trip modal launcher
│   ├── HeroSearch.tsx            # Experiential NLP search input with Web Speech API
│   ├── AgentProgress.tsx         # Live multi-step execution progress visualization
│   ├── PlaceCard.tsx             # Place candidate card with match score, photo & save
│   ├── PlaceDetailsModal.tsx     # Comprehensive modal with 6-factor verification claims
│   ├── InteractiveMap.tsx        # Dynamic Leaflet geospatial map with custom pins & popups
│   ├── ItineraryModal.tsx        # Weekend trip schedule planner & clipboard exporter
│   ├── RefinementBar.tsx         # Dynamic AI refinement chips & follow-up prompt input
│   ├── LocationModal.tsx         # Geolocation detector and city picker
│   └── AgentTraceModal.tsx       # Detailed execution trace inspector
├── domain/
│   └── types.ts                  # Typed domain models (PlaceCandidate, Intent, Claims)
├── providers/
│   ├── types.ts                  # Provider abstractions (PlaceSearch, LLM, Geocoding)
│   ├── factory.ts                # ProviderFactory singleton with zero-config fallbacks
│   ├── real/
│   │   ├── AggregatedPlaceProvider.ts    # OSM Overpass + Serper Google Places + Registry
│   │   ├── NominatimGeocodingProvider.ts # Forward & reverse geocoding
│   │   ├── GeminiLLMProvider.ts          # Google Gemini structured intent parser
│   │   └── OpenAILLMProvider.ts          # OpenAI / Groq compatible provider
│   └── mock/
│       ├── MockPlaceProvider.ts          # High-fidelity verified regional database
│       └── MockLLMProvider.ts            # High-precision deterministic intent engine
├── agent/
│   ├── intent/                   # Structured intent extraction engine
│   ├── expansion/                # Multi-hypothesis semantic query expander
│   ├── tools/                    # Typed agent tools and execution wrappers
│   ├── orchestrator/             # Autonomous agent loop with step callbacks
│   ├── verification/             # 6-Factor zero-hallucination claim verifier
│   ├── reputation/               # Grounded visitor review analyzer
│   ├── photos/                   # Authentic venue photo validation pipeline
│   ├── ranking/                  # Dynamic weighted intent-match scoring engine
│   ├── refinement/               # Contextual refinement suggestion generator
│   └── memory/                   # Multi-turn conversational memory manager
├── utils/
│   └── geo.ts                    # Haversine distance, travel times & deduplication
├── services/
│   └── discoveryService.ts       # Application service facade
└── qa/
    └── e2eTestSuite.ts           # 15-scenario automated end-to-end test battery
```

---

## 🛡️ Zero-Fabrication AI Trust Guardrails

| Principle | How Aura Enforces It |
|---|---|
| **No Fake Places** | Every candidate is linked to real geographic coordinates, physical address, and verified map listing. |
| **No Invented Reviews** | Review summaries and sentiment scores are strictly grounded in verified visitor submissions. Sparse evidence is explicitly flagged as `"Limited review evidence"`. |
| **No Stock Photo Lies** | Strict image validation ($\ge 0.75$ confidence threshold). If no authentic venue photo exists, a clean UI placeholder is shown instead of misleading stock photos. |
| **Verified Lodging Claims** | The agent will never claim a day-use park offers overnight stay without verified evidence. |

---

## 🧪 Automated Testing & QA Suite

Aura includes a comprehensive automated test battery covering **15 distinct end-to-end real-world scenarios**:

```bash
# Run the complete 15-scenario E2E battery
npx tsx src/qa/e2eTestSuite.ts
```

### Verified Scenario Battery:
| # | Scenario | Tested Agent Capabilities | Status |
|---|---|---|:---:|
| 1 | **Primary Demo Query** | Wakeboarding + sunset + quiet + overnight stay outside Chișinău | ✅ 100% Pass |
| 2 | **Activity-Only Search** | Specific activity extraction without stay requirements | ✅ 100% Pass |
| 3 | **Ambiguous Input** | *"Good vibes this weekend"* (Broad semantic expansion) | ✅ 100% Pass |
| 4 | **Distant Target Query** | Geographic radius expansion up to 100+ km | ✅ 100% Pass |
| 5 | **Tent Camping Search** | Rustic outdoor campground identification | ✅ 100% Pass |
| 6 | **Family Weekend Query** | Child-friendly safety, playgrounds & calm water | ✅ 100% Pass |
| 7 | **Romantic Couples Getaway**| High privacy, scenic views & intimate atmosphere | ✅ 100% Pass |
| 8 | **Quiet Solo Retreat** | Low noise rating, nature immersion & reading spots | ✅ 100% Pass |
| 9 | **Technical Wakeboarder** | Cable obstacle features, kickers & pro equipment | ✅ 100% Pass |
| 10 | **Glamping & Luxury Cabins**| High-end dome accommodations & heated amenities | ✅ 100% Pass |
| 11 | **Refinement: "Make it closer"** | Dynamic distance re-weighting via conversational modifier | ✅ 100% Pass |
| 12 | **Refinement: "Make it quieter"**| Atmosphere priority boosting via refinement chips | ✅ 100% Pass |
| 13 | **Multi-Turn Context Carryover** | Retaining location & budget constraints across consecutive turns | ✅ 100% Pass |
| 14 | **Stock Photo Rejection** | Discarding unverified/generic stock photos | ✅ 100% Pass |
| 15 | **Geospatial Deduplication** | Merging OSM and Google Places duplicates into single entities | ✅ 100% Pass |

---

## 🚀 Quick Start (Local Development)

### Prerequisites
* **Node.js**: 18.17+ or 20+
* **npm**: 9+

### 1. Clone & Install
```bash
git clone https://github.com/NikitaDmitrenco/aura.git
cd aura
npm install
```

### 2. Configure Environment (Optional)
Aura is built with a **Zero-Config Offline Mode** — it works out of the box with zero external API keys! If you wish to connect live cloud LLMs or Google Places:

```bash
cp .env.example .env.local
```

```env
# Cloud LLM Options (Optional - automatic high-precision fallback if omitted)
GEMINI_API_KEY=your_gemini_api_key
OPENAI_API_KEY=your_openai_api_key
GROQ_API_KEY=your_groq_api_key

# Search & Places (Optional - OSM Overpass used automatically if omitted)
SERPER_API_KEY=your_serper_api_key
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Quality Checks & Production Build
```bash
# Typecheck TypeScript
npm run typecheck

# Lint codebase
npm run lint

# Production Next.js build
npm run build
```

---

## 👨‍💻 Author & Contact

**Nikita Dmitrenco**  
*Full-Stack Software Engineer & AI Systems Builder*

* **GitHub:** [@NikitaDmitrenco](https://github.com/NikitaDmitrenco)
* **Repository:** [NikitaDmitrenco/aura](https://github.com/NikitaDmitrenco/aura)
* **Featured Projects:** [Zento (E-Commerce)](https://github.com/NikitaDmitrenco/zento) · [Aura (AI Discovery)](https://github.com/NikitaDmitrenco/aura)

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
