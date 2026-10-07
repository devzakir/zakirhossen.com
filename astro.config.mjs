import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import { readFileSync, readdirSync } from 'node:fs';
import { content } from './src/data/content.ts';

/*
 * <lastmod> for every sitemap URL.
 *
 * Without it the sitemap gives Google no reason to come back to a URL, and on
 * a domain with almost no authority that is the difference between a page
 * being crawled this week or never. The dates are real change dates, never the
 * build time: a lastmod that moves on every deploy teaches Google to ignore it.
 *
 * Posts: `updated` if set, else `date`, read from the Markdown frontmatter.
 * /writing/: the newest post. /: the newest of its own date and the newest post.
 */
const postDates = Object.fromEntries(
  readdirSync('./src/content/writing')
    .filter((f) => f.endsWith('.md'))
    .map((f) => {
      const src = readFileSync(`./src/content/writing/${f}`, 'utf8');
      const field = (name) => src.match(new RegExp(`^${name}:\\s*(\\S+)`, 'm'))?.[1];
      if (field('draft') === 'true') return null;
      return [f.replace(/\.md$/, ''), field('updated') ?? field('date')];
    })
    .filter(Boolean),
);
const newest = (...dates) => dates.filter(Boolean).sort().at(-1);
const newestPost = newest(...Object.values(postDates));

const lastmod = {
  '/': newest(content.meta.updated, newestPost),
  '/writing/': newestPost,
  '/projects/': content.projects.updated,
  '/now/': content.now.updated,
  ...Object.fromEntries(Object.entries(postDates).map(([slug, d]) => [`/writing/${slug}/`, d])),
};

export default defineConfig({
  // check.mjs reads this literal to learn the canonical origin. Keep it a
  // plain string.
  site: 'https://zakirhossen.com',
  integrations: [
    sitemap({
      serialize(item) {
        const date = lastmod[new URL(item.url).pathname];
        if (date) item.lastmod = new Date(`${date}T00:00:00Z`).toISOString();
        return item;
      },
    }),
  ],
  // The whole site is one ~13 KB (3.4 KB gzipped) Tailwind sheet. Shipping it
  // as a <link> costs an extra round trip that blocks the first render; inlined
  // it arrives with the HTML. Astro's default only inlines under 4 KB.
  build: { inlineStylesheets: 'always' },
  vite: { plugins: [tailwindcss()] },
});
