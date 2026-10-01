# dgreat.guide — Code Index

Complete developer documentation for the Direct Strike Academy site (v13).
Static HTML/CSS/vanilla JS + Netlify Functions/Blobs backend for the admin pipeline. No build step.

Human-readable version: `docs.html` (linked in the site footer).

---

## 1. Pages & routing

**Routing rule (visit-router.js, loaded only by index.html):**
- First-time visitor on `index.html` → redirected to `start.html` (identity hook).
- Returning visitor (`dsaHasVisited` or `dsaVisitorProfileComplete` in localStorage) → redirected to `matchup-helper.html?race=<saved>&source=return`.
- `index.html?home=1` (the DG logo link) bypasses the redirect.
- **Net effect: `matchup-helper.html` is the de facto main page.** Analytics confirm ~100% of users end up there.

| Page | Role | Page script |
|---|---|---|
| `index.html` | Marketing homepage: hero, race quick-start (links to helper pre-filtered `?race=`), tool cards, noob-trap detector. Mostly bypassed by the router. | main.js only |
| `start.html` | First-visit funnel: pick experience level + race → saves to localStorage → jumps to matchup helper. | start.js |
| `matchup-helper.html` | **The main tool.** Desktop split: left 1/3 strategy-spotlight sidebar, right 2/3 helper (race/position selects, general matchup primer, priority threat deck, threat response arena, worst-build widget). | matchup-helper.js, strategy-spotlight.js, worst-builds.js |
| `tier-list.html` | Phase-based tier board, filter by race + early/late phase. | tier-list.js |
| `unit-counter.html` | Searchable/filterable unit index with expandable cards. | unit-counter.js |
| `strategy-database.html` | Community guide list with race/category/search filters. | strategy-database.js |
| `tvt-trainer.html` / `pvp-trainer.html` | Specialist-fillable mirror-matchup pages. `<body data-race-guide-page="tvt|pvp">` selects content from `DSA_RACE_GUIDES`; supports embedded quizzes. | race-guides-page.js |
| `gas-trainer.html` | Yes/No gas-timing quiz from `DSA_GAS_SCENARIOS`. | gas-trainer.js |
| `zvz-trainer.html` | ZvZ lesson screen + multiple-choice quiz from `DSA_ZVZ_SCENARIOS`. | zvz-trainer.js |
| `wave-function.html` | Wave math lab; mounts the canvas animation via `mountWaveAnimation()`. | wave-animation.js + wave-function-page.js |
| `wave-animation.html` | Standalone self-contained demo of the wave canvas (own inline CSS, not part of site nav). | inline |
| `beginner.html` | Foundations lessons (rendered by main.js `initBeginnerLessons`). | main.js only |
| `glossary.html` | Term glossary (rendered by main.js `initGlossary`). | main.js only |
| `meta.html` | Static current-meta writeup. | main.js only |
| `admin.html` | Editor panel: login, threat/tier/unit/matchup patches, guides, race pages, worst-build moderation, exports. | admin.js |
| `docs.html` | This documentation, rendered for the browser. | main.js only |

## 2. JS files: purpose, globals, load order

**Required script load order on every data-driven page:**

```
main.js → data files (data-units.js, data-matchups.js, data-tierlist.js, data-strategy-guides.js, …)
        → data-community-additions.js → community-data-bridge.js → page scripts
```

The bridge mutates the `window.DSA_*` globals in place, so anything reading them must load after it. `data-strategy-guides.js` uses `window.X = window.X || [...]` guards, so it must load **before** the bridge or its seed data is skipped.

### Core / shared

