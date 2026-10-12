<script lang="ts">
  import { page } from '$app/state';
  import type { Issue } from '$lib/data/types';
  import { formatPages } from '$lib/utils';
  import Badge from '$lib/components/ui/badge.svelte';
  import Button from '$lib/components/ui/button.svelte';
  import ArticleCard from './article-card.svelte';
  import ArrowRight from '@lucide/svelte/icons/arrow-right';
  import CalendarDays from '@lucide/svelte/icons/calendar-days';
  import FileText from '@lucide/svelte/icons/file-text';
  import Library from '@lucide/svelte/icons/library';

  /* Full issue view. This page is the crawlable home of every article record,
     so the article list is plain prerendered HTML. */
  let {
    issue,
    newer = null,
    older = null,
    siblings = []
  }: { issue: Issue; newer?: Issue | null; older?: Issue | null; siblings?: Issue[] } = $props();

  /* Page range covered by the issue, derived from the article page ranges. */
  const pageRange = $derived.by(() => {
    const starts = issue.articles
      .map((article) => Number(String(article.pages).split('-')[0]))
      .filter((value) => Number.isFinite(value) && value > 0);
    const ends = issue.articles
      .map((article) => Number(String(article.pages).split('-')[1] ?? String(article.pages).split('-')[0]))
      .filter((value) => Number.isFinite(value) && value > 0);
    if (!starts.length || !ends.length) return '';
    const from = Math.min(...starts);
    const to = Math.max(...ends);
    return from === to ? formatPages(String(from)) : `Pages ${from}–${to}`;
  });

  /* Passed in from the page's server load. */
  const inVolume = $derived(siblings.filter((item) => item.volumeLabel === issue.volumeLabel));
  const inYear = $derived(siblings.filter((item) => item.volumeLabel !== issue.volumeLabel));
</script>

