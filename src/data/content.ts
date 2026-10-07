export const content = {
  meta: {
    title: 'Zakir Hossen — solo founder building software in the open',
    description:
      'Bangladeshi solo founder building software products under Lomeyo, LLC — JuggleHire, Schedule & Chill, and more. Built in the open, real numbers, real failures.',
    url: 'https://zakirhossen.com',
    ogImage: '/og-v1.png',
    // The homepage's <lastmod> in the sitemap. Bump it when the homepage copy
    // changes. New posts bump it on their own (the newest post date wins).
    updated: '2026-10-07',
  },

  // Machine-readable identity. Feeds the Person JSON-LD — the thing Google's
  // entity graph and AI search engines actually read. Keep sameAs exhaustive:
  // every profile listed here is one more link in the "this is the same human"
  // chain. Order matters little; completeness does.
  identity: {
    name: 'Zakir Hossen',
    // Both handles are declared: the English/founder lane is `devzakir`, the
    // Bangla/life lane is `devzakirbhai`. Listing both tells search engines
    // they are one person, not two.
    handle: ['devzakir', 'devzakirbhai'],
    jobTitle: 'Founder & Software Engineer',
    birthPlace: 'Tarakanda, Mymensingh, Bangladesh',
    country: 'Bangladesh',
    knowsAbout: [
      'Bootstrapped SaaS',
      'Solo founder',
      'Recruitment software',
      'Applicant tracking systems',
      'Laravel',
      'Building in public',
      'Product-led growth',
      'Software engineering',
    ],
    sameAs: [
      'https://www.linkedin.com/in/devzakir',
      'https://x.com/devzakir',
      'https://github.com/devzakir',
      'https://youtube.com/@devzakir',
      'https://youtube.com/@devzakirbhai',
      'https://facebook.com/devzakirbhai',
      'https://instagram.com/devzakirbhai',
      'https://tiktok.com/@devzakirbhai',
    ],
  },

  // Trailing slashes are deliberate: Astro builds directory-style output and
  // Cloudflare Pages 308-redirects "/now" → "/now/". Linking to the slashed
  // form keeps every internal link a single hop and matches the sitemap.
  nav: [
    { label: 'Home', href: '/' },
    { label: 'Writing', href: '/writing/' },
    { label: 'Projects', href: '/projects/' },
    { label: 'Now', href: '/now/' },
  ],
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
  // ---- /projects ----------------------------------------------------------
  // Each entry becomes a SoftwareApplication node in the page's JSON-LD, so
  // `category` and `status` are not decoration — they end up in the markup.
  projects: {
    meta: {
      title: 'Projects — software I build as a solo founder | Zakir Hossen',
      description:
        'Every software product I build and run solo under Lomeyo, LLC — JuggleHire (recruitment software), Schedule & Chill (social scheduling API), ShipTell, and LomeyoLabs.',
    },
    // The page's <lastmod> in the sitemap. Bump it when this section changes.
    updated: '2026-07-26',
    heading: 'Projects',
    intro:
      "Everything here is built, shipped, and supported by one person — me. No team, no funding, no outside investors. Each one is a real product with real customers, not a side experiment. I write about what works and what doesn't as I go.",
    items: [
      {
        name: 'JuggleHire',
        href: 'https://jugglehire.com',
        category: 'Recruitment software',
        status: 'Live — main product',
        descEn:
          'Simple applicant tracking and recruitment software for small teams and startups. Post jobs, build a branded career page, screen candidates, and hire without an enterprise ATS. This is where most of my working hours go, and the product I share the most numbers about.',
      },
      {
        name: 'Schedule & Chill',
        href: 'https://schedulenchill.com',
        category: 'Developer API',
        status: 'Live',
        descEn:
          'A social media scheduling API for developers and AI agents. Instead of a dashboard you log into, it is an API and MCP server your code or your agent calls directly. Buffer for the AI era.',
      },
      {
        name: 'ShipTell',
        href: 'https://shiptell.com',
        category: 'Customer communication',
        status: 'Live',
        descEn:
          'Customer communication for developers — changelogs, product updates, and release notes that reach the people who actually use what you ship.',
      },
      {
        name: 'LomeyoLabs',
        href: 'https://lomeyolabs.com',
        category: 'Templates & tools',
        status: 'Live',
        descEn:
          'Web templates and developer tools. The oldest thing I run, and the business that funded everything after it.',
      },
    ],
    parent: {
      name: 'Lomeyo, LLC',
      href: 'https://lomeyo.com',
      descEn:
        'The US company behind every product above. 100% bootstrapped — no funding, no co-founder, no shortcuts.',
    },
  },

  // ---- /now ---------------------------------------------------------------
  // A "now page" (nownownow.com convention): what I am focused on at this point
  // in time, not a resume. Update `updated` whenever the items change — a stale
  // now page is worse than none.
  now: {
    meta: {
      title: 'What I am working on now | Zakir Hossen',
      description:
        'A current snapshot of what I am focused on as a solo founder — the products I am building, what I am learning, and what I am deliberately ignoring.',
    },
    heading: 'What I am doing now',
    updated: '2026-07-26',
    intro:
      'This is a now page — a snapshot of what actually has my attention today, not a list of everything I have ever done. I update it when the focus genuinely changes.',
    sections: [
      {
        title: 'Building',
        items: [
          'Growing JuggleHire — recruitment software for small teams. Talking to customers every week and shipping what they ask for, not what I find interesting.',
          'Running Schedule & Chill and ShipTell as live products alongside it.',
        ],
      },
      {
        title: 'Distribution',
        items: [
          'SEO and content as the primary channel — ranking in Google and in AI search engines like ChatGPT, Perplexity, and Claude.',
          'Building in public on LinkedIn and X in English, and on YouTube and Facebook in Bangla.',
          'Cold email and paid ads are deliberately off the table. Time is the constraint, so focus beats breadth.',
        ],
      },
      {
        title: 'Life',
        items: [
          'Family first — my wife, my two sons, and caring for my father.',
          'Learning every day and staying consistent with training and routine. Slow, honest, patient.',
        ],
      },
    ],
    accentBn: 'ধীরে, সৎভাবে, ধৈর্য ধরে — এটাই আমার পথ।',
  },

  footer: {
    email: 'zakir@lomeyo.com',
  },
} as const;

export type Content = typeof content;
