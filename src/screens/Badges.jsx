import { useState } from 'react'
import { Ico } from '../components/Icons.jsx'
import { StatusBar } from '../components/Header.jsx'
import { RankMedal } from '../components/UI.jsx'
import { t } from '../i18n/strings.js'
import { LEVELS, levelFromXp } from '../data/seed.js'

const STATE_META = {
  earned:  { en: 'Earned',  bn: 'অর্জিত',  color: 'var(--green)' },
  current: { en: 'Current', bn: 'বর্তমান', color: 'var(--teal)' },
  locked:  { en: 'Locked',  bn: 'লকড',     color: 'var(--mute)' },
}

const stateOf = (rank, level) => (rank.n < level ? 'earned' : rank.n === level ? 'current' : 'locked')

// Bottom-sheet detail for a single rank.
function RankDetailModal({ lang, rank, level, xp, close }) {
  const state = stateOf(rank, level)
  const meta = STATE_META[state]
  const floor = (LEVELS[rank.n - 2] || { xp: 0 }).xp        // previous threshold
  const span = Math.max(1, rank.xp - floor)
  const pct = Math.min(100, Math.max(0, Math.round(((xp - floor) / span) * 100)))
  const remaining = Math.max(0, rank.xp - xp)

  return (
    <div className="absolute inset-0 z-50 flex items-end overlay">
      <div className="absolute inset-0 bg-black/50" onClick={close}></div>
      <div className="relative w-full bg-[color:var(--cream)] rounded-t-3xl p-5 sheet max-h-[88%] overflow-y-auto">
        <div className="w-10 h-1.5 rounded-full bg-[color:var(--line)] mx-auto mb-4"></div>

        <div className="flex items-center gap-4">
          <RankMedal rank={rank} state={state} size={76} />
          <div className="min-w-0 flex-1">
            <div className="text-[10px] tracking-[0.16em] uppercase font-semibold text-[color:var(--mute)]">{t(lang, `Rank ${rank.n}`, `র‍্যাঙ্ক ${rank.n}`)}</div>
            <div className={'font-display text-[22px] text-[color:var(--ink)] leading-tight ' + (lang === 'bn' ? 'font-bn' : '')}>{t(lang, rank.title, rank.title_bn)}</div>
            <span className="chip mt-1.5 inline-flex" style={{ background: meta.color + '22', color: meta.color }}>
              {state === 'locked' ? <Ico.lock className="w-3 h-3" /> : <Ico.check2 className="w-3 h-3" />}
              <span>{t(lang, meta.en, meta.bn)}</span>
            </span>
          </div>
        </div>

        <div className={'mt-4 text-[13.5px] font-medium text-[color:var(--ink)] leading-snug ' + (lang === 'bn' ? 'font-bn' : '')}>
          {t(lang, rank.tagline_en, rank.tagline_bn)}
        </div>
        <div className={'text-[12px] text-[color:var(--ink-soft)] mt-1.5 leading-relaxed ' + (lang === 'bn' ? 'font-bn' : '')}>
          {t(lang, rank.blurb_en, rank.blurb_bn)}
        </div>

        <div className="mt-4 p-3.5 rounded-2xl bg-[color:var(--surface)] border border-[color:var(--line)]">
          <div className="flex items-baseline justify-between">
            <span className="text-[10px] tracking-[0.14em] uppercase text-[color:var(--mute)] font-semibold">{t(lang, 'Unlocks at', 'আনলক হয়')}</span>
            <span className="font-mono-data text-[12px] font-bold text-[color:var(--ink)]">{rank.xp} XP</span>
          </div>
          <div className="bar mt-2" style={{ background: 'var(--parchment-deep)' }}>
            <span style={{ width: pct + '%', background: state === 'locked' ? `linear-gradient(90deg, ${rank.c1}, ${rank.c2})` : 'linear-gradient(90deg, #F4C45F, #B8860B)' }}></span>
          </div>
          <div className="mt-1.5 text-[11px] text-[color:var(--ink-soft)]">
            {state === 'locked'
              ? t(lang, `${remaining} XP to go — keep testing to unlock`, `আনলক করতে আরও ${remaining} XP — পরীক্ষা চালিয়ে যান`)
              : t(lang, 'Unlocked. This rank is yours.', 'আনলকড। এই র‍্যাঙ্ক আপনার।')}
          </div>
        </div>

        <button onClick={close} className="btn-primary w-full py-3 rounded-xl font-semibold text-[13px] mt-4">{t(lang, 'Close', 'বন্ধ করুন')}</button>
      </div>
    </div>
  )
}

