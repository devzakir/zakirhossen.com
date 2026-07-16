export const content = {
  meta: {
    title: 'Zakir Hossen — solo founder building software in the open',
    description:
      'Bangladeshi solo founder building software products under Lomeyo, LLC — JuggleHire, Schedule & Chill, and more. Built in the open, real numbers, real failures.',
    url: 'https://devzakir.com',
    ogImage: '/og.png',
  },
  hero: {
    name: 'Zakir Hossen',
    headlineEn: 'Bangladeshi solo founder building software products in the open.',
    accentBn: 'গ্রাম থেকে, শূন্য থেকে — ধীরে, সৎভাবে, ধৈর্য ধরে।',
  },
  fights: [
    { en: 'Married young. Never let go of the dream.', bn: 'অল্প বয়সে বিয়ে করেছি — তবু স্বপ্ন ছাড়িনি।' },
    { en: 'Learning every day. For life.', bn: 'প্রতিদিন শিখি, সারাজীবন শিখব।' },
    { en: 'Character is built slowly, never rushed.', bn: 'চরিত্র গড়ে ধীরে, তাড়াহুড়ো করে নয়।' },
    { en: 'From zero to wealth — no degree, no funding.', bn: 'শূন্য থেকে সম্পদ — কোনো ডিগ্রি নেই, কোনো ফান্ডিং নেই।' },
    { en: 'Everything in the open — real numbers, real failures.', bn: 'সবকিছু খোলাখুলি — আসল সংখ্যা, আসল ব্যর্থতা।' },
  ],
  building: {
    primary: [
      {
        name: 'JuggleHire',
        descEn: 'Simple recruitment software for small teams and startups. My main product — grown in the open, real numbers shared.',
        href: 'https://jugglehire.com',
      },
      {
        name: 'Schedule & Chill',
        descEn: 'A social scheduling API for developers and AI agents. Buffer for the AI era.',
        href: 'https://schedulenchill.com',
      },
    ],
    parent: {
      name: 'Lomeyo, LLC',
      descEn: 'The company behind them all. 100% bootstrapped — no funding, no shortcuts.',
      href: 'https://lomeyo.com',
    },
    also: [
      { name: 'ShipTell', href: 'https://shiptell.com' },
      { name: 'LomeyoLabs', href: 'https://lomeyolabs.com' },
    ],
  },
  story: {
    en: "From Tarakanda, a village in Mymensingh, Bangladesh. SSC pass, dropped out of a diploma — then 10+ years teaching myself to build software. Married at 22, two sons, a paralyzed father to care for. In 2024 I was 450,000 BDT in debt. I climbed out. Today I'm the solo founder of Lomeyo, LLC — building software products in the open, working toward a million by the end of 2027.",
    accentBn: 'ধীরে, সৎভাবে, ধৈর্য ধরে — এটাই আমার পথ।',
  },
  follow: {
    founder: {
      label: 'Building in public — English',
      channels: [
        { label: 'LinkedIn', note: 'Founder journey, build updates, real numbers.', href: 'https://www.linkedin.com/in/devzakir' },
        { label: 'X', note: 'Daily build updates and screenshots.', href: 'https://x.com/devzakir' },
        { label: 'YouTube', note: 'English videos — building software, solo.', href: 'https://youtube.com/@devzakir' },
      ],
    },
    bhai: {
      label: 'বাংলায় — জীবন ও কাজ',
      channels: [
        { label: 'YouTube', note: 'বাংলা ভিডিও — শৃঙ্খলা, দ্বীন, উদ্যোক্তা জীবন।', href: 'https://youtube.com/@devzakirbhai' },
        { label: 'Facebook', note: 'প্রতিদিনের জীবন ও কাজের গল্প।', href: 'https://facebook.com/devzakirbhai' },
        { label: 'Instagram', note: 'ছোট ভিডিও, রিলস।', href: 'https://instagram.com/devzakirbhai' },
        { label: 'TikTok', note: 'ছোট ক্লিপ — খোলাখুলি বিল্ডিং।', href: 'https://tiktok.com/@devzakirbhai' },
      ],
    },
  },
  footer: {
    email: 'zakir@lomeyo.com',
  },
} as const;

export type Content = typeof content;
