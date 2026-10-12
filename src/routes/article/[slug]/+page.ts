import { archive } from '$lib/data/archive-index';

/* One prerendered page per article: /article/<slug>.html
   The slugs come from archive-data.json, so these URLs match the ones the
   journal's earlier static build published. */

export const prerender = true;

export function entries() {
  return archive.articles.filter((article) => article.slug).map((article) => ({ slug: article.slug }));
}
