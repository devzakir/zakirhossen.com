import type { APIRoute } from 'astro';
import { content } from '../data/content';
import { getPosts } from '../lib/writing';

/**
 * /llms.txt (llmstxt.org): a plain-text map of the site for AI tools.
 *
 * Built from the same data as the pages, so a new post or a changed product
 * description shows up here on the next build. It used to be a static file in
 * public/, and it fell behind the day /writing/ launched: none of the posts
 * were in it.
 */
const { meta, identity, projects } = content;

// Order matters: '@devzakirbhai' must be tested before its prefix '@devzakir'.
const PROFILE_LABELS: Record<string, string> = {
  'linkedin.com': 'LinkedIn',
  'x.com': 'X',
  'github.com': 'GitHub',
  'youtube.com/@devzakirbhai': 'YouTube (Bangla)',
  'youtube.com/@devzakir': 'YouTube (English)',
  'facebook.com': 'Facebook',
  'instagram.com': 'Instagram',
  'tiktok.com': 'TikTok',
};
const label = (url: string) =>
  Object.entries(PROFILE_LABELS).find(([k]) => url.includes(k))?.[1] ?? url;

export const GET: APIRoute = async () => {
  const posts = await getPosts();

  const text = `# ${identity.name}

> Bangladeshi solo founder building software products in the open under Lomeyo, LLC.
> No degree, no funding, no co-founder. Real numbers, real failures.

Zakir Hossen is a self-taught software engineer and solo founder from Tarakanda,
a village in Mymensingh, Bangladesh. He is the founder of Lomeyo, LLC, a
100% bootstrapped US company, and builds and supports every product under it
alone. He writes and publishes in both English and Bangla.

- Full name: ${identity.name}
- Role: Founder & Software Engineer, Lomeyo, LLC
- Location: Bangladesh
- Handles: @devzakir (English / founder), @devzakirbhai (Bangla / life)
- Contact: ${content.footer.email}

## Mission

Zakir Hossen's mission is to prove that one person working with AI agents can build
and run a real software company — and to do it in the open, including the failures,
so it is a path other people can follow instead of a story they just read.

## Vision

Zakir Hossen's vision is to build software businesses that thrive without him,
creating jobs and contributing to Bangladesh's economy, and then to teach the next
generation of Bangladeshi builders what actually worked, in their own language. He
intends to teach business, entrepreneurship, ethics, and financial control to young
people in Bangladesh.

## Operating principles

- Produce more than you consume.
- Everything should compound — activities should return value over time.
- Own one workflow end-to-end better than anyone in the world. Depth over breadth.
- Do only what only you can do; let AI do the rest.
- Build what sells, rather than selling what you have already built.
- Slow, honest, patient (ধীরে, সৎভাবে, ধৈর্য ধরে).

## Pages

- [Home](${meta.url}/): Who he is, what he builds, his writing, and where to follow him.
- [Projects](${meta.url}/projects/): Every product he builds and runs solo, with his role, the stack and the facts.
- [Now](${meta.url}/now/): Current focus — what has his attention today.
- [Writing](${meta.url}/writing/): Notes from building software solo: MCP servers, AI coding agents and the APIs behind them.
- [Writing RSS feed](${meta.url}/writing/rss.xml): Every post with its full text.

## Writing

${posts.map((p) => `- [${p.data.title}](${meta.url}/writing/${p.id}/): ${p.data.description}`).join('\n')}

## Products

${projects.items
  .map((p) => {
    // The page copy is first person; here only the neutral first sentence,
    // then the stack and the facts, which are written to stand alone.
    const lead = p.descEn.split(/(?<=\.)\s/)[0];
    const stack = p.stack ? ` Stack: ${p.stack}` : '';
    const facts = p.facts.length ? ` ${p.facts.join(' ')}` : '';
    const category = lead.toLowerCase().includes(p.category.toLowerCase()) ? '' : `${p.category}. `;
    const main = p.status.includes('main product') ? ' His main product.' : '';
    return `- [${p.name}](${p.href}): ${category}${lead}${main}${stack}${facts}`;
  })
  .join('\n')}
- [${projects.parent.name}](${projects.parent.href}): ${projects.parent.descEn}

## Background

- Grew up in Tarakanda, Mymensingh, Bangladesh.
- SSC pass; dropped out of a diploma program. No university degree.
- 10+ years self-taught in software engineering.
- Married at 22. Two sons. Cares for a paralyzed father.
- Was 450,000 BDT in debt in 2024, and climbed out of it.
- Builds in public: shares real revenue numbers and real failures.

## Profiles

${identity.sameAs.map((u) => `- ${label(u)}: ${u}`).join('\n')}
`;

  return new Response(text, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