| File | Defines | Consumes |
|---|---|---|
| `js/main.js` | `window.DSA` (escapeHTML, raceClass, tierClass, label, renderList, filled, navItems, toolCards, noobTraps, beginnerLessons, glossaryEntries, render helpers). Renders nav, footer, settings panel, tool cards, noob-trap detector, lessons, glossary. | localStorage `dsaBackgroundImage` |
| `js/visit-router.js` | — (redirect side-effect only; runs before DOM) | localStorage `dsaHasVisited`, `dsaVisitorProfileComplete`, `dsaRace`, `dsaExperience` |
| `js/community-data-bridge.js` | `DSA_APPLY_COMMUNITY_ADDITIONS`, `DSA_FETCH_SERVER_COMMUNITY_DATA`, `DSA_FORCE_PUBLIC_BACKEND_SYNC`, `DSA_COMMUNITY_MERGED`, `DSA_GET_COMMUNITY_DATA`; **overwrites** `DSA_THREAT_RESPONSES`, `DSA_GENERAL_MATCHUPS`, `DSA_TIERLIST`, `DSA_UNITS`, `DSA_STRATEGY_GUIDES`, `DSA_RACE_GUIDES`, `DSA_WORST_BUILDS`, `DSA_ADMIN_USERS`, `DSA_THREAT_SORTING`, `DSA_ALL_THREAT_UNITS` | All base data globals + `DSA_COMMUNITY_ADDITIONS` + localStorage `DSA_COMMUNITY_PATCHES_V3` + server cache |

### Data files (definitions only, no DOM)

| File | Defines |
|---|---|
| `js/data-matchups.js` | `DSA_MATCHUP_DATA` → exposed as `DSA_GENERAL_MATCHUPS`, `DSA_THREAT_RESPONSES`, `DSA_THREAT_SORTING`, `DSA_ALL_THREAT_UNITS`. Generated from the fill-in xlsx workbook. |
| `js/data-units.js` | `DSA_UNITS` (47 unit rows) |
| `js/data-tierlist.js` | `DSA_TIERLIST` |
| `js/data-strategy-guides.js` | `DSA_STRATEGY_GUIDES` (3 seed guides), `DSA_RACE_GUIDES` (empty seed) — both `||`-guarded |
| `js/data-quizzes.js` | `DSA_GAS_SCENARIOS`, `DSA_ZVZ_SCENARIOS` (plain objects, non-programmer editable) |
| `js/data-community-additions.js` | `DSA_COMMUNITY_ADDITIONS` (exported snapshot of the admin store; sanitized — no password hashes) |
| `js/data-admin-schema.js` | `DSA_ADMIN_SCHEMA` (races, positions, priorities, skillCaps, tiers, permissions, guideCategories, racePages) |
| `js/data-admin-users.js` | `DSA_ADMIN_USERS` (display hints only; real auth is server-side) |

### Page scripts

| File | Reads | Notes |
|---|---|---|
| `js/matchup-helper.js` | `DSA_THREAT_RESPONSES`, `DSA_GENERAL_MATCHUPS` | Defines `window.DSA_MATCHUP_HELPER_REFRESH()`. Filters threats by myRace/enemyRace/positionContext, requires `hasUsefulResponse`, sorts by `sortScore`. Local 👍/👎 votes in localStorage `dsaVotes\|…` keys. Reads `?race=`, `?enemy=`, `?experience=` URL params; sets `dsaHasVisited`. |
| `js/strategy-spotlight.js` | `DSA_STRATEGY_GUIDES` | Sidebar widget: 3 random guides filtered to selected race ('Any' included), enemy-race-relevant first, shuffle button. Re-renders on race change + both community events. |
| `js/worst-builds.js` | `DSA_WORST_BUILDS` (static fallback) | Fetches `/api/admin/worst-builds` once (no polling); rotating top-3 card, submit/vote modal, local vote dedupe in `DSA_WORST_BUILD_VOTES_V1`. |
| `js/start.js` | `DSA` | Experience + race pickers, rotating pain lines; saves `dsaExperience`, `dsaRace`, `dsaVisitorProfileComplete`; redirects to helper. |
| `js/tier-list.js` | `DSA_TIERLIST` | Race + phase (earlyTier/lateTier) filter buttons → tier rows. |
| `js/unit-counter.js` | `DSA_UNITS` | Search + race/tier/skill filters, expandable unit cards. |
| `js/strategy-database.js` | `DSA_STRATEGY_GUIDES` | Race/category/search filters, sorted by `updatedAt`. |
| `js/race-guides-page.js` | `DSA_RACE_GUIDES` | Renders sections where `section.page === body.dataset.raceGuidePage`; embedded quizzes score into `DSA_TVT_QUIZ_SCORES` / `DSA_PVP_QUIZ_SCORES`. |
| `js/gas-trainer.js` | `DSA_GAS_SCENARIOS` | Score persists in `dsa-gas-score`. |
| `js/zvz-trainer.js` | `DSA_ZVZ_SCENARIOS` | Learn screen + quiz screen toggle. |
| `js/wave-animation.js` | — | Defines `window.mountWaveAnimation(selector, options)`; self-injecting canvas + play/speed controls. CSS vars `--wave-bg`, `--wave-color`, `--node-color`. |
| `js/wave-function-page.js` | `mountWaveAnimation` | Mounts the lab on wave-function.html. |
| `js/admin.js` | `DSA_ADMIN_SCHEMA`, `DSA_ADMIN_USERS`, `DSA_GET_COMMUNITY_DATA` | Full admin panel; talks to `/api/admin/*` with Bearer token (session in `DSA_ADMIN_SESSION_V3`); mirrors saves into `DSA_COMMUNITY_PATCHES_V3` and re-applies the bridge. |

