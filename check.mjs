// check.mjs — build-output assertions. Run AFTER `npm run build`.
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';

const fail = (m) => { console.error('FAIL:', m); process.exitCode = 1; };
const ok = (m) => console.log('ok -', m);

// Read the canonical origin from astro.config rather than hardcoding it, so a
// domain change is a one-line edit there and these assertions still bite.
const SITE = readFileSync('astro.config.mjs', 'utf8').match(/site:\s*'([^']+)'/)?.[1];
if (!SITE) { fail('could not read `site` from astro.config.mjs'); process.exit(1); }
ok(`site origin: ${SITE}`);

if (!existsSync('dist/index.html')) {
  fail('dist/index.html missing — did you run `npm run build`?');
  process.exit(1);
}
const html = readFileSync('dist/index.html', 'utf8');

const must = [
  ['<html lang="en"', 'root html lang=en'],
  ['property="og:title"', 'og:title tag'],
  ['name="description"', 'meta description'],
  ['rel="canonical"', 'canonical link'],
  ['noto-sans-bengali-400.woff2', 'bangla @font-face src'],
];
for (const [needle, label] of must) {
  html.includes(needle) ? ok(label) : fail(`${label} — missing: ${needle}`);
}

// English-first manifesto lines (Bangla kept as accent, not asserted)
const fights = [
  'Married young',
  'Learning every day',
  'Character is built slowly',
  'From zero to wealth',
  'Everything in the open',
];
for (const f of fights) {
  html.includes(f) ? ok(`fight: ${f}`) : fail(`fight missing: ${f}`);
}
// products + both social lanes present
for (const h of [
  'jugglehire.com',
  'schedulenchill.com',
  'lomeyo.com',
  'linkedin.com/in/devzakir',
  '@devzakirbhai',
]) {
  html.includes(h) ? ok(`link: ${h}`) : fail(`link missing: ${h}`);
}

for (const f of [
  'dist/robots.txt',
  'dist/sitemap-index.xml',
  'dist/og-v1.png',                        // social cards break silently without it
  'dist/fonts/noto-sans-bengali-400.woff2', // @font-face src — 404s if absent
  // Avatar srcset. If these go missing the <source> just 404s and every visitor
  // silently falls back to the 45 KB JPEG — no error, only a slower page.
  'dist/zakir-96.webp',
  'dist/zakir-192.webp',
  'dist/zakir-288.webp',
  'dist/now/index.html',
  'dist/projects/index.html',
]) {
  existsSync(f) ? ok(`file: ${f}`) : fail(`missing file: ${f}`);
}

// The stylesheet must stay inlined. If Astro ever emits it as a <link> again the
// page still works, so nothing fails — it just quietly costs a round trip that
// blocks first paint, which is what dropped Lighthouse performance to 98.
html.includes('rel="stylesheet"')
  ? fail('stylesheet is a render-blocking <link> — build.inlineStylesheets regressed')
  : ok('stylesheet inlined (no render-blocking <link>)');

// The inlined sheet ships on EVERY page, so its size is on the critical path of
// every request. Tailwind v4 auto-detects content from the project root, which
// includes the `context` submodule; one markdown file in there once added 20 KB
// of utilities for an unrelated project. `source("../")` in global.css pins the
// scan to src/ — this guard is what tells you if that ever comes undone.
const styleBlock = html.match(/<style>([\s\S]*?)<\/style>/);
if (!styleBlock) {
  fail('no inlined <style> block on /');
} else {
  const kb = styleBlock[1].length;
  kb > 20000
    ? fail(`inlined stylesheet is ${kb} bytes — over 20 KB means Tailwind is scanning outside src/`)
    : ok(`inlined stylesheet ${kb} bytes (under the 20 KB budget)`);

  // The Bangla face carries no Latin glyphs. Without a unicode-range every text
  // node on the page depends on a 108 KB download, which lands inside the LCP
  // window and re-shapes the English lines when it arrives.
  styleBlock[1].includes('unicode-range')
    ? ok('@font-face scoped with unicode-range')
    : fail('@font-face lost its unicode-range — the Bangla woff2 is back on every text node');
}

// The font MUST stay preloaded. Without it Chrome discovers the face during
// layout and fetches it at VeryHigh, the one priority Lighthouse's model counts
// as render-blocking — measured at ~300 ms of First Contentful Paint.
/rel="preload"[^>]*noto-sans-bengali-400\.woff2/.test(html)
  ? ok('Bangla woff2 preloaded (keeps it at High, not VeryHigh)')
  : fail('Bangla woff2 preload missing — layout will fetch it at VeryHigh and block first paint');

// 44 KB is the instanced single-weight file. A jump back towards 108 KB means
// somebody dropped in the full variable font again.
{
  const bytes = statSync('dist/fonts/noto-sans-bengali-400.woff2').size;
  bytes > 60000
    ? fail(`Bangla woff2 is ${bytes} bytes — the variable axis is back, instance it at wght=400`)
    : ok(`Bangla woff2 ${bytes} bytes`);
}

