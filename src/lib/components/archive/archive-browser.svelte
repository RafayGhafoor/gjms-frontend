<script lang="ts">
  import { onMount } from 'svelte';
  import type { Archive, ChartPoint, Issue } from '$lib/data/types';
  import {
    SEARCH_MIN_LENGTH,
    filterArticles,
    filterIssues,
    sortArticles,
    sortIssues,
    type ArchiveFilter
  } from '$lib/data/archive';
  import { formatCount } from '$lib/utils';
  import { issuePath } from '$lib/data/paths';
  import Input from '$lib/components/ui/input.svelte';
  import Select from '$lib/components/ui/select.svelte';
  import Button from '$lib/components/ui/button.svelte';
  import BarChart from '$lib/components/charts/bar-chart.svelte';
  import AreaChart from '$lib/components/charts/area-chart.svelte';
  import ArticleCard from './article-card.svelte';
  import IssueCard from './issue-card.svelte';
  import YearTimeline from './year-timeline.svelte';
  import ChevronDown from '@lucide/svelte/icons/chevron-down';
  import SearchX from '@lucide/svelte/icons/search-x';

  /* The archive browser. Filters live in component state and are mirrored into
     the query string with history.replaceState — no server round trip, no
     navigation, and every view stays deep-linkable
     (/archive.html?year=2025&volume=11&issue=4).
     The prerendered HTML always contains the full archive, so search engines and
     JavaScript-less visitors see every issue and article.
     The charts are deliberately demoted into a collapsed analytics disclosure at
     the foot of the page: the published record, not the statistics, is the
     primary interface here. */
  let { archive }: { archive: Archive } = $props();

  const PAGE_SIZE = 40;
  type YearFilter = number | 'all' | 'special';
  type VolumeFilter = number | 'all' | 'special';
  type SortKey = 'newest' | 'oldest' | 'title';
  type ViewKey = 'archive' | 'articles';

  let q = $state('');
  let year = $state<YearFilter>('all');
  let volume = $state<VolumeFilter>('all');
  let issue = $state<number | 'all'>('all');
  let sort = $state<SortKey>('newest');
  let view = $state<ViewKey>('archive');
  let limit = $state(PAGE_SIZE);
  let expanded = $state<string[]>([]);
  let hydrated = $state(false);

  function parseNumeric(value: string | null): number | 'all' | 'special' {
    if (!value || value === 'all') return 'all';
    if (value === 'special') return 'special';
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 'all';
  }

  onMount(() => {
    const params = new URLSearchParams(location.search);
    q = (params.get('q') ?? '').trim();
    year = parseNumeric(params.get('year'));
    volume = parseNumeric(params.get('volume'));
    const issueParam = parseNumeric(params.get('issue'));
    issue = typeof issueParam === 'number' ? issueParam : 'all';
    const sortParam = params.get('sort');
    sort = sortParam === 'oldest' || sortParam === 'title' ? sortParam : 'newest';
    view = params.get('view') === 'articles' ? 'articles' : 'archive';
    expanded = (params.get('open') ?? '').split(',').map((v) => v.trim()).filter(Boolean);
    hydrated = true;
  });

  $effect(() => {
    if (!hydrated) return;
    const params = new URLSearchParams();
    if (q.trim().length) params.set('q', q.trim());
    if (year !== 'all') params.set('year', String(year));
    if (volume !== 'all') params.set('volume', String(volume));
    if (issue !== 'all') params.set('issue', String(issue));
    if (sort !== 'newest') params.set('sort', sort);
    if (view !== 'archive') params.set('view', 'articles');
    if (expanded.length) params.set('open', expanded.join(','));
    const query = params.toString();
    history.replaceState(null, '', `${location.pathname}${query ? `?${query}` : ''}${location.hash}`);
  });

  const filter = $derived<ArchiveFilter>({ year, volume, issue });
  const showAllArticles = $derived(view === 'articles' || q.trim().length >= SEARCH_MIN_LENGTH);

  const filteredIssues = $derived.by(() => {
    const list = filterIssues(archive.issues, filter);
    if (sort === 'title') return [...list].sort((a, b) => a.title.localeCompare(b.title));
    return sortIssues(list, sort === 'oldest' ? 1 : -1);
  });

  const filteredArticles = $derived.by(() => {
    const list = filterArticles(archive.articles, { ...filter, q });
    if (sort === 'title') return [...list].sort((a, b) => a.title.localeCompare(b.title));
    return sortArticles(list, sort === 'oldest' ? 1 : -1);
  });

  const matchedArticleCount = $derived(
    showAllArticles ? filteredArticles.length : filteredIssues.reduce((total, i) => total + i.articles.length, 0)
  );
  const matchedIssueCount = $derived(
    showAllArticles ? new Set(filteredArticles.map((a) => a.issueId)).size : filteredIssues.length
  );

  const yearGroups = $derived.by(() => {
    const map = new Map<number, Issue[]>();
    filteredIssues.forEach((item) => {
      const bucket = map.get(item.year) ?? [];
      bucket.push(item);
      map.set(item.year, bucket);
    });
    // Year → volume → issue, keeping the sort order chosen above.
    return [...map.entries()].map(([groupYear, list]) => {
      const volumes = new Map<string, Issue[]>();
      list.forEach((item) => {
        const key = item.volumeLabel;
        volumes.set(key, [...(volumes.get(key) ?? []), item]);
      });
      return { year: groupYear, volumes: [...volumes.entries()] };
    });
  });

  const timelineYears = $derived(
    archive.stats.articlesByYear
      .slice()
      .reverse()
      .map((point) => ({
        year: Number(point.label),
        articles: point.value,
        issues: archive.issues.filter((i) => i.year === Number(point.label)).length
      }))
  );

  const volumeOptions = $derived([
    { value: 'all', label: 'All volumes' },
    ...archive.stats.articlesByVolume
      .slice()
      .sort((a, b) => Number(a.label.replace(/\D/g, '')) - Number(b.label.replace(/\D/g, '')))
      .map((point) => ({ value: String(point.label.replace(/\D/g, '')), label: `${point.label} — ${point.value} articles` })),
    { value: 'special', label: 'Special editions' }
  ]);

  const issueOptions = $derived.by(() => {
    const numbers = [
      ...new Set(
        filterIssues(archive.issues, { year, volume }).map((item) => item.issueNumber).filter((n): n is number => n != null)
      )
    ].sort((a, b) => a - b);
    return [
      { value: 'all', label: 'All issues' },
      ...numbers.map((n) => ({ value: String(n), label: `Issue ${n}` }))
    ];
  });

  const activeFilters = $derived.by(() => {
    const chips: string[] = [];
    if (year === 'special' || volume === 'special') chips.push('special editions');
    else {
      if (year !== 'all') chips.push(String(year));
      if (volume !== 'all') chips.push(`volume ${volume}`);
    }
    if (issue !== 'all') chips.push(`issue ${issue}`);
    if (q.trim().length >= SEARCH_MIN_LENGTH) chips.push(`“${q.trim()}”`);
    return chips;
  });

  const visibleArticles = $derived(showAllArticles ? filteredArticles.slice(0, limit) : []);
  const hasFilters = $derived(activeFilters.length > 0 || view !== 'archive');

  function selectVolumeOption(event: Event) {
    const value = (event.currentTarget as HTMLSelectElement).value;
    volume = value === 'all' || value === 'special' ? value : Number(value);
    issue = 'all';
    limit = PAGE_SIZE;
  }

  function selectIssueOption(event: Event) {
    const value = (event.currentTarget as HTMLSelectElement).value;
    issue = value === 'all' ? 'all' : Number(value);
    limit = PAGE_SIZE;
  }

  function yearTotals(volumes: [string, Issue[]][]) {
    const issues = volumes.reduce((total, [, list]) => total + list.length, 0);
    const articles = volumes.reduce(
      (total, [, list]) => total + list.reduce((sum, item) => sum + item.articles.length, 0),
      0
    );
    return { issues, articles };
  }

  function toggleIssue(id: string) {
    expanded = expanded.includes(id) ? expanded.filter((item) => item !== id) : [...expanded, id];
  }

  function expandAll() {
    expanded = filteredIssues.map((item) => item.id);
  }

  function collapseAll() {
    expanded = [];
  }

  function reset() {
    q = '';
    year = 'all';
    volume = 'all';
    issue = 'all';
    sort = 'newest';
    view = 'archive';
    limit = PAGE_SIZE;
    expanded = [];
  }

  function selectYear(value: number | 'special') {
    year = value;
    issue = 'all';
    limit = PAGE_SIZE;
  }

  function selectVolume(value: number) {
    volume = value;
    year = 'all';
    issue = 'all';
    limit = PAGE_SIZE;
  }

  function onYearBar(point: ChartPoint) {
    selectYear(Number(point.label));
  }

  function onVolumeBar(point: ChartPoint) {
    selectVolume(Number(point.label.replace(/\D/g, '')));
  }
