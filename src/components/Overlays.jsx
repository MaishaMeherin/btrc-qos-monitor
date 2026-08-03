import { Ico } from './Icons.jsx'
import { t } from '../i18n/strings.js'

export function LevelUpOverlay({ data, onClose, lang = 'en' }) {
  const c2 = data.c2 || '#8B6914'
  const title = lang === 'bn' && data.title_bn ? data.title_bn : data.title
  return (
    <div className="absolute inset-0 z-[100] flex items-center justify-center overflow-hidden overlay"
      style={{ background: `radial-gradient(circle at 50% 38%, ${c2} 0%, #083F56 72%, #042634 100%)` }}>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-72 h-72 rounded-full border-2 border-dashed border-[color:var(--gold-soft)]/40 animate-pulse"></div>
        <div className="absolute w-52 h-52 rounded-full" style={{ background: `radial-gradient(circle, ${data.c1 || '#F4C45F'}44 0%, transparent 65%)` }}></div>
      </div>
      <div className="relative text-center text-white px-6 xp-pop">
        <div className="flex items-center justify-center gap-1.5 mb-3">
          <Ico.sparkle className="w-4 h-4 text-[color:var(--gold-soft)]" />
          <div className="text-[11px] tracking-[0.32em] uppercase text-white/80 font-semibold">{t(lang, 'Rank Unlocked', 'নতুন র‍্যাঙ্ক')}</div>
          <Ico.sparkle className="w-4 h-4 text-[color:var(--gold-soft)]" />
        </div>
        {data.emoji && (
          <div className="mx-auto mb-3 w-28 h-28 rounded-full flex items-center justify-center drop-shadow-2xl"
            style={{ background: `linear-gradient(140deg, ${data.c1 || '#F4C45F'}, ${c2})`, boxShadow: `0 0 0 5px rgba(255,255,255,0.12)` }}>
            <span style={{ fontSize: 60, lineHeight: 1 }}>{data.emoji}</span>
          </div>
        )}
        <div className="font-display text-[18px] tracking-[0.18em] uppercase text-[color:var(--gold-soft)] mb-1">{t(lang, `Rank ${data.level}`, `র‍্যাঙ্ক ${data.level}`)}</div>
        <div className={'font-display text-[38px] leading-tight font-semibold ' + (lang === 'bn' ? 'font-bn' : '')}>{title}</div>
        <div className="text-[12px] text-white/75 mt-4 max-w-[280px] mx-auto leading-relaxed">
          {t(lang, "You've climbed to a new contributor rank. Keep testing to strengthen Bangladesh's QoS data.", 'আপনি নতুন অবদানকারী র‍্যাঙ্কে উঠেছেন। বাংলাদেশের QoS ডেটা শক্তিশালী করতে পরীক্ষা চালিয়ে যান।')}
        </div>
        <button onClick={onClose} className="mt-7 px-8 py-3 rounded-full bg-[color:var(--surface)] text-[color:var(--teal-deep)] font-semibold text-[13px] tracking-wide shadow-lg hover:bg-[color:var(--gold-soft)] transition">
          {t(lang, 'Continue', 'চালিয়ে যান')}
        </button>
      </div>
    </div>
  )
}

export function BadgeEarnedOverlay({ badge, onClose }) {
  const tierColor = { bronze: '#B8651C', silver: '#7A8A92', gold: '#B8860B', platinum: '#26514D' }[badge.tier]
  return (
    <div className="absolute inset-0 z-[100] flex items-center justify-center overflow-hidden overlay"
      style={{ background: 'radial-gradient(circle at 50% 35%, #0C6D91 0%, #073B52 55%, #042634 100%)' }}>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-80 h-80 rounded-full border border-[color:var(--gold-soft)]/25 animate-pulse"></div>
        <div className="absolute w-56 h-56 rounded-full" style={{ background: 'radial-gradient(circle, rgba(244,196,95,0.25) 0%, transparent 65%)' }}></div>
      </div>
      <div className="relative text-center text-white px-6 xp-pop">
        <div className="flex items-center justify-center gap-1.5 mb-4">
          <Ico.trophy className="w-4 h-4 text-[color:var(--gold-soft)]" />
          <div className="text-[11px] tracking-[0.3em] uppercase text-[color:var(--gold-soft)] font-semibold">Badge Earned</div>
        </div>
        <svg viewBox="0 0 60 60" className="w-32 h-32 mx-auto drop-shadow-2xl">
          <polygon points="30,4 56,18 56,42 30,56 4,42 4,18" fill={tierColor} />
          <polygon points="30,10 50,22 50,38 30,50 10,38 10,22" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
          <text x="30" y="38" textAnchor="middle" fontFamily="Fraunces, serif" fontSize="24" fontWeight="600" fill="white">{badge.name_en[0]}</text>
        </svg>
        <div className="font-display text-[26px] mt-4 leading-tight">{badge.name_en}</div>
        <div className="text-[10.5px] tracking-[0.16em] uppercase font-semibold mt-1 text-[color:var(--gold-soft)]">{badge.tier} tier</div>
        <div className="text-[12px] text-white/85 mt-3 max-w-[260px] mx-auto leading-relaxed">{badge.desc_en}</div>
        <button onClick={onClose} className="mt-6 px-8 py-3 rounded-full bg-[color:var(--surface)] text-[color:var(--teal-deep)] font-semibold text-[13px] tracking-wide shadow-lg hover:bg-[color:var(--gold-soft)] transition">
          Continue
        </button>
      </div>
    </div>
  )
}

