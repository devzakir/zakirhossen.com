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

for (const f of ['dist/robots.txt', 'dist/sitemap-index.xml']) {
  existsSync(f) ? ok(`file: ${f}`) : fail(`missing file: ${f}`);
}

if (process.exitCode) { console.error('\nCHECK FAILED'); } else { console.log('\nCHECK PASSED'); }
