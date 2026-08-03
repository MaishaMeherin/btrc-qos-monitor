export const DEFAULT_USER = {
  level: 3,
  levelTitle: 'Signal Scout',
  xp: 450,            // lifetime XP earned — drives level/rank, never decreases
  xpSpendable: 290,   // wallet — earned alongside xp, reduced by redemptions
  xpToNext: 600,
  streakDays: 7,
  testsThisMonth: 23,
  totalTests: 87,
  districtsCovered: 5,
  ispsTested: 3,
  placesExplored: 12,
  flagsRaised: 4,
  districtRank: 18,
  totalDistricts: 64,
  inDistrictRank: 3,
  displayName: 'Anon · DI',
  publicProfile: false,
  joinedOn_en: 'Apr 2026',
  joinedOn_bn: 'এপ্রিল ২০২৬',
};

export const FRESH_USER = {
  level: 1,
  levelTitle: 'New Contributor',
  xp: 0,              // lifetime XP earned — drives level/rank, never decreases
  xpSpendable: 0,     // wallet — earned alongside xp, reduced by redemptions
  xpToNext: 100,
  streakDays: 0,
  testsThisMonth: 0,
  totalTests: 0,
  districtsCovered: 0,
  ispsTested: 0,
  placesExplored: 0,
  flagsRaised: 0,
  districtRank: 64,
  totalDistricts: 64,
  inDistrictRank: 0,
  displayName: 'Anon · —',
  publicProfile: false,
  joinedOn_en: 'Today',
  joinedOn_bn: 'আজ',
};

// The 6 contributor ranks — earned purely by cumulative XP at fixed thresholds
// (0/100/300/600/1000/2000). Each rank IS the achievement: a collectible badge
// with its own emoji character, colour theme and personality. This is the whole
// "Achievements" system — missions stay the day-to-day focus; ranks are the
// long-arc reward you climb toward. `c1`/`c2` form the medal gradient, `accent`
// drives glow/soft fills.
export const LEVELS = [
  { n: 1, title: 'New Contributor', title_bn: 'নতুন অবদানকারী', xp: 0, emoji: '🌱',
    c1: '#4ADE80', c2: '#16A34A', accent: '#16A34A',
    tagline_en: 'Your first readings just hit the map. Welcome aboard!',
    tagline_bn: 'আপনার প্রথম পাঠ মানচিত্রে যুক্ত হলো। স্বাগতম!',
    blurb_en: 'Every national map starts with one reading. Yours is now part of it.',
    blurb_bn: 'প্রতিটি জাতীয় মানচিত্র একটি পাঠ দিয়েই শুরু হয়। আপনারটি এখন তার অংশ।' },
  { n: 2, title: 'Signal Seeker', title_bn: 'সিগন্যাল সন্ধানী', xp: 100, emoji: '📡',
    c1: '#38BDF8', c2: '#0A5E7E', accent: '#0A5E7E',
    tagline_en: 'On the hunt for weak signals across the city.',
    tagline_bn: 'শহরজুড়ে দুর্বল সিগন্যাল খুঁজে চলেছেন।',
    blurb_en: 'You test often enough that your readings start filling real gaps.',
    blurb_bn: 'আপনি যথেষ্ট পরীক্ষা করেন যাতে আপনার পাঠ সত্যিকারের ফাঁক পূরণ করে।' },
  { n: 3, title: 'Signal Scout', title_bn: 'সিগন্যাল স্কাউট', xp: 300, emoji: '🧭',
    c1: '#22D3EE', c2: '#0369A1', accent: '#0369A1',
    tagline_en: 'Scouting fresh ground — your data shifts the averages.',
    tagline_bn: 'নতুন এলাকা স্কাউট করছেন — আপনার ডেটা গড় বদলায়।',
    blurb_en: 'Your coverage spreads across places and operators, not just one spot.',
    blurb_bn: 'আপনার কভারেজ একটি জায়গায় নয়, নানা স্থান ও অপারেটরে ছড়ায়।' },
  { n: 4, title: 'District Watcher', title_bn: 'জেলা প্রহরী', xp: 600, emoji: '🦉',
    c1: '#A78BFA', c2: '#6D28D9', accent: '#6D28D9',
    tagline_en: "Guardian of your district's connection quality.",
    tagline_bn: 'আপনার জেলার সংযোগ মানের অভিভাবক।',
    blurb_en: "You've contributed enough that your district leans on your readings.",
    blurb_bn: 'আপনি এত অবদান রেখেছেন যে আপনার জেলা আপনার পাঠের উপর নির্ভর করে।' },
  { n: 5, title: 'QoS Champion', title_bn: 'QoS চ্যাম্পিয়ন', xp: 1000, emoji: '🏆',
    c1: '#FBBF24', c2: '#B8860B', accent: '#B8860B',
    tagline_en: 'A force in the dataset — your tests move the numbers.',
    tagline_bn: 'ডেটার এক শক্তি — আপনার পরীক্ষা সংখ্যা বদলায়।',
    blurb_en: 'Top contributors like you shape how BTRC sees the whole region.',
    blurb_bn: 'আপনার মতো শীর্ষ অবদানকারীরা পুরো অঞ্চল সম্পর্কে BTRC-র দৃষ্টিভঙ্গি গড়েন।' },
  { n: 6, title: 'National Verifier', title_bn: 'জাতীয় যাচাইকারী', xp: 2000, emoji: '👑',
    c1: '#C084FC', c2: '#7E22CE', accent: '#7E22CE',
    tagline_en: 'Legend. Your readings span the whole nation.',
    tagline_bn: 'কিংবদন্তি। আপনার পাঠ সারা দেশে ছড়ানো।',
    blurb_en: 'The highest rank. Fewer than 0.1% of contributors ever reach it.',
    blurb_bn: 'সর্বোচ্চ স্তর। ০.১%-এরও কম অবদানকারী এখানে পৌঁছান।' },
];

