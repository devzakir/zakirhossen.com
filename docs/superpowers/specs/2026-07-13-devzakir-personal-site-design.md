# devzakir.com — Personal Site (v1) Design

> **Date:** 2026-07-13
> **Owner:** Zakir Hossen
> **Status:** Approved for planning

## One line

A Bangla-first personal home that says *this is Zakir — married young, still learning, building character and wealth from nothing, in the open.*

## Purpose & audience

One home, both sides. A personal identity hub — the canonical "who is Zakir" page. It does NOT blend social feeds (that rule stays); it is the umbrella that links out to the separate channels.

- **Primary audience:** Bangladeshi creators/young founders (the mission) — Bangla-first voice.
- **Secondary audience:** peers, followers, future acquirers — served by one English bridge line + clear links to the founder work.
- **Domain:** `devzakir.com` (matches @devzakir everywhere — compounds one handle). `zakirhq.com` and `hizakir.com` 301-redirect here.

## Positioning spine (the 5 fights → one message)

Slow, honest, patient building — against get-rich-quick, fake-founder culture.

1. Marry young and build anyway
2. Keep learning continuously
3. Build character slowly
4. Wealth from nothing
5. All of it in the open (radical honesty — real numbers, real failures)

These collapse to one philosophy: **slow, honest, patient building.** That is the site's message.

## Scope

**v1 (this spec):** one scrollable page + outbound links. No blog engine, no CMS, no auth.
**v2 (later, not now):** Bangla writing/essays section (markdown). Explicitly deferred — do not build.

## Page structure (top to bottom)

1. **Hero** — name + one Bangla sentence stating the fight; real photo; one English bridge line beneath for peers/acquirers.
2. **What I'm fighting for** — the 5 fights, one line of Bangla each. The heart of the page; must be memorable 10 seconds after landing.
3. **What I'm building** — JuggleHire (primary) + the Lomeyo / monthly-shipping story. Cards with links. Receipts, not hype.
4. **My story, short** — Mymensingh village, SSC pass, self-taught 10+ yrs, married at 22 with 2 sons, 450k BDT debt → recovery. 4–5 lines. Links to deeper channels.
5. **Where to follow** — labeled links out to real channels (LinkedIn, X, YouTube, TikTok — all @devzakir), each signposted so people self-select. This is where "both sides" lives: founder content and mission content clearly separated, not merged.
6. **Footer** — email, copyright.

## Look & feel

- **Bangla typography done right** — Noto Sans Bengali or Hind Siliguri, self-hosted (subset) so it loads fast and renders Bangla cleanly. This is the single most important craft detail; most Bangla sites fail here.
- **Calm, spacious, not a guru landing page** — whitespace embodies the "slow and patient" philosophy. No neon CTAs, no countdown timers.
- **Light + dark mode.** Mobile-first (Bangla audience is mostly on phones). Fast.

## Tech

- **Astro + Tailwind CSS**, static output.
- **Host:** Cloudflare Pages (push-to-deploy from the repo). ~$0.
- Content copy (Bangla + English strings) kept in a single data/content file so copy edits don't require touching layout.
- Self-hosted fonts (no external font CDN — perf + privacy + reliability).

### Non-goals for v1

- No CMS/database, no auth, no comments.
- No blog engine (that's v2).
- No analytics beyond a lightweight privacy-friendly counter (optional, can defer).

## SEO (his #1 channel)

- Static HTML, fast LCP, correct `lang` attributes (`bn` for Bangla blocks, `en` for the bridge line).
- Per-page title/description/OG tags + a single OG image.
- `sitemap.xml` + `robots.txt`.
- IndexNow ping on deploy — optional, can follow his standard pattern later; not required for v1 launch.

## Success criteria

- A stranger who lands remembers the one message: *slow, honest, patient building.*
- Bangla renders beautifully on a mid-range Android phone.
- Loads in under ~1s; passes Lighthouse SEO/perf comfortably.
- Every outbound channel link is correct and labeled.
- Ships in days, not weeks.

## Open items (resolve during planning/build, not blockers)

- Exact Bangla copy for hero + 5 fights (Zakir writes or approves final wording).
- Photo asset.
- Final font choice (Noto Sans Bengali vs Hind Siliguri) — decide by rendering both.
