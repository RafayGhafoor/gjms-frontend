/* ==========================================================================
   Archive data layer — pure, shared by the server (build-time prerender) and
   the browser (instant filtering).
   --------------------------------------------------------------------------
   It reads the EXISTING archive-data.json and adds only values that are
   directly derivable from what is already stored:

     year          → the year segment of the PDF path, e.g.
                     /2025/Volume%2011/Issue%204,%202025/x.pdf → 2025
                     (fallback: the last 4-digit year in the issue title)
     volumeNumber  → the number in the "volume" field ("Vol 11" → 11)
     issueNumber   → "No. 4" / "No.4" in the issue title
     isSpecial     → volume field without a number ("Special")
     hasPdf        → whether the pdf field holds a URL

   Nothing is invented: no authors, abstracts, keywords, DOIs or metrics are
   synthesised. Fields that are absent in the source stay absent, and every
   count shown in the UI is computed from these records.
   ========================================================================== */

import type {
  Archive,
  ArchiveStats,
  Article,
  ChartPoint,
  Issue,
  RawArticle,
  RawIssue
} from './types';

const YEAR_IN_PATH = /\/(\d{4})\//;
const VOLUME_NUMBER = /vol(?:ume)?\.?\s*(\d+)/i;
const ISSUE_NUMBER = /no\.?\s*(\d+)/i;

function firstYear(value: string | undefined): number | null {
  const match = String(value ?? '').match(YEAR_IN_PATH);
  return match ? Number(match[1]) : null;
}

function titleYear(title: string): number | null {
  const matches = String(title).match(/\b(19|20)\d{2}\b/g);
  return matches?.length ? Number(matches[matches.length - 1]) : null;
}