## 3. Data schemas (with real examples)

### 3.1 `DSA_GENERAL_MATCHUPS` (data-matchups.js → `general`)

One row per myRace × enemyRace × position (27 rows). Fields: `myRace`, `enemyRace`, `position` ('First'|'Second'|'Third'), `title`, `overview`, `priorities` (string[]), `positionNote`, `confidence`.

```json
{ "myRace": "Zerg", "enemyRace": "Terran", "position": "First",
  "title": "Zerg vs Terran baseline",
  "overview": "Ling/Bane for early, or start lategame units early by opening with roach hydra and infestors for the marines.",
  "priorities": ["Focus on countering each new unit type terran makes..."],
  "positionNote": "3 roach, 4 hydra, 1 ling far away to clump em",
  "confidence": "Known" }
```

### 3.2 `DSA_THREAT_RESPONSES` (data-matchups.js → `threatResponses`)

The matchup helper's core dataset (~57 rows). Fields:
`id` (string, `<threat>__<race>` style), `enemyThreat`, `enemySlug`, `enemyImage`, `unitRace` (race of the threat unit), `myRace`, `enemyRaceContext` ('Any'|race), `positionContext` ('Any'|position), `phase`, `skillCap` ('Low'…'Very High'/'Expert'), `priority` ('Low'|'Medium'|'High'|'Critical'), `counterUnits` (string[], first 3 shown), `counterImages` ({unit,slug,image}[]), `scoutTiming`, `responseTiming`, `recommended` (string[]), `responseText`, `avoid` (string[]), `avoidText`, `warning`, `notes`, `confidence`, `hasResponse` (bool — blank rows are hidden), `sourceRow` (xlsx row), `sortScore` (number, drives ordering), `sortReasons` (string[]), `importance`.

```json
{ "id": "lurker__zerg", "enemyThreat": "Lurker", "unitRace": "Zerg", "myRace": "Zerg",
  "enemyRaceContext": "Any", "positionContext": "Any", "phase": "Any",
  "skillCap": "High", "priority": "Critical",
  "counterUnits": ["Corruptor", "Lurker", "Queen"],
  "scoutTiming": "This will usually pop out in rounds 4-6",
  "responseText": "One of the main zerg mechanics is whoever has more lurkers wins...",
  "avoid": ["Not accounting for air is 95% of where I see players fail lurkers..."],
  "warning": "Don't build if your team is actively losing air...",
  "hasResponse": true, "sortScore": 220, "importance": "Critical" }
```

Also in `DSA_MATCHUP_DATA`: `allThreatUnits` (string[] of 19 threat names) and `threatSorting` (the scoring weights: priority 100/72/42/18, skillCap up to 20, phase bonus, "emotional urgency phrase" boosts like "lose the game": 22).

### 3.3 `DSA_UNITS` (data-units.js)

Fields: `name`, `slug`, `image`, `race`, `tier`, `earlyTier`, `lateTier`, `oldTier`, `newTier`, `role`, `summary`, `tierNotes`, `skillLevel`, `strongAgainst` (string[]), `weakAgainst` (string[]), `commonMistake`, `beginnerWarning`, `status`.