<section class="hero-surface relative overflow-hidden">
  <div class="hero-grid pointer-events-none absolute inset-0" aria-hidden="true"></div>
  <div class="container-page relative py-10 lg:py-14">
    <nav class="mb-6" aria-label="Breadcrumb">
      <ol class="flex flex-wrap items-center gap-1.5 text-xs text-hero-muted">
        <li><a class="no-underline hover:text-white" href="/">Home</a></li>
        <li aria-hidden="true">/</li>
        <li><a class="no-underline hover:text-white" href="/archive.html">Archive</a></li>
        <li aria-hidden="true">/</li>
        <li><span class="font-semibold text-hero-foreground" aria-current="page">Issue</span></li>
      </ol>
    </nav>

    <p class="flex flex-wrap items-center gap-2">
      <Badge variant="accent">{issue.volumeNumber ? `Volume ${issue.volumeNumber}` : 'Special edition'}</Badge>
      {#if issue.issueNumber}<Badge>Issue {issue.issueNumber}</Badge>{/if}
      {#if issue.year}<Badge>{issue.year}</Badge>{/if}
      {#if issue.isSpecial}<Badge variant="gold">Special</Badge>{/if}
    </p>

    <h1 class="mt-3 max-w-[46ch] display-1 font-bold text-hero-foreground lg:text-4xl">
      {issue.title}
    </h1>

    <dl class="mt-6 grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4">
      <div class="rounded-xl border border-white/15 bg-white/6 p-3 backdrop-blur-sm">
        <dt class="eyebrow flex items-center gap-1.5 text-hero-muted">
          <FileText class="size-3.5" aria-hidden="true" />Articles
        </dt>
        <dd class="mt-1 text-2xl font-bold text-hero-foreground tabular-nums">{issue.articles.length}</dd>
      </div>
      <div class="rounded-xl border border-white/15 bg-white/6 p-3 backdrop-blur-sm">
        <dt class="eyebrow flex items-center gap-1.5 text-hero-muted">
          <Library class="size-3.5" aria-hidden="true" />Volume
        </dt>
        <dd class="mt-1 text-2xl font-bold text-hero-foreground tabular-nums">{issue.volumeNumber ?? '—'}</dd>
      </div>
      <div class="rounded-xl border border-white/15 bg-white/6 p-3 backdrop-blur-sm">
        <dt class="eyebrow flex items-center gap-1.5 text-hero-muted">
          <CalendarDays class="size-3.5" aria-hidden="true" />Published
        </dt>
        <dd class="mt-1 text-2xl font-bold text-hero-foreground tabular-nums">{issue.year}</dd>
      </div>
      <div class="rounded-xl border border-white/15 bg-white/6 p-3 backdrop-blur-sm">
        <dt class="eyebrow flex items-center gap-1.5 text-hero-muted">
          <FileText class="size-3.5" aria-hidden="true" />Pages
        </dt>
        <dd class="mt-1 text-lg font-bold text-hero-foreground">{pageRange || '—'}</dd>
      </div>
    </dl>

    <div class="mt-6 flex flex-wrap gap-3">
      <Button variant="light" href="/archive.html">Back to the archive</Button>
      <Button variant="light" href="/articles.html">Search all articles</Button>
    </div>
  </div>
</section>

<div class="container-page grid gap-10 py-10 lg:grid-cols-[minmax(0,1fr)_18rem]">
  <div>
    <div class="mb-5 flex flex-wrap items-end justify-between gap-3 border-b border-border pb-3">
      <h2 class="text-xl font-bold tracking-tight">Articles in this issue</h2>
      <p class="text-xs text-subtle-foreground">
        Every record below comes from the journal's published archive index.
      </p>
    </div>
    <ol class="grid gap-3">
      {#each issue.articles as article (article.num + article.title)}
        <ArticleCard {article} heading={3} showIssue={false} />
      {/each}
    </ol>

    <nav class="mt-8 grid gap-3 sm:grid-cols-2" aria-label="Issue navigation">
      {#if newer}
        <a
          class="group rounded-xl border border-border bg-card p-4 no-underline shadow-sm transition-colors hover:border-accent-border"
          href={`/archive/${newer.id}.html`}
          rel="prev"
        >
          <span class="eyebrow text-subtle-foreground">Newer issue</span>
          <span class="mt-1 block text-sm font-semibold text-foreground group-hover:text-accent-foreground">
            {newer.title}
          </span>
        </a>
      {:else}
        <span></span>
      {/if}
      {#if older}
        <a
          class="group rounded-xl border border-border bg-card p-4 text-right no-underline shadow-sm transition-colors hover:border-accent-border"
          href={`/archive/${older.id}.html`}
          rel="next"
        >
          <span class="eyebrow text-subtle-foreground">Older issue</span>
          <span class="mt-1 block text-sm font-semibold text-foreground group-hover:text-accent-foreground">
            {older.title}
          </span>
        </a>
      {/if}
    </nav>
  </div>

  <aside class="grid content-start gap-6 lg:sticky lg:top-[9rem] lg:self-start">
    {#if inVolume.length > 1}
      <div class="rounded-xl border border-border bg-card p-5 shadow-sm">
        <h2 class="eyebrow text-subtle-foreground">Other issues in this volume</h2>
        <ul class="mt-3 grid gap-2">
          {#each inVolume as item (item.id)}
            <li>
              {#if item.id === issue.id}
                <span class="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <ArrowRight class="size-3.5 text-accent-foreground" aria-hidden="true" />
                  {item.title}
                </span>
              {:else}
                <a class="text-sm text-muted-foreground no-underline hover:text-accent-foreground" href={`/archive/${item.id}.html`}>
                  {item.title}
                </a>
              {/if}
            </li>
          {/each}
        </ul>
      </div>
    {/if}

    {#if inYear.length}
      <div class="rounded-xl border border-border bg-card p-5 shadow-sm">
        <h2 class="eyebrow text-subtle-foreground">{issue.year} special editions</h2>
        <ul class="mt-3 grid gap-2">
          {#each inYear as item (item.id)}
            <li>
              <a class="text-sm text-muted-foreground no-underline hover:text-accent-foreground" href={`/archive/${item.id}.html`}>
                {item.title}
              </a>
            </li>
          {/each}
        </ul>
      </div>
    {/if}

    <div class="rounded-xl border border-dashed border-border-strong bg-surface-muted p-5">
      <h2 class="eyebrow text-subtle-foreground">Cite this issue</h2>
      <p class="mt-2 text-sm text-muted-foreground">
        {issue.title} — Global Journal of Management, Social Sciences and Humanities,{' '}
        {issue.volumeNumber ? `Volume ${issue.volumeNumber}` : 'Special edition'}{issue.issueNumber
          ? `, Issue ${issue.issueNumber}`
          : ''} ({issue.year}). {issue.articles.length} articles.
      </p>
    </div>
  </aside>
</div>
