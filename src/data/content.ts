export const content = {
  meta: {
    title: 'Zakir Hossen — solo founder building software in the open',
    description:
      'Bangladeshi solo founder building JuggleHire, Schedule & Chill and ShipTell under Lomeyo, LLC. Built in the open, with real numbers and real failures.',
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
      'Model Context Protocol (MCP)',
      'Claude Code',
      'AI coding agents',
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
        descEn: 'A free social media scheduler your AI tools can post through, by MCP server or REST API.',
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
      title: 'Projects by Zakir Hossen: JuggleHire, Schedule & Chill',
      description:
        'Software I build and run alone under Lomeyo, LLC: JuggleHire (recruitment software), Schedule & Chill (social scheduling), ShipTell and LomeyoLabs.',
    },
    // The page's <lastmod> in the sitemap. Bump it when this section changes.
    updated: '2026-10-07',
    heading: 'Projects',
    // Every fact below comes from the product's own facts file in the shared
    // context repo (jugglehire.md, snchill.md, shiptell.md, lomeyo.md) or from
    // the live product site. No prices here: they change, and they belong on
    // the product sites.
    intro:
      'Everything here is built, shipped and supported by me. No team, no funding, no outside investors. Each one is live in production, and I write about what works and what does not as I go.',
    items: [
      {
        name: 'JuggleHire',
        href: 'https://jugglehire.com',
        category: 'Recruitment software',
        status: 'Live — main product',
        descEn:
          'Recruitment software for small hiring teams. Post jobs, run a branded career page, move candidates through a pipeline, schedule interviews and send offer letters for e-signature. This is where most of my working hours go, and the product I share the most numbers about.',
        role: 'Founder. Development started in July 2023; I have run it alone since November 2025.',
        stack: 'Laravel 13, PHP 8.4, Inertia and React 19, Mantine UI, Tailwind CSS. Hosted on Laravel Cloud.',
        facts: [
          'First public launch on Product Hunt in February 2024, with two more launches in 2026.',
          'A public jobs board at jugglehire.com/jobs, shipped September 2026.',
          'A small internal MCP server, built with Laravel MCP, that AI agents use to look up customers (read-only).',
        ],
      },
      {
        name: 'Schedule & Chill',
        href: 'https://schedulenchill.com',
        category: 'Social media scheduling',
        status: 'Live — free',
        descEn:
          'A free social media scheduler your AI tools can post through. Write a post, add media, then schedule it or publish it now, from the dashboard or from Claude, Cursor or any other MCP client. LinkedIn, YouTube, Bluesky and Mastodon are live.',
        role: 'Founder. I built it and run it alone.',
        stack: 'Laravel 13, PHP 8.4, Inertia and React 19, Mantine UI, Tailwind CSS v4.',
        facts: [
          'An MCP server with 22 tools, 4 resources and 2 prompts, reachable with an API token or over OAuth 2.1.',
          'Listed on the official MCP Registry since September 2026.',
          'A full REST API with the same capabilities as the dashboard, and a media library for images, PDFs and video.',
        ],
      },
      {
        name: 'ShipTell',
        href: 'https://shiptell.com',
        category: 'Customer support for software teams',
        status: 'Live',
        descEn:
          'Customer support built on top of your GitHub activity. It writes changelogs from pull requests and commits, runs a shared inbox, live chat and email tickets, and keeps a public roadmap that tells voters when their request ships.',
        role: 'Founder. I built it and run it alone.',
        stack: 'Laravel 13, PHP 8.4, Inertia, React 19 and TypeScript, Laravel Reverb for live chat, OpenAI models through the Laravel AI SDK.',
        facts: [
          'An MCP server for changelogs, the inbox, the knowledge base and the roadmap.',
        ],
      },
      {
        name: 'LomeyoLabs',
        href: 'https://lomeyolabs.com',
        category: 'Templates & self-hosted software',
        status: 'Live — maintenance mode',
        descEn:
          'Web templates, tools and self-hosted software sold as one-time purchases. It used to be called Templatecookie. The oldest thing I run, and the business that funded everything after it.',
        role: 'Founder.',
        stack: '',
        facts: ['40+ products and 1,300+ sales on Envato\'s CodeCanyon marketplace.'],
      },
    ],
    parent: {
      name: 'Lomeyo, LLC',
      href: 'https://lomeyo.com',
      descEn:
        'The US company (a Delaware LLC) behind every product above, run from Bangladesh. 100% bootstrapped: no funding, no co-founder, no shortcuts.',
    },
    howIBuild:
      'All three SaaS products run on the same stack, Laravel with Inertia and React, and I build them with AI coding agents every day. Three of them have MCP servers. What I learn doing that ends up in the writing:',
  },

  // ---- /now ---------------------------------------------------------------
  // A "now page" (nownownow.com convention): what I am focused on at this point
  // in time, not a resume. Update `updated` whenever the items change — a stale
  // now page is worse than none.
  now: {
    meta: {
      title: 'What Zakir Hossen Is Working On Now',
      description:
        'A current snapshot of what I am focused on as a solo founder — the products I am building, what I am learning, and what I am deliberately ignoring.',
    },
    heading: 'What I am doing now',
    updated: '2026-10-07',
    intro:
      'This is a now page — a snapshot of what actually has my attention today, not a list of everything I have ever done. I update it when the focus genuinely changes.',
    sections: [
      {
        title: 'Building',
        items: [
          'Growing JuggleHire, my recruitment software for small teams. Talking to customers every week and shipping what they ask for, not what I find interesting.',
          'Running Schedule & Chill as a free product: a social media scheduler your AI tools can post through. Its MCP server has been on the official MCP Registry since September 2026.',
          'Keeping ShipTell live alongside both.',
        ],
      },
      {
        title: 'Writing',
        items: [
          'Writing up what I learn shipping MCP servers and working with AI coding agents every day: what broke, what I changed, and what the docs leave out.',
        ],
      },
      {
        title: 'Distribution',
        items: [
          'SEO and content as the primary channel, on every one of my sites, every week. Ranking in Google and in AI search engines like ChatGPT, Perplexity and Claude.',
          'Building in public on LinkedIn and X in English, and on YouTube and Facebook in Bangla.',
          'One channel at a time. Time is the constraint, so focus beats breadth.',
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
