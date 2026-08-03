import { useState } from 'react'
import { Ico } from '../components/Icons.jsx'
import { StatusBar } from '../components/Header.jsx'
import { FieldBlock } from '../components/UI.jsx'
import { t } from '../i18n/strings.js'

export default function Complaint({ lang, isp, setScreen }) {
  const [reason, setReason] = useState('')
  const [desc, setDesc] = useState('')
  return (
    <div className="pb-28">
      <StatusBar />
      <div className="px-5 pt-3 flex items-center gap-2">
        <button onClick={() => setScreen('history')} className="w-9 h-9 rounded-full bg-[color:var(--surface)] border border-[color:var(--line)] flex items-center justify-center">
          <Ico.chevronL className="w-4 h-4 text-[color:var(--ink)]" />
        </button>
        <div className="font-display text-[18px] text-[color:var(--ink)]">{t(lang, 'File a complaint', 'অভিযোগ দায়ের')}</div>
      </div>
      <div className="px-6 pt-2">
        <p className="text-[12px] text-[color:var(--ink-soft)] mt-1">{t(lang, 'Attach recent test results as evidence — +40 XP if accepted.', 'প্রমাণ হিসেবে সাম্প্রতিক পরীক্ষা সংযুক্ত করুন — গৃহীত হলে +৪০ XP।')}</p>
      </div>

      <div className="mx-5 mt-4 space-y-3">
        <FieldBlock label={t(lang, 'Your ISP', 'আপনার ISP')} value={isp?.name || '—'} />
        <div className="p-3.5 rounded-xl bg-[color:var(--surface)] border border-[color:var(--line)]">
          <div className="text-[11px] tracking-[0.1em] uppercase text-[color:var(--mute)] font-semibold mb-1.5">{t(lang, "What's wrong?", 'সমস্যা কী?')}</div>
          <div className="grid grid-cols-2 gap-2">
            {[['slow', t(lang, 'Slow speed', 'ধীরগতি')], ['outage', t(lang, 'Outage', 'আউটেজ')], ['billing', t(lang, 'Billing', 'বিলিং')], ['other', t(lang, 'Other', 'অন্যান্য')]].map(([v, l]) => (
              <button key={v} onClick={() => setReason(v)} className={'p-2.5 rounded-lg border text-[12px] font-medium ' + (reason === v ? 'bg-[color:var(--teal)] text-white border-[color:var(--teal-deep)]' : 'bg-[color:var(--surface)] text-[color:var(--ink)] border-[color:var(--line)]')}>{l}</button>
            ))}
          </div>
        </div>
        <div className="p-3.5 rounded-xl bg-[color:var(--surface)] border border-[color:var(--line)]">
          <div className="text-[11px] tracking-[0.1em] uppercase text-[color:var(--mute)] font-semibold mb-1.5">{t(lang, 'Describe the issue', 'সমস্যা বর্ণনা')}</div>
          <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows="4" placeholder={t(lang, "Tell BTRC what's been happening...", 'BTRC-কে বলুন...')} className="w-full text-[13px] outline-none resize-none font-[inherit]"></textarea>
        </div>
        <div className="p-3.5 rounded-xl card-parch flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[color:var(--surface)] border border-[color:var(--parchment-deep)] flex items-center justify-center">
            <Ico.flag className="w-4 h-4 text-[color:var(--gold)]" />
          </div>
          <div className="flex-1">
            <div className="text-[12px] font-semibold text-[color:var(--ink)]">{t(lang, 'Attach evidence', 'প্রমাণ যুক্ত করুন')}</div>
            <div className="text-[10.5px] text-[color:var(--ink-soft)]">{t(lang, '2 recent tests from Dhanmondi will be linked.', 'ধানমন্ডি থেকে ২টি সাম্প্রতিক পরীক্ষা সংযুক্ত হবে।')}</div>
          </div>
          <Ico.check2 className="w-5 h-5 text-[color:var(--green)]" />
        </div>
      </div>

      <div className="mx-5 mt-5">
        <button disabled={!reason || !desc} className="btn-primary w-full py-3.5 rounded-2xl font-semibold text-[14px] disabled:opacity-40">{t(lang, 'Submit complaint', 'অভিযোগ জমা')}</button>
      </div>
    </div>
  )
}