// Reliability classification: combines speed-vs-plan, jitter, packet loss, and latency
// into a synthetic "stability index". Drives the verdict-first Result screen.

export const RELIABILITY = {
  excellent: {
    key: 'excellent', en: 'Excellent', bn: 'চমৎকার',
    color: 'var(--green)', bg: 'var(--green-soft)', dot: '#16A34A',
    sub_en: 'Reliable for everything — video calls, gaming, 4K streaming.',
    sub_bn: 'সবকিছুর জন্য নির্ভরযোগ্য — ভিডিও কল, গেমিং, ৪K স্ট্রিমিং।',
  },
  good: {
    key: 'good', en: 'Good', bn: 'ভালো',
    color: 'var(--amber)', bg: 'var(--amber-soft)', dot: '#D97706',
    sub_en: 'Mostly stable. Minor fluctuations. Occasional buffering possible on 4K video.',
    sub_bn: 'বেশিরভাগ স্থিতিশীল। সামান্য ওঠানামা। ৪K ভিডিওতে কখনো বাফারিং হতে পারে।',
  },
  poor: {
    key: 'poor', en: 'Poor', bn: 'দুর্বল',
    color: 'var(--orange)', bg: 'var(--orange-soft)', dot: '#EA580C',
    sub_en: 'Frequent slowdowns. Video calls may drop. Streaming will buffer.',
    sub_bn: 'বারবার গতি কমে। ভিডিও কল বিচ্ছিন্ন হতে পারে। স্ট্রিমিং বাফার করবে।',
  },
  unstable: {
    key: 'unstable', en: 'Unstable', bn: 'অস্থিতিশীল',
    color: 'var(--coral)', bg: 'var(--coral-soft)', dot: '#DC2626',
    sub_en: 'Connection drops often. Basic browsing only.',
    sub_bn: 'সংযোগ প্রায়ই বিচ্ছিন্ন হয়। শুধু সাধারণ ব্রাউজিং সম্ভব।',
  },
}

export const USE_CASE_STATUS = {
  excellent: { gaming: 'ok',      video: 'ok',      streaming: 'ok' },
  good:      { gaming: 'partial', video: 'ok',      streaming: 'partial' },
  poor:      { gaming: 'fail',    video: 'partial', streaming: 'fail' },
  unstable:  { gaming: 'fail',    video: 'fail',    streaming: 'fail' },
}

export function classifyReliability(down, advertised, lat, jitter, loss) {
  const ratio = advertised ? down / advertised : 0.8
  const score =
    ratio * 60 +
    Math.max(0, (60 - lat) / 60) * 15 +
    Math.max(0, (10 - jitter) / 10) * 15 +
    Math.max(0, (2 - loss) / 2) * 10
  if (score >= 80) return RELIABILITY.excellent
  if (score >= 60) return RELIABILITY.good
  if (score >= 35) return RELIABILITY.poor
  return RELIABILITY.unstable
}
