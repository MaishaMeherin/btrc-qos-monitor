# API Design (Proposed) — BTRC QoS Monitor

**Document version:** 1.0 (draft)
**Date:** 2026-05-30
**Status:** 🔮 **FORWARD-LOOKING / NOT IMPLEMENTED.** Companion to `srs.md`.

> **Read this first.** Nothing in this document exists in the current codebase.
> `qos-app` is today a client-only React prototype with **no backend, no API, and
> `localStorage`-only persistence** (see `srs.md` §3.2). This document proposes the
> REST API a production build *would* need to turn the simulated, single-device
> prototype into a real multi-user national QoS platform. Every resource and field
> below is **derived from existing client state and seed data** so the contract maps
> cleanly onto what the UI already consumes — but all of it is a design proposal,
> not a record of source.
>
> Legend used throughout:
> - **[maps]** — directly backs an existing client behavior / FR in `srs.md`.
> - **[new]** — net-new server capability with no client equivalent today.
> - **[derived]** — field/shape lifted from an existing client data structure.

---

## 1. Design principles

1. **The client already defines the data shapes.** Reuse the `HistoryEntry`,
   `User`, `Mission`, `Badge`, `Notification`, and catalog shapes from `srs.md` §4
   as wire formats wherever possible to minimize client churn.
2. **The server owns truth the client currently fakes.** Real measurement
   submission, leaderboard aggregation, streak/level computation, badge unlocking,
   complaint persistence, and cross-user district stats move server-side.
3. **Stateless, token-authenticated REST.** JSON over HTTPS; bearer JWT access
   tokens + refresh tokens. The current build has no auth (`srs.md` NFR-5); this is
   the single biggest addition.
4. **Privacy-first to match the product copy.** Anonymous handles (`Anon · XX`),
   per-field consent enforcement, and a `publicProfile` flag are first-class
   (matches `consents` and `User.publicProfile` in source).
5. **Idempotent, evidence-grade submissions.** Test submissions carry a
   client-generated idempotency key; accepted submissions get an immutable
   `submissionId` (the client already mints `BD2026-####` locally).
6. **Versioned + paginated.** All collection endpoints paginate; base path `/api/v1`.

---

## 2. Conventions

- **Base URL:** `https://api.qos.btrc.gov.bd/api/v1`
- **Content type:** `application/json; charset=utf-8`
- **Auth:** `Authorization: Bearer <access_token>` unless marked *Public*.
- **Idempotency:** mutating POSTs accept `Idempotency-Key: <uuid>` header.
- **Localization:** `Accept-Language: en | bn` (server returns localized strings
  where the client today switches via `t(lang, en, bn)`).
- **Pagination:** `?limit=` (default 20, max 100) + `?cursor=`; responses include
  `{ "data": [...], "next_cursor": "..." }`.
- **Errors:** RFC 9457 problem+json:
  ```json
  { "type": "about:blank", "title": "Validation failed",
    "status": 422, "detail": "pkgId not found for ispCode", "errors": {"pkgId": "unknown"} }
  ```
- **Standard status codes:** `200` OK, `201` Created, `202` Accepted (async verify),
  `204` No Content, `400` malformed, `401` unauthenticated, `403` forbidden,
  `404` not found, `409` conflict/duplicate, `422` validation, `429` rate-limited.

---

## 3. Resource map (proposed)

