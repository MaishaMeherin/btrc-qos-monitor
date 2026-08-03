import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import { Ico } from '../components/Icons.jsx'
import { StatusBar } from '../components/Header.jsx'
import { t } from '../i18n/strings.js'
import { placesFromTests } from '../lib/geohash.js'

// All map data is read through fetch() against static file URLs so a real
// backend can later replace these by URL only — no map code changes.
const DATA = '/data'
const BD_CENTER = [23.7, 90.35]

// Consumer-friendly speed gradient: coral (Poor) -> amber (Fair) -> teal (Good).
function speedColor(mbps) {
  const stops = [
    [15, [232, 96, 77]],   // poor
    [40, [232, 140, 71]],
    [60, [232, 184, 75]],  // fair
    [80, [120, 178, 96]],
    [110, [43, 157, 126]], // good
  ]
  const v = Math.max(stops[0][0], Math.min(stops[stops.length - 1][0], mbps))
  let a = stops[0], b = stops[stops.length - 1]
  for (let i = 0; i < stops.length - 1; i++) {
    if (v >= stops[i][0] && v <= stops[i + 1][0]) { a = stops[i]; b = stops[i + 1]; break }
  }
  const f = (v - a[0]) / (b[0] - a[0] || 1)
  const c = a[1].map((ch, i) => Math.round(ch + (b[1][i] - ch) * f))
  return `rgb(${c[0]},${c[1]},${c[2]})`
}

const LAYERS = [
  { k: 'speed', icon: 'network', en: 'District Speed', bn: 'জেলার গতি' },
  { k: 'coverage', icon: 'globe', en: 'District coverage', bn: 'জেলা কভারেজ' },
  { k: 'places', icon: 'pin', en: 'Places explored', bn: 'স্থান অন্বেষণ' },
  { k: 'bounties', icon: 'sparkle', en: 'Bounties', bn: 'বাউন্টি' },
]

