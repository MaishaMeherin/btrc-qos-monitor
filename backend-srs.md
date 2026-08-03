# BTRC QoS Monitor — Backend Software Requirements Specification

Build spec for the production backend behind the gamified BTRC QoS Monitor. It replaces the prototype's static mock JSON and local simulation with real auth, server-measured tests, scoring, aggregation, and the geohash-backed map. Grounded entirely in the current `qos-app/src` prototype.

Modules: (1) Users, auth & profiles · (2) Speed-test capture · (3) Coverage-gap engine · (4) Missions · (5) Leaderboards · (6) Rewards & redemption · (7) Map data services · (8) Badges & achievements · (9) Complaints & evidence · (10) Notifications · (11) Anti-fraud & data integrity.

---

## 1. Purpose & scope

BTRC QoS Monitor is a civic, gamified internet-quality app for Bangladesh. Citizens run **server-measured** speed tests; results become anonymised regulatory evidence for the BTRC and feed a national quality map. Gamification (XP, levels, streaks, missions, badges, leaderboards, redeemable rewards) drives participation.

**This document specifies the backend** — the API surface, data model, scoring engine, async pipelines, and integrity controls — that the existing React frontend will call instead of its current `localStorage` + mock JSON. The frontend (screens, copy, EN/BN) already exists and is not re-specified.

**In scope:** all eleven modules above; the four fixed map endpoints (Appendix A); phone-OTP onboarding; server-side measurement orchestration; XP/streak/level/coverage math exactly as the prototype computes it; complaints, notifications, badges; anti-fraud (VPN, mock-location, evidence integrity).

**Out of scope:** the mobile/web UI; ISP billing beyond reward-pack fulfilment; BTRC internal complaint adjudication tooling; the prototype's demo panel / forced-state simulator; raffles (the store is guaranteed-reward only).

---

## 2. System overview

**Core loop:** create account (phone → OTP) → grant consents + pick ISP/plan → run a **server-measured** Quick or Full QoS test → backend records the server-observed metrics, scores delivered % + reliability verdict, awards XP, advances missions/streak, lights the cell → climb the district leaderboard, earn badges, flag underperformance as evidence, redeem XP for internet/voice/SMS packs.

**Components:**

| Component | Role |
|---|---|
| **API** | Django + DRF; stateless, token-auth, JSON/HTTPS. |
| **Async workers** | Celery: cell/district aggregation, leaderboard counters, badge evaluation, fraud scoring, mission rollover, notification fan-out, complaint evidence linking. |
| **Cache / broker** | Redis: cache, Celery broker, leaderboard counter store, OTP store, rate-limit buckets. |
| **DB** | PostgreSQL + PostGIS: durable data + geo queries (district point-in-polygon, geohash, teleport distance). |
| **Measurement servers (PoPs)** | Dedicated HTTP download/upload servers, regional. They observe and report throughput server-to-server; the client never submits its own Mbps. |
| **SMS provider** | Delivers 6-digit OTP codes. |
| **Map tiles** | Self-hosted Protomaps `.pmtiles` served to the existing Leaflet map. |
| **Committed BD GeoJSON** | District/division boundaries (`ADM2_EN` keys) for aggregation and the map. |

---

## 3. Functional requirements

### Module 1 — Users, auth & profiles
- **FR-1** Register via phone: accept a BD (or selected country-code) mobile number and issue a 6-digit SMS OTP challenge.
- **FR-2** OTP challenges expire in 120 s; support resend (allowed after a cooldown) and reject expired/used codes.
- **FR-3** On OTP verify, create or resume the account and issue a short-lived access token + rotating refresh token.
- **FR-4** Accounts are **anonymous contributors**; default `display_name` is `Anon · <ISP-code>` (e.g. `Anon · DI`).
- **FR-5** Persist three consents — `location` (required), `anon` (required), `device` (optional, default on); the two required consents gate test submission.
- **FR-6** Store the user's selected ISP + package (from the BTRC catalog) for advertised-vs-delivered comparison.
- **FR-7** Expose `GET /api/me`: profile, XP, level + title, `xp_to_next`, streak, and lifetime impact stats.
- **FR-8** Compute `level` (1–6) from cumulative XP via fixed thresholds 0/100/300/600/1000/2000 → titles New Contributor, Signal Seeker, Signal Scout, District Watcher, QoS Champion, National Verifier.
- **FR-9** Maintain `streak_days` = consecutive Asia/Dhaka days with ≥1 valid test; reset to 0 after a missed day. Failed/partial tests do **not** break the streak.
- **FR-10** Maintain lifetime stats: `total_tests`, `tests_this_month`, `districts_covered`, `isps_tested`, `places_explored`, `flags_raised`, `district_rank`, `in_district_rank`.
- **FR-11** `places_explored` = count of distinct geohash **precision-6** (~1.2 km) cells the user has tested from (distinct from the precision-5 coverage cell).
- **FR-12** Allow profile edits: `display_name` (≤24 chars), `public_profile`, `lang` (en/bn), `theme` (light/dark), `notif_pref` (all/issues/none), ISP, package, location mode (GPS/manual + district).
- **FR-13** When `public_profile=false`, the user appears on leaderboards only under an anonymised ISP-tagged handle.
- **FR-14** Support account access revocation / data erasure on request (revocable "contributor access").

