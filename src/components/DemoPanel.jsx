import { Ico } from './Icons.jsx'
import { PERSONAS } from '../data/personas.js'
import { BADGES, PREVIEW_TIMES, PLACE_PRESETS, ISP_PRESETS } from '../data/seed.js'
import { t } from '../i18n/strings.js'

// Dark-panel segmented control used by the Missions time/location preview.
function PreviewSeg({ lang, options, value, onChange }) {
  return (
    <div className="flex gap-1.5">
      {options.map((o) => {
        const v = o.val ?? o.key
        const on = value === v
        const Glyph = Ico[o.icon] || Ico.clock
        return (
          <button key={v} onClick={() => onChange(v)}
            className={'flex-1 py-2 rounded-lg text-[11px] font-semibold flex flex-col items-center gap-1 transition ' + (on ? 'bg-[color:var(--gold)] text-white' : 'bg-white/5 hover:bg-white/10 text-white/70')}>
            <Glyph className="w-4 h-4" />
            {t(lang, o.label_en, o.label_bn)}
          </button>
        )
      })}
    </div>
  )
}

export default function DemoPanel({ activePersona, applyPersona, triggerLevelUp, triggerBadge, triggerMission, forcedState, setForcedState, lang, previewHour, setPreviewHour, previewPlace, setPreviewPlace, previewIsp, setPreviewIsp, close }) {
  const personaKeys = Object.keys(PERSONAS)
  const forcedStates = [
    { k: 'loading', label: 'Loading' },
    { k: 'networkError', label: 'Network error' },
    { k: 'gpsDenied', label: 'GPS denied' },
    { k: 'testFailed', label: 'Test failed' },
    { k: 'serverDown', label: 'Server unreachable' },
    { k: 'vpn', label: 'VPN detected' },
  ]
  const badgesToTrigger = BADGES.slice(0, 6)

  return (
    <div className="fixed inset-0 z-[300] flex items-end justify-center overlay" onClick={close}>
      <div className="absolute inset-0 bg-black/60"></div>
      <div onClick={(e) => e.stopPropagation()} className="relative w-full max-w-[480px] bg-[color:var(--ink)] text-white rounded-t-3xl shadow-2xl max-h-[85vh] overflow-y-auto sheet">
        <div className="sticky top-0 bg-[color:var(--ink)] p-5 border-b border-white/10 flex items-center justify-between z-10">
          <div>
            <div className="text-[10px] tracking-[0.2em] uppercase text-[color:var(--gold-soft)] font-semibold">Behind the curtain</div>
            <div className="font-display text-[22px] mt-0.5">Demo controls</div>
            <div className="text-[10.5px] text-white/50 mt-1">Trigger edge cases that don't happen in normal flows</div>
          </div>
          <button onClick={close} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition shrink-0">
            <Ico.close className="w-5 h-5" />
          </button>
        </div>

        <div className="px-5 py-4 border-b border-white/10">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[10px] tracking-[0.18em] uppercase text-[color:var(--gold-soft)] font-semibold">1 · Personas</span>
            <div className="flex-1 h-px bg-white/10"></div>
          </div>
          <div className="text-[11px] text-white/60 mb-3">Pre-baked user states. Pick one and navigate the app — every screen reflects that state.</div>
          <div className="grid grid-cols-1 gap-2">
            {personaKeys.map((k) => {
              const p = PERSONAS[k]
              const active = activePersona === k
              return (
                <button key={k} onClick={() => applyPersona(k)}
                  className={'p-3 rounded-xl text-left transition flex items-center gap-3 ' + (active ? 'bg-[color:var(--gold)] text-white' : 'bg-white/5 hover:bg-white/10 text-white')}>
                  <div className="text-[22px] shrink-0">{p.emoji}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-display text-[15px] leading-tight">{p.name}</div>
                    <div className={'text-[11px] mt-0.5 ' + (active ? 'text-white/85' : 'text-white/55')}>{p.desc}</div>
                  </div>
                  {active && <Ico.check className="w-5 h-5 shrink-0" />}
                </button>
              )
            })}
          </div>
        </div>

        <div className="px-5 py-4 border-b border-white/10">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[10px] tracking-[0.18em] uppercase text-[color:var(--gold-soft)] font-semibold">2 · Trigger celebrations</span>
            <div className="flex-1 h-px bg-white/10"></div>
          </div>
          <div className="text-[11px] text-white/60 mb-3">One-shot animations that play once. Use these to demo the moment, not a state.</div>
          <div className="grid grid-cols-1 gap-2">
            <button onClick={triggerLevelUp} className="p-3 rounded-xl bg-white/5 hover:bg-white/10 transition flex items-center gap-3 text-left">
              <div className="w-10 h-10 rounded-lg bg-[color:var(--gold)]/20 flex items-center justify-center"><Ico.sparkle className="w-5 h-5 text-[color:var(--gold-soft)]" /></div>
              <div className="flex-1">
                <div className="font-semibold text-[13.5px]">Level up animation</div>
                <div className="text-[10.5px] text-white/55">Full-screen celebration with new level title</div>
              </div>
              <Ico.chevronR className="w-4 h-4 text-white/40" />
            </button>
            <button onClick={triggerMission} className="p-3 rounded-xl bg-white/5 hover:bg-white/10 transition flex items-center gap-3 text-left">
              <div className="w-10 h-10 rounded-lg bg-[color:var(--green)]/20 flex items-center justify-center"><Ico.check className="w-5 h-5 text-[color:var(--green)]" /></div>
              <div className="flex-1">
                <div className="font-semibold text-[13.5px]">Mission complete</div>
                <div className="text-[10.5px] text-white/55">Modal with XP burst and mission name</div>
              </div>
              <Ico.chevronR className="w-4 h-4 text-white/40" />
            </button>
            <div>
              <div className="text-[11px] text-white/60 mb-2 mt-1">Badge earned:</div>
              <div className="grid grid-cols-3 gap-2">
                {badgesToTrigger.map((b) => {
                  const tierColor = { bronze: '#B8651C', silver: '#7A8A92', gold: '#B8860B', platinum: '#26514D' }[b.tier]
                  return (
                    <button key={b.id} onClick={() => triggerBadge(b.id)} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition text-center">
                      <svg viewBox="0 0 60 60" className="w-9 h-9 mx-auto">
                        <polygon points="30,4 56,18 56,42 30,56 4,42 4,18" fill={tierColor} />
                        <text x="30" y="38" textAnchor="middle" fontFamily="Fraunces, serif" fontSize="22" fontWeight="600" fill="white">{b.name_en[0]}</text>
                      </svg>
                      <div className="text-[9.5px] font-semibold mt-1 leading-tight">{b.name_en}</div>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="px-5 py-4 border-b border-white/10">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[10px] tracking-[0.18em] uppercase text-[color:var(--gold-soft)] font-semibold">3 · Force states</span>
            <div className="flex-1 h-px bg-white/10"></div>
          </div>
          <div className="text-[11px] text-white/60 mb-3">Show error / loading / permission-denied states that normally only appear under specific conditions.</div>
          <div className="grid grid-cols-2 gap-2">
            {forcedStates.map((s) => {
              const active = forcedState === s.k
              return (
                <button key={s.k} onClick={() => setForcedState(s.k)}
                  className={'p-2.5 rounded-lg text-left transition text-[12px] font-semibold ' + (active ? 'bg-[color:var(--coral)] text-white' : 'bg-white/5 hover:bg-white/10 text-white')}>
                  {s.label}
                </button>
              )
            })}
          </div>
          {forcedState !== 'normal' && (
            <button onClick={() => setForcedState('normal')} className="w-full mt-2 py-2 rounded-lg bg-white/10 text-[11px] font-semibold">
              Clear forced state
            </button>
          )}
        </div>

        <div className="px-5 py-4 border-b border-white/10">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[10px] tracking-[0.18em] uppercase text-[color:var(--gold-soft)] font-semibold">4 · Missions preview</span>
            <div className="flex-1 h-px bg-white/10"></div>
          </div>
          <div className="text-[11px] text-white/60 mb-3">Drive the simulated time of day and location to see how the Missions time-window and place cards change. In the real app these come from the device clock + network/GPS.</div>
          <div className="text-[10px] text-white/45 font-semibold mb-1.5 flex items-center gap-1"><Ico.clock className="w-3 h-3" />Time of day</div>
          <PreviewSeg lang={lang} options={PREVIEW_TIMES} value={previewHour} onChange={setPreviewHour} />
          <div className="text-[10px] text-white/45 font-semibold mb-1.5 mt-3 flex items-center gap-1"><Ico.pin className="w-3 h-3" />Your location</div>
          <PreviewSeg lang={lang} options={PLACE_PRESETS} value={previewPlace} onChange={setPreviewPlace} />
          <div className="text-[10px] text-white/45 font-semibold mb-1.5 mt-3 flex items-center gap-1"><Ico.network className="w-3 h-3" />Your provider</div>
          <PreviewSeg lang={lang} options={ISP_PRESETS} value={previewIsp} onChange={setPreviewIsp} />
        </div>

        <div className="px-5 py-4">
          <div className="text-[10.5px] text-white/45 leading-relaxed">
            <span className="font-semibold text-white/65">Tip:</span> Pick the <span className="text-[color:var(--gold-soft)]">Near level-up</span> persona, then run a test from Home — the level-up animation will fire naturally when you cross the XP threshold.
          </div>
        </div>
      </div>
    </div>
  )
}