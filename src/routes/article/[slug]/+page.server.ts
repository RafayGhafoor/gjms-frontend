import { archive } from '$lib/data/archive-index';
import { abstractFor } from '$lib/server/abstracts';
import type { PageServerLoad } from './$types';

/* Runs at build time for every prerendered article page. Only this article's
   abstract crosses into the page payload; abstracts.json stays server-side. */
export const load: PageServerLoad = ({ params }) => {
  const article = archive.articles.find((item) => item.slug === params.slug);
  return {
    slug: params.slug,
    abstract: article ? abstractFor(article.pdf) : ''
  };
};
