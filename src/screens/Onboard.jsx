import { useState, useEffect, useRef } from 'react'
import { Ico } from '../components/Icons.jsx'
import { StatusBar, BrandHeader } from '../components/Header.jsx'
import { ConsentRow } from '../components/UI.jsx'
import { t } from '../i18n/strings.js'
import { ISPS, PACKAGES_BY_ISP, DISTRICTS } from '../data/isps.js'
import { FRESH_USER } from '../data/seed.js'

// ── Shared chrome ─────────────────────────────────────────────────────────
const PHASES = ['phone', 'otp', 'name', 'grant', 'detect']

function StepDots({ active, total }) {
  return (
    <div className="flex gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <span key={i} className="rounded-full" style={{
          height: 6,
          width: i === active ? 20 : 6,
          background: i <= active ? 'var(--teal)' : 'var(--parchment-deep)',
          transition: 'all .3s cubic-bezier(.2,.7,.3,1)',
        }} />
      ))}
    </div>
  )
}

function StepHead({ lang, active, eyebrow, title, sub }) {
  return (
    <div className="fade-up px-6 pt-3.5">
      <div className="flex items-center gap-3">
        <StepDots active={active} total={PHASES.length} />
        <span className="eyebrow" style={{ letterSpacing: '0.16em' }}>{eyebrow}</span>
      </div>
      <h1 className="font-display text-[30px] leading-[1.06] mt-3.5 font-medium" style={{ letterSpacing: '-0.01em' }}>
        {title}
      </h1>
      {sub && (
        <p className={'mt-2.5 text-[14px] text-[color:var(--ink-soft)] leading-relaxed ' + (lang === 'bn' ? 'font-bn' : '')}>
          {sub}
        </p>
      )}
    </div>
  )
}

function BackBar({ lang, onBack }) {
  return (
    <div className="px-5 pt-3 flex items-center gap-2">
      <button
        onClick={onBack}
        aria-label={t(lang, 'Back', 'ফিরে যান')}
        className="w-9 h-9 rounded-full bg-[color:var(--surface)] border border-[color:var(--line)] flex items-center justify-center cursor-pointer hover:bg-[color:var(--parchment)] transition">
        <Ico.chevronL className="w-4 h-4" />
      </button>
    </div>
  )
}

function TrustFooter({ children }) {
  return (
    <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-[color:var(--mute)]">
      <Ico.shield className="w-3 h-3 text-[color:var(--gold)]" />
      <span>{children}</span>
    </div>
  )
}

