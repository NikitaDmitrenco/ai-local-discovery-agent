# AI Local Discovery Agent

> "Tell me what kind of experience you want. I'll find the places that can give you that experience."

An intelligent AI-native local discovery web application that translates natural-language desires into verified real-world places without requiring users to guess categories, business keywords, or filter combinations.

---

## Key Features

- 🧠 **Natural Language Intent Extraction**: Understands implicit preferences (quietness, Sunday evening, water sports, countryside overnight).
- 🔍 **Semantic Query Expansion**: Generates diverse search hypotheses (discovering wake parks, lake glamping, recreation bases from experiential phrases).
- 🤖 **Multi-Step Agent Loop**: Iteratively searches, deduplicates, verifies claims, inspects authentic reviews, and scores photo relevance.
- 📸 **Strict Place Photo Verification**: Prioritizes authentic venue imagery, rejecting generic stock photos.
- 📊 **Dynamic Intent Match Scoring**: Computes match percentages weighted by individual user priorities and explains why each place fits.
- ⚡ **Contextual AI Refinement**: Dynamic chips ("Ближе", "Тише", "Подешевле") that dynamically re-orchestrate search strategies.
- 📱 **Responsive Consumer Design**: Refined typography, luxury surfaces, mobile-first touch ergonomics.

---

## Tech Stack

- **Framework**: Next.js 14+ (App Router, React 19/18, TypeScript)
- **Styling**: Vanilla Modern CSS (CSS Custom Properties, CSS Modules)
- **Icons**: Lucide React
- **LLM Engine**: Pluggable LLM Provider (Google Gemini / OpenAI / Groq / Mock)
- **Places Engine**: Pluggable Search Provider (Google Places / Serper / Mock Engine)
- **Deployment**: Vercel ready

---

## Getting Started

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/NikitaDmitrenco/ai-local-discovery-agent.git
cd ai-local-discovery-agent
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

You can run the application immediately in **High-Fidelity Demo Mode** without external API keys. To connect live providers, provide your `GEMINI_API_KEY`, `OPENAI_API_KEY`, or `SERPER_API_KEY`.

### 3. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Project Structure

```text
├── src/
│   ├── app/                 # Next.js App Router (pages, layout, API routes)
│   ├── components/          # UI components (Hero, Cards, Refinement, Modals)
│   ├── agent/               # Multi-step agent orchestrator, intent, expansion
│   ├── domain/              # Core domain models (PlaceCandidate, Intent, Review)
│   ├── providers/           # Search, LLM, and Geocoding provider abstractions
│   └── styles/              # Design tokens & global CSS
├── ARCHITECTURE.md          # Detailed architectural specification
├── DECISIONS.md             # Technical and product decision log
├── PROJECT_CONTEXT.md       # Durable system knowledge & rules
├── PROJECT_STATUS.md        # Real-time milestone tracker
└── MASTER_PROMPT.md         # Full project specification
```

---

## Development Milestones

Track real-time progress in [`PROJECT_STATUS.md`](./PROJECT_STATUS.md).
- [x] **M0: Foundation** (Next.js, TS, state files, tokens)
- [ ] **M1: GitHub** (Workflow and remote setup)
- [ ] **M2: Core UI** (Search shell, cards, details, refinements)
- [ ] **M3 - M17**: Full Agentic Discovery Pipeline & Vercel Deployment

---

## License

MIT
