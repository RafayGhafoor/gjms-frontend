/* ==========================================================================
   Academic Nexus — archive page controller
   Filters (year · volume · issue · free text), grouped and flat views,
   deep-linkable URLs, lazy issue panels and on-page structured data.
   ========================================================================== */

import { loadArchive, sortArticles, sortIssues } from './nexus-data.js';
import { articleList, emptyState, escapeHtml, formatCount, issueCard, skeleton, yearBlock } from './nexus-components.js';
import { initChrome } from './nexus-chrome.js';

const PAGE_SIZE = 40;
const SEARCH_MIN = 2;

const state = {
  q: '',
  year: 'all',
  volume: 'all',
  issue: 'all',
  sort: 'newest',
  view: 'archive',
  open: new Set(),
  limit: PAGE_SIZE
};

let db = null;

const dom = {};

function cacheDom() {
  dom.results = document.getElementById('results');
  dom.count = document.getElementById('result-count');
  dom.summary = document.getElementById('filter-summary');
  dom.search = document.getElementById('archive-search');
  dom.searchClear = document.getElementById('search-clear');
  dom.volume = document.getElementById('filter-volume');
  dom.issue = document.getElementById('filter-issue');
  dom.sort = document.getElementById('filter-sort');
  dom.reset = document.getElementById('filter-reset');
  dom.yearRail = document.getElementById('year-rail');
  dom.viewTabs = [...document.querySelectorAll('[data-view]')];
}

/* --------------------------------------------------------------- URL state */

function readUrl() {
  const params = new URLSearchParams(location.search);
  const numeric = (key) => {
    const value = params.get(key);
    if (!value || value === 'all') return 'all';
    if (value === 'special') return 'special';
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 'all';
  };

  state.q = (params.get('q') || '').trim().toLowerCase();
  state.year = numeric('year');
  state.volume = numeric('volume');
  state.issue = numeric('issue');
  state.sort = ['newest', 'oldest', 'title'].includes(params.get('sort')) ? params.get('sort') : 'newest';
  state.view = params.get('view') === 'articles' ? 'articles' : 'archive';
  state.open = new Set((params.get('open') || '').split(',').map((value) => value.trim()).filter(Boolean));

  // A bare "?issue=4" only makes sense with its volume/year, but it is honoured as-is.
  return Boolean(params.get('open') || params.get('year') || params.get('volume') || params.get('issue') || params.get('q'));
}

function syncUrl() {
  const params = new URLSearchParams();
  if (state.q) params.set('q', state.q);
  if (state.year !== 'all') params.set('year', String(state.year));
  if (state.volume !== 'all') params.set('volume', String(state.volume));
  if (state.issue !== 'all') params.set('issue', String(state.issue));
  if (state.sort !== 'newest') params.set('sort', state.sort);
  if (state.view !== 'archive') params.set('view', 'articles');
  if (state.open.size) params.set('open', [...state.open].join(','));

  const query = params.toString();
  history.replaceState(null, '', `${location.pathname}${query ? `?${query}` : ''}${location.hash}`);
}

/* ---------------------------------------------------------------- filtering */

function matchesIssue(issue) {
  if (state.year !== 'all') {
    if (state.year === 'special') {
      if (!issue.isSpecial) return false;
    } else if (issue.year !== state.year) return false;
  }
  if (state.volume !== 'all') {
    if (state.volume === 'special') {
      if (!issue.isSpecial) return false;
    } else if (issue.volumeNumber !== state.volume) return false;
  }
  if (state.issue !== 'all' && issue.issueNumber !== state.issue) return false;
  return true;
}

function isFlatView() {
  return state.view === 'articles' || state.q.length >= SEARCH_MIN;
}

function currentIssues() {
  return db.issues.filter(matchesIssue);
}

function sortedIssues(list) {
  if (state.sort === 'title') return list.slice().sort((a, b) => a.title.localeCompare(b.title));
  return sortIssues(list, state.sort === 'oldest' ? 1 : -1);
}

