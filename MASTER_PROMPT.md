# MASTER PROMPT
# AI LOCAL DISCOVERY AGENT

## 0. ROLE

You are a senior/staff-level product engineer, AI engineer, UX designer, technical architect, and QA engineer.

Your task is to independently design and build a high-quality AI-native web application for local place discovery.

The product helps users find real places around them based on a natural-language description of the experience they want.

The user does NOT need to know:
- the category of the place;
- the name of the place;
- search keywords;
- exact filters;
- the terminology used by businesses.

The user describes what they want in ordinary human language.

The AI must understand the intent, expand the search space semantically, discover real places, verify them, analyze reputation and reviews, find relevant photos of the actual places, rank candidates by intent match, and present the results in a beautiful consumer application.

---

# 1. PRODUCT CONCEPT

The product is an:

> AI Local Discovery Agent

Core principle:

> "Tell me what kind of experience you want. I'll find the places that can give you that experience."

This is NOT:
- a normal search engine;
- a Google Maps clone;
- a directory;
- a static catalog;
- a chatbot wrapper;
- a form with dozens of filters;
- a simple keyword search.

It is an AI agent that performs a multi-step discovery and verification process.

---

# 2. CORE USER EXAMPLE

The primary demo scenario is:

> "Хочу вечерком воскресным отдохнуть в каком-нибудь тихом местечке где можно покататься на воде и поспать за городом"

The user does not mention "wake park".

The system must understand concepts such as:

- outdoor relaxation;
- quiet atmosphere;
- Sunday evening;
- water activity;
- outside the city;
- overnight stay.

The system should expand possible place types to include relevant categories such as:

- wake park;
- wakeboarding center;
- water sports center;
- lake resort;
- recreation base;
- countryside resort;
- camping near water;
- glamping near water;
- water recreation complex;
- other semantically relevant places.

If a real wake park matches the request, it should be able to discover and rank it highly even though the word "wake park" was never used by the user.

This scenario is a mandatory end-to-end demo.

---

# 3. PRODUCT FORM

Build this as a:

> Responsive AI-native Web Application.

It must work well on:
- desktop;
- tablet;
- mobile browsers.

Architecture must be designed so the product can later become a PWA and/or mobile application without rewriting the AI agent and backend/domain layers.

Do NOT build native iOS/Android applications in the initial project unless explicitly requested later.

The initial goal is a polished web application that can be opened through a URL.

---

# 4. UX PRINCIPLE

The primary interaction is NOT a list of filters.

The user sees a large natural-language input.

Example:

> What are you in the mood for?

Placeholder:

> "Describe what you want to do. I'll find the right places."

Example input:

> "Хочу тихое место за городом у воды, где можно провести вечер и остаться на ночь."

Button:

> Find places

The application should feel like an intelligent local discovery assistant rather than a traditional search website.

---

# 5. GEOLOCATION

On first use, attempt to determine the user's location using browser geolocation.

Flow:

```text
Browser geolocation
        ↓
Coordinates
        ↓
Reverse geocoding
        ↓
Current city / region
```

Show the detected location clearly.

Example:

> 📍 Chișinău

Allow the user to change the location manually.

If geolocation is denied:

* do not break the application;
* provide manual city/location selection;
* continue using the selected location.

Never silently assume a location without communicating it to the user.

---

# 6. INTENT UNDERSTANDING

The AI must convert natural language into structured intent.

For example:

```json
{
  "location": "current_city",
  "time": {
    "day": "Sunday",
    "period": "evening"
  },
  "experience": [
    "relaxation",
    "outdoors",
    "water"
  ],
  "activities": [
    "water sports"
  ],
  "atmosphere": [
    "quiet",
    "nature",
    "outside city"
  ],
  "accommodation": {
    "required": true
  },
  "budget": null,
  "party": null
}
```

The exact schema may evolve.

The architecture must keep intent extensible.

The AI must distinguish:

### Explicit requirements

Things the user directly requested.

### Strongly implied preferences