| Resource | Backs (client today) | Source reference |
|---|---|---|
| `auth` | OTP signup hinted in `fresh` persona copy ("phone → OTP") | `personas.js:6` |
| `users/me` | `user` object + `consents` + profile prefs | `seed.js:1–33`, `App.jsx:52–78` |
| `catalog/isps`, `catalog/packages` | ISP + package pickers | `isps.js:1–45` |
| `catalog/districts` | map dots + district selection | `districts.js`, `isps.js:52–56` |
| `tests` | history entries + submission | `App.jsx:finishTest`, `seed.js:116–132` |
| `tests/config` | Quick/Full mode params & XP rules | `App.jsx:179–312` |
| `missions` | mission list + progress | `seed.js:44–50` |
| `badges` | badge list + earned state | `seed.js:52–103` |
| `leaderboard` | district/division scopes | `seed.js:105–114`, `Leaderboard.jsx` |
| `coverage` | district coverage map | `districts.js` `BD_DOTS` |
| `complaints` | complaint form (currently dead button) | `Complaint.jsx:50` |
| `notifications` | inbox | `seed.js:134–177` |

---

## 4. Endpoint reference (proposed)

### 4.1 Authentication & session **[new]**
The current build has no auth; this is required for any real multi-user system.

| Method | Path | Auth | Request | Response | Codes |
|---|---|---|---|---|---|
| POST | `/auth/otp/request` | Public | `{ "phone": "+8801…" }` | `{ "challengeId": "…", "expiresIn": 300 }` | 200, 422, 429 |
| POST | `/auth/otp/verify` | Public | `{ "challengeId": "…", "code": "123456" }` | `{ "accessToken","refreshToken","user": User }` | 200, 401, 410 |
| POST | `/auth/refresh` | Public (refresh token) | `{ "refreshToken": "…" }` | `{ "accessToken","refreshToken" }` | 200, 401 |
| POST | `/auth/logout` | Bearer | `{}` | `204` | 204, 401 |

> Maps the `fresh` persona's "phone → OTP → access" description (`personas.js:6`),
> which has **no implementation** today.

### 4.2 Current user & consent

| Method | Path | Auth | Request | Response | Codes |
|---|---|---|---|---|---|
| GET | `/users/me` | Bearer | — | `User` **[derived: seed.js:1–16]** | 200, 401 |
| PATCH | `/users/me` | Bearer | partial `{ displayName?, publicProfile?, lang?, theme?, notifPref? }` | `User` | 200, 401, 422 |
| GET | `/users/me/consents` | Bearer | — | `{ "loc":bool,"anon":bool,"device":bool }` **[derived]** | 200, 401 |
| PUT | `/users/me/consents` | Bearer | `{ "loc","anon","device" }` | same | 200, 401, 422 |
| GET | `/users/me/stats` | Bearer | — | `{ level, xp, xpToNext, streakDays, totalTests, testsThisMonth, districtsCovered, ispsTested, districtRank, inDistrictRank }` **[derived]** | 200, 401 |
| DELETE | `/users/me` | Bearer | — | `204` (account + data erasure) **[new]** | 204, 401 |

**`User` schema (wire) [derived: `seed.js:1–16`]**
```json
{
  "id": "usr_…",
  "displayName": "Anon · DI",
  "publicProfile": false,
  "level": 3, "levelTitle": "Signal Scout",
  "xp": 450, "xpToNext": 600,
  "streakDays": 7,
  "testsThisMonth": 23, "totalTests": 87,
  "districtsCovered": 5, "ispsTested": 3,
  "districtRank": 18, "totalDistricts": 64, "inDistrictRank": 3,
  "lang": "en", "theme": "light", "notifPref": "issues"
}
```
> **Server-owned fields:** `level/levelTitle/xp/xpToNext/streakDays/*Rank/*Covered`
> become server-computed (today the client mutates them locally in `App.jsx`). Levels
> follow the `LEVELS` thresholds (`seed.js:35–42`).

### 4.3 Catalogs (mostly public, cacheable)

| Method | Path | Auth | Request | Response | Codes |
|---|---|---|---|---|---|
| GET | `/catalog/isps` | Public | — | `[{ "code","name","kind" }]` **[derived: isps.js:1–9]** | 200 |
| GET | `/catalog/isps/{code}/packages` | Public | path `code` | `[{ "id","name","down","up","price" }]` **[derived: isps.js:11–45]** | 200, 404 |
| GET | `/catalog/districts` | Public | `?division=` | `[{ "division","district" }]` **[derived: districts.js]** | 200 |

