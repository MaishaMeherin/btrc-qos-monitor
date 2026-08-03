# Software Requirements Specification (SRS)
## BTRC QoS Monitor — Gamified (qos-app)

**Document version:** 1.0
**Date:** 2026-05-29
**Standard:** IEEE Std 830-1998 (adapted)
**Status of system:** Front-end prototype / interactive mockup

> **Critical scope note (read first).** This SRS was reverse-engineered from the
> source in `qos-app/src`. The application is a **100% client-side React single-page
> application**. As confirmed directly in source:
> - There is **no backend server, no HTTP/REST API, no router, and no database.**
>   A repository-wide search for `fetch(`, `axios`, `XMLHttpRequest`, WebSockets, or
>   any `http(s)://` API base URL returns **no results** (the only `http` matches are
>   inline SVG XML namespaces).
> - All persistence is **browser `localStorage`** under a single key (`btrc-v2`).
> - The "speed test" is a **scripted simulation** driven by `setTimeout`; it does not
>   measure any real network.
> - All speeds, leaderboards, badges, notifications, and complaints are **seeded
>   static data** or locally computed.
>
> Accordingly, §3.2 ("External Interface Requirements") documents the *actual*
> external interfaces that exist (the localStorage persistence contract, the
> component prop/state contract, and the simulated test engine) **in place of** a
> REST API table, because no network API exists in the code. Where IEEE 830 expects
> an item that the implementation does not contain, this document states
> *"Not specified in current implementation"* rather than inventing one.

---

## 1. Introduction

### 1.1 Purpose
This document specifies the software requirements for the **BTRC QoS Monitor —
Gamified** application (`qos-app`), a mobile-styled web prototype that lets
internet users in Bangladesh run (simulated) internet quality-of-service (QoS)
tests, compare delivered speed against their advertised ISP package, and earn
gamification rewards (XP, levels, streaks, badges, missions, leaderboards) for
contributing measurements toward a notional national QoS dataset.

The SRS is intended for developers, QA engineers, product/regulatory stakeholders
(BTRC), and any team that will extend the prototype toward a production system
(notably, adding the backend that the current build does not have).

### 1.2 Scope
The product, as built, is a **single-page React application** packaged with Vite
and styled with Tailwind CSS. It presents a 390×844 "phone shell" mockup containing
a multi-screen experience:

- Onboarding (consent + ISP/package selection).
- Home dashboard (XP bar, mission chip, run-test entry, recent result).
- Simulated speed/QoS test with a live gauge and a result verdict.
- Test history and per-test detail.
- Gamification surfaces: missions, leaderboard, badges, rewards, profile.
- A coverage map of Bangladesh districts.
- A complaint form, an inbox of notifications, and supporting overlays.
- A **demo control panel** to apply personas, force error states, and trigger
  level-up/badge/mission overlays — a presentation/QA aid, not an end-user feature.

The application is **bilingual** (English / Bangla) via a tiny `t(lang, en, bn)`
helper.

**Out of scope of the current build** (explicitly absent in source):
real network measurement, server-side persistence, authentication, real complaint
submission, real leaderboard aggregation, and analytics/telemetry.

### 1.3 Definitions, acronyms, and abbreviations

| Term | Meaning |
|---|---|
| **BTRC** | Bangladesh Telecommunication Regulatory Commission (the notional regulator/owner). |
| **QoS** | Quality of Service — combined measure of speed, latency, jitter, packet loss. |
| **ISP** | Internet Service Provider. Catalog defined in `data/isps.js`. |
| **Package / Plan** | An ISP subscription tier with advertised down/up speed and price. |
| **Advertised speed** | The plan's promised `down`/`up` (Mbps). |
| **Delivered (%)** | `round(measured_down / advertised_down × 100)`. |
| **Verdict / Reliability** | One of `excellent`, `good`, `poor`, `unstable` from `classifyReliability()`. |
| **XP** | Experience points awarded per test/action. |
| **Level** | One of 6 tiers (`LEVELS`) unlocked by cumulative XP. |
| **Streak** | Consecutive days with at least one test (`streakDays`, seeded only). |
| **Mission** | Daily / Weekly / Milestone goal (`MISSIONS`). |
| **Badge** | Achievement across 4 tiers (bronze/silver/gold/platinum). |
| **Flag / Mismatch** | A test where `delivered < 70%` of advertised. |
| **Persona** | A preset app state for demos (`data/personas.js`). |
| **Forced state** | A demo-injected error/condition (`networkError`, `testFailed`, `serverDown`, `vpn`). |
| **LS / localStorage** | Browser persistent key-value store; app key is `btrc-v2`. |
| **SPA** | Single-page application. |

