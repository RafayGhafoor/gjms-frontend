<script lang="ts">
  import type { Article, Issue } from '$lib/data/types';
  import { SITE } from '$lib/config/site';
  import { articlePath, issuePath } from '$lib/data/paths';
  import { formatPages, pageRangeValue } from '$lib/utils';
  import Badge from '$lib/components/ui/badge.svelte';
  import Button from '$lib/components/ui/button.svelte';
  import Card from '$lib/components/ui/card.svelte';
  import CitationCard from './citation-card.svelte';
  import ArrowUpRight from '@lucide/svelte/icons/arrow-up-right';
  import CalendarDays from '@lucide/svelte/icons/calendar-days';
  import ChevronLeft from '@lucide/svelte/icons/chevron-left';
  import Download from '@lucide/svelte/icons/download';
  import FileText from '@lucide/svelte/icons/file-text';
  import Library from '@lucide/svelte/icons/library';
  import Quote from '@lucide/svelte/icons/quote';

  /* Article detail page. Everything shown comes from the journal's own records:
     archive-data.json for the metadata and abstracts.json for the abstract.
     Fields that do not exist in the data (DOI, keywords, references) are simply
     not rendered. */
  let { article, issue = null, abstract = '' }: { article: Article; issue?: Issue | null; abstract?: string } = $props();

  const related = $derived(
    issue ? issue.articles.filter((item) => item.slug !== article.slug).slice(0, 6) : []
  );
  const issueLabel = $derived(
    issue
      ? issue.volumeNumber
        ? `Volume ${issue.volumeNumber}${issue.issueNumber ? `, Issue ${issue.issueNumber}` : ''}`
        : 'Special edition'
      : ''
  );
</script>

