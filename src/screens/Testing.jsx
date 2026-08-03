import { Ico } from '../components/Icons.jsx'
import { StatusBar } from '../components/Header.jsx'
import { MiniStat } from '../components/UI.jsx'
import { t } from '../i18n/strings.js'

const STAGES_FULL = [
  { k: 'stability',   label_en: 'Checking stability',     label_bn: 'স্থিতিশীলতা যাচাই' },
  { k: 'speed',       label_en: 'Measuring speed',        label_bn: 'গতি পরিমাপ' },
  { k: 'reliability', label_en: 'Detecting reliability',  label_bn: 'নির্ভরযোগ্যতা শনাক্তকরণ' },
]
const STAGES_QUICK = [
  { k: 'speed', label_en: 'Measuring speed', label_bn: 'গতি পরিমাপ' },
]

export default function Testing({ lang, testState, requestCancel, testMode }) {
  if (!testState) return null
  const { stage, pct, down, lat, jitter, loss } = testState
  const mode = testState.mode || testMode || 'full'
  const stages = mode === 'quick' ? STAGES_QUICK : STAGES_FULL
  const curIdx = Math.max(0, stages.findIndex((s) => s.k === stage))
  const cur = stages[curIdx] || stages[0]
  const circ = 283
  const offset = circ - (circ * Math.min(100, pct || 0)) / 100
  const mainValue = stage === 'speed' ? down : stage === 'reliability' ? down : (lat || 0)
  const mainLabel = stage === 'reliability'
    ? t(lang, 'Stability', 'স্থিতিশীলতা')
    : stage === 'speed'
    ? t(lang, 'Download', 'ডাউনলোড')
    : t(lang, 'Latency', 'লেটেন্সি')
  const mainUnit = stage === 'stability' ? 'ms' : 'Mbps'
  const subTimeline = mode === 'quick'
    ? t(lang, 'Keep the app open — about 7 seconds.', 'অ্যাপ খোলা রাখুন — প্রায় ৭ সেকেন্ড।')
    : t(lang, 'Keep the app open — about 11 seconds.', 'অ্যাপ খোলা রাখুন — প্রায় ১১ সেকেন্ড।')

  return (
    <div className="pb-6">
      <StatusBar />
      <div className="px-5 pt-3 pb-2 flex items-center gap-2">
        <div className="text-[11px] tracking-[0.14em] uppercase text-[color:var(--mute)] font-semibold">{t(lang, 'Testing in progress', 'পরীক্ষা চলছে')}</div>
        <span className="chip bg-[color:var(--teal-soft)] text-[color:var(--teal-deep)]">{mode === 'quick' ? t(lang, 'Quick', 'দ্রুত') : t(lang, 'Full QoS', 'সম্পূর্ণ QoS')}</span>
        <button onClick={requestCancel} className="ml-auto flex items-center gap-1.5 text-[12px] font-semibold text-[color:var(--coral)] px-3 py-1.5 rounded-full border border-[color:var(--coral)]/40 bg-[color:var(--surface)] hover:bg-[color:var(--coral)]/10 transition">
          <Ico.close className="w-3.5 h-3.5" />
          <span>{t(lang, 'Cancel', 'বাতিল')}</span>
        </button>
      </div>
      <div className="px-6 pt-1">
        <h1 className={'font-display text-[26px] text-[color:var(--ink)] leading-tight ' + (lang === 'bn' ? 'font-bn' : '')}>
          {lang === 'bn' ? cur.label_bn : cur.label_en}…
        </h1>
        <p className="text-[12px] text-[color:var(--ink-soft)] mt-1">{subTimeline}</p>
      </div>

      <div className="mt-5 flex items-center justify-center relative">
        <svg width="240" height="240" viewBox="0 0 120 120" className="-rotate-90">
          <defs>
            <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0C6D91"/>
              <stop offset="100%" stopColor="#083F56"/>
            </linearGradient>
          </defs>
          <circle cx="60" cy="60" r="45" stroke="#EFE8D9" strokeWidth="8" fill="none"/>
          <circle cx="60" cy="60" r="45" stroke="url(#g1)" strokeWidth="8" strokeLinecap="round" fill="none"
            style={{ strokeDasharray: circ, strokeDashoffset: offset, transition: 'stroke-dashoffset 0.5s cubic-bezier(.2,.7,.3,1)' }} />
        </svg>
        <div className="absolute text-center">
          <div className="text-[10px] tracking-[0.2em] font-semibold text-[color:var(--mute)] uppercase">{mainLabel}</div>
          <div className="font-mono-data text-[44px] font-bold text-[color:var(--ink)] leading-none mt-1">{(mainValue || 0).toFixed(1)}</div>
          <div className="text-[11px] text-[color:var(--ink-soft)] mt-1">{mainUnit}</div>
        </div>
      </div>

      <div className="mx-5 mt-5 grid grid-cols-3 gap-2">
        {stages.map((s, i) => {
          const done = i < curIdx
          const active = i === curIdx
          return (
            <div key={s.k} className={'p-2.5 rounded-xl text-center transition ' + (active ? 'bg-[color:var(--teal-soft)] ring-1 ring-[color:var(--teal)]/40' : done ? 'bg-[color:var(--green-soft)]' : 'bg-[color:var(--surface)] border border-[color:var(--line)]')}>
              <div className="flex items-center justify-center mb-1">
                {done ? <Ico.check className="w-4 h-4 text-[color:var(--green)]" /> :
                  active ? <span className="w-2 h-2 rounded-full bg-[color:var(--teal)] pulse-soft"></span> :
                  <span className="w-2 h-2 rounded-full bg-[color:var(--mute)]"></span>}
              </div>
              <div className={'text-[10.5px] font-semibold ' + (active ? 'text-[color:var(--teal-deep)]' : done ? 'text-[color:var(--green)]' : 'text-[color:var(--mute)]')}>
                {lang === 'bn' ? s.label_bn : s.label_en.split(' ').slice(-1)[0]}
              </div>
            </div>
          )
        })}
      </div>

      <div className="mx-5 mt-4 p-3 rounded-xl bg-[color:var(--parchment)] border border-[color:var(--parchment-deep)] flex items-start gap-2">
        <Ico.info className="w-3.5 h-3.5 text-[color:var(--ink-soft)] mt-0.5 shrink-0" />
        <div className="text-[10.5px] text-[color:var(--ink-soft)] leading-snug">{t(lang, "You're on WiFi. This test will use ~30MB.", 'আপনি WiFi-তে। ~৩০MB ডেটা ব্যবহার হবে।')}</div>
      </div>

      <div className="mx-5 mt-3 grid grid-cols-3 gap-2">
        <MiniStat label={t(lang, 'Latency', 'লেটেন্সি')} value={lat ? lat + 'ms' : '—'} />
        <MiniStat label={t(lang, 'Jitter', 'জিটার')} value={jitter ? jitter + 'ms' : '—'} />
        <MiniStat label={t(lang, 'Loss', 'লস')} value={(loss !== undefined && loss !== 0) ? loss + '%' : '—'} />
      </div>
    </div>
  )
}
