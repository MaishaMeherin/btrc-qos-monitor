import { useState, useEffect } from 'react'
import { Ico } from '../components/Icons.jsx'
import { StatusBar } from '../components/Header.jsx'
import { ReliabilityArc, UseCaseChip, ImpactLine, MetricRow } from '../components/UI.jsx'
import { t } from '../i18n/strings.js'
import { USE_CASE_STATUS } from '../data/reliability.js'

export default function Result({ lang, resultData, setScreen }) {
  if (!resultData) return null
  const { entry: r, verdict, impact, contribution, accuracy } = resultData
  const advertised = r.advertisedDown
  const pctDelivered = r.delivered
  const useCases = USE_CASE_STATUS[verdict.key] || USE_CASE_STATUS.good

  const [chipsShown, setChipsShown] = useState(false)
  useEffect(() => {
    const id = setTimeout(() => setChipsShown(true), 250)
    return () => clearTimeout(id)
  }, [])

  return (
    <div className="pb-10">
      <StatusBar />
      <div className="px-5 pt-3 flex items-center gap-2">
        <button onClick={() => setScreen('home')} className="w-9 h-9 rounded-full bg-[color:var(--surface)] border border-[color:var(--line)] flex items-center justify-center">
          <Ico.chevronL className="w-4 h-4" />
        </button>
        <div className="font-display text-[18px] text-[color:var(--ink)]">{t(lang, 'Test result', 'পরীক্ষার ফল')}</div>
        <span className="ml-auto text-[10px] text-[color:var(--mute)] font-mono-data">{r.when}</span>
      </div>

      <div className="mx-5 mt-3 p-5 rounded-2xl card-parch relative overflow-hidden pop-in">
        <div className="absolute top-3 right-4 ornament text-[color:var(--gold)]/30 text-[28px]">✦</div>
        <div className="text-[10px] tracking-[0.16em] uppercase text-[color:var(--mute)] font-semibold">{t(lang, 'Your connection is', 'আপনার সংযোগ')}</div>
        <div className="flex items-end gap-3 mt-1">
          <ReliabilityArc verdict={verdict} />
          <div className="flex-1 pb-1">
            <div className={'font-display text-[30px] leading-none ' + (lang === 'bn' ? 'font-bn' : '')} style={{ color: verdict.dot }}>
              {lang === 'bn' ? verdict.bn : verdict.en}
            </div>
            <p className={'text-[12px] text-[color:var(--ink-soft)] leading-snug mt-1.5 ' + (lang === 'bn' ? 'font-bn' : '')}>
              {lang === 'bn' ? verdict.sub_bn : verdict.sub_en}
            </p>
          </div>
        </div>

        {chipsShown && (
          <div className="mt-4 grid grid-cols-3 gap-2">
            <UseCaseChip status={useCases.gaming}    icon={<Ico.gaming className="w-4 h-4" />}    label={t(lang, 'Gaming', 'গেমিং')}      delay={0} />
            <UseCaseChip status={useCases.video}     icon={<Ico.videoCall className="w-4 h-4" />} label={t(lang, 'Video calls', 'ভিডিও কল')} delay={0.2} />
            <UseCaseChip status={useCases.streaming} icon={<Ico.streaming className="w-4 h-4" />} label={t(lang, 'Streaming', 'স্ট্রিমিং')} delay={0.4} />
          </div>
        )}
      </div>

      <div className="mx-5 mt-3 p-4 rounded-2xl bg-[color:var(--surface)] border border-[color:var(--line)] fade-up fade-up-1">
        <div className="text-[10px] tracking-[0.14em] uppercase text-[color:var(--mute)] font-semibold mb-1.5">{t(lang, 'What we measured', 'যা পরিমাপ হয়েছে')}</div>
        <MetricRow icon={<Ico.dl className="w-4 h-4" />}
          label={t(lang, 'Speed', 'গতি')}
          interpretation={r.down >= 25 ? t(lang, 'Fast enough for HD streaming', 'HD স্ট্রিমিং-এর জন্য যথেষ্ট') : r.down >= 10 ? t(lang, 'OK for SD streaming', 'SD স্ট্রিমিং-এর জন্য ঠিক আছে') : t(lang, 'Browsing only', 'শুধু ব্রাউজিং')}
          value={r.down.toFixed(1) + ' Mbps'} />
        <MetricRow icon={<Ico.reliability className="w-4 h-4" />}
          label={t(lang, 'Latency', 'লেটেন্সি')}
          interpretation={r.lat <= 30 ? t(lang, 'Good for gaming', 'গেমিং-এর জন্য ভালো') : r.lat <= 60 ? t(lang, 'OK for calls', 'কলের জন্য ঠিক আছে') : t(lang, 'Noticeable lag', 'লক্ষণীয় ল্যাগ')}
          value={r.lat + ' ms'} />
        <MetricRow icon={<Ico.trend className="w-4 h-4" />}
          label={t(lang, 'Stability', 'স্থিতিশীলতা')}
          interpretation={r.jitter <= 3 ? t(lang, 'Very stable', 'অত্যন্ত স্থিতিশীল') : r.jitter <= 6 ? t(lang, 'Minor fluctuations', 'সামান্য ওঠানামা') : t(lang, 'Unstable', 'অস্থিতিশীল')}
          value={'Jitter ' + r.jitter + ' ms'} />
        <MetricRow icon={<Ico.network className="w-4 h-4" />}
          label={t(lang, 'Loss', 'লস')}
          interpretation={r.loss <= 0.2 ? t(lang, 'All packets delivered', 'সব প্যাকেট পৌঁছেছে') : t(lang, 'Some packets dropped', 'কিছু প্যাকেট হারিয়েছে')}
          value={r.loss + '% loss'}
          last />
      </div>

      <div className="mx-5 mt-3 p-4 rounded-2xl bg-[color:var(--surface)] border border-[color:var(--line)] fade-up fade-up-2">
        <div className="text-[12.5px] text-[color:var(--ink)] leading-snug">
          {lang === 'bn'
            ? `আপনার প্যাকেজে ${advertised} Mbps। আপনি পাচ্ছেন ${r.down.toFixed(1)} Mbps (${pctDelivered}%)।`
            : `Your plan promises ${advertised} Mbps. You're getting ${r.down.toFixed(1)} Mbps (${pctDelivered}%).`}
        </div>
        <div className="bar mt-2">
          <span style={{
            width: Math.min(100, pctDelivered) + '%',
            background: r.flagged
              ? 'linear-gradient(90deg, #FCA5A5, var(--coral))'
              : pctDelivered >= 85
              ? 'linear-gradient(90deg, #4ADE80, var(--green))'
              : 'linear-gradient(90deg, #FCD34D, var(--amber))',
          }}></span>
        </div>
        {r.flagged ? (
          <div className="mt-3 flex items-center justify-between gap-2">
            <span className="chip bg-[color:var(--amber-soft)] text-[color:var(--amber)]"><Ico.flag className="w-3 h-3" /><span>{t(lang, 'Below BTRC threshold', 'BTRC সীমার নিচে')}</span></span>
            <button onClick={() => setScreen('complaint')} className="text-[12px] font-semibold text-[color:var(--amber)] flex items-center gap-1">
              <span>{t(lang, 'Report this', 'রিপোর্ট করুন')}</span>
              <Ico.chevronR className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <div className="mt-3">
            <span className="chip bg-[color:var(--green-soft)] text-[color:var(--green)]"><Ico.check className="w-3 h-3" /><span>{t(lang, 'Within expected range', 'প্রত্যাশিত পরিসরে')}</span></span>
          </div>
        )}
      </div>

      <div className="mx-5 mt-4 fade-up fade-up-3">
        <ImpactLine lang={lang}>{lang === 'bn' ? impact.bn : impact.en}</ImpactLine>
      </div>

      <div className="mx-5 mt-3 px-3 py-2 rounded-xl bg-[color:var(--parchment)] border border-[color:var(--parchment-deep)] flex items-center gap-2 fade-up fade-up-4">
        <Ico.shield className="w-3.5 h-3.5 text-[color:var(--gold)]" />
        <span className="text-[11.5px] text-[color:var(--ink-soft)] font-mono-data">+{contribution} {t(lang, 'contribution', 'অবদান')}{accuracy ? ' · +1 ' + t(lang, 'accuracy', 'নির্ভুলতা') : ''}</span>
        <span className="ml-auto text-[10px] text-[color:var(--mute)]">{t(lang, 'Auto-submitted', 'স্বয়ংক্রিয় জমা')}</span>
      </div>

      <div className="mx-5 mt-5 grid grid-cols-2 gap-2 fade-up fade-up-5">
        <button onClick={() => setScreen('complaint')} className="py-3 rounded-xl bg-[color:var(--surface)] border border-[color:var(--line)] font-semibold text-[13px] text-[color:var(--ink)] flex items-center justify-center gap-1.5">
          <Ico.flag className="w-3.5 h-3.5" />
          <span>{r.flagged ? t(lang, 'Report a problem', 'সমস্যা রিপোর্ট') : t(lang, 'View details', 'বিস্তারিত')}</span>
        </button>
        <button onClick={() => setScreen('home')} className="btn-primary py-3 rounded-xl font-semibold text-[13px]">{t(lang, 'Done', 'সম্পন্ন')}</button>
      </div>
    </div>
  )
}