export function MissionCompleteOverlay({ mission, onClose, lang = 'en' }) {
  return (
    <div className="absolute inset-0 z-[100] flex items-center justify-center overlay">
      <div className="absolute inset-0 bg-black/60" onClick={onClose}></div>
      <div className="relative bg-[color:var(--surface)] rounded-2xl p-6 mx-8 max-w-[320px] xp-pop">
        <div className="w-16 h-16 rounded-full bg-[color:var(--green)] flex items-center justify-center mx-auto shadow-lg">
          <Ico.check className="w-9 h-9 text-white" />
        </div>
        <div className="text-center mt-4">
          <div className="text-[10px] tracking-[0.18em] uppercase text-[color:var(--green)] font-semibold">{t(lang, 'Mission Complete', 'মিশন সম্পন্ন')}</div>
          <div className={'font-display text-[18px] text-[color:var(--ink)] mt-1 leading-tight ' + (lang === 'bn' ? 'font-bn' : '')}>{lang === 'bn' ? mission.title_bn : mission.title_en}</div>
          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[color:var(--gold-soft)]">
            <Ico.sparkle className="w-4 h-4 text-[color:var(--gold)]" />
            <span className="font-mono-data font-bold text-[14px] text-[color:var(--gold)]">+{mission.xp} XP</span>
          </div>
        </div>
        <button onClick={onClose} className="btn-primary w-full py-3 rounded-xl font-semibold text-[13px] mt-5">{t(lang, 'Continue', 'চালিয়ে যান')}</button>
      </div>
    </div>
  )
}

export function ForcedStateOverlay({ state, onClose }) {
  const config = {
    loading: { title: 'Loading…', desc: 'Fetching data from BTRC servers', icon: '⏳', color: 'var(--teal)', bg: 'var(--teal-soft)' },
    networkError: { title: 'No internet connection', desc: 'Check your connection and try again', icon: '📡', color: 'var(--coral)', bg: '#FEE2E2' },
    gpsDenied: { title: 'Location permission denied', desc: 'Enable location to tag your tests, or switch to manual district', icon: '📍', color: 'var(--amber)', bg: 'var(--amber-soft)' },
    testFailed: { title: 'Test failed', desc: 'The test could not complete. Result not submitted to BTRC.', icon: '⚠️', color: 'var(--coral)', bg: '#FEE2E2' },
    serverDown: { title: 'BTRC server unreachable', desc: 'Your test was saved locally and will sync when servers return', icon: '🔌', color: 'var(--amber)', bg: 'var(--amber-soft)' },
  }
  const c = config[state] || config.loading
  return (
    <div className="absolute inset-0 z-[90] flex items-center justify-center overlay">
      <div className="absolute inset-0 bg-black/50"></div>
      <div className="relative bg-[color:var(--surface)] rounded-2xl p-6 mx-8 max-w-[320px] text-center fade-up">
        <div className="text-[48px] mb-2">{c.icon}</div>
        <div className="font-display text-[20px] text-[color:var(--ink)] leading-tight">{c.title}</div>
        <div className="text-[12.5px] text-[color:var(--ink-soft)] mt-2 leading-relaxed">{c.desc}</div>
        <button onClick={onClose} className="mt-5 px-6 py-2.5 rounded-full font-semibold text-[12px] tracking-wide" style={{ background: c.color, color: 'white' }}>
          Dismiss
        </button>
        <div className="mt-3 text-[9px] text-[color:var(--mute)] uppercase tracking-[0.14em] font-semibold">Demo state · {state}</div>
      </div>
    </div>
  )
}

