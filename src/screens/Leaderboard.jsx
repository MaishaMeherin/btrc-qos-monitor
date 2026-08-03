import { useState } from 'react'
import { Ico } from '../components/Icons.jsx'
import { StatusBar } from '../components/Header.jsx'
import { t } from '../i18n/strings.js'
import { BOARD, PLACE_LABEL } from '../data/seed.js'

// Per-scope copy. EN reads "prefix + PLACE + suffix"; BN reads "PLACE + suffix".
const SCOPES = {
  people: { tab_en: 'People', tab_bn: 'মানুষ', pre_en: 'Top contributors in ', suf_en: '', suf_bn: '-এর শীর্ষ অবদানকারী', selectable: true },
  areas: { tab_en: 'Areas', tab_bn: 'এলাকা', pre_en: 'Top areas in ', suf_en: ' district', suf_bn: ' জেলার শীর্ষ এলাকা', selectable: true },
  districts: { tab_en: 'Districts', tab_bn: 'জেলা', pre_en: 'Top districts in ', suf_en: '', suf_bn: '-এর শীর্ষ জেলা', selectable: false },
}
const MEDALS = ['#B8860B', '#97A5AD', '#B8651C']
const DEFAULT_PLACE = { people: 'Dhanmondi', areas: 'Dhaka', districts: 'Bangladesh' }

function Rank({ rank }) {
  const medal = rank <= 3 ? MEDALS[rank - 1] : null
  return (
    <div className="w-8 flex items-center justify-center shrink-0">
      {medal ? (
        <div className="w-7 h-7 rounded-full flex items-center justify-center font-display font-bold text-[13px] text-white" style={{ background: medal }}>{rank}</div>
      ) : (
        <div className="font-mono-data text-[14px] text-[color:var(--ink-soft)]">{rank}</div>
      )}
    </div>
  )
}

function BoardRow({ lang, e, last, showSub }) {
  return (
    <div className={'flex items-center gap-3 p-3 ' + (e.isMine ? 'bg-[color:var(--teal-soft)]' : '') + (last ? '' : ' border-b border-[color:var(--line)]/60')}>
      <Rank rank={e.rank} />
      <div className="flex-1 min-w-0">
        <div className={'font-semibold text-[13.5px] truncate flex items-center gap-1.5 ' + (e.isMine ? 'text-[color:var(--teal-deep)]' : 'text-[color:var(--ink)]')}>
          {e.name}
          {e.isMine && <span className="chip bg-[color:var(--teal)] text-white" style={{ fontSize: 9, padding: '1px 7px' }}>{t(lang, 'You', 'আপনি')}</span>}
        </div>
        {showSub && <div className="text-[10.5px] text-[color:var(--mute)] mt-0.5">{t(lang, e.sub_en, e.sub_bn)}</div>}
      </div>
      <div className="text-right shrink-0">
        <div className="font-mono-data font-bold text-[15px] text-[color:var(--gold)] leading-none">{e.value.toLocaleString()}</div>
        <div className="text-[8.5px] text-[color:var(--mute)] mt-0.5">{t(lang, 'tests', 'পরীক্ষা')}</div>
      </div>
    </div>
  )
}