// PostHog stays, but at the end of <body>. In <head> its 2.6 KB stub had to run
// before the browser could reach any content.
const headEnd = html.indexOf('</head>');
const phInit = html.indexOf('posthog.init(');
phInit === -1
  ? fail('PostHog snippet is gone — analytics would stop')
  : phInit < headEnd
    ? fail('PostHog snippet moved back into <head> — it blocks the first paint there')
    : ok('PostHog snippet after </head>');

// Cloudflare Email Address Obfuscation appends a decoder script to every page
// and Lighthouse counts it as render-blocking. The opt-out markers keep it off.
html.includes('<!--email_off-->')
  ? ok('footer email opted out of Cloudflare obfuscation')
  : fail('<!--email_off--> missing — the edge will inject email-decode.min.js again');

// ---- structured data ------------------------------------------------------
// The Person @graph is the whole point of the SEO pass: it's what lets Google
// and AI search resolve "Zakir Hossen" to one entity. Assert it parses and
// carries the identity links, not just that a <script> tag exists.
for (const [file, path] of [
  ['dist/index.html', '/'],
  ['dist/now/index.html', '/now/'],
  ['dist/projects/index.html', '/projects/'],
]) {
  const page = readFileSync(file, 'utf8');
  const m = page.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  if (!m) { fail(`${path} — no JSON-LD block`); continue; }

  let data;
  try { data = JSON.parse(m[1]); } catch (e) { fail(`${path} — JSON-LD does not parse: ${e.message}`); continue; }

  const types = (data['@graph'] || []).map((n) => n['@type']);
  for (const t of ['Person', 'Organization', 'WebSite']) {
    types.includes(t) ? ok(`${path} JSON-LD: ${t}`) : fail(`${path} JSON-LD missing ${t}`);
  }

  // Each product must resolve to an Organization founded by this Person, under
  // the same @id the product site uses for itself.
  for (const host of ['jugglehire.com', 'schedulenchill.com', 'shiptell.com']) {
    const org = (data['@graph'] || []).find((n) => n['@id'] === `https://${host}/#organization`);
    org?.founder?.['@id'] === `${SITE}/#person`
      ? ok(`${path} JSON-LD: ${host} founded by the Person`)
      : fail(`${path} JSON-LD: no ${host} Organization with founder = the Person`);
  }

  const person = (data['@graph'] || []).find((n) => n['@type'] === 'Person');
  (person?.sameAs?.length ?? 0) >= 5
    ? ok(`${path} JSON-LD: Person.sameAs (${person.sameAs.length} profiles)`)
    : fail(`${path} JSON-LD: Person.sameAs too thin`);

  // Trailing slash everywhere — must match what the sitemap emits, or Google
  // sees the sitemap URL and the canonical as two different pages.
  const expected = `${SITE}${path}`;
  const inSitemap = readFileSync('dist/sitemap-0.xml', 'utf8').includes(`<loc>${expected}</loc>`);
  inSitemap ? ok(`${path} in sitemap`) : fail(`${path} — canonical ${expected} not in sitemap`);
  page.includes(`rel="canonical" href="${expected}"`)
    ? ok(`${path} canonical`)
    : fail(`${path} canonical wrong — expected ${expected}`);
}

// Every sitemap URL carries a real <lastmod>. Without it Google has no signal
// to re-crawl, and on a low-authority domain that means never.
{
  const sm = readFileSync('dist/sitemap-0.xml', 'utf8');
  const urls = (sm.match(/<url>/g) || []).length;
  const dated = (sm.match(/<lastmod>\d{4}-\d{2}-\d{2}T/g) || []).length;
  urls > 0 && urls === dated
    ? ok(`sitemap: all ${urls} URLs have <lastmod>`)
    : fail(`sitemap: ${dated} of ${urls} URLs have <lastmod>`);
}

// Every page must be reachable from every other page (internal linking).
for (const f of ['dist/index.html', 'dist/now/index.html', 'dist/projects/index.html', 'dist/writing/index.html']) {
  const page = readFileSync(f, 'utf8');
  const linked = ['href="/"', 'href="/now/"', 'href="/projects/"', 'href="/writing/"'].every((h) => page.includes(h));
  linked ? ok(`nav links: ${f}`) : fail(`nav links incomplete: ${f}`);
}

/*
 * Every article must be crawlable, canonical, in the sitemap, and reachable
 * from the /writing/ index.
 *
 * The last one is the point. A sibling project shipped 33 pages that were in
 * sitemap.xml, returned 200 and had clean canonicals, and Google left them at
 * "URL is unknown to Google" for NINE WEEKS because nothing linked them. One
 * inbound internal link fixed it within hours. Sitemap membership is not
 * discovery, so this asserts the link, not just the sitemap entry.
 */
const sitemap = readFileSync('dist/sitemap-0.xml', 'utf8');

const articles = readdirSync('dist/writing', { withFileTypes: true })
  .filter((e) => e.isDirectory())
  .map((e) => e.name);

if (articles.length === 0) fail('no articles built under dist/writing');

const writingIndex = readFileSync('dist/writing/index.html', 'utf8');

