import { useState } from 'react'
import { Ico } from '../components/Icons.jsx'
import { StatusBar } from '../components/Header.jsx'
import { t } from '../i18n/strings.js'
import { MISSIONS, DIMENSIONS, PLACE_PRESETS, ISP_PRESETS } from '../data/seed.js'

// 24h → "11am" / "8pm". Numerals stay Latin in both languages (common in BD apps).
const ampm = (h) => {
  const hh = ((h % 24) + 24) % 24
  const m = hh % 12 === 0 ? 12 : hh % 12
  return `${m}${hh < 12 ? 'am' : 'pm'}`
}

// A window can be in exactly one of four states given the current hour.
// This is the whole "enforcement": a slot is only claimable while it's open.
function windowState(w, nowH) {
  if (w.done) return 'done'
  if (nowH < w.start) return 'upcoming'
  if (nowH < w.end) return 'active'
  return 'missed'
}

// Smart deadline line for the card meta row — answers the user's
// "today at 11am" vs "tonight at 11pm" requirement.
function deadlineLine(lang, windows, nowH) {
  const states = windows.map((w) => ({ w, s: windowState(w, nowH) }))
  if (states.every((x) => x.s === 'done')) return { tone: 'done', text: t(lang, 'All done today', 'আজ সব সম্পন্ন') }
  const active = states.find((x) => x.s === 'active')
  if (active) {
    const today = active.w.end < 17 // evening/night windows read "tonight"
    return { tone: 'active', text: t(lang, `Ends ${today ? 'today' : 'tonight'} at ${ampm(active.w.end)}`, `${today ? 'আজ' : 'আজ রাত'} ${ampm(active.w.end)}-এ শেষ`) }
  }
  const next = states.find((x) => x.s === 'upcoming')
  if (next) return { tone: 'upcoming', text: t(lang, `Opens at ${ampm(next.w.start)}`, `${ampm(next.w.start)}-এ শুরু`) }
  return { tone: 'missed', text: t(lang, 'Window closed for today', 'আজকের সময় শেষ') }
}

const WSTATE = {
  done: { color: 'var(--green)', bg: 'var(--green-soft)' },
  active: { color: 'var(--gold)', bg: 'var(--gold-soft)' },
  upcoming: { color: 'var(--mute)', bg: 'var(--parchment)' },
  empty: { color: 'var(--mute)', bg: 'var(--parchment)' },
  missed: { color: 'var(--coral)', bg: 'var(--coral-soft)' },
}

// ── PLACES mission — distinct AREAS tested with your own connection ──────────
// Smart summary: claimable when the user is somewhere they haven't tested yet.
function placesLine(lang, m, place) {
  const count = m.places.length
  if (count >= m.target) return { tone: 'done', text: t(lang, 'Done this week', 'এই সপ্তাহে সম্পন্ন') }
  if (place && place.isNew) return { tone: 'active', text: t(lang, 'You’re somewhere new — claim it', 'নতুন জায়গায় আছেন — দখল করুন') }
  const left = m.target - count
  return { tone: 'upcoming', text: t(lang, `${left} new place${left > 1 ? 's' : ''} to find`, `আরও ${left}টি নতুন জায়গা`) }
}

function buildPlacesRows(lang, m, place) {
  const rows = m.places.map((p) => ({ state: 'done', icon: 'pin', label: lang === 'bn' ? p.label_bn : p.label_en }))
  let remaining = m.target - rows.length
  if (place && place.isNew && remaining > 0) {
    rows.push({ state: 'active', icon: place.icon || 'pin', label: lang === 'bn' ? place.label_bn : place.label_en, sub: t(lang, 'You are here now', 'আপনি এখন এখানে') })
    remaining--
  }
  for (let i = 0; i < remaining; i++) rows.push({ state: 'empty', icon: 'pin', label: t(lang, 'Find a new place', 'নতুন জায়গা খুঁজুন') })
  return rows
}

// ── DISTRICTS mission — distinct DISTRICTS tested, for national coverage ─────
// Shares the location context with places; claimable when you're in a new one.
function districtsLine(lang, m, place) {
  const count = m.districts.length
  if (count >= m.target) return { tone: 'done', text: t(lang, 'Complete', 'সম্পন্ন') }
  if (place && place.isNew) return { tone: 'active', text: t(lang, 'New district — claim it', 'নতুন জেলা — দখল করুন') }
  const left = m.target - count
  return { tone: 'upcoming', text: t(lang, `${left} more district${left > 1 ? 's' : ''} to test`, `আরও ${left}টি জেলা`) }
}

