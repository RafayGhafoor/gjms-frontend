import { SITEMAP_PAGES, absoluteUrl } from '$lib/config/site';
import { archive } from '$lib/data/archive-index';
import { articlePath, issuePath } from '$lib/data/paths';
import type { RequestHandler } from './$types';

export const prerender = true;

/* Every indexable URL the site publishes: the nine pages, 50 issues and 342
   articles. Filtered views (`?year=`, `?q=`) are deliberately absent — they are
   the same document with a canonical pointing at the unfiltered page.

   `lastmod` is emitted only where the date is real: the listing pages are
   regenerated from the archive on every build, while an issue or article page
   is fixed at publication and the records hold a year, not a day. `changefreq`
   and `priority` are omitted because Google ignores them. */
export const GET: RequestHandler = () => {
  const builtOn = new Date().toISOString().slice(0, 10);

  const entry = (loc: string, lastmod?: string) =>
    ['  <url>', `    <loc>${loc}</loc>`, lastmod ? `    <lastmod>${lastmod}</lastmod>` : undefined, '  </url>']
      .filter(Boolean)
      .join('\n');

  const staticEntries = SITEMAP_PAGES.map((page) =>
    entry(absoluteUrl(page.path), page.lastmod === 'build' ? builtOn : undefined)
  );

  const issueEntries = archive.issues.map((issue) => entry(absoluteUrl(issuePath(issue.id))));

  const articleEntries = archive.articles
    .filter((article) => article.slug)
    .map((article) => entry(absoluteUrl(articlePath(article.slug))));

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[
    ...staticEntries,
    ...issueEntries,
    ...articleEntries
  ].join('\n')}\n</urlset>\n`;

  return new Response(xml, {
    headers: { 'content-type': 'application/xml; charset=utf-8' }
  });
};
