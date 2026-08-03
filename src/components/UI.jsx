import { Ico } from './Icons.jsx'
import { t } from '../i18n/strings.js'
import { LEVELS, levelFromXp } from '../data/seed.js'

// Contributor card — the rank-led summary shown on Home and Profile. Leads with
// the current achievement badge emoji and a linear progress bar to the next
// rank. `onClick` lets each screen route it (Home → profile, Profile → rewards);
// `className` carries per-screen spacing/animation.
export function ContributorCard({ lang, user, onClick, className = '' }) {
  const rankLevel = levelFromXp(user.xp)
  const rank = LEVELS[rankLevel - 1] || LEVELS[0]
  const nextRank = LEVELS[rankLevel] || null
  const lvlPct = nextRank ? Math.min(100, Math.round(((user.xp - rank.xp) / (nextRank.xp - rank.xp)) * 100)) : 100
  return (
    <button onClick={onClick}
      className={'mx-5 w-[calc(100%-40px)] rounded-2xl text-left relative overflow-hidden text-white ' + className}
      style={{ background: 'linear-gradient(135deg, var(--teal-deep), var(--teal))', boxShadow: '0 4px 12px -4px rgba(7,59,82,0.25)' }}>
      <div className="px-3.5 pt-3 pb-2.5">
        <div className="flex items-center justify-between">
          <div className="text-[9.5px] tracking-[0.16em] uppercase font-semibold" style={{ color: 'rgba(244,235,200,0.85)' }}>
            {t(lang, 'Contributor', 'অবদানকারী')} <span className="mx-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>·</span> {t(lang, 'Level', 'লেভেল')} {rankLevel}
          </div>
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.12)' }}>
            <Ico.flame className="w-2.5 h-2.5" style={{ color: '#FFB347' }} />
            <span className="font-mono-data text-[10.5px] font-semibold">{user.streakDays}d</span>
          </div>
        </div>

        <div className="flex items-center gap-3 mt-2.5">
          {/* Current achievement badge — the rank emoji */}
          <div className="shrink-0 w-[46px] h-[46px] rounded-full flex items-center justify-center ring-1 ring-white/20"
            style={{ background: `linear-gradient(140deg, ${rank.c1}, ${rank.c2})`, boxShadow: `0 3px 10px -3px ${rank.accent}` }}>
            <span aria-hidden style={{ fontSize: 24, lineHeight: 1 }}>{rank.emoji}</span>
          </div>
          <div className="min-w-0 flex-1">
            <div className={'font-display text-[18px] leading-tight ' + (lang === 'bn' ? 'font-bn' : '')}>{t(lang, rank.title, rank.title_bn)}</div>
            <div className="font-mono-data text-[11px] mt-0.5">
              <span className="font-semibold text-white">{user.xp}</span>
              <span style={{ color: 'rgba(255,255,255,0.6)' }}>/{user.xpToNext} XP</span>
              {nextRank && (
                <span style={{ color: 'rgba(255,255,255,0.6)' }}> · {Math.max(0, nextRank.xp - user.xp)} {t(lang, 'to L', 'L')}{rankLevel + 1}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="px-3.5 py-2.5" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        {nextRank ? (
          <>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-semibold tracking-wide" style={{ color: 'rgba(244,235,200,0.85)' }}>
                {t(lang, 'Next', 'পরবর্তী')}: {t(lang, nextRank.title, nextRank.title_bn)} {nextRank.emoji}
              </span>
              <span className="font-mono-data text-[10.5px] font-bold text-white">{lvlPct}%</span>
            </div>
            <div className="h-2 rounded-full bg-white/15 overflow-hidden">
              <div className="h-full rounded-full" style={{ width: lvlPct + '%', background: 'linear-gradient(90deg, #E8B84B, #C8930F)' }}></div>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-1.5 text-[11.5px] font-semibold" style={{ color: 'var(--gold-soft)' }}>
            <span>{rank.emoji}</span>{t(lang, 'Top rank reached', 'সর্বোচ্চ র‍্যাঙ্ক অর্জিত')}
          </div>
        )}
      </div>
    </button>
  )
}

// A collectible rank badge: an emoji character on a themed gradient medal.
// state: 'earned' (full colour) · 'current' (full colour + accent ring) ·
// 'locked' (greyed, teased, with a small lock). Drives both the Profile strip
// and the Ranks journey screen, so the look stays identical everywhere.
export function RankMedal({ rank, state = 'locked', size = 56 }) {
  const locked = state === 'locked'
  const current = state === 'current'
  const ring = Math.max(2, Math.round(size * 0.055))
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <div
        className="w-full h-full rounded-full flex items-center justify-center"
        style={{
          background: locked ? 'var(--parchment-deep)' : `linear-gradient(140deg, ${rank.c1}, ${rank.c2})`,
          boxShadow: current
            ? `0 0 0 ${ring}px var(--surface), 0 0 0 ${ring * 2}px ${rank.accent}, 0 6px 18px -6px ${rank.accent}99`
            : (locked ? 'inset 0 0 0 1px var(--line)' : `0 5px 16px -6px ${rank.accent}88`),
        }}>
        <span
          aria-hidden
          style={{ fontSize: Math.round(size * 0.46), lineHeight: 1, opacity: locked ? 0.45 : 1, filter: locked ? 'grayscale(1)' : 'none' }}>
          {rank.emoji}
        </span>
      </div>
      {locked && (
        <span className="absolute -bottom-0.5 -right-0.5 rounded-full bg-[color:var(--surface)] border border-[color:var(--line)] flex items-center justify-center"
          style={{ width: size * 0.34, height: size * 0.34 }}>
          <Ico.lock style={{ width: size * 0.2, height: size * 0.2 }} className="text-[color:var(--mute)]" />
        </span>
      )}
      {state === 'earned' && (
        <span className="absolute -bottom-0.5 -right-0.5 rounded-full bg-[color:var(--green)] border-2 border-[color:var(--surface)] flex items-center justify-center"
          style={{ width: size * 0.34, height: size * 0.34 }}>
          <Ico.check style={{ width: size * 0.2, height: size * 0.2 }} className="text-white" />
        </span>
      )}
    </div>
  )
}

