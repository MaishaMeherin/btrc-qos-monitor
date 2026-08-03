# Architecture — BTRC QoS Monitor

**Date:** 2026-05-30 · Companion to `srs.md`, `api-design.md`, `openapi.yaml`.

This document shows **two architectures**: the system **as it exists today**
(client-only prototype, confirmed from source) and the **proposed** production
architecture that the API design implies. Diagrams use Mermaid (renders on GitHub
and most Markdown viewers).

---

## 1. Current architecture (as-built — confirmed from source)

> No server, no API, no database. Everything runs in the browser; the only I/O is
> `localStorage`. The "speed test" is a scripted `setTimeout` timeline.

```mermaid
flowchart TB
  subgraph Browser["Browser (single device)"]
    subgraph Vite["Vite 6 + React 18 SPA"]
      main["main.jsx<br/>(React root)"]
      App["App.jsx<br/>(single stateful controller:<br/>screen switch, runTest sim,<br/>finishTest, XP/level logic)"]
      Screens["screens/*<br/>Onboard, Home, Testing, Result,<br/>History, Missions, Leaderboard,<br/>Badges, Map, Complaint, Profile,<br/>Inbox, Rewards, Welcome, VpnBlocked"]
      Comp["components/*<br/>PhoneShell, Header, BottomNav,<br/>Overlays, Modals, DemoPanel, Gauge"]
      Data["data/*  (static seed)<br/>isps, districts, seed, personas, reliability"]
      i18n["i18n/strings.js<br/>t(lang, en, bn)"]
    end
    Store["state/store.js<br/>localStorage key 'btrc-v2'"]
    LS[("localStorage<br/>(single JSON blob)")]
  end

  main --> App
  App --> Screens
  App --> Comp
  App --> Data
  Screens --> i18n
  App <-->|loadState / saveState| Store
  Store <--> LS

  classDef sim fill:#fff3cd,stroke:#d39e00,color:#663;
  App:::sim
```

**Key facts (from `srs.md`):**
- `App.jsx` holds all state and the simulated test engine; screens are presentational.
- Persistence = one `localStorage` key (`btrc-v2`) written on every state change.
- No `fetch`/network, no auth, no routing (string `screen` switch).
- Complaint submit button has **no handler** (dead).

### 1.1 Current "test" flow (simulation)

```mermaid
sequenceDiagram
  participant U as User
  participant App as App.jsx
  participant T as Testing screen
  participant LS as localStorage

  U->>App: runTest({mode})
  App->>T: setScreen('testing'), seed testState
  loop scripted setTimeout checkpoints
    App-->>T: setTestState(stage, pct, down, up, lat, jitter, loss)
  end
  alt forcedState set (demo)
    App-->>T: TestRecovery overlay (retry / save partial / dismiss)
  else normal
    App->>App: finishTest(down=46.4, up=10.9, ...)
    App->>App: delivered%, classifyReliability, flag, XP, level
    App->>LS: saveState(history + user)
    App-->>U: Result screen + overlays
  end
```

---

## 2. Proposed architecture (production target)

> Adds the backend the prototype lacks. The React app becomes a thin client; truth
> (measurements, XP/levels, leaderboards, complaints) moves server-side. See
> `openapi.yaml` for the contract.

