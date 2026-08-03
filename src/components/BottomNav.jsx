import { Ico } from './Icons.jsx'
import { t } from '../i18n/strings.js'

export function BottomNav({ screen, setScreen, lang }) {
  const items = [
    { k: 'home', label: t(lang, 'Home', 'হোম'), icon: <Ico.home className="w-5 h-5" /> },
    { k: 'missions', label: t(lang, 'Missions', 'মিশন'), icon: <Ico.target className="w-5 h-5" /> },
    { k: 'rewards', label: t(lang, 'Rewards', 'পুরস্কার'), icon: <Ico.gift className="w-5 h-5" /> },
    { k: 'leaderboard', label: t(lang, 'Board', 'বোর্ড'), icon: <Ico.trophy className="w-5 h-5" /> },
    { k: 'about', label: t(lang, 'Profile', 'প্রোফাইল'), icon: <Ico.info className="w-5 h-5" /> },
  ]
  return (
    <div className="absolute bottom-0 left-0 right-0 bg-[color:var(--surface)] border-t border-[color:var(--line)] flex items-stretch px-2 pt-2 pb-2.5 gap-1 z-40 shadow-[0_-10px_24px_-8px_rgba(15,46,61,0.12)]">
      {items.map((i) => {
        const active = screen === i.k
        return (
          <button key={i.k} onClick={() => setScreen(i.k)} className={'flex-1 flex flex-col items-center gap-0.5 py-1.5 rounded-lg transition ' + (active ? 'nav-active' : 'text-[color:var(--mute)]')}>
            <span className={'nav-icon ' + (active ? 'bg-[color:var(--teal-soft)] rounded-lg p-1.5' : 'p-1.5')}>{i.icon}</span>
            <span className={'text-[9.5px] font-semibold tracking-wider ' + (active ? '' : 'opacity-80')}>{i.label}</span>
          </button>
        )
      })}
    </div>
  )
}

export function MoreSheet({ lang, setSheet, setScreen }) {
  const items = [
    { k: 'history', label: t(lang, 'History', 'ইতিহাস'), icon: <Ico.history className="w-5 h-5" /> },
    { k: 'badges', label: t(lang, 'Achievements', 'অর্জন'), icon: <Ico.trophy className="w-5 h-5" /> },
    { k: 'map', label: t(lang, 'District map', 'জেলা মানচিত্র'), icon: <Ico.pin className="w-5 h-5" /> },
    { k: 'complaint', label: t(lang, 'File complaint', 'অভিযোগ'), icon: <Ico.flag className="w-5 h-5" /> },
    { k: 'about', label: t(lang, 'Profile', 'প্রোফাইল'), icon: <Ico.info className="w-5 h-5" /> },
  ]
  return (
    <div className="absolute inset-0 z-50 flex items-end overlay">
      <div className="absolute inset-0 bg-black/40" onClick={() => setSheet(null)}></div>
      <div className="relative w-full bg-[color:var(--cream)] rounded-t-3xl p-5 sheet">
        <div className="w-10 h-1.5 rounded-full bg-[color:var(--line)] mx-auto mb-4"></div>
        <div className="font-display text-[20px] text-[color:var(--ink)] mb-3">{t(lang, 'More', 'আরও')}</div>
        {items.map((i) => (
          <button key={i.k} onClick={() => { setScreen(i.k); setSheet(null); }} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/70 text-left">
            <div className="w-10 h-10 rounded-lg bg-[color:var(--teal-soft)] flex items-center justify-center text-[color:var(--teal)]">{i.icon}</div>
            <div className="flex-1 font-semibold text-[13.5px] text-[color:var(--ink)]">{i.label}</div>
            <Ico.chevronR className="w-4 h-4 text-[color:var(--mute)]" />
          </button>
        ))}
      </div>
    </div>
  )
}