### 4.4 Tests (the core resource) **[maps: `finishTest`, history]**

| Method | Path | Auth | Request | Response | Codes |
|---|---|---|---|---|---|
| GET | `/tests/config` | Bearer | `?mode=quick\|full` | test stage timings + XP rules **[derived: App.jsx:179–312]** | 200 |
| POST | `/tests` | Bearer + `Idempotency-Key` | `TestSubmission` | `201 { entry: HistoryEntry, rewards: RewardDelta }` | 201, 401, 409, 422 |
| GET | `/tests` | Bearer | `?limit=&cursor=&district=&isp=&flagged=` | `{ data: HistoryEntry[], next_cursor }` **[maps: History.jsx]** | 200, 401 |
| GET | `/tests/{id}` | Bearer | path `id` | `HistoryEntry` **[maps: HistoryDetail]** | 200, 401, 404 |
| POST | `/tests/{id}/submit` | Bearer | `{}` | promote a partial/unsubmitted entry to evidence → `202 { submissionId }` | 202, 401, 404, 409 |

**`TestSubmission` (request) — what the client measures locally today**
```json
{
  "mode": "full",
  "ispCode": "DI", "pkgId": "di-50",
  "district": "Dhanmondi",
  "locationSource": "GPS", "networkType": "4G",
  "metrics": { "down": 46.4, "up": 10.9, "lat": 24, "jitter": 3, "loss": 0.1,
               "dns": 86, "webLoad": 1.4 },
  "partial": false,
  "clientTimestamp": "2026-05-30T23:39:00Z"
}
```

**`HistoryEntry` (response) [derived: `App.jsx:finishTest`, `seed.js:116–132`]**
Same fields as `srs.md` §4.4, with server-authoritative additions:
```jsonc
{
  "id": "h_…", "isoDate": "2026-05-30T23:39:00Z",
  "isp": "Dot Internet",
  "advertisedDown": 50, "advertisedUp": 10,
  "down": 46.4, "up": 10.9, "lat": 24, "jitter": 3, "loss": 0.1,
  "dns": 86, "webLoad": 1.4,
  "delivered": 93,                 // server-computed: round(down/advertisedDown*100)
  "district": "Dhanmondi", "networkType": "WiFi", "locationSource": "GPS",
  "submitted": true,
  "submissionId": "BD2026-4471",   // server-minted, immutable, evidence-grade
  "flagged": false,                // server rule: delivered < 70 && !partial
  "verdict": "excellent",          // server runs classifyReliability (reliability.js)
  "mode": "full", "partial": false
}
```

**`RewardDelta` (response) [derived: `App.jsx:310–316,155–161`]**
```json
{
  "xpGained": 35,
  "newXp": 485, "newLevel": 3, "leveledUp": false,
  "badgesUnlocked": [],
  "missionsAdvanced": [{ "id": "d1", "progress": 1, "completed": true }],
  "impact": { "en": "Your test joined 11 others in Dhanmondi this hour.", "bn": "…" }
}
```
> Server replicates the XP formula (Full 30 / Quick 10, +5 GPS, +50 flagged; partial
> 5) and the level-threshold check, returning the deltas the overlays animate.

### 4.5 Missions **[maps: Missions.jsx, seed.js:44–50]**

| Method | Path | Auth | Request | Response | Codes |
|---|---|---|---|---|---|
| GET | `/missions` | Bearer | `?kind=daily\|weekly\|milestone` | `[Mission]` with per-user `progress` | 200, 401 |
| POST | `/missions/{id}/claim` | Bearer | `{}` | `{ xpGained, newXp }` (claim completed reward) **[new]** | 200, 401, 409 |

`Mission` **[derived]**: `{ id, kind, title:{en,bn}, xp, progress, target, expiresAt }`
(localized `title` replaces `title_en/title_bn`; `expiresAt` becomes a real ISO time
instead of the static `"Today 23:59"`/`"3 days"` strings).

