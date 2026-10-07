// og-images.mjs — one 1200x630 social card per post, written to
// public/og/writing/<slug>.png. Run it after adding or retitling a post:
//
//   node scripts/og-images.mjs
//
// The PNGs are committed, not built, so the build never depends on sharp (an
// Astro dependency, not ours) or on which fonts the build machine has.
// check.mjs fails the build if a post has no card.
import { readFileSync, readdirSync, writeFileSync, mkdirSync } from 'node:fs';
import sharp from 'sharp';

const OUT = 'public/og/writing';
mkdirSync(OUT, { recursive: true });

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Greedy word wrap; SVG text has no wrapping of its own. */
function wrap(text, max) {
  const lines = [];
  let line = '';
  for (const word of text.split(/\s+/)) {
    if ((line + ' ' + word).trim().length > max) {
      lines.push(line);
      line = word;
    } else {
      line = (line + ' ' + word).trim();
    }
  }
  if (line) lines.push(line);
  return lines;
}

// Circular avatar, composited bottom-left next to the byline.
const AVATAR = 88;
const avatar = await sharp('public/zakir.jpg')
  .resize(AVATAR, AVATAR)
  .composite([{
    input: Buffer.from(`<svg width="${AVATAR}" height="${AVATAR}"><circle cx="${AVATAR / 2}" cy="${AVATAR / 2}" r="${AVATAR / 2}"/></svg>`),
    blend: 'dest-in',
  }])
  .png()
  .toBuffer();

for (const file of readdirSync('src/content/writing').filter((f) => f.endsWith('.md'))) {
  const slug = file.replace(/\.md$/, '');
  const src = readFileSync(`src/content/writing/${file}`, 'utf8');
  const title = src.match(/^title:\s*"(.*)"\s*$/m)?.[1];
  if (!title) throw new Error(`${file}: no title`);

  // Long titles drop a size so they stay inside four lines.
  const size = title.length > 70 ? 54 : 64;
  const lines = wrap(title, size === 64 ? 30 : 36).slice(0, 4);
  const lineHeight = Math.round(size * 1.18);
  const text = lines
    .map((l, i) => `<text x="80" y="${150 + i * lineHeight}" font-size="${size}" font-weight="700" fill="#fafafa">${esc(l)}</text>`)
    .join('');

  const svg = `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg" font-family="Helvetica Neue, Helvetica, Arial, sans-serif">
    <rect width="1200" height="630" fill="#0a0a0a"/>
    <rect x="80" y="64" width="72" height="6" rx="3" fill="#34d399"/>
    ${text}
    <text x="200" y="532" font-size="30" font-weight="700" fill="#fafafa">Zakir Hossen</text>
    <text x="200" y="570" font-size="24" fill="#a3a3a3">zakirhossen.com/writing</text>
  </svg>`;

  const png = await sharp(Buffer.from(svg))
    .composite([{ input: avatar, left: 80, top: 486 }])
    .png({ compressionLevel: 9 })
    .toBuffer();
  writeFileSync(`${OUT}/${slug}.png`, png);
  console.log(`${OUT}/${slug}.png  ${lines.length} lines  ${Math.round(png.length / 1024)} KB`);
}