// Cumulative XP → rank number (1–6) using the fixed LEVELS thresholds.
export const levelFromXp = (xp) => {
  let n = 1
  for (const l of LEVELS) if (xp >= l.xp) n = l.n
  return n
}

// Missions are sampling instructions: every one closes a real gap in the
// crowdsourced dataset. `dimension` tags WHICH gap (time / place / network /
// depth / continuity) — the regulator's steering wheel — and `why` tells the
// user why that sample matters, turning gamification into a data instrument.
export const MISSIONS = [
  // ── Daily — the check-in engine (time-of-day coverage + the streak) ──
  { id: 'd1', kind: 'Daily', dimension: 'time', icon: 'gauge',
    title_en: 'Test your internet today', title_bn: 'আজ আপনার ইন্টারনেট পরীক্ষা করুন',
    why_en: 'Keeps your daily streak going and shows how good your internet is today.',
    why_bn: 'আপনার দৈনিক স্ট্রিক চালু রাখে এবং আজ আপনার ইন্টারনেট কেমন তা জানায়।',
    xp: 15, progress: 0, target: 1, expires: 'Today 23:59' },
  // Windowed missions: each `window` is only claimable while its hours are open.
  // `start`/`end` are 24h. `done` = user tested inside that window today.
  { id: 'd3', kind: 'Daily', dimension: 'time', icon: 'history',
    title_en: 'Test once in the morning, once at night', title_bn: 'একবার সকালে, একবার রাতে পরীক্ষা করুন',
    why_en: 'Testing at two different times shows how your internet changes during the day.',
    why_bn: 'দুটি ভিন্ন সময়ে পরীক্ষা করলে দিনভর আপনার ইন্টারনেট কীভাবে বদলায় তা বোঝা যায়।',
    xp: 25, progress: 1, target: 2, expires: 'Today 23:59',
    windows: [
      { key: 'morning', icon: 'sun', label_en: 'Morning', label_bn: 'সকাল', start: 5, end: 11, done: true },
      { key: 'night', icon: 'moon', label_en: 'Night', label_bn: 'রাত', start: 18, end: 23, done: false },
    ] },

  // ── Weekly — kills the home-WiFi-evening sampling bias ──
  // PLACES mission: tracks distinct areas you've tested from, so BTRC sees how
  // your own connection performs across the city — not just at home. A place is
  // keyed by GPS cluster (+ network identity). `places` = areas already tested.
  { id: 'w1', kind: 'Weekly', dimension: 'place', icon: 'pin',
    title_en: 'Test from 2 different places', title_bn: '২টি ভিন্ন জায়গা থেকে পরীক্ষা করুন',
    why_en: 'Shows how your own connection performs across areas — home, work, around the city.',
    why_bn: 'আপনার নিজের সংযোগ বিভিন্ন এলাকায় কেমন কাজ করে তা দেখায় — বাসা, অফিস, শহরজুড়ে।',
    xp: 70, expires: '4 days',
    type: 'places', target: 2,
    places: [
      { label_en: 'Mirpur café', label_bn: 'মিরপুর ক্যাফে' },
    ] },
  { id: 'w3', kind: 'Weekly', dimension: 'network', icon: 'network',
    title_en: 'Test using mobile data, not Wi‑Fi', title_bn: 'ওয়াই-ফাই নয়, মোবাইল ডেটা দিয়ে পরীক্ষা করুন',
    why_en: 'Mobile data and Wi-Fi can be very different. Testing both gives a fuller picture.',
    why_bn: 'মোবাইল ডেটা ও ওয়াই-ফাই অনেক আলাদা হতে পারে। দুটোই পরীক্ষা করলে পূর্ণ চিত্র পাওয়া যায়।',
    xp: 45, progress: 0, target: 1, expires: '4 days' },
  { id: 'w4', kind: 'Weekly', dimension: 'depth', icon: 'reliability',
    title_en: 'Complete 5 Full QoS multi-tests', title_bn: '৫টি পূর্ণ QoS পরীক্ষা সম্পন্ন করুন',
    why_en: 'A full test checks more than speed — like how steady your connection stays.',
    why_bn: 'পূর্ণ পরীক্ষা শুধু গতি নয়, আপনার সংযোগ কতটা স্থিতিশীল তাও যাচাই করে।',
    xp: 90, progress: 1, target: 5, expires: '4 days' },

  // ── Collections — long-term coverage meta (the completionist pull) ──
  { id: 'a1', kind: 'Milestone', dimension: 'time', icon: 'gauge',
    title_en: 'Test at all 4 times of day', title_bn: 'দিনের ৪টি সময়েই পরীক্ষা করুন',
    why_en: 'Testing at dawn, midday, evening and night shows the full daily picture.',
    why_bn: 'ভোর, দুপুর, সন্ধ্যা ও রাতে পরীক্ষা করলে সারাদিনের পূর্ণ চিত্র পাওয়া যায়।',
    xp: 200, progress: 3, target: 4, expires: 'Ongoing',
    windows: [
      { key: 'dawn', icon: 'sun', label_en: 'Dawn', label_bn: 'ভোর', start: 5, end: 9, done: true },
      { key: 'midday', icon: 'sun', label_en: 'Midday', label_bn: 'দুপুর', start: 11, end: 15, done: true },
      { key: 'evening', icon: 'moon', label_en: 'Evening', label_bn: 'সন্ধ্যা', start: 17, end: 20, done: true },
      { key: 'night', icon: 'moon', label_en: 'Night', label_bn: 'রাত', start: 20, end: 24, done: false },
    ] },
  // DISTRICTS mission: tracks distinct districts tested — BTRC's regulatory
  // unit — so coverage spreads across the country. A district comes from each
  // test's GPS → district lookup. `districts` = the ones already tested.
  { id: 'a2', kind: 'Milestone', dimension: 'place', icon: 'pin',
    title_en: 'Test in 5 different districts', title_bn: '৫টি ভিন্ন জেলায় পরীক্ষা করুন',
    why_en: 'Wider district coverage makes the national dataset fair and representative.',
    why_bn: 'বেশি জেলা কভারেজ জাতীয় তথ্যকে ন্যায্য ও প্রতিনিধিত্বশীল করে।',
    xp: 250, expires: 'Ongoing',
    type: 'districts', target: 5,
    districts: [
      { label_en: 'Dhaka', label_bn: 'ঢাকা' },
      { label_en: 'Gazipur', label_bn: 'গাজীপুর' },
      { label_en: 'Narayanganj', label_bn: 'নারায়ণগঞ্জ' },
    ] },
  { id: 'a3', kind: 'Milestone', dimension: 'continuity', icon: 'flame',
    title_en: 'Test every day for 30 days', title_bn: 'টানা ৩০ দিন প্রতিদিন পরীক্ষা করুন',
    why_en: 'Testing every day helps spot slowdowns and outages that one test would miss.',
    why_bn: 'প্রতিদিন পরীক্ষা করলে ধীরগতি ও বিভ্রাট ধরা পড়ে, যা একটিমাত্র পরীক্ষায় বোঝা যায় না।',
    xp: 150, progress: 7, target: 30, expires: 'Ongoing' },
  // ISPS mission: tracks distinct operators you've tested on, so BTRC can
  // compare providers. Keyed by the operator each test reports. `isps` = the
  // providers already tested.
  { id: 'a4', kind: 'Milestone', dimension: 'network', icon: 'network',
    title_en: 'Test from 5 different ISPs', title_bn: '৫টি ভিন্ন অপারেটর থেকে পরীক্ষা করুন',
    why_en: 'Comparing providers shows which networks deliver and which fall short.',
    why_bn: 'অপারেটর তুলনা করলে বোঝা যায় কোন নেটওয়ার্ক ভালো সেবা দেয় আর কোনটি পিছিয়ে।',
    xp: 300, expires: 'Ongoing',
    type: 'isps', target: 5,
    isps: [
      { label_en: 'GrameenPhone', label_bn: 'গ্রামীণফোন' },
      { label_en: 'Robi', label_bn: 'রবি' },
      { label_en: 'Banglalink', label_bn: 'বাংলালিংক' },
    ] },
]

