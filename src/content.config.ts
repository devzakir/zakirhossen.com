import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * The writing collection.
 *
 * Every post carries the keyword it was written for. That is not decoration —
 * the whole point of this section is that each post exists because the data
 * said it could rank, and the next person to touch a post should be able to see
 * the number that justified it without digging through a context file.
 *
 * Sources: Keywords Everywhere (volume) and DataForSEO (difficulty + SERP),
 * pulled 2026-09-08. Re-check before rewriting a post — `claude code skills`
 * fell 55% in a quarter, so these numbers age fast.
 */
const writing = defineCollection({
  loader: glob({ base: './src/content/writing', pattern: '**/*.md' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    /** Publication date. Drives sort order and the Article JSON-LD. */
    date: z.coerce.date(),
    /** Set when a post is materially revised, not for typo fixes. */
    updated: z.coerce.date().optional(),
    /** The primary search term this post targets. */
    keyword: z.string(),
    /** Monthly US search volume for `keyword` when the post was planned. */
    volume: z.number(),
    /** DataForSEO keyword difficulty, 0–100, when the post was planned. */
    difficulty: z.number(),
    tags: z.array(z.string()).default([]),
    /** Hide from the index and the sitemap without deleting the file. */
    draft: z.boolean().default(false),
  }),
});

export const collections = { writing };
