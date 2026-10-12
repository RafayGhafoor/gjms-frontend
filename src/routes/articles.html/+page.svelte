<script lang="ts">
  import { onMount } from 'svelte';
  import Seo from '$lib/components/site/seo.svelte';
  import Breadcrumbs from '$lib/components/site/breadcrumbs.svelte';
  import Button from '$lib/components/ui/button.svelte';
  import Card from '$lib/components/ui/card.svelte';
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
  let volume = $state<number | 'all'>('all');
  let sort = $state<SortKey>('newest');
  let limit = $state(PAGE_SIZE);
  let hydrated = $state(false);

  onMount(() => {
    const params = new URLSearchParams(location.search);
    q = (params.get('q') ?? '').trim();
    const yearParam = Number(params.get('year'));
    year = Number.isFinite(yearParam) && params.get('year') ? yearParam : 'all';
    const volumeParam = Number(params.get('volume'));
    volume = Number.isFinite(volumeParam) && params.get('volume') ? volumeParam : 'all';
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
    history.replaceState(null, '', `${location.pathname}${query ? `?${query}` : ''}${location.hash}`);
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
    volume = value === 'all' || value === 'special' ? 'all' : Number(value);
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
  <div class="container-page py-10">
    <Breadcrumbs class="mb-5" items={[{ name: 'Home', href: '/' }, { name: 'Articles' }]} />
    <h1 class="text-3xl font-extrabold tracking-tight lg:text-4xl">Articles</h1>
    <p class="mt-3 max-w-[70ch] text-muted-foreground">
      Every article record published by GJMSSH — {formatCount(archive.stats.articles)} articles across{' '}
      {formatCount(archive.stats.issues)} issues and {formatCount(archive.stats.volumes)} volumes,
      {archive.stats.firstYear}–{archive.stats.lastYear}. Search by title, author or page range, or narrow the list by
      year and volume. To browse by issue, use the <a href="/archive.html">archive</a>.
    </p>
  </div>
</section>

<div class="sticky top-17 z-40 border-b border-glass-border glass lg:top-[6.5rem]">
  <div class="container-page grid gap-3 py-4">
    <div class="grid gap-3 lg:grid-cols-[minmax(14rem,1.6fr)_minmax(9rem,0.9fr)_minmax(9rem,0.9fr)_minmax(9rem,0.8fr)_auto] lg:items-end">
      <Input
        label="Search articles"
        name="article-search"
        placeholder="Title, author or page range"
        bind:value={q}
        oninput={onSearchInput}
      />
      <Select label="Year" name="article-year" options={yearOptions} value={year === 'all' ? 'all' : String(year)} onchange={onYearChange} />
      <Select
        label="Volume"
        name="article-volume"
        options={volumeOptions}
        value={volume === 'all' ? 'all' : String(volume)}
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
      <Button variant="outline" onclick={reset} disabled={!hasFilters}>
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
            {[year !== 'all' ? String(year) : null, volume !== 'all' ? `volume ${volume}` : null].filter(Boolean).join(' · ') ||
              'search'}
          </span>
          <button type="button" class="font-semibold text-accent-foreground hover:underline" onclick={reset}>Clear</button>
        </p>
      {/if}
    </div>
  </div>
</div>

<div class="container-page py-10">
  {#if results.length === 0}
    <Card padding="lg" class="grid justify-items-center gap-3 text-center">
      <SearchX class="size-8 text-subtle-foreground" aria-hidden="true" />
      <h2 class="text-lg font-bold">No articles match your search</h2>
      <p class="max-w-[46ch] text-sm text-muted-foreground">
        Try a shorter search term, a different year or volume — or reset the filters to list every published article.
      </p>
      <Button variant="outline" onclick={reset}>Reset filters</Button>
    </Card>
  {:else}
    <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
      <h2 class="text-xl font-bold tracking-tight">Article records</h2>
      <p class="text-xs text-subtle-foreground">
        Showing {formatCount(visible.length)} of {formatCount(results.length)}
      </p>
    </div>

    <ol class="grid gap-3">
      {#each visible as article (article.issueId + '-' + article.num)}
        <ArticleCard {article} query={q} heading={3} showIssue={true} />
      {/each}
    </ol>

    {#if results.length > visible.length}
      <div class="mt-6 flex flex-col items-center gap-2">
        <Button variant="outline" onclick={() => (limit += PAGE_SIZE)}>
          <ChevronDown aria-hidden="true" />
          Show {formatCount(Math.min(PAGE_SIZE, results.length - visible.length))} more
        </Button>
        <p class="text-xs text-subtle-foreground tabular-nums">{formatCount(visible.length)} of {formatCount(results.length)} articles</p>
      </div>
    {/if}
  {/if}
</div>