### 1.4 References
- IEEE Std 830-1998 — Recommended Practice for Software Requirements Specifications.
- Project source: `qos-app/` (React 18.3, Vite 6, Tailwind 3.4).
- `qos-app/README.md` — migration notes and file layout.
- In-repo data sources: `src/data/isps.js`, `src/data/districts.js`,
  `src/data/seed.js`, `src/data/personas.js`, `src/data/reliability.js`,
  `src/i18n/strings.js`.

### 1.5 Overview
§2 gives the overall product description. §3 lists functional requirements (3.1),
external interfaces (3.2), and non-functional requirements (3.3). §4 describes the
data model. §5 provides a requirements-to-source traceability matrix.

---

## 2. Overall Description

### 2.1 Product perspective
`qos-app` is a self-contained front-end. There are no upstream/downstream systems
wired in.

**Technology stack (from `package.json`, `vite.config.js`, configs):**
- **Runtime/UI:** React `^18.3.1`, React-DOM `^18.3.1`.
- **Build/dev server:** Vite `^6.0.0` with `@vitejs/plugin-react` (dev server on
  fixed port **5179**, `strictPort: true`, `open: true`).
- **Styling:** Tailwind CSS `^3.4.17`, PostCSS `^8.4.49`, Autoprefixer `^10.4.20`,
  plus CSS variables/base styles in `src/index.css`.
- **Language:** JavaScript (ES modules, JSX). No TypeScript.
- **State:** React `useState`/`useEffect`/`useRef` in `App.jsx`; persisted to
  `localStorage` via `src/state/store.js`. No Redux/Zustand/Context store.
- **Routing:** None. A `screen` string in `App.jsx` switches rendered screens
  (README: *"replace with a router later"*).

**Entry points / structure:**
- `index.html` → `src/main.jsx` (React root mount) → `src/App.jsx` (the single
  stateful controller for the whole app).
- `src/screens/*` — screen components (presentational; receive state via props).
- `src/components/*` — shared UI: `PhoneShell`, `Header`/`StatusBar`, `BottomNav`,
  `Overlays`, `Modals`, `DemoPanel`, `Icons`, `UI`.
- `src/data/*` — static catalogs and seed data.
- `src/i18n/strings.js` — the `t()` translation helper.
- `dist/` — a prior production build artifact (output of `vite build`).

### 2.2 Product functions (summary)
1. Capture consent and ISP/package selection during onboarding.
2. Run a simulated Quick or Full QoS test with a live animated gauge.
3. Classify the result into a reliability verdict and compute delivered %.
4. Award XP, advance levels, and surface badge/mission/level-up overlays.
5. Record each test in a local history with full per-test detail.
6. Present gamification surfaces (missions, leaderboard, badges, rewards, profile).
7. Show a Bangladesh district coverage map.
8. Provide a complaint form (UI only) and a notification inbox.
9. Support EN/BN language switching and light/dark theme.
10. Provide demo tooling (personas, forced error states, overlay triggers).

### 2.3 User classes and characteristics

| User class | Description | Key interactions |
|---|---|---|
| **End user (contributor)** | Bangladeshi internet subscriber running tests and earning rewards. Mobile-first, EN or BN. | Onboard, run tests, view history/missions/leaderboard/badges, file complaint, manage profile. |
| **Returning / power user** | Established contributor with XP, streak, rank (modeled by `DEFAULT_USER` and personas). | All end-user functions plus public-profile leaderboard presence. |
| **Demo presenter / QA** | Internal user demonstrating or testing flows. | Demo panel: apply personas, force states, trigger overlays, reset demo. |
| **Regulator (BTRC)** | Notional consumer of submitted evidence. | **No interface in current build** — represented only in copy/notifications. |

User profile attributes are defined by the `user` object (see §4.3); there is no
multi-user account system — the app models a single local user.

### 2.4 Operating environment
- **Client:** Any modern desktop/mobile browser with ES module + `localStorage`
  support. Layout is optimized for a 390×844 viewport rendered inside `PhoneShell`.
- **Dev/build:** Node.js with npm; Vite dev server at `http://localhost:5179`.
- **Server:** None required at runtime (static assets only after build).

### 2.5 Design and implementation constraints
- C-1: No backend may be assumed; all behavior must run in-browser (current build).
- C-2: All state must serialize to a single `localStorage` key `btrc-v2`
  (`state/store.js`).
- C-3: Screen navigation is a string switch in `App.jsx`, not URL routing
  (no deep-linkable URLs; in-app `deepLink` fields are screen names, not paths).
