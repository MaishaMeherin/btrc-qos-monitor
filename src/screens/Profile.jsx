import { useState, useEffect } from 'react'
import { Ico } from '../components/Icons.jsx'
import { placesFromTests } from '../lib/geohash.js'
import { StatusBar } from '../components/Header.jsx'
import { LocationModal } from '../components/Modals.jsx'
import { RankMedal, ContributorCard } from '../components/UI.jsx'
import { t } from '../i18n/strings.js'
import { LEVELS, levelFromXp } from '../data/seed.js'
import { ISPS, PACKAGES_BY_ISP } from '../data/isps.js'

const NOTIF_OPTIONS = [
  { k: 'all', en: 'All updates', bn: 'সব আপডেট', sub_en: 'Every result, mission, and district news', sub_bn: 'প্রতিটি ফলাফল, মিশন ও জেলার খবর' },
  { k: 'issues', en: 'Issues only', bn: 'শুধু সমস্যা', sub_en: 'Package mismatches and outages near you', sub_bn: 'প্যাকেজ অসঙ্গতি ও আপনার কাছের আউটেজ' },
  { k: 'none', en: 'None', bn: 'কোনোটিই নয়', sub_en: 'Mute all push notifications', sub_bn: 'সব পুশ বিজ্ঞপ্তি বন্ধ' },
]

function Sheet({ title, subtitle, close, children }) {
  return (
    <div className="absolute inset-0 z-50 flex items-end overlay">
      <div className="absolute inset-0 bg-black/40" onClick={close}></div>
      <div className="relative w-full bg-[color:var(--cream)] rounded-t-3xl p-5 sheet max-h-[82%] overflow-y-auto">
        <div className="w-10 h-1.5 rounded-full bg-[color:var(--line)] mx-auto mb-4"></div>
        <div className="font-display text-[20px] text-[color:var(--ink)]">{title}</div>
        {subtitle && <div className="text-[12px] text-[color:var(--ink-soft)] mt-0.5">{subtitle}</div>}
        <div className="mt-4">{children}</div>
      </div>
    </div>
  )
}

function OptionRow({ title, sub, selected, onClick }) {
  return (
    <button onClick={onClick} className={'w-full p-3 rounded-xl border flex items-center gap-3 text-left transition ' + (selected ? 'bg-[color:var(--teal-soft)] border-[color:var(--teal)] ring-1 ring-[color:var(--teal)]' : 'bg-[color:var(--surface)] border-[color:var(--line)] hover:bg-[color:var(--parchment)]')}>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-[13.5px] text-[color:var(--ink)]">{title}</div>
        {sub && <div className="text-[11px] text-[color:var(--mute)] mt-0.5 leading-snug">{sub}</div>}
      </div>
      {selected && <Ico.check className="w-4 h-4 text-[color:var(--teal)] shrink-0" />}
    </button>
  )
}

function SettingRow({ icon, label, value, onClick, last }) {
  return (
    <button onClick={onClick} className={'w-full flex items-center gap-3 px-4 py-3 text-left transition hover:bg-[color:var(--parchment)]/50 ' + (last ? '' : 'border-b border-[color:var(--line)]/60')}>
      <div className="w-8 h-8 rounded-lg bg-[color:var(--teal-soft)] text-[color:var(--teal)] flex items-center justify-center shrink-0">{icon}</div>
      <span className="text-[12.5px] text-[color:var(--ink-soft)] shrink-0">{label}</span>
      <span className="font-semibold text-[13px] text-[color:var(--ink)] truncate ml-auto text-right">{value}</span>
      <Ico.chevronR className="w-4 h-4 text-[color:var(--mute)] shrink-0" />
    </button>
  )
}

