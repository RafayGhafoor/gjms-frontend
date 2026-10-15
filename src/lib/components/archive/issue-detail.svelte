<script lang="ts">
  import type { Issue } from '$lib/data/types';
  import { pageRangeValue } from '$lib/utils';
  import PageHeader from '$lib/components/site/page-header.svelte';
  import Button from '$lib/components/ui/button.svelte';
  import ArticleCard from './article-card.svelte';
  import ArrowRight from '@lucide/svelte/icons/arrow-right';

  /* Full issue view. This page is the crawlable home of every article record,
     so the article list is plain prerendered HTML. */
  /* Listing links need only these fields; keeping the shape narrow is what stops
     a page from carrying its sibling issues' articles. */
  type IssueSummary = {
    id: string;
    title: string;
    volumeLabel: string;
    volumeNumber: number | null;
    issueNumber: number | null;
    isSpecial: boolean;
    year: number;
  };

  let {
    issue,
    newer = null,
    older = null,
    siblings = []
  }: {
    issue: Issue;
    newer?: IssueSummary | null;
    older?: IssueSummary | null;
    siblings?: IssueSummary[];
  } = $props();

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
    return from === to ? pageRangeValue(String(from)) : `${from}–${to}`;
  });

  /* Passed in from the page's server load. */
  const inVolume = $derived(siblings.filter((item) => item.volumeLabel === issue.volumeLabel));
  const inYear = $derived(siblings.filter((item) => item.volumeLabel !== issue.volumeLabel));

  const eyebrow = $derived(
    [
      issue.volumeNumber ? `Volume ${issue.volumeNumber}` : 'Special edition',
      issue.issueNumber ? `Issue ${issue.issueNumber}` : null,
      issue.year ? String(issue.year) : null
    ]
      .filter(Boolean)
      .join(' · ')
  );

  const figures = $derived([
    { term: 'Articles', detail: String(issue.articles.length) },
    ...(issue.volumeNumber ? [{ term: 'Volume', detail: String(issue.volumeNumber) }] : []),
    ...(issue.issueNumber ? [{ term: 'Issue', detail: String(issue.issueNumber) }] : []),
    ...(issue.year ? [{ term: 'Published', detail: String(issue.year) }] : []),
    ...(pageRange ? [{ term: 'Page range', detail: pageRange }] : [])
  ]);
</script>

<PageHeader
  {eyebrow}
  title={issue.title}
  items={[
    { name: 'Home', href: '/' },
    { name: 'Archive', href: '/archive.html' },
    { name: issue.title }
  ]}
>
  <dl class="mt-9 grid grid-cols-2 gap-x-8 gap-y-6 border-t border-border-strong pt-6 sm:grid-cols-4">
    {#each figures as figure (figure.term + figure.detail)}
      <div>
        <dt class="text-[0.8125rem] text-subtle-foreground">{figure.term}</dt>
        <dd class="mt-1.5 font-serif text-[1.5rem] leading-none font-semibold tabular-nums">{figure.detail}</dd>
      </div>
    {/each}
  </dl>

  <div class="mt-8 flex flex-wrap gap-3">
    <Button variant="outline" href="/archive.html">Back to the archive</Button>
    <Button variant="outline" href="/articles.html">Search all articles</Button>
  </div>
</PageHeader>

<div class="container-page grid gap-12 py-14 grid-cols-1 lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-16 lg:py-16">
  <div>
    <div class="flex flex-wrap items-end justify-between gap-x-8 gap-y-3 border-b border-border-strong pb-4">
      <h2 class="display-2">Articles in this issue</h2>
      <p class="text-[0.8125rem] text-subtle-foreground">
        Every record below comes from the journal's published archive index.
      </p>
    </div>

    <ol>
      {#each issue.articles as article (article.num + article.title)}
        <ArticleCard {article} heading={3} showIssue={false} />
      {/each}
    </ol>

    <nav class="mt-10 grid gap-8 sm:grid-cols-2" aria-label="Issue navigation">
      {#if newer}
        <a class="group border-t border-border-strong pt-4 no-underline" href={`/archive/${newer.id}.html`} rel="prev">
          <span class="eyebrow text-subtle-foreground">Newer issue</span>
          <span class="mt-2 block font-serif text-[1.0625rem] leading-snug text-heading group-hover:text-accent-foreground">
            {newer.title}
          </span>
          <span class="arrow-link mt-3">View issue<ArrowRight aria-hidden="true" /></span>
        </a>
      {:else}
        <span></span>
      {/if}
      {#if older}
        <a
          class="group border-t border-border-strong pt-4 no-underline sm:text-right"
          href={`/archive/${older.id}.html`}
          rel="next"
        >
          <span class="eyebrow text-subtle-foreground">Older issue</span>
          <span class="mt-2 block font-serif text-[1.0625rem] leading-snug text-heading group-hover:text-accent-foreground">
            {older.title}
          </span>
          <span class="arrow-link mt-3 sm:flex-row-reverse">View issue<ArrowRight class="rotate-180" aria-hidden="true" /></span>
        </a>
      {/if}
    </nav>
  </div>

  <aside class="grid content-start gap-8 lg:sticky lg:top-[7.5rem] lg:self-start">
    {#if inVolume.length > 1}
      <section aria-labelledby="volume-issues-heading">
        <h2 id="volume-issues-heading" class="eyebrow text-subtle-foreground">Other issues in this volume</h2>
        <ul class="mt-4">
          {#each inVolume as item (item.id)}
            <li class="border-t border-border last:border-b">
              {#if item.id === issue.id}
                <span class="flex items-center gap-2 py-3 text-[0.9375rem] leading-snug font-semibold text-heading">
                  <ArrowRight class="size-3.5 shrink-0 text-accent-foreground" aria-hidden="true" />
                  {item.title}
                </span>
              {:else}
                <a
                  class="block py-3 text-[0.9375rem] leading-snug text-muted-foreground no-underline transition-colors hover:text-accent-foreground"
                  href={`/archive/${item.id}.html`}
                >
                  {item.title}
                </a>
              {/if}
            </li>
          {/each}
        </ul>
      </section>
    {/if}

    {#if inYear.length}
      <section aria-labelledby="year-editions-heading">
        <h2 id="year-editions-heading" class="eyebrow text-subtle-foreground">{issue.year} special editions</h2>
        <ul class="mt-4">
          {#each inYear as item (item.id)}
            <li class="border-t border-border last:border-b">
              <a
                class="block py-3 text-[0.9375rem] leading-snug text-muted-foreground no-underline transition-colors hover:text-accent-foreground"
                href={`/archive/${item.id}.html`}
              >
                {item.title}
              </a>
            </li>
          {/each}
        </ul>
      </section>
    {/if}

    <section class="rounded-lg border border-border bg-surface-muted p-6" aria-labelledby="cite-issue-heading">
      <h2 id="cite-issue-heading" class="eyebrow text-subtle-foreground">Cite this issue</h2>
      <p class="mt-3 text-[0.9375rem] leading-relaxed text-muted-foreground">
        {issue.title} — Global Journal of Management, Social Sciences and Humanities,{' '}
        {issue.volumeNumber ? `Volume ${issue.volumeNumber}` : 'Special edition'}{issue.issueNumber
          ? `, Issue ${issue.issueNumber}`
          : ''} ({issue.year}). {issue.articles.length} articles.
      </p>
    </section>
  </aside>
</div>
