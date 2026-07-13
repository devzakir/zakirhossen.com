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

if (process.exitCode) { console.error('\nCHECK FAILED'); } else { console.log('\nCHECK PASSED'); }