- C-4: Dev server port is fixed at **5179** with `strictPort` (build will fail to
  start if the port is occupied).
- C-5: Bilingual content is hard-coded inline via `t(lang, en, bn)`; there is no
  external locale catalog.
- C-6: Test timings, speeds, and outcomes are hard-coded constants (see §3.2.3).

### 2.6 Assumptions and dependencies
- A-1: Users accept that displayed measurements are **simulated**, not real (the
  current build performs no actual network measurement).
- A-2: `localStorage` is available and not cleared between sessions (otherwise the
  app re-seeds from defaults).
- A-3: Geolocation is **assumed**, not requested — `locationMode: 'gps'` simply
  hard-codes the district to `Dhanmondi`; `navigator.geolocation` is never called.
- A-4: The single advertised baseline of 50 Mbps down / 10 Mbps up is used as a
  fallback when no package is selected (`finishTest`).

---

## 3. Specific Requirements

### 3.1 Functional Requirements

Conventions: each requirement is traceable to source (file:line referenced in §5).
"The system" = the client app.

#### Onboarding & consent
- **FR-1** The system shall present a multi-step onboarding flow starting at
  `step = 1` when `screen = 'onboard'`. *(App.jsx, Onboard.jsx)*
- **FR-2** The system shall present three consent toggles — location (`loc`),
  anonymous contribution (`anon`), and device info (`device`, default ON) — where
  `loc` and `anon` are marked required. *(Onboard.jsx)*
- **FR-3** The system shall disable advancing from the consent step until both
  `loc` and `anon` consents are granted (`disabled={!(consents.loc && consents.anon)}`).
  *(Onboard.jsx:62)*
- **FR-4** The system shall require selection of both an ISP (`ispCode`) and a
  package (`pkgId`) before completing onboarding (`disabled={!ispCode || !pkgId}`),
  after which it navigates to `home`. *(Onboard.jsx:159–165)*

#### Test execution (simulated)
- **FR-5** The system shall offer two test modes: **Quick** (`quick`, speed only,
  ~7 s) and **Full QoS** (`full`, stability → speed → reliability, ~11 s).
  *(App.jsx:runTest)*
- **FR-6** During a test the system shall render a live gauge and progress driven
  by a fixed step schedule of `{after, state}` checkpoints (percent, latency,
  download, upload, jitter, loss). *(App.jsx:179–195; Testing.jsx, Gauge)*
- **FR-7** On normal completion the system shall finalize with
  `down=46.4, up=10.9, lat=24, jitter=3, loss=0.1` Mbps/ms and build a history
  entry. *(App.jsx:234, finishTest)*
- **FR-8** The system shall allow the user to request cancellation mid-test,
  showing a confirmation sheet that reports current percent; confirming returns to
  `home` and clears pending timers. *(App.jsx:cancelTest, CancelTestSheet)*
- **FR-9** The system shall support demo-forced failure modes during a test:
  `networkError` (fail at 3500 ms), `testFailed` (6000 ms), `serverDown`
  (`finalDelay − 400` ms), and present a **Test Recovery** overlay offering Retry,
  Save Partial (if partial download data exists), Switch Network, or Dismiss.
  *(App.jsx:198–232, 246–266; Overlays.jsx)*
- **FR-10** When saving a partial result, the system shall award reduced XP and
  mark the entry partial (`submitted=false`, no submission ID, DNS/webLoad null).
  *(App.jsx:savePartialResult, finishTest)*

#### Result, scoring & gamification
- **FR-11** The system shall compute **delivered %** =
  `round(measured_down / advertised_down × 100)` (fallbacks: 93% normal / 0% partial
  when advertised or measured down is absent). *(App.jsx:272)*
- **FR-12** The system shall classify reliability via `classifyReliability(down,
  advertised, lat, jitter, loss)` into `excellent (≥80)`, `good (≥60)`,
  `poor (≥35)`, or `unstable (<35)` using the weighted score in §4.5.
  *(reliability.js:38–49)*
- **FR-13** The system shall **flag** a test as a package mismatch when
  `delivered < 70` (non-partial only). *(App.jsx:295)*
- **FR-14** The system shall award XP per completed test: base **30** (Full) or
  **10** (Quick), **+5** if location mode is GPS, **+50** if the test is flagged;
  partial tests award a flat **5 XP**. *(App.jsx:310–312)*
- **FR-15** The system shall increment `totalTests` and `testsThisMonth` on each
  completed test and trigger an XP burst animation of the gained amount.
  *(App.jsx:315–316)*