for (const slug of articles) {
  const page = readFileSync(`dist/writing/${slug}/index.html`, 'utf8');
  const url = `${SITE}/writing/${slug}/`;

  page.includes(`rel="canonical" href="${url}"`)
    ? ok(`/writing/${slug}/ canonical`)
    : fail(`/writing/${slug}/ canonical wrong — expected ${url}`);

  (page.match(/name="description"/g) || []).length === 1
    ? ok(`/writing/${slug}/ exactly one meta description`)
    : fail(`/writing/${slug}/ must have exactly one meta description`);

  page.includes('"BlogPosting"')
    ? ok(`/writing/${slug}/ BlogPosting schema`)
    : fail(`/writing/${slug}/ missing BlogPosting JSON-LD`);

  // The post's JSON-LD must parse, and the BlogPosting must carry an author
  // with a name, a date pair and an image (Google's Article fields).
  {
    const m = page.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
    let post;
    try { post = (JSON.parse(m?.[1] ?? '')['@graph'] || []).find((n) => n['@type'] === 'BlogPosting'); } catch (e) { post = null; }
    post?.author?.name && post?.datePublished && post?.dateModified && post?.image?.url
      ? ok(`/writing/${slug}/ BlogPosting parses with author, dates and image`)
      : fail(`/writing/${slug}/ BlogPosting JSON-LD missing author/dates/image or does not parse`);
  }

  // Social card: the post's own image must exist and be the one advertised.
  existsSync(`dist/og/writing/${slug}.png`) && page.includes(`content="${SITE}/og/writing/${slug}.png"`)
    ? ok(`/writing/${slug}/ has its own og:image`)
    : fail(`/writing/${slug}/ og card missing — run node scripts/og-images.mjs`);
  page.includes('property="og:type" content="article"') && page.includes('property="article:published_time"')
    ? ok(`/writing/${slug}/ og:type article + published_time`)
    : fail(`/writing/${slug}/ is not marked up as an article for social cards`);
  page.includes('rel="author"')
    ? ok(`/writing/${slug}/ visible author link`)
    : fail(`/writing/${slug}/ byline has no rel=author link`);

  sitemap.includes(url)
    ? ok(`/writing/${slug}/ in sitemap`)
    : fail(`/writing/${slug}/ missing from sitemap`);

  writingIndex.includes(`href="/writing/${slug}/"`)
    ? ok(`/writing/${slug}/ linked from the writing index`)
    : fail(`/writing/${slug}/ is orphaned — nothing links to it`);

  // The homepage is the page Google actually crawls. A post reachable only
  // through /writing/ sat at "URL is unknown to Google" for weeks while the
  // homepage was indexed, so every post must be one hop from it.
  html.includes(`href="/writing/${slug}/"`)
    ? ok(`/writing/${slug}/ linked from the homepage`)
    : fail(`/writing/${slug}/ not linked from the homepage — it is two hops from the only crawled page`);
}

// Snippet budget on every built page. Google cuts a <title> at about 60
// characters and a description at about 155; past that the part people read
// is chosen for you. The brand suffix is dropped because Google appends it.
{
  const pages = [];
  const walk = (dir) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const p = `${dir}/${e.name}`;
      if (e.isDirectory()) walk(p);
      else if (e.name.endsWith('.html')) pages.push(p);
    }
  };
  walk('dist');
  const decode = (t) => t.replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"');
  for (const p of pages) {
    const page = readFileSync(p, 'utf8');
    const t = decode(page.match(/<title>([^<]*)<\/title>/)?.[1] ?? '');
    const d = decode(page.match(/<meta name="description" content="([^"]*)"/)?.[1] ?? '');
    t.length > 0 && t.length <= 60 ? ok(`${p} title ${t.length} chars`) : fail(`${p} title is ${t.length} chars: ${t}`);
    d.length > 0 && d.length <= 155 ? ok(`${p} description ${d.length} chars`) : fail(`${p} description is ${d.length} chars`);
  }
}

// RSS feed: must parse as XML-ish, list every post, and be advertised in <head>.
{
  const f = 'dist/writing/rss.xml';
  if (!existsSync(f)) {
    fail('dist/writing/rss.xml missing');
  } else {
    const rss = readFileSync(f, 'utf8');
    const missing = articles.filter((slug) => !rss.includes(`<link>${SITE}/writing/${slug}/</link>`));
    missing.length === 0 ? ok(`RSS lists all ${articles.length} posts`) : fail(`RSS missing: ${missing.join(', ')}`);
    rss.includes('<content:encoded><![CDATA[') ? ok('RSS carries full post text') : fail('RSS has no content:encoded');
  }
  html.includes('type="application/rss+xml"') ? ok('RSS advertised in <head>') : fail('no <link rel="alternate"> for the RSS feed');
}

// IndexNow key file must ship, or every submission fails verification (403).
const keyFiles = readdirSync('dist').filter((f) => /^[0-9a-f]{32}\.txt$/.test(f));
keyFiles.length === 1 ? ok(`IndexNow key file: ${keyFiles[0]}`) : fail(`expected 1 IndexNow key file in dist/, found ${keyFiles.length}`);

if (process.exitCode) { console.error('\nCHECK FAILED'); } else { console.log('\nCHECK PASSED'); }