function buildDistrictsRows(lang, m, place) {
  const rows = m.districts.map((d) => ({ state: 'done', icon: 'pin', label: lang === 'bn' ? d.label_bn : d.label_en }))
  let remaining = m.target - rows.length
  if (place && place.isNew && remaining > 0) {
    rows.push({ state: 'active', icon: place.icon || 'pin', label: lang === 'bn' ? place.label_bn : place.label_en, sub: t(lang, 'You are here now', 'আপনি এখন এখানে') })
    remaining--
  }
  for (let i = 0; i < remaining; i++) rows.push({ state: 'empty', icon: 'pin', label: t(lang, 'Test in a new district', 'নতুন জেলায় পরীক্ষা করুন') })
  return rows
}

// ── ISPS mission — distinct OPERATORS tested, to compare providers ───────────
// Smart summary: claimable when the connected operator hasn't been tested yet.
function ispsLine(lang, m, isp) {
  const count = m.isps.length
  if (count >= m.target) return { tone: 'done', text: t(lang, 'Complete', 'সম্পন্ন') }
  if (isp && isp.isNew) return { tone: 'active', text: t(lang, 'New provider — test it', 'নতুন অপারেটর — পরীক্ষা করুন') }
  const left = m.target - count
  return { tone: 'upcoming', text: t(lang, `${left} more provider${left > 1 ? 's' : ''} to test`, `আরও ${left}টি অপারেটর`) }
}

function buildIspsRows(lang, m, isp) {
  const rows = m.isps.map((p) => ({ state: 'done', icon: 'network', label: lang === 'bn' ? p.label_bn : p.label_en }))
  let remaining = m.target - rows.length
  if (isp && isp.isNew && remaining > 0) {
    rows.push({ state: 'active', icon: isp.icon || 'network', label: lang === 'bn' ? isp.label_bn : isp.label_en, sub: t(lang, 'Connected now', 'এখন সংযুক্ত') })
    remaining--
  }
  for (let i = 0; i < remaining; i++) rows.push({ state: 'empty', icon: 'network', label: t(lang, 'Test a new provider', 'নতুন অপারেটরে পরীক্ষা করুন') })
  return rows
}

// Small coloured chip naming the data dimension a mission steers toward.
function DimChip({ lang, dimension }) {
  const d = DIMENSIONS[dimension]
  if (!d) return null
  return (
    <span
      className="px-1.5 py-0.5 rounded-md text-[8.5px] font-bold tracking-[0.1em] uppercase shrink-0"
      style={{ color: d.color, background: d.color + '1A' }}>
      {t(lang, d.en, d.bn)}
    </span>
  )
}

