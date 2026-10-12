/* ==========================================================================
   Academic Nexus — archive data layer
   --------------------------------------------------------------------------
   Reads the EXISTING archive-data.json without altering its shape and adds
   only values that are directly derivable from what is already stored:

     year         → the year segment of the PDF path, e.g.
                    /2025/Volume%2011/Issue%204,%202025/x.pdf  →  2025
                    (fallback: the last 4-digit year in the issue title)
     volumeNumber → the number in the "volume" field ("Vol 11" → 11)
     isSpecial    → volume field "Special"
     issueNumber  → "No. 4" / "No.4" in the issue title
     hasPdf       → whether the pdf field holds a URL

   Nothing is invented: no authors, abstracts, keywords, DOIs or counts are
   synthesised. Fields that are absent in the source stay absent.
   ========================================================================== */

const YEAR_IN_PATH = /\/(\d{4})\//;
const VOLUME_NUMBER = /vol(?:ume)?\.?\s*(\d+)/i;
const ISSUE_NUMBER = /no\.?\s*(\d+)/i;

function firstYear(value) {
  const match = String(value || '').match(YEAR_IN_PATH);
  return match ? Number(match[1]) : null;
}

function titleYear(title) {
  const matches = String(title || '').match(/\b(19|20)\d{2}\b/g);
  return matches && matches.length ? Number(matches[matches.length - 1]) : null;
}

/** Upgrade the CDN links to https: every http URL on this host 301-redirects. */
export function normalisePdfUrl(url) {
  if (!url) return '';
  return String(url).trim().replace(/^http:\/\//i, 'https://').replace(/ /g, '%20');
}

function slug(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function normaliseArticle(raw, issue) {
  const pdf = normalisePdfUrl(raw.pdf);
  const title = String(raw.title || '').trim();
  return {
    num: raw.num,
    title,
    authors: raw.authors ? String(raw.authors).trim() : '',
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
    search: [title, raw.authors || '', raw.pages || '', issue.title, issue.volumeLabel, issue.year]
      .join(' ')
      .toLowerCase()
  };
}

function normaliseIssue(raw) {
  const volumeLabel = String(raw.volume || '').trim();
  const title = String(raw.title || '').trim();
  const articles = Array.isArray(raw.articles) ? raw.articles : [];

  const volumeMatch = volumeLabel.match(VOLUME_NUMBER);
  const volumeNumber = volumeMatch ? Number(volumeMatch[1]) : null;
  const issueMatch = title.match(ISSUE_NUMBER);

  const issue = {
    title,
    volumeLabel,
    volumeNumber,
    isSpecial: !volumeNumber,
    issueNumber: issueMatch ? Number(issueMatch[1]) : null,
    year: null,
    articles: []
  };

  issue.year = articles.reduce((found, article) => found || firstYear(article.pdf), null) || titleYear(title);

  const suffix = issue.issueNumber ? `issue-${issue.issueNumber}` : `special-${slug(title)}`;
  issue.id = `${slug(volumeLabel || 'special')}-${suffix}`;

  issue.articles = articles.map((article) => normaliseArticle(article, issue));
  return issue;
}

/** Compare two issues. `direction` is 1 (oldest → newest) or -1 (newest first). */
function compareIssues(a, b, direction) {
  if (a.year !== b.year) return direction * (a.year - b.year);
  // Special editions always sit after the numbered volumes of the same year.
  if (a.isSpecial !== b.isSpecial) return a.isSpecial ? 1 : -1;
  if (a.volumeNumber !== b.volumeNumber) return direction * ((a.volumeNumber || 0) - (b.volumeNumber || 0));
  return direction * ((a.issueNumber || 0) - (b.issueNumber || 0));
}

export function sortIssues(issues, direction) {
  return issues.slice().sort((a, b) => compareIssues(a, b, direction));
}

export function sortArticles(articles, direction) {
  return articles.slice().sort((a, b) => {
    if (a.year !== b.year) return direction * (a.year - b.year);
    if (a.volumeNumber !== b.volumeNumber) return direction * ((a.volumeNumber || 0) - (b.volumeNumber || 0));
    if (a.issueNumber !== b.issueNumber) return direction * ((a.issueNumber || 0) - (b.issueNumber || 0));
    return 0; // keep the source ordering within an issue
  });
}

export function summarise(issues) {
  const years = issues.map((issue) => issue.year).filter(Boolean);
  const volumes = new Set(issues.filter((i) => !i.isSpecial).map((i) => i.volumeNumber));
  return {
    issues: issues.length,
    articles: issues.reduce((total, issue) => total + issue.articles.length, 0),
    articlesWithPdf: issues.reduce((total, issue) => total + issue.articles.filter((a) => a.hasPdf).length, 0),
    authors: issues.reduce((total, issue) => total + issue.articles.filter((a) => a.authors).length, 0),
    volumes: volumes.size,
    specialEditions: issues.filter((i) => i.isSpecial).length,
    firstYear: years.length ? Math.min(...years) : null,
    lastYear: years.length ? Math.max(...years) : null,
    years: [...new Set(years)].sort((a, b) => b - a)
  };
}

export async function loadArchive(url = 'archive-data.json') {
  const response = await fetch(url, { cache: 'no-cache' });
  if (!response.ok) throw new Error(`archive-data.json request failed: ${response.status}`);
  const raw = await response.json();
  if (!Array.isArray(raw)) throw new Error('archive-data.json is not an array of issues');

  const issues = raw.map(normaliseIssue).filter((issue) => issue.articles.length > 0 || issue.title);
  const articles = issues.flatMap((issue) => issue.articles);

  return { issues, articles, stats: summarise(issues) };
}