```mermaid
flowchart TB
  subgraph Client["React SPA (thin client)"]
    UI["screens/* + components/*"]
    ApiClient["API client<br/>(JWT, Accept-Language)"]
    Cache["localStorage<br/>(offline cache only)"]
    UI --> ApiClient
    ApiClient <--> Cache
  end

  subgraph Edge["Edge / Gateway"]
    CDN["CDN<br/>(static SPA assets)"]
    GW["API Gateway<br/>TLS, rate limit, authN,<br/>idempotency, routing"]
  end

  subgraph Services["Application services (REST /api/v1)"]
    Auth["Auth service<br/>OTP + JWT"]
    UserSvc["User & consent"]
    TestSvc["Test ingest<br/>+ scoring/verdict/flag"]
    GamiSvc["Gamification<br/>XP, levels, missions, badges"]
    BoardSvc["Leaderboard + coverage<br/>aggregation"]
    ComplaintSvc["Complaints<br/>(evidence chain)"]
    NotifSvc["Notifications"]
    CatalogSvc["Catalog<br/>ISPs/packages/districts"]
  end

  subgraph Infra["Data & async"]
    DB[("Primary DB<br/>users, tests, complaints,<br/>missions, badges")]
    Agg[("Aggregates / cache<br/>leaderboards, coverage,<br/>district stats")]
    Queue["Message queue<br/>(corroboration, fraud checks,<br/>badge eval, notifications)"]
    SMS["SMS provider<br/>(OTP)"]
    MSrv["Measurement servers<br/>(real down/up/lat targets)"]
    Audit[("Audit log<br/>evidence integrity")]
  end

  CDN --> Client
  ApiClient -->|HTTPS + Bearer JWT| GW
  Client -. real speed test .-> MSrv
  GW --> Auth & UserSvc & TestSvc & GamiSvc & BoardSvc & ComplaintSvc & NotifSvc & CatalogSvc

  Auth --> SMS
  Auth --> DB
  UserSvc --> DB
  TestSvc --> DB
  TestSvc --> Queue
  GamiSvc --> DB
  BoardSvc --> Agg
  ComplaintSvc --> DB
  ComplaintSvc --> Audit
  NotifSvc --> DB
  CatalogSvc --> DB
  Queue --> GamiSvc
  Queue --> BoardSvc
  Queue --> NotifSvc

  classDef new fill:#d4edda,stroke:#28a745,color:#155;
  Auth:::new
  Queue:::new
  MSrv:::new
  Audit:::new
```

Green = net-new vs. today. Everything outside the `Client` box does not exist in the
current build.

### 2.1 Proposed test-submission flow

```mermaid
sequenceDiagram
  participant C as Client SPA
  participant M as Measurement servers
  participant GW as API Gateway
  participant T as Test service
  participant Q as Queue
  participant G as Gamification
  participant N as Notifications

  C->>GW: GET /tests/config?mode=full
  GW->>T: config
  T-->>C: stage timings + XP rules
  C->>M: run real measurement (down/up/lat/jitter/loss)
  C->>GW: POST /tests  (Idempotency-Key, TestSubmission)
  GW->>T: validate, dedupe
  T->>T: delivered%, classifyReliability, flag rule
  T->>G: compute XP / level / mission deltas
  G-->>T: RewardDelta
  T-->>C: 201 { entry, rewards }
  T->>Q: enqueue corroboration + badge eval + notify
  Q->>G: badge unlock checks
  Q->>N: push streak/achievement notifications
```

### 2.2 Migration path (client side)

```mermaid
flowchart LR
  A["Phase 0<br/>Today:<br/>localStorage + seed + sim"]
  B["Phase 1<br/>Add API client + auth/OTP;<br/>read catalogs & history from API;<br/>keep sim behind flag"]
  C["Phase 2<br/>POST /tests with real measurement;<br/>server owns XP/level/flag/verdict;<br/>wire Complaint -> POST /complaints"]
  D["Phase 3<br/>Real leaderboard/coverage aggregates;<br/>notifications service;<br/>localStorage = cache only"]
  A --> B --> C --> D
```

---

## 3. Component → service mapping

| Client today | Proposed service | Endpoint(s) |
|---|---|---|
| `Onboard` consents + ISP pick | Auth + User + Catalog | `/auth/otp/*`, `/users/me/consents`, `/catalog/*` |
| `runTest`/`finishTest` (sim) | Test ingest + Gamification | `GET /tests/config`, `POST /tests` |
| `History` / `HistoryDetail` | Test | `GET /tests`, `GET /tests/{id}` |
| `Missions` | Gamification | `GET /missions`, `POST /missions/{id}/claim` |
| `Badges` | Gamification | `GET /badges`, `GET /badges/{id}` |
| `Leaderboard` | Leaderboard | `GET /leaderboard?scope=` |
| `Map` (`BD_DOTS`) | Coverage | `GET /coverage/districts` |
| `Complaint` (dead button) | Complaints | `POST /complaints` |
| `Inbox` (`openInbox`) | Notifications | `GET /notifications`, `POST /notifications/read` |
| `Profile` | User | `PATCH /users/me`, `GET /users/me/stats` |
| `localStorage` (`store.js`) | — | becomes offline cache only |
| `DemoPanel` / personas | — | dev-only; dropped or gated in prod |

---

*Section 1 is confirmed from `qos-app/src`. Section 2 is a proposal; no server-side
component exists in the current build.*
