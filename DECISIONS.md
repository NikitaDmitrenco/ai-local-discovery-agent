# Decision Log

## DEC-001: Technical Stack Selection

Date: 2026-08-15
Status: Accepted

### Context
We need a responsive, highly performant web application capable of running an iterative multi-step AI agent on the backend, delivering seamless streaming/progressive updates, handling geo-coordinates, and deploying cleanly to Vercel in Milestone 17.

### Decision
Adopt **Next.js 14+ (App Router) + TypeScript + Vanilla Modern CSS (CSS custom properties / CSS Modules) + Lucide Icons**.

### Alternatives Considered
1. *Vite + React SPA + Express backend*: More fragmented repository structure, requires multi-service deployment setup on Vercel.
2. *Next.js with Tailwind CSS*: Tailwind was explicitly restricted unless requested; modern Vanilla CSS variables provide fine-grained aesthetic control, zero build-time overhead, and avoids cliché utility-class aesthetics.

### Consequences
- Clean single-repository full-stack architecture with Next.js Route Handlers (`/api/agent`, `/api/places`).
- Built-in edge / serverless runtime readiness for Vercel.
- Maximum control over bespoke luxury typography and micro-interactions.

---

## DEC-002: Pluggable Multi-Provider Domain Layer

Date: 2026-08-15
Status: Accepted

### Context
Place search APIs, LLM APIs, and photo sources vary by deployment environment, API keys, and rate limits. The application must operate seamlessly in live production as well as in offline/mock demo scenarios.

### Decision
Define strict provider interfaces (`PlaceSearchProvider`, `LLMProvider`, `GeocodingProvider`) and implement both High-Fidelity Mock and Live Providers behind a Provider Factory pattern.

### Alternatives Considered
- Direct coupling to a single API (e.g. Google Maps API only): Fails when keys are absent or during isolated unit testing.

### Consequences
- Zero vendor lock-in.
- Full offline demo capability with 100% reproducible test suite.
- Clean separation between provider payloads and internal `PlaceCandidate` domain models.