export function OrnamentRule() {
  return (
    <div className="flex items-center gap-2 px-5 my-1 opacity-70">
      <div className="flex-1 divider-dashed"></div>
      <span className="ornament">✦ ✧ ✦</span>
      <div className="flex-1 divider-dashed"></div>
    </div>
  )
}

export function MiniStat({ label, value }) {
  return (
    <div className="p-3 rounded-xl bg-[color:var(--surface)] border border-[color:var(--line)]">
      <div className="text-[9px] tracking-[0.16em] uppercase text-[color:var(--mute)] font-semibold">{label}</div>
      <div className="font-mono-data font-semibold text-[15px] text-[color:var(--ink)] mt-0.5">{value}</div>
    </div>
  )
}

export function QoSRow({ label, value, status, last }) {
  const color = status === 'good' ? 'var(--green)' : status === 'warn' ? 'var(--amber)' : 'var(--coral)'
  return (
    <div className={'flex items-center py-2 ' + (last ? '' : 'border-b border-[color:var(--line)]/60')}>
      <span className="w-2 h-2 rounded-full mr-2.5" style={{ background: color }}></span>
      <span className="text-[13px] text-[color:var(--ink)] flex-1">{label}</span>
      <span className="font-mono-data font-semibold text-[13px] text-[color:var(--ink)]">{value}</span>
    </div>
  )
}

export function ConsentRow({ icon, title, desc, required, value, onChange }) {
  return (
    <div className={'p-3.5 rounded-xl flex gap-3 items-start ' + (value ? 'bg-[color:var(--surface)] border border-[color:var(--teal)]/30 ring-1 ring-[color:var(--teal)]/10' : 'bg-[color:var(--surface)] border border-[color:var(--line)]')}>
      <div className="w-9 h-9 rounded-lg bg-[color:var(--teal-soft)] flex items-center justify-center shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-[13px] text-[color:var(--ink)]">{title}</span>
          {required && <span className="chip bg-[color:var(--gold-soft)] text-[color:var(--gold)]">Required</span>}
        </div>
        <p className="text-[11.5px] text-[color:var(--ink-soft)] leading-snug mt-0.5">{desc}</p>
      </div>
      <button
        onClick={() => onChange(!value)}
        className={'w-10 h-6 rounded-full transition relative shrink-0 ' + (value ? 'bg-[color:var(--teal)]' : 'bg-[color:var(--parchment-deep)]')}>
        <span className={'absolute top-0.5 w-5 h-5 rounded-full bg-[color:var(--surface)] shadow-sm transition-all ' + (value ? 'left-[18px]' : 'left-0.5')}></span>
      </button>
    </div>
  )
}