function currentArticles(issues) {
  const articles = issues.flatMap((issue) => issue.articles).filter((article) => {
    if (state.q.length < SEARCH_MIN) return true;
    return article.search.includes(state.q);
  });
  if (state.sort === 'title') return articles.slice().sort((a, b) => a.title.localeCompare(b.title));
  return sortArticles(articles, state.sort === 'oldest' ? 1 : -1);
}

/* ----------------------------------------------------------------- rendering */

function renderYearRail() {
  const chips = [
    `<button class="year-chip" type="button" data-year="all" aria-pressed="${state.year === 'all'}">All years</button>`
  ];
  db.stats.years.forEach((year) => {
    chips.push(
      `<button class="year-chip" type="button" data-year="${year}" aria-pressed="${String(state.year) === String(year)}">${year}</button>`
    );
  });
  chips.push(
    `<button class="year-chip year-chip--special" type="button" data-year="special" aria-pressed="${state.year === 'special'}">Special editions</button>`
  );
  dom.yearRail.innerHTML = chips.join('');
}

function renderVolumeOptions() {
  const volumes = [...new Set(db.issues.filter((issue) => !issue.isSpecial).map((issue) => issue.volumeNumber))].sort(
    (a, b) => a - b
  );
  const options = [`<option value="all">All volumes</option>`]
    .concat(volumes.map((volume) => `<option value="${volume}">Volume ${volume}</option>`))
    .concat(`<option value="special">Special editions</option>`);
  dom.volume.innerHTML = options.join('');
  dom.volume.value = state.volume === 'all' ? 'all' : String(state.volume);
}

function renderIssueOptions(issues) {
  const numbers = [...new Set(issues.map((issue) => issue.issueNumber).filter((value) => value != null))].sort(
    (a, b) => a - b
  );
  const options = [`<option value="all">All issues</option>`].concat(
    numbers.map((number) => `<option value="${number}">Issue ${number}</option>`)
  );
  dom.issue.innerHTML = options.join('');
  dom.issue.value = state.issue === 'all' ? 'all' : String(state.issue);
  dom.issue.disabled = numbers.length === 0;
}

function renderSummary(matchedIssues, matchedArticleCount) {
  const bits = [];
  if (state.year === 'special' || state.volume === 'special') bits.push('special editions');
  else {
    if (state.year !== 'all') bits.push(String(state.year));
    if (state.volume !== 'all') bits.push(`volume ${state.volume}`);
  }
  if (state.issue !== 'all') bits.push(`issue ${state.issue}`);
  if (state.q.length >= SEARCH_MIN) bits.push(`“${state.q}”`);

  const issueWord = matchedIssues.length === 1 ? 'issue' : 'issues';
  const articleWord = matchedArticleCount === 1 ? 'article' : 'articles';

  dom.count.innerHTML = `<span class="result-count">${formatCount(matchedArticleCount)}</span> ${articleWord} in ${formatCount(
    matchedIssues.length
  )} ${issueWord}`;

  dom.summary.innerHTML = bits.length
    ? `<span>Filtered by ${escapeHtml(bits.join(' · '))}</span>
       <button class="btn btn--ghost btn--sm" type="button" data-reset>Clear filters</button>`
    : `<span>Every issue from ${escapeHtml(db.stats.firstYear)} to ${escapeHtml(db.stats.lastYear)} — ${formatCount(
        db.stats.issues
      )} issues, ${formatCount(db.stats.articles)} articles.</span>`;
}

function renderFlat(articles) {
  const visible = articles.slice(0, state.limit);
  const remaining = articles.length - visible.length;

  const pager = remaining
    ? `<div class="pager">
        <button class="btn btn--outline" type="button" data-load-more>Show ${formatCount(Math.min(PAGE_SIZE, remaining))} more</button>
        <span class="pager__info">Showing ${formatCount(visible.length)} of ${formatCount(articles.length)} articles</span>
      </div>`
    : '';

  return `<section class="results results--flat" aria-label="Article results">
      ${articleList(visible, { headingLevel: 3, showIssueChips: true, query: state.q })}
      ${pager}
    </section>`;
}

