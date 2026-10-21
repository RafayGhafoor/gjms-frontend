<script lang="ts">
  import { onMount } from 'svelte';
  import Seo from '$lib/components/site/seo.svelte';
  import Breadcrumbs from '$lib/components/site/breadcrumbs.svelte';
  import Button from '$lib/components/ui/button.svelte';
  import Input from '$lib/components/ui/input.svelte';
  import Select from '$lib/components/ui/select.svelte';
  import ArticleCard from '$lib/components/archive/article-card.svelte';
  import { archive } from '$lib/data/archive-index';
  import { SEARCH_MIN_LENGTH, filterArticles, sortArticles, type ArchiveFilter } from '$lib/data/archive';
  import { breadcrumbNode, collectionPageNode, scholarlyArticleNode, webPageNode } from '$lib/seo';
  import { formatCount } from '$lib/utils';
  import ChevronDown from '@lucide/svelte/icons/chevron-down';
  import RotateCcw from '@lucide/svelte/icons/rotate-ccw';
  import SearchX from '@lucide/svelte/icons/search-x';

  /* Full article index. The default (unfiltered, newest-first) view is
     prerendered in the HTML for search engines; filtering then happens in the
     browser over the data chunk, with the query mirrored into the URL. */

  const PAGE_SIZE = 40;
  type SortKey = 'newest' | 'oldest' | 'title';

  let q = $state('');
  let year = $state<number | 'all'>('all');
  let volume = $state<number | 'all' | 'special'>('all');
  let sort = $state<SortKey>('newest');
  let limit = $state(PAGE_SIZE);
  let hydrated = $state(false);
  /* Discrete filter changes push a history entry so Back undoes them; typing in
     the search box replaces instead, so Back never walks a keystroke trail.
     Plain `let` on purpose: the effect reads it without depending on it. */
  let lastFilters = '';

  onMount(() => {
    const params = new URLSearchParams(location.search);
    q = (params.get('q') ?? '').trim();
    const yearParam = Number(params.get('year'));
    year = Number.isFinite(yearParam) && params.get('year') ? yearParam : 'all';
    const volumeParam = params.get('volume');
    volume =
      volumeParam === 'special'
        ? 'special'
        : volumeParam && Number.isFinite(Number(volumeParam))
          ? Number(volumeParam)
          : 'all';
    const sortParam = params.get('sort');
    sort = sortParam === 'oldest' || sortParam === 'title' ? sortParam : 'newest';
    hydrated = true;
  });

  $effect(() => {
    if (!hydrated) return;
    const params = new URLSearchParams();
    if (q.trim().length) params.set('q', q.trim());
    if (year !== 'all') params.set('year', String(year));
    if (volume !== 'all') params.set('volume', String(volume));
    if (sort !== 'newest') params.set('sort', sort);
    const query = params.toString();
    const url = `${location.pathname}${query ? `?${query}` : ''}${location.hash}`;
    const filtersKey = `${year}|${volume}|${sort}`;
    const push = lastFilters !== '' && filtersKey !== lastFilters;
    lastFilters = filtersKey;
    if (push) history.pushState(null, '', url);
    else history.replaceState(null, '', url);
  });

  const filter = $derived<ArchiveFilter>({ q, year, volume });

  const results = $derived.by(() => {
    const list = filterArticles(archive.articles, filter);
    if (sort === 'title') return [...list].sort((a, b) => a.title.localeCompare(b.title));
    return sortArticles(list, sort === 'oldest' ? 1 : -1);
  });

  const visible = $derived(results.slice(0, limit));
  const hasFilters = $derived(q.trim().length > 0 || year !== 'all' || volume !== 'all' || sort !== 'newest');

  const yearOptions = $derived([
    { value: 'all', label: 'All years' },
    ...archive.stats.years.map((value) => ({ value: String(value), label: `${value} (${archive.stats.articlesByYear.find((p) => p.label === String(value))?.value ?? 0} articles)` }))
  ]);

  const volumeOptions = $derived([
    { value: 'all', label: 'All volumes' },
    ...archive.stats.articlesByVolume
      .slice()
      .sort((a, b) => Number(a.label.replace(/\D/g, '')) - Number(b.label.replace(/\D/g, '')))
      .map((point) => ({ value: String(point.label.replace(/\D/g, '')), label: `${point.label} (${point.value} articles)` })),
    { value: 'special', label: 'Special editions' }
  ]);

  function reset() {
    q = '';
    year = 'all';
    volume = 'all';
    sort = 'newest';
    limit = PAGE_SIZE;
  }

  function onSearchInput() {
    limit = PAGE_SIZE;
  }

  function onYearChange(event: Event) {
    const value = (event.currentTarget as HTMLSelectElement).value;
    year = value === 'all' ? 'all' : Number(value);
    limit = PAGE_SIZE;
  }

  function onVolumeChange(event: Event) {
    const value = (event.currentTarget as HTMLSelectElement).value;
    volume = value === 'all' ? 'all' : value === 'special' ? 'special' : Number(value);
    limit = PAGE_SIZE;
  }

  const description = `Search all ${archive.stats.articles} articles published by the Global Journal of Management, Social Sciences and Humanities (GJMSSH) by title, author, year, volume or issue — with direct links to the full text PDFs.`;
</script>

<Seo
  title="Articles"
  {description}
  path="/articles.html"
  jsonLd={[
    breadcrumbNode([
      { name: 'Home', path: '/' },
      { name: 'Articles', path: '/articles.html' }
    ]),
    webPageNode({ path: '/articles.html', name: 'Article index', description }),
    collectionPageNode({ path: '/articles.html', name: 'All published articles', description }),
    ...results.slice(0, 100).map((article) => scholarlyArticleNode(article))
  ]}
