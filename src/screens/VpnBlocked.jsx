import { Ico } from '../components/Icons.jsx'
import { StatusBar } from '../components/Header.jsx'
import { t } from '../i18n/strings.js'

export default function VpnBlocked({ lang, onRetry }) {
  const steps = [
    ['1', t(lang, 'Open your device settings and turn off any VPN or proxy.', 'আপনার ডিভাইস সেটিংস খুলে VPN বা প্রক্সি বন্ধ করুন।')],
    ['2', t(lang, "Make sure you're connected to a Bangladeshi network (WiFi or mobile data).", 'নিশ্চিত করুন আপনি বাংলাদেশের নেটওয়ার্কে (WiFi বা মোবাইল ডেটা) যুক্ত আছেন।')],
    ['3', t(lang, 'Tap Try again below.', 'নিচে "আবার চেষ্টা করুন" চাপুন।')],
  ]

  return (
    <div className="pb-6 min-h-[844px] flex flex-col">
      <StatusBar />
      <div className="px-5 pt-3 flex items-center gap-2">
        <span className="chip" style={{ background: 'var(--amber-soft)', color: 'var(--amber)' }}>
          <Ico.shield className="w-3 h-3" />
          {t(lang, 'Access paused', 'অ্যাক্সেস বিরতি')}
        </span>
      </div>

      <div className="fade-up px-7 pt-10 flex-1 flex flex-col">
        <div className="flex justify-center mb-5.5">
          <div className="relative w-24 h-24">
            <div className="absolute inset-0 rounded-full" style={{ background: 'var(--gold-soft)' }}></div>
            <div className="absolute inset-3 rounded-full bg-[color:var(--surface)] flex items-center justify-center" style={{ boxShadow: '0 2px 8px -2px rgba(184,134,11,0.3)' }}>
              <Ico.shield className="w-9 h-9 text-[color:var(--gold)]" />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-7 h-7 rounded-full flex items-center justify-center" style={{ background: 'var(--amber)', border: '3px solid var(--cream)' }}>
              <Ico.info className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>

        <div className="eyebrow text-center" style={{ letterSpacing: '0.18em', color: 'var(--amber)' }}>{t(lang, 'VPN detected', 'VPN সনাক্ত হয়েছে')}</div>
        <h1 className="font-display text-[26px] leading-[1.1] mt-2 font-medium text-center">{t(lang, "We can't measure through a VPN", 'VPN-এর মাধ্যমে আমরা পরিমাপ করতে পারি না')}</h1>
        <p className={'mt-3 text-[13.5px] text-[color:var(--ink-soft)] leading-relaxed text-center ' + (lang === 'bn' ? 'font-bn' : '')}>
          {t(lang, 'BTRC QoS Monitor measures real internet quality in Bangladesh. A VPN routes your connection through another country, so tests wouldn\'t reflect what your ISP is delivering to you.', 'BTRC QoS Monitor বাংলাদেশের প্রকৃত ইন্টারনেট মান পরিমাপ করে। VPN আপনার সংযোগ অন্য দেশের মাধ্যমে পাঠায়, তাই ফলাফল আপনার ISP-এর প্রকৃত পরিষেবা প্রতিফলিত করবে না।')}
        </p>

        <div className="card-parch fade-up fade-up-1 mt-6 p-4 text-left">
          <div className="eyebrow-gold" style={{ letterSpacing: '0.16em' }}>{t(lang, 'What to do', 'যা করতে হবে')}</div>
          <div className="mt-2.5 flex flex-col gap-3">
            {steps.map(([n, text]) => (
              <div key={n} className="flex items-start gap-3">
                <div className="w-5.5 h-5.5 rounded-full bg-[color:var(--teal)] text-white flex items-center justify-center shrink-0 mt-0.5" style={{ width: 22, height: 22 }}>
                  <span className="font-mono-data text-[11px] font-bold">{n}</span>
                </div>
                <span className="text-[12.5px] leading-snug text-[color:var(--ink)]">{text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-auto pt-6 pb-2">
          <button onClick={onRetry} className="btn-primary w-full py-4 rounded-2xl font-semibold text-[15px] tracking-wide">
            {t(lang, 'Try again', 'আবার চেষ্টা করুন')}
          </button>
          <div className="mt-3 text-center text-[12px]">
            <button className="bg-transparent border-0 font-semibold cursor-pointer" style={{ color: 'var(--teal)' }}>
              {t(lang, 'Why does BTRC require this?', 'BTRC কেন এটি প্রয়োজন?')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}