export default function MapScreen({ lang, setScreen, user, initialLayer = 'speed' }) {
  const mapEl = useRef(null)
  const map = useRef(null)
  const overlay = useRef(null)   // L.LayerGroup holding the active layer's features
  const data = useRef({})        // { geo, districts, me, bounties }

  const [layer, setLayer] = useState(initialLayer)
  const [ready, setReady] = useState(false)
  const [litCount, setLitCount] = useState(0)
  const [placesCount, setPlacesCount] = useState(0)

  // ---- init map + load all data once ----
  useEffect(() => {
    const m = L.map(mapEl.current, {
      center: BD_CENTER,
      zoom: 7,
      zoomControl: true,
      attributionControl: true,
      scrollWheelZoom: true,
    })
    // Light, minimal basemap (Carto Positron — OpenStreetMap data), a clean
    // Protomaps-style backdrop that needs no API key for the prototype.
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '© OpenStreetMap · © CARTO',
      subdomains: 'abcd',
      maxZoom: 18,
    }).addTo(m)
    overlay.current = L.layerGroup().addTo(m)
    map.current = m

    Promise.all([
      fetch(`${DATA}/bd-districts.geojson`).then((r) => r.json()),
      fetch(`${DATA}/districts.json`).then((r) => r.json()),
      fetch(`${DATA}/me_tests.json`).then((r) => r.json()),
      fetch(`${DATA}/bounties.json`).then((r) => r.json()),
    ]).then(([geo, districts, me, bounties]) => {
      data.current = { geo, districts, me, bounties }
      setLitCount(districts.filter((d) => d.lit_for_demo_user).length)
      setPlacesCount(placesFromTests(me))
      const bounds = L.geoJSON(geo).getBounds()
      m.fitBounds(bounds, { padding: [10, 10] })
      setReady(true)
    })

    return () => { m.remove(); map.current = null }
  }, [])

  // ---- render the active layer whenever it (or its options) change ----
  useEffect(() => {
    if (!ready || !map.current) return
    const g = overlay.current
    g.clearLayers()
    const { geo, districts, me, bounties } = data.current
    const byName = Object.fromEntries(districts.map((d) => [d.name, d]))

    if (layer === 'speed') {
      L.geoJSON(geo, {
        style: (f) => {
          const d = byName[f.properties.ADM2_EN]
          return {
            fillColor: d ? speedColor(d.avg_download_mbps) : '#ccc',
            fillOpacity: 0.72, color: '#fff', weight: 1,
          }
        },
        onEachFeature: (f, lyr) => {
          const d = byName[f.properties.ADM2_EN]
          if (!d) return
          lyr.bindTooltip(
            `${d.name} · ${Math.round(d.avg_download_mbps)} Mbps · ${d.health} · ${d.sample_count} tests`,
            { sticky: true }
          )
          lyr.on('mouseover', () => lyr.setStyle({ weight: 2.5, color: '#0b5e7e' }))
          lyr.on('mouseout', () => lyr.setStyle({ weight: 1, color: '#fff' }))
        },
      }).addTo(g)
    }

    else if (layer === 'coverage') {
      // Fog-of-war: districts you have tested from glow, the rest stay greyed.
      L.geoJSON(geo, {
        style: (f) => {
          const d = byName[f.properties.ADM2_EN]
          const lit = d && d.lit_for_demo_user
          return lit
            ? { fillColor: '#2b9d7e', fillOpacity: 0.45, color: '#1f7a62', weight: 1.2 }
            : { fillColor: '#9aa3a0', fillOpacity: 0.5, color: '#cfd4d2', weight: 0.6 }
        },
      }).addTo(g)
    }

    else if (layer === 'places') {
      // Faint district outline for context, then a dot for each of your tests.
      L.geoJSON(geo, { style: { fillOpacity: 0, color: '#b9c2bf', weight: 0.5 } }).addTo(g)
      me.forEach((p) => {
        L.circleMarker([p.lat, p.lng], {
          radius: 3, color: '#0b5e7e', weight: 1, fillColor: '#39c0a0', fillOpacity: 0.95,
        }).addTo(g)
      })
    }

    else if (layer === 'bounties') {
      L.geoJSON(geo, { style: { fillOpacity: 0, color: '#d8cfa8', weight: 0.5 } }).addTo(g)
      bounties.forEach((b) => {
        // Glow halo + solid core.
        L.circleMarker([b.lat, b.lng], {
          radius: 16, stroke: false, fillColor: '#E8B84B', fillOpacity: 0.18,
        }).addTo(g)
        L.circleMarker([b.lat, b.lng], {
          radius: 7, color: '#fff', weight: 1.5, fillColor: '#D99700', fillOpacity: 0.95,
        }).addTo(g).bindPopup(
          `<b>${t(lang, 'This area needs data', 'এই এলাকায় ডেটা দরকার')}</b><br>${b.xp_multiplier}× XP`
        )
      })
    }
  }, [layer, ready, lang])

  return (
    <div className="pb-28">
      <StatusBar />
      <div className="px-5 pt-3 flex items-center gap-2">
        <button onClick={() => setScreen('about')} className="w-9 h-9 rounded-full bg-[color:var(--surface)] border border-[color:var(--line)] flex items-center justify-center">
          <Ico.chevronL className="w-4 h-4" />
        </button>
        <div className="font-display text-[18px] text-[color:var(--ink)]">{t(lang, 'District coverage', 'জেলা কভারেজ')}</div>
      </div>

      {/* Layer switcher */}
      <div className="px-5 mt-3 grid grid-cols-4 gap-1.5">
        {LAYERS.map((l) => {
          const Icon = Ico[l.icon]
          const on = layer === l.k
          return (
            <button key={l.k} onClick={() => setLayer(l.k)}
              className={'flex flex-col items-center gap-1 py-2 rounded-xl border text-[10px] font-semibold transition ' +
                (on ? 'bg-[color:var(--teal)] text-white border-[color:var(--teal)]'
                    : 'bg-[color:var(--surface)] text-[color:var(--ink-soft)] border-[color:var(--line)]')}>
              {Icon && <Icon className="w-4 h-4" />}
              <span className="leading-none text-center">{t(lang, l.en, l.bn)}</span>
            </button>
          )
        })}
      </div>

      {/* Map */}
      <div className="mx-5 mt-3 rounded-2xl overflow-hidden border border-[color:var(--line)] relative" style={{ height: 460 }}>
        <div ref={mapEl} className="w-full h-full" />

        {/* District coverage counter */}
        {layer === 'coverage' && (
          <div className="absolute top-2.5 left-2.5 z-[500] px-3 py-1.5 rounded-full bg-white/95 shadow text-[12px] font-semibold text-[color:var(--ink)] flex items-center gap-1.5">
            <Ico.globe className="w-3.5 h-3.5 text-[color:var(--teal)]" />
            {t(lang, `Lit ${litCount} of 64 districts`, `৬৪টির মধ্যে ${litCount}টি জেলা আলোকিত`)}
          </div>
        )}

        {/* Places explored counter */}
        {layer === 'places' && (
          <div className="absolute top-2.5 left-2.5 z-[500] px-3 py-1.5 rounded-full bg-white/95 shadow text-[12px] font-semibold text-[color:var(--ink)] flex items-center gap-1.5">
            <Ico.pin className="w-3.5 h-3.5 text-[color:var(--teal)]" />
            {t(lang, `${placesCount} places explored`, `${placesCount}টি স্থান অন্বেষণ`)}
          </div>
        )}
      </div>

      {/* Legend / context line */}
      <div className="mx-5 mt-3 p-3 rounded-xl bg-[color:var(--surface)] border border-[color:var(--line)] text-[11.5px] text-[color:var(--ink-soft)] leading-snug">
        {layer === 'speed' && t(lang, 'Average download speed per district — greener is faster. Hover a district for details.', 'প্রতি জেলার গড় ডাউনলোড গতি — সবুজ মানে দ্রুত। বিস্তারিত দেখতে জেলায় হোভার করুন।')}
        {layer === 'coverage' && t(lang, 'Districts you have tested from glow; the rest stay in the fog.', 'আপনি যেসব জেলা থেকে পরীক্ষা করেছেন তা আলোকিত; বাকিগুলো কুয়াশায়।')}
        {layer === 'places' && t(lang, 'Each dot is one of your tests. Together they map the places you have explored.', 'প্রতিটি ডট আপনার একটি পরীক্ষা। একসাথে তারা আপনার অন্বেষণ করা স্থানগুলো দেখায়।')}
        {layer === 'bounties' && t(lang, 'Glowing areas need more data. Test there to earn bonus XP.', 'আলোকিত এলাকায় আরও ডেটা দরকার। সেখানে পরীক্ষা করে বোনাস XP অর্জন করুন।')}
      </div>

      <div className="mx-5 mt-3 grid grid-cols-2 gap-2">
        <div className="p-3 rounded-xl bg-[color:var(--surface)] border border-[color:var(--line)]">
          <div className="text-[10px] tracking-[0.14em] uppercase text-[color:var(--mute)] font-semibold">{t(lang, 'Your rank', 'আপনার র‍্যাঙ্ক')}</div>
          <div className="font-mono-data font-bold text-[22px] text-[color:var(--ink)]">#{user.districtRank}<span className="text-[12px] text-[color:var(--mute)]"> / {user.totalDistricts}</span></div>
        </div>
        <div className="p-3 rounded-xl bg-[color:var(--surface)] border border-[color:var(--line)]">
          <div className="text-[10px] tracking-[0.14em] uppercase text-[color:var(--mute)] font-semibold">{t(lang, 'Districts lit', 'আলোকিত জেলা')}</div>
          <div className="font-mono-data font-bold text-[22px] text-[color:var(--ink)]">{litCount}<span className="text-[12px] text-[color:var(--mute)]"> / 64</span></div>
        </div>
      </div>
    </div>
  )
}