Things strongly implied by context.

### Optional preferences

Things that can improve ranking but should not eliminate otherwise good candidates.

### Unknowns

Things the user did not specify.

Do not invent preferences.

---

# 7. SEMANTIC QUERY EXPANSION

This is one of the most important capabilities of the product.

The agent must NOT search only the literal words used by the user.

For example:

> "покататься на воде и поспать за городом"

must not become only:

> "покататься на воде поспать за городом"

Instead the agent should generate semantic search hypotheses such as:

```text
wake park
wakeboarding
water sports
lake resort
water recreation
recreation base
camping near lake
glamping near water
countryside resort
water sports accommodation
```

The exact queries must depend on the interpreted intent.

Use multiple search hypotheses rather than one search query.

The goal is to discover the correct category even when the user does not know its name.

---

# 8. MULTI-STEP AGENT LOOP

The application must implement a genuine agent workflow.

Conceptually:

```text
USER REQUEST
    ↓
UNDERSTAND INTENT
    ↓
EXPAND SEARCH SPACE
    ↓
SEARCH
    ↓
OBSERVE RESULTS
    ↓
EVALUATE CANDIDATES
    ↓
DECIDE WHAT NEEDS VERIFICATION
    ↓
CALL MORE TOOLS
    ↓
VERIFY
    ↓
RANK
    ↓
PRESENT
```

The agent may perform multiple tool calls before returning the final answer.

It must not be implemented as:

```text
one prompt → one LLM response → results
```

The agent should be able to decide that more information is required and perform another search/verification step.

However, implement safeguards against:

* infinite loops;
* unnecessary repeated searches;
* excessive tool calls;
* repeated identical queries.

Use configurable execution limits.

---

# 9. SEARCH PROVIDER ABSTRACTION

Do not tightly couple the application to one external search provider.

Create provider abstractions such as:

```typescript
interface PlaceSearchProvider {
  searchPlaces(...)
  getPlaceDetails(...)
  getReviews(...)
  getPhotos(...)
}
```

And separate web search capabilities where necessary.

The exact providers depend on the available APIs and environment.

Provider-specific code must stay behind an abstraction layer.

The application should be able to replace providers later.

---

# 10. PLACE DATA MODEL

Normalize discovered places into a common internal model.

For example:

```typescript
PlaceCandidate {
  id
  name
  category
  address
  coordinates
  distance
  description
  activities
  amenities
  openingHours
  accommodation
  rating
  reviewCount
  reviewSummary
  photos
  sources
  verification
  intentMatch
}
```

The exact schema may evolve.

The frontend should consume domain/application data rather than raw provider responses.

---

# 11. CANDIDATE DISCOVERY

The agent may find many candidate places.

It must:

1. collect candidates;
2. normalize them;
3. deduplicate them;
4. identify the same place across different sources;
5. discard obviously irrelevant candidates;
6. continue verification on promising candidates.

Example:

```text
24 candidates found
↓
11 unique places
↓
8 potentially relevant
↓
5 sufficiently verified
↓
Top 3-5 results
```

Do not show irrelevant places merely to fill a list.

---

# 12. PLACE VERIFICATION

Discovery is not enough.

A candidate must be verified against the user's intent.

Verify when relevant:

### Identity

Is this actually the place being referenced?

### Location

Where is it?

### Activity

Does it actually offer the requested activity?

### Accommodation

Can the user stay overnight?

### Schedule

Is it available at the requested time?

### Atmosphere

Does available evidence support the requested atmosphere?

### Reputation

What do visitors say?

### Photos

Do the photos actually belong to this place?

Important:

> Never present unverified information as a verified fact.

---

# 13. REVIEWS AND REPUTATION

Do not show only:

> ⭐ 4.7

The application should provide an AI-generated reputation summary based on available review evidence.

Example:

```text
⭐ 4.6 / 5
327 reviews

People often mention:
✓ location
✓ atmosphere
✓ staff
✓ water activities

Potential downsides:
⚠ limited evening availability
⚠ difficult road access
```