export function TestModeCard({ active, onClick, title, desc, xp, highlight }) {
  return (
    <button onClick={onClick} className={'p-3 rounded-xl text-left transition relative overflow-hidden ' + (active ? 'bg-[color:var(--teal)] text-white ring-2 ring-[color:var(--teal-deep)]' : 'bg-[color:var(--surface)] border border-[color:var(--line)] text-[color:var(--ink)] hover:bg-[color:var(--parchment)]')}>
      {highlight && !active && <span className="absolute top-1.5 right-1.5 chip bg-[color:var(--gold-soft)] text-[color:var(--gold)]">Best</span>}
      <div className="font-display text-[17px] leading-tight">{title}</div>
      <div className={'text-[10.5px] mt-0.5 ' + (active ? 'text-white/70' : 'text-[color:var(--mute)]')}>{desc}</div>
      <div className={'mt-1.5 font-mono-data text-[11px] font-semibold ' + (active ? 'text-[color:var(--gold-soft)]' : 'text-[color:var(--gold)]')}>{xp} XP</div>
    </button>
  )
}

export function StatCell({ label, value }) {
  return (
    <div className="text-center">
      <div className="font-mono-data font-bold text-[18px] text-[color:var(--ink)]">{value}</div>
      <div className="text-[9px] tracking-[0.12em] uppercase text-[color:var(--mute)] font-semibold mt-0.5">{label}</div>
    </div>
  )
}

export function QuickAccessCard({ icon, label, value, onClick }) {
  return (
    <button onClick={onClick} className="p-3.5 rounded-xl bg-[color:var(--surface)] border border-[color:var(--line)] text-left flex items-center gap-3 hover:bg-[color:var(--parchment)]/40 transition">
      <div className="w-10 h-10 rounded-lg bg-[color:var(--teal-soft)] flex items-center justify-center text-[color:var(--teal)] shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="text-[11px] text-[color:var(--mute)]">{label}</div>
        <div className="font-semibold text-[13px] text-[color:var(--ink)] truncate">{value}</div>
      </div>
      <Ico.chevronR className="w-4 h-4 text-[color:var(--mute)]" />
    </button>
  )
}

export function ProfileRow({ label, value, badge, last }) {
  return (
    <div className={'flex items-center justify-between px-4 py-3 ' + (last ? '' : 'border-b border-[color:var(--line)]/60')}>
      <span className="text-[12.5px] text-[color:var(--ink-soft)]">{label}</span>
      <div className="flex items-center gap-2">
        <span className="font-semibold text-[13px] text-[color:var(--ink)]">{value}</span>
        {badge && <span className="chip bg-[color:var(--green-soft)] text-[color:var(--green)]">{badge}</span>}
      </div>
    </div>
  )
}

export function FieldBlock({ label, value }) {
  return (
    <div className="p-3.5 rounded-xl bg-[color:var(--surface)] border border-[color:var(--line)] flex items-center justify-between">
      <div className="text-[12px] text-[color:var(--ink-soft)]">{label}</div>
      <div className="font-semibold text-[13px] text-[color:var(--ink)]">{value}</div>
    </div>
  )
}

export function ReliabilityArc({ verdict }) {
  if (!verdict) return null
  const arcMap = { excellent: 95, good: 70, poor: 42, unstable: 22 }
  const pct = arcMap[verdict.key] || 50
  const circ = 251
  const offset = circ - (circ * pct) / 100
  return (
    <div className="relative w-20 h-20 shrink-0">
      <svg viewBox="0 0 100 100" className="-rotate-90 w-20 h-20">
        <circle cx="50" cy="50" r="40" stroke="var(--parchment-deep)" strokeWidth="8" fill="none" />
        <circle cx="50" cy="50" r="40" stroke={verdict.dot} strokeWidth="8" strokeLinecap="round" fill="none"
          style={{ strokeDasharray: circ, strokeDashoffset: offset, transition: 'stroke-dashoffset 0.8s cubic-bezier(.2,.7,.3,1)' }} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="w-3 h-3 rounded-full pulse-soft" style={{ background: verdict.dot, boxShadow: '0 0 0 6px ' + verdict.bg }}></span>
      </div>
    </div>
  )
}