export function CancelTestSheet({ lang, close, confirm, pct }) {
  const lost = pct >= 50
  return (
    <div className="absolute inset-0 z-[95] flex items-end overlay">
      <div className="absolute inset-0 bg-black/40" onClick={close}></div>
      <div className="relative w-full bg-[color:var(--cream)] rounded-t-3xl p-5 sheet">
        <div className="w-10 h-1.5 rounded-full bg-[color:var(--line)] mx-auto mb-4"></div>
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-[color:var(--amber-soft)] flex items-center justify-center shrink-0">
            <Ico.close className="w-5 h-5 text-[color:var(--amber)]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-display text-[18px] text-[color:var(--ink)] leading-tight">
              {t(lang, 'Cancel this test?', 'এই পরীক্ষাটি বাতিল করবেন?')}
            </div>
            <div className="text-[12px] text-[color:var(--ink-soft)] mt-0.5 leading-snug">
              {lost
                ? t(lang, "You're more than halfway through — the partial result will be discarded.", 'অর্ধেকের বেশি সম্পন্ন — আংশিক ফলাফল মুছে যাবে।')
                : t(lang, 'Nothing will be submitted to BTRC. You can run a new test any time.', 'BTRC-তে কিছুই জমা হবে না। আপনি যেকোনো সময় আবার পরীক্ষা করতে পারেন।')}
            </div>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-2">
          <button onClick={close} className="py-3 rounded-xl bg-[color:var(--surface)] border border-[color:var(--line)] font-semibold text-[13px] text-[color:var(--ink)]">
            {t(lang, 'Keep testing', 'চালিয়ে যান')}
          </button>
          <button onClick={confirm} className="py-3 rounded-xl font-semibold text-[13px] text-white bg-[color:var(--coral)]">
            {t(lang, 'Cancel test', 'পরীক্ষা বাতিল')}
          </button>
        </div>
      </div>
    </div>
  )
}

