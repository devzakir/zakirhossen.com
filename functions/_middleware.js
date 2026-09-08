// Host-based canonical redirects, done as a Pages Function.
//
// Why here and not a Cloudflare Redirect Rule: rules live in the zone ruleset,
// which needs a token with Zone > Config: Edit. The Pages deploy token can't
// touch that, but it CAN ship Functions — and Functions run ahead of static
// asset serving, so this lands in the same place a redirect rule would.
//
// Every hostname the Pages project answers on, except the primary, 301s to the
// primary with path and query intact. Anything not listed falls through
// untouched, so a new custom domain fails open (serves the site) rather than
// redirecting somewhere unintended.

const PRIMARY = 'zakirhossen.com';

const REDIRECT_HOSTS = new Set([
  'www.zakirhossen.com',
  'devzakir.com',
  'www.devzakir.com',
  'zakirh.com',
  'www.zakirh.com',
  'zakirhq.com',
  'www.zakirhq.com',
]);

const YEAR = 31536000;

// Cloudflare Pages hands every static asset to the browser with
// `public, max-age=0, must-revalidate`. That is right for HTML — a deploy must
// be visible at once — but it makes a repeat visitor re-validate the 108 KB
// font and every image on each navigation. These rules put the
// content-addressed and rename-on-change files behind a long browser cache.
//
// IMMUTABLE paths must never be served with changed bytes under the same name:
//   /_astro/*  Astro writes a content hash into the filename.
//   /fonts/*   not hashed — REPLACING A FONT MEANS RENAMING THE FILE.
const IMMUTABLE = /^\/(?:_astro|fonts)\//;

// Images (avatar, favicon, og card). Same year, but WITHOUT `immutable`, so an
// explicit reload still revalidates and the ETag turns that into a cheap 304.
// These names are not hashed, so the site convention holds: CHANGING AN IMAGE
// MEANS BUMPING ITS FILENAME — which is what `og-v1.png` is already doing.
const STATIC = /\.(?:avif|webp|png|jpe?g|gif|svg|ico)$/i;

export async function onRequest(context) {
  const url = new URL(context.request.url);

  if (REDIRECT_HOSTS.has(url.hostname)) {
    url.protocol = 'https:';
    url.hostname = PRIMARY;
    url.port = '';

    return new Response(null, {
      status: 301,
      headers: {
        Location: url.toString(),
        // Redirects are permanent but cheap to re-evaluate; a day is long enough
        // to spare the round trip without pinning a mistake into browser caches.
        'Cache-Control': 'public, max-age=86400',
      },
    });
  }

  const response = await context.next();

  // Only cache successful reads. Errors and 3xx keep whatever they came with,
  // so a bad deploy is never pinned into a browser for a year.
  const method = context.request.method;
  if ((method !== 'GET' && method !== 'HEAD') || response.status !== 200) return response;

  let cacheControl;
  if (IMMUTABLE.test(url.pathname)) {
    cacheControl = `public, max-age=${YEAR}, immutable`;
  } else if (STATIC.test(url.pathname)) {
    cacheControl = `public, max-age=${YEAR}, stale-while-revalidate=604800`;
  } else {
    return response; // HTML, sitemaps, robots.txt, llms.txt — revalidate always.
  }

  // Response headers from the asset pipeline are immutable; re-wrap to edit.
  const out = new Response(response.body, response);
  out.headers.set('Cache-Control', cacheControl);
  return out;
}
