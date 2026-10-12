import { archive } from '$lib/data/archive-index';
import { paramId } from '$lib/data/paths';
import { abstractFor } from '$lib/server/abstracts';
import type { EntryGenerator, PageServerLoad } from './$types';

/* Prerendered from the server module so the archive index stays out of the
 * client bundle: a universal +page.ts would ship it to the browser even though
 * the page itself needs only one record. */
export const entries: EntryGenerator = () =>
  archive.articles.filter((article) => article.slug).map((article) => ({ slug: article.slug }));

/* Everything this page needs is resolved at build time and serialised into the
 * page, so the archive index itself never ships to the browser here — only the
 * one article, its issue and the sibling titles. Under `npm run dev` the same
 * load runs per request.
 *
 * params.slug is the raw URL segment and therefore carries the ".html" suffix
 * that the prerendered file names require — strip it the same way the page
 * component does, or the lookup silently returns nothing outside the
 * prerenderer (which passes the clean id from `entries`). */
export const load: PageServerLoad = ({ params }) => {
  const slug = paramId(params.slug);
  const found = archive.articles.find((item) => item.slug === slug) ?? null;
  const issue = found ? (archive.issues.find((item) => item.id === found.issueId) ?? null) : null;

  return {
    slug,
    article: found ? { ...found, abstract: abstractFor(found.pdf) } : null,
    issue,
    /* True for the handful of records that share a title across issues (the
       "Author's Guideline" front matter); the page then appends the issue to
       keep its SEO title unique. */
    titleIsShared: found ? archive.articles.filter((item) => item.title === found.title).length > 1 : false
  };
};
