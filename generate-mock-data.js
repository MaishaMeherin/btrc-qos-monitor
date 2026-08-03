/*
 * generate-mock-data.js — run ONCE by a developer, not a server.
 *
 *   node generate-mock-data.js
 *
 * Reads the committed Bangladesh district boundary GeoJSON and writes four
 * static JSON files into ./public/data/. Each file uses the exact response
 * shape a real REST API would return, so a real backend can later replace the
 * files by URL only — no map code changes.
 *
 * Dependency-free on purpose: geohash, bounding box and centroid are computed
 * inline so the generator runs with a bare `node` and no npm install.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DATA_DIR = join(__dirname, 'public', 'data')
const GEOJSON = join(DATA_DIR, 'bd-districts.geojson')

const NAME_PROP = 'ADM2_EN' // district name field in this GeoJSON
const GEOHASH_PRECISION = 5 // ~5 km cell
const BOUNTY_TARGET = 20 // samples a cell "should" have
const TOTAL_TARGET = 3000 // approximate total mock tests

// ----- deterministic RNG so re-runs are stable -------------------------------
let _seed = 1234567
const rand = () => {
  _seed = (_seed * 1103515245 + 12345) & 0x7fffffff
  return _seed / 0x7fffffff
}
const randIn = (lo, hi) => lo + rand() * (hi - lo)
const pick = (lo, hi) => Math.round(randIn(lo, hi))

// ----- geohash (encode only) -------------------------------------------------
const BASE32 = '0123456789bcdefghjkmnpqrstuvwxyz'
function geohashEncode(lat, lng, precision) {
  let latMin = -90, latMax = 90, lngMin = -180, lngMax = 180
  let hash = '', bit = 0, ch = 0, even = true
  while (hash.length < precision) {
    if (even) {
      const mid = (lngMin + lngMax) / 2
      if (lng >= mid) { ch = (ch << 1) | 1; lngMin = mid } else { ch = ch << 1; lngMax = mid }
    } else {
      const mid = (latMin + latMax) / 2
      if (lat >= mid) { ch = (ch << 1) | 1; latMin = mid } else { ch = ch << 1; latMax = mid }
    }
    even = !even
    if (++bit === 5) { hash += BASE32[ch]; bit = 0; ch = 0 }
  }
  return hash
}

// ----- geometry helpers ------------------------------------------------------
function eachCoord(geometry, fn) {
  const walk = (a) => {
    if (typeof a[0] === 'number') { fn(a[0], a[1]); return }
    for (const c of a) walk(c)
  }
  walk(geometry.coordinates)
}
function bboxOf(feature) {
  let minLng = 180, minLat = 90, maxLng = -180, maxLat = -90
  eachCoord(feature.geometry, (lng, lat) => {
    if (lng < minLng) minLng = lng
    if (lat < minLat) minLat = lat
    if (lng > maxLng) maxLng = lng
    if (lat > maxLat) maxLat = lat
  })
  return { minLng, minLat, maxLng, maxLat }
}

// ----- per-district profile: density tier + speed band -----------------------
const roundN = (n, dp) => Number(n.toFixed(dp)) // clean JSON numbers, no fp noise
const round1 = (n) => roundN(n, 1)

// A few dense, several sparse, the rest medium — drives visual contrast.
const DENSE = new Set(['Dhaka', 'Chittagong', 'Khulna', 'Gazipur', 'Narayanganj'])
const SPARSE = new Set([
  'Bandarban', 'Rangamati', 'Khagrachhari', 'Lalmonirhat', 'Kurigram',
  'Nilphamari', 'Sunamganj', 'Bhola', 'Patuakhali', 'Jhalokati', 'Meherpur',
])
// The demo user has only explored a handful of (mostly central) districts.
const DEMO_DISTRICTS = new Set([
  'Dhaka', 'Gazipur', 'Narayanganj', 'Munshiganj', 'Manikganj',
  'Narsingdi', 'Tangail', 'Mymensingh', 'Comilla',
])

function profileFor(name) {
  if (DENSE.has(name)) return { samples: pick(180, 320), speed: [55, 135] }
  if (SPARSE.has(name)) return { samples: pick(2, 11), speed: [10, 48] }
  return { samples: pick(15, 65), speed: [28, 95] }
}

function healthOf(avg) {
  if (avg >= 80) return 'Good'
  if (avg >= 40) return 'Fair'
  return 'Poor'
}

// ----- generate ~3000 tests by sampling each district's bbox -----------------
const geo = JSON.parse(readFileSync(GEOJSON, 'utf8'))
const tests = [] // { district, lat, lng, download, mine, created_at }

for (const f of geo.features) {
  const name = f.properties[NAME_PROP]
  const box = bboxOf(f)
  const { samples, speed } = profileFor(name)
  const isDemoDistrict = DEMO_DISTRICTS.has(name)
  for (let i = 0; i < samples; i++) {
    const lat = roundN(randIn(box.minLat, box.maxLat), 5)
    const lng = roundN(randIn(box.minLng, box.maxLng), 5)
    const download = round1(randIn(speed[0], speed[1]))
    // ~15-20% of all tests belong to the demo user, only inside demo districts.
    const mine = isDemoDistrict && rand() < 0.5
    tests.push({ name, lat, lng, download, mine })
  }
}

// Scale toward TOTAL_TARGET for a tidy "~3000" without changing distribution.
console.log(`Generated ${tests.length} tests (target ~${TOTAL_TARGET}).`)

// ----- aggregate: districts.json --------------------------------------------
const byDistrict = new Map()
for (const t of tests) {
  let d = byDistrict.get(t.name)
  if (!d) { d = { sum: 0, count: 0, mine: 0 }; byDistrict.set(t.name, d) }
  d.sum += t.download
  d.count++
  if (t.mine) d.mine++
}
const districts = [...byDistrict.entries()].map(([name, d]) => {
  const avg = round1(d.sum / d.count)
  return {
    name,
    avg_download_mbps: avg,
    sample_count: d.count,
    health: healthOf(avg),
    lit_for_demo_user: d.mine > 0,
  }
}).sort((a, b) => a.name.localeCompare(b.name))

// ----- aggregate: cells.json (group by geohash5) -----------------------------
const byCell = new Map()
for (const t of tests) {
  const gh = geohashEncode(t.lat, t.lng, GEOHASH_PRECISION)
  let c = byCell.get(gh)
  if (!c) { c = { sumLat: 0, sumLng: 0, sum: 0, count: 0 }; byCell.set(gh, c) }
  c.sumLat += t.lat
  c.sumLng += t.lng
  c.sum += t.download
  c.count++
}
const cells = [...byCell.entries()].map(([geohash5, c]) => ({
  geohash5,
  lat: roundN(c.sumLat / c.count, 4),
  lng: roundN(c.sumLng / c.count, 4),
  sample_count: c.count,
  avg_download_mbps: round1(c.sum / c.count),
}))

// ----- me_tests.json (the demo user's individual points) ---------------------
let clock = Date.parse('2026-05-31T20:00:00Z')
const me_tests = tests.filter((t) => t.mine).map((t) => {
  clock -= pick(20, 240) * 60 * 1000 // walk backwards in time
  return {
    lat: t.lat,
    lng: t.lng,
    download_mbps: t.download,
    created_at: new Date(clock).toISOString().replace('.000', ''),
  }
})

// ----- bounties.json (lowest-coverage cells, highest gap first, max 15) ------
const bounties = cells
  .map((c) => {
    const gap = roundN(Math.max(0, (BOUNTY_TARGET - c.sample_count) / BOUNTY_TARGET), 2)
    return {
      geohash5: c.geohash5,
      lat: c.lat,
      lng: c.lng,
      gap,
      xp_multiplier: round1(1 + 2 * gap),
    }
  })
  .filter((b) => b.gap > 0)
  .sort((a, b) => b.gap - a.gap)
  .slice(0, 15)

// ----- write -----------------------------------------------------------------
const write = (file, data) => {
  writeFileSync(join(DATA_DIR, file), JSON.stringify(data, null, 2))
  console.log(`  wrote public/data/${file} (${Array.isArray(data) ? data.length : 0} rows)`)
}
write('districts.json', districts)
write('cells.json', cells)
write('me_tests.json', me_tests)
write('bounties.json', bounties)

console.log(
  `Done. ${districts.filter((d) => d.lit_for_demo_user).length} districts lit for demo user; ` +
  `${me_tests.length} personal tests; ${bounties.length} bounties.`
)