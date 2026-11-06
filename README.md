# devzakir.com

Bangla-first personal site. Astro 7 + Tailwind v4, static.

## Develop
    npm install
    npm run dev

## Build & self-check
    npm run build && npm run check

## Deploy — Cloudflare Pages (direct upload, NOT git)
The Pages project `devzakir` has no Git provider (checked 2026-11-06).
**A push deploys nothing.** Deploy by hand after the push:

    npm run build && npm run check
    npx wrangler pages deploy dist --project-name devzakir --branch main \
      --commit-hash "$(git rev-parse --short HEAD)"

Then `npm run indexnow -- <changed URLs>`.

### Domain
Add `devzakir.com` as a custom domain in the Pages project.
301-redirect `zakirhq.com` and `hizakir.com` → `devzakir.com` (Cloudflare Bulk Redirects).

## Before public announce (assets that ship, not code)
- `public/fonts/noto-sans-bengali.woff2` (see fonts/README.md)
- `public/zakir.jpg` (square photo)
- `public/og.png` (1200x630)