The exact themes must come from available review data.

Never fabricate:

* reviews;
* quotes;
* ratings;
* review counts;
* complaints;
* positive themes.

If evidence is insufficient:

> Limited review evidence.

---

# 14. PHOTO DISCOVERY AND PHOTO VERIFICATION

This is a critical product requirement.

The application must prioritize photographs of the ACTUAL PLACE.

Do NOT simply search:

> "wake park Moldova"

and show generic wakeboarding images.

A photo must be relevant to the specific place being presented.

Preferred source priority:

1. photos attached to a specific place listing;
2. user-generated photos clearly associated with that place;
3. photos with strong contextual evidence that they depict the place;
4. official photos that clearly depict the place;
5. other sources only when confidence is sufficiently high.

Photo pipeline:

```text
PLACE IDENTITY
      ↓
PHOTO CANDIDATES
      ↓
SOURCE CHECK
      ↓
PLACE CONTEXT CHECK
      ↓
LOCATION / NAME CHECK
      ↓
GENERIC PHOTO REJECTION
      ↓
RELEVANCE SCORING
      ↓
PHOTO RANKING
      ↓
FINAL PHOTO SET
```

If confidence is low:

> show fewer photos rather than incorrect photos.

Never use a generic stock image merely because it visually matches the activity.

---

# 15. PHOTO QUALITY RULE

The product must prefer:

> "No verified photo"

over:

> "Wrong photo of another place."

This is a trust-critical feature.

Photo relevance must be treated as a data-quality problem, not merely a UI problem.

---

# 16. INTENT MATCH SCORE

Every final candidate should receive an intent-match score.

Example:

> 92% match

The score must reflect the user's request rather than merely the popularity of the place.

Possible factors:

```text
location
distance
activity match
atmosphere match
time compatibility
overnight compatibility
budget compatibility
reputation
data confidence
photo confidence
```

Weights must be dynamic.

For example:

If the user says:

> "Главное чтобы было тихо"

quietness becomes more important.

If the user says:

> "Хочу именно покататься на wakeboard"

water activity becomes dominant.

Do not make the score decorative.

---

# 17. RESULT CARD

A result card should contain:

* place name;
* relevant photo;
* distance;
* category;
* short description;
* activities;
* overnight availability;
* rating;
* review count;
* reputation summary;
* intent match score;
* why it matches;
* potential downside;
* source information;
* button to view details.

Example:

```text
WakePark X

92% match

35 min from Chișinău

🌊 Wakeboarding
🏊 Swimming
🌲 Nature
🛏 Overnight

⭐ 4.6 · 327 reviews

Why it matches:
Best fit for a quiet outdoor evening
with water activities and overnight stay.

Potential downside:
Limited evening activity according
to available information.

[View place]
```

---

# 18. PLACE DETAILS

Create a dedicated place details view.

Sections:

### Overview

What the place is.

### What you can do

Activities.

### Stay

Accommodation / overnight options.

### Reviews

Rating and reputation analysis.

### Photos

Only relevant photos.

### Location

Address, map, distance.

### Hours

When available.

### Why AI picked it

Specific explanation based on the user's intent.

### Sources

Relevant source references.

---

# 19. CONTEXTUAL REFINEMENT

After displaying results, show dynamic AI-generated refinement suggestions.

These are NOT ordinary static filters.

For example, after:

> "quiet place outside the city, water activities, overnight"

show:

```text
📍 Ближе
💰 Подешевле
🌲 Тише
🏄 Больше активностей
🛏 Лучше для ночёвки
👫 Лучше для двоих
```

The exact suggestions must depend on the current context.

Do not always show the same fixed set of filters.

---

# 20. REFINEMENT MUST CHANGE THE AGENT'S BEHAVIOR

If the user presses:

> Тише

do not simply execute a frontend filter such as:

```sql
WHERE quiet = true
```

Instead:

```text
CURRENT INTENT
      ↓
NEW USER PREFERENCE
      ↓
UPDATED INTENT
      ↓
UPDATED SEARCH STRATEGY
      ↓
SEARCH / VERIFY IF NEEDED
      ↓
RE-RANK
      ↓
NEW RESULTS
```

The agent should be able to search for additional places if the existing candidates do not satisfy the refinement.

Example UI:

```text
Making it quieter...

✓ Prioritizing nature locations
✓ Excluding busy places
✓ Checking review mentions of noise
✓ Re-ranking candidates
```

This should reflect actual agent activity, not fake animation.

---

# 21. CONVERSATIONAL REFINEMENT

The user can also refine naturally:

> "А есть что-нибудь похожее, но поближе?"

> "А без ночёвки?"

> "А что-нибудь романтичнее?"

> "А где ещё можно поесть?"

The agent must preserve the context of the current search.

The user should not have to repeat the original request.

---

# 22. AGENT EXECUTION UI

During a search, show meaningful progress.

Example:

```text
AI is finding places for you

✓ Understanding your request
✓ Expanding search ideas
✓ Searching nearby places
✓ Checking activities
⟳ Verifying accommodation
○ Analyzing reviews
○ Finding relevant photos
```

These states must correspond to actual execution stages.

Do not use fake progress merely to create an illusion of agent activity.

---

# 23. AGENT TRACE

Provide a development/demo mode that can show high-level agent activity.

Example:

```text
Agent activity

✓ Intent extracted
→ generated 7 search hypotheses
→ found 24 candidates
→ deduplicated to 11
→ verified 8
→ rejected 3
→ analyzed available reviews
→ verified relevant photos
→ ranked top candidates
```

Do NOT expose hidden chain-of-thought or internal reasoning.

Only expose:

* high-level actions;
* tool activity;
* counts;
* results;
* verification outcomes.

---

# 24. SOURCE TRANSPARENCY

Important factual claims should have source references.

For example:

```text
Wakeboarding
Source: place listing

Cabins available
Source: official website

4.6 / 5
Source: review platform
```

AI summaries must be grounded in available evidence.

---

# 25. ERROR HANDLING

Never invent missing data.

Examples:

If accommodation cannot be verified:

> Overnight stay could not be verified.

If reviews are insufficient:

> Limited review evidence.

If relevant photos cannot be verified:

> No verified photos found.

If no good candidates exist:

The agent should expand the search strategy intelligently.

Example:

```text
exact place category
↓
semantic category expansion
↓
broader search radius
↓
broader but still relevant place types
```

Never return irrelevant places merely to avoid an empty result.

---

# 26. UI / VISUAL DESIGN

The product should feel like a premium AI-native consumer application.

Avoid:

* corporate dashboards;
* admin panels;
* spreadsheet-like interfaces;
* huge filter panels;
* generic chatbot appearance;
* direct Google Maps visual imitation.

Design characteristics:

* minimal;
* premium;
* modern;
* visual;
* strong typography;
* high-quality imagery;
* large cards;
* clear hierarchy;
* subtle motion;
* responsive;
* mobile-first interaction quality.

Core emotion:

> "I described what I want, and the AI found me somewhere to go."

---

# 27. RESPONSIVE DESIGN

Desktop and mobile are both first-class experiences.

Mobile flow:

```text
Search
↓
Intent interpretation
↓
Results
↓
Refinement
↓
Place details
```

Cards, photos, buttons and input must work naturally on touch devices.

---

# 28. MODEL ABSTRACTION

Do not hard-code the entire architecture around one LLM provider.

Create an abstraction such as:

```typescript
interface LLMProvider {
  generate(...)
  generateStructured(...)
}
```

The architecture should allow future support for providers such as:

* OpenAI;
* Anthropic;
* Gemini;
* DeepSeek;
* other compatible providers.

Use the provider that is most practical and available for the current implementation.

Do not invent API capabilities.

---

# 29. DEMO MODE

The application must support a development/demo mode.

If real external APIs are unavailable:

* use mock providers;
* use realistic sample place data;
* preserve the same domain models;
* preserve the same agent flow;
* preserve the same UI.

Mock mode must be explicitly separated from real data.

Never mix mock records with real production results.

---

# 30. ARCHITECTURE

Use clear separation:

```text
UI
 ↓
Application Layer
 ↓
Agent Orchestration
 ↓
Tools
 ↓
Provider Abstractions
 ↓
External APIs / Data Sources
```

Example:

```text
Frontend
   ↓
API / Backend
   ↓
Discovery Agent
   ├── Intent Parser
   ├── Query Expansion
   ├── Place Search Tool
   ├── Place Details Tool
   ├── Review Tool
   ├── Photo Search Tool
   ├── Photo Verification
   ├── Ranking
   └── Refinement
```

Do not mix provider-specific logic into UI components.

Do not put the entire agent inside one enormous function.

---

# 31. GITHUB REPOSITORY

GitHub is part of the development workflow from the beginning.

GitHub owner:

> NikitaDmitrenco

At the beginning of the project:

1. Check whether GitHub authentication/integration is available.
2. Check access to `NikitaDmitrenco`.
3. Check whether the repository for this project already exists.
4. If it does not exist, create it.
5. If a repository already exists, use it only if it clearly belongs to this project.
6. Never delete or overwrite an unrelated existing repository.
7. Initialize local git if necessary.
8. Connect local repository to GitHub.
9. Create an initial commit after the foundation is functional.
10. Push it to GitHub.

Repository should be private by default unless explicitly requested otherwise.

Never invent credentials.

Never commit secrets.

---

# 32. GIT WORKFLOW

Git must be used continuously during development.

Make regular logical commits.

Examples:

```text
feat: add core search UI
feat: add place provider abstraction
feat: add intent extraction
feat: add semantic query expansion
feat: add agent orchestration
feat: add place verification
feat: add review analysis
feat: add photo relevance pipeline
feat: add intent ranking
feat: add contextual refinement

fix: handle geolocation denial
fix: prevent unrelated photos
fix: handle empty search results

docs: update project status
```

Do not create one enormous commit after multiple milestones.

After each completed milestone:

1. run build;
2. run tests;
3. run lint/typecheck;
4. update project state files;
5. commit;
6. push to GitHub.

Never commit:

* API keys;
* secrets;
* `.env`;
* credentials;
* private user data;
* node_modules;
* unnecessary generated artifacts.

Use `.env.example`.

---

# 33. PROJECT STATE FILES

The repository must contain:

```text
MASTER_PROMPT.md
PROJECT_STATUS.md
PROJECT_CONTEXT.md
DECISIONS.md
ARCHITECTURE.md
README.md
.env.example
.gitignore
```

These files are part of the product development infrastructure.

---

# 34. PROJECT_STATUS.md

`PROJECT_STATUS.md` is the source of truth for the current development state.

Maintain it continuously.

---

# 35. PROJECT_CONTEXT.md

This file stores durable project knowledge that must survive across AI sessions.

---

# 36. DECISIONS.md

Maintain an architectural/product decision log.

---

# 37. MILESTONE RULE

Development MUST proceed strictly sequentially.

The rule is:

> Always start from the first incomplete milestone.

Do not start a later milestone while the current milestone is incomplete.

---

# 38. MILESTONES ROADMAP (M0 - M17)

- M0: Project Foundation
- M1: GitHub Development Workflow
- M2: Core UI Shell
- M3: Domain Model and Provider Abstraction
- M4: Real Place Discovery
- M5: LLM Intent Engine
- M6: Semantic Query Expansion
- M7: Agent Orchestration
- M8: Place Verification
- M9: Reviews and Reputation
- M10: Photo Discovery and Verification
- M11: Intent Matching and Ranking
- M12: Contextual Refinement
- M13: Conversational Memory
- M14: Production Quality UX
- M15: End-to-End QA
- M16: Final Documentation
- M17: Production Deployment to Vercel