```json
{ "name": "High Templar", "slug": "high-templar", "image": "assets/units/high-templar.png",
  "race": "Protoss", "tier": "S", "earlyTier": "A", "lateTier": "S",
  "role": "S-tier lategame/meta because storm radius/duration punishes clumps and huge armies.",
  "skillLevel": "High",
  "strongAgainst": ["Zerg response: Roach, Zergling, Muta", "..."],
  "commonMistake": "More clumped Hydras; overbuilt Lings/Mutas; ...",
  "beginnerWarning": "If Protoss reaches 5-6 storms, there may not be a perfect Zerg ground answer." }
```

### 3.4 `DSA_TIERLIST` (data-tierlist.js)

Same units, tier-board shape: `unit`, `slug`, `image`, `race`, `tier`, `earlyTier`, `lateTier`, `oldTier`, `newTier`, `notes`, `role`, `confidence`.

### 3.5 `DSA_STRATEGY_GUIDES` (data-strategy-guides.js + community)

Fields: `id`, `title`, `race` ('Zerg'|'Terran'|'Protoss'|'Any'), `matchup` (free text), `category` (one of `DSA_ADMIN_SCHEMA.guideCategories`), `summary`, `body`, `tags` (string[]), `author`/`updatedBy`, `updatedAt` (ISO).

```json
{ "id": "guide-storm-value-basics",
  "title": "Why Storm Value Decides More Lanes Than Raw Army Count",
  "race": "Any", "matchup": "Protoss threat", "category": "Counter Guide",
  "summary": "A short guide for spotting when High Templar is farming your clumps...",
  "body": "If storm is hitting the same packed damage units every wave...",
  "tags": ["High Templar", "Storm", "Formation"],
  "author": "Direct Strike Academy", "updatedAt": "2026-05-26T00:00:00.000Z" }
```

### 3.6 `DSA_RACE_GUIDES` (community-fed; rendered by race-guides-page.js)

Fields: `id`, `page` ('tvt'|'pvp'), `order` (number, sort asc), `title`, `category`, `priority`, `skillLevel`, `summary`, `body`, `keyPoints` (string[]), `commonMistakes` (string[]), optional `quizQuestions` ({question, answers[], correctIndex}[], max 3), plus changelog metadata (`updatedBy`, `updatedAt`, `changeId`, `editorId`, `editorName`, `note`).

### 3.7 Quizzes (data-quizzes.js)

`DSA_GAS_SCENARIOS`: `{ title, prompt, correct: 'Yes'|'No', explanation }`.
`DSA_ZVZ_SCENARIOS`: `{ title, prompt, options: string[], correct: <option string>, explanation }`.

### 3.8 `DSA_COMMUNITY_ADDITIONS` store (data-community-additions.js / Netlify Blobs / localStorage)

The single envelope shape used everywhere in the pipeline:

```json
{ "version": 6, "generatedAt": "ISO", "generatedBy": "isaac",
  "changelog": [{ "changeId", "timestamp", "editorId", "editorName", "editorRole", "scopeRace", "dataset", "action", "target", "note" }],
  "users": { "patches": [], "deleted": [] },
  "patches": { "threatResponses": [{ "targetName", "after": {…row fields…} }], "tierList": [], "units": [], "generalMatchups": [] },
  "additions": { "threatResponses": [], "communityGuides": [], "feedback": [], "raceGuides": [], "worstBuilds": [] } }
```

`patches.*` update existing rows by compound key (threat: myRace|enemyRaceContext|positionContext|enemyThreat; general: myRace|enemyRace|position; tier/unit: name). `additions.*` append-only, deduped by `id`. Worst builds: `{ id, …, votes: { up, down }, createdAt }`, sorted by net votes.

## 4. Admin / community pipeline

```
admin.html (admin.js)
  → POST /api/admin/auth (server-checked password, Bearer token in DSA_ADMIN_SESSION_V3)
  → POST /api/admin/change  (writes to Netlify Blobs)
  → also mirrors store locally → localStorage DSA_COMMUNITY_PATCHES_V3

public page load:
  data files → data-community-additions.js (shipped snapshot)
  → community-data-bridge.js applyCommunityAdditions():
      merge shipped ⊕ server cache (DSA_SERVER_COMMUNITY_CACHE_V1) ⊕ local patches
      → overwrite DSA_* globals → dispatch 'dsa-community-data-ready'
  → fetchServerCommunityData(): GET /api/admin/public at most once per hour per browser
      → on success re-applies + dispatches 'dsa-community-server-data-ready'
page refresh hooks: listeners on those two events; matchup helper also exposes
  window.DSA_MATCHUP_HELPER_REFRESH() and listens to the 'storage' event for
  DSA_COMMUNITY_PATCHES_V3 / dsaCommunityAdditions changes from other tabs.
```

