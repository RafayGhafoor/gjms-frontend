import { archive } from '$lib/data/archive-index';
import { paramId } from '$lib/data/paths';
import { abstractFor } from '$lib/server/abstracts';
import type { PageServerLoad } from './$types';

/* Runs while prerendering each article page, and again per request under
 * `npm run dev`. Only this article's abstract crosses into the page payload;
 * abstracts.json itself stays server-side.
 *
 * params.slug is the raw URL segment and therefore carries the ".html" suffix
 * that the prerendered file names require — strip it the same way the page
 * component does, or the lookup silently returns no abstract outside the
 * prerenderer (which passes the clean id from `entries`). */
export const load: PageServerLoad = ({ params }) => {
  const slug = paramId(params.slug);
  const article = archive.articles.find((item) => item.slug === slug);
  return {
    slug,
    abstract: article ? abstractFor(article.pdf) : ''
  };
};
