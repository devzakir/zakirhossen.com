# devzakir.com Personal Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Bangla-first, one-page personal site for Zakir Hossen at devzakir.com — a manifesto + outbound links — as a static Astro site deployable to Cloudflare Pages.

**Architecture:** Astro static site. All copy lives in one typed content module (`src/data/content.ts`) so wording edits never touch layout. The page is composed of small section components rendered by a single `index.astro`. A shared `Layout.astro` owns `<head>` SEO, self-hosted Bangla font, and light/dark theming. A `check.mjs` node script is the programmatic test: it builds the site and asserts required strings/tags exist in `dist/`.

**Tech Stack:** Astro 7, Tailwind CSS v4 (via `@tailwindcss/vite`), `@astrojs/sitemap`, TypeScript, self-hosted Noto Sans Bengali (woff2). Host: Cloudflare Pages.

## Global Constraints

- Node 20+ (dev machine has v23). Package manager: `npm`.
- Astro `7.0.7`, Tailwind CSS `4.3.2`, `@tailwindcss/vite` `4.3.2`, `@astrojs/sitemap` `3.7.3` — pin these floors.
- Tailwind v4 is configured via the Vite plugin + a single `@import "tailwindcss";` in CSS. Do NOT create a `tailwind.config.js` or use `@astrojs/tailwind` (obsolete in v4).
- Site URL is `https://devzakir.com` — set as `site` in `astro.config.mjs`.
- Bangla text blocks MUST carry `lang="bn"`; the English bridge line MUST carry `lang="en"`. Root `<html lang="bn">`.
- Bangla font is self-hosted (woff2 in `public/fonts/`) — NO external font CDN (Google Fonts link).
- All copy comes from `src/data/content.ts`. No hardcoded copy inside components.
- v1 is one page + links only. NO blog, CMS, auth, database, comments. (Writing section is v2 — out of scope.)
- Mobile-first, light + dark mode, calm/spacious aesthetic (no countdown timers, no neon CTAs).

---

### Task 1: Scaffold Astro + Tailwind v4 + build check harness

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`, `src/styles/global.css`, `src/pages/index.astro`, `check.mjs`, `.gitignore`
- Test: `check.mjs`

**Interfaces:**
- Produces: a working `npm run build` that emits `dist/index.html`; `npm run check` that runs `check.mjs` against `dist/`.

- [ ] **Step 1: Write the failing test (`check.mjs`)**

```js
// check.mjs — build-output assertions. Run AFTER `npm run build`.
import { readFileSync, existsSync } from 'node:fs';

const fail = (m) => { console.error('FAIL:', m); process.exitCode = 1; };
const ok = (m) => console.log('ok -', m);

if (!existsSync('dist/index.html')) {
  fail('dist/index.html missing — did you run `npm run build`?');
  process.exit(1);
}
const html = readFileSync('dist/index.html', 'utf8');

const must = [
  ['<html lang="bn"', 'root html lang=bn'],
];
for (const [needle, label] of must) {
  html.includes(needle) ? ok(label) : fail(`${label} — missing: ${needle}`);
}
if (process.exitCode) { console.error('\nCHECK FAILED'); } else { console.log('\nCHECK PASSED'); }
```

- [ ] **Step 2: Create `package.json`**

```json
{
  "name": "devzakir",
  "type": "module",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "check": "node check.mjs"
  },
  "dependencies": {
    "astro": "^7.0.7",
    "@astrojs/sitemap": "^3.7.3",
    "@tailwindcss/vite": "^4.3.2",
    "tailwindcss": "^4.3.2"
  }
}
```

- [ ] **Step 3: Create `astro.config.mjs`**

```js
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://devzakir.com',
  integrations: [sitemap()],
  vite: { plugins: [tailwindcss()] },
});
```

- [ ] **Step 4: Create `tsconfig.json`**

```json
{ "extends": "astro/tsconfigs/strict" }
```

- [ ] **Step 5: Create `src/styles/global.css`**

```css
@import "tailwindcss";
```

- [ ] **Step 6: Create `.gitignore`**

```
node_modules/
dist/
.astro/
.DS_Store
```

- [ ] **Step 7: Create a minimal `src/pages/index.astro` (proves the toolchain)**

```astro
---
import '../styles/global.css';
---
<html lang="bn">
  <head><meta charset="utf-8" /><title>Zakir Hossen</title></head>
  <body class="bg-white text-neutral-900"><h1 class="text-2xl">জাকির হোসেন</h1></body>