</script>

<!-- Filter toolbar -->
<div class="sticky top-[5.0625rem] z-40 border-y border-border bg-background">
  <div class="container-page grid gap-3 py-4">
    <div class="grid gap-3 grid-cols-1 lg:grid-cols-[minmax(14rem,1.6fr)_repeat(2,minmax(9rem,0.8fr))_minmax(9rem,0.7fr)_auto] lg:items-end">
      <Input
        label="Search articles"
        name="archive-search"
        placeholder="Title, author or page range"
        bind:value={q}
        oninput={() => (limit = PAGE_SIZE)}
      />
      <Select
        label="Volume"
        name="archive-volume"
        options={volumeOptions}
        value={volume === 'all' || volume === 'special' ? volume : String(volume)}
        onchange={selectVolumeOption}
      />
      <Select
        label="Issue"
        name="archive-issue"
        options={issueOptions}
        value={issue === 'all' ? 'all' : String(issue)}
        onchange={selectIssueOption}
      />
      <Select
        label="Sort"
        name="archive-sort"
        options={[
          { value: 'newest', label: 'Newest first' },
          { value: 'oldest', label: 'Oldest first' },
          { value: 'title', label: 'Title A–Z' }
        ]}
        bind:value={sort}
      />
      <Button variant="outline" onclick={reset} disabled={!hasFilters}>Reset</Button>
    </div>

    <div class="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
      <div class="inline-flex items-center rounded-md border border-border bg-surface p-0.5" role="group" aria-label="Archive view">
        <button
          type="button"
          class="rounded-[3px] px-3 py-1.5 text-[0.8125rem] font-semibold transition-colors {view === 'archive'
            ? 'bg-muted text-accent-foreground'
            : 'text-muted-foreground hover:text-heading'}"
          aria-pressed={view === 'archive'}
          onclick={() => {
            view = 'archive';
            limit = PAGE_SIZE;
          }}
        >
          Browse by issue
        </button>
        <button
          type="button"
          class="rounded-[3px] px-3 py-1.5 text-[0.8125rem] font-semibold transition-colors {view === 'articles'
            ? 'bg-muted text-accent-foreground'
            : 'text-muted-foreground hover:text-heading'}"
          aria-pressed={view === 'articles'}
          onclick={() => {
            view = 'articles';
            limit = PAGE_SIZE;
          }}
        >
          All articles
        </button>
      </div>

      <div class="flex flex-wrap items-center gap-x-6 gap-y-2 text-[0.9375rem]">
        <p aria-live="polite" aria-atomic="true" class="text-muted-foreground">
          <span class="font-semibold text-heading tabular-nums">{formatCount(matchedArticleCount)}</span>
          {matchedArticleCount === 1 ? 'article' : 'articles'} in
          <span class="font-semibold text-heading tabular-nums">{formatCount(matchedIssueCount)}</span>
          {matchedIssueCount === 1 ? 'issue' : 'issues'}
        </p>
        {#if activeFilters.length}
          <p class="flex items-center gap-3 text-[0.8125rem] text-subtle-foreground">
            <span>Filtered by {activeFilters.join(' · ')}</span>
            <button type="button" class="py-0.5 font-semibold text-accent-foreground hover:underline" onclick={reset}>
              Clear
            </button>
          </p>
        {/if}
      </div>
    </div>
  </div>
</div>

<!-- Timeline + results -->
<div class="container-page grid gap-10 py-12 grid-cols-1 lg:grid-cols-[12rem_minmax(0,1fr)] lg:gap-14">
  <aside class="lg:sticky lg:top-[13rem] lg:self-start">
    <YearTimeline years={timelineYears} />
  </aside>

  <div>
    {#if matchedArticleCount === 0}
      <div class="rounded-lg border border-border bg-surface-muted px-6 py-14 text-center">
        <SearchX class="mx-auto size-7 text-subtle-foreground" aria-hidden="true" />
        <h2 class="mt-4 font-serif text-[1.25rem]">No articles match these filters</h2>
        <p class="measure mx-auto mt-3 text-[0.9375rem] text-muted-foreground">
          Try a different year, volume, issue or search term — or reset the filters to browse the complete archive.
        </p>
        <div class="mt-6">
          <Button variant="outline" onclick={reset}>Reset filters</Button>
        </div>
      </div>
    {:else if showAllArticles}
      <div class="flex flex-wrap items-end justify-between gap-x-8 gap-y-3 border-b border-border-strong pb-4">
        <h2 class="display-2">Articles</h2>
        <p class="text-[0.8125rem] text-subtle-foreground tabular-nums">
          Showing {formatCount(visibleArticles.length)} of {formatCount(filteredArticles.length)}
        </p>
      </div>
      <ol>
        {#each visibleArticles as article (article.issueId + '-' + article.num)}
          <ArticleCard {article} query={q} heading={3} />
        {/each}
      </ol>
      {#if filteredArticles.length > visibleArticles.length}
        <div class="mt-8 flex flex-col items-center gap-3">
          <Button variant="outline" onclick={() => (limit += PAGE_SIZE)}>
            <ChevronDown aria-hidden="true" />
            Show {formatCount(Math.min(PAGE_SIZE, filteredArticles.length - visibleArticles.length))} more
          </Button>
          <p class="text-[0.8125rem] text-subtle-foreground tabular-nums">
            {formatCount(visibleArticles.length)} of {formatCount(filteredArticles.length)} articles
          </p>
        </div>
      {/if}
    {:else}
      <div class="flex flex-wrap items-end justify-between gap-x-8 gap-y-3 border-b border-border-strong pb-4">
        <h2 class="display-2">Browse by year, volume and issue</h2>
        <div class="flex items-center gap-5">
          <button type="button" class="py-0.5 text-[0.8125rem] font-semibold text-accent-foreground hover:underline" onclick={expandAll}>
            Expand all
          </button>
          <button type="button" class="py-0.5 text-[0.8125rem] font-semibold text-accent-foreground hover:underline" onclick={collapseAll}>
            Collapse all
          </button>
        </div>
      </div>

      <div class="grid gap-14">
        {#each yearGroups as yearGroup (yearGroup.year)}
          {@const totals = yearTotals(yearGroup.volumes)}
          <section id="year-{yearGroup.year}" class="scroll-mt-44" aria-labelledby="year-{yearGroup.year}-heading">
            <div class="flex flex-wrap items-baseline gap-x-5 gap-y-2">
              <h3 id="year-{yearGroup.year}-heading" class="font-serif text-[2rem] leading-none font-semibold tabular-nums">
                {yearGroup.year}
              </h3>
              <p class="text-[0.8125rem] text-subtle-foreground">
                {formatCount(totals.issues)}{totals.issues === 1 ? 'issue' : 'issues'} · {formatCount(totals.articles)}
                articles
              </p>
            </div>

            <div class="mt-6 grid gap-10">
              {#each yearGroup.volumes as [volumeLabel, list] (volumeLabel)}
                <div class="grid gap-3">
                  {#if yearGroup.volumes.length > 1 || list.some((item) => item.isSpecial)}
                    <div class="flex items-center gap-4">
                      <h4 class="eyebrow whitespace-nowrap text-accent-foreground">
                        {list[0].isSpecial ? 'Special editions' : `Volume ${list[0].volumeNumber || volumeLabel}`}
                      </h4>
                      <span class="h-px flex-1 bg-border" aria-hidden="true"></span>
                      <span class="text-[0.75rem] whitespace-nowrap text-subtle-foreground">
                        {list.length}{list.length === 1 ? ' issue' : ' issues'}
                      </span>
                    </div>
                  {/if}
                  <!-- One issue per row: titles get the full width and an expanded
                       issue list spreads out instead of squeezing into a column. -->
                  <div>
                    {#each list as item (item.id)}
                      <IssueCard
                        issue={item}
                        query={q}
                        open={expanded.includes(item.id)}
                        ontoggle={() => toggleIssue(item.id)}
                        issueHref={issuePath(item.id)}
                        heading={4}
                      />
                    {/each}
                  </div>
                </div>
              {/each}
            </div>
          </section>
        {/each}
      </div>
    {/if}
  </div>
</div>

<!-- Optional analytics: the charts are here, not in front of the published
     record, and each bar stays a working filter control. -->
<section class="container-page pb-16" aria-labelledby="statistics-heading">
  <details class="group rounded-lg border border-border bg-surface-muted">
    <summary
      class="flex cursor-pointer list-none items-center gap-3 px-6 py-5 [&::-webkit-details-marker]:hidden"
    >
      <ChevronDown class="size-4 shrink-0 text-subtle-foreground transition-transform group-open:rotate-180" aria-hidden="true" />
      <span>
        <span id="statistics-heading" class="font-serif text-[1.1875rem] font-semibold">Archive statistics</span>
        <span class="mt-0.5 block text-[0.8125rem] text-subtle-foreground">
          Articles and issues per year and per volume, counted from the journal's own archive index. Select a bar to
          filter the archive.
        </span>
      </span>
    </summary>

    <div class="grid gap-8 border-t border-border px-6 py-6 lg:grid-cols-3">
      <div>
        <h3 class="eyebrow text-subtle-foreground">Articles per year</h3>
        <p class="mt-2 text-[0.8125rem] text-muted-foreground">
          {formatCount(archive.stats.articles)} articles across {archive.stats.years.length} publication years
        </p>
        <div class="mt-4">
          <BarChart
            points={archive.stats.articlesByYear}
            ariaLabel="Articles published per year"
            onSelect={onYearBar}
            height={150}
          />
        </div>
      </div>

      <div>
        <h3 class="eyebrow text-subtle-foreground">Articles per volume</h3>
        <p class="mt-2 text-[0.8125rem] text-muted-foreground">
          {formatCount(archive.stats.volumes)} numbered volumes
          {#if archive.stats.specialEditions}· {archive.stats.specialEditions} special editions{/if}
        </p>
        <div class="mt-4">
          <BarChart
            points={archive.stats.articlesByVolume}
            ariaLabel="Articles published per volume"
            onSelect={onVolumeBar}
            height={150}
            tone="cyan"
          />
        </div>
      </div>

      <div>
        <h3 class="eyebrow text-subtle-foreground">Issues per year</h3>
        <p class="mt-2 text-[0.8125rem] text-muted-foreground">
          {formatCount(archive.stats.issues)} issues from {archive.stats.firstYear} to {archive.stats.lastYear}
        </p>
        <div class="mt-4">
          <AreaChart points={archive.stats.issuesByYear} ariaLabel="Issues published per year" height={150} />
        </div>
      </div>
    </div>
  </details>
</section>