export default function Badges({ lang, setScreen, user }) {
  const [selected, setSelected] = useState(null)
  const level = levelFromXp(user.xp)
  const current = LEVELS[level - 1] || LEVELS[0]
  const next = LEVELS.find((l) => l.n === level + 1) || null
  const remaining = next ? Math.max(0, next.xp - user.xp) : 0
  const heroPct = next
    ? Math.min(100, Math.round(((user.xp - current.xp) / (next.xp - current.xp)) * 100))
    : 100

  return (
    <div className="pb-28">
      <StatusBar />
      <div className="px-5 pt-3 flex items-center gap-2">
        <button onClick={() => setScreen('about')} className="w-9 h-9 rounded-full bg-[color:var(--surface)] border border-[color:var(--line)] flex items-center justify-center">
          <Ico.chevronL className="w-4 h-4" />
        </button>
        <div className="font-display text-[18px] text-[color:var(--ink)]">{t(lang, 'Achievements', 'অর্জনসমূহ')}</div>
        <div className="ml-auto font-mono-data text-[11px] text-[color:var(--ink-soft)]">{level}/6</div>
      </div>

      <div className="px-6 mt-2">
        <p className="text-[12px] text-[color:var(--ink-soft)] leading-snug">{t(lang, 'Earn XP to climb 6 contributor ranks. Each one is yours to keep.', 'XP অর্জন করে ৬টি র‍্যাঙ্কে উঠুন। প্রতিটি চিরদিন আপনার।')}</p>
      </div>

      {/* Hero — current rank + progress to next */}
      <div className="fade-up mx-5 mt-3 rounded-2xl p-4 text-white shadow-md relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${current.c2} 0%, var(--teal-deep) 100%)` }}>
        <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full" style={{ background: `radial-gradient(circle, ${current.c1}55, transparent 70%)` }}></div>
        <div className="flex items-center gap-3.5 relative">
          <RankMedal rank={current} state="current" size={62} />
          <div className="min-w-0 flex-1">
            <div className="text-[9px] tracking-[0.18em] uppercase font-semibold" style={{ color: 'rgba(255,255,255,0.65)' }}>{t(lang, `Rank ${level} · Current`, `র‍্যাঙ্ক ${level} · বর্তমান`)}</div>
            <div className={'font-display text-[22px] leading-tight mt-0.5 ' + (lang === 'bn' ? 'font-bn' : '')}>{t(lang, current.title, current.title_bn)}</div>
            <div className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.8)' }}>{t(lang, current.tagline_en, current.tagline_bn)}</div>
          </div>
        </div>
        {next ? (
          <div className="mt-3.5 relative">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-semibold" style={{ color: 'rgba(255,255,255,0.75)' }}>{t(lang, `Next: ${next.title} ${next.emoji}`, `পরবর্তী: ${next.title_bn} ${next.emoji}`)}</span>
              <span className="font-mono-data text-[10.5px] font-bold text-white">{remaining} XP</span>
            </div>
            <div className="h-2 rounded-full bg-white/15 overflow-hidden">
              <div className="h-full rounded-full" style={{ width: heroPct + '%', background: `linear-gradient(90deg, ${next.c1}, var(--gold))` }}></div>
            </div>
          </div>
        ) : (
          <div className="mt-3.5 text-[11.5px] font-semibold relative" style={{ color: 'var(--gold-soft)' }}>{t(lang, 'You hold the highest rank in the country. 👑', 'আপনি দেশের সর্বোচ্চ র‍্যাঙ্ক ধারণ করেন। 👑')}</div>
        )}
      </div>

      {/* Journey — every rank as a step on the climb */}
      <div className="px-6 mt-5 flex items-center gap-2">
        <span className="ornament">✦</span>
        <span className="text-[10px] tracking-[0.18em] uppercase text-[color:var(--gold)] font-semibold">{t(lang, 'The climb', 'আরোহণ')}</span>
        <div className="flex-1 divider-dashed"></div>
      </div>

      <div className="mx-5 mt-3 relative">
        {/* vertical path line behind the medals */}
        <div className="absolute left-[27px] top-6 bottom-6 w-0.5 bg-[color:var(--line)]" aria-hidden></div>
        <div className="space-y-2.5 relative">
          {LEVELS.map((l) => {
            const state = stateOf(l, level)
            const meta = STATE_META[state]
            return (
              <button key={l.n} onClick={() => setSelected(l)}
                className={'w-full flex items-center gap-3.5 p-3 rounded-2xl text-left transition active:scale-[0.99] ' +
                  (state === 'current'
                    ? 'bg-[color:var(--surface)] border-2'
                    : 'bg-[color:var(--surface)] border border-[color:var(--line)] hover:bg-[color:var(--parchment)]/40')}
                style={state === 'current' ? { borderColor: l.accent } : undefined}>
                <RankMedal rank={l} state={state} size={50} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={'font-display text-[15.5px] leading-tight text-[color:var(--ink)] ' + (lang === 'bn' ? 'font-bn' : '')}>{t(lang, l.title, l.title_bn)}</span>
                  </div>
                  <div className={'text-[11px] mt-0.5 leading-snug ' + (state === 'locked' ? 'text-[color:var(--mute)]' : 'text-[color:var(--ink-soft)]') + (lang === 'bn' ? ' font-bn' : '')}>
                    {state === 'locked'
                      ? t(lang, `Unlocks at ${l.xp} XP`, `${l.xp} XP-তে আনলক`)
                      : t(lang, l.tagline_en, l.tagline_bn)}
                  </div>
                </div>
                <span className="text-[9.5px] font-bold uppercase tracking-[0.1em] px-2 py-0.5 rounded-full shrink-0" style={{ color: meta.color, background: meta.color + '1A' }}>
                  {t(lang, meta.en, meta.bn)}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {selected && (
        <RankDetailModal lang={lang} rank={selected} level={level} xp={user.xp} close={() => setSelected(null)} />
      )}
    </div>
  )
}
