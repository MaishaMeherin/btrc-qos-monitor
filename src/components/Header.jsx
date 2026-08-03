import { Ico } from './Icons.jsx'
import { t } from '../i18n/strings.js'

export function StatusBar() {
  return (
    <div className="status-bar flex items-center justify-between px-6 pt-3 pb-2 text-[12px] font-semibold text-[color:var(--ink)]">
      <span className="font-mono-data">9:41</span>
      <div className="flex items-center gap-1.5">
        <span className="w-3 h-3 rounded-full bg-[color:var(--ink)]/80"></span>
        <svg width="18" height="10" viewBox="0 0 18 10" fill="currentColor"><rect x="1" y="3" width="3" height="6" rx="0.5"/><rect x="5" y="2" width="3" height="7" rx="0.5"/><rect x="9" y="1" width="3" height="8" rx="0.5"/><rect x="13" y="0" width="3" height="9" rx="0.5"/></svg>
        <svg width="22" height="10" viewBox="0 0 22 10" fill="none" stroke="currentColor" strokeWidth="1.4"><rect x="1" y="1" width="17" height="8" rx="2"/><rect x="2.5" y="2.5" width="13" height="5" rx="0.8" fill="currentColor"/><rect x="19" y="3.5" width="2" height="3" rx="0.5" fill="currentColor"/></svg>
      </div>
    </div>
  )
}

export function BrandHeader({ lang, switchLang, compact, left, right, notifications, openInbox }) {
  const unread = notifications ? notifications.filter((n) => !n.read).length : 0
  return (
    <div className="flex items-center gap-3 px-5 pt-3 pb-2">
      {left}
      {!left && (
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-[10px] bg-[color:var(--teal)] flex items-center justify-center shadow-sm ring-1 ring-[color:var(--teal-deep)]/40">
            <Ico.tower className="w-5 h-5 text-white" />
          </div>
          {!compact && (
            <div className="leading-tight">
              <div className="text-[13px] font-semibold tracking-tight text-[color:var(--ink)]">BTRC QoS Monitor</div>
              <div className="flex items-center gap-1">
                <Ico.shield className="w-2.5 h-2.5 text-[color:var(--gold)]" />
                <span className="text-[9px] font-semibold tracking-[0.14em] text-[color:var(--gold)] uppercase stamp">Regulator Certified</span>
              </div>
            </div>
          )}
        </div>
      )}
      <div className="ml-auto flex items-center gap-2">
        {right}
        {openInbox && (
          <button
            type="button"
            onClick={openInbox}
            className="relative w-9 h-9 rounded-full border border-[color:var(--line)] bg-[color:var(--surface)] flex items-center justify-center hover:bg-[color:var(--parchment)] transition"
            aria-label={t(lang, 'Notifications', 'বিজ্ঞপ্তি')}>
            <Ico.bell className="w-4 h-4 text-[color:var(--ink-soft)]" />
            {unread > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[color:var(--coral)] text-white text-[10px] font-bold font-mono-data flex items-center justify-center ring-2 ring-[color:var(--cream)]">
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </button>
        )}
        <button onClick={switchLang} className="px-2.5 py-1.5 rounded-full border border-[color:var(--line)] bg-[color:var(--surface)] flex items-center gap-1.5 text-[11px] font-semibold hover:bg-[color:var(--parchment)] transition">
          <Ico.globe className="w-3 h-3 text-[color:var(--ink-soft)]" />
          <span className={lang === 'en' ? 'text-[color:var(--ink)]' : 'text-[color:var(--mute)]'}>EN</span>
          <span className="text-[color:var(--mute)]">|</span>
          <span className={'font-bn ' + (lang === 'bn' ? 'text-[color:var(--ink)]' : 'text-[color:var(--mute)]')}>বাং</span>
        </button>
      </div>
    </div>
  )
}