</html>
```

- [ ] **Step 8: Install and build**

Run: `npm install && npm run build`
Expected: build succeeds, `dist/index.html` created.

- [ ] **Step 9: Run the check — expect PASS**

Run: `npm run check`
Expected: `CHECK PASSED` (root `html lang="bn"` present).

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "chore: scaffold astro + tailwind v4 + build check"
```

---

### Task 2: Content module (all copy, Bangla + English)

**Files:**
- Create: `src/data/content.ts`
- Test: `check.mjs` (extend)

**Interfaces:**
- Produces: `export const content` with this shape (later tasks import these exact keys):
  - `content.meta`: `{ title: string; description: string; url: string; ogImage: string }`
  - `content.hero`: `{ name: string; fightBn: string; bridgeEn: string }`
  - `content.fights`: `Array<{ bn: string }>` (5 items)
  - `content.building`: `Array<{ name: string; descBn: string; href: string }>`
  - `content.story`: `{ bn: string }`
  - `content.follow`: `Array<{ label: string; noteBn: string; href: string }>`
  - `content.footer`: `{ email: string }`

- [ ] **Step 1: Extend `check.mjs` with content assertions**

Add before the final summary block:

```js
const fights = [
  'অল্প বয়সে বিয়ে করেছি',
  'প্রতিদিন শিখি',
  'চরিত্র গড়ে ধীরে',
  'শূন্য থেকে সম্পদ',
  'সবকিছু খোলাখুলি',
];
for (const f of fights) {
  html.includes(f) ? ok(`fight: ${f}`) : fail(`fight missing: ${f}`);
}
for (const h of ['jugglehire.com', 'linkedin.com/in/devzakir']) {
  html.includes(h) ? ok(`link: ${h}`) : fail(`link missing: ${h}`);
}
```

- [ ] **Step 2: Run check — expect FAIL**

Run: `npm run build && npm run check`
Expected: FAIL (fights/links not on the page yet).

- [ ] **Step 3: Create `src/data/content.ts`**

