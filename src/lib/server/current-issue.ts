/* Server-only resolution of the journal's CURRENT issue.
 *
 * content.json announces the current issue by its published title
 * ("Vol 12 - No. 1 (Jan - Mar, 2026)"). Where that announcement also exists in
 * archive-data.json we use the archive record — one source of truth per article,
 * with normalised PDF URLs and slugs — and fall back to the announcement's own
 * article list when a new issue has been published but the index has not been
 * rebuilt yet.
 *
 * Importing the archive index pulls in every record, so this module must only
 * ever be reached from a +page.server.ts load.
 */

import { content } from '$lib/data/content';
import { archive } from '$lib/data/archive-index';
import { normalisePdfUrl, sortIssues } from '$lib/data/archive';
import type { Article, Issue, RawArticle } from '$lib/data/types';

export function currentIssueTitle(): string {
  return content.currentIssue.title;
}

/** Match the announced title against the archive index on volume/issue/year. */
export function matchCurrentIssue(): Issue | null {
  const title = currentIssueTitle();
  const volume = Number(title.match(/vol(?:ume)?\.?\s*(\d+)/i)?.[1] ?? NaN);
  const issueNumber = Number(title.match(/no\.?\s*(\d+)/i)?.[1] ?? NaN);
  const year = Number(title.match(/\b(19|20)\d{2}\b/)?.[0] ?? NaN);
  if (!Number.isFinite(volume)) return null;

  const candidates = archive.issues.filter((item) => item.volumeNumber === volume);
  return (
    candidates.find(
      (item) =>
        Number.isFinite(issueNumber) &&
        item.issueNumber === issueNumber &&
        (!Number.isFinite(year) || item.year === year)
    ) ??
    candidates.find((item) => Number.isFinite(year) && item.year === year) ??
    null
  );
}

/** The announced issue's articles, shaped like archive records.
 *  Used only when the announcement has not reached the archive index yet. */
export function announcedIssue(): { title: string; articles: Article[] } {
  const title = currentIssueTitle();
  const volume = Number(title.match(/vol(?:ume)?\.?\s*(\d+)/i)?.[1] ?? NaN);
  const issueNumber = Number(title.match(/no\.?\s*(\d+)/i)?.[1] ?? NaN);
  const year = Number(title.match(/\b(19|20)\d{2}\b/)?.[0] ?? NaN);
  const volumeLabel = Number.isFinite(volume) ? `Vol ${volume}` : 'Special';
  const id = Number.isFinite(volume) && Number.isFinite(issueNumber) ? `vol-${volume}-issue-${issueNumber}` : 'announced';

  const articles = (content.currentIssue.articles as RawArticle[]).map((raw) => {
    const pdf = normalisePdfUrl(raw.pdf);
    return {
      num: String(raw.num ?? '').trim(),
      title: String(raw.title ?? '').trim(),
      authors: String(raw.authors ?? '').trim(),
      pages: raw.pages && raw.pages !== '#' ? String(raw.pages).trim() : '',
      pdf,
      hasPdf: Boolean(pdf) && pdf !== '#',
      slug: String(raw.slug ?? '').trim(),
      abstract: '',
      year: Number.isFinite(year) ? year : 0,
      volumeLabel,
      volumeNumber: Number.isFinite(volume) ? volume : null,
      isSpecial: !Number.isFinite(volume),
      issueNumber: Number.isFinite(issueNumber) ? issueNumber : null,
      issueTitle: title,
      issueId: id
    } satisfies Article;
  });

  return { title, articles };
}

export type IssueSummary = {
  id: string;
  title: string;
  volumeLabel: string;
  volumeNumber: number | null;
  issueNumber: number | null;
  isSpecial: boolean;
  year: number;
  articleCount: number;
};

function summarise(issue: Issue): IssueSummary {
  return {
    id: issue.id,
    title: issue.title,
    volumeLabel: issue.volumeLabel,
    volumeNumber: issue.volumeNumber,
    issueNumber: issue.issueNumber,
    isSpecial: issue.isSpecial,
    year: issue.year,
    articleCount: issue.articles.length
  };
}

/** The most recently published issues, newest first, excluding `excludeId`. */
export function recentIssues(limit = 4, excludeId?: string): IssueSummary[] {
  return sortIssues(
    archive.issues.filter((issue) => issue.id !== excludeId),
    -1
  )
    .slice(0, limit)
    .map(summarise);
}
