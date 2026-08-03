import { useState, useEffect } from 'react'
import { Ico } from '../components/Icons.jsx'
import { StatusBar } from '../components/Header.jsx'
import { ReliabilityArc, UseCaseChip, ImpactLine, MetricRow } from '../components/UI.jsx'
import { t } from '../i18n/strings.js'
import { classifyReliability, USE_CASE_STATUS } from '../data/reliability.js'

function HistoryDetail({ lang, entry, setScreen }) {
  if (!entry) {
    return (
      <div className="pb-10">
        <StatusBar />
        <div className="px-5 pt-3 flex items-center gap-2">
          <button onClick={() => setScreen('history')} className="w-9 h-9 rounded-full bg-[color:var(--surface)] border border-[color:var(--line)] flex items-center justify-center">
            <Ico.chevronL className="w-4 h-4 text-[color:var(--ink)]" />
          </button>
          <div className="font-display text-[18px] text-[color:var(--ink)]">{t(lang, 'Test detail', 'বিবরণ')}</div>
        </div>
        <div className="px-6 pt-6 text-[13px] text-[color:var(--ink-soft)]">{t(lang, 'No test selected.', 'কোনো পরীক্ষা নির্বাচিত নেই।')}</div>
      </div>
    )
  }
  const r = entry
  const advertised = r.advertisedDown
  const pctDelivered = r.delivered
  const verdict = classifyReliability(r.down, advertised, r.lat, r.jitter, r.loss)
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
        <button onClick={() => setScreen('history')} className="w-9 h-9 rounded-full bg-[color:var(--surface)] border border-[color:var(--line)] flex items-center justify-center">
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
        <ImpactLine lang={lang}>
          {r.submitted
            ? (lang === 'bn'
                ? `${r.district}-এ এই পরীক্ষাটি BTRC-তে জমা দেওয়া হয়েছে।`
                : `This test was submitted to BTRC from ${r.district}.`)
            : (lang === 'bn'
                ? 'এই পরীক্ষা এখনো জমা দেওয়া হয়নি। অনলাইনে এলে পুনরায় চেষ্টা করা হবে।'
                : 'This test is pending submission. Will retry when online.')}
        </ImpactLine>
      </div>

      <div className="mx-5 mt-3 px-3 py-2 rounded-xl bg-[color:var(--parchment)] border border-[color:var(--parchment-deep)] flex items-center gap-2 fade-up fade-up-4 flex-wrap">
        <Ico.shield className="w-3.5 h-3.5 text-[color:var(--gold)]" />
        {r.submitted && r.submissionId ? (
          <span className="text-[11.5px] text-[color:var(--ink-soft)] font-mono-data">Ref: {r.submissionId}</span>
        ) : (
          <span className="text-[11.5px] text-[color:var(--ink-soft)] font-mono-data">{t(lang, 'Pending submission', 'জমা অপেক্ষমান')}</span>
        )}
        <span className="ml-auto text-[10px] text-[color:var(--mute)]">{r.district} · {r.locationSource} · {r.networkType}</span>
      </div>

      <div className="mx-5 mt-5 grid grid-cols-2 gap-2 fade-up fade-up-5">
        <button onClick={() => setScreen('complaint')} className="py-3 rounded-xl bg-[color:var(--surface)] border border-[color:var(--line)] font-semibold text-[13px] text-[color:var(--ink)] flex items-center justify-center gap-1.5">
          <Ico.flag className="w-3.5 h-3.5" />
          <span>{r.flagged ? t(lang, 'Report a problem', 'সমস্যা রিপোর্ট') : t(lang, 'View details', 'বিস্তারিত')}</span>
        </button>
        <button onClick={() => setScreen('history')} className="btn-primary py-3 rounded-xl font-semibold text-[13px]">{t(lang, 'Done', 'সম্পন্ন')}</button>
      </div>
    </div>
  )
}

export { HistoryDetail }