<article>
  <!-- Header -->
  <section class="hero-surface relative overflow-hidden">
    <div class="hero-grid pointer-events-none absolute inset-0" aria-hidden="true"></div>
    <div class="container-page relative py-10 lg:py-14">
      <nav class="mb-6" aria-label="Breadcrumb">
        <ol class="flex flex-wrap items-center gap-1.5 text-xs text-hero-muted">
          <li><a class="no-underline hover:text-white" href="/">Home</a></li>
          <li aria-hidden="true">/</li>
          <li><a class="no-underline hover:text-white" href="/archive.html">Archive</a></li>
          {#if issue}
            <li aria-hidden="true">/</li>
            <li><a class="no-underline hover:text-white" href={issuePath(issue.id)}>{issue.title}</a></li>
          {/if}
          <li aria-hidden="true">/</li>
          <li><span class="font-semibold text-hero-foreground" aria-current="page">Article</span></li>
        </ol>
      </nav>

      <p class="flex flex-wrap items-center gap-2">
        {#if article.volumeNumber}<Badge variant="accent">Volume {article.volumeNumber}</Badge>{/if}
        {#if article.issueNumber}<Badge>Issue {article.issueNumber}</Badge>{/if}
        {#if article.year}<Badge>{article.year}</Badge>{/if}
        {#if article.isSpecial}<Badge variant="gold">Special edition</Badge>{/if}
        {#if article.num}<Badge variant="outline">Article {article.num}</Badge>{/if}
        {#if abstract}<Badge variant="cyan">Abstract available</Badge>{/if}
      </p>

      <h1 class="mt-4 max-w-[52ch] text-3xl leading-tight font-extrabold tracking-tight text-hero-foreground lg:text-4xl">
        {article.title}
      </h1>

      {#if article.authors}
        <p class="mt-4 max-w-[70ch] text-base text-hero-muted">{article.authors}</p>
      {/if}

      <div class="mt-6 flex flex-wrap gap-3">
        {#if article.hasPdf}
          <Button
            variant="gold"
            href={article.pdf}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Open the PDF of {article.title} in a new tab"
          >
            <Download aria-hidden="true" />
            Download PDF
          </Button>
        {/if}
        {#if issue}
          <Button variant="light" href={issuePath(issue.id)}>
            <Library aria-hidden="true" />
            View the issue
          </Button>
        {/if}
        <Button variant="light" href="/articles.html">
          <FileText aria-hidden="true" />
          Search all articles
        </Button>
      </div>

      <dl class="mt-8 grid max-w-3xl grid-cols-1 gap-3 sm:grid-cols-3">
        <div class="rounded-xl border border-white/15 bg-white/6 p-3 backdrop-blur-sm">
          <dt class="eyebrow flex items-center gap-1.5 text-hero-muted">
            <Library class="size-3.5" aria-hidden="true" />Published in
          </dt>
          <dd class="mt-1 text-sm font-semibold text-hero-foreground">
            {issueLabel || 'GJMSSH'}
          </dd>
        </div>
        <div class="rounded-xl border border-white/15 bg-white/6 p-3 backdrop-blur-sm">
          <dt class="eyebrow flex items-center gap-1.5 text-hero-muted">
            <CalendarDays class="size-3.5" aria-hidden="true" />Year
          </dt>
          <dd class="mt-1 text-sm font-semibold text-hero-foreground">{article.year}</dd>
        </div>
        <div class="rounded-xl border border-white/15 bg-white/6 p-3 backdrop-blur-sm">
          <dt class="eyebrow flex items-center gap-1.5 text-hero-muted">
            <FileText class="size-3.5" aria-hidden="true" />Pages
          </dt>
          <dd class="mt-1 text-sm font-semibold text-hero-foreground">{article.pages ? pageRangeValue(article.pages) : '—'}</dd>
        </div>
      </dl>
    </div>
  </section>

  <div class="container-page grid gap-10 py-10 lg:grid-cols-[minmax(0,1fr)_20rem]">
    <div class="grid gap-8">
      {#if abstract}
        <section id="abstract" aria-labelledby="abstract-heading">
          <div class="flex items-center gap-3 border-b border-border pb-3">
            <Quote class="size-4 text-accent-foreground" aria-hidden="true" />
            <h2 id="abstract-heading" class="text-xl font-bold tracking-tight">Abstract</h2>
          </div>
          <div class="mt-5 max-w-[72ch]">
            {#each abstract.split(/\n{2,}/) as paragraph (paragraph)}
              <p class="mt-4 text-[1.0625rem] leading-relaxed text-muted-foreground first:mt-0">{paragraph}</p>
            {/each}
          </div>
          <p class="mt-5 max-w-[72ch] text-xs text-subtle-foreground">
            Abstract reproduced from the published article. The full text is available as an open-access PDF.
          </p>
          {#if article.hasPdf}
            <div class="mt-5">
              <Button href={article.pdf} target="_blank" rel="noopener noreferrer">
                <Download aria-hidden="true" />
                Read the full text (PDF)
                <ArrowUpRight aria-hidden="true" />
              </Button>
            </div>
          {/if}
        </section>
      {:else}
        <section id="abstract" aria-labelledby="no-abstract-heading">
          <div class="flex items-center gap-3 border-b border-border pb-3">
            <FileText class="size-4 text-subtle-foreground" aria-hidden="true" />
            <h2 id="no-abstract-heading" class="text-xl font-bold tracking-tight">Full text</h2>
          </div>
          <p class="mt-5 max-w-[72ch] text-sm text-muted-foreground">
            No abstract is held for this record in the journal's archive. The published full text is available as a PDF.
          </p>
          {#if article.hasPdf}
            <div class="mt-5">
              <Button href={article.pdf} target="_blank" rel="noopener noreferrer">
                <Download aria-hidden="true" />
                Open the PDF
                <ArrowUpRight aria-hidden="true" />
              </Button>
            </div>
          {/if}
        </section>
      {/if}

      {#if issue}
        <section aria-labelledby="issue-heading">
          <h2 id="issue-heading" class="text-xl font-bold tracking-tight">Published in</h2>
          <Card padding="lg" class="mt-4">
            <p class="text-base font-semibold">{issue.title}</p>
            <p class="mt-1 text-sm text-muted-foreground">
              {issueLabel} · {issue.articles.length}
              {issue.articles.length === 1 ? 'article' : 'articles'} · published {issue.year}
            </p>
            <div class="mt-4">
              <Button variant="outline" size="sm" href={issuePath(issue.id)}>
                <ChevronLeft aria-hidden="true" />
                All articles in this issue
              </Button>
            </div>
          </Card>
        </section>
      {/if}

      <CitationCard {article} />
    </div>

    <aside class="grid content-start gap-6 lg:sticky lg:top-[9rem] lg:self-start">
      <Card padding="lg">
        <h2 class="eyebrow text-subtle-foreground">Record details</h2>
        <dl class="mt-3 grid gap-2 text-sm">
          <div class="flex items-start justify-between gap-3">
            <dt class="text-muted-foreground">Journal</dt>
            <dd class="text-right font-medium">{SITE.name}</dd>
          </div>
          {#if article.volumeNumber}
            <div class="flex items-start justify-between gap-3">
              <dt class="text-muted-foreground">Volume</dt>
              <dd class="font-medium tabular-nums">{article.volumeNumber}</dd>
            </div>
          {/if}
          {#if article.issueNumber}
            <div class="flex items-start justify-between gap-3">
              <dt class="text-muted-foreground">Issue</dt>
              <dd class="font-medium tabular-nums">{article.issueNumber}</dd>
            </div>
          {/if}
          <div class="flex items-start justify-between gap-3">
            <dt class="text-muted-foreground">Year</dt>
            <dd class="font-medium tabular-nums">{article.year}</dd>
          </div>
          {#if article.pages}
            <div class="flex items-start justify-between gap-3">
              <dt class="text-muted-foreground">Pages</dt>
              <dd class="font-medium">{pageRangeValue(article.pages)}</dd>
            </div>
          {/if}
          {#if article.num}
            <div class="flex items-start justify-between gap-3">
              <dt class="text-muted-foreground">Article</dt>
              <dd class="font-medium tabular-nums">{article.num}</dd>
            </div>
          {/if}
        </dl>
        {#if article.hasPdf}
          <div class="mt-4 border-t border-dashed border-border pt-4">
            <a class="text-xs break-all text-accent-foreground no-underline hover:underline" href={article.pdf} target="_blank" rel="noopener noreferrer">
              Open the PDF record
            </a>
          </div>
        {/if}
      </Card>

      {#if related.length}
        <Card padding="lg">
          <h2 class="eyebrow text-subtle-foreground">More from this issue</h2>
          <ul class="mt-3 grid gap-3">
            {#each related as item (item.slug || item.title)}
              <li>
                <a class="text-sm text-muted-foreground no-underline transition-colors hover:text-accent-foreground" href={articlePath(item.slug)}>
                  {item.title}
                </a>
              </li>
            {/each}
          </ul>
        </Card>
      {/if}
    </aside>
  </div>
</article>