// One time-window slot row (Morning / Night / Evening rush …).
function WindowRow({ lang, w, nowH, runTest }) {
  const s = windowState(w, nowH)
  const cfg = WSTATE[s]
  const Glyph = Ico[w.icon] || Ico.clock
  const disabled = s === 'missed' || s === 'upcoming'
  return (
    <div className={'flex items-center gap-2.5 ' + (disabled ? 'opacity-60' : '')}>
      <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
        style={{ background: cfg.bg, color: cfg.color }}>
        {s === 'done' ? <Ico.check className="w-4 h-4" /> : <Glyph className="w-4 h-4" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className={'text-[12px] font-semibold leading-tight ' + (s === 'missed' ? 'text-[color:var(--mute)] line-through' : 'text-[color:var(--ink)]') + (lang === 'bn' ? ' font-bn' : '')}>
          {lang === 'bn' ? w.label_bn : w.label_en}
        </div>
        <div className="font-mono-data text-[9.5px] text-[color:var(--mute)]">{ampm(w.start)} – {ampm(w.end)}</div>
      </div>
      {s === 'active' ? (
        <button onClick={() => runTest && runTest()}
          className="px-2.5 py-1.5 rounded-lg bg-[color:var(--gold)] text-[color:var(--teal-deep)] text-[10.5px] font-bold flex items-center gap-1 active:translate-y-px transition shrink-0">
          <Ico.gauge className="w-3 h-3" />{t(lang, 'Test now', 'এখন পরীক্ষা')}
        </button>
      ) : (
        <span className="text-[10px] font-semibold shrink-0 flex items-center gap-1" style={{ color: cfg.color }}>
          {s === 'done' && <>{t(lang, 'Done', 'সম্পন্ন')}</>}
          {s === 'upcoming' && <><Ico.lock className="w-3 h-3" />{t(lang, `Opens ${ampm(w.start)}`, `${ampm(w.start)}-এ`)}</>}
          {s === 'missed' && <><Ico.cross className="w-3 h-3" />{t(lang, 'Missed', 'মিস')}</>}
        </span>
      )}
    </div>
  )
}

// One collection slot (collected / claimable-now / empty placeholder).
function CollectRow({ lang, row, runTest }) {
  const cfg = WSTATE[row.state]
  const Glyph = Ico[row.icon] || Ico.pin
  return (
    <div className={'flex items-center gap-2.5 ' + (row.state === 'empty' ? 'opacity-60' : '')}>
      <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: cfg.bg, color: cfg.color }}>
        {row.state === 'done' ? <Ico.check className="w-4 h-4" /> : <Glyph className="w-4 h-4" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className={'text-[12px] font-semibold leading-tight ' + (row.state === 'empty' ? 'text-[color:var(--mute)]' : 'text-[color:var(--ink)]') + (lang === 'bn' ? ' font-bn' : '')}>
          {row.label}
        </div>
        {row.sub && <div className="text-[9.5px] text-[color:var(--mute)]">{row.sub}</div>}
      </div>
      {row.state === 'active' ? (
        <button onClick={() => runTest && runTest()}
          className="px-2.5 py-1.5 rounded-lg bg-[color:var(--gold)] text-[color:var(--teal-deep)] text-[10.5px] font-bold flex items-center gap-1 active:translate-y-px transition shrink-0">
          <Ico.gauge className="w-3 h-3" />{t(lang, 'Test now', 'এখন পরীক্ষা')}
        </button>
      ) : (
        <span className="text-[10px] font-semibold shrink-0" style={{ color: cfg.color }}>
          {row.state === 'done' && t(lang, 'Tested', 'পরীক্ষিত')}
        </span>
      )}
    </div>
  )
}

// One adaptive disclosure keeps every card the same compact shape: structured
// missions reveal their time slots / places / providers (+ why); others just why.
function CardDetail({ lang, m, windowed, places, districts, isps, nowH, current, runTest }) {
  const [open, setOpen] = useState(false)
  const label = windowed ? t(lang, 'Time slots', 'সময়সূচি') : places ? t(lang, 'Places', 'স্থানসমূহ') : districts ? t(lang, 'Districts', 'জেলাসমূহ') : isps ? t(lang, 'Providers', 'অপারেটর') : t(lang, 'Why this matters', 'কেন এটি গুরুত্বপূর্ণ')
  const Lead = windowed ? Ico.clock : isps ? Ico.network : (places || districts) ? Ico.pin : Ico.info
  const structured = windowed || places || districts || isps
  const slotRows = places ? buildPlacesRows(lang, m, current) : districts ? buildDistrictsRows(lang, m, current) : isps ? buildIspsRows(lang, m, current) : []
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full mt-2.5 pt-2.5 border-t border-[color:var(--line)] flex items-center justify-between text-[10.5px] font-semibold text-[color:var(--ink-soft)]">
        <span className="flex items-center gap-1.5">
          <Lead className="w-3 h-3 text-[color:var(--teal)]" />
          {label}
        </span>
        <Ico.chevronR className={'w-3 h-3 transition-transform ' + (open ? 'rotate-90' : '')} />
      </button>
      {open && (
        <div className="fade-up">
          {windowed && (
            <div className="mt-2.5 space-y-2">
              {m.windows.map((w) => <WindowRow key={w.key} lang={lang} w={w} nowH={nowH} runTest={runTest} />)}
            </div>
          )}
          {(places || districts || isps) && (
            <div className="mt-2.5 space-y-2">
              {slotRows.map((row, i) => <CollectRow key={i} lang={lang} row={row} runTest={runTest} />)}
            </div>
          )}
          <div className={'mt-2.5 text-[11px] text-[color:var(--ink-soft)] leading-snug ' + (structured ? 'pt-2.5 border-t border-[color:var(--line)] ' : '') + (lang === 'bn' ? 'font-bn' : '')}>
            {lang === 'bn' ? m.why_bn : m.why_en}
          </div>
        </div>
      )}
    </>
  )
}