- **FR-16** The system shall auto-advance the user's level when cumulative `xp`
  crosses a `LEVELS` threshold and present a Level-Up overlay; levels cap at 6.
  *(App.jsx:155–161, 137–142)*
- **FR-17** The system shall generate a contextual "impact" message that varies by
  first-test / flagged / normal cases, in both EN and BN. *(App.jsx:302–308)*
- **FR-18** The system shall present a result screen showing advertised-vs-delivered,
  verdict, use-case suitability (gaming/video/streaming) per `USE_CASE_STATUS`, and
  the impact message. *(Result.jsx, reliability.js:31–36)*

#### History
- **FR-19** The system shall prepend each completed test to a history list and
  persist it. *(App.jsx:314)*
- **FR-20** The system shall render the history list and a per-entry detail view,
  including advertised/delivered, latency, jitter, loss, DNS, web-load, district,
  network type, location source, submission ID, and flag/partial status.
  *(History.jsx, seed.js HISTORY_SEED)*
- **FR-21** The system shall seed history with 15 sample entries
  (`HISTORY_SEED`) for new/returning state. *(seed.js:116–132)*

#### Missions, badges, leaderboard, rewards
- **FR-22** The system shall display daily/weekly/milestone missions with progress,
  target, XP reward, and expiry from `MISSIONS`. *(Missions.jsx, seed.js:44–50)*
- **FR-23** The system shall display 9 badges across 4 tiers with earned status,
  description, narrative story, metric/target, and (where earned) an earned-on date,
  in EN and BN. *(Badges.jsx, seed.js:52–103)*
- **FR-24** The system shall display a leaderboard of contributors with rank,
  handle, district, test count, and XP, highlighting the current user (`me`).
  *(Leaderboard.jsx, seed.js:105–114)*
- **FR-25** The system shall present a rewards screen keyed to the user's progress.
  *(Rewards.jsx)*

#### Map, complaint, inbox, profile
- **FR-26** The system shall render a Bangladesh coverage map plotting district dots
  by `[division, district, x, y, tested, isUser]`, distinguishing tested districts
  and the user's own. *(Map.jsx, districts.js BD_DOTS)*
- **FR-27** The system shall provide a complaint form capturing ISP (read-only),
  reason (slow/outage/billing/other), and a free-text description, with submit
  disabled until both reason and description are present. **The submit button has no
  handler — submission is not implemented.** *(Complaint.jsx:50)*
- **FR-28** The system shall present a notifications inbox seeded with 7 items
  (`NOTIFICATIONS_SEED`) categorized as streak/regulatory/achievement/civic/
  mission/test, each with EN/BN title+body, timestamp, read flag, and a `deepLink`
  screen name; opening the inbox marks all as read. *(Inbox.jsx, App.jsx:84–87,
  seed.js:134–177)*
- **FR-29** The system shall provide a profile screen for identity, ISP/package,
  location mode/manual district, theme, and notification preference, and shall allow
  changing these. *(Profile.jsx, App.jsx:379)*

#### Localization, theming, navigation
- **FR-30** The system shall switch all UI copy between English and Bangla via a
  language toggle (`lang ∈ {en, bn}`). *(App.jsx:329, i18n/strings.js)*
- **FR-31** The system shall apply a light/dark theme by setting
  `document.documentElement.dataset.theme`. *(App.jsx:80–82)*
- **FR-32** The system shall show a bottom navigation bar only on `home`, `rewards`,
  `missions`, `leaderboard`, and `about` screens (and never under the `vpn` forced
  state). *(App.jsx:331)*
- **FR-33** The system shall display a VPN-blocked screen when `forcedState = 'vpn'`,
  suppressing all other screens and navigation. *(App.jsx:363–364, VpnBlocked.jsx)*

#### Persistence & demo tooling
- **FR-34** The system shall persist a defined subset of state to `localStorage`
  under key `btrc-v2` on every change, and restore it on load. *(App.jsx:80–91;
  store.js)* — persisted keys: `screen, step, consents, ispCode, pkgId, lang, user,
  testMode, locationMode, manualDistrict, history, activePersona, forcedState,
  tourSeen, theme, notifPref`.
- **FR-35** The system shall provide a demo panel to apply one of 6 personas
  (`fresh, onboarding, returning, nearLevelUp, powerUser, lapsed`), set forced
  states, and manually trigger level-up/badge/mission overlays. *(DemoPanel.jsx,
  personas.js, App.jsx:122–153)*
- **FR-36** The system shall provide a "Reset demo" action that clears `localStorage`
  and restores all default state. *(App.jsx:106–120, resetAll)*