/>

<section class="border-b border-border bg-surface-muted">
  <div class="container-page pt-10 pb-12 lg:pt-14 lg:pb-16">
    <Breadcrumbs class="mb-6" items={[{ name: 'Home', href: '/' }, { name: 'Articles' }]} />
    <p class="eyebrow text-accent-foreground">Article index</p>
    <h1 class="display-1 mt-3">Articles</h1>
    <p class="measure mt-4 text-muted-foreground">
      Every article record published by GJMSSH — {formatCount(archive.stats.articles)} articles across{' '}
      {formatCount(archive.stats.issues)} issues and {formatCount(archive.stats.volumes)} volumes,
      {archive.stats.firstYear}–{archive.stats.lastYear}. Search by title, author or page range, or narrow the list by
      year and volume. To browse by issue, use the <a class="text-accent-foreground underline underline-offset-2 hover:text-heading" href="/archive.html">archive</a>.
    </p>
  </div>
</section>

<div class="sticky top-[5.0625rem] z-40 border-b border-border bg-background">
  <div class="container-page grid gap-3 py-4">
    <div class="grid grid-cols-2 items-end gap-3 lg:grid-cols-[minmax(14rem,1.6fr)_minmax(9rem,0.9fr)_minmax(9rem,0.9fr)_minmax(9rem,0.8fr)_auto]">
      <Input
        label="Search articles"
        name="article-search"
        class="col-span-2 lg:col-span-1"
        placeholder="Title, author or page range"
        bind:value={q}
        oninput={onSearchInput}
      />
      <Select label="Year" name="article-year" options={yearOptions} value={year === 'all' ? 'all' : String(year)} onchange={onYearChange} />
      <Select
        label="Volume"
        name="article-volume"
        options={volumeOptions}
        value={String(volume)}
        onchange={onVolumeChange}
      />
      <Select
        label="Sort"
        name="article-sort"
        options={[
          { value: 'newest', label: 'Newest first' },
          { value: 'oldest', label: 'Oldest first' },
          { value: 'title', label: 'Title A–Z' }
        ]}
        bind:value={sort}
      />
      <Button variant="outline" class="h-9" onclick={reset} disabled={!hasFilters}>
        <RotateCcw aria-hidden="true" />
        Reset
      </Button>
    </div>

    <div class="flex flex-wrap items-center justify-between gap-3 text-sm">
      <p aria-live="polite" aria-atomic="true" class="text-muted-foreground">
        <span class="font-semibold text-foreground">{formatCount(results.length)}</span>
        {results.length === 1 ? 'article' : 'articles'}
        {#if q.trim().length >= SEARCH_MIN_LENGTH}&nbsp;matching “{q.trim()}”{/if}
      </p>
      {#if hasFilters}
        <p class="flex items-center gap-2 text-xs text-subtle-foreground">
          <span>
            Filtered by
            {[
              year !== 'all' ? String(year) : null,
              volume === 'special' ? 'special editions' : volume !== 'all' ? `volume ${volume}` : null
            ]
              .filter(Boolean)
              .join(' · ') || 'search'}
          </span>
          <button type="button" class="py-0.5 font-semibold text-accent-foreground hover:underline" onclick={reset}>Clear</button>
        </p>
      {/if}
    </div>
  </div>
</div>

<div class="container-page py-12">
  {#if results.length === 0}
    <div class="rounded-lg border border-border bg-surface-muted px-6 py-14 text-center">
      <SearchX class="mx-auto size-7 text-subtle-foreground" aria-hidden="true" />
      <h2 class="mt-4 font-serif text-[1.25rem]">No articles match your search</h2>
      <p class="measure mx-auto mt-3 text-[0.9375rem] text-muted-foreground">
        Try a shorter search term, a different year or volume — or reset the filters to list every published article.
      </p>
      <div class="mt-6">
        <Button variant="outline" onclick={reset}>Reset filters</Button>
      </div>
    </div>
  {:else}
    <div class="flex flex-wrap items-end justify-between gap-x-8 gap-y-3 border-b border-border-strong pb-4">
      <h2 class="display-2">Article records</h2>
      <p class="text-[0.8125rem] text-subtle-foreground tabular-nums">
        Showing {formatCount(visible.length)} of {formatCount(results.length)}
      </p>
    </div>

    <ol>
      {#each visible as article (article.issueId + '-' + article.num)}
        <ArticleCard {article} query={q} heading={3} showIssue={true} />
      {/each}
    </ol>

    <noscript>
      <p class="mt-6 text-[0.9375rem] text-muted-foreground">
        Filtering, sorting and paging need JavaScript. Every issue is still browsable as its own page from the
        <a class="text-accent-foreground underline underline-offset-2" href="/archive.html">archive</a>.
      </p>
    </noscript>

    {#if results.length > visible.length}
      <div class="mt-8 flex flex-col items-center gap-3">
        <Button variant="outline" onclick={() => (limit += PAGE_SIZE)}>
          <ChevronDown aria-hidden="true" />
          Show {formatCount(Math.min(PAGE_SIZE, results.length - visible.length))} more
        </Button>
        <p class="text-[0.8125rem] text-subtle-foreground tabular-nums">
          {formatCount(visible.length)} of {formatCount(results.length)} articles
        </p>
      </div>
    {/if}
  {/if}
</div>