// Prototype-only context simulators driven from Demo controls. In the real app
// `nowH` comes from the device clock and the place from each test's network
// identity (public IP / Wi-Fi) + GPS; these just let a reviewer drive both.
export const PREVIEW_TIMES = [
  { label_en: 'Morning', label_bn: 'সকাল', val: 8, icon: 'sun' },
  { label_en: 'Midday', label_bn: 'দুপুর', val: 14, icon: 'gauge' },
  { label_en: 'Evening', label_bn: 'সন্ধ্যা', val: 21, icon: 'moon' },
  { label_en: 'Late', label_bn: 'গভীর রাত', val: 23, icon: 'clock' },
]

export const PLACE_PRESETS = [
  { key: 'home', label_en: 'Home', label_bn: 'বাসা', icon: 'home', isNew: false },
  { key: 'office', label_en: 'Office', label_bn: 'অফিস', icon: 'tower', isNew: false },
  { key: 'cafe', label_en: 'New café', label_bn: 'নতুন ক্যাফে', icon: 'pin', isNew: true },
  { key: 'city', label_en: 'New city', label_bn: 'নতুন শহর', icon: 'globe', isNew: true },
]

// Simulated "currently connected operator". `isNew` = not yet in the ISP
// collection's `found` list (GrameenPhone is already collected, so not new).
export const ISP_PRESETS = [
  { key: 'gp', label_en: 'GrameenPhone', label_bn: 'গ্রামীণফোন', icon: 'tower', isNew: false },
  { key: 'dot', label_en: 'Dot Internet', label_bn: 'ডট ইন্টারনেট', icon: 'network', isNew: true },
  { key: 'brac', label_en: 'Bracnet', label_bn: 'ব্র্যাকনেট', icon: 'network', isNew: true },
  { key: 'agni', label_en: 'Agni Systems', label_bn: 'অগ্নি সিস্টেমস', icon: 'network', isNew: true },
]

// Maps each data dimension to a short label + colour token, so the page can
// surface WHAT each mission is steering the dataset toward.
export const DIMENSIONS = {
  time:       { en: 'Time',     bn: 'সময়',     color: 'var(--gold)' },
  place:      { en: 'Place',    bn: 'স্থান',     color: 'var(--teal)' },
  network:    { en: 'Network',  bn: 'নেটওয়ার্ক', color: 'var(--teal-deep)' },
  depth:      { en: 'Depth',    bn: 'গভীরতা',   color: 'var(--green)' },
  continuity: { en: 'Streak',   bn: 'ধারাবাহিকতা', color: 'var(--amber)' },
};

