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

export async function onRequest(context) {
  const url = new URL(context.request.url);

  if (!REDIRECT_HOSTS.has(url.hostname)) return context.next();

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