// ── Step 1 · Phone ────────────────────────────────────────────────────────
function PhoneStep({ lang, switchLang, onNext }) {
  const [code, setCode] = useState('+880')
  const [phone, setPhone] = useState('')
  const digits = phone.replace(/\D/g, '')
  const ready = digits.length >= 10

  const formatBd = (raw) => {
    const d = raw.replace(/\D/g, '').slice(0, 10)
    if (d.length <= 4) return d
    if (d.length <= 7) return d.slice(0, 4) + ' ' + d.slice(4)
    return d.slice(0, 4) + ' ' + d.slice(4, 7) + ' ' + d.slice(7)
  }

  return (
    <div className="pb-6">
      <StatusBar />
      <BrandHeader lang={lang} switchLang={switchLang} />
      <StepHead
        lang={lang}
        active={0}
        eyebrow={t(lang, 'Step 1 of 5', 'ধাপ ১ / ৫')}
        title={t(lang, 'Create your account', 'আপনার অ্যাকাউন্ট তৈরি করুন')}
        sub={t(lang, "Enter your mobile number to start contributing to Bangladesh's QoS network.", 'বাংলাদেশের QoS নেটওয়ার্কে অবদান রাখতে আপনার মোবাইল নম্বর দিন।')}
      />

      <div className="fade-up fade-up-1 px-5 pt-6">
        <label className="eyebrow pl-1" style={{ letterSpacing: '0.16em' }}>{t(lang, 'Mobile number', 'মোবাইল নম্বর')}</label>
        <div className="flex gap-2 mt-1.5">
          <div className="relative shrink-0">
            <select
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="appearance-none bg-[color:var(--surface)] border border-[color:var(--line)] rounded-xl pl-4 pr-8 py-3.5 text-[14px] font-semibold text-[color:var(--ink)] cursor-pointer focus:outline-none focus:border-[color:var(--teal)] focus:ring-2 focus:ring-[color:var(--teal)]/20 transition">
              <option value="+880">🇧🇩 +880</option>
              <option value="+91">🇮🇳 +91</option>
              <option value="+44">🇬🇧 +44</option>
              <option value="+1">🇺🇸 +1</option>
            </select>
            <Ico.chevronR className="w-3 h-3 absolute right-2.5 top-1/2 -translate-y-1/2 rotate-90 text-[color:var(--mute)] pointer-events-none" />
          </div>
          <input
            type="tel"
            inputMode="numeric"
            placeholder="1XXX XXX XXX"
            value={formatBd(phone)}
            onChange={(e) => setPhone(e.target.value)}
            className="flex-1 min-w-0 bg-[color:var(--surface)] border border-[color:var(--line)] rounded-xl px-4 py-3.5 text-[15px] font-medium text-[color:var(--ink)] font-mono-data outline-none focus:border-[color:var(--teal)] focus:ring-2 focus:ring-[color:var(--teal)]/20 transition"
            style={{ letterSpacing: '0.02em' }}
          />
        </div>
        <p className="text-[11px] text-[color:var(--mute)] mt-2 pl-1">{t(lang, "We'll send you a 6-digit code by SMS.", 'আমরা SMS-এ ৬-সংখ্যার কোড পাঠাব।')}</p>
      </div>

      <div className="px-6 pt-5">
        <button
          disabled={!ready}
          onClick={() => onNext(code + ' ' + formatBd(phone))}
          className="btn-primary w-full py-4 rounded-2xl font-semibold text-[15px] tracking-wide disabled:opacity-40 disabled:cursor-not-allowed">
          {t(lang, 'Continue', 'চালিয়ে যান')}
        </button>
        <TrustFooter>{t(lang, 'Data stays in Bangladesh · No personal info shared', 'ডেটা বাংলাদেশেই থাকে · কোনো ব্যক্তিগত তথ্য নয়')}</TrustFooter>
      </div>
    </div>
  )
}