export function slugify(value: string): string {
  return String(value ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Every http URL on the CDN host 301-redirects to https; normalise for safety. */
export function normalisePdfUrl(url: string | undefined): string {
  if (!url) return '';
  return String(url).trim().replace(/^http:\/\//i, 'https://').replace(/ /g, '%20');
}

function normaliseArticle(raw: RawArticle, issue: Omit<Issue, 'articles'>): Article {
  const pdf = normalisePdfUrl(raw.pdf);
  const title = String(raw.title ?? '').trim();
  return {
    num: String(raw.num ?? '').trim(),
    title,
    authors: String(raw.authors ?? '').trim(),
    pages: raw.pages && raw.pages !== '#' ? String(raw.pages).trim() : '',
    pdf,
    hasPdf: Boolean(pdf) && pdf !== '#',
    year: issue.year,
    volumeLabel: issue.volumeLabel,
    volumeNumber: issue.volumeNumber,
    isSpecial: issue.isSpecial,
    issueNumber: issue.issueNumber,
    issueTitle: issue.title,
    issueId: issue.id,
    search: [title, raw.authors ?? '', raw.pages ?? '', issue.title, issue.volumeLabel, issue.year]
      .join(' ')
      .toLowerCase()
  };
}

function normaliseIssue(raw: RawIssue): Issue {
  const volumeLabel = String(raw.volume ?? '').trim();
  const title = String(raw.title ?? '').trim();
  const articles = Array.isArray(raw.articles) ? raw.articles : [];

  const volumeMatch = volumeLabel.match(VOLUME_NUMBER);
  const volumeNumber = volumeMatch ? Number(volumeMatch[1]) : null;
  const issueMatch = title.match(ISSUE_NUMBER);
  const issueNumber = issueMatch ? Number(issueMatch[1]) : null;

  const year =
    articles.reduce<number | null>((found, article) => found ?? firstYear(article.pdf), null) ??
    titleYear(title) ??
    0;

  const isNumbered = issueNumber != null;
  const id = isNumbered
    ? `${slugify(volumeLabel || 'volume')}-issue-${issueNumber}`
    : `${year}-special-${slugify(
        title
          .replace(/special\s*edition/i, '')
          .replace(/\b(19|20)\d{2}\b/g, '')
          .replace(/[()]/g, ' ')
      ) || 'edition'}`;

  const base: Omit<Issue, 'articles'> = {
    id,
    title,
    volumeLabel,
    volumeNumber,
    isSpecial: volumeNumber == null,
    issueNumber,
    year
  };

  return { ...base, articles: articles.map((article) => normaliseArticle(article, base)) };
}

/** Compare issues. `direction` is 1 (oldest → newest) or -1 (newest first). */
function compareIssues(a: Issue, b: Issue, direction: number): number {
  if (a.year !== b.year) return direction * (a.year - b.year);
  // Special editions always sit after the numbered volumes of the same year.
  if (a.isSpecial !== b.isSpecial) return a.isSpecial ? 1 : -1;
  if (a.volumeNumber !== b.volumeNumber) return direction * ((a.volumeNumber ?? 0) - (b.volumeNumber ?? 0));
  return direction * ((a.issueNumber ?? 0) - (b.issueNumber ?? 0));
}

export function sortIssues(issues: Issue[], direction: number): Issue[] {
  return [...issues].sort((a, b) => compareIssues(a, b, direction));
}

export function sortArticles(articles: Article[], direction: number): Article[] {
  return [...articles].sort((a, b) => {
    if (a.year !== b.year) return direction * (a.year - b.year);
    if (a.volumeNumber !== b.volumeNumber) return direction * ((a.volumeNumber ?? 0) - (b.volumeNumber ?? 0));
    if (a.issueNumber !== b.issueNumber) return direction * ((a.issueNumber ?? 0) - (b.issueNumber ?? 0));
    // Articles keep the order in which the journal published them.
    return 0;
  });
}

export function issueLabel(article: Pick<Article, 'volumeNumber' | 'issueNumber' | 'isSpecial' | 'year'>): string {
  const parts: string[] = [];
  if (article.volumeNumber) parts.push(`Vol ${article.volumeNumber}`);
  else if (article.isSpecial) parts.push('Special Edition');
  if (article.issueNumber) parts.push(`Issue ${article.issueNumber}`);
  if (article.year) parts.push(String(article.year));
  return parts.join(' · ');
}

/* ------------------------------------------------------------------- stats */

function summarise(issues: Issue[], articles: Article[]): ArchiveStats {
  const years = [...new Set(issues.map((issue) => issue.year).filter(Boolean))].sort((a, b) => a - b);
  const numberedVolumes = [...new Set(issues.filter((i) => !i.isSpecial).map((i) => i.volumeNumber!))].sort(
    (a, b) => a - b
  );

  const articlesByYear: ChartPoint[] = years.map((year) => {
    const inYear = articles.filter((article) => article.year === year);
    const issueCount = issues.filter((issue) => issue.year === year).length;
    return {
      label: String(year),
      value: inYear.length,
      hint: `${issueCount} ${issueCount === 1 ? 'issue' : 'issues'}`,
      href: `archive.html?year=${year}`
    };
  });

  const issuesByYear: ChartPoint[] = years.map((year) => ({
    label: String(year),
    value: issues.filter((issue) => issue.year === year).length,
    href: `archive.html?year=${year}`
  }));

  const articlesByVolume: ChartPoint[] = numberedVolumes.map((volume) => {
    const inVolume = issues.filter((issue) => issue.volumeNumber === volume);
    const count = inVolume.reduce((total, issue) => total + issue.articles.length, 0);
    const firstYear = inVolume.length ? Math.min(...inVolume.map((i) => i.year)) : 0;
    const lastYear = inVolume.length ? Math.max(...inVolume.map((i) => i.year)) : 0;
    return {
      label: `Vol ${volume}`,
      value: count,
      hint: firstYear && lastYear ? (firstYear === lastYear ? String(firstYear) : `${firstYear}–${lastYear}`) : '',
      href: `archive.html?volume=${volume}`
    };
  });

  return {
    issues: issues.length,
    articles: articles.length,
    articlesWithPdf: articles.filter((article) => article.hasPdf).length,
    articlesWithAuthors: articles.filter((article) => article.authors).length,
    volumes: numberedVolumes.length,
    specialEditions: issues.filter((issue) => issue.isSpecial).length,
    firstYear: years.length ? years[0] : 0,
    lastYear: years.length ? years[years.length - 1] : 0,
    years: [...years].reverse(),
    articlesByYear,
    issuesByYear,
    articlesByVolume
  };
}

export function buildArchive(raw: RawIssue[]): Archive {
  const issues = (Array.isArray(raw) ? raw : [])
    .map(normaliseIssue)
    .filter((issue) => issue.title.length > 0);
  const articles = issues.flatMap((issue) => issue.articles);
  return { issues, articles, stats: summarise(issues, articles) };
}

/* ---------------------------------------------------------------- filtering */

export type ArchiveFilter = {
  q?: string;
  year?: number | 'all' | 'special';
  volume?: number | 'all' | 'special';
  issue?: number | 'all';
};

export const SEARCH_MIN_LENGTH = 2;

export function matchesIssue(issue: Issue, filter: ArchiveFilter): boolean {
  if (filter.year !== undefined && filter.year !== 'all') {
    if (filter.year === 'special') {
      if (!issue.isSpecial) return false;
    } else if (issue.year !== filter.year) return false;
  }
  if (filter.volume !== undefined && filter.volume !== 'all') {
    if (filter.volume === 'special') {
      if (!issue.isSpecial) return false;
    } else if (issue.volumeNumber !== filter.volume) return false;
  }
  if (filter.issue !== undefined && filter.issue !== 'all' && issue.issueNumber !== filter.issue) return false;
  return true;
}

export function filterIssues(issues: Issue[], filter: ArchiveFilter): Issue[] {
  return issues.filter((issue) => matchesIssue(issue, filter));
}

export function filterArticles(articles: Article[], filter: ArchiveFilter): Article[] {
  const term = (filter.q ?? '').trim().toLowerCase();
  return articles.filter((article) => {
    if (!matchesIssue({ ...article, id: article.issueId, articles: [] }, filter)) return false;
    if (term.length < SEARCH_MIN_LENGTH) return true;
    return article.search.includes(term);
  });
}
