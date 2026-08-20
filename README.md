# Aura — AI-Powered Local Discovery
*Experimental / Learning Project*

Aura is an experimental AI-powered web application for finding places based on natural-language requests.

The project explores how an application can take a user's request, search through structured place data and external sources, process the results and present recommendations on an interactive map.

I built Aura as an experiment while learning more about AI workflows and agent-like systems.

[Live Demo](https://aura-three-weld.vercel.app/) · [GitHub](https://github.com/NikitaDmitrenco/aura)

---

## What Aura Does

- **Natural language query**: User enters a request in plain language (e.g. *"A quiet spot near the water with cabins outside the city"*).
- **Intent extraction**: The application parses the request to understand desired activities, atmosphere, and location preferences.
- **Data search**: Searches available place data from Supabase / PostgreSQL and external sources (like OpenStreetMap).
- **Processing & filtering**: Filters results based on user preferences and calculates geographic distance.
- **Validation steps**: The project includes validation and verification steps intended to reduce unsupported recommendations.
- **Interactive map**: Results are displayed both as cards and as interactive pins on a Leaflet map.
- **Progress streaming**: Streams search steps to the browser in real time using Server-Sent Events (SSE).

---

## How It Works

```text
User Request
  ↓
Next.js Application
  ↓
Search & AI Processing
  ↓
Supabase / External Data Sources
  ↓
Processed Results & Verification
  ↓
Web UI + Leaflet Map
```

1. **User Request**: The user enters a natural-language query in the search bar.
2. **Next.js Application**: Handles routing and API endpoints, orchestrating the search flow.
3. **Search & AI Processing**: Analyzes query intent and coordinates data queries.
4. **Data Sources**: Retrieves venue data from Supabase (PostgreSQL) and geocoding / map services.
5. **Result Processing**: Scores matching candidates and filters out weak matches.
6. **UI & Map**: Renders place cards and updates the Leaflet map with locations and drive times.

---

## The AI Workflow

This project experiments with:
- Natural-language intent extraction
- AI-assisted search and query expansion
- Multi-step processing pipelines
- Result validation to reduce unsupported recommendations
- Conversational refinement (e.g. *"Make it closer"* or *"Find something quieter"*)

---

## Tech Stack

- **Framework & UI**: Next.js 14, React 18, TypeScript, CSS Modules
- **Database**: Supabase / PostgreSQL
- **AI Integrations**: Gemini API / OpenAI API (with built-in offline mock data for testing)
- **Maps & Geocoding**: Leaflet, OpenStreetMap Overpass API, Nominatim
- **Real-Time Streaming**: Server-Sent Events (SSE)

---

## What I Learned

Building this experimental project helped me learn:
- How to connect AI APIs to a real full-stack web application
- Managing multi-step asynchronous processing logic
- Streaming backend progress to the client with Server-Sent Events
- Working with geospatial coordinates, distances, and mapping tools (Leaflet)
- Structuring modular TypeScript code across multiple providers and services

---

## Local Development

### 1. Clone & Install
```bash
git clone https://github.com/NikitaDmitrenco/aura.git
cd aura
npm install
```

### 2. Configure Environment (Optional)
Aura includes an offline demo mode with mock data out of the box. To connect live cloud APIs, copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Limitations

Aura is an experimental portfolio project rather than a production search platform. The quality of recommendations depends on the available data and external sources, and the AI workflow can still be improved.

