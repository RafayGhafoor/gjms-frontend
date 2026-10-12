import { archive } from '$lib/data/archive-index';
import { sortArticles } from '$lib/data/archive';
import type { PageServerLoad } from './$types';

/* The home page renders eight articles and a set of counts — all of it decided
 * at build time. Resolving it here keeps the ~30 KB gzipped archive index out of
 * the browser; only the eight records and the figures are serialised. */
export const load: PageServerLoad = () => ({
  stats: archive.stats,
  latest: sortArticles(archive.articles, -1).slice(0, 8)
});
