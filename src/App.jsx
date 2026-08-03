import { useState, useEffect, useRef } from 'react'
import PhoneShell from './components/PhoneShell.jsx'
import { BottomNav, MoreSheet } from './components/BottomNav.jsx'
import {
  LevelUpOverlay,
  BadgeEarnedOverlay,
  MissionCompleteOverlay,
  ForcedStateOverlay,
  CancelTestSheet,
  TestRecoveryOverlay,
} from './components/Overlays.jsx'
import DemoPanel from './components/DemoPanel.jsx'

import Onboard from './screens/Onboard.jsx'
import Home from './screens/Home.jsx'
import Testing from './screens/Testing.jsx'
import Result from './screens/Result.jsx'
import HistoryScreen, { HistoryDetail } from './screens/History.jsx'
import Missions from './screens/Missions.jsx'
import Leaderboard from './screens/Leaderboard.jsx'
import Badges from './screens/Badges.jsx'
import MapScreen from './screens/Map.jsx'
import Complaint from './screens/Complaint.jsx'
import Profile from './screens/Profile.jsx'
import Inbox from './screens/Inbox.jsx'
import Rewards from './screens/Rewards.jsx'
import VpnBlocked from './screens/VpnBlocked.jsx'

import { ISPS, findPkg } from './data/isps.js'
import { DEFAULT_USER, LEVELS, BADGES, MISSIONS, HISTORY_SEED, NOTIFICATIONS_SEED, REDEMPTIONS_SEED } from './data/seed.js'
import { PERSONAS } from './data/personas.js'
import { classifyReliability } from './data/reliability.js'
import { LS_KEY, loadState, saveState } from './state/store.js'
import { AppEvents, on, emitMissionComplete } from './lib/events.js'

function relativeWhen(isoDate) {
  if (!isoDate) return ''
  const diff = Date.now() - new Date(isoDate).getTime()
  const mins = Math.max(0, Math.floor(diff / 60000))
  if (mins < 1) return 'just now'
  if (mins < 60) return mins + 'm ago'
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return hrs + 'h ago'
  const days = Math.floor(hrs / 24)
  return days + 'd ago'
}

