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
  'dist/now/index.html',
  'dist/projects/index.html',
]) {
  existsSync(f) ? ok(`file: ${f}`) : fail(`missing file: ${f}`);
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
  const expected = `https://devzakir.com${path}`;
  const inSitemap = readFileSync('dist/sitemap-0.xml', 'utf8').includes(`<loc>${expected}</loc>`);
  inSitemap ? ok(`${path} in sitemap`) : fail(`${path} — canonical ${expected} not in sitemap`);
  page.includes(`rel="canonical" href="${expected}"`)
    ? ok(`${path} canonical`)
    : fail(`${path} canonical wrong — expected ${expected}`);
}

// Every page must be reachable from every other page (internal linking).
for (const f of ['dist/index.html', 'dist/now/index.html', 'dist/projects/index.html']) {
  const page = readFileSync(f, 'utf8');
  const linked = ['href="/"', 'href="/now/"', 'href="/projects/"'].every((h) => page.includes(h));
  linked ? ok(`nav links: ${f}`) : fail(`nav links incomplete: ${f}`);
}

if (process.exitCode) { console.error('\nCHECK FAILED'); } else { console.log('\nCHECK PASSED'); }