### Module 2 — Speed-test capture (server-measured)
- **FR-15** `POST /api/tests/initiate` allocates a measurement **session** (server `session_token`, PoP target URLs, expiry), bound to user + device, for the chosen mode.
- **FR-16** Two modes: **Quick** (download/upload speed only) and **Full QoS** (all six parameters: download, upload, ping, jitter, packet loss, latency) — Full QoS is the BTRC evidence-grade test.
- **FR-17** The client **never** submits Mbps; `/api/tests/submit` records only the metrics the measurement PoP observed for that `session_token`.
- **FR-18** Reject submit when the session is unknown, expired, already consumed, or has no PoP-reported result.
- **FR-19** On submit, resolve `district` (point-in-polygon), geohash-5 coverage cell, and geohash-6 place from the measured location; persist the test with all metrics, ISP/package snapshot, network type, and location source.
- **FR-20** Compute `delivered_pct = round(download_mbps / advertised_down × 100)` (advertised from the user's package; fallback 50 Mbps if unset).
- **FR-21** Compute the reliability **verdict** via the fixed formula (§Glossary / FR-22): `excellent | good | poor | unstable`.
- **FR-22** Verdict score = `ratio·60 + max(0,(60−lat)/60)·15 + max(0,(10−jitter)/10)·15 + max(0,(2−loss)/2)·10`, where `ratio = down/advertised` (0.8 if no advertised); ≥80 excellent, ≥60 good, ≥35 poor, else unstable.
- **FR-23** **Flag** a test as a package mismatch when `delivered_pct < 70` and the test is not partial; flagged tests are saved as BTRC evidence and earn bonus XP.
- **FR-24** Award XP per completed test: base **30** (Full) or **10** (Quick); **+5** if location source is GPS; **+50** if flagged.
- **FR-25** If the test's geohash-5 cell is an **active bounty**, multiply the test's XP by the cell's `xp_multiplier` (`round(1 + 2·gap, 1)`).
- **FR-26** Return on submit: measured metrics, `delivered_pct`, `verdict`, `flagged`, `xp_awarded`, `contribution`/`accuracy` deltas, `cell_newly_lit`, level-up (if any), and `missions_advanced`.
- **FR-27** Mint an immutable evidence reference `submission_id` (format `BD2026-####`) for every submitted (non-partial) test.
- **FR-28** Support **partial results**: a test interrupted mid-measurement may be saved with whatever was captured, marked `partial`, awarded a flat **5 XP**, stored locally-only semantics (`submitted=false`, no `submission_id`), and **not** counted as BTRC evidence.
- **FR-29** Support **offline / deferred sync**: a captured result may be submitted later (e.g. after `serverDown`); submission is idempotent per `session_token` so retries never double-award.
- **FR-30** `GET /api/tests/history` returns the caller's tests (newest first) with server-side filters: flagged-only, ISP, district, date range (7d/30d/90d/all), and pagination.
- **FR-31** `GET /api/tests/{id}` returns one test's full detail, including verdict, use-case suitability, advertised-vs-delivered, and submission/pending status.

### Module 3 — Coverage-gap engine
- **FR-32** A **coverage cell** = geohash precision 5 (~5 km). Each accepted test increments its cell's `sample_count` and updates the running `avg_download_mbps` and centroid.
- **FR-33** Per cell, `gap = max(0, (target − sample_count) / target)` against a coverage `target` (default 20).
- **FR-34** Per cell, `xp_multiplier = round(1 + 2·gap, 1)` (range 1.0–3.0).
- **FR-35** **Bounties** = cells with `gap > 0`, ranked by `gap` descending; serve the top N (default 15), optionally re-ranked by proximity to a supplied `lat/lng`.
- **FR-36** A test in a bounty cell triggers the XP multiplier (FR-25) and advances the test there.
- **FR-37** Allow admin configuration of the per-cell/region coverage `target`.

### Module 4 — Missions
- **FR-38** Serve the user's active missions grouped as **Daily**, **Weekly**, and **Milestone (Collections)**, each tagged with a data `dimension` (time / place / network / depth / continuity) and a localized `why` rationale.
- **FR-39** Support **simple** missions: integer `progress` toward `target` (e.g. "Complete 5 Full QoS tests", "Test for 30 days").
- **FR-40** Support **windowed** missions: time-of-day slots with `start`/`end` hours (Asia/Dhaka). A slot is `done`, `active` (claimable now), `upcoming` (locked until start), or `missed` (closed for the period). Completion requires testing inside each slot.
- **FR-41** Support **collection** missions of `type` place / district / isp: track the set of distinct geohash-6 places, districts, or ISPs the user has tested; a slot becomes claimable when the user is at a new place/district or connected to a new ISP.
- **FR-42** Advance mission progress automatically on qualifying test events; mark `completed` when `progress ≥ target`.
- **FR-43** `POST /api/missions/{id}/claim` grants a completed (or slot-claimable) mission's XP once and marks it `claimed`; reject if incomplete, already claimed, or its window/period is closed.
- **FR-44** Award mission XP per the mission's `xp` reward (subject to anti-abuse caps, §11).
- **FR-45** Roll daily/weekly/monthly missions over at their Asia/Dhaka period boundaries via a scheduled worker.
- **FR-46** Emit a mission-complete event (drives the client's completion overlay + a notification).

### Module 5 — Leaderboards
- **FR-47** The leaderboard is one hierarchy at three zoom levels: **People** (within an area), **Areas** (within a district), **Districts** (national). Default window: **This month**.
- **FR-48** The ranking metric is **verified tests contributed** (`value`), aggregated per person, per area, and per district.
- **FR-49** `GET /api/leaderboard/districts/` ranks districts nationally; each row carries an areas-covered subtitle.
- **FR-50** `GET /api/leaderboard/areas/?district=` ranks areas within a district; each row carries a contributors-count subtitle.
- **FR-51** `GET /api/leaderboard/people/?area=` ranks people within an area; rows flag the caller (`is_me`).
- **FR-52** `GET /api/leaderboard/me/` returns the caller's rank within their area and district.
- **FR-53** People rows show anonymised ISP-tagged handles unless the user has `public_profile=true`.
- **FR-54** Back rankings with a fast Redis counter store updated incrementally per accepted test, with periodic durable snapshots.

### Module 6 — Rewards & redemption
- **FR-55** Serve the reward catalog (XP store) with categories **internet** (data packs, e.g. 500 MB / 1 GB / 2 GB with validity), **voice** (minutes), and **SMS** bundles; each item has an XP `cost`, validity, and category.
- **FR-56** A reward is redeemable when the user's spendable XP ≥ `cost`; otherwise it is shown locked with the XP shortfall.
- **FR-57** `POST /api/rewards/{id}/redeem` atomically debits XP and creates a redemption (a fulfilment record for a BTRC partner operator pack); never allow negative spendable XP.
- **FR-58** Reject redemption when XP is insufficient (402) or the item is inactive/out of stock (409).
- **FR-59** `GET /api/rewards/redemptions/` returns the caller's redemption history with status (pending/fulfilled/failed) and any voucher/pack code.
- **FR-60** Track two XP balances: `xp_total` (lifetime, drives level) and `xp_spendable` (wallet, reduced by redemptions). *(The prototype conflates these into one `xp`; the backend separates them so redemptions don't lower the user's level.)*

### Module 7 — Map data services *(FIXED shapes — Appendix A)*
- **FR-61** `GET /api/map/districts/` returns per-district aggregates with `health` derived as ≥80 Good / 40–79 Fair / <40 Poor and `lit_for_user` (true if the caller has any test in that district) — the "District Speed" + "District coverage (fog-of-war)" layers.
- **FR-62** `GET /api/map/cells/` returns aggregated geohash-5 cells (centroid, sample count, avg download) — never individual coordinates.
- **FR-63** `GET /api/map/me/tests/` returns the authenticated caller's own precise test points (the "Places explored" layer) — owner-only.
- **FR-64** `GET /api/map/bounties/?lat=&lng=` returns nearby high-gap cells with `gap` and `xp_multiplier` (the "Bounties" layer).
- **FR-65** All four responses MUST match the fixed contracts (Appendix A) and are cacheable; community layers expose only aggregates.

### Module 8 — Badges & achievements
- **FR-66** Serve all badges (9 across tiers bronze/silver/gold/platinum) with localized name/description/story, tier, `metric`, `target`, the user's `current` value, `earned`, and `earned_on`.
- **FR-67** Evaluate each badge's `metric` (`total_tests`, `districts_covered`, `isps_tested`, `night_tests`, `flags_accepted`, `divisions_covered`, `first_responder`) against its `target`; expose progress = `current/target`.
- **FR-68** Some badges are **non-farmable / server-awarded** (e.g. First Responder — earliest verified report of a regional outage; National Verifier — all 8 divisions); award these from server-side verification, never from client claims.
- **FR-69** Re-evaluate badges asynchronously after each accepted test; emit a badge-earned event (drives overlay + notification) on first unlock.
- **FR-70** `GET /api/badges/{id}` returns one badge's full detail incl. story and progress.

### Module 9 — Complaints & evidence
- **FR-71** `POST /api/complaints/` files a complaint with the user's ISP (server-resolved), a `reason` (slow / outage / billing / other), and a required free-text `description`.
- **FR-72** Auto-attach recent tests (default 2 most recent from the relevant district) as linked evidence.
- **FR-73** On BTRC acceptance of a complaint as evidence, award **+40 XP**, increment `flags_raised` / `flags_accepted`, and notify the user; assign a complaint id (format `C-2026-####`).
- **FR-74** `GET /api/complaints/` and `GET /api/complaints/{id}` return the caller's complaints with status and linked evidence.

### Module 10 — Notifications
- **FR-75** Serve the caller's notifications with `kind` (streak / mission / achievement / civic / regulatory / test), localized title/body, timestamp, `read`, and a `deep_link` (in-app target).
- **FR-76** `POST /api/notifications/read` marks listed ids (or all) read; opening the inbox marks all read.
- **FR-77** Generate notifications for streak-at-risk, mission progress/complete, badge/level-up, district civic nudges, complaint acceptance, and flagged-test events.
- **FR-78** Honour `notif_pref`: `all` (everything), `issues` (mismatches + nearby outages only), `none` (mute push).

### Module 11 — Anti-fraud & data integrity
- **FR-79** Reject measurement when a **VPN/proxy** is detected; require a Bangladeshi network path (the app refuses to measure through a VPN).
- **FR-80** Reject submissions flagged as **mock location** (`isFromMockProvider`).
- **FR-81** Detect and reject **teleport**: an implausible location jump vs. the user's recent measured positions.
- **FR-82** Require a valid mobile **integrity attestation** (Play Integrity / App Attest) on initiate; deny sessions that fail.
- **FR-83** Rate-limit initiate/submit per user per cell per window (429 on breach); support an optional configurable **daily XP cap** as an anti-abuse safeguard.
- **FR-84** Run an **async fraud-scoring pass** on each accepted test; high scores enqueue admin review and may trigger XP/redemption **clawback** with a full audit trail.
- **FR-85** Provide an admin fraud-review queue: list flagged tests, accept/reject, apply clawback.
- **FR-86** Enforce **data sovereignty**: tests are stored in Bangladesh under BTRC oversight; no personal identifiers leave the device beyond the anonymised, consented payload.
- **FR-87** Community map/leaderboard surfaces expose only aggregates and anonymised handles; precise per-user points are owner-only (FR-63).

---

## 4. API endpoints

Base path `/api`. Auth via `Authorization: Bearer <access_token>`. JSON/HTTPS. Collections paginate with `?limit=` (default 20, max 100) + `?cursor=`. `Accept-Language: en | bn` selects localized strings. Mutating POSTs accept `Idempotency-Key`. Errors use problem+json with the listed codes.

### Module 1 — Users, auth & profiles

#### POST /api/auth/otp/request
- Auth: none
- Purpose: Send a 6-digit SMS OTP to a phone number.
- Request: `{ "country_code": "+880", "phone": "1XXXXXXXXX" }`
- Response 200: `{ "challenge_id": "…", "expires_in": 120 }`
- Errors: 422 invalid number; 429 too many requests / resend cooldown.

#### POST /api/auth/otp/verify
- Auth: none
- Purpose: Verify the OTP; create or resume the account; return tokens.
- Request: `{ "challenge_id": "…", "code": "123456" }`
- Response 200: `{ "user": User, "access_token": "…", "refresh_token": "…", "is_new": true }`
- Errors: 401 wrong code; 410 expired/used challenge; 429.

#### POST /api/auth/refresh
- Auth: none (refresh token in body)
- Purpose: Rotate tokens.
- Request: `{ "refresh_token": "…" }`
- Response 200: `{ "access_token": "…", "refresh_token": "…" }`
- Errors: 401 invalid/expired refresh token.

#### POST /api/auth/logout
- Auth: user
- Purpose: Revoke the refresh token.
- Request: `{ "refresh_token": "…" }`
- Response 200: `{ "ok": true }`
- Errors: 401.

#### GET /api/me
- Auth: user
- Purpose: Profile + XP + level + streak + lifetime stats.
- Request: —
- Response 200: `User` = `{ "id", "display_name", "public_profile", "xp_total", "xp_spendable", "xp_to_next", "level", "level_title", "streak_days", "total_tests", "tests_this_month", "districts_covered", "isps_tested", "places_explored", "flags_raised", "district_rank", "in_district_rank", "total_districts", "isp_code", "pkg_id", "consents": { "location", "anon", "device" }, "lang", "theme", "notif_pref", "location_mode", "manual_district", "joined_on" }`
- Errors: 401.

#### PATCH /api/me
- Auth: user
- Purpose: Update profile/settings.
- Request: partial `{ "display_name"?, "public_profile"?, "lang"?, "theme"?, "notif_pref"?, "isp_code"?, "pkg_id"?, "location_mode"?, "manual_district"? }`
- Response 200: `User`
- Errors: 401; 422 (e.g. `display_name` >24 chars, unknown isp/pkg).

#### PUT /api/me/consents
- Auth: user
- Purpose: Set consents.
- Request: `{ "location": bool, "anon": bool, "device": bool }`
- Response 200: `{ "location", "anon", "device" }`
- Errors: 401; 422 if a required consent (`location`/`anon`) is withdrawn while tests depend on it.

#### DELETE /api/me
- Auth: user
- Purpose: Revoke access and erase the account's data.
- Request: —
- Response 200: `{ "ok": true }`
- Errors: 401.

### Catalog

#### GET /api/catalog/isps
- Auth: none
- Purpose: BTRC-verified ISP list.
- Request: —
- Response 200: `[{ "code": "DI", "name": "Dot Internet", "kind": "Broadband · Dhaka" }]`
- Errors: —

#### GET /api/catalog/isps/{code}/packages
- Auth: none
- Purpose: An ISP's BTRC-catalog plans.
- Request: path `code`
- Response 200: `[{ "id": "di-50", "name": "Home Standard", "down": 50, "up": 10, "price": 1200 }]`
- Errors: 404 unknown ISP.

#### GET /api/catalog/districts
- Auth: none
- Purpose: District (and division) list for manual location.
- Request: `?division=` *(optional)*
- Response 200: `[{ "district": "Dhaka", "division": "Dhaka" }]`
- Errors: —

### Module 2 — Speed-test capture

#### POST /api/tests/initiate
- Auth: user
- Purpose: Allocate a server-measured session + PoP targets.
- Request: `{ "mode": "quick|full", "lat": 23.81, "lng": 90.41, "location_mode": "gps|manual", "manual_district"?: "Dhanmondi", "isp_code": "DI", "pkg_id": "di-50", "network_type": "wifi|4g|5g", "device": { "platform": "android|ios", "integrity_token": "…", "is_mock_location": false } }`
- Response 200: `{ "session_token": "…", "expires_at": "ISO", "targets": [{ "pop_id": "dhk-1", "download_url": "…", "upload_url": "…" }], "duration_s": 22 }`
- Errors: 401; 403 consent/integrity/VPN/mock-location failure (FR-79/80/82); 422 bad coords/isp/pkg; 429 per-cell rate limit.

#### POST /api/tests/submit
- Auth: user
- Purpose: Finalize a session; record **server-observed** throughput; return result + rewards.
- Request: `{ "session_token": "…", "partial": false }` *(no client Mbps — server reads the PoP result; `partial:true` saves whatever was captured)*
- Response 200: `{ "test_id", "submission_id"?: "BD2026-4471", "mode", "download_mbps", "upload_mbps", "latency_ms", "jitter_ms", "loss_pct", "dns_ms"?, "web_load_s"?, "delivered_pct", "verdict": "excellent|good|poor|unstable", "flagged": false, "district", "geohash5", "geohash6", "network_type", "location_source", "submitted": true, "partial": false, "xp_awarded": 35, "xp_total", "contribution": 1, "accuracy": 1, "cell_newly_lit": true, "leveled_up": false, "level"?, "level_title"?, "missions_advanced": [{ "id", "progress", "target", "completed" }] }`
- Errors: 401; 404 unknown session; 409 expired/consumed/no-PoP-result; 422 location/integrity mismatch; 429.

#### GET /api/tests/history
- Auth: user
- Purpose: Paginated, filterable test history (newest first).
- Request: `?flagged=true&isp=&district=&range=7d|30d|90d|all&limit=&cursor=`
- Response 200: `{ "data": [{ "test_id", "when", "created_at", "isp", "advertised_down", "advertised_up", "down", "up", "lat", "jitter", "loss", "delivered_pct", "district", "network_type", "location_source", "flagged", "submitted", "submission_id" }], "total", "next_cursor" }`
- Errors: 401.

#### GET /api/tests/{id}
- Auth: user
- Purpose: Full detail for one test.
- Request: path `id`
- Response 200: full test object incl. `verdict`, `use_cases: { gaming, video, streaming }`, `dns_ms`, `web_load_s`.
- Errors: 401; 404; 403 not owner.

### Module 7 — Map data services *(FIXED — Appendix A)*

#### GET /api/map/districts/
- Auth: user
- Purpose: District speed + coverage (fog-of-war) layers.
- Request: —
- Response 200: `[{ "name": "Dhaka", "avg_download_mbps": 92.4, "sample_count": 410, "health": "Good", "lit_for_user": true }]`  *(`health`: ≥80 Good, 40–79 Fair, <40 Poor; `lit_for_user` from the caller)*
- Errors: 401.

#### GET /api/map/cells/
- Auth: user
- Purpose: Aggregated geohash-5 cells (no individual points).
- Request: `?bbox=minLng,minLat,maxLng,maxLat` *(optional)*
- Response 200: `[{ "geohash5": "wh0r2", "lat": 23.81, "lng": 90.41, "sample_count": 37, "avg_download_mbps": 88.1 }]`
- Errors: 401.

#### GET /api/map/me/tests/
- Auth: user
- Purpose: The caller's own precise test points (My Map only).
- Request: `?limit=&cursor=`
- Response 200: `[{ "lat": 23.75, "lng": 90.39, "download_mbps": 95.2, "created_at": "2026-05-30T19:12:00Z" }]`
- Errors: 401.

#### GET /api/map/bounties/?lat=&lng=
- Auth: user
- Purpose: Nearby high-gap cells worth bonus XP, ranked by proximity.
- Request: `?lat=&lng=` (required); `?limit=` (optional, default 15)
- Response 200: `[{ "geohash5": "wh0qz", "lat": 22.19, "lng": 92.21, "gap": 0.85, "xp_multiplier": 2.7 }]`
- Errors: 401; 422 missing/invalid lat or lng.

### Module 4 — Missions

#### GET /api/missions/
- Auth: user
- Purpose: Active Daily / Weekly / Milestone missions + their slots for the caller.
- Request: `?kind=daily|weekly|milestone` *(optional)*
- Response 200: `[{ "id", "kind", "dimension", "icon", "title", "why", "xp", "progress", "target", "completed", "claimed", "expires", "windows"?: [{ "key", "label", "start", "end", "state": "done|active|upcoming|missed" }], "type"?: "places|districts|isps", "collected"?: ["Dhaka", "Gazipur"] }]`
- Errors: 401.

#### POST /api/missions/{id}/claim
- Auth: user
- Purpose: Claim a completed / slot-claimable mission's XP (once).
- Request: `{ "window_key"?: "morning" }` *(slot key for windowed missions)*
- Response 200: `{ "xp_awarded", "xp_total", "completed", "claimed" }`
- Errors: 401; 404 unknown mission; 409 incomplete / already claimed / window closed.

### Module 5 — Leaderboards

#### GET /api/leaderboard/districts/
- Auth: user
- Purpose: Districts ranked nationally by verified tests contributed.
- Request: `?window=month|all&limit=&cursor=`
- Response 200: `{ "scope": "districts", "place": "Bangladesh", "window": "month", "data": [{ "rank", "name": "Dhaka", "sub": "38 areas covered", "value": 9420, "is_me": true }] }`
- Errors: 401.

#### GET /api/leaderboard/areas/?district=
- Auth: user
- Purpose: Areas ranked within a district.
- Request: `?district=Dhaka` (required); `?window=&limit=&cursor=`
- Response 200: `{ "scope": "areas", "place": "Dhaka", "data": [{ "rank", "name": "Dhanmondi", "sub": "142 contributors", "value": 1240, "is_me": true }] }`
- Errors: 401; 404 unknown district.

#### GET /api/leaderboard/people/?area=
- Auth: user
- Purpose: People ranked within an area.
- Request: `?area=Dhanmondi` (required); `?window=&limit=&cursor=`
- Response 200: `{ "scope": "people", "place": "Dhanmondi", "data": [{ "rank", "name": "Anon · AG", "value": 412, "is_me": false }] }`
- Errors: 401; 404 unknown area.

#### GET /api/leaderboard/me/
- Auth: user
- Purpose: The caller's rank within their area and district.
- Request: `?window=` *(optional)*
- Response 200: `{ "window": "month", "value": 87, "area": { "name": "Dhanmondi", "rank": 3 }, "district": { "name": "Dhaka", "rank": 18, "in_district_rank": 3 } }`
- Errors: 401.

### Module 6 — Rewards & redemption

#### GET /api/rewards/
- Auth: user
- Purpose: XP-store catalog + affordability.
- Request: `?cat=all|internet|voice|sms` *(optional)*
- Response 200: `{ "xp_spendable": 450, "data": [{ "id": "p1", "cat": "internet", "title": "1 GB", "sub": "Mobile data", "validity": "3 days", "cost": 280, "can_afford": true, "stock": null, "active": true }] }`
- Errors: 401.

#### POST /api/rewards/{id}/redeem
- Auth: user
- Purpose: Redeem an item; atomically debit spendable XP; issue a fulfilment record.
- Request: `{}`
- Response 200: `{ "redemption_id", "reward_id", "title", "xp_debited", "xp_spendable", "status": "pending|fulfilled", "voucher_code"? }`
- Errors: 401; 402 insufficient XP; 404 unknown reward; 409 inactive/out of stock.

#### GET /api/rewards/redemptions/
- Auth: user
- Purpose: The caller's redemption history.
- Request: `?status=&limit=&cursor=`
- Response 200: `{ "data": [{ "redemption_id", "reward_id", "title", "cat", "xp_debited", "status", "voucher_code"?, "created_at" }], "next_cursor" }`
- Errors: 401.

### Module 8 — Badges

#### GET /api/badges/
- Auth: user
- Purpose: All badges with the caller's earned/progress state.
- Request: —
- Response 200: `[{ "id", "name", "tier", "earned", "desc", "story", "metric", "target", "current", "unit", "earned_on"? }]`
- Errors: 401.

#### GET /api/badges/{id}
- Auth: user
- Purpose: One badge's full detail + progress.
- Request: path `id`
- Response 200: badge object as above.
- Errors: 401; 404.

### Module 9 — Complaints

#### POST /api/complaints/
- Auth: user
- Purpose: File a complaint with auto-attached test evidence.
- Request: `{ "reason": "slow|outage|billing|other", "description": "…", "evidence_test_ids"?: ["…"] }`
- Response 200: `{ "complaint_id": "C-2026-0418", "status": "submitted", "evidence_count": 2 }`
- Errors: 401; 422 missing reason/description.

#### GET /api/complaints/  ·  GET /api/complaints/{id}
- Auth: user
- Purpose: List / detail the caller's complaints.
- Request: `?status=` / path `id`
- Response 200 (list): `[{ "complaint_id", "isp", "reason", "status", "created_at" }]`; (detail) adds `description`, linked evidence tests, and acceptance/XP outcome.
- Errors: 401; 404.

### Module 10 — Notifications

#### GET /api/notifications/
- Auth: user
- Purpose: The caller's inbox.
- Request: `?unread_only=&limit=&cursor=`
- Response 200: `{ "data": [{ "id", "kind", "when", "read", "title", "body", "deep_link" }], "unread_count" }`
- Errors: 401.

#### POST /api/notifications/read
- Auth: user
- Purpose: Mark notifications read.
- Request: `{ "ids": ["n1"] }` or `{ "all": true }`
- Response 200: `{ "unread_count": 0 }`
- Errors: 401.

### Internal / admin *(light)*

#### GET /api/admin/coverage-targets/  ·  PUT /api/admin/coverage-targets/{geohash5}
- Auth: admin
- Purpose: Read/configure per-cell/region coverage `target` (FR-37).
- Request (PUT): `{ "target": 20 }`
- Response 200: `{ "geohash5", "target", "updated_at" }`
- Errors: 401; 403; 422.

#### GET /api/admin/fraud-queue/  ·  POST /api/admin/fraud-queue/{test_id}/resolve
- Auth: admin
- Purpose: Review flagged tests; accept/reject; clawback (FR-84/85).
- Request (POST): `{ "action": "accept|reject", "clawback": true, "note": "…" }`
- Response 200 (POST): `{ "test_id", "resolution", "xp_clawed_back", "resolved_at" }`
- Errors: 401; 403; 404; 409 already resolved.

#### POST /api/admin/complaints/{id}/accept *(BTRC adjudication hook)*
- Auth: admin
- Purpose: Accept a complaint as evidence → +40 XP + notify (FR-73).
- Request: `{ "note"?: "…" }`
- Response 200: `{ "complaint_id", "status": "accepted", "xp_awarded": 40 }`
- Errors: 401; 403; 404; 409.

---

## 5. Data model

PostgreSQL + PostGIS. PK = `id` (UUID) unless noted. `idx` = index, `fk` = foreign key, `uq` = unique.

### user
| Field | Type | Notes |
|---|---|---|
| id | uuid | PK |
| phone | citext | uq (`country_code`+number); the only PII, never exposed |
| display_name | text | ≤24 chars; default `Anon · <isp_code>`; anonymised on boards unless `public_profile` |
| public_profile | bool | default false |
| xp_total | bigint | lifetime XP; drives level; **idx** |
| xp_spendable | bigint | wallet (earned − redeemed) |
| level | int | derived from `xp_total` via `level_threshold` |
| streak_days | int | consecutive Asia/Dhaka days with a valid test |
| last_test_date | date | Asia/Dhaka; drives streak + GPS-bonus eligibility |
| total_tests / tests_this_month | int | lifetime stats |
| districts_covered / isps_tested / places_explored / flags_raised | int | lifetime stats |
| isp_code | text | fk → isp.code |
| pkg_id | text | fk → package.id |
| consents | jsonb | `{location, anon, device}` |
| lang / theme / notif_pref | text | en\|bn · light\|dark · all\|issues\|none |
| location_mode | text | gps \| manual |
| manual_district | text | fk → district.name (when manual) |
| joined_on | date | |
| created_at | timestamptz | |

### auth_otp *(ephemeral — Redis preferred, table optional)*
| Field | Type | Notes |
|---|---|---|
| challenge_id | uuid | PK |
| phone | citext | target number |
| code_hash | text | hashed 6-digit code |
| expires_at | timestamptz | +120 s |
| consumed | bool | single-use |
| attempts | int | lockout guard |

### device
| Field | Type | Notes |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | fk → user; **idx** |
| platform | text | android \| ios |
| integrity_verified | bool | last Play Integrity / App Attest result |
| last_seen_at | timestamptz | |
| uq | | (user_id, fingerprint) |

### isp
| Field | Type | Notes |
|---|---|---|
| code | text | PK (e.g. `GP`, `DI`) |
| name | text | e.g. GrameenPhone |
| kind | text | e.g. `Broadband · Dhaka` |

### package
| Field | Type | Notes |
|---|---|---|
| id | text | PK (e.g. `di-50`) |
| isp_code | text | fk → isp.code; **idx** |
| name | text | e.g. Home Standard |
| advertised_down / advertised_up | int | Mbps |
| price_bdt | int | monthly |

### measurement_session
| Field | Type | Notes |
|---|---|---|
| id | uuid | PK |
| session_token | text | uq; opaque, short-lived |
| user_id | uuid | fk → user; **idx** |
| device_id | uuid | fk → device |
| mode | text | quick \| full |
| location | geography(Point,4326) | requested test location |
| pop_id | text | fk → pop.id |
| status | text | allocated → measured → consumed / expired |
| measured_download_mbps / measured_upload_mbps | numeric | **PoP-reported only** |
| latency_ms / jitter_ms / loss_pct / dns_ms / web_load_s | numeric | PoP-reported |
| vpn_detected / mock_location | bool | integrity flags at initiate |
| expires_at / created_at | timestamptz | |

### test
| Field | Type | Notes |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | fk → user; **idx** |
| session_id | uuid | fk → measurement_session; uq (idempotent submit) |
| mode | text | quick \| full |
| location | geography(Point,4326) | **GiST idx** (teleport / My-Map) |
| geohash5 | char(5) | coverage cell; **idx** |
| geohash6 | char(6) | place (~1.2 km); **idx** |
| cell_id | uuid | fk → coverage_cell; **idx** |
| district | text | fk → district.name; **idx** |
| isp_code / pkg_id | text | fk |
| network_type | text | wifi \| 4g \| 5g |
| location_source | text | GPS \| Manual |
| download_mbps / upload_mbps / latency_ms / jitter_ms / loss_pct / dns_ms / web_load_s | numeric | from session (PoP) |
| advertised_down | int | snapshot at test time |
| delivered_pct | int | `round(down/advertised·100)` |
| verdict | text | excellent \| good \| poor \| unstable |
| flagged | bool | `delivered_pct < 70 && !partial` |
| partial | bool | interrupted; local-only, not evidence |
| submitted | bool | `!partial` |
| submission_id | text | `BD2026-####`; null if partial |
| xp_awarded | int | additive + bounty multiplier |
| bounty_multiplier | numeric | applied multiplier (audit), default 1.0 |
| cell_newly_lit | bool | user's first test in this cell |
| fraud_score | numeric | async; **idx** |
| status | text | valid \| flagged_review \| invalidated |
| created_at | timestamptz | **idx** (history, monthly windows) |

### coverage_cell
| Field | Type | Notes |
|---|---|---|
| id | uuid | PK |
| geohash5 | char(5) | uq; **idx** |
| centroid_lat / centroid_lng | numeric | map point (avg of member tests) |
| district | text | fk → district.name; **idx** |
| sample_count | int | raw count |
| avg_download_mbps | numeric | running average |
| target | int | coverage target (default 20) |

Derived (not stored): `gap = max(0,(target−sample_count)/target)`; `xp_multiplier = round(1+2·gap,1)`; a cell with `gap>0` is a bounty candidate.

### place  *(geohash-6 "places explored")*
| Field | Type | Notes |
|---|---|---|
| user_id | uuid | fk → user; part of uq |
| geohash6 | char(6) | ~1.2 km |
| first_seen_at | timestamptz | |
| uq | | (user_id, geohash6) — distinct-place count |

### district
| Field | Type | Notes |
|---|---|---|
| name | text | PK (matches GeoJSON `ADM2_EN`) |
| division | text | **idx** (8 divisions) |
| geom | geometry(MultiPolygon,4326) | committed BD GeoJSON; **GiST idx** |
| avg_download_mbps / sample_count | numeric/int | snapshot (worker-refreshed) |
| health | text | derived: ≥80 Good /40–79 Fair /<40 Poor |

### leaderboard_counter  *(verified-tests metric, three scopes)*
| Field | Type | Notes |
|---|---|---|
| scope | text | people \| areas \| districts; part of uq |
| place | text | area / district / "Bangladesh"; part of uq, **idx** |
| subject | text | user handle / area / district; part of uq |
| value | bigint | verified tests contributed (rolling window) |
| window | text | month \| all; part of uq |
| uq | | (scope, place, subject, window) |

Redis mirror: sorted sets `lb:{scope}:{place}:{window}` scored by `value`; periodic snapshot to this table.

### mission
| Field | Type | Notes |
|---|---|---|
| id | text | PK (e.g. `d1`, `w3`, `a2`) |
| kind | text | Daily \| Weekly \| Milestone |
| dimension | text | time \| place \| network \| depth \| continuity |
| icon | text | UI glyph key |
| title / why | jsonb | `{en,bn}` |
| xp | int | reward |
| metric | text | tests \| full_tests \| mobile_test \| unique_places \| unique_districts \| unique_isps \| streak_days \| windowed |
| target | int | progress goal (or slot count) |
| type | text | null \| places \| districts \| isps (collection) |
| windows | jsonb | `[{key, label:{en,bn}, start, end}]` (windowed) |
| period_start / period_end | timestamptz | rollover (Ongoing for milestones) |
| active | bool | |

### user_mission
| Field | Type | Notes |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | fk → user; **idx** |
| mission_id | text | fk → mission |
| progress | int | |
| collected | jsonb | set of places/districts/isps done (collection) |
| windows_done | jsonb | set of slot keys done (windowed) |
| completed / claimed | bool | claim-once guard |
| period_key | text | the daily/weekly/monthly period this row is for |
| claimed_at | timestamptz | |
| uq | | (user_id, mission_id, period_key) |

### badge
| Field | Type | Notes |
|---|---|---|
| id | text | PK (e.g. `b5`) |
| name / desc / story / unit | jsonb | `{en,bn}` |
| tier | text | bronze \| silver \| gold \| platinum |
| metric | text | total_tests \| districts_covered \| isps_tested \| night_tests \| flags_accepted \| divisions_covered \| first_responder |
| target | int | threshold |
| server_awarded | bool | non-farmable (first_responder, divisions) |

### user_badge
| Field | Type | Notes |
|---|---|---|
| user_id | uuid | fk → user; part of uq |
| badge_id | text | fk → badge; part of uq |
| current | int | progress value |
| earned | bool | |
| earned_on | date | |
| uq | | (user_id, badge_id) |

### reward
| Field | Type | Notes |
|---|---|---|
| id | text | PK (e.g. `p1`) |
| cat | text | internet \| voice \| sms |
| title | text | e.g. `1 GB`, `30 min`, `120 SMS` |
| sub / validity | jsonb | `{en,bn}` (e.g. "Mobile data" / "3 days") |
| cost | int | XP price |
| stock | int | null = unlimited |
| active | bool | |
| pack_sku | text | partner-operator fulfilment SKU |

### redemption
| Field | Type | Notes |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | fk → user; **idx** |
| reward_id | text | fk → reward |
| xp_debited | int | |
| status | text | pending \| fulfilled \| failed |
| voucher_code | text | nullable |
| created_at | timestamptz | **idx** |

### complaint
| Field | Type | Notes |
|---|---|---|
| id | text | PK (`C-2026-####`) |
| user_id | uuid | fk → user; **idx** |
| isp_code | text | fk → isp.code |
| reason | text | slow \| outage \| billing \| other |
| description | text | required |
| status | text | submitted \| accepted \| rejected |
| xp_awarded | int | +40 on accept |
| created_at / resolved_at | timestamptz | |

### complaint_evidence
| Field | Type | Notes |
|---|---|---|
| complaint_id | text | fk → complaint; part of uq |
| test_id | uuid | fk → test; part of uq |

### notification
| Field | Type | Notes |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | fk → user; **idx** |
| kind | text | streak \| mission \| achievement \| civic \| regulatory \| test |
| title / body | jsonb | `{en,bn}` |
| deep_link | text | in-app target (home/history/badges/leaderboard/missions/about) |
| read | bool | **idx** (unread_count) |
| created_at | timestamptz | **idx** |

### level_threshold
| Field | Type | Notes |
|---|---|---|
| level | int | PK (1–6) |
| min_xp | bigint | 0 / 100 / 300 / 600 / 1000 / 2000 |
| title | text | New Contributor … National Verifier |

### fraud_event
| Field | Type | Notes |
|---|---|---|
| id | uuid | PK |
| test_id | uuid | fk → test; **idx** |
| user_id | uuid | fk → user; **idx** |
| reason | text | vpn \| mock_location \| teleport \| integrity \| rate_limit \| score |
| score | numeric | |
| resolution | text | pending \| accepted \| rejected |
| xp_clawed_back | int | |
| note | text | |
| created_at / resolved_at | timestamptz | |

### config  *(admin-tunable singletons)*
| Field | Type | Notes |
|---|---|---|
| key | text | PK — e.g. `base_xp_full`(30), `base_xp_quick`(10), `gps_bonus`(5), `flag_bonus`(50), `partial_xp`(5), `complaint_xp`(40), `bounty_target`(20), `daily_xp_cap`(optional), `peak_window`, `teleport_max_kmh`, `lb_window` |
| value | jsonb | |

---

## 6. Non-functional requirements

### Performance
- **NFR-1** Map endpoints (`/api/map/*`) p95 ≤ 200 ms, served from cache (TTL ≤ 60 s).
- **NFR-2** `/api/tests/submit` p95 ≤ 400 ms (excluding the measurement window).
- **NFR-3** Leaderboard reads p95 ≤ 150 ms via the Redis counter store (no live aggregation on the read path).
- **NFR-4** Cell/district aggregation and leaderboard counters update within 30 s of an accepted test.

### Scalability
- **NFR-5** Sustain ≥ 500 submissions/sec via horizontal API + worker scaling.
- **NFR-6** All aggregation (cells, districts, leaderboards, badges) runs async and never blocks submit.
- **NFR-7** PoP capacity scales regionally; initiate load-balances across healthy PoPs.

### Security
- **NFR-8** HTTPS/TLS 1.2+; access tokens ≤15 min, rotating refresh.
- **NFR-9** Throughput is **server-measured only**; the API rejects any client-supplied Mbps (FR-17).
- **NFR-10** OTP: rate-limited request/verify, hashed codes, ≤5 attempts, 120 s expiry, resend cooldown.
- **NFR-11** Mobile integrity attestation + VPN/mock-location checks required on initiate (FR-79/80/82).

### Privacy
- **NFR-12** Phone number is the only PII and is never returned in any response; handles are anonymised ISP-tagged.
- **NFR-13** Required consents (location, anon) are enforced server-side; tests without them are rejected.
- **NFR-14** Community map/leaderboard expose only aggregates; precise points are owner-only (FR-63). Account erasure on request (FR-14).

### Data integrity
- **NFR-15** Submit is idempotent per `session_token`; replays/offline-sync never double-award XP.
- **NFR-16** XP debits (redemptions) and awards are transactional; `xp_spendable` never goes negative.
- **NFR-17** Invalidated tests trigger XP/redemption clawback with a full `fraud_event` audit trail.
- **NFR-18** Evidence-grade tests carry an immutable `submission_id`; partial tests are never marked evidence.

### Availability / reliability
- **NFR-19** API availability ≥ 99.5% monthly; the map read path degrades to last-good cache if the DB is slow.
- **NFR-20** Captured results survive `serverDown`: the client may submit later; jobs retry with backoff, idempotently.
- **NFR-21** Leaderboard counters are reconstructable from durable `test` data.

### Observability
- **NFR-22** Structured request logs with trace IDs; submission, complaint acceptance, and redemption form an auditable evidence chain.
- **NFR-23** Metrics: submit rate, fraud/VPN reject rate, cap-clamp rate, PoP latency, queue depth, cache hit ratio.

### Localization
- **NFR-24** Every user-facing string (missions, badges, notifications, verdicts, rewards) is available in Bangla and English, selected via `Accept-Language` / `User.lang`.
- **NFR-25** Streak, mission windows, peak hours, and period rollovers use Asia/Dhaka; storage is UTC.

---

## 7. Technology stack

| Tech | Role · one-line justification |
|---|---|
| **Django + DRF** | API + ORM + admin; gives the consistent endpoint/serializer/auth surface and the admin needed for fraud/complaint review. |
| **PostgreSQL + PostGIS** | Durable store + geo queries: district point-in-polygon, geohash cells, teleport distance, bbox cell filters. |
| **Celery + Redis** | Async cell/district/leaderboard/badge aggregation, fraud scoring, mission rollover, notifications; Redis also serves cache, OTP store, rate limits, and the leaderboard counter store. |
| **Geohashing library** | Deterministic geohash-5 (cells) and geohash-6 (places) assignment matching the prototype's encoder. |
| **Committed BD district/division GeoJSON** | Authoritative `ADM2_EN` boundaries for district aggregation, the map, and manual location. |
| **Dedicated HTTP measurement servers (regional PoPs)** | Server-measured download/upload so throughput is observed, not client-reported — the core integrity requirement and VPN-block rationale. |
| **SMS/OTP provider** | Delivers the 6-digit verification codes for phone onboarding. |
| **Self-hosted Protomaps `.pmtiles` + Leaflet** | Keyless, self-hosted basemap for the existing map; no third-party tile dependency, supports data-sovereignty. |
| **Mobile client (Android/iOS) + Play Integrity / App Attest** | Platform attestation + mock-location/VPN signals gate session allocation. |
| **Structured logging + metrics** | Auditable evidence chain and operational visibility for the async pipeline. |

---

## 8. Out of scope / future

- Raffles / lottery rewards (current store is guaranteed-reward only).
- Exponential time-decay and time-of-day buckets on coverage cells (current gap uses raw `sample_count` vs target; time-of-day is handled by windowed missions instead).
- Real-time websocket push for leaderboard/missions (current model is poll + cache).
- BTRC's internal complaint adjudication workflow beyond the accept hook.
- ML-based fraud scoring (initial pass is rules + heuristics).
- Web (non-mobile) measurement client with attestation equivalence.
- Public open-data API for researchers.

---

## 9. Glossary

| Term | Definition |
|---|---|
| **XP** | Experience points earned per valid test, claimed mission, and accepted complaint; `xp_total` drives level, `xp_spendable` is the rewards wallet. |
| **Cell** | A coverage unit = geohash precision 5 (~5 km); the atom of coverage scoring and the map's cell layer. (A **place** is the finer geohash-6 ~1.2 km unit counted as "places explored".) |
| **Gap** | A cell's unmet-coverage fraction `max(0,(target−sample_count)/target) ∈ [0,1]`, target default 20. |
| **Bounty** | A cell with `gap>0` surfaced for bonus XP; testing there multiplies XP by `xp_multiplier = round(1+2·gap,1)`. |
| **Fog-of-war** | Map presentation where only districts/cells the user has tested are lit; the rest stay greyed (`lit_for_user`). |
| **Coverage** | Aggregate measured presence across cells/districts; the leaderboard ranks by **verified tests contributed**. |
| **Verdict** | Reliability class (`excellent/good/poor/unstable`) from the weighted speed-vs-plan + latency + jitter + loss score. |
| **Delivered %** | `round(download/advertised_down·100)`; `<70%` flags a package mismatch as BTRC evidence. |
| **PoP** | Point of Presence — a regional measurement server that observes and reports a test's download/upload throughput. |
| **Evidence-grade** | A submitted (non-partial) Full QoS test carrying an immutable `submission_id`, usable as BTRC regulatory evidence. |

---

## Appendix A — Fixed map response contracts

The backend MUST return these exact shapes (from the working prototype's `generate-mock-data.js` + `Map.jsx`):

```json
// GET /api/map/districts/
[{ "name": "Dhaka", "avg_download_mbps": 92.4, "sample_count": 410,
   "health": "Good", "lit_for_user": true }]   // health: >=80 Good, 40-79 Fair, <40 Poor

// GET /api/map/cells/
[{ "geohash5": "wh0r2", "lat": 23.81, "lng": 90.41,
   "sample_count": 37, "avg_download_mbps": 88.1 }]

// GET /api/map/me/tests/
[{ "lat": 23.75, "lng": 90.39, "download_mbps": 95.2, "created_at": "2026-05-30T19:12:00Z" }]

// GET /api/map/bounties/?lat=&lng=
[{ "geohash5": "wh0qz", "lat": 22.19, "lng": 92.21, "gap": 0.85, "xp_multiplier": 2.7 }]
```

The prototype's `lit_for_demo_user` becomes `lit_for_user`, resolved from the authenticated user. Cells aggregate by geohash precision 5; bounties are cells with `gap>0` ranked highest-gap first (top 15), `gap = max(0,(20−sample_count)/20)`, `xp_multiplier = round(1+2·gap,1)`.
