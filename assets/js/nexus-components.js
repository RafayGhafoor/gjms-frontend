/* ==========================================================================
   Academic Nexus — reusable render components
   Pure functions that turn the existing archive data into markup. Used by the
   archive page today; the same components (article / issue / year block) are
   intended for the current-issue, search and article pages.
   ========================================================================== */

export function escapeHtml(value) {
  return String(value == null ? '' : value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[character]);
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Escape a string and wrap every case-insensitive match of `query` in <mark>. */
export function highlight(value, query) {
  const text = String(value == null ? '' : value);
  const term = String(query || '').trim();
  if (term.length < 2) return escapeHtml(text);

  const pattern = new RegExp(`(${escapeRegExp(term)})`, 'gi');
  return text
    .split(pattern)
    .map((part) => (part.toLowerCase() === term.toLowerCase() ? `<mark class="mark">${escapeHtml(part)}</mark>` : escapeHtml(part)))
    .join('');
}

export function formatCount(value) {
  return Number(value || 0).toLocaleString('en-US');
}

export function formatPages(pages) {
  const value = String(pages || '').trim();
  if (!value) return '';
  if (value.includes('-')) {
    const [from, to] = value.split('-');
    if (from && to) return `pp. ${from.trim()}–${to.trim()}`;
  }
  return /^[0-9]+$/.test(value) ? `p. ${value}` : value;
}

/** Short, factual publication label: "Vol 11 · Issue 4 · 2025". */
export function issueLabel(article) {
  const parts = [];
  if (article.volumeNumber) parts.push(`Vol ${article.volumeNumber}`);
  else if (article.isSpecial) parts.push('Special Edition');
  if (article.issueNumber) parts.push(`Issue ${article.issueNumber}`);
  if (article.year) parts.push(String(article.year));
  return parts.join(' · ');
}

/**
 * Article card.
 * Renders only fields that exist in the data — no abstract, keywords, DOI or
 * category is shown unless the source provides one.
 */
export function articleCard(article, options = {}) {
  const { headingLevel = 4, showIssueChips = true, query = '' } = options;
  const heading = `h${headingLevel}`;
  const chips = [];

  if (showIssueChips) {
    const volume = article.volumeNumber ? `Vol ${article.volumeNumber}` : article.isSpecial ? 'Special Edition' : '';
    if (volume) chips.push(`<span class="meta-chip meta-chip--accent">${escapeHtml(volume)}</span>`);
    if (article.issueNumber) chips.push(`<span class="meta-chip">Issue ${escapeHtml(article.issueNumber)}</span>`);
    if (article.year) chips.push(`<span class="meta-chip">${escapeHtml(article.year)}</span>`);
  }
  if (article.pages) chips.push(`<span class="meta-chip">${escapeHtml(formatPages(article.pages))}</span>`);

  const action = article.hasPdf
    ? `<a class="btn btn--primary btn--sm" href="${escapeHtml(article.pdf)}" target="_blank" rel="noopener noreferrer"
          aria-label="Open the PDF of ${escapeHtml(article.title)} in a new tab">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M12 3v12m0 0l-4-4m4 4l4-4M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
        </svg>Open PDF
      </a>`
    : '<span class="pdf-unavailable">PDF not available</span>';

  return `<li class="article-card" id="a-${escapeHtml(article.issueId)}-${escapeHtml(String(article.num))}">
      <span class="article-card__index" aria-hidden="true">${escapeHtml(String(article.num))}</span>
      <div class="article-card__body">
        <${heading} class="article-card__title">${highlight(article.title, query)}</${heading}>
        ${article.authors ? `<p class="article-card__authors">${highlight(article.authors, query)}</p>` : ''}
        ${chips.length ? `<div class="article-card__meta">${chips.join('')}</div>` : ''}
      </div>
      <div class="article-card__action">${action}</div>
    </li>`;
}

export function articleList(articles, options = {}) {
  if (!articles.length) return '';
  return `<ol class="article-list">${articles.map((article) => articleCard(article, options)).join('')}</ol>`;
}

/**
 * Issue card: heading row + a lazily revealed article list. The article markup
 * is always present in the DOM (crawlable) and hidden with the `hidden`
 * attribute until the reader expands the issue.
 */
export function issueCard(issue, options = {}) {
  const { headingLevel = 4, query = '' } = options;
  const heading = `h${headingLevel}`;
  const panelId = `panel-${issue.id}`;
  const volume = issue.volumeNumber ? `Vol ${issue.volumeNumber}` : 'Special Edition';
  const articleWord = issue.articles.length === 1 ? 'article' : 'articles';

  const chips = [`<span class="meta-chip meta-chip--accent">${escapeHtml(volume)}</span>`];
  if (issue.issueNumber) chips.push(`<span class="meta-chip">Issue ${escapeHtml(issue.issueNumber)}</span>`);
  if (issue.year) chips.push(`<span class="meta-chip">${escapeHtml(issue.year)}</span>`);
  if (issue.isSpecial) chips.push('<span class="badge">Special</span>');

  return `<article class="issue-card" id="${escapeHtml(issue.id)}" data-issue-id="${escapeHtml(issue.id)}" data-state="closed">
      <div class="issue-card__body">
        <p class="issue-card__eyebrow">${chips.join('')}</p>
        <${heading} class="issue-card__title">${highlight(issue.title, query)}</${heading}>
        <div class="issue-card__foot">
          <span class="issue-card__articles">${formatCount(issue.articles.length)} ${articleWord}</span>
          <button class="issue-card__toggle" type="button" aria-expanded="false" aria-controls="${escapeHtml(panelId)}"
                  data-issue-toggle="${escapeHtml(issue.id)}">
            Browse
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 8l4 4 4-4" /></svg>
          </button>
        </div>
      </div>
      <div class="issue-card__panel" id="${escapeHtml(panelId)}" hidden>
        <div class="issue-card__panel-inner">
          ${articleList(issue.articles, { headingLevel: Math.min(headingLevel + 1, 6), showIssueChips: false, query })}
        </div>
      </div>
    </article>`;
}

/** Year → volume → issue tree, always rendered in full for crawlability. */
export function yearBlock(year, issues, options = {}) {
  const { query = '' } = options;
  const articleCount = issues.reduce((total, issue) => total + issue.articles.length, 0);
  const volumeLabels = [...new Set(issues.map((issue) => issue.volumeLabel))];

  const volumeGroups = volumeLabels
    .map((label) => {
      const inVolume = issues.filter((issue) => issue.volumeLabel === label);
      const count = inVolume.reduce((total, issue) => total + issue.articles.length, 0);
      const isSpecial = inVolume.every((issue) => issue.isSpecial);
      return `<section class="volume-group" id="year-${escapeHtml(year)}-${escapeHtml(issueSlug(label))}">
          <div class="volume-group__head">
            <h3 class="volume-group__title">${escapeHtml(isSpecial ? 'Special Editions' : `Volume ${inVolume[0].volumeNumber || label}`)}</h3>
            <span class="volume-group__rule" aria-hidden="true"></span>
            <span class="volume-group__count">${formatCount(inVolume.length)} ${inVolume.length === 1 ? 'issue' : 'issues'} · ${formatCount(count)} articles</span>
          </div>
          <div class="issue-grid">${inVolume.map((issue) => issueCard(issue, { headingLevel: 4, query })).join('')}</div>
        </section>`;
    })
    .join('');

  return `<section class="year-block reveal is-visible" id="year-${escapeHtml(year)}" aria-labelledby="year-${escapeHtml(year)}-heading">
      <div class="year-block__header">
        <h2 class="year-block__year" id="year-${escapeHtml(year)}-heading">${escapeHtml(year)}</h2>
        <span class="year-block__count">${formatCount(issues.length)} ${issues.length === 1 ? 'issue' : 'issues'} · ${formatCount(articleCount)} articles</span>
        <a class="year-block__link" href="#archive-top">Back to top ↑</a>
      </div>
      ${volumeGroups}
    </section>`;
}

function issueSlug(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function emptyState(options = {}) {
  const { title = 'No matching articles', message = '', actionLabel = '', actionHref = '' } = options;
  return `<div class="empty-state" role="status">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true">
        <circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" />
      </svg>
      <h2>${escapeHtml(title)}</h2>
      ${message ? `<p>${escapeHtml(message)}</p>` : ''}
      ${actionLabel && actionHref ? `<a class="btn btn--outline" href="${escapeHtml(actionHref)}">${escapeHtml(actionLabel)}</a>` : ''}
    </div>`;
}

export function skeleton(rows = 5) {
  return `<div class="skeleton" aria-hidden="true">${'<div class="skeleton__row"></div>'.repeat(rows)}</div>`;
}
