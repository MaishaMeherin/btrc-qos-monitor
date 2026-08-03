import { Ico } from '../components/Icons.jsx'
import { StatusBar } from '../components/Header.jsx'
import { t } from '../i18n/strings.js'

export default function Inbox({ lang, notifications, setScreen }) {
  const kindMeta = {
    streak:      { label_en: 'Streak',     label_bn: 'স্ট্রিক',    icon: <Ico.flame className="w-4 h-4" />,  color: '#FFB347', bg: 'var(--amber-soft)' },
    mission:     { label_en: 'Mission',    label_bn: 'মিশন',      icon: <Ico.target className="w-4 h-4" />, color: 'var(--gold)',  bg: 'var(--gold-soft)' },
    achievement: { label_en: 'Achievement',label_bn: 'অর্জন',     icon: <Ico.trophy className="w-4 h-4" />, color: 'var(--gold)',  bg: 'var(--gold-soft)' },
    civic:       { label_en: 'Civic',      label_bn: 'নাগরিক',    icon: <Ico.pin className="w-4 h-4" />,    color: 'var(--teal)',  bg: 'var(--teal-soft)' },
    regulatory:  { label_en: 'BTRC',       label_bn: 'BTRC',      icon: <Ico.shield className="w-4 h-4" />, color: 'var(--teal)',  bg: 'var(--teal-soft)' },
    test:        { label_en: 'Test',       label_bn: 'পরীক্ষা',   icon: <Ico.flag className="w-4 h-4" />,   color: 'var(--amber)', bg: 'var(--amber-soft)' },
  }

  return (
    <div className="pb-28">
      <StatusBar />
      <div className="px-5 pt-3 flex items-center gap-2">
        <button onClick={() => setScreen('home')} className="w-9 h-9 rounded-full bg-[color:var(--surface)] border border-[color:var(--line)] flex items-center justify-center">
          <Ico.chevronL className="w-4 h-4 text-[color:var(--ink)]" />
        </button>
        <div className="font-display text-[18px] text-[color:var(--ink)]">{t(lang, 'Notifications', 'বিজ্ঞপ্তি')}</div>
        <div className="ml-auto font-mono-data text-[11px] text-[color:var(--ink-soft)]">{notifications.length}</div>
      </div>

      <div className="px-6 mt-2">
        <p className="text-[12px] text-[color:var(--ink-soft)] leading-snug">{t(lang, 'Reminders, achievements, and updates from BTRC.', 'অনুস্মারক, অর্জন ও BTRC-র আপডেট।')}</p>
      </div>

      {notifications.length === 0 ? (
        <div className="mx-5 mt-6 p-8 rounded-2xl bg-[color:var(--surface)] border border-[color:var(--line)] text-center">
          <Ico.bell className="w-10 h-10 mx-auto text-[color:var(--mute)]" />
          <div className="font-display text-[16px] text-[color:var(--ink)] mt-3">{t(lang, "You're all caught up", 'সব দেখা হয়েছে')}</div>
          <div className="text-[12px] text-[color:var(--ink-soft)] mt-1">{t(lang, 'Streak alerts and updates will appear here.', 'স্ট্রিক সতর্কতা এখানে দেখানো হবে।')}</div>
        </div>
      ) : (
        <div className="mx-5 mt-3 space-y-2">
          {notifications.map((n, i) => {
            const m = kindMeta[n.kind] || kindMeta.civic
            return (
              <div key={n.id}
                className={'p-3.5 rounded-xl bg-[color:var(--surface)] border fade-up ' + (n.read ? 'border-[color:var(--line)]' : 'border-[color:var(--teal)]/40 ring-1 ring-[color:var(--teal)]/10')}
                style={{ animationDelay: (i * 0.04) + 's' }}>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: m.bg, color: m.color }}>
                    {m.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[9px] tracking-[0.14em] uppercase font-semibold" style={{ color: m.color }}>{lang === 'bn' ? m.label_bn : m.label_en}</span>
                      <span className="text-[10px] text-[color:var(--mute)] font-mono-data">{n.when}</span>
                      {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-[color:var(--teal)]"></span>}
                    </div>
                    <div className={'font-semibold text-[13.5px] text-[color:var(--ink)] leading-tight mt-1 ' + (lang === 'bn' ? 'font-bn' : '')}>
                      {lang === 'bn' ? n.title_bn : n.title_en}
                    </div>
                    <div className={'text-[11.5px] text-[color:var(--ink-soft)] leading-snug mt-1 ' + (lang === 'bn' ? 'font-bn' : '')}>
                      {lang === 'bn' ? n.body_bn : n.body_en}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}