#### Negative / boundary behaviors observed in source
- **FR-37** If `localStorage` contains malformed JSON, the system shall fall back to
  an empty state object without crashing (`try/catch` in `loadState`). *(store.js:3–9)*
- **FR-38** When no package is selected, the system shall use advertised defaults of
  50 Mbps down / 10 Mbps up for delivered-% computation. *(App.jsx:271, 284)*
- **FR-39** Form field validation beyond required-field gating (e.g., text length,
  format, sanitization) is **Not specified in current implementation.**

### 3.2 External Interface Requirements

> **No network/REST API exists in the codebase.** The conventional IEEE 830 API
> reference table cannot be populated from source. The interfaces below are the
> external/boundary interfaces that *do* exist. A short inferred-vs-confirmed note
> follows §3.2.4.

#### 3.2.1 User interface
- Mobile-styled SPA rendered inside a fixed **390×844** `PhoneShell` frame.
- Screen set (rendered by string switch in `App.jsx`): `welcome, onboard, home,
  testing, result, history, history-detail, missions, leaderboard, complaint,
  badges, map, about` (Profile), `inbox, rewards`; plus the `vpn` full-screen state.
- Overlays/sheets: Level-Up, Badge-Earned, Mission-Complete, Forced-State,
  Cancel-Test sheet, Test-Recovery, More sheet.
- Bilingual EN/BN; light/dark theme via `data-theme`.

#### 3.2.2 Persistence interface — `localStorage` contract (`state/store.js`)
This is the only true I/O boundary in the build.

| Operation | Signature | Behavior | Status codes / errors |
|---|---|---|---|
| Load | `loadState() → object` | Reads key `btrc-v2`, `JSON.parse`. | On parse failure returns `{}` (caught). |
| Save | `saveState(s) → void` | `JSON.stringify` of the persisted-keys subset → key `btrc-v2`. | No explicit quota/error handling (`Not specified`). |
| Clear | `clearState() / removeItem` | Removes key `btrc-v2`. | None. |

- **Storage key:** `btrc-v2` (`LS_KEY`).
- **Auth/permission:** None (single local user; no authentication anywhere in source).
- **Persisted payload schema:** see §4.2.

#### 3.2.3 Simulated test engine interface (`App.jsx`)
The "measurement API" is an in-process scripted timeline, not a network call.

| Element | Quick mode | Full mode |
|---|---|---|
| Stages | `speed` | `stability → speed → reliability` |
| Step checkpoints | 5 (`after`: 400/1800/3400/5000/6200 ms) | 7 (`after`: 800/2200/3600/5200/6800/8200/9800 ms) |
| Final delay | 7000 ms | 11000 ms |
| Final result | down 46.4, up 10.9, lat 24, jitter 3, loss 0.1 | same |
| Forced-fail points | `networkError`@3500, `testFailed`@6000, `serverDown`@`final−400` | same |
| XP reward (complete) | 10 (+5 GPS, +50 if flagged) | 30 (+5 GPS, +50 if flagged) |
| XP reward (partial) | 5 | 5 |

Control surface (functions on the controller): `runTest(opts)`, `cancelTest()`,
`retryTest()`, `dismissRecovery()`, `switchNetworkAndExit()`, `finishTest(res,opts)`,
`savePartialResult()`, `clearTestTimers()`.

#### 3.2.4 Component (prop) interface
Screens are presentational and receive state + callbacks as props from `App.jsx`
(see `App.jsx:367–381`). There is no inter-component network or event-bus interface.

#### 3.2.5 Hardware / external service interfaces
- **Geolocation:** Not used. `navigator.geolocation` is never called;
  `locationMode='gps'` hard-codes district `Dhanmondi`. *(App.jsx:95)*
- **Telephony/OTP:** The `fresh` persona's description mentions "phone → OTP", but
  **no OTP/SMS interface exists** in source. *(personas.js:6)*
- **Network sockets / external APIs:** None.

**Inferred vs. confirmed note (per task rules).**
- *Confirmed directly in source:* all screens, the localStorage key and contract,
  the simulated test timings and XP formulas, the reliability score formula, ISP/
  package/badge/mission/leaderboard/notification/persona data, consent gating,
  delivered-% formula, flag threshold, level thresholds, complaint form fields, the
  complaint submit having **no** handler, and the absence of any network/auth/router
  layer (verified by repo-wide search).
- *Inferred / interpretation (not literal API):* the framing of §3.2.2–3.2.3 as
  "interfaces" — these are internal mechanisms presented as the system's external
  boundary because no REST API exists. The user-class roles in §2.3 are inferred
  from data and copy, not from access-control code (none exists).