export default function Leaderboard({ lang }) {
  const [scope, setScope] = useState('people')
  const [places, setPlaces] = useState(DEFAULT_PLACE)
  const [pickerOpen, setPickerOpen] = useState(false)

  const cfg = SCOPES[scope]
  const place = places[scope]
  const list = BOARD[scope][place]
  const options = Object.keys(BOARD[scope])
  const placeLabel = PLACE_LABEL[place][lang === 'bn' ? 1 : 0]

  const switchScope = (k) => { setScope(k); setPickerOpen(false) }
  const choose = (p) => { setPlaces((s) => ({ ...s, [scope]: p })); setPickerOpen(false) }

  return (
    <div className="pb-28">
      <StatusBar />
      <div className="px-6 pt-4">
        <div className="flex items-center gap-2 text-[10px] tracking-[0.18em] uppercase text-[color:var(--gold)] font-semibold"><Ico.trophy className="w-3 h-3" />{t(lang, 'Civic honour', 'নাগরিক সম্মান')}</div>
        <div className="flex items-center justify-between">
          <h1 className="font-display text-[28px] text-[color:var(--ink)] mt-1">{t(lang, 'Leaderboard', 'লিডারবোর্ড')}</h1>
          <span className="chip bg-[color:var(--surface)] border border-[color:var(--line)] text-[color:var(--ink-soft)]">
            <Ico.history className="w-3 h-3" />{t(lang, 'This month', 'এই মাস')}
          </span>
        </div>
      </div>

      {/* Scope switch — three zoom levels of one hierarchy */}
      <div className="mx-5 mt-3 grid grid-cols-3 gap-1 p-1 rounded-xl bg-[color:var(--parchment)] border border-[color:var(--parchment-deep)]">
        {Object.keys(SCOPES).map((k) => (
          <button key={k} onClick={() => switchScope(k)}
            className={'py-2 rounded-lg text-[12px] font-semibold transition ' + (scope === k ? 'bg-[color:var(--surface)] text-[color:var(--ink)] shadow-sm' : 'text-[color:var(--mute)]')}>
            {t(lang, SCOPES[k].tab_en, SCOPES[k].tab_bn)}
          </button>
        ))}
      </div>

      {/* Breadcrumb with browsable place */}
      <div className="px-6 mt-3 relative">
        <div className="flex items-center gap-1.5 text-[11.5px] text-[color:var(--ink-soft)] flex-wrap">
          <Ico.pin className="w-3 h-3 text-[color:var(--gold)] shrink-0" />
          <span className={lang === 'bn' ? 'font-bn' : ''}>{t(lang, cfg.pre_en, '')}</span>
          {cfg.selectable ? (
            <button onClick={() => setPickerOpen((v) => !v)}
              className="inline-flex items-center gap-1 font-bold text-[color:var(--gold)] border-b border-dashed border-[color:var(--gold)]/70 pb-px active:opacity-70">
              <span className={lang === 'bn' ? 'font-bn' : ''}>{placeLabel}</span>
              <Ico.chevronR className="w-3 h-3 transition-transform" style={{ transform: pickerOpen ? 'rotate(-90deg)' : 'rotate(90deg)' }} />
            </button>
          ) : (
            <span className={'font-bold text-[color:var(--gold)] ' + (lang === 'bn' ? 'font-bn' : '')}>{placeLabel}</span>
          )}
          <span className={lang === 'bn' ? 'font-bn' : ''}>{t(lang, cfg.suf_en, cfg.suf_bn)}</span>
        </div>

        {/* Inline location picker */}
        {pickerOpen && cfg.selectable && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setPickerOpen(false)}></div>
            <div className="absolute left-6 top-full mt-1.5 z-20 w-48 rounded-xl bg-[color:var(--surface)] border border-[color:var(--line)] shadow-lg overflow-hidden fade-up">
              <div className="px-3 py-1.5 text-[9px] tracking-[0.16em] uppercase text-[color:var(--mute)] font-semibold border-b border-[color:var(--line)]">
                {t(lang, scope === 'people' ? 'Choose an area' : 'Choose a district', scope === 'people' ? 'এলাকা বাছুন' : 'জেলা বাছুন')}
              </div>
              {options.map((o) => {
                const on = o === place
                return (
                  <button key={o} onClick={() => choose(o)}
                    className={'w-full text-left px-3 py-2 text-[12.5px] flex items-center justify-between transition ' + (on ? 'bg-[color:var(--teal-soft)] text-[color:var(--teal-deep)] font-semibold' : 'text-[color:var(--ink)] hover:bg-[color:var(--parchment)]')}>
                    <span className={lang === 'bn' ? 'font-bn' : ''}>{PLACE_LABEL[o][lang === 'bn' ? 1 : 0]}</span>
                    {on && <Ico.check className="w-3.5 h-3.5 text-[color:var(--teal)]" />}
                  </button>
                )
              })}
            </div>
          </>
        )}
      </div>

      {/* Ranked list */}
      <div className="mx-5 mt-2.5 rounded-2xl bg-[color:var(--surface)] border border-[color:var(--line)] overflow-hidden">
        {list.map((e, i) => <BoardRow key={i} lang={lang} e={e} last={i === list.length - 1} showSub={scope !== 'people'} />)}
      </div>

      {/* Anonymity note (matters most on People) */}
      {scope === 'people' && (
        <div className="mx-5 mt-3 p-3 rounded-xl card-parch flex items-start gap-2">
          <Ico.shield className="w-4 h-4 text-[color:var(--gold)] mt-0.5 shrink-0" />
          <div className="text-[11px] text-[color:var(--ink-soft)] leading-snug">
            {t(lang, 'Names default to anonymous ISP-tagged handles. Reveal yours from Profile to join the district honour roll.', 'নামগুলি ডিফল্টরূপে ISP-ট্যাগড বেনামী। আপনার নাম Profile থেকে প্রকাশ করুন।')}
          </div>
        </div>
      )}
    </div>
  )
}