```ts
export const content = {
  meta: {
    title: 'জাকির হোসেন — ধীরে, সৎভাবে, ধৈর্য ধরে গড়ে তোলা',
    description:
      'গ্রাম থেকে, শূন্য থেকে গড়ে তোলা এক সোলো ফাউন্ডারের গল্প। JuggleHire ও Lomeyo LLC-এর নির্মাতা জাকির হোসেন।',
    url: 'https://devzakir.com',
    ogImage: '/og.png',
  },
  hero: {
    name: 'জাকির হোসেন',
    fightBn: 'গ্রাম থেকে, শূন্য থেকে — ধীরে, সৎভাবে, ধৈর্য ধরে গড়ে তুলছি।',
    bridgeEn: 'Bangladeshi solo founder building global SaaS — in the open.',
  },
  fights: [
    { bn: 'অল্প বয়সে বিয়ে করেছি — তবু স্বপ্ন ছাড়িনি।' },
    { bn: 'প্রতিদিন শিখি, সারাজীবন শিখব।' },
    { bn: 'চরিত্র গড়ে ধীরে, তাড়াহুড়ো করে নয়।' },
    { bn: 'শূন্য থেকে সম্পদ — কোনো ডিগ্রি নেই, কোনো ফান্ডিং নেই।' },
    { bn: 'সবকিছু খোলাখুলি — আসল সংখ্যা, আসল ব্যর্থতা।' },
  ],
  building: [
    {
      name: 'JuggleHire',
      descBn: 'ছোট দল ও স্টার্টআপের জন্য সহজ রিক্রুটমেন্ট CRM। আমার মূল পণ্য।',
      href: 'https://jugglehire.com',
    },
    {
      name: 'Lomeyo LLC',
      descBn: 'আমার সফটওয়্যার কোম্পানি — প্রতি মাসে নতুন পণ্য বানাই, খোলাখুলি।',
      href: 'https://lomeyo.com',
    },
  ],
  story: {
    bn: 'ময়মনসিংহের তারাকান্দা গ্রাম থেকে। SSC পাস, ডিপ্লোমা অসমাপ্ত — ১০+ বছর নিজে নিজে শেখা সফটওয়্যার ইঞ্জিনিয়ার। ২২ বছরে বিয়ে, দুই ছেলে, প্যারালাইজড বাবা। ৪.৫ লাখ টাকা দেনা থেকে ঘুরে দাঁড়িয়েছি। এখন Lomeyo LLC-এর সোলো ফাউন্ডার — লক্ষ্য ২০২৭ সালের মধ্যে মিলিয়নিয়ার।',
  },
  follow: [
    {
      label: 'LinkedIn',
      noteBn: 'ফাউন্ডার জার্নি, ইংরেজিতে — বিল্ড আপডেট ও সংখ্যা।',
      href: 'https://www.linkedin.com/in/devzakir',
    },
    {
      label: 'X (Twitter)',
      noteBn: 'প্রতিদিনের বিল্ড আপডেট, স্ক্রিনশট।',
      href: 'https://x.com/devzakir',
    },
    {
      label: 'YouTube',
      noteBn: 'বাংলা ভিডিও — সম্পদ, শেখা, উদ্যোক্তা জীবন।',
      href: 'https://youtube.com/@devzakir',
    },
    {
      label: 'TikTok',
      noteBn: 'ছোট ভিডিও — বিল্ডিং ইন পাবলিক।',
      href: 'https://tiktok.com/@devzakir',
    },
  ],
  footer: {
    email: 'zakir@lomeyo.com',
  },
} as const;

export type Content = typeof content;
```