- *Not specified in current implementation:* real network measurement, server
  endpoints, authentication, complaint persistence, geolocation requests, input
  format validation, localStorage quota handling.

### 3.3 Non-Functional Requirements

#### Performance
- **NFR-1** Quick test shall complete in ~7 s and Full QoS in ~11 s (fixed timings),
  independent of real network conditions. *(App.jsx:196)*
- **NFR-2** State persistence shall occur synchronously on each relevant state
  change via a single `localStorage` write. *(App.jsx:89–91)* — note: writes the
  full payload (incl. growing `history`) on every change; throughput is **Not
  specified** and unbounded history growth is a known scaling caveat (see NFR-9).
- **NFR-3** UI animations (gauge, XP burst, overlays) are CSS/timeout-driven and
  intended to run smoothly on a typical mobile browser. Exact frame/latency budgets
  are **Not specified in current implementation.**

#### Security & privacy
- **NFR-4** The app stores all data locally; no data leaves the browser (no network
  calls). Consent flags are captured but, absent a backend, are **not transmitted**.
- **NFR-5** There is **no authentication, authorization, encryption, or session
  management** in the current build (single local user). Any production deployment
  must add these.
- **NFR-6** Stored data is **unencrypted** plain JSON in `localStorage` and readable
  by any script on the origin. Input sanitization for the complaint/description text
  is **Not specified in current implementation.**
- **NFR-7** Privacy posture is modeled via copy ("Anon · XX" handles,
  `publicProfile` flag) but not enforced by any access control.

#### Scalability
- **NFR-8** As a static SPA the front end scales via CDN/static hosting; there is no
  server tier to scale. Real scalability (data aggregation, leaderboards across
  users) is **out of scope of the current build** and requires the absent backend.
- **NFR-9** History and notifications grow unbounded in a single `localStorage` key;
  no pagination, pruning, or quota strategy exists. *(App.jsx:314; store.js)*

#### Usability / accessibility / i18n
- **NFR-10** All user-facing copy shall be available in English and Bangla via
  `t(lang, en, bn)`. *(i18n/strings.js)*
- **NFR-11** The UI shall support light and dark themes. *(App.jsx:80–82)*
- **NFR-12** Formal accessibility (WCAG) conformance is **Not specified in current
  implementation.**

#### Reliability / availability
- **NFR-13** Malformed persisted state shall not crash the app (graceful fallback to
  empty state). *(store.js:3–9)*
- **NFR-14** Test timers shall be cancellable and cleared on cancel/retry/navigation
  to avoid stale state updates (`testAbortRef`, `clearTestTimers`). *(App.jsx:163–167)*

#### Portability / maintainability
- **NFR-15** The app shall build and run via Vite (`npm run dev|build|preview`);
  dev server is pinned to port 5179. *(package.json, vite.config.js)*
- **NFR-16** Data catalogs are isolated in `src/data/*` and copy in `src/i18n` to
  ease updates without touching screen logic. *(README, file layout)*

---

## 4. Data Model

The application has **no database**. "Entities" are in-memory React state objects
and static catalogs. Relationships are by string code/id reference, not foreign keys.

### 4.1 Entity overview & relationships
```
User (single, local) ──selects──> ISP ──has many──> Package
   │                                  ▲                 │
   │ produces                         │ referenced by   │ advertised down/up
   ▼                                  │                 ▼
HistoryEntry ──references──> ISP(name), District, Package speeds
   │
   ├── classified by ──> Reliability verdict (excellent/good/poor/unstable)
   └── may be ──> Flagged (delivered < 70%)

User progression ──> Levels (XP thresholds), Badges (metric/target),
                     Missions (progress/target), Leaderboard rank
Notification ──deepLink──> screen name
District dot ──belongs to──> Division (8); flagged tested / isUser
Persona ──> preset {consents, ispCode, pkgId, user, history, screen}
```

### 4.2 Persisted state payload (`localStorage` key `btrc-v2`)
Fields written by `saveState` (App.jsx:90):

| Field | Type | Notes |
|---|---|---|
| `screen` | string | Current screen id. |
| `step` | number | Onboarding step. |
| `consents` | `{loc,anon,device:boolean}` | Consent flags. |
| `ispCode` | string | FK → `ISPS[].code`. |
| `pkgId` | string | FK → `PACKAGES_BY_ISP[ispCode][].id`. |
| `lang` | `'en' \| 'bn'` | Active language. |
| `user` | object | See §4.3. |
| `testMode` | `'full' \| 'quick'` | Default test mode. |
| `locationMode` | `'gps' \| 'manual'` | GPS hard-codes Dhanmondi. |
| `manualDistrict` | string | Manual district name. |
| `history` | `HistoryEntry[]` | Newest first. |
| `activePersona` | string \| null | Demo persona key. |
| `forcedState` | string | `normal/networkError/testFailed/serverDown/vpn`. |
| `tourSeen` | boolean | Whether intro tour shown. |
| `theme` | `'light' \| 'dark'` | UI theme. |
| `notifPref` | string | e.g., `'issues'`. |