export default function App() {
  const persisted = loadState()
  const [screen, setScreen] = useState(persisted.screen || 'onboard')
  const [mapLayer, setMapLayer] = useState('speed') // initial layer when opening the map
  const [step, setStep] = useState(persisted.step || 1)
  const [consents, setConsents] = useState(persisted.consents || { loc: false, anon: false, device: true })
  const [ispCode, setIspCode] = useState(persisted.ispCode || '')
  const [pkgId, setPkgId] = useState(persisted.pkgId || '')
  const [lang, setLang] = useState(persisted.lang || 'en')
  const [user, setUser] = useState(persisted.user || DEFAULT_USER)
  const [testMode, setTestMode] = useState(persisted.testMode || 'full')
  const [locationMode, setLocationMode] = useState(persisted.locationMode || 'gps')
  const [manualDistrict, setManualDistrict] = useState(persisted.manualDistrict || 'Dhanmondi')
  const [history, setHistory] = useState(persisted.history || HISTORY_SEED)
  const [sheet, setSheet] = useState(null)
  const [testState, setTestState] = useState(null)
  const [resultData, setResultData] = useState(null)
  const [xpBurst, setXpBurst] = useState(null)
  const [selectedHistory, setSelectedHistory] = useState(null)
  const [demoOpen, setDemoOpen] = useState(false)
  const [previewHour, setPreviewHour] = useState(() => new Date().getHours())
  const [previewPlace, setPreviewPlace] = useState('home')
  const [previewIsp, setPreviewIsp] = useState('gp')
  const [activePersona, setActivePersona] = useState(persisted.activePersona || null)
  const [levelUpData, setLevelUpData] = useState(null)
  const [badgeData, setBadgeData] = useState(null)
  const [missionData, setMissionData] = useState(null)
  const [forcedState, setForcedState] = useState(persisted.forcedState || 'normal')
  const [testRecovery, setTestRecovery] = useState(null)
  const [confirmCancelTest, setConfirmCancelTest] = useState(false)
  const testAbortRef = useRef({ aborted: false, timeouts: [] })
  const dailyMissionDoneRef = useRef(false) // daily "test today" mission fires its event once per session
  const [notifications, setNotifications] = useState(persisted.notifications || NOTIFICATIONS_SEED)
  const [redemptions, setRedemptions] = useState(persisted.redemptions || REDEMPTIONS_SEED)
  const [tourSeen, setTourSeen] = useState(persisted.tourSeen ?? false)
  const [theme, setTheme] = useState(persisted.theme || 'light')
  const [notifPref, setNotifPref] = useState(persisted.notifPref || 'issues')

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  const openInbox = () => {
    setNotifications((ns) => ns.map((n) => ({ ...n, read: true })))
    setScreen('inbox')
  }

  // Redeem an XP perk: deduct the cost, mint a voucher code, and file the
  // redemption in history. Returns the created record so the UI can show it.
  const redeem = (perk) => {
    if (!perk || (user.xpSpendable ?? user.xp) < perk.cost) return null
    const prefix = { internet: 'NET', voice: 'VOX', sms: 'SMS' }[perk.cat] || 'GEN'
    const code = 'BTRC-' + prefix + '-' + Math.random().toString(36).slice(2, 7).toUpperCase()
    const record = {
      id: 'rd-' + Date.now(),
      cat: perk.cat,
      title: perk.title,
      sub_en: perk.sub_en,
      sub_bn: perk.sub_bn,
      cost: perk.cost,
      code,
      isoDate: new Date().toISOString(),
      status: 'active',
    }
    setRedemptions((r) => [record, ...r])
    // Redemptions draw down the spendable wallet only — lifetime xp (and rank)
    // are never touched.
    setUser((u) => ({ ...u, xpSpendable: (u.xpSpendable ?? u.xp) - perk.cost }))
    setNotifications((ns) => [{
      id: 'rn-' + Date.now(),
      kind: 'mission',
      when: 'Just now',
      read: false,
      title_en: `Reward redeemed: ${perk.title} ${perk.sub_en}`,
      title_bn: `পুরস্কার নেওয়া হয়েছে: ${perk.title} ${perk.sub_bn}`,
      body_en: `Voucher ${code} · ${perk.cost} spendable XP used. Your rank is unchanged.`,
      body_bn: `ভাউচার ${code} · ${perk.cost} স্পেন্ডেবল XP ব্যবহৃত। আপনার র‍্যাঙ্ক অপরিবর্তিত।`,
      deepLink: 'rewards',
    }, ...ns])
    return record
  }

  useEffect(() => {
    saveState({ screen, step, consents, ispCode, pkgId, lang, user, testMode, locationMode, manualDistrict, history, activePersona, forcedState, tourSeen, theme, notifPref, redemptions })
  }, [screen, step, consents, ispCode, pkgId, lang, user, testMode, locationMode, manualDistrict, history, activePersona, forcedState, tourSeen, theme, notifPref, redemptions])

  const isp = ISPS.find((i) => i.code === ispCode)
  const pkg = findPkg(ispCode, pkgId)
  const currentDistrict = locationMode === 'gps' ? 'Dhanmondi' : manualDistrict

  const latestEntry = history && history.length > 0 ? history[0] : null
  const lastTest = latestEntry ? {
    down: latestEntry.down,
    isp: latestEntry.isp,
    district: latestEntry.district,
    verdict: latestEntry.verdict,
    relativeWhen: relativeWhen(latestEntry.isoDate),
  } : null

  const resetAll = () => {
    localStorage.removeItem(LS_KEY)
    setScreen('onboard'); setStep(1)
    setConsents({ loc: false, anon: false, device: true })
    setIspCode(''); setPkgId(''); setLang('en')
    setUser(DEFAULT_USER)
    setTestMode('full'); setLocationMode('gps')
    setHistory(HISTORY_SEED)
    setActivePersona(null)
    setForcedState('normal')
    setTourSeen(false)
    setNotifications(NOTIFICATIONS_SEED)
    setRedemptions(REDEMPTIONS_SEED)
    setTheme('light')
    setNotifPref('issues')
    dailyMissionDoneRef.current = false
  }

  // Revoke the account: erase the personal identifiers (username, location,
  // ISP/plan) and sign out to onboarding, while the QoS measurements in
  // `history` are retained as anonymous data points — no longer tied to a
  // person — for BTRC's national analysis and reporting.
  const deleteAccount = () => {
    setUser({ ...FRESH_USER, displayName: 'Anonymous', publicProfile: false })
    setIspCode('')
    setPkgId('')
    setConsents({ loc: false, anon: false, device: true })
    setLocationMode('gps')
    setManualDistrict('Dhanmondi')
    setNotifications([])
    setActivePersona(null)
    setTourSeen(false)
    // history is intentionally preserved (anonymized retention)
    setScreen('onboard')
    setStep(1)
  }

  // Sign out: return to onboarding without touching any saved data — the
  // account and its history stay intact, unlike deleteAccount.
  const logout = () => {
    setScreen('onboard')
    setStep(1)
  }

  const applyPersona = (key) => {
    const p = PERSONAS[key]
    if (!p) return
    dailyMissionDoneRef.current = false
    setActivePersona(key)
    setScreen(p.screen)
    if (p.step) setStep(p.step)
    setConsents(p.consents)
    setIspCode(p.ispCode)
    setPkgId(p.pkgId)
    setUser(p.user)
    setHistory(p.history)
    // Established personas carry redemption history; brand-new accounts don't.
    setRedemptions(p.history && p.history.length ? REDEMPTIONS_SEED : [])
    setForcedState('normal')
    setDemoOpen(false)
  }

  const triggerLevelUp = () => {
    const nextLevel = Math.min(6, user.level + 1)
    const lvl = LEVELS.find((l) => l.n === nextLevel) || LEVELS[LEVELS.length - 1]
    setLevelUpData({ level: lvl.n, title: lvl.title, title_bn: lvl.title_bn, emoji: lvl.emoji, c1: lvl.c1, c2: lvl.c2 })
    setDemoOpen(false)
  }

  const triggerBadge = (badgeId) => {
    const b = BADGES.find((x) => x.id === badgeId) || BADGES[5]
    setBadgeData(b)
    setDemoOpen(false)
  }

  const triggerMission = () => {
    emitMissionComplete(MISSIONS[2])
    setDemoOpen(false)
  }

  // Subscribe to mission-complete events emitted anywhere in the app, and react
  // by (1) showing the celebration overlay and (2) dropping a notification in
  // the inbox. Emitters don't know or care about either — see lib/events.js.
  useEffect(() => {
    return on(AppEvents.MISSION_COMPLETE, (mission) => {
      setMissionData(mission)
      setNotifications((ns) => [{
        id: 'mc-' + Date.now(),
        kind: 'mission',
        when: 'Just now',
        read: false,
        title_en: `Mission complete: ${mission.title_en}`,
        title_bn: `মিশন সম্পন্ন: ${mission.title_bn}`,
        body_en: `You earned +${mission.xp} XP.`,
        body_bn: `আপনি +${mission.xp} XP অর্জন করেছেন।`,
        deepLink: 'missions',
      }, ...ns])
    })
  }, [])

  useEffect(() => {
    const newLevel = LEVELS.slice().reverse().find((l) => user.xp >= l.xp)
    if (newLevel && newLevel.n > user.level) {
      setUser((u) => ({ ...u, level: newLevel.n, levelTitle: newLevel.title, xpToNext: (LEVELS.find((l) => l.n === newLevel.n + 1) || { xp: newLevel.xp + 1000 }).xp }))
      setLevelUpData({ level: newLevel.n, title: newLevel.title, title_bn: newLevel.title_bn, emoji: newLevel.emoji, c1: newLevel.c1, c2: newLevel.c2 })
    }
  }, [user.xp])

  const clearTestTimers = () => {
    testAbortRef.current.aborted = true
    testAbortRef.current.timeouts.forEach(clearTimeout)
    testAbortRef.current.timeouts = []
  }

  const runTest = (opts = {}) => {
    const mode = opts.mode || testMode
    clearTestTimers()
    testAbortRef.current = { aborted: false, timeouts: [] }
    setTestRecovery(null)
    setConfirmCancelTest(false)
    setScreen('testing')
    setTestState({ stage: mode === 'quick' ? 'speed' : 'stability', pct: 0, down: 0, up: 0, lat: 0, jitter: 0, loss: 0, mode })

    // Quick: speed only · ~7s. Full QoS: stability → speed → reliability · ~11s.
    const steps = mode === 'quick'
      ? [
          { after: 400,  state: { stage: 'speed', pct: 14, lat: 22, down: 8.4 } },
          { after: 1800, state: { stage: 'speed', pct: 38, lat: 22, down: 24.6 } },
          { after: 3400, state: { stage: 'speed', pct: 62, lat: 22, down: 38.2 } },
          { after: 5000, state: { stage: 'speed', pct: 85, lat: 22, down: 46.4, up: 7.2 } },
          { after: 6200, state: { stage: 'speed', pct: 98, lat: 22, down: 46.4, up: 10.9 } },
        ]
      : [
          { after: 800,  state: { stage: 'stability',   pct: 8,  lat: 18 } },
          { after: 2200, state: { stage: 'stability',   pct: 18, lat: 22, jitter: 2 } },
          { after: 3600, state: { stage: 'speed',       pct: 32, lat: 24, jitter: 2, down: 12.8 } },
          { after: 5200, state: { stage: 'speed',       pct: 48, down: 28.6 } },
          { after: 6800, state: { stage: 'speed',       pct: 64, down: 44.2 } },
          { after: 8200, state: { stage: 'reliability', pct: 80, down: 46.4, up: 7.2 } },
          { after: 9800, state: { stage: 'reliability', pct: 96, down: 46.4, up: 10.9, loss: 0.1 } },
        ]
    const finalDelay = mode === 'quick' ? 7000 : 11000

    const failAt = forcedState === 'networkError' ? 3500
      : forcedState === 'testFailed' ? 6000
      : forcedState === 'serverDown' ? finalDelay - 400
      : null

    const queue = (fn, delay) => {
      const id = setTimeout(() => {
        if (testAbortRef.current.aborted) return
        fn()
      }, delay)
      testAbortRef.current.timeouts.push(id)
    }

    steps.forEach((s) => {
      if (failAt !== null && s.after >= failAt) return
      queue(() => setTestState((prev) => prev ? ({ ...prev, ...s.state }) : prev), s.after)
    })

    if (failAt !== null) {
      queue(() => {
        const lastDone = steps.filter((s) => s.after < failAt).slice(-1)[0]
        const partial = lastDone ? lastDone.state : {}
        const hasUsefulData = (partial.down || 0) > 0
        setTestRecovery({
          reason: forcedState,
          partial: {
            down: partial.down || 0,
            up: partial.up || 0,
            lat: partial.lat || 0,
            jitter: partial.jitter || 0,
            loss: partial.loss || 0,
          },
          canSavePartial: hasUsefulData,
        })
      }, failAt)
    } else {
      queue(() => finishTest({ down: 46.4, up: 10.9, lat: 24, jitter: 3, loss: 0.1, mode }), finalDelay)
    }
  }

  const cancelTest = () => {
    clearTestTimers()
    setTestState(null)
    setTestRecovery(null)
    setConfirmCancelTest(false)
    setScreen('home')
  }

  const retryTest = () => {
    clearTestTimers()
    setTestRecovery(null)
    setForcedState('normal')
    setTimeout(() => runTest(), 80)
  }

  const dismissRecovery = () => {
    clearTestTimers()
    setTestRecovery(null)
    setTestState(null)
    setScreen('home')
  }

  const switchNetworkAndExit = () => {
    clearTestTimers()
    setTestRecovery(null)
    setTestState(null)
    setForcedState('normal')
    setScreen('home')
  }

  const finishTest = (res, opts = {}) => {
    const partial = !!opts.partial
    const mode = res.mode || opts.mode || testMode
    const advertised = pkg?.down || 50
    const delivered = advertised && res.down > 0 ? Math.round((res.down / advertised) * 100) : (partial ? 0 : 93)
    const now = new Date()
    const month = now.toLocaleString('en', { month: 'short' })
    const whenStr = String(now.getDate()).padStart(2, '0') + ' ' + month + ' · ' + String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0')
    const jitter = res.jitter || 3
    const loss = res.loss || 0.1
    const entry = {
      id: 'h' + Date.now(),
      when: whenStr,
      isoDate: now.toISOString(),
      isp: isp?.name || '—',
      advertisedDown: advertised,
      advertisedUp: pkg?.up || 10,
      down: res.down, up: res.up, lat: res.lat,
      jitter, loss,
      dns: partial ? null : 86,
      webLoad: partial ? null : 1.4,
      delivered, district: currentDistrict,
      networkType: locationMode === 'gps' ? '4G' : 'WiFi',
      locationSource: locationMode === 'gps' ? 'GPS' : 'Manual',
      submitted: !partial,
      submissionId: partial ? null : 'BD2026-' + Math.floor(1000 + Math.random() * 9000),
      flagged: !partial && delivered < 70,
      mode,
      partial,
    }

    const verdict = classifyReliability(res.down, advertised, res.lat, jitter, loss)
    entry.verdict = verdict.key

    const isFirstTest = (user.totalTests || 0) === 0
    const peerCount = Math.floor(8 + Math.random() * 6)
    const impact = isFirstTest
      ? { en: `You're the first to test in this part of ${currentDistrict} today.`, bn: `আজ ${currentDistrict}-এর এই অংশে আপনি প্রথম পরীক্ষা করেছেন।` }
      : entry.flagged
      ? { en: '3 contributors near you reported similar performance in the last hour.', bn: 'গত এক ঘণ্টায় আপনার কাছে ৩ জন একই ধরনের সমস্যা জানিয়েছেন।' }
      : { en: `Your test joined ${peerCount} others in ${currentDistrict} this hour.`, bn: `${currentDistrict}-এ এই ঘণ্টায় আপনার পরীক্ষা ${peerCount}টির সাথে যুক্ত হলো।` }

    const gainedXp = partial
      ? 5
      : (mode === 'full' ? 30 : 10) + (locationMode === 'gps' ? 5 : 0) + (entry.flagged ? 50 : 0)

    setHistory((h) => [entry, ...h])
    // Earning credits BOTH balances: lifetime xp (rank) and the spendable wallet.
    setUser((u) => ({ ...u, xp: u.xp + gainedXp, xpSpendable: (u.xpSpendable ?? u.xp) + gainedXp, totalTests: u.totalTests + 1, testsThisMonth: u.testsThisMonth + 1 }))
    setXpBurst(gainedXp)
    setResultData({ entry, verdict, impact, contribution: 1, accuracy: !entry.flagged ? 1 : 0 })
    setTestState(null)
    setScreen('result')

    // A completed (non-partial) test fulfils the daily "Test your internet
    // today" mission. Emit once per session; the app handles the celebration.
    if (!partial && !dailyMissionDoneRef.current) {
      dailyMissionDoneRef.current = true
      const dailyMission = MISSIONS.find((m) => m.id === 'd1') || MISSIONS[0]
      emitMissionComplete(dailyMission)
    }
  }

  const savePartialResult = () => {
    const p = testRecovery?.partial || { down: 0, up: 0, lat: 0, jitter: 0, loss: 0 }
    setTestRecovery(null)
    setForcedState('normal')
    finishTest(p, { partial: true })
  }

  const switchLang = () => setLang((l) => (l === 'en' ? 'bn' : 'en'))

  const showNav = forcedState !== 'vpn' && ['home', 'rewards', 'missions', 'leaderboard', 'about'].includes(screen)

  return (
    <>
      <PhoneShell
        nav={showNav ? <BottomNav screen={screen} setScreen={setScreen} lang={lang} /> : null}
        overlay={sheet === 'more' ? <MoreSheet lang={lang} setSheet={setSheet} setScreen={setScreen} /> : null}
        sheets={
          <>
            {confirmCancelTest && (
              <CancelTestSheet
                lang={lang}
                close={() => setConfirmCancelTest(false)}
                confirm={cancelTest}
                pct={testState?.pct || 0}
              />
            )}
            {testRecovery && (
              <TestRecoveryOverlay
                lang={lang}
                recovery={testRecovery}
                onRetry={retryTest}
                onSavePartial={savePartialResult}
                onSwitchNetwork={switchNetworkAndExit}
                onDismiss={dismissRecovery}
              />
            )}
            {forcedState !== 'normal' && forcedState !== 'vpn' && screen !== 'testing' && !testRecovery && (
              <ForcedStateOverlay state={forcedState} onClose={() => setForcedState('normal')} />
            )}
          </>
        }>
        {forcedState === 'vpn' ? (
          <VpnBlocked lang={lang} onRetry={() => setForcedState('normal')} />
        ) : (
          <>
            {screen === 'onboard' && <Onboard {...{ lang, switchLang, setScreen, setConsents, setIspCode, setPkgId, setUser, setHistory, setTourSeen, setLocationMode, setManualDistrict }} />}
            {screen === 'home' && <Home {...{ lang, switchLang, user, isp, pkg, pkgId, setPkgId, ispCode, locationMode, setLocationMode, currentDistrict, manualDistrict, setManualDistrict, testMode, setTestMode, runTest, setScreen, notifications, openInbox, tourSeen, setTourSeen, lastTest }} />}
            {screen === 'testing' && <Testing lang={lang} testState={testState} testMode={testMode} requestCancel={() => setConfirmCancelTest(true)} />}
            {screen === 'result' && resultData && <Result lang={lang} resultData={resultData} setScreen={setScreen} />}
            {screen === 'history' && <HistoryScreen {...{ lang, history, setScreen, setSelectedHistory }} />}
            {screen === 'history-detail' && <HistoryDetail lang={lang} entry={selectedHistory} setScreen={setScreen} />}
            {screen === 'missions' && <Missions lang={lang} user={user} runTest={runTest} setScreen={setScreen} nowH={previewHour} placeKey={previewPlace} ispKey={previewIsp} />}
            {screen === 'leaderboard' && <Leaderboard lang={lang} />}
            {screen === 'complaint' && <Complaint lang={lang} isp={isp} setScreen={setScreen} />}
            {screen === 'badges' && <Badges lang={lang} setScreen={setScreen} user={user} />}
            {screen === 'map' && <MapScreen lang={lang} setScreen={setScreen} user={user} initialLayer={mapLayer} />}
            {screen === 'about' && <Profile {...{ lang, setLang, isp, pkg, ispCode, setIspCode, pkgId, setPkgId, user, setUser, currentDistrict, locationMode, setLocationMode, manualDistrict, setManualDistrict, theme, setTheme, notifPref, setNotifPref, setScreen, setMapLayer, setTourSeen, deleteAccount, logout }} />}
            {screen === 'inbox' && <Inbox lang={lang} notifications={notifications} setScreen={setScreen} />}
            {screen === 'rewards' && <Rewards lang={lang} user={user} setScreen={setScreen} redemptions={redemptions} redeem={redeem} />}
          </>
        )}

        {levelUpData && <LevelUpOverlay data={levelUpData} lang={lang} onClose={() => setLevelUpData(null)} />}
        {badgeData && <BadgeEarnedOverlay badge={badgeData} onClose={() => setBadgeData(null)} />}
        {missionData && <MissionCompleteOverlay mission={missionData} lang={lang} onClose={() => setMissionData(null)} />}
      </PhoneShell>

      {demoOpen && (
        <DemoPanel
          activePersona={activePersona}
          applyPersona={applyPersona}
          triggerLevelUp={triggerLevelUp}
          triggerBadge={triggerBadge}
          triggerMission={triggerMission}
          forcedState={forcedState}
          setForcedState={setForcedState}
          lang={lang}
          previewHour={previewHour}
          setPreviewHour={setPreviewHour}
          previewPlace={previewPlace}
          setPreviewPlace={setPreviewPlace}
          previewIsp={previewIsp}
          setPreviewIsp={setPreviewIsp}
          close={() => setDemoOpen(false)}
        />
      )}

      <footer className="flex items-center gap-3 text-xs text-[color:var(--mute)] font-mono-data flex-wrap justify-center">
        <button onClick={() => setDemoOpen(true)} className="px-3 py-1.5 rounded-full bg-[color:var(--gold)] text-white font-semibold hover:opacity-90 transition flex items-center gap-1.5">
          <span>⚡</span>
          <span>Demo controls</span>
          {activePersona && <span className="px-1.5 py-0.5 rounded-full bg-white/20 text-[10px]">{PERSONAS[activePersona]?.name}</span>}
        </button>
        <button onClick={resetAll} className="px-3 py-1.5 rounded-full border border-[color:var(--line)] hover:bg-white/60 transition">↺ Reset demo</button>
        <span>·</span>
        <span>v2 gamified · state persists</span>
      </footer>
    </>
  )
}