import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://zakirhossen.com',
  integrations: [sitemap()],
  // The whole site is one ~13 KB (3.4 KB gzipped) Tailwind sheet. Shipping it
  // as a <link> costs an extra round trip that blocks the first render; inlined
  // it arrives with the HTML. Astro's default only inlines under 4 KB.
  build: { inlineStylesheets: 'always' },
  vite: { plugins: [tailwindcss()] },
});