function renderGrouped(issues) {
  const byYear = new Map();
  issues.forEach((issue) => {
    if (!byYear.has(issue.year)) byYear.set(issue.year, []);
    byYear.get(issue.year).push(issue);
  });

  return `<div class="results" aria-label="Archive by year">
      ${[...byYear.entries()].map(([year, list]) => yearBlock(year, list, { query: state.q })).join('')}
    </div>`;
}

function applyOpenPanels() {
  dom.results.querySelectorAll('[data-issue-id]').forEach((card) => {
    const isOpen = state.open.has(card.dataset.issueId);
    const toggle = card.querySelector('[data-issue-toggle]');
    const panel = card.querySelector('.issue-card__panel');
    card.dataset.state = isOpen ? 'open' : 'closed';
    if (toggle) toggle.setAttribute('aria-expanded', String(isOpen));
    if (panel) panel.hidden = !isOpen;
  });
}

function render() {
  const issues = currentIssues();
  const flat = isFlatView();
  const articles = flat ? currentArticles(issues) : [];
  const matchedIssues = flat
    ? issues.filter((issue) => issue.articles.some((article) => articles.includes(article)))
    : issues;
  const matchedArticleCount = flat
    ? articles.length
    : matchedIssues.reduce((total, issue) => total + issue.articles.length, 0);

  renderVolumeOptions();
  renderIssueOptions(db.issues.filter((issue) => matchesIssue({ ...issue, issueNumber: null })));
  renderYearRail();
  updateViewTabs();
  renderSummary(matchedIssues, matchedArticleCount);

  if (!matchedArticleCount) {
    dom.results.innerHTML = emptyState({
      title: 'No articles match these filters',
      message: 'Try a different year, volume or search term — or clear the filters to browse the complete archive.',
      actionLabel: 'Clear filters',
      actionHref: 'archive.html'
    });
  } else if (flat) {
    dom.results.innerHTML = renderFlat(articles);
  } else {
    dom.results.innerHTML = renderGrouped(sortedIssues(issues));
    applyOpenPanels();
  }

  injectStructuredData(flat ? articles : matchedIssues.flatMap((issue) => issue.articles));
}

function updateViewTabs() {
  dom.viewTabs.forEach((tab) => {
    tab.setAttribute('aria-pressed', String(tab.dataset.view === state.view));
  });
}

/* --------------------------------------------------------- structured data */

function injectStructuredData(articles) {
  document.querySelectorAll('script[data-nexus-articles]').forEach((node) => node.remove());
  if (!articles.length) return;

  const journal = 'Global Journal of Management, Social Sciences and Humanities';
  const items = articles.slice(0, 100).map((article) => {
    const item = {
      '@type': 'ScholarlyArticle',
      headline: article.title,
      inLanguage: 'en',
      isPartOf: {
        '@type': 'PublicationIssue',
        name: article.issueTitle,
        issueNumber: article.issueNumber == null ? undefined : String(article.issueNumber),
        datePublished: article.year ? String(article.year) : undefined
      },
      pagination: article.pages || undefined,
      url: article.hasPdf ? article.pdf : undefined,
      author: article.authors ? article.authors.split(/,\s*/).map((name) => ({ '@type': 'Person', name })) : undefined,
      publisher: { '@type': 'Organization', name: journal, url: 'https://gjmsweb.com/' }
    };
    return JSON.parse(JSON.stringify(item));
  });

  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.dataset.nexusArticles = 'true';
  script.textContent = JSON.stringify({ '@context': 'https://schema.org', '@graph': items });
  document.head.appendChild(script);
}

/* ------------------------------------------------------------------- events */

function debounce(fn, wait) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), wait);
  };
}

function resetAll() {
  state.q = '';
  state.year = 'all';
  state.volume = 'all';
  state.issue = 'all';
  state.sort = 'newest';
  state.view = 'archive';
  state.limit = PAGE_SIZE;
  if (dom.search) dom.search.value = '';
  if (dom.sort) dom.sort.value = 'newest';
  syncUrl();
  render();
}