export function TestRecoveryOverlay({ lang, recovery, onRetry, onSavePartial, onSwitchNetwork, onDismiss }) {
  const { reason, partial, canSavePartial } = recovery
  const isNetwork = reason === 'networkError'
  const isServer = reason === 'serverDown'

  const header = isNetwork
    ? {
        icon: '📡', tone: 'coral',
        title: t(lang, 'Connection dropped mid-test', 'পরীক্ষার মাঝে সংযোগ বিচ্ছিন্ন'),
        sub: t(lang, 'We lost the link to our measurement server. This usually means your network changed.', 'পরিমাপ সার্ভারের সাথে সংযোগ বিচ্ছিন্ন। সাধারণত নেটওয়ার্ক পরিবর্তনের কারণে হয়।'),
      }
    : isServer
    ? {
        icon: '🔌', tone: 'amber',
        title: t(lang, "BTRC's server is unreachable", 'BTRC সার্ভার পাওয়া যাচ্ছে না'),
        sub: t(lang, "Your result was captured locally. We'll sync it when servers return.", 'আপনার ফলাফল স্থানীয়ভাবে সংরক্ষিত। সার্ভার ফিরলে সিঙ্ক হবে।'),
      }
    : {
        icon: '⚠️', tone: 'coral',
        title: t(lang, "Test couldn't finish", 'পরীক্ষা সম্পন্ন হয়নি'),
        sub: t(lang, "Something went wrong while measuring. This isn't counted against your streak.", 'পরিমাপের সময় কিছু সমস্যা হয়েছে। এটি আপনার স্ট্রিকে গণ্য হবে না।'),
      }

  const toneColor = header.tone === 'coral' ? 'var(--coral)' : 'var(--amber)'
  const toneBg = header.tone === 'coral' ? '#FEE2E2' : 'var(--amber-soft)'

  return (
    <div className="absolute inset-0 z-[95] flex items-end overlay">
      <div className="absolute inset-0 bg-black/50"></div>
      <div className="relative w-full bg-[color:var(--cream)] rounded-t-3xl sheet max-h-[88%] overflow-y-auto">
        <div className="w-10 h-1.5 rounded-full bg-[color:var(--line)] mx-auto mt-3 mb-1"></div>

        <div className="px-5 pt-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-[24px] shrink-0" style={{ background: toneBg }}>
              <span>{header.icon}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-display text-[19px] text-[color:var(--ink)] leading-tight">{header.title}</div>
              <div className="text-[12px] text-[color:var(--ink-soft)] leading-snug mt-0.5">{header.sub}</div>
            </div>
          </div>
        </div>

        {canSavePartial && (
          <div className="mx-5 mt-4 p-3 rounded-xl bg-[color:var(--surface)] border border-[color:var(--line)]">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] tracking-[0.14em] uppercase text-[color:var(--mute)] font-semibold">{t(lang, 'What we captured', 'যা পরিমাপ হয়েছে')}</span>
              <span className="chip bg-[color:var(--amber-soft)] text-[color:var(--amber)]">{t(lang, 'Partial', 'আংশিক')}</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="font-mono-data font-bold text-[16px] text-[color:var(--ink)]">{partial.down ? partial.down.toFixed(1) : '—'}</div>
                <div className="text-[9px] tracking-[0.12em] uppercase text-[color:var(--mute)] font-semibold mt-0.5">↓ Mbps</div>
              </div>
              <div>
                <div className="font-mono-data font-bold text-[16px] text-[color:var(--ink)]">{partial.up ? partial.up.toFixed(1) : '—'}</div>
                <div className="text-[9px] tracking-[0.12em] uppercase text-[color:var(--mute)] font-semibold mt-0.5">↑ Mbps</div>
              </div>
              <div>
                <div className="font-mono-data font-bold text-[16px] text-[color:var(--ink)]">{partial.lat || '—'}</div>
                <div className="text-[9px] tracking-[0.12em] uppercase text-[color:var(--mute)] font-semibold mt-0.5">ms</div>
              </div>
            </div>
            <div className="text-[10.5px] text-[color:var(--ink-soft)] mt-2 leading-snug">
              {t(lang, 'Partial results are saved locally and not submitted as BTRC evidence.', 'আংশিক ফলাফল কেবল স্থানীয়ভাবে সংরক্ষিত — BTRC প্রমাণ হিসেবে জমা নয়।')}
            </div>
          </div>
        )}

        <div className="px-5 mt-4 space-y-2">
          <button onClick={onRetry} className="w-full p-3.5 rounded-xl flex items-center gap-3 transition btn-primary text-left">
            <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
              <Ico.history className="w-4.5 h-4.5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-[14px] leading-tight">{t(lang, 'Try again', 'আবার চেষ্টা করুন')}</div>
              <div className="text-[11px] text-white/75 leading-snug mt-0.5">{t(lang, "Restart the full test. Recommended once you're back online.", 'অনলাইনে ফিরলে সম্পূর্ণ পরীক্ষা পুনরায় চালান।')}</div>
            </div>
            <Ico.chevronR className="w-4 h-4 text-white/70 shrink-0" />
          </button>

          {isNetwork && (
            <button onClick={onSwitchNetwork} className="w-full p-3.5 rounded-xl flex items-center gap-3 bg-[color:var(--surface)] border border-[color:var(--line)] hover:bg-[color:var(--parchment)]/50 transition text-left">
              <div className="w-9 h-9 rounded-lg bg-[color:var(--teal-soft)] flex items-center justify-center shrink-0">
                <Ico.tower className="w-4.5 h-4.5 text-[color:var(--teal)]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-[13.5px] text-[color:var(--ink)] leading-tight">{t(lang, 'Switch network and retry', 'নেটওয়ার্ক পাল্টে আবার করুন')}</div>
                <div className="text-[11px] text-[color:var(--ink-soft)] leading-snug mt-0.5">{t(lang, 'On WiFi? Try mobile data. On 4G? Try WiFi. Then tap Run test.', 'WiFi-তে আছেন? মোবাইল ডেটায় চেষ্টা করুন। বা উল্টোটা।')}</div>
              </div>
              <Ico.chevronR className="w-4 h-4 text-[color:var(--mute)] shrink-0" />
            </button>
          )}

          {canSavePartial && (
            <button onClick={onSavePartial} className="w-full p-3.5 rounded-xl flex items-center gap-3 bg-[color:var(--surface)] border border-[color:var(--line)] hover:bg-[color:var(--parchment)]/50 transition text-left">
              <div className="w-9 h-9 rounded-lg bg-[color:var(--amber-soft)] flex items-center justify-center shrink-0">
                <Ico.save className="w-4.5 h-4.5 text-[color:var(--amber)]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-[13.5px] text-[color:var(--ink)] leading-tight">{t(lang, 'Save partial result', 'আংশিক ফলাফল সংরক্ষণ')}</div>
                <div className="text-[11px] text-[color:var(--ink-soft)] leading-snug mt-0.5">{t(lang, 'Keep what we measured in your history. +5 XP. Not sent to BTRC.', 'যা পরিমাপ হয়েছে তা ইতিহাসে রাখুন। +৫ XP। BTRC-তে পাঠানো হবে না।')}</div>
              </div>
              <Ico.chevronR className="w-4 h-4 text-[color:var(--mute)] shrink-0" />
            </button>
          )}

          <button onClick={onDismiss} className="w-full p-3 rounded-xl text-[12px] font-semibold text-[color:var(--ink-soft)] hover:bg-white/60 transition">
            {t(lang, 'Discard and go home', 'বাতিল করে হোমে ফিরুন')}
          </button>
        </div>

        <div className="px-5 pt-3 pb-5 flex items-center gap-1.5 text-[10px] text-[color:var(--mute)]">
          <Ico.shield className="w-3 h-3 text-[color:var(--gold)]" />
          <span>{t(lang, "Failed tests don't break your streak.", 'ব্যর্থ পরীক্ষা স্ট্রিক ভাঙে না।')}</span>
          <span className="ml-auto font-mono-data uppercase tracking-[0.12em]" style={{ color: toneColor }}>· {reason}</span>
        </div>
      </div>
    </div>
  )
}