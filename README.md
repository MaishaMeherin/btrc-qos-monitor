# BTRC QoS Monitor — App

Vite + React migration of the v2/v3 single-file prototype.

## Run

```bash
npm install
npm run dev
```

## District coverage map

The **Profile → District map** screen is a Leaflet map of Bangladesh with four
switchable layers, all driven by static mock JSON read through `fetch()`:

- **District Speed** — choropleth of each district's average download speed.
- **District coverage** — fog-of-war: districts the demo user has tested from
  glow, the rest stay dimmed, with a "Lit X of 64" counter.
- **Places explored** — a dot for each of the demo user's tests, with a
  "X places explored" counter (distinct ~1.2 km geohash-6 cells).
- **Bounties** — glowing markers on the lowest-coverage cells, with XP-multiplier
  popups.

### (a) Generate the mock data (run once)

```bash
npm run generate-mock-data       # or: node generate-mock-data.js
```

This reads `public/data/bd-districts.geojson` (committed) and writes four files
into `public/data/`: `districts.json`, `cells.json`, `me_tests.json`,
`bounties.json`. The generator is a throwaway dev script — not a server — and has
no npm dependencies (geohash/bbox/centroid are computed inline).

### (b) Serve the page

```bash
npm run dev                      # Vite dev server
# or, fully static, from any file server after `npm run build`:
npx serve dist
```

The frontend fetches only `/data/<file>.json`, so swapping to a real backend
later is just a URL change — no map code changes. The four JSON response shapes
are stable and documented at the top of `generate-mock-data.js`.

**Basemap note:** the prototype uses Carto Positron raster tiles (OpenStreetMap
data) as a clean, key-free Protomaps-style backdrop. To use true Protomaps
vector tiles later, swap the single `L.tileLayer(...)` call in
`src/screens/Map.jsx` for a `protomaps-leaflet` layer.

## Layout

```
src/
  main.jsx              entry point
  App.jsx               screen switcher (replace with a router later)
  index.css             Tailwind directives + base styles
  state/store.js        localStorage-backed state (XP, level, streak, history)
  data/isps.js          ISP catalog + BTRC plans
  i18n/strings.js       EN / BN translations
  lib/geohash.js        geohash encoder — defines a "place" (~1.2 km cell)
  components/
    PhoneShell.jsx      390x844 phone mockup frame
    XPBar.jsx           XP/level progress bar
    Gauge.jsx           animated SVG speed gauge
  screens/
    Onboard.jsx         consent + ISP/package selection
    Home.jsx            XP bar, mission chip, run-test button
    Testing.jsx         ping → down → up → done
    Result.jsx          XP burst + advertised vs delivered
    History.jsx         past tests
    Missions.jsx        daily / weekly / milestone
    Leaderboard.jsx     district + division scopes
    Badges.jsx          9 badges, 4 tiers
    Map.jsx             Leaflet district coverage map (4 layers, mock JSON)
    Complaint.jsx       ISP complaint form
    Profile.jsx         identity card + stats
```

## Migration order

1. `data/isps.js`, `data/districts.js`, `i18n/strings.js` — pure data, no deps
2. `state/store.js` — XP/level/streak logic
3. `components/PhoneShell.jsx`, `XPBar.jsx`, `Gauge.jsx` — shared UI
4. Screens one at a time, starting with `Home` and `Testing`
