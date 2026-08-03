import { useState } from 'react'
import { Ico } from './Icons.jsx'
import { t } from '../i18n/strings.js'
import { DISTRICTS } from '../data/isps.js'

export function PlanModal({ lang, packages, ispName, current, onPick, close }) {
  return (
    <div className="absolute inset-0 z-50 flex items-end overlay">
      <div className="absolute inset-0 bg-black/40" onClick={close}></div>
      <div className="relative w-full bg-[color:var(--cream)] rounded-t-3xl p-5 sheet max-h-[80%] overflow-y-auto">
        <div className="w-10 h-1.5 rounded-full bg-[color:var(--line)] mx-auto mb-4"></div>
        <div className="flex items-center gap-2">
          <span className="chip bg-[color:var(--gold-soft)] text-[color:var(--gold)]">BTRC catalog</span>
          <span className="text-[11px] text-[color:var(--mute)]">·</span>
          <span className="text-[11px] font-semibold text-[color:var(--ink-soft)]">{ispName}</span>
        </div>
        <div className="font-display text-[20px] text-[color:var(--ink)] mt-1">{t(lang, 'Switch your plan', 'প্ল্যান পরিবর্তন')}</div>
        <div className="text-[12px] text-[color:var(--ink-soft)] mt-0.5">{t(lang, 'Pick what you pay for. Tests compare against advertised speed.', 'আপনি কী জন্য অর্থ প্রদান করেন তা বেছে নিন।')}</div>

        <div className="mt-4 space-y-2">
          {packages.map((p) => {
            const sel = p.id === current
            return (
              <button key={p.id} onClick={() => onPick(p.id)}
                className={'w-full p-3 rounded-xl border flex items-center gap-3 transition text-left ' + (sel ? 'bg-[color:var(--teal-soft)] border-[color:var(--teal)] ring-1 ring-[color:var(--teal)]' : 'bg-[color:var(--surface)] border-[color:var(--line)] hover:bg-[color:var(--parchment)]')}>
                <div className={'w-11 h-11 rounded-lg flex flex-col items-center justify-center shrink-0 ' + (sel ? 'bg-[color:var(--teal)] text-white' : 'bg-[color:var(--parchment-deep)] text-[color:var(--ink-soft)]')}>
                  <span className="font-mono-data font-bold text-[13px] leading-none">{p.down}</span>
                  <span className="text-[8px] tracking-[0.08em] uppercase font-semibold mt-0.5 opacity-80">Mbps</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-[13.5px] text-[color:var(--ink)]">{p.name}</div>
                  <div className="text-[11px] text-[color:var(--mute)] font-mono-data">↓{p.down} ↑{p.up} Mbps</div>
                </div>
                <div className="text-right">
                  <div className="font-mono-data font-semibold text-[14px] text-[color:var(--ink)]">৳{p.price}</div>
                  <div className="text-[9px] tracking-[0.1em] uppercase text-[color:var(--mute)] font-semibold">/mo</div>
                </div>
                {sel && <Ico.check className="w-4 h-4 text-[color:var(--teal)] ml-1" />}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export function LocationModal({ lang, locationMode, setLocationMode, manualDistrict, setManualDistrict, close }) {
  const [tempMode, setTempMode] = useState(locationMode)
  const [tempDistrict, setTempDistrict] = useState(manualDistrict)
  return (
    <div className="absolute inset-0 z-50 flex items-end overlay">
      <div className="absolute inset-0 bg-black/40" onClick={close}></div>
      <div className="relative w-full bg-[color:var(--cream)] rounded-t-3xl p-5 sheet">
        <div className="w-10 h-1.5 rounded-full bg-[color:var(--line)] mx-auto mb-4"></div>
        <div className="font-display text-[20px] text-[color:var(--ink)]">{t(lang, 'Set your location', 'আপনার অবস্থান নির্বাচন')}</div>
        <div className="text-[12px] text-[color:var(--ink-soft)] mt-0.5">{t(lang, 'GPS gives higher-trust metadata — and a +5 XP bonus.', 'GPS বেশি নির্ভরযোগ্য — +৫ XP বোনাস।')}</div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button onClick={() => setTempMode('gps')} className={'p-3 rounded-xl text-left transition ' + (tempMode === 'gps' ? 'bg-[color:var(--teal)] text-white' : 'bg-[color:var(--surface)] border border-[color:var(--line)]')}>
            <div className="text-[10px] tracking-[0.14em] uppercase font-semibold opacity-80">GPS</div>
            <div className="font-display text-[16px] mt-0.5">{t(lang, 'Auto', 'স্বয়ংক্রিয়')}</div>
            <div className="text-[10px] opacity-70 mt-0.5">+5 XP</div>
          </button>
          <button onClick={() => setTempMode('manual')} className={'p-3 rounded-xl text-left transition ' + (tempMode === 'manual' ? 'bg-[color:var(--teal)] text-white' : 'bg-[color:var(--surface)] border border-[color:var(--line)]')}>
            <div className="text-[10px] tracking-[0.14em] uppercase font-semibold opacity-80">Manual</div>
            <div className="font-display text-[16px] mt-0.5">{t(lang, 'Pick district', 'জেলা নির্বাচন')}</div>
            <div className="text-[10px] opacity-70 mt-0.5">For low-signal areas</div>
          </button>
        </div>
        {tempMode === 'manual' && (
          <div className="mt-3">
            <label className="text-[11px] text-[color:var(--mute)] uppercase tracking-[0.12em] font-semibold">{t(lang, 'District', 'জেলা')}</label>
            <select value={tempDistrict} onChange={(e) => setTempDistrict(e.target.value)} className="mt-1 w-full p-3 rounded-xl border border-[color:var(--line)] bg-[color:var(--surface)] font-medium">
              {DISTRICTS.map((d) => <option key={d}>{d}</option>)}
            </select>
          </div>
        )}
        <button onClick={() => { setLocationMode(tempMode); setManualDistrict(tempDistrict); close(); }}
          className="btn-primary w-full py-3.5 rounded-2xl font-semibold text-[14px] mt-5">{t(lang, 'Apply', 'প্রয়োগ')}</button>
      </div>
    </div>
  )
}

export function TestModeInfoModal({ lang, close }) {
  return (
    <div className="absolute inset-0 z-50 flex items-end overlay">
      <div className="absolute inset-0 bg-black/40" onClick={close}></div>
      <div className="relative w-full bg-[color:var(--cream)] rounded-t-3xl p-5 sheet">
        <div className="w-10 h-1.5 rounded-full bg-[color:var(--line)] mx-auto mb-4"></div>
        <div className="font-display text-[20px] text-[color:var(--ink)]">{t(lang, 'About test modes', 'পরীক্ষার ধরন সম্পর্কে')}</div>
        <div className="text-[12px] text-[color:var(--ink-soft)] mt-0.5">{t(lang, 'Pick how thorough you want this measurement to be.', 'আপনি কতটা বিস্তারিত পরিমাপ চান তা বেছে নিন।')}</div>

        <div className="mt-4 space-y-3">
          <div className="p-3.5 rounded-2xl bg-[color:var(--surface)] border border-[color:var(--line)]">
            <div className="flex items-center justify-between">
              <div className="font-display text-[16px] text-[color:var(--ink)]">{t(lang, 'Quick', 'দ্রুত')}</div>
              <span className="chip bg-[color:var(--gold-soft)] text-[color:var(--gold)] font-mono-data">+10 XP · ~12s</span>
            </div>
            <div className="text-[12px] text-[color:var(--ink-soft)] mt-1 leading-relaxed">
              {t(lang, "Measures download and upload speed only. Great for a fast daily check-in or when you're on mobile data.", 'শুধু ডাউনলোড এবং আপলোড গতি পরিমাপ করে। দৈনিক দ্রুত যাচাই বা মোবাইল ডেটায় ব্যবহারের জন্য উপযুক্ত।')}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[color:var(--teal-soft)] border border-[color:var(--teal)]/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <div className="font-display text-[16px] text-[color:var(--ink)]">{t(lang, 'Full QoS', 'সম্পূর্ণ QoS')}</div>
                <span className="chip bg-[color:var(--gold-soft)] text-[color:var(--gold)]">Best</span>
              </div>
              <span className="chip bg-[color:var(--teal)] text-white font-mono-data">+30 XP · ~28s</span>
            </div>
            <div className="text-[12px] text-[color:var(--ink-soft)] mt-1 leading-relaxed">
              {t(lang, 'Captures all 6 parameters — download, upload, ping, jitter, packet loss and latency. This is the data BTRC uses as regulatory evidence.', 'ডাউনলোড, আপলোড, পিং, জিটার, প্যাকেট লস ও লেটেন্সি — ৬টি প্যারামিটারই পরিমাপ করে। এটি BTRC-এর নিয়ন্ত্রক প্রমাণ হিসেবে ব্যবহৃত হয়।')}
            </div>
          </div>
        </div>

        <div className="mt-4 p-3 rounded-xl bg-[color:var(--parchment)] flex items-start gap-2">
          <Ico.info className="w-4 h-4 text-[color:var(--teal)] shrink-0 mt-0.5" />
          <div className="text-[11.5px] text-[color:var(--ink-soft)] leading-relaxed">
            {t(lang, 'New here? Start with Full QoS — it earns more XP and builds a complete profile of your connection on day one.', 'নতুন? সম্পূর্ণ QoS দিয়ে শুরু করুন — বেশি XP দেয় এবং প্রথম দিনেই আপনার সংযোগের সম্পূর্ণ প্রোফাইল তৈরি করে।')}
          </div>
        </div>

        <button onClick={close} className="btn-primary w-full py-3.5 rounded-2xl font-semibold text-[14px] mt-5">{t(lang, 'Got it', 'বুঝেছি')}</button>
      </div>
    </div>
  )
}

export function HomeTutorial({ lang, onFinish }) {
  const [step, setStep] = useState(0)
  const steps = [
    {
      eyebrow: t(lang, 'Welcome', 'স্বাগতম'),
      title: t(lang, "You're part of Bangladesh's QoS network", 'আপনি বাংলাদেশের QoS নেটওয়ার্কের অংশ'),
      body: t(lang, 'Every test you run becomes anonymous regulatory evidence — and earns you XP. This tour takes about 30 seconds.', 'প্রতিটি পরীক্ষা বেনামী নিয়ন্ত্রক প্রমাণ হিসেবে যুক্ত হয় — এবং আপনি XP অর্জন করেন। এই ট্যুর প্রায় ৩০ সেকেন্ড।'),
      icon: <Ico.sparkle className="w-6 h-6 text-[color:var(--gold)]" />,
      tone: 'gold',
      point: t(lang, "Look up — that's your contributor card", 'উপরে দেখুন — সেটি আপনার অবদানকারী কার্ড'),
    },
    {
      eyebrow: t(lang, 'Your plan', 'আপনার প্যাকেজ'),
      title: t(lang, 'This is what your ISP promised you', 'এটি আপনার ISP যা প্রতিশ্রুতি দিয়েছে'),
      body: t(lang, 'We compare every test result against this advertised speed. If your real speed falls below 70%, BTRC sees it as a package mismatch.', 'আমরা প্রতিটি ফলাফল এই প্রচারিত গতির সাথে তুলনা করি। প্রকৃত গতি ৭০%-এর নিচে হলে BTRC প্যাকেজ অসঙ্গতি হিসেবে দেখে।'),
      icon: <Ico.shield className="w-6 h-6 text-[color:var(--teal)]" />,
      tone: 'teal',
      point: t(lang, 'Wrong plan? Tap Change plan to fix it', 'ভুল প্যাকেজ? Change plan-এ ট্যাপ করুন'),
    },
    {
      eyebrow: t(lang, 'Test mode', 'পরীক্ষার ধরন'),
      title: t(lang, 'Quick or Full QoS — your call', 'দ্রুত বা সম্পূর্ণ QoS — আপনার পছন্দ'),
      body: t(lang, 'Quick (~12s) measures speed only. Full QoS (~28s) captures all 6 BTRC parameters and earns 3× the XP. Start with Full.', 'দ্রুত (~১২সে) শুধু গতি পরিমাপ করে। সম্পূর্ণ QoS (~২৮সে) ৬টি প্যারামিটার ধরে এবং ৩× XP দেয়। সম্পূর্ণ দিয়ে শুরু করুন।'),
      icon: <Ico.target className="w-6 h-6 text-[color:var(--gold)]" />,
      tone: 'gold',
      point: t(lang, 'Tap the ⓘ next to Test mode for details anytime', 'বিস্তারিত জানতে যেকোনো সময় ⓘ ট্যাপ করুন'),
    },
    {
      eyebrow: t(lang, 'Run your first test', 'আপনার প্রথম পরীক্ষা চালান'),
      title: t(lang, 'Tap the big START button', 'বড় START বোতামে ট্যাপ করুন'),
      body: t(lang, "Keep the app open for about 30 seconds. You'll see ping, download, and upload measured live, then a result card with your XP burst.", 'অ্যাপ খোলা রাখুন প্রায় ৩০ সেকেন্ড। পিং, ডাউনলোড, আপলোড লাইভ দেখবেন, তারপর XP সহ ফলাফল।'),
      icon: <Ico.dl className="w-6 h-6 text-white" />,
      tone: 'teal',
      iconOnAccent: true,
      point: t(lang, 'Your first Full QoS test earns +30 XP', 'প্রথম সম্পূর্ণ QoS পরীক্ষায় +৩০ XP'),
    },
    {
      eyebrow: t(lang, 'Find more below', 'নিচে আরও দেখুন'),
      title: t(lang, 'Missions, history, leaderboard, profile', 'মিশন, ইতিহাস, লিডারবোর্ড, প্রোফাইল'),
      body: t(lang, 'The bottom nav has everything else — daily missions, your full test history, district leaderboard, and your profile.', 'নিচের ন্যাভিগেশনে বাকি সবকিছু — দৈনিক মিশন, পরীক্ষার ইতিহাস, জেলা লিডারবোর্ড, এবং আপনার প্রোফাইল।'),
      icon: <Ico.trophy className="w-6 h-6 text-[color:var(--gold)]" />,
      tone: 'gold',
      point: t(lang, 'You can replay this tour anytime from Profile', 'যেকোনো সময় প্রোফাইল থেকে এই ট্যুর আবার দেখুন'),
    },
  ]

  const cur = steps[step]
  const isLast = step === steps.length - 1
  const toneAccent = cur.tone === 'gold' ? 'var(--gold)' : 'var(--teal)'
  const toneSoft = cur.tone === 'gold' ? 'var(--gold-soft)' : 'var(--teal-soft)'

  return (
    <div className="absolute inset-0 z-[80] flex items-end overlay">
      <div className="absolute inset-0 bg-black/45"></div>
      <div className="relative w-full bg-[color:var(--cream)] rounded-t-3xl sheet">
        <div className="flex items-center justify-between px-5 pt-4">
          <div className="flex items-center gap-1.5">
            {steps.map((_, i) => (
              <span key={i} className={'rounded-full transition-all ' + (i === step ? 'w-5 h-1.5 bg-[color:var(--teal)]' : 'w-1.5 h-1.5 bg-[color:var(--line)]')}></span>
            ))}
          </div>
          <button type="button" onClick={onFinish} className="text-[11px] font-semibold text-[color:var(--mute)] hover:text-[color:var(--ink)] tracking-wide transition">
            {t(lang, 'Skip tour', 'ট্যুর এড়িয়ে যান')}
          </button>
        </div>

        <div className="px-5 pt-4 pb-5">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ background: cur.iconOnAccent ? toneAccent : toneSoft }}>
              {cur.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] tracking-[0.16em] uppercase font-semibold" style={{ color: toneAccent }}>{cur.eyebrow}</div>
              <div className={'font-display text-[19px] text-[color:var(--ink)] leading-tight mt-0.5 ' + (lang === 'bn' ? 'font-bn' : '')}>{cur.title}</div>
            </div>
          </div>

          <div className={'text-[13px] text-[color:var(--ink-soft)] leading-relaxed mt-3 ' + (lang === 'bn' ? 'font-bn' : '')}>{cur.body}</div>

          <div className="mt-3 p-2.5 rounded-xl flex items-start gap-2" style={{ background: toneSoft }}>
            <Ico.info className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: toneAccent }} />
            <div className={'text-[11.5px] text-[color:var(--ink)] leading-snug ' + (lang === 'bn' ? 'font-bn' : '')}>{cur.point}</div>
          </div>

          <div className="mt-5 flex items-center gap-2">
            <button type="button" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}
              className="px-4 py-3 rounded-xl border border-[color:var(--line)] bg-[color:var(--surface)] font-semibold text-[13px] text-[color:var(--ink)] disabled:opacity-40 disabled:cursor-not-allowed">
              {t(lang, 'Back', 'পেছনে')}
            </button>
            <button type="button" onClick={() => (isLast ? onFinish() : setStep((s) => s + 1))}
              className="btn-primary flex-1 py-3 rounded-xl font-semibold text-[14px] flex items-center justify-center gap-2">
              <span>{isLast ? t(lang, 'Got it · Start testing', 'বুঝেছি · শুরু করুন') : t(lang, 'Next', 'পরবর্তী')}</span>
              {!isLast && <Ico.chevronR className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function badgeProgress(badge, user) {
  const cur = badge.current !== undefined ? badge.current : (user?.[badge.metric] ?? 0)
  const target = badge.target ?? 1
  const pct = target > 0 ? Math.min(100, Math.round((cur / target) * 100)) : 0
  return { cur, target, pct, remaining: Math.max(0, target - cur) }
}

export function BadgeDetailModal({ lang, badge, user, close }) {
  const tierColor = { bronze: '#B8651C', silver: '#7A8A92', gold: '#B8860B', platinum: '#26514D' }[badge.tier]
  const tierLabel_bn = { bronze: 'ব্রোঞ্জ', silver: 'রৌপ্য', gold: 'স্বর্ণ', platinum: 'প্ল্যাটিনাম' }[badge.tier]
  const { cur, target, pct, remaining } = badgeProgress(badge, user)
  const unit = lang === 'bn' ? (badge.unit_bn || '') : (badge.unit_en || '')
  const name = lang === 'bn' ? badge.name_bn : badge.name_en
  const desc = lang === 'bn' ? badge.desc_bn : badge.desc_en
  const story = lang === 'bn' ? badge.story_bn : badge.story_en
  const earnedOn = lang === 'bn' ? badge.earnedOn_bn : badge.earnedOn_en

  return (
    <div className="absolute inset-0 z-50 flex items-end overlay">
      <div className="absolute inset-0 bg-black/50" onClick={close}></div>
      <div className="relative w-full bg-[color:var(--cream)] rounded-t-3xl p-5 sheet max-h-[88%] overflow-y-auto">
        <div className="w-10 h-1.5 rounded-full bg-[color:var(--line)] mx-auto mb-4"></div>

        <div className="flex items-center gap-4">
          <div className="relative w-20 h-20 shrink-0">
            <svg viewBox="0 0 60 60" className="w-full h-full">
              <polygon points="30,4 56,18 56,42 30,56 4,42 4,18" fill={badge.earned ? tierColor : '#D6CEB7'} opacity={badge.earned ? 1 : 0.7} />
              <polygon points="30,10 50,22 50,38 30,50 10,38 10,22" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
              <text x="30" y="38" textAnchor="middle" fontFamily="Fraunces, serif" fontSize="24" fontWeight="600" fill="white">{badge.name_en[0]}</text>
            </svg>
            {!badge.earned && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Ico.lock className="w-6 h-6 text-white drop-shadow" />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className={'font-display text-[22px] text-[color:var(--ink)] leading-tight ' + (lang === 'bn' ? 'font-bn' : '')}>{name}</div>
            <div className="flex items-center gap-2 mt-1">
              <span className="chip" style={{ background: tierColor + '22', color: tierColor }}>
                {lang === 'bn' ? tierLabel_bn : badge.tier}
              </span>
              {badge.earned ? (
                <span className="chip bg-[color:var(--green-soft)] text-[color:var(--green)]">
                  <Ico.check2 className="w-3 h-3" />
                  <span>{t(lang, 'Earned', 'অর্জিত')}</span>
                </span>
              ) : (
                <span className="chip bg-[color:var(--parchment-deep)] text-[color:var(--mute)]">
                  <Ico.lock className="w-3 h-3" />
                  <span>{t(lang, 'Locked', 'অর্জিত নয়')}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="mt-4">
          <div className={'text-[13.5px] font-medium text-[color:var(--ink)] leading-snug ' + (lang === 'bn' ? 'font-bn' : '')}>{desc}</div>
          {story && <div className={'text-[12px] text-[color:var(--ink-soft)] mt-1.5 leading-relaxed ' + (lang === 'bn' ? 'font-bn' : '')}>{story}</div>}
        </div>

        <div className="mt-4 p-3.5 rounded-2xl bg-[color:var(--surface)] border border-[color:var(--line)]">
          <div className="text-[10px] tracking-[0.14em] uppercase text-[color:var(--mute)] font-semibold">{t(lang, 'Condition', 'শর্ত')}</div>
          <div className={'text-[13px] text-[color:var(--ink)] mt-1 leading-snug ' + (lang === 'bn' ? 'font-bn' : '')}>
            {lang === 'bn'
              ? `${desc} — আপনার ${cur}${unit ? (' ' + unit) : ''} আছে।`
              : `${desc} — you have ${cur}${unit ? (' ' + unit) : ''}.`}
          </div>

          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-[10px] tracking-[0.14em] uppercase text-[color:var(--mute)] font-semibold">{t(lang, 'Progress', 'অগ্রগতি')}</span>
            <span className="font-mono-data text-[12px] font-semibold text-[color:var(--ink)]">{cur} / {target}</span>
          </div>
          <div className={'bar mt-1.5 ' + (badge.earned ? '' : 'bg-[color:var(--parchment-deep)]')}>
            <span style={{ width: pct + '%', background: badge.earned ? 'linear-gradient(90deg, #F4C45F, #B8860B)' : tierColor }}></span>
          </div>
          <div className="mt-1.5 text-[11px] text-[color:var(--ink-soft)]">
            {badge.earned
              ? t(lang, 'Threshold reached.', 'সীমা অতিক্রান্ত।')
              : (remaining > 0
                ? (lang === 'bn'
                  ? `অর্জনের জন্য আরও ${remaining}${unit ? (' ' + unit) : ''} প্রয়োজন`
                  : `${remaining} more ${unit || 'to go'} until you earn this`)
                : t(lang, 'Waiting on verification.', 'যাচাইয়ের অপেক্ষায়।'))}
          </div>
        </div>

        {badge.earned && earnedOn ? (
          <div className="mt-3 p-3 rounded-xl bg-[color:var(--gold-soft)]/60 flex items-start gap-2">
            <Ico.sparkle className="w-4 h-4 text-[color:var(--gold)] shrink-0 mt-0.5" />
            <div className="text-[12px] text-[color:var(--ink)] leading-snug">
              <span className="font-semibold">{t(lang, 'Earned on', 'অর্জিত হয়েছে')}: </span>
              <span className="font-mono-data">{earnedOn}</span>
            </div>
          </div>
        ) : (
          <div className="mt-3 p-3 rounded-xl bg-[color:var(--parchment)] flex items-start gap-2">
            <Ico.info className="w-4 h-4 text-[color:var(--teal)] shrink-0 mt-0.5" />
            <div className={'text-[12px] text-[color:var(--ink-soft)] leading-snug ' + (lang === 'bn' ? 'font-bn' : '')}>
              {t(lang, 'Keep running tests to make progress. Full QoS tests count the same as Quick.', 'অগ্রগতির জন্য পরীক্ষা চালিয়ে যান। সম্পূর্ণ QoS পরীক্ষা ও দ্রুত পরীক্ষা একই হিসাবে গণ্য।')}
            </div>
          </div>
        )}

        <button onClick={close} className="btn-primary w-full py-3.5 rounded-2xl font-semibold text-[14px] mt-5">{t(lang, 'Close', 'বন্ধ করুন')}</button>
      </div>
    </div>
  )
}

export { badgeProgress }