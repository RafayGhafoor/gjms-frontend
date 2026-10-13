/* Highwire Press ("citation_*") metadata.
 *
 * These are the tags Google Scholar actually reads to index an article landing
 * page. Only fields that exist in the journal's records are emitted — there is
 * no DOI or keyword data to publish, and inventing them would be worse than
 * omitting them. The ISSN pair is the journal's registered identity, so it can
 * be stated on every article. */

import { SITE } from '$lib/config/site';
import type { Article } from './types';
import { articlePath } from './paths';
import { parsePageRange, splitAuthors } from './text';

export type MetaEntry = { name: string; content: string };

export function collectCitationMeta(article: Article, abstract: string, entries: MetaEntry[]): MetaEntry[] {
  const push = (name: string, content: string | number | undefined | null) => {
    if (content === undefined || content === null || content === '') return;
    entries.push({ name, content: String(content) });
  };

  push('citation_title', article.title);
  for (const author of splitAuthors(article.authors)) push('citation_author', author);
  push('citation_journal_title', SITE.fullName);
  /* How Google Scholar ties the article back to the serial it was published in. */
  push('citation_issn', SITE.issn.print);
  push('citation_issn', SITE.issn.online);
  push('citation_publication_date', article.year || undefined);
  push('citation_volume', article.volumeNumber ?? undefined);
  push('citation_issue', article.issueNumber ?? undefined);

  const pages = parsePageRange(article.pages);
  push('citation_firstpage', pages.first);
  push('citation_lastpage', pages.last);

  if (article.hasPdf) push('citation_pdf_url', article.pdf);
  if (abstract && article.slug) push('citation_abstract_html_url', `${SITE.origin}${articlePath(article.slug)}`);
  push('citation_language', 'en');

  return entries;
}
