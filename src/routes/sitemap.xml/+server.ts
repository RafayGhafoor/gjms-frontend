import { SITEMAP_PAGES, absoluteUrl } from '$lib/config/site';
import { archive } from '$lib/data/journal';
import { issuePath } from '$lib/data/paths';
import type { RequestHandler } from './$types';

export const prerender = true;

export const GET: RequestHandler = () => {
  const today = new Date().toISOString().slice(0, 10);
  const url = (loc: string, priority: string, changefreq: string, lastmod = today) =>
    ['  <url>', `    <loc>${loc}</loc>`, `    <lastmod>${lastmod}</lastmod>`, `    <changefreq>${changefreq}</changefreq>`, `    <priority>${priority}</priority>`, '  </url>'].join('\n');

  const staticEntries = SITEMAP_PAGES.map((page) => url(absoluteUrl(page.path), page.priority, page.changefreq));

  // One URL per published issue, built from the journal's own archive index.
  const issueEntries = archive.issues.map((issue) =>
    url(absoluteUrl(issuePath(issue.id)), '0.7', 'yearly', `${issue.year}-01-01`)
  );

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[...staticEntries, ...issueEntries].join('\n')}\n</urlset>\n`;

  return new Response(xml, {
    headers: { 'content-type': 'application/xml; charset=utf-8' }
  });
};