export function UseCaseChip({ status, icon, label, delay }) {
  const cfg = {
    ok:      { color: 'var(--green)', bg: 'var(--green-soft)', badge: <Ico.check2 className="w-2.5 h-2.5" /> },
    partial: { color: 'var(--amber)', bg: 'var(--amber-soft)', badge: <Ico.partial className="w-2.5 h-2.5" /> },
    fail:    { color: 'var(--coral)', bg: 'var(--coral-soft)', badge: <Ico.cross className="w-2.5 h-2.5" /> },
  }[status] || { color: 'var(--mute)', bg: 'var(--parchment)', badge: null }
  return (
    <div className="relative flex flex-col items-center gap-1.5 px-2 pt-2.5 pb-2 rounded-xl bg-[color:var(--surface)] border border-[color:var(--line)] fade-up"
      style={{ animationDelay: (delay || 0) + 's' }}>
      <div className="relative">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: cfg.bg, color: cfg.color }}>
          {icon}
        </div>
        {cfg.badge && (
          <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-white" style={{ background: cfg.color, color: 'white' }}>
            {cfg.badge}
          </div>
        )}
      </div>
      <div className="text-[10.5px] font-semibold text-[color:var(--ink)] leading-tight text-center w-full truncate">{label}</div>
    </div>
  )
}

export function ImpactLine({ children, lang }) {
  return (
    <div className="flex items-start gap-2 px-2">
      <Ico.impact className="w-4 h-4 mt-0.5 text-[color:var(--gold)] shrink-0" />
      <p className={'font-display italic text-[14px] leading-snug text-[color:var(--gold)] ' + (lang === 'bn' ? 'font-bn not-italic' : '')}>{children}</p>
    </div>
  )
}

export function MetricRow({ icon, label, interpretation, value, last }) {
  return (
    <div className={'flex items-center py-2.5 gap-3 ' + (last ? '' : 'border-b border-[color:var(--line)]/60')}>
      <div className="w-8 h-8 rounded-lg bg-[color:var(--teal-soft)] text-[color:var(--teal)] flex items-center justify-center shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="text-[10px] tracking-[0.12em] uppercase text-[color:var(--mute)] font-semibold">{label}</div>
        <div className="text-[12.5px] text-[color:var(--ink)] leading-snug">{interpretation}</div>
      </div>
      <div className="font-mono-data text-[11.5px] text-[color:var(--ink-soft)] text-right shrink-0">{value}</div>
    </div>
  )
}

export function BadgeCard({ badge, lang, locked, onClick }) {
  const tierColor = { bronze: '#B8651C', silver: '#7A8A92', gold: '#B8860B', platinum: '#26514D' }[badge.tier]
  return (
    <button onClick={onClick} className={'p-3 rounded-xl bg-[color:var(--surface)] border text-center transition active:scale-[0.97] hover:bg-[color:var(--parchment)]/50 ' + (locked ? 'border-[color:var(--line)] opacity-60' : 'border-[color:var(--gold)]/30')}>
      <div className="relative mx-auto w-14 h-14 mb-2">
        <svg viewBox="0 0 60 60" className="w-full h-full">
          <polygon points="30,4 56,18 56,42 30,56 4,42 4,18" fill={locked ? '#D6CEB7' : tierColor} opacity={locked ? 0.6 : 1} />
          <polygon points="30,10 50,22 50,38 30,50 10,38 10,22" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
          <text x="30" y="36" textAnchor="middle" fontFamily="Fraunces, serif" fontSize="22" fontWeight="600" fill="white">{badge.name_en[0]}</text>
        </svg>
        {locked && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Ico.lock className="w-5 h-5 text-white drop-shadow" />
          </div>
        )}
      </div>
      <div className={'font-display text-[12px] leading-tight text-[color:var(--ink)] ' + (lang === 'bn' ? 'font-bn' : '')}>{lang === 'bn' ? badge.name_bn : badge.name_en}</div>
      <div className="text-[9px] tracking-[0.1em] uppercase font-semibold mt-0.5" style={{ color: locked ? 'var(--mute)' : tierColor }}>{badge.tier}</div>
    </button>
  )
}