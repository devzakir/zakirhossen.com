import { getCollection, type CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'writing'>;

/** Published posts, newest first. One place so every list on the site agrees. */
export async function getPosts(): Promise<Post[]> {
  return (await getCollection('writing', ({ data }) => !data.draft)).sort(
    (a, b) => b.data.date.valueOf() - a.data.date.valueOf(),
  );
}

/** YYYY-MM-DD, the form JSON-LD, <time> and the sitemap all use. */
export const isoDate = (d: Date) => d.toISOString().slice(0, 10);

/** The date a post last changed in substance: `updated` if set, else `date`. */
export const lastModified = (post: Post) => post.data.updated ?? post.data.date;