function bindEvents() {
  dom.search.addEventListener(
    'input',
    debounce(() => {
      state.q = dom.search.value.trim().toLowerCase();
      state.limit = PAGE_SIZE;
      syncUrl();
      render();
      if (dom.searchClear) dom.searchClear.hidden = !state.q;
    }, 160)
  );

  if (dom.searchClear) {
    dom.searchClear.addEventListener('click', () => {
      dom.search.value = '';
      state.q = '';
      state.limit = PAGE_SIZE;
      dom.search.focus();
      syncUrl();
      render();
      dom.searchClear.hidden = true;
    });
  }

  dom.volume.addEventListener('change', () => {
    state.volume = dom.volume.value === 'all' || dom.volume.value === 'special' ? dom.volume.value : Number(dom.volume.value);
    state.year = 'all';
    state.issue = 'all';
    syncUrl();
    render();
  });

  dom.issue.addEventListener('change', () => {
    state.issue = dom.issue.value === 'all' ? 'all' : Number(dom.issue.value);
    syncUrl();
    render();
  });

  dom.sort.addEventListener('change', () => {
    state.sort = dom.sort.value;
    syncUrl();
    render();
  });

  dom.yearRail.addEventListener('click', (event) => {
    const chip = event.target.closest('[data-year]');
    if (!chip) return;
    const value = chip.dataset.year;
    state.year = value === 'all' || value === 'special' ? value : Number(value);
    state.issue = 'all';
    syncUrl();
    render();
    dom.yearRail.querySelector(`[data-year="${value}"]`)?.focus();
  });

  document.addEventListener('click', (event) => {
    if (event.target.closest('[data-reset]')) resetAll();
  });

  dom.results.addEventListener('click', (event) => {
    const toggle = event.target.closest('[data-issue-toggle]');
    if (toggle) {
      const id = toggle.dataset.issueToggle;
      const card = toggle.closest('.issue-card');
      const panel = card.querySelector('.issue-card__panel');
      const open = toggle.getAttribute('aria-expanded') !== 'true';
      toggle.setAttribute('aria-expanded', String(open));
      panel.hidden = !open;
      card.dataset.state = open ? 'open' : 'closed';
      if (open) state.open.add(id);
      else state.open.delete(id);
      syncUrl();
      return;
    }

    if (event.target.closest('[data-load-more]')) {
      state.limit += PAGE_SIZE;
      render();
    }
  });

  document.addEventListener('keydown', (event) => {
    const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName || '');
    if (event.key === '/' && !typing) {
      event.preventDefault();
      dom.search.focus();
    }
    if (event.key === 'Escape' && document.activeElement === dom.search && dom.search.value) {
      dom.search.value = '';
      state.q = '';
      syncUrl();
      render();
      if (dom.searchClear) dom.searchClear.hidden = true;
    }
  });
}

/* --------------------------------------------------------------------- init */

async function init() {
  cacheDom();
  initChrome(document);
  dom.results.innerHTML = skeleton(6);

  const deepLinked = readUrl();
  if (dom.search) dom.search.value = state.q;
  if (dom.sort) dom.sort.value = state.sort;
  if (dom.searchClear) dom.searchClear.hidden = !state.q;

  try {
    db = await loadArchive('archive-data.json');
  } catch (error) {
    console.error(error);
    dom.results.innerHTML = emptyState({
      title: 'The archive could not be loaded',
      message: 'The article index (archive-data.json) did not respond. Please refresh the page, or open the archive again in a moment.',
      actionLabel: 'Reload',
      actionHref: 'archive.html'
    });
    if (dom.count) dom.count.textContent = 'Archive unavailable';
    return;
  }

  document.querySelectorAll('[data-stat]').forEach((node) => {
    const value = db.stats[node.dataset.stat];
    if (value != null) node.textContent = typeof value === 'number' ? formatCount(value) : String(value);
  });

  const yearsNode = document.querySelector('[data-year-range]');
  if (yearsNode) yearsNode.textContent = `${db.stats.firstYear}–${db.stats.lastYear}`;

  syncUrl();
  render();
  bindEvents();

  if (deepLinked && state.open.size) {
    const first = dom.results.querySelector(`[data-issue-id="${[...state.open][0]}"]`);
    if (first) {
      first.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center' });
    } else if (state.year !== 'all' || state.volume !== 'all') {
      dom.results.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  document.body.dataset.archiveReady = 'true';
}

init();
