// Geohash encoder — same algorithm the mock-data generator uses, so a "place"
// is defined identically on the map and in the profile. Precision 6 ≈ 1.2 km.
const BASE32 = '0123456789bcdefghjkmnpqrstuvwxyz'

export function geohashEncode(lat, lng, precision = 6) {
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

// Count distinct ~1.2 km places from a list of { lat, lng } test points.
export function placesFromTests(tests, precision = 6) {
  return new Set(tests.map((t) => geohashEncode(t.lat, t.lng, precision))).size
}
