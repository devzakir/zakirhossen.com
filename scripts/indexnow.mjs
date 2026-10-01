// indexnow.mjs — tell Bing, Yandex, Seznam and Naver about new or changed URLs.
// Google does not use IndexNow; for Google, request indexing in Search Console.
//
//   node scripts/indexnow.mjs                 # every URL in the live sitemap
//   node scripts/indexnow.mjs <url> [<url>…]  # only these URLs
//
// The key is public by design: IndexNow verifies it by fetching /<key>.txt.
import { readdirSync } from 'node:fs';

const HOST = 'zakirhossen.com';
const KEY = readdirSync('public').find((f) => /^[0-9a-f]{32}\.txt$/.test(f))?.replace('.txt', '');
if (!KEY) { console.error('no IndexNow key file in public/'); process.exit(1); }

let urls = process.argv.slice(2);
if (urls.length === 0) {
  const xml = await (await fetch(`https://${HOST}/sitemap-0.xml`)).text();
  urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
}
if (urls.length === 0) { console.error('no URLs to submit'); process.exit(1); }

const res = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host: HOST, key: KEY, keyLocation: `https://${HOST}/${KEY}.txt`, urlList: urls }),
});
console.log(`IndexNow: HTTP ${res.status} for ${urls.length} URL(s)`);
if (![200, 202].includes(res.status)) { console.error(await res.text()); process.exit(1); }