export default function History({ lang, history, setScreen, setSelectedHistory }) {
  const [flaggedOnly, setFlaggedOnly] = useState(false)
  const [ispFilter, setIspFilter] = useState('')
  const [districtFilter, setDistrictFilter] = useState('')
  const [dateRange, setDateRange] = useState('all')
  const [visibleCount, setVisibleCount] = useState(5)

  const uniqueIsps = Array.from(new Set(history.map((h) => h.isp)))
  const uniqueDistricts = Array.from(new Set(history.map((h) => h.district)))

  const now = new Date('2026-05-19T23:59:59')
  const filtered = history.filter((h) => {
    if (flaggedOnly && !h.flagged) return false
    if (ispFilter && h.isp !== ispFilter) return false
    if (districtFilter && h.district !== districtFilter) return false
    if (dateRange !== 'all' && h.isoDate) {
      const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90
      const cutoff = new Date(now.getTime() - days * 86400000)
      if (new Date(h.isoDate) < cutoff) return false
    }
    return true
  })

  const visible = filtered.slice(0, visibleCount)
  const hasMore = visible.length < filtered.length
  const hasActiveFilters = flaggedOnly || ispFilter || districtFilter || dateRange !== 'all'

  const clearFilters = () => {
    setFlaggedOnly(false); setIspFilter(''); setDistrictFilter(''); setDateRange('all'); setVisibleCount(5)
  }

  const filterSelectClass = (active) =>
    'shrink-0 px-3 py-1 rounded-full text-[11px] font-semibold cursor-pointer appearance-none outline-none border ' +
    (active ? 'bg-[color:var(--teal)] text-white border-[color:var(--teal-deep)]' : 'bg-[color:var(--surface)] text-[color:var(--ink)] border-[color:var(--line)]')

  return (
    <div className="pb-28">
      <StatusBar />
      <div className="px-5 pt-3 flex items-center gap-3">
        <button
          onClick={() => setScreen('home')}
          aria-label={t(lang, 'Back to home', 'হোমে ফিরুন')}
          className="w-9 h-9 rounded-full bg-[color:var(--surface)] border border-[color:var(--line)] flex items-center justify-center hover:bg-[color:var(--parchment)] transition shrink-0">
          <Ico.chevronL className="w-4 h-4 text-[color:var(--ink)]" />
        </button>
        <div className="min-w-0">
          <h1 className="font-display text-[22px] leading-none text-[color:var(--ink)]">{t(lang, 'Test history', 'পরীক্ষার ইতিহাস')}</h1>
          <p className="text-[11.5px] text-[color:var(--ink-soft)] mt-1">
            <span className="font-semibold text-[color:var(--ink)]">{filtered.length}</span> {t(lang, 'tests', 'পরীক্ষা')}
            {hasActiveFilters && <span className="text-[color:var(--mute)]"> · {t(lang, 'filtered from', 'মোট')} {history.length}</span>}
          </p>
        </div>
      </div>

      <div className="mt-3 px-5">
        <div className="flex items-center gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
          <button
            onClick={() => setFlaggedOnly(!flaggedOnly)}
            className={'shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold border ' + (flaggedOnly ? 'bg-[color:var(--amber)] text-white border-[color:var(--amber)]' : 'bg-[color:var(--surface)] text-[color:var(--ink)] border-[color:var(--line)]')}>
            <Ico.flag className="w-3 h-3" />
            <span>{t(lang, 'Flagged', 'চিহ্নিত')}</span>
          </button>

          <select value={ispFilter} onChange={(e) => { setIspFilter(e.target.value); setVisibleCount(5); }} className={filterSelectClass(!!ispFilter)}>
            <option value="">{t(lang, 'All ISPs', 'সব ISP')}</option>
            {uniqueIsps.map((i) => <option key={i} value={i}>{i}</option>)}
          </select>

          <select value={districtFilter} onChange={(e) => { setDistrictFilter(e.target.value); setVisibleCount(5); }} className={filterSelectClass(!!districtFilter)}>
            <option value="">{t(lang, 'All districts', 'সব জেলা')}</option>
            {uniqueDistricts.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>

          <select value={dateRange} onChange={(e) => { setDateRange(e.target.value); setVisibleCount(5); }} className={filterSelectClass(dateRange !== 'all')}>
            <option value="all">{t(lang, 'All time', 'সর্বকাল')}</option>
            <option value="7d">{t(lang, 'Last 7 days', '৭ দিন')}</option>
            <option value="30d">{t(lang, 'Last 30 days', '৩০ দিন')}</option>
            <option value="90d">{t(lang, 'Last 90 days', '৯০ দিন')}</option>
          </select>

          {hasActiveFilters && (
            <button onClick={clearFilters} className="shrink-0 flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-semibold bg-[color:var(--parchment-deep)] text-[color:var(--ink-soft)]">
              <Ico.close className="w-3 h-3" />
              <span>{t(lang, 'Clear', 'মুছুন')}</span>
            </button>
          )}
        </div>
      </div>

      <div className="mx-5 mt-2 space-y-2">
        {visible.length === 0 ? (
          <div className="p-6 rounded-xl bg-[color:var(--surface)] border border-[color:var(--line)] text-center">
            <Ico.history className="w-8 h-8 mx-auto text-[color:var(--mute)]" />
            <div className="text-[13px] font-semibold text-[color:var(--ink)] mt-2">{t(lang, 'No tests match your filters', 'কোন পরীক্ষা মেলেনি')}</div>
            <button onClick={clearFilters} className="text-[12px] text-[color:var(--teal)] font-semibold mt-2">{t(lang, 'Clear filters', 'ফিল্টার মুছুন')}</button>
          </div>
        ) : (
          visible.map((h, i) => (
            <button
              key={h.id}
              onClick={() => { setSelectedHistory(h); setScreen('history-detail'); }}
              className="w-full text-left p-3.5 rounded-xl bg-[color:var(--surface)] border border-[color:var(--line)] fade-up hover:bg-[color:var(--parchment)]/40 transition"
              style={{ animationDelay: (i * 0.04) + 's' }}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[11px] text-[color:var(--mute)] font-mono-data">{h.when}</div>
                  <div className="font-semibold text-[14px] text-[color:var(--ink)]">{h.isp}</div>
                </div>
                <div className="text-right">
                  <div className="font-mono-data font-bold text-[18px]" style={{ color: h.delivered >= 85 ? 'var(--green)' : h.delivered >= 70 ? 'var(--amber)' : 'var(--coral)' }}>{h.delivered}%</div>
                  <div className="text-[10px] text-[color:var(--mute)]">delivered</div>
                </div>
              </div>
              <div className="mt-2 flex items-center gap-3 text-[11px] text-[color:var(--ink-soft)]">
                <span className="font-mono-data">↓ {h.down.toFixed(1)}</span>
                <span className="font-mono-data">↑ {h.up.toFixed(1)}</span>
                <span className="font-mono-data">{h.lat} ms</span>
                <span className="ml-auto flex items-center gap-1"><Ico.pin className="w-3 h-3" />{h.district}</span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <div className="flex items-center gap-2 flex-wrap">
                  {h.flagged && (
                    <span className="flex items-center gap-1 text-[10px] text-[color:var(--amber)]">
                      <Ico.flag className="w-3 h-3" />
                      <span className="font-semibold tracking-wide uppercase">{t(lang, 'Flagged', 'চিহ্নিত')}</span>
                    </span>
                  )}
                  {h.submitted ? (
                    <span className="flex items-center gap-1 text-[10px] text-[color:var(--green)]">
                      <Ico.check2 className="w-3 h-3" />
                      <span className="font-semibold tracking-wide uppercase">{t(lang, 'Submitted', 'জমা')}</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[10px] text-[color:var(--mute)]">
                      <Ico.history className="w-3 h-3" />
                      <span className="font-semibold tracking-wide uppercase">{t(lang, 'Pending', 'অপেক্ষমান')}</span>
                    </span>
                  )}
                </div>
                <Ico.chevronR className="w-3 h-3 text-[color:var(--mute)]" />
              </div>
            </button>
          ))
        )}
      </div>

      {hasMore && (
        <div className="mx-5 mt-3">
          <button
            onClick={() => setVisibleCount((c) => c + 5)}
            className="w-full py-3 rounded-xl bg-[color:var(--surface)] border border-[color:var(--line)] text-[13px] font-semibold text-[color:var(--teal)] hover:bg-[color:var(--parchment)]/40 transition flex items-center justify-center gap-1.5">
            <span>{t(lang, 'Load more', 'আরও দেখুন')}</span>
            <span className="font-mono-data text-[11px] text-[color:var(--mute)]">({filtered.length - visible.length} {t(lang, 'more', 'বাকি')})</span>
          </button>
        </div>
      )}
    </div>
  )
}