> Note: `notifications`, `sheet`, transient overlay/test state are **not** persisted.

### 4.3 `User` entity (`DEFAULT_USER` / `FRESH_USER`, seed.js:1–33)

| Field | Type | Example (DEFAULT) | Meaning |
|---|---|---|---|
| `level` | number | 3 | Current level (1–6). |
| `levelTitle` | string | 'Signal Scout' | Title for level. |
| `xp` | number | 450 | Cumulative XP. |
| `xpToNext` | number | 600 | XP for next level. |
| `streakDays` | number | 7 | Consecutive-day streak (seeded; not auto-updated by tests). |
| `testsThisMonth` | number | 23 | Month test count. |
| `totalTests` | number | 87 | Lifetime test count. |
| `districtsCovered` | number | 5 | Distinct districts. |
| `ispsTested` | number | 3 | Distinct ISPs. |
| `districtRank` | number | 18 | National district rank. |
| `totalDistricts` | number | 64 | Total districts. |
| `inDistrictRank` | number | 3 | Rank within district. |
| `displayName` | string | 'Anon · DI' | Handle. |
| `publicProfile` | boolean | false | Leaderboard visibility flag. |

### 4.4 `HistoryEntry` entity (built in `finishTest`; seed shape in HISTORY_SEED)

| Field | Type | Meaning |
|---|---|---|
| `id` | string | `'h' + Date.now()` (or seed `h1..h15`). |
| `when` | string | Display timestamp `"DD Mon · HH:MM"`. |
| `isoDate` | string (ISO) | Machine timestamp. |
| `isp` | string | ISP display name. |
| `advertisedDown` / `advertisedUp` | number | Plan speeds (Mbps). |
| `down` / `up` | number | Measured speeds (Mbps). |
| `lat` | number | Latency (ms). |
| `jitter` | number | Jitter (ms). |
| `loss` | number | Packet loss (%). |
| `dns` | number \| null | DNS lookup (ms); null if partial. |
| `webLoad` | number \| null | Web load (s); null if partial. |
| `delivered` | number | Delivered % of advertised. |
| `district` | string | Test district. |
| `networkType` | `'4G' \| 'WiFi'` | Derived from location mode. |
| `locationSource` | `'GPS' \| 'Manual'` | Derived from location mode. |
| `submitted` | boolean | `!partial`. |
| `submissionId` | string \| null | `'BD2026-####'`; null if partial. |
| `flagged` | boolean | `delivered < 70` and not partial. |
| `mode` | `'full' \| 'quick'` | Test mode. |
| `partial` | boolean | Saved partial result. |
| `verdict` | string | Reliability key (added after classify). |

### 4.5 Reference catalogs (static)

| Catalog | Source | Shape / key fields |
|---|---|---|
| **ISPS** (7) | isps.js:1–9 | `{code, name, kind}`. |
| **PACKAGES_BY_ISP** | isps.js:11–45 | keyed by ISP code → `[{id, name, down, up, price}]`. |
| **LEVELS** (6) | seed.js:35–42 | `{n, title, xp-threshold}`. |
| **MISSIONS** (5) | seed.js:44–50 | `{id, kind, title_en/bn, xp, progress, target, expires}`. |
| **BADGES** (9) | seed.js:52–103 | `{id, name_en/bn, tier, earned, desc_*, story_*, metric, target, current?, unit_*, earnedOn_*?}`; tiers bronze/silver/gold/platinum. |
| **LEADERBOARD** (8) | seed.js:105–114 | `{rank, handle, district, tests, xp, me}`. |
| **HISTORY_SEED** (15) | seed.js:116–132 | `HistoryEntry`. |
| **NOTIFICATIONS_SEED** (7) | seed.js:134–177 | `{id, kind, when, read, title_en/bn, body_en/bn, deepLink}`. |
| **BD_DOTS** (65 dots / 8 divisions) | districts.js | `[division, district, x, y, tested, isUser]`. |
| **DISTRICTS** (20-name subset) | isps.js:52–56 | string[]. |
| **RELIABILITY / USE_CASE_STATUS** | reliability.js:4–36 | verdict copy + gaming/video/streaming status. |
| **PERSONAS** (6) | personas.js | preset state bundles. |

