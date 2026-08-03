import { useState, useEffect } from 'react'
import { Ico } from '../components/Icons.jsx'
import { StatusBar, BrandHeader } from '../components/Header.jsx'
import { TestModeCard, ContributorCard } from '../components/UI.jsx'
import { PlanModal, LocationModal, TestModeInfoModal, HomeTutorial } from '../components/Modals.jsx'
import { t } from '../i18n/strings.js'
import { PACKAGES_BY_ISP } from '../data/isps.js'
import { MISSIONS } from '../data/seed.js'
import { RELIABILITY } from '../data/reliability.js'

function relativeTime(isoDate, lang) {
  if (!isoDate) return ''
  const diff = Date.now() - new Date(isoDate).getTime()
  const mins = Math.max(0, Math.floor(diff / 60000))
  if (mins < 1) return t(lang, 'just now', 'এইমাত্র')
  if (mins < 60) return mins + (lang === 'bn' ? ' মিনিট আগে' : 'm ago')
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return hrs + (lang === 'bn' ? ' ঘণ্টা আগে' : 'h ago')
  const days = Math.floor(hrs / 24)
  return days + (lang === 'bn' ? ' দিন আগে' : 'd ago')
}

export default function Home({ lang, switchLang, user, isp, pkg, pkgId, setPkgId, ispCode, locationMode, setLocationMode, currentDistrict, manualDistrict, setManualDistrict, testMode, setTestMode, runTest, setScreen, notifications, openInbox, tourSeen, setTourSeen, lastTest }) {
  const [locOpen, setLocOpen] = useState(false)
  const [pkgOpen, setPkgOpen] = useState(false)
  const [testInfoOpen, setTestInfoOpen] = useState(false)
  const [tourOpen, setTourOpen] = useState(false)

  useEffect(() => {
    if (user.totalTests === 0 && !tourSeen) {
      const id = setTimeout(() => setTourOpen(true), 550)
      return () => clearTimeout(id)
    }
  }, [user.totalTests, tourSeen])

  const finishTour = () => { setTourSeen(true); setTourOpen(false); }
  const packages = PACKAGES_BY_ISP[ispCode] || []

  const dailyMissions = MISSIONS.filter((m) => m.kind === 'Daily')
  const topMission = dailyMissions.find((m) => m.progress < m.target) || dailyMissions[0]

  const verdict = lastTest && lastTest.verdict ? (RELIABILITY[lastTest.verdict] || RELIABILITY.good) : null
  const onHistory = () => setScreen('history')
  const onRewards = () => setScreen('rewards')

  return (
    <div className="pb-36">
      <StatusBar />
      <BrandHeader lang={lang} switchLang={switchLang} notifications={notifications} openInbox={openInbox} />

      {/* Compact status banner — taps through to Test history */}
      {lastTest && verdict && (
        <button onClick={onHistory} className="fade-up mt-1.5 mx-5 w-[calc(100%-40px)] px-3.5 py-2.5 rounded-2xl card-parch flex items-center gap-3 text-left">
          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: verdict.dot, boxShadow: '0 0 0 4px ' + verdict.bg }}></span>
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-1.5">
              <span className="font-display text-[16px] leading-tight" style={{ color: verdict.dot }}>{t(lang, verdict.en, verdict.bn)}</span>
              <span className="text-[color:var(--mute)] text-[11px]">·</span>
              <span className="font-mono-data text-[12px] font-semibold text-[color:var(--ink)]">{lastTest.down.toFixed(1)} Mbps</span>
            </div>
            <div className="text-[10.5px] text-[color:var(--mute)] mt-px">
              {t(lang, 'Last test', 'শেষ পরীক্ষা')} {lastTest.relativeWhen} · {lastTest.isp} · {lastTest.district}
            </div>
          </div>
          <Ico.chevronR className="w-3.5 h-3.5 text-[color:var(--mute)] shrink-0" />
        </button>
      )}

      {!lastTest && (
        <div className="fade-up mt-1.5 mx-5 px-3.5 py-2.5 rounded-2xl card-parch flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: 'var(--gold)', boxShadow: '0 0 0 4px var(--gold-soft)' }}></span>
          <div className="flex-1 text-[12px] text-[color:var(--ink-soft)]">
            {t(lang, 'No tests yet — your first run earns +30 XP.', 'এখনও কোনো পরীক্ষা হয়নি — প্রথম পরীক্ষায় +৩০ XP।')}
          </div>
        </div>
      )}

      {/* Test mode — sits directly above the action it parameterises */}
      <div className="fade-up fade-up-1 mx-5 mt-4">
        <div className="flex items-center justify-between mb-1.5 pl-1 pr-0.5">
          <div className="eyebrow">{t(lang, 'Test mode', 'পরীক্ষার ধরন')}</div>
          <button
            type="button"
            onClick={() => setTestInfoOpen(true)}
            aria-label={t(lang, 'What do these tests measure?', 'এই পরীক্ষাগুলি কী পরিমাপ করে?')}
            className="w-6 h-6 rounded-full flex items-center justify-center text-[color:var(--mute)] hover:text-[color:var(--teal)] hover:bg-[color:var(--teal-soft)] transition">
            <Ico.info className="w-4 h-4" />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <TestModeCard active={testMode === 'quick'} onClick={() => setTestMode('quick')} title={t(lang, 'Quick', 'দ্রুত')} desc={t(lang, 'Speed only · ~7s', 'শুধু স্পিড · ~৭সে')} xp="+10" />
          <TestModeCard active={testMode === 'full'} onClick={() => setTestMode('full')} title={t(lang, 'Full QoS', 'সম্পূর্ণ QoS')} desc={t(lang, 'All metrics · ~22s', 'সব মেট্রিক · ~২২সে')} xp="+30" highlight />
        </div>
      </div>

      {/* Run test — hero, above the fold */}
      <div className="fade-up fade-up-2 mt-5 mx-5 mb-1.5 flex justify-center">
        <button onClick={runTest} className="ring-gold relative w-48 h-48 rounded-full flex items-center justify-center bg-transparent p-0 border-0">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[color:var(--teal)] to-[color:var(--teal-deep)] shadow-[0_20px_40px_-10px_rgba(7,59,82,0.45)]"></div>
          <div className="absolute inset-2 rounded-full border border-white/15"></div>
          <div className="absolute inset-4 rounded-full border-2 border-dashed border-white/10"></div>
          <div className="relative z-10 text-center text-white">
            <div className="flex justify-center mb-1">
              <Ico.network className="w-4 h-4 text-[color:var(--gold-soft)] opacity-85" />
            </div>
            <div className="font-display text-[26px] leading-none">{t(lang, 'Run test', 'পরীক্ষা করুন')}</div>
            <div className="text-[10px] text-white/65 mt-1.5">
              {testMode === 'quick' ? t(lang, 'Quick mode', 'দ্রুত মোড') : t(lang, 'Full QoS mode', 'সম্পূর্ণ QoS মোড')}
            </div>
          </div>
        </button>
      </div>

      <div className="fade-up fade-up-3 text-center text-[11px] text-[color:var(--mute)] mx-6 mt-1">
        {testMode === 'quick'
          ? t(lang, 'Quick takes about 7 seconds and uses ~12MB.', 'দ্রুত পরীক্ষায় ~৭ সেকেন্ড ও ~১২MB লাগে।')
          : t(lang, 'Full QoS takes about 22 seconds and uses ~30MB.', 'সম্পূর্ণ QoS-এ ~২২ সেকেন্ড ও ~৩০MB লাগে।')}
      </div>

      {/* Ornament rule — "your contribution" section */}
      <div className="fade-up fade-up-4 flex items-center justify-center gap-2.5 mx-5 mt-5 mb-1">
        <div className="flex-1 divider-dashed"></div>
        <span className="eyebrow-gold" style={{ letterSpacing: '0.24em' }}>{t(lang, 'Your contribution', 'আপনার অবদান')}</span>
        <div className="flex-1 divider-dashed"></div>
      </div>

      {/* Contributor card — rank badge + progress to next rank */}
      <ContributorCard lang={lang} user={user} onClick={() => setScreen('about')} className="fade-up fade-up-4 mt-3" />

      {/* Redeem rewards card */}
      <button onClick={onRewards} className="fade-up fade-up-5 mx-5 mt-2 w-[calc(100%-40px)] p-3 rounded-xl flex items-center gap-3 text-left" style={{ background: 'var(--gold-soft)', border: '1px solid rgba(184,134,11,0.25)' }}>
        <div className="w-9 h-9 rounded-lg bg-[color:var(--surface)] flex items-center justify-center shrink-0" style={{ boxShadow: '0 1px 2px rgba(184,134,11,0.15)' }}>
          <Ico.gift className="w-4.5 h-4.5 text-[color:var(--gold)]" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="eyebrow-gold" style={{ letterSpacing: '0.12em' }}>{t(lang, 'Rewards', 'পুরস্কার')}</div>
          <div className="text-[13px] font-semibold text-[color:var(--ink)] leading-tight mt-px">{t(lang, 'Redeem your XP for rewards', 'আপনার XP দিয়ে পুরস্কার পান')}</div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="font-mono-data text-[12px] text-[color:var(--gold)] font-semibold">{user.xpSpendable ?? user.xp}</div>
          <Ico.chevronR className="w-3.5 h-3.5 text-[color:var(--gold)]" />
        </div>
      </button>

      {/* Mission row */}
      <button onClick={() => setScreen('missions')} className="w-full text-left fade-up fade-up-6">
        <div className="mx-5 mt-2 p-3 rounded-xl bg-[color:var(--surface)] border border-[color:var(--line)] flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[color:var(--gold-soft)] flex items-center justify-center shrink-0">
            <Ico.target className="w-4.5 h-4.5 text-[color:var(--gold)]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="eyebrow-gold" style={{ letterSpacing: '0.12em' }}>{t(lang, "Today's mission", 'আজকের মিশন')}</div>
            <div className={'text-[13px] font-semibold text-[color:var(--ink)] leading-tight truncate ' + (lang === 'bn' ? 'font-bn' : '')}>{lang === 'bn' ? topMission.title_bn : topMission.title_en}</div>
            <div className="bar bar-gold mt-1.5"><span style={{ width: (topMission.progress / topMission.target * 100) + '%' }}></span></div>
          </div>
          <div className="text-right shrink-0">
            <div className="font-mono-data text-[13px] text-[color:var(--gold)] font-semibold">+{topMission.xp}</div>
            <div className="text-[9px] text-[color:var(--mute)]">XP</div>
          </div>
        </div>
      </button>

      {pkgOpen && (
        <PlanModal
          lang={lang}
          packages={packages}
          ispName={isp?.name}
          current={pkgId}
          onPick={(id) => { setPkgId(id); setPkgOpen(false); }}
          close={() => setPkgOpen(false)}
        />
      )}

      {locOpen && (
        <LocationModal
          lang={lang}
          locationMode={locationMode} setLocationMode={setLocationMode}
          manualDistrict={manualDistrict} setManualDistrict={setManualDistrict}
          close={() => setLocOpen(false)}
        />
      )}

      {testInfoOpen && <TestModeInfoModal lang={lang} close={() => setTestInfoOpen(false)} />}

      {tourOpen && <HomeTutorial lang={lang} onFinish={finishTour} />}
    </div>
  )
}

export { relativeTime }