// ── Step 2 · OTP ──────────────────────────────────────────────────────────
function OtpStep({ lang, phone, onNext, onBack }) {
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [seconds, setSeconds] = useState(120)
  const inputsRef = useRef([])

  useEffect(() => { inputsRef.current[0]?.focus() }, [])

  useEffect(() => {
    if (seconds <= 0) return
    const id = setTimeout(() => setSeconds(seconds - 1), 1000)
    return () => clearTimeout(id)
  }, [seconds])

  useEffect(() => {
    if (otp.every((d) => d !== '')) {
      const id = setTimeout(onNext, 450)
      return () => clearTimeout(id)
    }
  }, [otp])

  const setDigit = (i, v) => {
    const d = v.replace(/\D/g, '').slice(-1)
    const next = [...otp]
    next[i] = d
    setOtp(next)
    if (d && i < 5) inputsRef.current[i + 1]?.focus()
  }
  const onKey = (i, e) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) inputsRef.current[i - 1]?.focus()
  }

  const mm = String(Math.floor(seconds / 60)).padStart(2, '0')
  const ss = String(seconds % 60).padStart(2, '0')
  const expired = seconds <= 0

  return (
    <div className="pb-6">
      <StatusBar />
      <BackBar lang={lang} onBack={onBack} />
      <StepHead
        lang={lang}
        active={1}
        eyebrow={t(lang, 'Step 2 of 5', 'ধাপ ২ / ৫')}
        title={t(lang, 'Verify your number', 'আপনার নম্বর যাচাই করুন')}
        sub={
          <>
            {t(lang, 'We sent a 6-digit code to', 'আমরা একটি ৬-সংখ্যার কোড পাঠিয়েছি')}{' '}
            <span className="font-mono-data text-[color:var(--ink)] font-semibold">{phone}</span>.
          </>
        }
      />

      <div className="fade-up fade-up-1 px-5 pt-6">
        <div className="flex gap-2 justify-between">
          {otp.map((d, i) => (
            <input
              key={i}
              ref={(el) => (inputsRef.current[i] = el)}
              type="tel"
              inputMode="numeric"
              maxLength={1}
              value={d}
              onChange={(e) => setDigit(i, e.target.value)}
              onKeyDown={(e) => onKey(i, e)}
              className="text-center font-mono-data text-[22px] font-semibold text-[color:var(--ink)] bg-[color:var(--surface)] outline-none transition-all"
              style={{
                width: 46, height: 56,
                borderRadius: 12,
                border: d ? '1.5px solid var(--teal)' : '1px solid var(--line)',
                boxShadow: d ? '0 0 0 4px rgba(10,94,126,0.08)' : 'none',
              }}
            />
          ))}
        </div>

        <div className="mt-4.5 flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5">
            <Ico.history className="w-3 h-3" style={{ color: expired ? 'var(--coral)' : 'var(--mute)' }} />
            <span className="font-mono-data text-[12px] font-semibold" style={{ color: expired ? 'var(--coral)' : 'var(--ink-soft)' }}>
              {expired ? t(lang, 'Code expired', 'কোডের মেয়াদ শেষ') : t(lang, `Expires in ${mm}:${ss}`, `${mm}:${ss} এ মেয়াদ শেষ`)}
            </span>
          </div>
          <button
            onClick={() => { setSeconds(120); setOtp(['', '', '', '', '', '']); inputsRef.current[0]?.focus() }}
            disabled={!expired && seconds > 90}
            className="text-[12px] font-semibold py-1.5 bg-transparent border-0"
            style={{
              color: (!expired && seconds > 90) ? 'var(--mute)' : 'var(--teal)',
              cursor: (!expired && seconds > 90) ? 'not-allowed' : 'pointer',
            }}>
            {t(lang, 'Resend code', 'কোড পুনঃপ্রেরণ')}
          </button>
        </div>

        <TrustFooter>{t(lang, 'Never share this code · BTRC will never ask for it', 'এই কোড শেয়ার করবেন না · BTRC কখনো চাইবে না')}</TrustFooter>
      </div>
    </div>
  )
}