**Throttle/low-credit rules (see NETLIFY_LIVE_THROTTLE_FIX.md, NETLIFY_LOW_CREDIT_MODE.md):** public sync ≤ 1×/hour per browser; force with `?syncCommunity=1` (or `?backendSync=1`); disable with `localStorage.DSA_DISABLE_PUBLIC_BACKEND_SYNC='true'`. Lowest-cost publish path: export `data-community-additions.js` from admin and redeploy the static file.

**Netlify function** `netlify/functions/dsa-admin.mjs` (netlify.toml routes `/api/*`, esbuild bundler, `@netlify/blobs` storage). Routes:
`GET /api/admin/public` (short CDN cache) · `POST /auth` · `GET /state` (private) · `POST /change` · `POST /users` · `GET /login-users` (no-store) · `GET /export-js|export-json|export-md` · `POST /clear` · `GET /worst-builds` · `POST /worst-builds/submit` · `POST /worst-builds/vote`.

Permissions are enforced server-side per role (owner / race-editor scoped to one race / reviewer); race editors can only touch their race's rows, Terran→tvt and Protoss→pvp pages only. Env vars: `DSA_OWNER_PASSWORD_HASH` (pbkdf2, generate via `npm run hash:password`), `DSA_SESSION_SECRET`, optional `DSA_OWNER_ID`/`DSA_OWNER_NAME` (see NETLIFY_ADMIN_BACKEND.md).

## 5. Conventions

- **Escaping:** all user/data strings go through `DSA.escapeHTML` (page scripts alias it as `esc()` with a local fallback). Never interpolate raw data into innerHTML.
- **Unit images:** `slug(name)` (lowercase, `&`→' and ', `/`→`-`, non-alnum→`-`; matchup-helper.js adds typo aliases like `pheonix`→`phoenix`, `muta(lisk)`→`muta`) → `assets/units/<slug>.png`, with `onerror` fallback to `assets/units/unknown.png`. Data rows usually carry precomputed `slug`/`image` too.
- **Badge classes (css/style.css):** races `race-zerg|race-terran|race-protoss` (via `DSA.raceClass`); tiers `tier-s|a|b|c|d|f` (via `DSA.tierClass`); priorities `priority-critical|high|medium|low`; skill `skill-very-high|high|medium|low`.
- **Layout:** `--max` CSS variable controls page width (default 1180px); `body.matchup-wide` raises it to 1520px for the helper page. `.matchup-layout` = grid `minmax(280px,1fr) / minmax(0,2fr)` (sidebar left, helper right); sidebar is sticky and **hidden under 1100px** (`--max` reverts to 1180px). The `.container::before` background gradient also keys off `--max`.
- **Empty data:** blank workbook cells render as "Not filled yet." via `DSA.filled` / `hasResponse` filtering — pages must tolerate missing fields.
- **Background art:** Settings panel saves a relative `.png` path to localStorage `dsaBackgroundImage` (default `assets/background-1920.png`, customs in `assets/backgrounds/`).
- **localStorage key inventory:** `dsaHasVisited`, `dsaVisitorProfileComplete`, `dsaRace`, `dsaExperience`, `dsaBackgroundImage`, `dsaVotes|…` (per-response votes), `dsa-gas-score`, `DSA_TVT_QUIZ_SCORES`, `DSA_PVP_QUIZ_SCORES`, `DSA_COMMUNITY_PATCHES_V3`, `DSA_SERVER_COMMUNITY_CACHE_V1` (+`_TS_`), `DSA_ADMIN_SESSION_V3`, `DSA_WORST_BUILD_VOTES_V1`, `DSA_DISABLE_PUBLIC_BACKEND_SYNC`, `DSA_ENABLE_PUBLIC_BACKEND_SYNC`.
- **Data origin:** data-matchups/units/tierlist are generated from `direct-strike-academy-fill-in-template-revision2.xlsx`; don't hand-edit formats, extend via the admin pipeline.