### 4.6 Badges **[maps: Badges.jsx, seed.js:52–103]**

| Method | Path | Auth | Request | Response | Codes |
|---|---|---|---|---|---|
| GET | `/badges` | Bearer | — | `[Badge]` with per-user `earned` + `progress` | 200, 401 |
| GET | `/badges/{id}` | Bearer | path `id` | `Badge` (incl. localized `story`) | 200, 401, 404 |

`Badge` **[derived]**: `{ id, name:{en,bn}, tier, earned, desc:{en,bn},
story:{en,bn}, metric, target, current, unit:{en,bn}, earnedOn? }`. Server evaluates
`metric` (e.g. `totalTests`, `districtsCovered`, `flagsAccepted`, `divisionsCovered`)
against `target` — today these are hard-coded `earned`/`current` values.

### 4.7 Leaderboard **[maps: Leaderboard.jsx, seed.js:105–114]**

| Method | Path | Auth | Request | Response | Codes |
|---|---|---|---|---|---|
| GET | `/leaderboard` | Bearer | `?scope=district\|division\|national&district=&division=&limit=&cursor=` | `{ data: [{ rank, handle, district, tests, xp, me }], me: {…}, next_cursor }` | 200, 401 |

> `scope=district\|division` reflects the two scopes the README lists for the
> Leaderboard screen. `handle` honors `publicProfile`/anon rules; `me` flags the
> caller's row (today `me:true` is baked into seed row 3).

### 4.8 Coverage map **[maps: Map.jsx, districts.js BD_DOTS]**

| Method | Path | Auth | Request | Response | Codes |
|---|---|---|---|---|---|
| GET | `/coverage/districts` | Bearer | `?division=` | `[{ division, district, x, y, tested, testedByMe, testCount }]` | 200, 401 |

> `x,y` are the map-plot coordinates already in `BD_DOTS`; `tested`/`testedByMe`
> become real aggregates across users instead of static booleans.

### 4.9 Complaints **[maps the currently dead submit button: Complaint.jsx:50]**

| Method | Path | Auth | Request | Response | Codes |
|---|---|---|---|---|---|
| POST | `/complaints` | Bearer + `Idempotency-Key` | `{ ispCode, reason, description, evidenceTestIds:[] }` | `201 { id:"C-2026-0418", status:"submitted" }` | 201, 401, 422 |
| GET | `/complaints` | Bearer | `?status=` | `[{ id, ispCode, reason, status, createdAt }]` | 200, 401 |
| GET | `/complaints/{id}` | Bearer | path `id` | full complaint + linked evidence | 200, 401, 404 |

> `reason ∈ {slow, outage, billing, other}` exactly matches the buttons in
> `Complaint.jsx:28`. Required: `reason` + `description` (the client already gates on
> both). `evidenceTestIds` realizes the "2 recent tests will be linked" copy and the
> `n2` notification "BTRC accepted your complaint as evidence" (`seed.js:141–146`).
> **This is the highest-value new endpoint** — the form exists but its submit button
> has no handler today.

### 4.10 Notifications **[maps: Inbox.jsx, seed.js:134–177]**

| Method | Path | Auth | Request | Response | Codes |
|---|---|---|---|---|---|
| GET | `/notifications` | Bearer | `?unreadOnly=&limit=&cursor=` | `{ data: [Notification], unreadCount }` | 200, 401 |
| POST | `/notifications/read` | Bearer | `{ "ids": ["n1"] }` or `{ "all": true }` | `204` | 204, 401 |

`Notification` **[derived]**: `{ id, kind, createdAt, read, title:{en,bn},
body:{en,bn}, deepLink }`. `kind ∈ {streak, regulatory, achievement, civic, mission,
test}` and `deepLink` (a screen id today) becomes a stable in-app route. Opening the
inbox calling `POST /notifications/read {all:true}` matches `openInbox` in
`App.jsx:84–87`.

