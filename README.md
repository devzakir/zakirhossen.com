# devzakir.com

Bangla-first personal site. Astro 7 + Tailwind v4, static.

## Develop
    npm install
    npm run dev

## Build & self-check
    npm run build && npm run check

## Deploy — Cloudflare Pages
Connect the GitHub repo in the Cloudflare dashboard → Pages → Create → Connect to Git.
- Framework preset: **Astro**
- Build command: `npm run build`
- Build output directory: `dist`
- Node version: 20 (via `.node-version`)

Push to the default branch = auto-deploy.

### Domain
Add `devzakir.com` as a custom domain in the Pages project.
301-redirect `zakirhq.com` and `hizakir.com` → `devzakir.com` (Cloudflare Bulk Redirects).

## Before public announce (assets that ship, not code)
- `public/fonts/noto-sans-bengali.woff2` (see fonts/README.md)
- `public/zakir.jpg` (square photo)
- `public/og.png` (1200x630)