export const BADGES = [
  { id: 'b1', name_en: 'First Test', name_bn: 'প্রথম পরীক্ষা', tier: 'bronze', earned: true,
    desc_en: 'Run your first speed test', desc_bn: 'প্রথম স্পিড টেস্ট সম্পন্ন করুন',
    story_en: "The first measurement you submit becomes part of Bangladesh's public QoS record. Every contributor starts here.",
    story_bn: 'আপনার জমা দেওয়া প্রথম পরিমাপ বাংলাদেশের পাবলিক QoS রেকর্ডে যুক্ত হয়। প্রতিটি অবদানকারী এখান থেকেই শুরু করেন।',
    metric: 'totalTests', target: 1, unit_en: 'test', unit_bn: 'পরীক্ষা',
    earnedOn_en: '12 Apr 2026', earnedOn_bn: '১২ এপ্রিল ২০২৬' },
  { id: 'b2', name_en: 'Signal Scout', name_bn: 'সিগন্যাল স্কাউট', tier: 'silver', earned: true,
    desc_en: 'Complete 50 verified tests', desc_bn: '৫০টি যাচাইকৃত পরীক্ষা সম্পন্ন করুন',
    story_en: "Fifty data points is the threshold where one contributor's readings start to nudge district averages. You've crossed it.",
    story_bn: '৫০টি ডেটা পয়েন্ট এমন একটি সীমা যেখানে একজন অবদানকারীর পাঠ জেলা গড়কে প্রভাবিত করতে শুরু করে। আপনি এই সীমা পার করেছেন।',
    metric: 'totalTests', target: 50, unit_en: 'tests', unit_bn: 'পরীক্ষা',
    earnedOn_en: '02 May 2026', earnedOn_bn: '০২ মে ২০২৬' },
  { id: 'b3', name_en: 'District Explorer', name_bn: 'জেলা অভিযাত্রী', tier: 'bronze', earned: true,
    desc_en: 'Test in 3+ districts', desc_bn: '৩টির বেশি জেলায় পরীক্ষা করুন',
    story_en: 'Coverage outside your home district is what turns this from a personal log into a national map.',
    story_bn: 'নিজের জেলার বাইরে কভারেজই এটিকে ব্যক্তিগত লগ থেকে জাতীয় মানচিত্রে রূপান্তর করে।',
    metric: 'districtsCovered', target: 3, unit_en: 'districts', unit_bn: 'জেলা',
    earnedOn_en: '10 Apr 2026', earnedOn_bn: '১০ এপ্রিল ২০২৬' },
  { id: 'b4', name_en: 'ISP Sampler', name_bn: 'আইএসপি পর্যবেক্ষক', tier: 'bronze', earned: true,
    desc_en: 'Test on 3+ ISPs', desc_bn: '৩টির বেশি আইএসপি-তে পরীক্ষা করুন',
    story_en: 'Cross-ISP readings let BTRC compare delivered speed across operators on the same street.',
    story_bn: 'একই এলাকায় বিভিন্ন অপারেটরের ডেলিভার্ড স্পিড তুলনা করতে BTRC-কে সাহায্য করে।',
    metric: 'ispsTested', target: 3, unit_en: 'ISPs', unit_bn: 'আইএসপি',
    earnedOn_en: '24 Apr 2026', earnedOn_bn: '২৪ এপ্রিল ২০২৬' },
  { id: 'b5', name_en: 'Night Watch', name_bn: 'রাতের প্রহরী', tier: 'silver', earned: true,
    desc_en: '20 tests between 22:00–06:00', desc_bn: 'রাত ১০টা–ভোর ৬টার মধ্যে ২০টি পরীক্ষা',
    story_en: 'Off-peak congestion is where promised speeds quietly disappear. Nighttime readings are some of the most valuable.',
    story_bn: 'অফ-পিক সময়ে প্রতিশ্রুত গতি নীরবে হারিয়ে যায়। রাতের পাঠ সবচেয়ে মূল্যবান কিছুর মধ্যে।',
    metric: 'nightTests', current: 22, target: 20, unit_en: 'night tests', unit_bn: 'রাতের পরীক্ষা',
    earnedOn_en: '18 May 2026', earnedOn_bn: '১৮ মে ২০২৬' },
  { id: 'b6', name_en: 'Evidence Reporter', name_bn: 'প্রমাণ রিপোর্টার', tier: 'silver', earned: false,
    desc_en: 'Flag first verified package mismatch', desc_bn: 'প্রথম যাচাইকৃত প্যাকেজ অমিল চিহ্নিত করুন',
    story_en: 'When delivered speed falls below 70% of advertised, your test becomes regulatory evidence. File one accepted flag to earn this.',
    story_bn: 'যখন ডেলিভার্ড স্পিড বিজ্ঞাপিত গতির ৭০%-এর নিচে পড়ে, আপনার পরীক্ষা নিয়ন্ত্রক প্রমাণ হয়ে যায়।',
    metric: 'flagsAccepted', current: 0, target: 1, unit_en: 'accepted flag', unit_bn: 'গৃহীত ফ্ল্যাগ' },
  { id: 'b7', name_en: 'QoS Champion', name_bn: 'QoS চ্যাম্পিয়ন', tier: 'gold', earned: false,
    desc_en: 'Complete 200 tests', desc_bn: '২০০টি পরীক্ষা সম্পন্ন করুন',
    story_en: 'Two hundred readings make you a structural contributor — your data alone moves district-level statistics.',
    story_bn: 'দুইশ পাঠ আপনাকে একজন কাঠামোগত অবদানকারীতে পরিণত করে — শুধু আপনার ডেটাই জেলা পরিসংখ্যান পরিবর্তন করে।',
    metric: 'totalTests', target: 200, unit_en: 'tests', unit_bn: 'পরীক্ষা' },
  { id: 'b8', name_en: 'First Responder', name_bn: 'প্রথম সাড়াদাতা', tier: 'gold', earned: false,
    desc_en: 'First to detect a regional outage', desc_bn: 'কোনো অঞ্চলের আউটেজ প্রথম শনাক্ত করুন',
    story_en: "Awarded when your submission is the earliest verified report of a regional outage. You can't farm this — it finds you.",
    story_bn: 'আপনার জমা যখন কোনো অঞ্চলের আউটেজের প্রথম যাচাইকৃত রিপোর্ট হবে তখন প্রদান করা হবে। এটি আপনিই খুঁজে পাবে।',
    metric: 'firstResponder', current: 0, target: 1, unit_en: '', unit_bn: '' },
  { id: 'b9', name_en: 'National Verifier', name_bn: 'জাতীয় যাচাইকারী', tier: 'platinum', earned: false,
    desc_en: 'Test across all 8 divisions', desc_bn: 'বাংলাদেশের ৮টি বিভাগে পরীক্ষা করুন',
    story_en: 'The highest tier — a contributor whose readings cover every division of the country. Less than 0.1% of testers reach this.',
    story_bn: 'সর্বোচ্চ স্তর — যার পাঠ দেশের প্রতিটি বিভাগ কভার করে। ০.১%-এরও কম টেস্টার এই স্তরে পৌঁছান।',
    metric: 'divisionsCovered', current: 2, target: 8, unit_en: 'divisions', unit_bn: 'বিভাগ' },
];