- [ ] **Step 4: Commit (test still failing until Task 4 renders it — that's expected)**

```bash
git add src/data/content.ts check.mjs
git commit -m "feat: add site content module (bangla + english copy)"
```

---

### Task 3: Layout — self-hosted Bangla font, SEO head, light/dark

**Files:**
- Create: `src/layouts/Layout.astro`, `public/fonts/README.md`
- Modify: `src/styles/global.css`
- Test: `check.mjs` (extend)

**Interfaces:**
- Consumes: `content.meta` from Task 2.
- Produces: `Layout.astro` — default slot wraps page body; renders full `<head>` (title, description, OG/Twitter tags, canonical, favicon) and applies the Bangla font + theme classes to `<body>`. Root element is `<html lang="bn">`.

- [ ] **Step 1: Extend `check.mjs` with head + font assertions**

Add to the `must` array in `check.mjs`:

```js
  ['property="og:title"', 'og:title tag'],
  ['name="description"', 'meta description'],
  ['rel="canonical"', 'canonical link'],
  ['Noto Sans Bengali', 'bangla font-family referenced'],
```

- [ ] **Step 2: Run check — expect FAIL**

Run: `npm run build && npm run check`
Expected: FAIL (head tags/font not present yet).

- [ ] **Step 3: Add the self-hosted font + theme setup to `src/styles/global.css`**

```css
@import "tailwindcss";

@font-face {
  font-family: "Noto Sans Bengali";
  src: url("/fonts/noto-sans-bengali.woff2") format("woff2");
  font-weight: 100 900;
  font-display: swap;
}

:root { color-scheme: light dark; }

@theme {
  --font-bangla: "Noto Sans Bengali", system-ui, sans-serif;
}

html { font-family: var(--font-bangla); -webkit-font-smoothing: antialiased; }
```

- [ ] **Step 4: Create `public/fonts/README.md` (font-fetch instruction for the human)**

```md
# Bangla font

Place `noto-sans-bengali.woff2` here (variable weight subset).

Fetch it once:
- Download from https://fonts.google.com/noto/specimen/Noto+Sans+Bengali
  (or `npm i @fontsource-variable/noto-sans-bengali` and copy the woff2 out of
  `node_modules/@fontsource-variable/noto-sans-bengali/files/*bengali*.woff2`).
- Rename to `noto-sans-bengali.woff2`.

The build works without the file (falls back to system-ui), but SHIP with it.
```

- [ ] **Step 5: Create `src/layouts/Layout.astro`**

```astro
---
import '../styles/global.css';
import { content } from '../data/content';
const { meta } = content;
---
<html lang="bn">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{meta.title}</title>
    <meta name="description" content={meta.description} />
    <link rel="canonical" href={meta.url} />
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />

    <meta property="og:type" content="website" />
    <meta property="og:title" content={meta.title} />
    <meta property="og:description" content={meta.description} />
    <meta property="og:url" content={meta.url} />
    <meta property="og:image" content={meta.url + meta.ogImage} />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content={meta.title} />
    <meta name="twitter:description" content={meta.description} />
  </head>
  <body class="bg-white text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
    <slot />
  </body>
</html>
```

- [ ] **Step 6: Add a placeholder `public/favicon.svg`**

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="6" fill="#111"/><text x="16" y="22" font-size="18" fill="#fff" text-anchor="middle" font-family="sans-serif">Z</text></svg>
```

- [ ] **Step 7: Build + check — head/font assertions now PASS**

Run: `npm run build && npm run check`
Expected: og:title, description, canonical, and `Noto Sans Bengali` all present. (Fights/links still fail — rendered in Task 4.)

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: layout with self-hosted bangla font, seo head, dark mode"
```

---

### Task 4: Section components + assemble the page

**Files:**
- Create: `src/components/Hero.astro`, `src/components/Fights.astro`, `src/components/Building.astro`, `src/components/Story.astro`, `src/components/Follow.astro`, `src/components/Footer.astro`
- Modify: `src/pages/index.astro`
- Test: `check.mjs` (full page now passes)

**Interfaces:**
- Consumes: `content` (Task 2), `Layout.astro` (Task 3).
- Produces: a complete `index.astro` rendering all six sections; satisfies every `check.mjs` assertion.

- [ ] **Step 1: Create `src/components/Hero.astro`**

```astro
---
import { content } from '../data/content';
const { hero } = content;
---
<header class="mx-auto max-w-2xl px-6 pt-24 pb-16 text-center">
  <img src="/zakir.jpg" alt={hero.name} width="96" height="96"
       class="mx-auto mb-6 h-24 w-24 rounded-full object-cover" />
  <h1 class="text-3xl font-bold sm:text-4xl" lang="bn">{hero.name}</h1>
  <p class="mt-4 text-xl leading-relaxed text-neutral-700 dark:text-neutral-300" lang="bn">
    {hero.fightBn}
  </p>
  <p class="mt-3 text-sm text-neutral-500" lang="en">{hero.bridgeEn}</p>
</header>
```

- [ ] **Step 2: Create `src/components/Fights.astro`**

```astro
---
import { content } from '../data/content';
const { fights } = content;
---
<section class="mx-auto max-w-2xl px-6 py-16" aria-label="What I stand for">
  <ul class="space-y-4" lang="bn">
    {fights.map((f) => (
      <li class="border-l-2 border-neutral-300 pl-4 text-lg leading-relaxed dark:border-neutral-700">
        {f.bn}
      </li>
    ))}
  </ul>
</section>
```

- [ ] **Step 3: Create `src/components/Building.astro`**

```astro
---
import { content } from '../data/content';
const { building } = content;
---
<section class="mx-auto max-w-2xl px-6 py-16">
  <h2 class="mb-6 text-sm font-semibold uppercase tracking-wide text-neutral-500" lang="bn">যা বানাচ্ছি</h2>
  <div class="space-y-4">
    {building.map((b) => (
      <a href={b.href} rel="noopener"
         class="block rounded-xl border border-neutral-200 p-5 transition hover:border-neutral-400 dark:border-neutral-800 dark:hover:border-neutral-600">
        <div class="font-semibold" lang="en">{b.name}</div>
        <div class="mt-1 text-neutral-600 dark:text-neutral-400" lang="bn">{b.descBn}</div>
      </a>
    ))}
  </div>
</section>
```

- [ ] **Step 4: Create `src/components/Story.astro`**

```astro
---
import { content } from '../data/content';
const { story } = content;
---
<section class="mx-auto max-w-2xl px-6 py-16">
  <h2 class="mb-6 text-sm font-semibold uppercase tracking-wide text-neutral-500" lang="bn">আমার গল্প</h2>
  <p class="text-lg leading-relaxed text-neutral-700 dark:text-neutral-300" lang="bn">{story.bn}</p>
</section>
```

- [ ] **Step 5: Create `src/components/Follow.astro`**

```astro
---
import { content } from '../data/content';
const { follow } = content;
---
<section class="mx-auto max-w-2xl px-6 py-16">
  <h2 class="mb-6 text-sm font-semibold uppercase tracking-wide text-neutral-500" lang="bn">যেখানে পাবেন</h2>
  <div class="space-y-3">
    {follow.map((s) => (
      <a href={s.href} rel="noopener"
         class="flex items-baseline justify-between gap-4 border-b border-neutral-200 py-3 dark:border-neutral-800">
        <span class="font-medium" lang="en">{s.label}</span>
        <span class="text-right text-sm text-neutral-500" lang="bn">{s.noteBn}</span>
      </a>
    ))}
  </div>
</section>
```

- [ ] **Step 6: Create `src/components/Footer.astro`**

```astro
---
import { content } from '../data/content';
const { footer } = content;
---
<footer class="mx-auto max-w-2xl px-6 py-16 text-center text-sm text-neutral-500">
  <a href={`mailto:${footer.email}`} lang="en">{footer.email}</a>
  <p class="mt-2" lang="en">© 2026 Zakir Hossen</p>
</footer>
```

- [ ] **Step 7: Rewrite `src/pages/index.astro` to assemble everything**

```astro
---
import Layout from '../layouts/Layout.astro';
import Hero from '../components/Hero.astro';
import Fights from '../components/Fights.astro';
import Building from '../components/Building.astro';
import Story from '../components/Story.astro';
import Follow from '../components/Follow.astro';
import Footer from '../components/Footer.astro';
---
<Layout>
  <main>
    <Hero />
    <Fights />
    <Building />
    <Story />
    <Follow />
  </main>
  <Footer />
</Layout>
```

- [ ] **Step 8: Add a placeholder `public/zakir.jpg` note**

Create `public/zakir.jpg.README.md`:

```md
Drop a real square photo named `zakir.jpg` here (min 400x400).
Build works without it (broken img icon only); SHIP with the real photo.
```

- [ ] **Step 9: Build + check — expect full PASS**

Run: `npm run build && npm run check`
Expected: `CHECK PASSED` — all 5 fights + jugglehire.com + linkedin link present.

- [ ] **Step 10: Visual review in dev**

Run: `npm run dev` → open the local URL. Confirm: Bangla renders cleanly, sections stack on mobile width, dark mode follows OS. (Font falls back to system-ui until the woff2 is dropped in — acceptable for this checkpoint.)

- [ ] **Step 11: Commit**

```bash
git add -A
git commit -m "feat: build the one-page manifesto (hero, fights, building, story, follow, footer)"
```

---

### Task 5: SEO finishing — robots, sitemap verify, OG image slot

**Files:**
- Create: `public/robots.txt`, `public/og.png.README.md`
- Test: `check.mjs` (extend for sitemap/robots in dist)

**Interfaces:**
- Consumes: sitemap integration from Task 1.
- Produces: `dist/sitemap-index.xml` (from `@astrojs/sitemap`) and `dist/robots.txt`.

- [ ] **Step 1: Extend `check.mjs` with a dist-files assertion**

Add after the `html` assertions, before the summary:

```js
for (const f of ['dist/robots.txt', 'dist/sitemap-index.xml']) {
  existsSync(f) ? ok(`file: ${f}`) : fail(`missing file: ${f}`);
}
```

- [ ] **Step 2: Run check — expect FAIL on robots.txt**

Run: `npm run build && npm run check`
Expected: FAIL (`dist/robots.txt` missing; sitemap should already exist from Task 1's integration).

- [ ] **Step 3: Create `public/robots.txt`**

```
User-agent: *
Allow: /

Sitemap: https://devzakir.com/sitemap-index.xml
```

- [ ] **Step 4: Create `public/og.png.README.md`**

```md
Add a 1200x630 `og.png` here for social share previews (referenced by content.meta.ogImage).
Build/deploy works without it; add before announcing the site publicly.
```

- [ ] **Step 5: Build + check — expect PASS**

Run: `npm run build && npm run check`
Expected: `CHECK PASSED`, including `dist/robots.txt` and `dist/sitemap-index.xml`.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: robots.txt, sitemap verification, og image slot"
```

---

### Task 6: Cloudflare Pages deploy config + final verification

**Files:**
- Create: `README.md`, `.node-version`
- Test: production build + `npm run check`

**Interfaces:**
- Consumes: the finished site.
- Produces: deploy instructions; a clean production build.

- [ ] **Step 1: Create `.node-version`**

```
20
```

- [ ] **Step 2: Create `README.md` with Cloudflare Pages settings**

```md
# devzakir.com

Bangla-first personal site. Astro 7 + Tailwind v4, static.

## Develop
    npm install
    npm run dev

## Build & self-check
    npm run build && npm run check

## Deploy — Cloudflare Pages
Connect the GitHub repo in the Cloudflare dashboard → Pages → Create → Connect to Git.
- Framework preset: **Astro**
- Build command: `npm run build`
- Build output directory: `dist`
- Node version: 20 (via `.node-version`)

Push to the default branch = auto-deploy.

### Domain
Add `devzakir.com` as a custom domain in the Pages project.
301-redirect `zakirhq.com` and `hizakir.com` → `devzakir.com` (Cloudflare Bulk Redirects).

## Before public announce (assets that ship, not code)
- `public/fonts/noto-sans-bengali.woff2` (see fonts/README.md)
- `public/zakir.jpg` (square photo)
- `public/og.png` (1200x630)
```

- [ ] **Step 3: Final production build + check**

Run: `npm run build && npm run check`
Expected: `CHECK PASSED`.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "docs: readme + cloudflare pages deploy config"
```

- [ ] **Step 5: Create GitHub repo and push (human confirms repo name)**

```bash
gh repo create devzakir --private --source=. --remote=origin --push
```

Then connect it in Cloudflare Pages per the README.

---

## Post-plan notes

- **Deferred to v2 (do not build now):** Bangla writing/essays section (markdown collection), a "Now" page, analytics.
- **Human-supplied assets** (site works without them, but ship before announcing): `noto-sans-bengali.woff2`, `zakir.jpg`, `og.png`. Each has a README placeholder so the missing asset is obvious.
- **Copy is data, not code:** all wording lives in `src/data/content.ts`. Zakir edits it directly; no component changes needed.