---

## 5. Cross-cutting concerns

| Concern | Proposal | Why (vs. today) |
|---|---|---|
| **AuthN/Z** | OTP → JWT access (15 min) + rotating refresh; per-resource ownership checks. | No auth exists (`srs.md` NFR-5). |
| **Idempotency** | `Idempotency-Key` on `POST /tests` & `/complaints`; dedupe window 24 h → `409` on replay. | Client mints local IDs; server must dedupe real submissions. |
| **Rate limiting** | Per-user + per-IP token buckets; `429` + `Retry-After`. Tighter on `/auth/otp/*`. | Anti-abuse for evidence integrity. |
| **Validation** | Reject unknown `ispCode/pkgId`, out-of-range metrics, future timestamps → `422`. | No input validation today (`srs.md` FR-39). |
| **Anti-fraud** | Server-side plausibility checks on metrics, device attestation, geofencing of `district` vs IP. | Today metrics are trivially client-supplied. |
| **Privacy** | Enforce `consents`; anonymize handles unless `publicProfile`; `DELETE /users/me` for erasure. | Consent is captured but never enforced/transmitted. |
| **Pagination** | Cursor-based on `/tests`, `/leaderboard`, `/notifications`. | `localStorage` history grows unbounded (`srs.md` NFR-9). |
| **Caching** | `ETag`/`Cache-Control` on `/catalog/*`, `/coverage/*`. | Static catalogs are bundled today. |
| **Observability** | Request tracing + audit log on complaints/submissions (evidence chain). | None today. |
| **Async verification** | `POST /tests` may return `202` while server runs corroboration; status via `GET /tests/{id}`. | Client "submits" instantly to local state. |

---

## 6. Client migration impact (non-binding)

To adopt this API, the prototype would change as follows:

1. Replace `state/store.js` (`localStorage`) with an API client + a token store;
   keep `localStorage` only as an offline cache.
2. Move XP/level/streak/badge/flag logic out of `App.jsx` (`finishTest`,
   level-up `useEffect`) and consume `RewardDelta` from `POST /tests`.
3. Replace seed imports (`HISTORY_SEED`, `LEADERBOARD`, `NOTIFICATIONS_SEED`, etc.)
   with the corresponding GET endpoints; keep them as fixtures/mocks for tests.
4. Wire the Complaint submit button to `POST /complaints` (today it has no handler).
5. Add the auth/OTP screens implied by the `fresh` persona.
6. Replace the simulated `runTest` timeline with a real measurement module that
   posts results to `POST /tests` — the `tests/config` endpoint can still drive the
   gauge UX.
7. Keep `t(lang, en, bn)` but prefer server-localized strings (`Accept-Language`).

---

## 7. Open questions for stakeholders

1. **Measurement method:** real client-side speed test (download/upload against
   measurement servers) vs. on-device agent? Determines `TestSubmission` trust model.
2. **Identity:** phone-only OTP, or BTRC/national ID linkage for "evidence-grade"
   complaints? Affects anonymity guarantees.
3. **Evidence workflow:** does a flagged test auto-create a regulatory case, or only
   on explicit complaint? (`n2`/`n6` notifications imply auto-acceptance.)
4. **Leaderboard fairness:** how to prevent farming given `+50 XP` for flagged tests?
5. **Data retention & erasure** scope for `DELETE /users/me`.
6. **District model:** reconcile the 64-district claim, the 65 `BD_DOTS` entries
   (incl. Dhaka sub-areas Dhanmondi/Mirpur), and the 20-name `DISTRICTS` subset.

---

*This is a design proposal. Every schema and endpoint was reverse-mapped from
existing client data structures and behaviors in `qos-app/src`; none of it is
present in the current build. Treat it as the target contract for a backend, to be
ratified before implementation.*