// Leaderboard as ONE hierarchy at three zoom levels, each keyed by location so
// the place can be browsed: People → pick an area, Areas → pick a district,
// Districts → fixed to the country. Every row shares the shape
// { rank, name, sub_en, sub_bn, value, isMine }, ranked by `value` = verified
// tests contributed (the civic metric). isMine only appears in your own place.
export const BOARD = {
  // People leading — keyed by area
  people: {
    Dhanmondi: [
      { rank: 1, name: 'Anon · AG', value: 412, isMine: false },
      { rank: 2, name: 'Kamrul H.', value: 298, isMine: false },
      { rank: 3, name: 'Anon · DI', value: 87, isMine: true },
      { rank: 4, name: 'Anon · BL', value: 71, isMine: false },
      { rank: 5, name: 'Sumaiya R.', value: 64, isMine: false },
      { rank: 6, name: 'Anon · DI', value: 58, isMine: false },
      { rank: 7, name: 'Nasir A.', value: 49, isMine: false },
      { rank: 8, name: 'Anon · GP', value: 44, isMine: false },
    ],
    Mirpur: [
      { rank: 1, name: 'Anon · GP', value: 356, isMine: false },
      { rank: 2, name: 'Tanvir A.', value: 240, isMine: false },
      { rank: 3, name: 'Anon · RB', value: 198, isMine: false },
      { rank: 4, name: 'Farhana K.', value: 150, isMine: false },
      { rank: 5, name: 'Anon · BL', value: 132, isMine: false },
      { rank: 6, name: 'Imran S.', value: 98, isMine: false },
    ],
    Uttara: [
      { rank: 1, name: 'Sadia N.', value: 310, isMine: false },
      { rank: 2, name: 'Anon · AG', value: 276, isMine: false },
      { rank: 3, name: 'Rakib H.', value: 224, isMine: false },
      { rank: 4, name: 'Anon · GP', value: 180, isMine: false },
      { rank: 5, name: 'Mehedi I.', value: 121, isMine: false },
      { rank: 6, name: 'Anon · BL', value: 90, isMine: false },
    ],
  },
  // Areas leading — keyed by district
  areas: {
    Dhaka: [
      { rank: 1, name: 'Dhanmondi', sub_en: '142 contributors', sub_bn: '১৪২ জন অবদানকারী', value: 1240, isMine: true },
      { rank: 2, name: 'Mirpur', sub_en: '118 contributors', sub_bn: '১১৮ জন অবদানকারী', value: 1105, isMine: false },
      { rank: 3, name: 'Uttara', sub_en: '96 contributors', sub_bn: '৯৬ জন অবদানকারী', value: 980, isMine: false },
      { rank: 4, name: 'Gulshan', sub_en: '88 contributors', sub_bn: '৮৮ জন অবদানকারী', value: 870, isMine: false },
      { rank: 5, name: 'Mohammadpur', sub_en: '74 contributors', sub_bn: '৭৪ জন অবদানকারী', value: 712, isMine: false },
      { rank: 6, name: 'Banani', sub_en: '61 contributors', sub_bn: '৬১ জন অবদানকারী', value: 640, isMine: false },
      { rank: 7, name: 'Mohakhali', sub_en: '53 contributors', sub_bn: '৫৩ জন অবদানকারী', value: 521, isMine: false },
      { rank: 8, name: 'Tejgaon', sub_en: '47 contributors', sub_bn: '৪৭ জন অবদানকারী', value: 488, isMine: false },
    ],
    Chattogram: [
      { rank: 1, name: 'Agrabad', sub_en: '97 contributors', sub_bn: '৯৭ জন অবদানকারী', value: 980, isMine: false },
      { rank: 2, name: 'Khulshi', sub_en: '83 contributors', sub_bn: '৮৩ জন অবদানকারী', value: 845, isMine: false },
      { rank: 3, name: 'Pahartali', sub_en: '69 contributors', sub_bn: '৬৯ জন অবদানকারী', value: 690, isMine: false },
      { rank: 4, name: 'Halishahar', sub_en: '54 contributors', sub_bn: '৫৪ জন অবদানকারী', value: 560, isMine: false },
      { rank: 5, name: 'Chawkbazar', sub_en: '41 contributors', sub_bn: '৪১ জন অবদানকারী', value: 430, isMine: false },
      { rank: 6, name: 'Patenga', sub_en: '33 contributors', sub_bn: '৩৩ জন অবদানকারী', value: 360, isMine: false },
    ],
    Gazipur: [
      { rank: 1, name: 'Tongi', sub_en: '58 contributors', sub_bn: '৫৮ জন অবদানকারী', value: 540, isMine: false },
      { rank: 2, name: 'Board Bazar', sub_en: '49 contributors', sub_bn: '৪৯ জন অবদানকারী', value: 470, isMine: false },
      { rank: 3, name: 'Joydebpur', sub_en: '42 contributors', sub_bn: '৪২ জন অবদানকারী', value: 410, isMine: false },
      { rank: 4, name: 'Sreepur', sub_en: '34 contributors', sub_bn: '৩৪ জন অবদানকারী', value: 320, isMine: false },
      { rank: 5, name: 'Kaliakair', sub_en: '27 contributors', sub_bn: '২৭ জন অবদানকারী', value: 260, isMine: false },
      { rank: 6, name: 'Kapasia', sub_en: '19 contributors', sub_bn: '১৯ জন অবদানকারী', value: 190, isMine: false },
    ],
  },
  // Districts leading — keyed by country
  districts: {
    Bangladesh: [
      { rank: 1, name: 'Dhaka', sub_en: '38 areas covered', sub_bn: '৩৮টি এলাকা', value: 9420, isMine: true },
      { rank: 2, name: 'Chattogram', sub_en: '29 areas covered', sub_bn: '২৯টি এলাকা', value: 7180, isMine: false },
      { rank: 3, name: 'Gazipur', sub_en: '21 areas covered', sub_bn: '২১টি এলাকা', value: 4960, isMine: false },
      { rank: 4, name: 'Narayanganj', sub_en: '18 areas covered', sub_bn: '১৮টি এলাকা', value: 3820, isMine: false },
      { rank: 5, name: 'Sylhet', sub_en: '16 areas covered', sub_bn: '১৬টি এলাকা', value: 3310, isMine: false },
      { rank: 6, name: 'Khulna', sub_en: '14 areas covered', sub_bn: '১৪টি এলাকা', value: 2870, isMine: false },
      { rank: 7, name: 'Rajshahi', sub_en: '12 areas covered', sub_bn: '১২টি এলাকা', value: 2540, isMine: false },
      { rank: 8, name: 'Cumilla', sub_en: '11 areas covered', sub_bn: '১১টি এলাকা', value: 2110, isMine: false },
    ],
  },
}

