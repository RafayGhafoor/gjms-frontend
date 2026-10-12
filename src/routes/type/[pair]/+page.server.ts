import { archive } from '$lib/data/archive-index';
import { abstractFor } from '$lib/server/abstracts';
import { NAV_ITEMS } from '$lib/config/site';
import type { PageServerLoad } from './$types';

/* Build-time data for the typography comparison: real published records only. */
export const load: PageServerLoad = ({ params }) => {
  const withAbstract = archive.articles.filter((a) => a.hasPdf && a.authors);
  const lead =
    archive.articles.find((a) => a.slug?.startsWith('impact-of-renewable-and-non-renewable')) ?? withAbstract[0];

  // Three records from different decades, so the list shows real title lengths.
  const picks = [lead, archive.articles[40], archive.articles[200], archive.articles[320]].filter(Boolean);

  return {
    pair: params.pair,
    abstract: abstractFor(lead.pdf) || 'The published abstract for this record was not extractable.',
    articles: picks.slice(0, 3).map((article) => ({
      title: article.title,
      authors: article.authors || 'Author not listed in the archive record',
      venue: `${article.volumeNumber ? `Vol ${article.volumeNumber}` : 'Special edition'}${article.issueNumber ? ` · Issue ${article.issueNumber}` : ''} · ${article.year}`,
      pages: article.pages ? `Pages ${article.pages}` : ''
    })),
    navLabels: NAV_ITEMS.map((item) => item.label),
    totalArticles: archive.stats.articles,
    totalIssues: archive.stats.issues
  };
};