// ── Step 3 · Username ─────────────────────────────────────────────────────
function NameStep({ lang, onNext, onBack }) {
  const [name, setName] = useState('')
  const [anon, setAnon] = useState(false)
  const ready = anon || name.trim().length >= 2

  return (
    <div className="pb-6">
      <StatusBar />
      <BackBar lang={lang} onBack={onBack} />
      <StepHead
        lang={lang}
        active={2}
        eyebrow={t(lang, 'Step 3 of 5', 'ধাপ ৩ / ৫')}
        title={t(lang, 'Pick a display name', 'একটি প্রদর্শন নাম বাছুন')}
        sub={t(lang, 'This is how you appear on district leaderboards and the honour roll. You can stay anonymous if you prefer.', 'জেলা লিডারবোর্ড ও অনার রোলে আপনি এভাবেই দেখাবেন। চাইলে বেনামী থাকতে পারেন।')}
      />

      <div className="fade-up fade-up-1 px-5 pt-6">
        <label className="eyebrow pl-1" style={{ letterSpacing: '0.16em' }}>{t(lang, 'Display name', 'প্রদর্শন নাম')}</label>
        <div className="relative mt-1.5">
          <Ico.pencil className={'w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none ' + (anon ? 'text-[color:var(--mute)]/40' : 'text-[color:var(--mute)]')} />
          <input
            type="text"
            maxLength={24}
            disabled={anon}
            placeholder={t(lang, 'e.g. Rafa, Signal_Hunter', 'যেমন Rafa, Signal_Hunter')}
            value={anon ? '' : name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-[color:var(--surface)] border border-[color:var(--line)] rounded-xl pl-11 pr-4 py-3.5 text-[15px] font-medium text-[color:var(--ink)] outline-none focus:border-[color:var(--teal)] focus:ring-2 focus:ring-[color:var(--teal)]/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>
        <p className="text-[11px] text-[color:var(--mute)] mt-2 pl-1">
          {anon
            ? t(lang, "You'll appear as an anonymous contributor.", 'আপনি একজন বেনামী অবদানকারী হিসেবে দেখাবেন।')
            : t(lang, '2–24 characters. Letters, numbers and underscores.', '২–২৪ অক্ষর। অক্ষর, সংখ্যা ও আন্ডারস্কোর।')}
        </p>

        <button
          type="button"
          onClick={() => setAnon((v) => !v)}
          className={'w-full mt-4 p-3.5 rounded-xl flex gap-3 items-center text-left transition ' + (anon
            ? 'bg-[color:var(--surface)] border border-[color:var(--teal)]/40 ring-1 ring-[color:var(--teal)]/10'
            : 'bg-[color:var(--surface)] border border-[color:var(--line)]')}>
          <div className="w-9 h-9 rounded-lg bg-[color:var(--teal-soft)] flex items-center justify-center shrink-0">
            <Ico.shield className="w-5 h-5 text-[color:var(--teal)]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-[13px] text-[color:var(--ink)]">{t(lang, 'Stay anonymous', 'বেনামী থাকুন')}</div>
            <p className="text-[11.5px] text-[color:var(--ink-soft)] leading-snug mt-0.5">{t(lang, 'Contribute without showing a name. No personal identifiers.', 'নাম না দেখিয়ে অবদান রাখুন। কোনো ব্যক্তিগত পরিচয় নয়।')}</p>
          </div>
          <span className={'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition ' + (anon ? 'border-[color:var(--teal)] bg-[color:var(--teal)]' : 'border-[color:var(--line)]')}>
            {anon && <Ico.check className="w-3 h-3 text-white" />}
          </span>
        </button>
      </div>

      <div className="px-6 pt-6">
        <button
          disabled={!ready}
          onClick={() => onNext({ name: name.trim(), anon })}
          className="btn-primary w-full py-4 rounded-2xl font-semibold text-[15px] tracking-wide disabled:opacity-40 disabled:cursor-not-allowed">
          {t(lang, 'Continue', 'চালিয়ে যান')}
        </button>
      </div>
    </div>
  )
}

// ── Step 4 · Grant access ─────────────────────────────────────────────────
function GrantStep({ lang, grant, setGrant, onNext, onBack }) {
  const [detecting, setDetecting] = useState(false)
  const ready = grant.loc && grant.isp

  const run = () => {
    setDetecting(true)
    setTimeout(onNext, 1300)
  }

  return (
    <div className="pb-6">
      <StatusBar />
      <BackBar lang={lang} onBack={onBack} />
      <StepHead
        lang={lang}
        active={3}
        eyebrow={t(lang, 'Step 4 of 5', 'ধাপ ৪ / ৫')}
        title={t(lang, 'Grant access', 'অ্যাক্সেস দিন')}
        sub={t(lang, 'We use these only to detect where you are and which network you are on — so your tests map correctly. You can revoke them anytime in Profile.', 'এগুলো শুধু আপনার অবস্থান ও নেটওয়ার্ক শনাক্ত করতে ব্যবহৃত হয় — যাতে আপনার পরীক্ষা সঠিকভাবে ম্যাপ হয়। প্রোফাইল থেকে যেকোনো সময় বাতিল করা যায়।')}
      />

      <div className="px-5 mt-6 flex flex-col gap-3">
        <div className="fade-up fade-up-1">
          <ConsentRow
            value={grant.loc}
            onChange={(v) => setGrant((g) => ({ ...g, loc: v }))}
            required
            icon={<Ico.pin className="w-5 h-5 text-[color:var(--teal)]" />}
            title={t(lang, 'Location (GPS)', 'অবস্থান (GPS)')}
            desc={t(lang, 'Auto-detect your district so tests map to the right area on the BTRC coverage map.', 'আপনার জেলা স্বয়ংক্রিয়ভাবে শনাক্ত করুন, যাতে পরীক্ষা সঠিক এলাকায় ম্যাপ হয়।')}
          />
        </div>
        <div className="fade-up fade-up-2">
          <ConsentRow
            value={grant.isp}
            onChange={(v) => setGrant((g) => ({ ...g, isp: v }))}
            required
            icon={<Ico.network className="w-5 h-5 text-[color:var(--teal)]" />}
            title={t(lang, 'ISP & network info', 'ISP ও নেটওয়ার্ক তথ্য')}
            desc={t(lang, 'Auto-detect your provider and connection type (Wi-Fi / 4G / 5G) for each test.', 'প্রতিটি পরীক্ষার জন্য আপনার প্রোভাইডার ও সংযোগের ধরন (ওয়াই-ফাই / ৪জি / ৫জি) শনাক্ত করুন।')}
          />
        </div>
      </div>

      <div className="px-6 pt-6">
        <button
          onClick={run}
          disabled={!ready || detecting}
          className="btn-primary w-full py-4 rounded-2xl font-semibold text-[15px] tracking-wide flex items-center justify-center gap-2.5 disabled:opacity-40 disabled:cursor-not-allowed">
          {detecting && <span className="pulse-soft w-2 h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.85)' }} />}
          <span>{detecting ? t(lang, 'Detecting your network…', 'আপনার নেটওয়ার্ক শনাক্ত হচ্ছে…') : t(lang, 'Allow & detect', 'অনুমতি দিন ও শনাক্ত করুন')}</span>
        </button>
        <TrustFooter>{t(lang, 'You can revoke access at any time from Profile', 'আপনি প্রোফাইল থেকে যেকোনো সময় অ্যাক্সেস বাতিল করতে পারেন')}</TrustFooter>
      </div>
    </div>
  )
}

// ── Step 5 · Auto-detect confirmation ─────────────────────────────────────
// Simulated detection results. A user can legitimately be on more than one
// network at once (e.g. mobile data + home Wi-Fi), so we surface all of them.
const DETECTED_CONNS = [
  { ispCode: 'GP', name: 'GrameenPhone', conn_en: '4G · Mobile data', conn_bn: '৪জি · মোবাইল ডেটা', icon: 'tower' },
  { ispCode: 'DI', name: 'Dot Internet', conn_en: 'Wi-Fi · Broadband', conn_bn: 'ওয়াই-ফাই · ব্রডব্যান্ড', icon: 'signal' },
]
const DETECTED_DISTRICT = 'Dhanmondi'

function DetectStep({ lang, onFinish, onBack }) {
  const [sel, setSel] = useState(0)          // index into DETECTED_CONNS, or -1 for manual
  const [manualIsp, setManualIsp] = useState('')
  const [pickManual, setPickManual] = useState(false)

  const [changingLoc, setChangingLoc] = useState(false)
  const [district, setDistrict] = useState(DETECTED_DISTRICT)

  const chosenCode = sel === -1 ? manualIsp : DETECTED_CONNS[sel]?.ispCode
  const ready = !!chosenCode

  const finish = () => {
    if (!ready) return
    onFinish({
      ispCode: chosenCode,
      district,
      locChanged: district !== DETECTED_DISTRICT,
    })
  }

  return (
    <div className="pb-6">
      <StatusBar />
      <BackBar lang={lang} onBack={onBack} />
      <StepHead
        lang={lang}
        active={4}
        eyebrow={t(lang, 'Step 5 of 5', 'ধাপ ৫ / ৫')}
        title={t(lang, "Here's what we found", 'আমরা যা পেলাম')}
        sub={t(lang, 'Confirm your network and location, or change them if something looks off.', 'আপনার নেটওয়ার্ক ও অবস্থান নিশ্চিত করুন, কিছু ভুল মনে হলে পরিবর্তন করুন।')}
      />

      {/* Detected network(s) */}
      <div className="px-5 mt-6 fade-up fade-up-1">
        <div className="flex items-center justify-between pl-1 pr-0.5 mb-2">
          <span className="eyebrow" style={{ letterSpacing: '0.16em' }}>{t(lang, 'Detected network', 'শনাক্ত নেটওয়ার্ক')}</span>
          <span className="chip bg-[color:var(--green-soft)] text-[color:var(--green)] normal-case flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[color:var(--green)] pulse-soft" />
            {t(lang, 'Live', 'লাইভ')}
          </span>
        </div>

        <div className="flex flex-col gap-2.5">
          {DETECTED_CONNS.map((c, i) => {
            const I = Ico[c.icon] || Ico.network
            const active = sel === i && !pickManual
            return (
              <button
                key={c.ispCode}
                type="button"
                onClick={() => { setSel(i); setPickManual(false) }}
                className={'w-full p-3.5 rounded-xl flex gap-3 items-center text-left transition ' + (active
                  ? 'bg-[color:var(--surface)] border border-[color:var(--teal)]/40 ring-1 ring-[color:var(--teal)]/10'
                  : 'bg-[color:var(--surface)] border border-[color:var(--line)]')}>
                <div className="w-10 h-10 rounded-lg bg-[color:var(--teal-soft)] flex items-center justify-center shrink-0">
                  <I className="w-5 h-5 text-[color:var(--teal)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-[14px] text-[color:var(--ink)] leading-tight">{c.name}</div>
                  <div className="text-[11.5px] text-[color:var(--ink-soft)] mt-0.5">{t(lang, c.conn_en, c.conn_bn)}</div>
                </div>
                <span className={'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition ' + (active ? 'border-[color:var(--teal)] bg-[color:var(--teal)]' : 'border-[color:var(--line)]')}>
                  {active && <Ico.check className="w-3 h-3 text-white" />}
                </span>
              </button>
            )
          })}
        </div>

        {/* Manual override */}
        {!pickManual ? (
          <button
            type="button"
            onClick={() => { setPickManual(true); setSel(-1) }}
            className="mt-2.5 w-full text-[12px] font-semibold text-[color:var(--teal)] py-2 flex items-center justify-center gap-1.5">
            <Ico.pencil className="w-3.5 h-3.5" />
            {t(lang, 'None of these — choose manually', 'এর কোনোটিই নয় — নিজে বাছুন')}
          </button>
        ) : (
          <div className="mt-2.5 fade-up">
            <div className="relative">
              <select
                value={manualIsp}
                onChange={(e) => setManualIsp(e.target.value)}
                className="w-full appearance-none bg-[color:var(--surface)] border border-[color:var(--line)] rounded-xl py-3.5 pl-4 pr-10 text-[14px] font-semibold text-[color:var(--ink)] cursor-pointer focus:outline-none focus:border-[color:var(--teal)] focus:ring-2 focus:ring-[color:var(--teal)]/20 transition">
                <option value="">{t(lang, '— Select your ISP —', '— আপনার ISP বাছুন —')}</option>
                {ISPS.map((i) => (
                  <option key={i.code} value={i.code}>{i.name} · {i.kind}</option>
                ))}
              </select>
              <Ico.chevronR className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 rotate-90 text-[color:var(--mute)] pointer-events-none" />
            </div>
            <button
              type="button"
              onClick={() => { setPickManual(false); setSel(0); setManualIsp('') }}
              className="mt-1.5 text-[12px] font-semibold text-[color:var(--mute)] py-1 pl-1">
              {t(lang, 'Use detected network instead', 'শনাক্ত নেটওয়ার্ক ব্যবহার করুন')}
            </button>
          </div>
        )}
      </div>

      {/* Detected location */}
      <div className="px-5 mt-5 fade-up fade-up-2">
        <span className="eyebrow pl-1 block mb-2" style={{ letterSpacing: '0.16em' }}>{t(lang, 'Detected location', 'শনাক্ত অবস্থান')}</span>
        <div className="p-3.5 rounded-xl bg-[color:var(--surface)] border border-[color:var(--line)] flex gap-3 items-center">
          <div className="w-10 h-10 rounded-lg bg-[color:var(--teal-soft)] flex items-center justify-center shrink-0">
            <Ico.pin className="w-5 h-5 text-[color:var(--teal)]" />
          </div>
          <div className="flex-1 min-w-0">
            {!changingLoc ? (
              <>
                <div className="font-semibold text-[14px] text-[color:var(--ink)] leading-tight">{district}</div>
                <div className="text-[11.5px] text-[color:var(--ink-soft)] mt-0.5">{t(lang, 'Dhaka, Bangladesh', 'ঢাকা, বাংলাদেশ')}</div>
              </>
            ) : (
              <div className="relative">
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full appearance-none bg-[color:var(--surface)] border border-[color:var(--line)] rounded-lg py-2 pl-3 pr-9 text-[13px] font-semibold text-[color:var(--ink)] cursor-pointer focus:outline-none focus:border-[color:var(--teal)] transition">
                  {DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
                <Ico.chevronR className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 rotate-90 text-[color:var(--mute)] pointer-events-none" />
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => setChangingLoc((v) => !v)}
            className="text-[12px] font-semibold text-[color:var(--teal)] px-2 py-1 shrink-0">
            {changingLoc ? t(lang, 'Done', 'হয়ে গেছে') : t(lang, 'Change', 'পরিবর্তন')}
          </button>
        </div>
      </div>

      <div className="px-6 pt-6">
        <button
          onClick={finish}
          disabled={!ready}
          className="btn-primary w-full py-4 rounded-2xl font-semibold text-[15px] tracking-wide flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
          <Ico.check className="w-4 h-4" />
          {t(lang, 'Looks correct — finish', 'সঠিক আছে — সম্পন্ন করুন')}
        </button>
        <TrustFooter>{t(lang, 'You can change your ISP, plan and location anytime in Profile', 'প্রোফাইল থেকে যেকোনো সময় ISP, প্যাকেজ ও অবস্থান বদলাতে পারবেন')}</TrustFooter>
      </div>
    </div>
  )
}

// ── Orchestrator ──────────────────────────────────────────────────────────
export default function Onboard({
  lang, switchLang, setScreen,
  setConsents, setIspCode, setPkgId, setUser, setHistory, setTourSeen,
  setLocationMode, setManualDistrict,
}) {
  const [phase, setPhase] = useState('phone')
  const [phone, setPhone] = useState('')
  const [identity, setIdentity] = useState({ name: '', anon: false })
  const [grant, setGrant] = useState({ loc: false, isp: false })

  const complete = ({ ispCode, district, locChanged }) => {
    const firstPkg = (PACKAGES_BY_ISP[ispCode] || [])[0]
    const displayName = identity.anon
      ? 'Anon · ' + ispCode
      : identity.name

    setConsents({ loc: grant.loc, anon: true, device: grant.isp })
    setIspCode(ispCode)
    setPkgId(firstPkg ? firstPkg.id : '')
    if (locChanged) {
      setLocationMode('manual')
      setManualDistrict(district)
    } else {
      setLocationMode('gps')
    }
    setUser({ ...FRESH_USER, displayName, publicProfile: !identity.anon })
    setHistory([])
    setTourSeen(false)
    setScreen('home')
  }

  if (phase === 'phone') {
    return <PhoneStep lang={lang} switchLang={switchLang} onNext={(p) => { setPhone(p); setPhase('otp') }} />
  }
  if (phase === 'otp') {
    return <OtpStep lang={lang} phone={phone} onNext={() => setPhase('name')} onBack={() => setPhase('phone')} />
  }
  if (phase === 'name') {
    return <NameStep lang={lang} onNext={(id) => { setIdentity(id); setPhase('grant') }} onBack={() => setPhase('otp')} />
  }
  if (phase === 'grant') {
    return <GrantStep lang={lang} grant={grant} setGrant={setGrant} onNext={() => setPhase('detect')} onBack={() => setPhase('name')} />
  }
  return <DetectStep lang={lang} onFinish={complete} onBack={() => setPhase('grant')} />
}