// Bilingual labels for the browsable places (drives the breadcrumb selector).
export const PLACE_LABEL = {
  Dhanmondi: ['Dhanmondi', 'ধানমন্ডি'], Mirpur: ['Mirpur', 'মিরপুর'], Uttara: ['Uttara', 'উত্তরা'],
  Dhaka: ['Dhaka', 'ঢাকা'], Chattogram: ['Chattogram', 'চট্টগ্রাম'], Gazipur: ['Gazipur', 'গাজীপুর'],
  Bangladesh: ['Bangladesh', 'বাংলাদেশ'],
}

export const LEADERBOARD = [
  { rank: 1, handle: 'Anon · AG', district: 'Dhanmondi', tests: 412, xp: 5240, me: false },
  { rank: 2, handle: 'Kamrul H.', district: 'Dhanmondi', tests: 298, xp: 3815, me: false },
  { rank: 3, handle: 'Anon · DI', district: 'Dhanmondi', tests: 87, xp: 450, me: true },
  { rank: 4, handle: 'Anon · BL', district: 'Dhanmondi', tests: 71, xp: 412, me: false },
  { rank: 5, handle: 'Sumaiya R.', district: 'Dhanmondi', tests: 64, xp: 380, me: false },
  { rank: 6, handle: 'Anon · DI', district: 'Dhanmondi', tests: 58, xp: 310, me: false },
  { rank: 7, handle: 'Nasir A.', district: 'Dhanmondi', tests: 49, xp: 285, me: false },
  { rank: 8, handle: 'Anon · GP', district: 'Dhanmondi', tests: 44, xp: 260, me: false },
];

