import type { APIRoute } from 'astro';
import { content } from '../../data/content';
import { getPosts, lastModified } from '../../lib/writing';

/**
 * RSS 2.0 feed for /writing/, hand-written so the site takes no new dependency.
 *
 * Feeds are a second discovery path next to the sitemap: feed readers, AI
 * tools and some crawlers poll them, and every post arrives with its full text
 * in <content:encoded>, so a reader never has to render the page to quote it.
 */
const { meta, identity } = content;

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// CDATA cannot contain "]]>"; split it if a post ever does.
const cdata = (s: string) => `<![CDATA[${s.replaceAll(']]>', ']]]]><![CDATA[>')}]]>`;

// Site-relative links in the post body must be absolute outside the site.
const absolutize = (html: string) => html.replace(/(href|src)="\//g, `$1="${meta.url}/`);

export const GET: APIRoute = async () => {
  const posts = await getPosts();
  const self = `${meta.url}/writing/rss.xml`;
  const newest = posts.length ? lastModified(posts[0]) : new Date();

  const items = posts
    .map((post) => {
      const url = `${meta.url}/writing/${post.id}/`;
      return `    <item>
      <title>${esc(post.data.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${esc(post.data.description)}</description>
      <pubDate>${post.data.date.toUTCString()}</pubDate>
      <dc:creator>${esc(identity.name)}</dc:creator>
${post.data.tags.map((t) => `      <category>${esc(t)}</category>`).join('\n')}
      <content:encoded>${cdata(absolutize(post.rendered?.html ?? ''))}</content:encoded>
    </item>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${esc(identity.name)} — Writing</title>
    <link>${meta.url}/writing/</link>
    <atom:link href="${self}" rel="self" type="application/rss+xml" />
    <description>Notes from building software solo: MCP servers, AI coding agents and the APIs behind them.</description>
    <language>en</language>
    <lastBuildDate>${newest.toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>
`;

  return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
};