function MissionCard({ lang, m, nowH, place, isp, runTest }) {
  const windowed = Array.isArray(m.windows)
  const places = m.type === 'places'
  const districts = m.type === 'districts'
  const isps = m.type === 'isps'
  const current = districts ? place : places ? place : isps ? isp : null
  const doneCount = windowed ? m.windows.filter((w) => windowState(w, nowH) === 'done').length
    : places ? m.places.length
      : districts ? m.districts.length
        : isps ? m.isps.length
          : m.progress
  const total = windowed ? m.windows.length : m.target
  const pct = Math.min(100, Math.round(doneCount / total * 100))
  const complete = doneCount >= total
  const Glyph = Ico[m.icon] || Ico.target
  const meta = windowed ? deadlineLine(lang, m.windows, nowH) : places ? placesLine(lang, m, place) : districts ? districtsLine(lang, m, place) : isps ? ispsLine(lang, m, isp) : null
  const MetaIcon = windowed ? Ico.clock : isps ? Ico.network : Ico.pin

  return (
    <div className={'p-3.5 rounded-xl bg-[color:var(--surface)] border ' + (complete ? 'border-[color:var(--green)]/40 bg-[color:var(--green-soft)]/30' : 'border-[color:var(--line)]')}>
      {/* Zone 1 — identity: icon → title/meta → reward */}
      <div className="flex items-center gap-3">
        <div className={'w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ' + (complete ? 'bg-[color:var(--green)] text-white' : 'bg-[color:var(--gold-soft)] text-[color:var(--gold)]')}>
          {complete ? <Ico.check className="w-5 h-5" /> : <Glyph className="w-5 h-5" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className={'font-semibold text-[13.5px] text-[color:var(--ink)] leading-tight ' + (lang === 'bn' ? 'font-bn' : '')}>
            {lang === 'bn' ? m.title_bn : m.title_en}
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            <DimChip lang={lang} dimension={m.dimension} />
            <span className="text-[9.5px] font-semibold flex items-center gap-1"
              style={{ color: meta ? WSTATE[meta.tone].color : 'var(--mute)' }}>
              {meta ? <MetaIcon className="w-2.5 h-2.5" /> : null}
              {meta ? meta.text : `${t(lang, 'Expires', 'শেষ')} ${m.expires}`}
            </span>
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="font-mono-data text-[14px] font-bold text-[color:var(--gold)]">+{m.xp}</div>
          <div className="text-[9px] text-[color:var(--mute)]">XP</div>
        </div>
      </div>

      {/* Zone 2 — progress */}
      <div className="flex items-center gap-2 mt-3">
        <div className="flex-1 bar bar-gold"><span style={{ width: pct + '%' }}></span></div>
        <span className="font-mono-data text-[11px] text-[color:var(--ink-soft)]">{doneCount}/{total}</span>
      </div>

      {/* Zone 3 — adaptive disclosure (time slots / places / districts / providers / why) */}
      <CardDetail lang={lang} m={m} windowed={windowed} places={places} districts={districts} isps={isps} nowH={nowH} current={current} runTest={runTest} />
    </div>
  )
}

function MissionSection({ lang, title, items, nowH, place, isp, runTest }) {
  if (!items.length) return null
  return (
    <div className="mt-5">
      <div className="px-6 flex items-center gap-2 mb-2">
        <span className="ornament">✦</span>
        <span className="text-[10px] tracking-[0.18em] uppercase text-[color:var(--ink-soft)] font-semibold">{title}</span>
        <div className="flex-1 divider-dashed"></div>
      </div>
      <div className="mx-5 space-y-2">
        {items.map((m) => <MissionCard key={m.id} lang={lang} m={m} nowH={nowH} place={place} isp={isp} runTest={runTest} />)}
      </div>
    </div>
  )
}

// Streak hero — the daily-return hook. A countdown bar makes the midnight
// deadline tangible: it drains through the day and turns urgent near the end,
// so loss aversion (don't break the chain) ramps exactly when it should.
function StreakHero({ lang, streakDays, nowH, runTest, setScreen }) {
  const onRun = () => {
    if (runTest) runTest()
    else if (setScreen) setScreen('home')
  }
  const hoursLeft = Math.max(0, 24 - nowH)
  const pct = Math.round(hoursLeft / 24 * 100)
  const urgent = hoursLeft <= 4
  const barColor = urgent ? 'var(--coral)' : 'var(--gold)'
  return (
    <div className="mx-5 mt-3 rounded-2xl p-4 text-white shadow-md relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, var(--teal) 0%, var(--teal-deep) 100%)' }}>
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center shrink-0 ring-1 ring-white/20">
          <Ico.flame className="w-7 h-7 text-[color:var(--gold)]" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-1.5">
            <span className="font-display text-[30px] leading-none">{streakDays}</span>
            <span className="text-[12px] text-white/80 font-semibold">{t(lang, 'day streak', 'দিনের স্ট্রিক')}</span>
          </div>
          <div className={'text-[11px] text-white/70 mt-0.5 ' + (lang === 'bn' ? 'font-bn' : '')}>
            {urgent
              ? t(lang, 'Almost out of time — test now!', 'প্রায় সময় শেষ — এখনই পরীক্ষা করুন!')
              : t(lang, 'Test before midnight to keep it alive', 'মধ্যরাতের আগে পরীক্ষা করে ধরে রাখুন')}
          </div>
        </div>
      </div>

      {/* Countdown bar — time left today to keep the streak */}
      <div className="mt-3">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[9px] tracking-[0.16em] uppercase text-white/55 font-semibold">{t(lang, 'Time left today', 'আজ বাকি সময়')}</span>
          <span className="font-mono-data text-[12px] font-bold" style={{ color: urgent ? 'var(--coral)' : 'var(--gold)' }}>
            {hoursLeft}h {t(lang, 'left', 'বাকি')}
          </span>
        </div>
        <div className="h-2 rounded-full bg-white/15 overflow-hidden">
          <div className={'h-full rounded-full transition-all ' + (urgent ? 'animate-pulse' : '')}
            style={{ width: pct + '%', background: barColor }}></div>
        </div>
      </div>

      <button onClick={onRun}
        className="mt-3.5 w-full py-2.5 rounded-xl bg-[color:var(--gold)] text-[color:var(--teal-deep)] font-semibold text-[13px] flex items-center justify-center gap-2 active:translate-y-px transition">
        <Ico.gauge className="w-4 h-4" />
        {t(lang, "Run today's test", 'আজকের পরীক্ষা চালান')}
      </button>
    </div>
  )
}

export default function Missions({ lang, user, runTest, setScreen, nowH, placeKey, ispKey }) {
  const streakDays = user?.streakDays ?? 0
  const hour = nowH ?? new Date().getHours()
  const place = PLACE_PRESETS.find((p) => p.key === (placeKey ?? 'home'))
  const isp = ISP_PRESETS.find((p) => p.key === (ispKey ?? 'gp'))
  const daily = MISSIONS.filter((m) => m.kind === 'Daily')
  const weekly = MISSIONS.filter((m) => m.kind === 'Weekly')
  const collections = MISSIONS.filter((m) => m.kind === 'Milestone')

  return (
    <div className="pb-28">
      <StatusBar />
      <div className="px-6 pt-4">
        <div className="flex items-center gap-2 text-[10px] tracking-[0.18em] uppercase text-[color:var(--gold)] font-semibold"><Ico.target className="w-3 h-3" />{t(lang, 'Civic duty', 'নাগরিক দায়িত্ব')}</div>
        <h1 className="font-display text-[28px] text-[color:var(--ink)] mt-1">{t(lang, 'Missions', 'মিশন')}</h1>
        <p className="text-[12px] text-[color:var(--ink-soft)] mt-1">{t(lang, 'Each test fills a gap in Bangladesh’s QoS map', 'প্রতিটি পরীক্ষা বাংলাদেশের QoS মানচিত্রের ফাঁক পূরণ করে')}</p>
      </div>

      <StreakHero lang={lang} streakDays={streakDays} nowH={hour} runTest={runTest} setScreen={setScreen} />

      <MissionSection lang={lang} title={t(lang, 'Daily', 'দৈনিক')} items={daily} nowH={hour} place={place} isp={isp} runTest={runTest} />
      <MissionSection lang={lang} title={t(lang, 'Weekly', 'সাপ্তাহিক')} items={weekly} nowH={hour} place={place} isp={isp} runTest={runTest} />
      <MissionSection lang={lang} title={t(lang, 'Collections', 'সংগ্রহ')} items={collections} nowH={hour} place={place} isp={isp} runTest={runTest} />
    </div>
  )
}