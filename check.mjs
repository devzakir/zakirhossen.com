// check.mjs — build-output assertions. Run AFTER `npm run build`.
import { readFileSync, readdirSync, existsSync } from 'node:fs';

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
  ['noto-sans-bengali.woff2', 'bangla font preloaded'],
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
  'dist/fonts/noto-sans-bengali.woff2', // preloaded in <head> — 404s if absent
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
  const bytes = styleBlock[1].length;
  bytes > 20000
    ? fail(`inlined stylesheet is ${bytes} bytes — over 20 KB means Tailwind is scanning outside src/`)
    : ok(`inlined stylesheet ${bytes} bytes (under the 20 KB budget)`);
}

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

  sitemap.includes(url)
    ? ok(`/writing/${slug}/ in sitemap`)
    : fail(`/writing/${slug}/ missing from sitemap`);

  writingIndex.includes(`href="/writing/${slug}/"`)
    ? ok(`/writing/${slug}/ linked from the writing index`)
    : fail(`/writing/${slug}/ is orphaned — nothing links to it`);
}

if (process.exitCode) { console.error('\nCHECK FAILED'); } else { console.log('\nCHECK PASSED'); }