**Reliability scoring formula (reliability.js:38–49):**
```
ratio = advertised ? down/advertised : 0.8
score = ratio*60
      + max(0,(60-lat)/60)*15
      + max(0,(10-jitter)/10)*15
      + max(0,(2-loss)/2)*10
score ≥ 80 → excellent | ≥ 60 → good | ≥ 35 → poor | else → unstable
```

---

## 5. Traceability

### 5.1 Requirement → Source

| Req | Source (file:line / symbol) |
|---|---|
| FR-1..FR-4 | `App.jsx:50`, `screens/Onboard.jsx:62,159–165` |
| FR-5..FR-7 | `App.jsx:169–236` (`runTest`, step tables, `finishTest`) |
| FR-8 | `App.jsx:238–244` (`cancelTest`), `components/Overlays.jsx` (`CancelTestSheet`) |
| FR-9 | `App.jsx:198–232,246–266`, `Overlays.jsx` (`TestRecoveryOverlay`, `ForcedStateOverlay`) |
| FR-10 | `App.jsx:268–327` (`savePartialResult`, `finishTest`) |
| FR-11 | `App.jsx:272` |
| FR-12 | `data/reliability.js:38–49` |
| FR-13 | `App.jsx:295` |
| FR-14, FR-15 | `App.jsx:310–316` |
| FR-16 | `App.jsx:137–142,155–161` |
| FR-17, FR-18 | `App.jsx:302–308`, `screens/Result.jsx`, `reliability.js:31–36` |
| FR-19..FR-21 | `App.jsx:314`, `screens/History.jsx`, `data/seed.js:116–132` |
| FR-22 | `screens/Missions.jsx`, `seed.js:44–50` |
| FR-23 | `screens/Badges.jsx`, `seed.js:52–103` |
| FR-24 | `screens/Leaderboard.jsx`, `seed.js:105–114` |
| FR-25 | `screens/Rewards.jsx` |
| FR-26 | `screens/Map.jsx`, `data/districts.js` (`BD_DOTS`) |
| FR-27 | `screens/Complaint.jsx:7–53` (submit `disabled` only; no handler at :50) |
| FR-28 | `screens/Inbox.jsx`, `App.jsx:84–87`, `seed.js:134–177` |
| FR-29 | `screens/Profile.jsx`, `App.jsx:379` |
| FR-30 | `App.jsx:329`, `i18n/strings.js` |
| FR-31 | `App.jsx:80–82` |
| FR-32 | `App.jsx:331` |
| FR-33 | `App.jsx:363–364`, `screens/VpnBlocked.jsx` |
| FR-34 | `App.jsx:80–91`, `state/store.js` |
| FR-35 | `components/DemoPanel.jsx`, `data/personas.js`, `App.jsx:122–153` |
| FR-36 | `App.jsx:106–120` (`resetAll`) |
| FR-37 | `state/store.js:3–9` |
| FR-38 | `App.jsx:271,284` |
| FR-39 | (gap) no validation found beyond required-field gating |
| NFR-1 | `App.jsx:196` |
| NFR-2, NFR-9 | `App.jsx:89–91,314`, `state/store.js` |
| NFR-4..NFR-7 | repo-wide: no network/auth/crypto code found |
| NFR-10, NFR-11 | `i18n/strings.js`, `App.jsx:80–82` |
| NFR-13, NFR-14 | `state/store.js:3–9`, `App.jsx:163–167` |
| NFR-15, NFR-16 | `package.json`, `vite.config.js`, `README.md` |

### 5.2 Identified gaps / "Not specified in current implementation"
1. **No backend / REST API** — entire server tier and a real API reference are
   absent (the central deviation from a production SRS).
2. **No real measurement** — speeds are scripted constants.
3. **No authentication / authorization / session** — single local user only.
4. **Complaint submission not wired** — submit button lacks an `onClick`/handler.
5. **Geolocation not requested** — GPS mode is a hard-coded district.
6. **OTP/phone signup referenced in copy but not implemented.**
7. **Input validation/sanitization** beyond required-field gating — none found.
8. **localStorage quota / unbounded history growth** — no handling.
9. **Accessibility/performance budgets** — undefined.
10. **Streak auto-decrement / time-based mission expiry** — seeded values only; no
    scheduler updates them.

---

*End of SRS. Every endpoint, field, formula, and constant above was read from the
`qos-app/src` source; nothing in §3–§4 was invented. Where the implementation lacks
a feature an SRS would normally specify, the gap is stated explicitly rather than
filled with assumptions.*