export const HISTORY_SEED = [
  { id: 'h1', when: '18 May · 23:39', isoDate: '2026-05-18T23:39:00', isp: 'Dot Internet', advertisedDown: 50, advertisedUp: 10, down: 46.4, up: 10.9, lat: 24, jitter: 3, loss: 0.1, dns: 86, webLoad: 1.4, delivered: 93, district: 'Dhanmondi', networkType: 'WiFi', locationSource: 'GPS', submitted: true, submissionId: 'BD2026-4471' },
  { id: 'h2', when: '17 May · 09:12', isoDate: '2026-05-17T09:12:00', isp: 'Dot Internet', advertisedDown: 50, advertisedUp: 10, down: 32.1, up: 8.2, lat: 31, jitter: 5, loss: 0.4, dns: 102, webLoad: 1.9, delivered: 64, district: 'Dhanmondi', networkType: 'WiFi', locationSource: 'GPS', submitted: true, submissionId: 'BD2026-4358', flagged: true },
  { id: 'h3', when: '15 May · 20:48', isoDate: '2026-05-15T20:48:00', isp: 'GrameenPhone', advertisedDown: 25, advertisedUp: 8, down: 18.7, up: 6.1, lat: 42, jitter: 4, loss: 0.2, dns: 95, webLoad: 1.6, delivered: 75, district: 'Dhanmondi', networkType: '4G', locationSource: 'GPS', submitted: true, submissionId: 'BD2026-4203' },
  { id: 'h4', when: '14 May · 14:02', isoDate: '2026-05-14T14:02:00', isp: 'Dot Internet', advertisedDown: 50, advertisedUp: 10, down: 48.0, up: 10.5, lat: 22, jitter: 2, loss: 0.1, dns: 78, webLoad: 1.3, delivered: 96, district: 'Mirpur', networkType: 'WiFi', locationSource: 'Manual', submitted: true, submissionId: 'BD2026-4087' },
  { id: 'h5', when: '12 May · 11:38', isoDate: '2026-05-12T11:38:00', isp: 'Banglalink', advertisedDown: 30, advertisedUp: 10, down: 22.5, up: 7.9, lat: 38, jitter: 6, loss: 0.3, dns: 110, webLoad: 1.8, delivered: 75, district: 'Dhanmondi', networkType: '4G', locationSource: 'GPS', submitted: true, submissionId: 'BD2026-3941' },
  { id: 'h6', when: '10 May · 19:22', isoDate: '2026-05-10T19:22:00', isp: 'Dot Internet', advertisedDown: 50, advertisedUp: 10, down: 28.4, up: 7.2, lat: 35, jitter: 5, loss: 0.5, dns: 115, webLoad: 2.1, delivered: 57, district: 'Dhanmondi', networkType: 'WiFi', locationSource: 'GPS', submitted: true, submissionId: 'BD2026-3812', flagged: true },
  { id: 'h7', when: '08 May · 08:15', isoDate: '2026-05-08T08:15:00', isp: 'GrameenPhone', advertisedDown: 25, advertisedUp: 8, down: 21.3, up: 6.8, lat: 38, jitter: 4, loss: 0.2, dns: 89, webLoad: 1.5, delivered: 85, district: 'Gulshan', networkType: '4G', locationSource: 'GPS', submitted: true, submissionId: 'BD2026-3654' },
  { id: 'h8', when: '05 May · 22:01', isoDate: '2026-05-05T22:01:00', isp: 'Dot Internet', advertisedDown: 50, advertisedUp: 10, down: 44.8, up: 10.2, lat: 26, jitter: 3, loss: 0.1, dns: 82, webLoad: 1.4, delivered: 90, district: 'Dhanmondi', networkType: 'WiFi', locationSource: 'GPS', submitted: true, submissionId: 'BD2026-3489' },
  { id: 'h9', when: '02 May · 17:45', isoDate: '2026-05-02T17:45:00', isp: 'Robi', advertisedDown: 20, advertisedUp: 6, down: 11.2, up: 4.1, lat: 52, jitter: 8, loss: 0.6, dns: 128, webLoad: 2.4, delivered: 56, district: 'Dhanmondi', networkType: '4G', locationSource: 'GPS', submitted: true, submissionId: 'BD2026-3274', flagged: true },
  { id: 'h10', when: '28 Apr · 10:30', isoDate: '2026-04-28T10:30:00', isp: 'Dot Internet', advertisedDown: 50, advertisedUp: 10, down: 47.1, up: 10.7, lat: 25, jitter: 3, loss: 0.1, dns: 84, webLoad: 1.4, delivered: 94, district: 'Dhanmondi', networkType: 'WiFi', locationSource: 'GPS', submitted: true, submissionId: 'BD2026-3098' },
  { id: 'h11', when: '24 Apr · 13:18', isoDate: '2026-04-24T13:18:00', isp: 'GrameenPhone', advertisedDown: 25, advertisedUp: 8, down: 19.5, up: 6.4, lat: 41, jitter: 5, loss: 0.3, dns: 98, webLoad: 1.7, delivered: 78, district: 'Cumilla', networkType: '4G', locationSource: 'GPS', submitted: true, submissionId: 'BD2026-2865' },
  { id: 'h12', when: '20 Apr · 21:55', isoDate: '2026-04-20T21:55:00', isp: 'Dot Internet', advertisedDown: 50, advertisedUp: 10, down: 30.2, up: 8.1, lat: 32, jitter: 4, loss: 0.3, dns: 105, webLoad: 1.9, delivered: 60, district: 'Dhanmondi', networkType: 'WiFi', locationSource: 'GPS', submitted: false, submissionId: null, flagged: true },
  { id: 'h13', when: '15 Apr · 16:10', isoDate: '2026-04-15T16:10:00', isp: 'Banglalink', advertisedDown: 30, advertisedUp: 10, down: 24.8, up: 8.2, lat: 36, jitter: 5, loss: 0.2, dns: 95, webLoad: 1.6, delivered: 83, district: 'Dhanmondi', networkType: '4G', locationSource: 'GPS', submitted: true, submissionId: 'BD2026-2521' },
  { id: 'h14', when: '10 Apr · 12:00', isoDate: '2026-04-10T12:00:00', isp: 'Dot Internet', advertisedDown: 50, advertisedUp: 10, down: 45.5, up: 10.4, lat: 23, jitter: 3, loss: 0.1, dns: 81, webLoad: 1.3, delivered: 91, district: 'Sylhet', networkType: 'WiFi', locationSource: 'Manual', submitted: true, submissionId: 'BD2026-2287' },
  { id: 'h15', when: '05 Apr · 09:45', isoDate: '2026-04-05T09:45:00', isp: 'GrameenPhone', advertisedDown: 25, advertisedUp: 8, down: 22.0, up: 7.0, lat: 39, jitter: 4, loss: 0.2, dns: 91, webLoad: 1.5, delivered: 88, district: 'Chittagong', networkType: '4G', locationSource: 'GPS', submitted: true, submissionId: 'BD2026-2054' },
];