function ImpactStat({ icon, value, label, onClick }) {
  const inner = (
    <>
      <div className="w-9 h-9 rounded-lg bg-[color:var(--teal-soft)] text-[color:var(--teal)] flex items-center justify-center shrink-0">{icon}</div>
      <div className="min-w-0">
        <div className="font-mono-data font-bold text-[17px] text-[color:var(--ink)] leading-none">{value}</div>
        <div className="text-[9px] tracking-[0.1em] uppercase text-[color:var(--mute)] font-semibold mt-1">{label}</div>
      </div>
      {onClick && <Ico.chevronR className="w-4 h-4 text-[color:var(--mute)] shrink-0 ml-auto" />}
    </>
  )
  const cls = 'p-3 rounded-xl bg-[color:var(--surface)] border border-[color:var(--line)] flex items-center gap-2.5'
  return onClick
    ? <button onClick={onClick} className={cls + ' w-full text-left transition hover:bg-[color:var(--parchment)]/50 active:scale-[0.98]'}>{inner}</button>
    : <div className={cls}>{inner}</div>
}

export default function Profile({ lang, setLang, isp, pkg, ispCode, setIspCode, pkgId, setPkgId, user, setUser, currentDistrict, locationMode, setLocationMode, manualDistrict, setManualDistrict, theme, setTheme, notifPref, setNotifPref, setScreen, setMapLayer, setTourSeen, deleteAccount, logout }) {
  // Achievements = the 6 contributor ranks, earned by cumulative XP.
  const rankLevel = levelFromXp(user.xp)
  const nextRank = LEVELS.find((l) => l.n === rankLevel + 1) || null
  const xpToNextRank = nextRank ? Math.max(0, nextRank.xp - user.xp) : 0
  const dark = theme === 'dark'

  const [sheet, setSheet] = useState(null) // 'lang' | 'isp' | 'district' | 'notif' | 'name' | 'delete'
  const [nameInput, setNameInput] = useState(user.displayName)
  const [deleteConfirm, setDeleteConfirm] = useState('') // typed "DELETE" gate

  // "Places explored" = distinct ~1.2 km cells the user has tested from, derived
  // from the map's me_tests.json so the map and profile share one definition.
  const [places, setPlaces] = useState(user.placesExplored ?? 0)
  useEffect(() => {
    if (!user.totalTests) { setPlaces(0); return }
    let alive = true
    fetch('/data/me_tests.json')
      .then((r) => r.json())
      .then((tests) => { if (alive) setPlaces(placesFromTests(tests)) })
      .catch(() => {})
    return () => { alive = false }
  }, [user.totalTests])

  const packages = PACKAGES_BY_ISP[ispCode] || []
  const notif = NOTIF_OPTIONS.find((o) => o.k === notifPref) || NOTIF_OPTIONS[1]
  const close = () => setSheet(null)

  const pickIsp = (code) => {
    setIspCode(code)
    const first = (PACKAGES_BY_ISP[code] || [])[0]
    setPkgId(first ? first.id : '')
  }
  const saveName = () => {
    const v = nameInput.trim()
    if (v) setUser((u) => ({ ...u, displayName: v }))
    close()
  }

  return (
    <div className="pb-28">
      <StatusBar />

      {/* Eyebrow */}
      <div className="px-6 pt-4 fade-up">
        <div className="flex items-center gap-2 text-[10px] tracking-[0.18em] uppercase text-[color:var(--gold)] font-semibold">
          <Ico.shield className="w-3 h-3" />{t(lang, 'Contributor profile', 'অবদানকারীর প্রোফাইল')}
        </div>
      </div>

      {/* Contributor card — shared with Home (rank badge + progress to next rank) */}
      <ContributorCard lang={lang} user={user} onClick={() => setScreen('rewards')} className="fade-up fade-up-1 mt-2.5" />

      {/* Your impact — the civic story */}
      <div className="px-5 mt-5 mb-2 fade-up fade-up-2">
        <span className="eyebrow">{t(lang, 'Your impact', 'আপনার প্রভাব')}</span>
      </div>
      <div className="fade-up fade-up-2 mx-5">
        <div className="grid grid-cols-2 gap-2">
          <ImpactStat icon={<Ico.history className="w-[18px] h-[18px]" />} value={user.totalTests} label={t(lang, 'Total tests', 'মোট পরীক্ষা')} onClick={() => setScreen('history')} />
          <ImpactStat icon={<Ico.pin className="w-[18px] h-[18px]" />} value={places} label={t(lang, 'Places explored', 'স্থান অন্বেষণ')} onClick={() => { setMapLayer('places'); setScreen('map') }} />
          <ImpactStat icon={<Ico.network className="w-[18px] h-[18px]" />} value={user.ispsTested} label={t(lang, 'ISPs tested', 'ISP পরীক্ষিত')} />
          <ImpactStat icon={<Ico.pin className="w-[18px] h-[18px]" />} value={user.districtsCovered} label={t(lang, 'Districts explored', 'জেলা অন্বেষণ')} onClick={() => { setMapLayer('coverage'); setScreen('map') }} />
        </div>
      </div>

      {/* Achievements — the 6 contributor ranks, climbed via XP */}
      <div className="px-5 mt-5 mb-2 fade-up fade-up-3 flex items-center justify-between">
        <span className="eyebrow">{t(lang, 'Achievements', 'অর্জন')}</span>
        <button onClick={() => setScreen('badges')} className="flex items-center gap-1 text-[11px] font-semibold text-[color:var(--teal)]">
          {t(lang, `Rank ${rankLevel} of 6`, `র‍্যাঙ্ক ${rankLevel} / ৬`)}<Ico.chevronR className="w-3 h-3" />
        </button>
      </div>
      <button onClick={() => setScreen('badges')}
        className="fade-up fade-up-3 mx-5 w-[calc(100%-40px)] text-left rounded-2xl bg-[color:var(--surface)] border border-[color:var(--line)] p-3.5 transition hover:bg-[color:var(--parchment)]/40 active:scale-[0.99]">
        {/* The full journey, at a glance */}
        <div className="flex items-center justify-between gap-1.5">
          {LEVELS.map((l) => {
            const state = l.n < rankLevel ? 'earned' : l.n === rankLevel ? 'current' : 'locked'
            return (
              <div key={l.n} className="flex flex-col items-center gap-1">
                <RankMedal rank={l} state={state} size={state === 'current' ? 44 : 38} />
              </div>
            )
          })}
        </div>
        {/* Progress toward the next rank */}
        <div className="mt-3.5 flex items-center gap-2">
          <span className="text-[20px] leading-none">{(LEVELS[rankLevel - 1] || LEVELS[0]).emoji}</span>
          <div className="flex-1 min-w-0">
            <div className={'text-[12.5px] font-semibold text-[color:var(--ink)] leading-tight ' + (lang === 'bn' ? 'font-bn' : '')}>
              {t(lang, (LEVELS[rankLevel - 1] || LEVELS[0]).title, (LEVELS[rankLevel - 1] || LEVELS[0]).title_bn)}
            </div>
            {nextRank ? (
              <div className="text-[10.5px] text-[color:var(--ink-soft)] mt-0.5">
                {t(lang, `${xpToNextRank} XP to ${nextRank.title}`, `${nextRank.title_bn}-এ ${xpToNextRank} XP বাকি`)}
              </div>
            ) : (
              <div className="text-[10.5px] font-semibold text-[color:var(--gold)] mt-0.5">{t(lang, 'Top rank reached 👑', 'সর্বোচ্চ র‍্যাঙ্ক অর্জিত 👑')}</div>
            )}
          </div>
        </div>
        {nextRank && (
          <div className="mt-2 h-2 rounded-full bg-[color:var(--parchment-deep)] overflow-hidden">
            <div className="h-full rounded-full"
              style={{
                width: Math.min(100, Math.round(((user.xp - (LEVELS[rankLevel - 1] || LEVELS[0]).xp) / (nextRank.xp - (LEVELS[rankLevel - 1] || LEVELS[0]).xp)) * 100)) + '%',
                background: `linear-gradient(90deg, ${(LEVELS[rankLevel - 1] || LEVELS[0]).c1}, ${nextRank.c2})`,
              }}></div>
          </div>
        )}
      </button>

      {/* Settings — secondary, lives below the profile story */}
      <div className="px-5 mt-5 mb-2 fade-up fade-up-5">
        <span className="eyebrow">{t(lang, 'Settings', 'সেটিংস')}</span>
      </div>
      <div className="fade-up fade-up-5 mx-5 rounded-2xl bg-[color:var(--surface)] border border-[color:var(--line)] overflow-hidden">
        <SettingRow icon={<Ico.pencil className="w-4 h-4" />} label={t(lang, 'Username', 'ইউজারনেম')} value={user.displayName} onClick={() => { setNameInput(user.displayName); setSheet('name') }} />

        {/* Dark mode toggle (inline) */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[color:var(--line)]/60">
          <div className="w-8 h-8 rounded-lg bg-[color:var(--teal-soft)] text-[color:var(--teal)] flex items-center justify-center shrink-0">
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" /></svg>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[12.5px] text-[color:var(--ink-soft)]">{t(lang, 'Dark mode', 'ডার্ক মোড')}</div>
            <div className="text-[11px] text-[color:var(--mute)] mt-px">{dark ? t(lang, 'On', 'চালু') : t(lang, 'Off', 'বন্ধ')}</div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={dark}
            aria-label={t(lang, 'Toggle dark mode', 'ডার্ক মোড টগল')}
            onClick={() => setTheme(dark ? 'light' : 'dark')}
            className={'w-10 h-6 rounded-full transition relative shrink-0 ' + (dark ? 'bg-[color:var(--teal)]' : 'bg-[color:var(--parchment-deep)]')}>
            <span className={'absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all ' + (dark ? 'left-[18px]' : 'left-0.5')}></span>
          </button>
        </div>

        <SettingRow icon={<Ico.globe className="w-4 h-4" />} label={t(lang, 'Language', 'ভাষা')} value={lang === 'en' ? 'English' : 'বাংলা'} onClick={() => setSheet('lang')} />
        <SettingRow icon={<Ico.network className="w-4 h-4" />} label={t(lang, 'ISP & plan', 'ISP ও প্যাকেজ')} value={`${isp?.name || '—'} · ${pkg?.name || '—'}`} onClick={() => setSheet('isp')} />
        <SettingRow icon={<Ico.pin className="w-4 h-4" />} label={t(lang, 'Location', 'অবস্থান')} value={currentDistrict} onClick={() => setSheet('district')} />
        <SettingRow icon={<Ico.bell className="w-4 h-4" />} label={t(lang, 'Notifications', 'বিজ্ঞপ্তি')} value={t(lang, notif.en, notif.bn)} onClick={() => setSheet('notif')} />

        {/* Log out — returns to onboarding, keeps the account intact */}
        <button
          type="button"
          onClick={() => logout && logout()}
          className="w-full flex items-center gap-3 px-4 py-3.5 text-left transition hover:bg-[color:var(--parchment)]/50 border-t border-[color:var(--line)]/60">
          <div className="w-8 h-8 rounded-lg bg-[color:var(--teal-soft)] text-[color:var(--teal)] flex items-center justify-center shrink-0">
            <Ico.logout className="w-4 h-4" />
          </div>
          <span className="font-semibold text-[13px] text-[color:var(--ink)]">{t(lang, 'Log out', 'লগ আউট')}</span>
          <Ico.chevronR className="w-4 h-4 text-[color:var(--mute)] shrink-0 ml-auto" />
        </button>

        {/* Destructive row — opens a confirmation modal, never deletes on tap */}
        <button
          type="button"
          onClick={() => { setDeleteConfirm(''); setSheet('delete') }}
          className="w-full flex items-center gap-3 px-4 py-3.5 text-left transition hover:bg-[color:var(--coral-soft)]/40 border-t border-[color:var(--line)]/60">
          <div className="w-8 h-8 rounded-lg bg-[color:var(--coral-soft)] text-[color:var(--coral)] flex items-center justify-center shrink-0">
            <Ico.trash className="w-4 h-4" />
          </div>
          <span className="font-semibold text-[13px] text-[color:var(--coral)]">{t(lang, 'Delete my account', 'আমার অ্যাকাউন্ট মুছুন')}</span>
          <Ico.chevronR className="w-4 h-4 text-[color:var(--mute)] shrink-0 ml-auto" />
        </button>
      </div>

      {/* Replay tour */}
      <button
        type="button"
        onClick={() => { setTourSeen(false); setScreen('home'); }}
        className="fade-up fade-up-5 mx-5 mt-3 w-[calc(100%-40px)] p-3 rounded-2xl bg-[color:var(--surface)] border border-[color:var(--line)] flex items-center gap-3 hover:bg-[color:var(--parchment)]/40 transition text-left">
        <div className="w-10 h-10 rounded-lg bg-[color:var(--gold-soft)] flex items-center justify-center text-[color:var(--gold)] shrink-0">
          <Ico.sparkle className="w-4.5 h-4.5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-[13px] text-[color:var(--ink)] leading-tight">{t(lang, 'Replay the welcome tour', 'স্বাগতম ট্যুর আবার দেখুন')}</div>
          <div className="text-[11px] text-[color:var(--ink-soft)] mt-0.5">{t(lang, '5 quick steps about the home screen', 'হোম স্ক্রিন সম্পর্কে ৫টি দ্রুত ধাপ')}</div>
        </div>
        <Ico.chevronR className="w-4 h-4 text-[color:var(--mute)] shrink-0" />
      </button>

      {/* Data sovereignty assurance */}
      <div className="fade-up fade-up-5 mx-5 mt-3 p-3 rounded-2xl bg-[color:var(--teal-soft)] border border-[color:var(--teal)]/20 flex items-start gap-2">
        <Ico.shield className="w-4 h-4 text-[color:var(--teal)] shrink-0 mt-0.5" />
        <div className="text-[11px] text-[color:var(--ink)] leading-snug">
          <span className="font-semibold">{t(lang, 'Data sovereignty', 'তথ্য সার্বভৌমত্ব')}.</span> {t(lang, 'Your tests are stored in Bangladesh under BTRC oversight. No personal identifiers leave the device.', 'আপনার পরীক্ষাগুলি BTRC-র তত্ত্বাবধানে বাংলাদেশেই সংরক্ষিত। কোনো ব্যক্তিগত তথ্য ডিভাইস ছাড়ে না।')}
        </div>
      </div>

      <div className="mt-6 pb-4 text-center text-[10px] text-[color:var(--mute)] font-mono-data">v2.0 · © BTRC 2026</div>

      {/* ===== Sheets ===== */}
      {sheet === 'lang' && (
        <Sheet title={t(lang, 'Language', 'ভাষা')} subtitle={t(lang, 'Choose your interface language.', 'আপনার ইন্টারফেস ভাষা বেছে নিন।')} close={close}>
          <div className="space-y-2">
            <OptionRow title="English" sub="Default interface language" selected={lang === 'en'} onClick={() => { setLang('en'); close() }} />
            <OptionRow title="বাংলা" sub="বাংলা ইন্টারফেস" selected={lang === 'bn'} onClick={() => { setLang('bn'); close() }} />
          </div>
        </Sheet>
      )}

      {sheet === 'isp' && (
        <Sheet title={t(lang, 'ISP & plan', 'ISP ও প্যাকেজ')} subtitle={t(lang, 'Tests compare against your advertised speed.', 'পরীক্ষাগুলি আপনার প্রচারিত গতির সাথে তুলনা করা হয়।')} close={close}>
          <div className="eyebrow mb-2">{t(lang, 'Provider', 'প্রোভাইডার')}</div>
          <div className="space-y-2">
            {ISPS.map((i) => (
              <OptionRow key={i.code} title={i.name} sub={i.kind} selected={i.code === ispCode} onClick={() => pickIsp(i.code)} />
            ))}
          </div>

          <div className="eyebrow mt-5 mb-2">{t(lang, 'Plan', 'প্যাকেজ')}</div>
          <div className="space-y-2">
            {packages.map((p) => {
              const sel = p.id === pkgId
              return (
                <button key={p.id} onClick={() => setPkgId(p.id)}
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

          <button onClick={close} className="btn-primary w-full py-3.5 rounded-2xl font-semibold text-[14px] mt-5">{t(lang, 'Done', 'সম্পন্ন')}</button>
        </Sheet>
      )}

      {sheet === 'district' && (
        <LocationModal
          lang={lang}
          locationMode={locationMode}
          setLocationMode={setLocationMode}
          manualDistrict={manualDistrict}
          setManualDistrict={setManualDistrict}
          close={close}
        />
      )}

      {sheet === 'notif' && (
        <Sheet title={t(lang, 'Notification preferences', 'বিজ্ঞপ্তি পছন্দ')} subtitle={t(lang, 'Pick how much you hear from us.', 'আপনি কতটা শুনতে চান তা বেছে নিন।')} close={close}>
          <div className="space-y-2">
            {NOTIF_OPTIONS.map((o) => (
              <OptionRow key={o.k} title={t(lang, o.en, o.bn)} sub={t(lang, o.sub_en, o.sub_bn)} selected={notifPref === o.k} onClick={() => { setNotifPref(o.k); close() }} />
            ))}
          </div>
        </Sheet>
      )}

      {sheet === 'name' && (
        <Sheet title={t(lang, 'Username', 'ইউজারনেম')} subtitle={t(lang, 'Shown on the district leaderboard if your profile is public.', 'আপনার প্রোফাইল প্রকাশ্য হলে লিডারবোর্ডে দেখানো হবে।')} close={close}>
          <label className="eyebrow">{t(lang, 'Display name', 'প্রদর্শন নাম')}</label>
          <input
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            maxLength={24}
            autoFocus
            onKeyDown={(e) => { if (e.key === 'Enter') saveName() }}
            placeholder={t(lang, 'e.g. Mirpur Watcher', 'যেমন মিরপুর ওয়াচার')}
            className="mt-1.5 w-full p-3 rounded-xl border border-[color:var(--line)] bg-[color:var(--surface)] text-[color:var(--ink)] font-medium text-[14px] focus:outline-none focus:border-[color:var(--teal)] focus:ring-1 focus:ring-[color:var(--teal)]"
          />
          <div className="text-[11px] text-[color:var(--mute)] mt-1.5">{t(lang, 'Up to 24 characters.', 'সর্বোচ্চ ২৪ অক্ষর।')}</div>
          <button onClick={saveName} className="btn-primary w-full py-3.5 rounded-2xl font-semibold text-[14px] mt-4">{t(lang, 'Save', 'সংরক্ষণ')}</button>
        </Sheet>
      )}

      {sheet === 'delete' && (() => {
        const confirmed = deleteConfirm.trim().toUpperCase() === 'DELETE'
        return (
          <div className="absolute inset-0 z-50 flex items-end overlay">
            <div className="absolute inset-0 bg-black/55" onClick={close}></div>
            <div className="relative w-full bg-[color:var(--cream)] rounded-t-3xl p-5 sheet max-h-[90%] overflow-y-auto">
              <div className="w-10 h-1.5 rounded-full bg-[color:var(--line)] mx-auto mb-4"></div>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[color:var(--coral)]/15 flex items-center justify-center text-[color:var(--coral)] shrink-0">
                  <Ico.trash className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-display text-[20px] text-[color:var(--ink)] leading-tight">{t(lang, 'Delete my account', 'আমার অ্যাকাউন্ট মুছুন')}</div>
                  <div className="text-[12px] font-semibold text-[color:var(--coral)] mt-0.5">{t(lang, 'This is permanent and cannot be undone.', 'এটি স্থায়ী এবং ফেরানো যাবে না।')}</div>
                </div>
              </div>

              {/* What happens */}
              <div className="mt-4 p-3.5 rounded-2xl bg-[color:var(--surface)] border border-[color:var(--line)] space-y-3">
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-[color:var(--coral-soft)] text-[color:var(--coral)] flex items-center justify-center shrink-0"><Ico.lock className="w-3.5 h-3.5" /></div>
                  <div className="text-[12px] text-[color:var(--ink)] leading-snug">{t(lang, 'Your account is revoked. You are logged out and will no longer be able to log in.', 'আপনার অ্যাকাউন্ট বাতিল হবে। আপনি লগ আউট হবেন এবং আর লগ ইন করতে পারবেন না।')}</div>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-[color:var(--coral-soft)] text-[color:var(--coral)] flex items-center justify-center shrink-0"><Ico.cross className="w-3.5 h-3.5" /></div>
                  <div className="text-[12px] text-[color:var(--ink)] leading-snug">{t(lang, 'Your personal identifiers — username, location and ISP — are permanently removed.', 'আপনার ব্যক্তিগত পরিচয় — ইউজারনেম, অবস্থান ও ISP — স্থায়ীভাবে মুছে যাবে।')}</div>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-[color:var(--teal)]/15 text-[color:var(--teal)] flex items-center justify-center shrink-0"><Ico.shield className="w-3.5 h-3.5" /></div>
                  <div className="text-[12px] text-[color:var(--ink)] leading-snug">{t(lang, 'Your submitted QoS test data is kept but fully anonymized — it can no longer be linked back to you.', 'আপনার জমা দেওয়া QoS পরীক্ষার ডেটা রাখা হবে তবে সম্পূর্ণ বেনামী — আর আপনার সাথে যুক্ত করা যাবে না।')}</div>
                </div>
              </div>

              {/* Typed confirmation gate */}
              <label className="block mt-4 text-[12px] text-[color:var(--ink-soft)]">
                {t(lang, 'Type ', 'টাইপ করুন ')}<span className="font-mono-data font-bold text-[color:var(--coral)]">DELETE</span>{t(lang, ' to confirm', ' নিশ্চিত করতে')}
              </label>
              <input
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                autoFocus
                autoCapitalize="characters"
                placeholder="DELETE"
                aria-label={t(lang, 'Type DELETE to confirm', 'নিশ্চিত করতে DELETE টাইপ করুন')}
                className={'mt-1.5 w-full p-3 rounded-xl border bg-[color:var(--surface)] text-[color:var(--ink)] font-mono-data font-semibold tracking-[0.12em] text-[14px] focus:outline-none focus:ring-1 ' + (confirmed ? 'border-[color:var(--coral)] focus:border-[color:var(--coral)] focus:ring-[color:var(--coral)]' : 'border-[color:var(--line)] focus:border-[color:var(--ink-soft)] focus:ring-[color:var(--ink-soft)]')}
              />

              <div className="mt-4 grid grid-cols-2 gap-2">
                <button onClick={close} className="py-3.5 rounded-2xl bg-[color:var(--surface)] border border-[color:var(--line)] font-semibold text-[13.5px] text-[color:var(--ink)]">
                  {t(lang, 'Cancel', 'বাতিল')}
                </button>
                <button
                  disabled={!confirmed}
                  onClick={() => { if (!confirmed) return; close(); deleteAccount && deleteAccount() }}
                  className="py-3.5 rounded-2xl font-semibold text-[13.5px] text-white flex items-center justify-center gap-2 transition disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ background: 'var(--coral)' }}>
                  <Ico.trash className="w-4 h-4" />
                  {t(lang, 'Delete my account', 'মুছে ফেলুন')}
                </button>
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}
