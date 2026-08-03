import { useState } from 'react'
import { Ico } from '../components/Icons.jsx'
import { StatusBar } from '../components/Header.jsx'
import { t } from '../i18n/strings.js'

// Reusable gold "XP coin".
function Coin({ size = 14 }) {
  return (
    <span className="rounded-full flex items-center justify-center shrink-0"
      style={{ width: size, height: size, background: 'linear-gradient(135deg,#F4C45F,var(--gold))', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.45)' }}>
      <Ico.sparkle style={{ width: size * 0.56, height: size * 0.56 }} className="text-white" />
    </span>
  )
}

// Category → icon. One uniform chip colour keeps the grid cohesive; the icon
// shape (not colour) signals the category, and gold is reserved for price.
const CAT_ICON = { internet: Ico.signal, voice: Ico.phone, sms: Ico.message }

// Redemption lifecycle states shown in History.
const STATUS = {
  active:  { en: 'Active',  bn: 'সক্রিয়',     color: 'var(--green)', bg: 'var(--green-soft)' },
  used:    { en: 'Used',    bn: 'ব্যবহৃত',     color: 'var(--mute)',  bg: 'var(--parchment)' },
  expired: { en: 'Expired', bn: 'মেয়াদ শেষ', color: 'var(--coral)', bg: 'var(--coral-soft)' },
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
function fmtDate(iso) {
  const d = new Date(iso)
  if (isNaN(d)) return ''
  let h = d.getHours()
  const m = String(d.getMinutes()).padStart(2, '0')
  const ap = h < 12 ? 'AM' : 'PM'
  h = h % 12 === 0 ? 12 : h % 12
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()} · ${h}:${m} ${ap}`
}

const PERKS = [
  { id: 'p1', cat: 'internet', title: '1 GB', sub_en: 'Mobile data', sub_bn: 'মোবাইল ডেটা', meta_en: '3 days', meta_bn: '৩ দিন', cost: 280 },
  { id: 'p2', cat: 'internet', title: '1 GB', sub_en: 'Mobile data', sub_bn: 'মোবাইল ডেটা', meta_en: '7 days', meta_bn: '৭ দিন', cost: 360 },
  { id: 'p3', cat: 'internet', title: '2 GB', sub_en: 'Mobile data', sub_bn: 'মোবাইল ডেটা', meta_en: '24 hrs', meta_bn: '২৪ ঘণ্টা', cost: 520 },
  { id: 'p4', cat: 'voice', title: '30 min', sub_en: 'Any operator', sub_bn: 'যেকোনো অপারেটর', meta_en: '7 days', meta_bn: '৭ দিন', cost: 180 },
  { id: 'p5', cat: 'sms', title: '120 SMS', sub_en: 'Any operator', sub_bn: 'যেকোনো অপারেটর', meta_en: '7 days', meta_bn: '৭ দিন', cost: 160 },
  { id: 'p6', cat: 'internet', title: '500 MB', sub_en: 'Mobile data', sub_bn: 'মোবাইল ডেটা', meta_en: '3 days', meta_bn: '৩ দিন', cost: 140 },
]

// ── Confirm sheet — guards against accidental spends ───────────────────────
function ConfirmSheet({ lang, perk, balance, onCancel, onConfirm }) {
  const Glyph = CAT_ICON[perk.cat] || Ico.gift
  return (
    <div className="absolute inset-0 z-[95] flex items-end overlay">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel}></div>
      <div className="relative w-full bg-[color:var(--cream)] rounded-t-3xl p-5 sheet">
        <div className="w-10 h-1.5 rounded-full bg-[color:var(--line)] mx-auto mb-4"></div>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[color:var(--teal-soft)] text-[color:var(--teal)] flex items-center justify-center shrink-0">
            <Glyph className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-display text-[19px] text-[color:var(--ink)] leading-tight">
              {t(lang, 'Redeem', 'নিন')} {perk.title} · {t(lang, perk.sub_en, perk.sub_bn)}
            </div>
            <div className="text-[12px] text-[color:var(--ink-soft)] mt-0.5">
              {t(lang, 'Valid for', 'মেয়াদ')} {t(lang, perk.meta_en, perk.meta_bn)}
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-xl bg-[color:var(--surface)] border border-[color:var(--line)] divide-y divide-[color:var(--line)]">
          <div className="flex items-center justify-between px-3.5 py-2.5">
            <span className="text-[12px] text-[color:var(--ink-soft)]">{t(lang, 'Cost', 'মূল্য')}</span>
            <span className="flex items-center gap-1.5 font-mono-data text-[13px] font-bold text-[color:var(--gold)]"><Coin size={13} />{perk.cost} XP</span>
          </div>
          <div className="flex items-center justify-between px-3.5 py-2.5">
            <span className="text-[12px] text-[color:var(--ink-soft)]">{t(lang, 'Spendable XP after', 'খরচযোগ্য XP পরে')}</span>
            <span className="font-mono-data text-[13px] font-semibold text-[color:var(--ink)]">{balance - perk.cost} XP</span>
          </div>
        </div>
        <div className="mt-2 flex items-center gap-1.5 text-[11px] text-[color:var(--ink-soft)]">
          <Ico.shield className="w-3 h-3 text-[color:var(--teal)] shrink-0" />
          <span>{t(lang, 'Your earned XP and rank stay exactly the same.', 'আপনার অর্জিত XP ও র‍্যাঙ্ক একই থাকবে।')}</span>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <button onClick={onCancel} className="py-3 rounded-xl bg-[color:var(--surface)] border border-[color:var(--line)] font-semibold text-[13px] text-[color:var(--ink)]">
            {t(lang, 'Cancel', 'বাতিল')}
          </button>
          <button onClick={onConfirm} className="btn-primary py-3 rounded-xl font-semibold text-[13px]">
            {t(lang, 'Confirm', 'নিশ্চিত করুন')}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Success overlay — surfaces the freshly minted voucher code ─────────────
function SuccessOverlay({ lang, record, onViewHistory, onClose }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard?.writeText(record.code).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }
  return (
    <div className="absolute inset-0 z-[100] flex items-center justify-center overlay">
      <div className="absolute inset-0 bg-black/60" onClick={onClose}></div>
      <div className="relative bg-[color:var(--surface)] rounded-2xl p-6 mx-8 max-w-[320px] xp-pop">
        <div className="w-16 h-16 rounded-full bg-[color:var(--green)] flex items-center justify-center mx-auto shadow-lg">
          <Ico.gift className="w-9 h-9 text-white" />
        </div>
        <div className="text-center mt-4">
          <div className="text-[10px] tracking-[0.18em] uppercase text-[color:var(--green)] font-semibold">{t(lang, 'Redeemed', 'নেওয়া হয়েছে')}</div>
          <div className={'font-display text-[18px] text-[color:var(--ink)] mt-1 leading-tight ' + (lang === 'bn' ? 'font-bn' : '')}>
            {record.title} · {t(lang, record.sub_en, record.sub_bn)}
          </div>
          <div className="text-[11.5px] text-[color:var(--ink-soft)] mt-1">{t(lang, 'Your voucher code', 'আপনার ভাউচার কোড')}</div>
        </div>

        <button onClick={copy}
          className="mt-3 w-full rounded-xl border border-dashed border-[color:var(--gold)]/50 bg-[color:var(--gold-soft)] px-3 py-3 flex items-center justify-center gap-2">
          <span className="font-mono-data font-bold text-[15px] tracking-[0.08em] text-[color:var(--ink)]">{record.code}</span>
          {copied ? <Ico.check className="w-4 h-4 text-[color:var(--green)]" /> : <Ico.save className="w-4 h-4 text-[color:var(--gold)]" />}
        </button>
        <div className="text-center text-[10.5px] text-[color:var(--mute)] mt-1.5">
          {copied ? t(lang, 'Copied to clipboard', 'কপি হয়েছে') : t(lang, 'Tap the code to copy', 'কপি করতে কোডে চাপুন')}
        </div>

        <div className="mt-3 flex items-center justify-center gap-1.5 rounded-lg bg-[color:var(--teal-soft)] py-2 px-3">
          <Ico.shield className="w-3.5 h-3.5 text-[color:var(--teal)] shrink-0" />
          <span className="text-[11px] font-semibold text-[color:var(--teal-deep)]">{t(lang, `Spendable −${record.cost} · rank unchanged`, `খরচযোগ্য −${record.cost} · র‍্যাঙ্ক অপরিবর্তিত`)}</span>
        </div>

        <button onClick={onViewHistory} className="btn-primary w-full py-3 rounded-xl font-semibold text-[13px] mt-4">{t(lang, 'View in history', 'হিস্টোরিতে দেখুন')}</button>
        <button onClick={onClose} className="w-full py-2.5 mt-1 font-semibold text-[12px] text-[color:var(--ink-soft)]">{t(lang, 'Done', 'হয়ে গেছে')}</button>
      </div>
    </div>
  )
}

// ── One redemption row in the History tab ──────────────────────────────────
function HistoryCard({ lang, r }) {
  const [copied, setCopied] = useState(false)
  const Glyph = CAT_ICON[r.cat] || Ico.gift
  const s = STATUS[r.status] || STATUS.used
  const copyable = r.status === 'active'
  const copy = () => {
    if (!copyable) return
    navigator.clipboard?.writeText(r.code).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }
  return (
    <div className="bg-[color:var(--surface)] border border-[color:var(--line)] rounded-2xl p-3.5">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-[color:var(--teal-soft)] text-[color:var(--teal)] flex items-center justify-center shrink-0">
          <Glyph className="w-[18px] h-[18px]" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-display text-[16px] leading-none text-[color:var(--ink)]">{r.title}</span>
            <span className="text-[11.5px] text-[color:var(--ink-soft)] truncate">{t(lang, r.sub_en, r.sub_bn)}</span>
          </div>
          <div className="font-mono-data text-[10px] text-[color:var(--mute)] mt-1">{fmtDate(r.isoDate)}</div>
        </div>
        <span className="px-2 py-0.5 rounded-full text-[9.5px] font-bold uppercase tracking-[0.08em] shrink-0"
          style={{ color: s.color, background: s.bg }}>
          {t(lang, s.en, s.bn)}
        </span>
      </div>

      <div className="divider-dashed my-3"></div>

      <div className="flex items-center justify-between">
        <button onClick={copy} disabled={!copyable}
          className={'flex items-center gap-1.5 ' + (copyable ? '' : 'opacity-60 cursor-default')}>
          <span className="font-mono-data text-[12px] font-semibold tracking-[0.06em] text-[color:var(--ink)]">{r.code}</span>
          {copyable && (copied
            ? <Ico.check className="w-3.5 h-3.5 text-[color:var(--green)]" />
            : <Ico.save className="w-3.5 h-3.5 text-[color:var(--mute)]" />)}
        </button>
        <span className="flex items-center gap-1 font-mono-data text-[12px] font-bold text-[color:var(--gold)]">
          <Coin size={11} />−{r.cost} XP
        </span>
      </div>
    </div>
  )
}

export default function Rewards({ lang, user, setScreen, redemptions = [], redeem }) {
  const [filter, setFilter] = useState('all')
  const [tab, setTab] = useState('store')      // 'store' | 'history'
  const [confirming, setConfirming] = useState(null)   // perk pending confirmation
  const [success, setSuccess] = useState(null)         // freshly redeemed record

  const cats = [
    { k: 'all', label_en: 'All', label_bn: 'সব' },
    { k: 'internet', label_en: 'Internet', label_bn: 'ইন্টারনেট' },
    { k: 'voice', label_en: 'Voice', label_bn: 'ভয়েস' },
    { k: 'sms', label_en: 'SMS', label_bn: 'এসএমএস' },
  ]
  const items = PERKS.filter((p) => filter === 'all' || p.cat === filter)
  // Two balances: `lifetime` (xp) drives rank and never drops; `spendable` is
  // the wallet that redemptions reduce. Falls back to xp for older saves.
  const lifetime = user.xp
  const spendable = user.xpSpendable ?? user.xp
  const affordable = PERKS.filter((p) => spendable >= p.cost).length
  const totalSpent = redemptions.reduce((sum, r) => sum + r.cost, 0)

  const confirmRedeem = () => {
    const perk = confirming
    setConfirming(null)
    const record = redeem && redeem(perk)
    if (record) setSuccess(record)
  }

  return (
    <div className="pb-28">
      <StatusBar />

      {/* Header */}
      <div className="px-5 pt-3 flex items-center gap-3">
        <button
          onClick={() => setScreen('home')}
          aria-label={t(lang, 'Back', 'ফিরে যান')}
          className="w-9 h-9 rounded-full bg-[color:var(--surface)] border border-[color:var(--line)] flex items-center justify-center hover:bg-[color:var(--parchment)] transition">
          <Ico.chevronL className="w-4 h-4 text-[color:var(--ink)]" />
        </button>
        <div className="flex-1">
          <div className="font-display text-[22px] leading-none">{t(lang, 'Rewards', 'পুরস্কার')}</div>
          <div className="eyebrow mt-1">{t(lang, 'Spend your XP', 'আপনার XP খরচ করুন')}</div>
        </div>
      </div>

      {/* Balance wallet */}
      <div className="fade-up mx-5 mt-3 rounded-2xl p-4 text-white shadow-md relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, var(--teal) 0%, var(--teal-deep) 100%)' }}>
        <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full" style={{ background: 'radial-gradient(circle, rgba(244,196,95,0.22), transparent 70%)' }}></div>
        <div className="flex items-start justify-between relative">
          <div className="text-[9px] tracking-[0.18em] uppercase text-white/60 font-semibold">{t(lang, 'Spendable XP', 'খরচযোগ্য XP')}</div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/12 ring-1 ring-white/15">
            <Ico.shield className="w-3 h-3 text-[color:var(--gold)]" />
            <span className="text-[10.5px] font-semibold">{t(lang, user.levelTitle, user.levelTitle)}</span>
          </div>
        </div>
        <div className="flex items-baseline gap-2 mt-2 relative">
          <Coin size={26} />
          <span className="font-mono-data text-[34px] font-bold leading-none">{spendable}</span>
          <span className="text-[13px] text-white/70 font-semibold mb-0.5">XP</span>
        </div>
        {/* The whole point: spending the wallet never touches lifetime XP/rank.
            Lifetime lives in a sentence ("earned all-time"), never as a fraction. */}
        <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-white/75 relative">
          <Ico.shield className="w-3 h-3 text-[color:var(--gold)] shrink-0" />
          <span>{t(lang, `Spending won't lower your rank · ${lifetime} XP earned`, `খরচে র‍্যাঙ্ক কমে না · ${lifetime} XP অর্জিত`)}</span>
        </div>
        <div className="mt-1.5 text-[11px] text-white/55 relative pl-[18px]">
          {affordable > 0
            ? t(lang, `${affordable} reward${affordable > 1 ? 's' : ''} within reach`, `${affordable}টি পুরস্কার নাগালে`)
            : t(lang, 'Run a few more tests to unlock your first reward', 'প্রথম পুরস্কারের জন্য আরও কয়েকটি পরীক্ষা করুন')}
        </div>
      </div>

      {/* Store / History segmented control */}
      <div className="fade-up fade-up-1 mx-5 mt-4 p-1 rounded-xl bg-[color:var(--parchment)] border border-[color:var(--line)] flex">
        {[
          { k: 'store', label: t(lang, 'Store', 'স্টোর'), icon: Ico.gift },
          { k: 'history', label: t(lang, 'History', 'হিস্টোরি'), icon: Ico.history },
        ].map((seg) => {
          const active = tab === seg.k
          const I = seg.icon
          return (
            <button key={seg.k} onClick={() => setTab(seg.k)}
              className={'flex-1 py-2 rounded-lg text-[12.5px] font-semibold flex items-center justify-center gap-1.5 transition ' + (active ? 'bg-[color:var(--surface)] text-[color:var(--ink)] shadow-sm' : 'text-[color:var(--ink-soft)]')}>
              <I className="w-3.5 h-3.5" />
              {seg.label}
              {seg.k === 'history' && redemptions.length > 0 && (
                <span className="ml-0.5 min-w-[17px] h-[17px] px-1 rounded-full bg-[color:var(--teal)] text-white text-[9.5px] font-bold font-mono-data flex items-center justify-center">{redemptions.length}</span>
              )}
            </button>
          )
        })}
      </div>

      {tab === 'store' ? (
        <>
          {/* Filter chips */}
          <div className="fade-up fade-up-2 px-5 pt-4 flex gap-2 overflow-x-auto">
            {cats.map((c) => {
              const active = filter === c.k
              return (
                <button key={c.k} onClick={() => setFilter(c.k)}
                  className={'px-3.5 py-1.5 rounded-full text-[12px] font-semibold whitespace-nowrap shrink-0 transition border ' + (active ? 'bg-[color:var(--teal)] text-white border-[color:var(--teal)] shadow-sm' : 'bg-[color:var(--surface)] text-[color:var(--ink-soft)] border-[color:var(--line)]')}>
                  {t(lang, c.label_en, c.label_bn)}
                </button>
              )
            })}
          </div>

          {/* Perk grid — uniform card skeleton, price pinned to the bottom */}
          <div className="fade-up fade-up-3 px-5 pt-3.5 grid grid-cols-2 gap-2.5 items-stretch">
            {items.map((p) => {
              const canAfford = spendable >= p.cost
              const Glyph = CAT_ICON[p.cat]
              return (
                <button key={p.id} disabled={!canAfford} onClick={() => setConfirming(p)}
                  className={'h-full bg-[color:var(--surface)] border rounded-2xl p-3.5 flex flex-col text-left transition ' + (canAfford ? 'border-[color:var(--line)] hover:border-[color:var(--gold)]/50 hover:shadow-sm' : 'border-[color:var(--line)] opacity-60')}>
                  {/* Row 1 — icon + validity, fixed */}
                  <div className="flex items-center justify-between">
                    <div className="w-9 h-9 rounded-xl bg-[color:var(--teal-soft)] text-[color:var(--teal)] flex items-center justify-center">
                      <Glyph className="w-[18px] h-[18px]" />
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-[color:var(--parchment)] text-[9.5px] font-semibold text-[color:var(--ink-soft)] flex items-center gap-1">
                      <Ico.history className="w-2.5 h-2.5" />{t(lang, p.meta_en, p.meta_bn)}
                    </span>
                  </div>
                  {/* Row 2 — value, fixed height */}
                  <div className="mt-3">
                    <div className="font-display text-[21px] leading-none whitespace-nowrap">{p.title}</div>
                    <div className="text-[11px] text-[color:var(--ink-soft)] mt-1">{t(lang, p.sub_en, p.sub_bn)}</div>
                  </div>
                  {/* Row 3 — price, pinned to bottom so every card aligns */}
                  <div className="mt-auto pt-3.5">
                    <div className="rounded-lg px-2.5 py-1.5 flex items-center justify-between"
                      style={canAfford ? { background: 'var(--gold-soft)' } : { background: 'var(--parchment)' }}>
                      {canAfford ? (
                        <>
                          <span className="text-[11.5px] font-bold text-[color:var(--gold)]">{t(lang, 'Redeem', 'নিন')}</span>
                          <span className="flex items-center gap-1 font-mono-data text-[12px] font-bold text-[color:var(--gold)]">
                            <Coin size={12} />{p.cost} XP
                          </span>
                        </>
                      ) : (
                        <span className="w-full text-[10.5px] font-semibold text-[color:var(--mute)] flex items-center justify-center gap-1.5">
                          <Ico.lock className="w-3 h-3" />{t(lang, `Need ${p.cost - spendable} more XP`, `আরও ${p.cost - spendable} XP প্রয়োজন`)}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Footer note */}
          <div className="px-5 pt-5 flex items-center justify-center gap-2 text-[10.5px] text-[color:var(--mute)]">
            <Ico.shield className="w-3 h-3 text-[color:var(--gold)]" />
            <span>{t(lang, 'Redemptions are issued by BTRC partner operators.', 'রিডেম্পশন BTRC অংশীদার অপারেটরদের দ্বারা প্রদান করা হয়।')}</span>
          </div>
        </>
      ) : (
        <div className="fade-up fade-up-2 px-5 pt-4">
          {redemptions.length === 0 ? (
            <div className="mt-4 p-8 rounded-2xl bg-[color:var(--surface)] border border-[color:var(--line)] text-center">
              <div className="w-12 h-12 rounded-full bg-[color:var(--parchment)] flex items-center justify-center mx-auto">
                <Ico.gift className="w-6 h-6 text-[color:var(--mute)]" />
              </div>
              <div className="font-display text-[16px] text-[color:var(--ink)] mt-3">{t(lang, 'No redemptions yet', 'এখনো কোনো রিডেম্পশন নেই')}</div>
              <div className="text-[12px] text-[color:var(--ink-soft)] mt-1 leading-snug">{t(lang, 'Rewards you redeem with XP will show up here, with their voucher codes.', 'XP দিয়ে নেওয়া পুরস্কার ভাউচার কোডসহ এখানে দেখা যাবে।')}</div>
              <button onClick={() => setTab('store')} className="btn-primary mt-4 px-5 py-2.5 rounded-xl font-semibold text-[12.5px]">{t(lang, 'Browse rewards', 'পুরস্কার দেখুন')}</button>
            </div>
          ) : (
            <>
              {/* Summary strip */}
              <div className="flex gap-2.5">
                <div className="flex-1 rounded-xl bg-[color:var(--surface)] border border-[color:var(--line)] p-3">
                  <div className="font-mono-data text-[20px] font-bold text-[color:var(--ink)] leading-none">{redemptions.length}</div>
                  <div className="text-[10px] text-[color:var(--ink-soft)] mt-1">{t(lang, 'Total redeemed', 'মোট নেওয়া')}</div>
                </div>
                <div className="flex-1 rounded-xl bg-[color:var(--surface)] border border-[color:var(--line)] p-3">
                  <div className="font-mono-data text-[20px] font-bold text-[color:var(--gold)] leading-none flex items-center gap-1"><Coin size={15} />{totalSpent}</div>
                  <div className="text-[10px] text-[color:var(--ink-soft)] mt-1">{t(lang, 'XP spent', 'XP খরচ')}</div>
                </div>
              </div>

              <div className="mt-3 space-y-2.5">
                {redemptions.map((r) => <HistoryCard key={r.id} lang={lang} r={r} />)}
              </div>

              <div className="pt-5 flex items-center justify-center gap-2 text-[10.5px] text-[color:var(--mute)]">
                <Ico.shield className="w-3 h-3 text-[color:var(--gold)]" />
                <span>{t(lang, 'Voucher codes are redeemable with BTRC partner operators.', 'ভাউচার কোড BTRC অংশীদার অপারেটরদের কাছে ব্যবহারযোগ্য।')}</span>
              </div>
            </>
          )}
        </div>
      )}

      {confirming && (
        <ConfirmSheet lang={lang} perk={confirming} balance={spendable}
          onCancel={() => setConfirming(null)} onConfirm={confirmRedeem} />
      )}
      {success && (
        <SuccessOverlay lang={lang} record={success}
          onViewHistory={() => { setSuccess(null); setTab('history') }}
          onClose={() => setSuccess(null)} />
      )}
    </div>
  )
}