export const NOTIFICATIONS_SEED = [
  { id: 'n1', kind: 'streak', when: 'Today · 18:30', read: false,
    title_en: 'Your 7-day streak ends in 4 hours',
    title_bn: 'আপনার ৭ দিনের স্ট্রিক ৪ ঘণ্টায় শেষ হবে',
    body_en: 'Run a 12-second Quick test to keep it alive.',
    body_bn: '১২ সেকেন্ডের কুইক টেস্ট চালিয়ে স্ট্রিক ধরে রাখুন।',
    deepLink: 'home' },
  { id: 'n2', kind: 'regulatory', when: 'Today · 11:02', read: false,
    title_en: 'BTRC accepted your complaint as evidence',
    title_bn: 'BTRC আপনার অভিযোগ প্রমাণ হিসেবে গ্রহণ করেছে',
    body_en: 'Complaint #C-2026-0418 about Dot Internet was logged. +40 XP.',
    body_bn: 'অভিযোগ #C-2026-0418 ডট ইন্টারনেটের বিরুদ্ধে নথিভুক্ত। +৪০ XP।',
    deepLink: 'history' },
  { id: 'n3', kind: 'achievement', when: 'Yesterday · 22:14', read: false,
    title_en: 'Badge earned: Night Watch',
    title_bn: 'নতুন ব্যাজ: রাতের প্রহরী',
    body_en: 'You completed 20 tests between 10pm and 6am. Silver tier.',
    body_bn: 'আপনি রাত ১০টা থেকে ৬টার মধ্যে ২০টি পরীক্ষা সম্পন্ন করেছেন।',
    deepLink: 'badges' },
  { id: 'n4', kind: 'civic', when: '2 days ago', read: true,
    title_en: 'Dhanmondi needs 3 more tests to reach the top 10 this week',
    title_bn: 'এই সপ্তাহে ধানমন্ডির শীর্ষ ১০-এ যেতে আরও ৩টি পরীক্ষা প্রয়োজন',
    body_en: 'Your tests count toward the district leaderboard.',
    body_bn: 'আপনার পরীক্ষা জেলা লিডারবোর্ডে গণনা হবে।',
    deepLink: 'leaderboard' },
  { id: 'n5', kind: 'mission', when: '3 days ago', read: true,
    title_en: 'Weekly mission progress: 3 of 5 Full QoS tests',
    title_bn: 'সাপ্তাহিক মিশন: ৫টির মধ্যে ৩টি সম্পন্ন',
    body_en: '2 more Full QoS tests to earn +150 XP.',
    body_bn: '+১৫০ XP-এর জন্য আরও ২টি Full QoS পরীক্ষা।',
    deepLink: 'missions' },
  { id: 'n6', kind: 'test', when: '17 May · 09:14', read: true,
    title_en: 'Package mismatch flagged — Dot Internet',
    title_bn: 'প্যাকেজ অসঙ্গতি চিহ্নিত — ডট ইন্টারনেট',
    body_en: 'You got 64% of advertised speed. +50 XP. Saved as BTRC evidence.',
    body_bn: 'আপনি প্রচারিত গতির ৬৪% পেয়েছেন। +৫০ XP।',
    deepLink: 'history' },
  { id: 'n7', kind: 'achievement', when: '20 Apr · 14:30', read: true,
    title_en: 'Level up: Signal Scout',
    title_bn: 'লেভেল আপ: সিগন্যাল স্কাউট',
    body_en: 'You unlocked Level 3. Keep contributing to reach District Watcher.',
    body_bn: 'আপনি লেভেল ৩ আনলক করেছেন।',
    deepLink: 'about' },
];

// Past XP redemptions for the returning user — powers the Rewards → History tab.
// `status`: 'active' (redeemed, code still usable) · 'used' · 'expired'.
export const REDEMPTIONS_SEED = [
  { id: 'rd1', cat: 'internet', title: '1 GB', sub_en: 'Mobile data', sub_bn: 'মোবাইল ডেটা',
    cost: 360, code: 'BTRC-NET-7K2M9', isoDate: '2026-05-28T19:12:00', status: 'active' },
  { id: 'rd2', cat: 'sms', title: '120 SMS', sub_en: 'Any operator', sub_bn: 'যেকোনো অপারেটর',
    cost: 160, code: 'BTRC-SMS-4QX8R', isoDate: '2026-05-14T10:45:00', status: 'used' },
  { id: 'rd3', cat: 'voice', title: '30 min', sub_en: 'Any operator', sub_bn: 'যেকোনো অপারেটর',
    cost: 180, code: 'BTRC-VOX-1ABZ6', isoDate: '2026-04-22T08:30:00', status: 'expired' },
];