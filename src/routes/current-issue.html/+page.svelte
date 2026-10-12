<script lang="ts">
  import Seo from '$lib/components/site/seo.svelte';
  import Button from '$lib/components/ui/button.svelte';
  import Card from '$lib/components/ui/card.svelte';
  import Badge from '$lib/components/ui/badge.svelte';
  import ArticleCard from '$lib/components/archive/article-card.svelte';
  import { content } from '$lib/data/content';
  import type { PageProps } from './$types';
  import { issuePath } from '$lib/data/paths';
  import { normalisePdfUrl, sortIssues } from '$lib/data/archive';
  import { breadcrumbNode, publicationIssueNodes, scholarlyArticleNode, webPageNode } from '$lib/seo';
  import { formatCount, formatPages } from '$lib/utils';
  import type { Issue } from '$lib/data/types';
  import CalendarDays from '@lucide/svelte/icons/calendar-days';
  import FileText from '@lucide/svelte/icons/file-text';
  import Library from '@lucide/svelte/icons/library';
  import LayoutGrid from '@lucide/svelte/icons/layout-grid';

  /* The current issue is announced in content.json; where it also exists in the
     archive index we use that record (one source of truth per article). The
     volume/issue/year numbers come from the journal's own published title. */

  const title = $derived(content.currentIssue.title);
  let { data }: PageProps = $props();
  const matched = $derived(data.matched);

  const fallbackArticles = $derived(
    content.currentIssue.articles.map((article) => ({
      key: `${article.num ?? ''}-${article.title ?? ''}`,
      title: String(article.title ?? ''),
      authors: String(article.authors ?? ''),
      pages: String(article.pages ?? ''),
      pdf: normalisePdfUrl(article.pdf)
    }))
  );

  const articleCount = $derived(matched ? matched.articles.length : fallbackArticles.length);

  const pageRange = $derived.by(() => {
    const source = matched
      ? matched.articles.map((article) => article.pages)
      : fallbackArticles.map((article) => article.pages);
    const starts = source.map((pages) => Number(String(pages).split('-')[0])).filter((n) => Number.isFinite(n) && n > 0);
    const ends = source
      .map((pages) => Number(String(pages).split('-')[1] ?? String(pages).split('-')[0]))
      .filter((n) => Number.isFinite(n) && n > 0);
    if (!starts.length || !ends.length) return '';
    const from = Math.min(...starts);
    const to = Math.max(...ends);
    return from === to ? formatPages(String(from)) : `Pages ${from}–${to}`;
  });

  /* The four most recent earlier issues, newest first. */
  const previousIssues = $derived(data.previousIssues);
  const stats = $derived(data.stats);

  const description = $derived(
    `Current issue ${title} — the current issue of the Global Journal of Management, Social Sciences and Humanities (GJMSSH), with ${articleCount} open-access articles and full text PDFs.`
  );
</script>

<Seo
  title="Current issue — {title}"
  {description}
  path="/current-issue.html"
  jsonLd={[
    breadcrumbNode([
      { name: 'Home', path: '/' },
      { name: 'Current issue', path: '/current-issue.html' }
    ]),
    webPageNode({ path: '/current-issue.html', name: `Current issue — ${title}`, description }),
    ...(matched ? publicationIssueNodes([matched]) : []),
    ...(matched ? matched.articles.map((article) => scholarlyArticleNode(article, issuePath(matched.id))) : [])
  ]}
/>

<section class="hero-surface relative overflow-hidden">
  <div class="hero-grid pointer-events-none absolute inset-0" aria-hidden="true"></div>
  <div class="container-page relative py-10 lg:py-14">
    <nav class="mb-6" aria-label="Breadcrumb">
      <ol class="flex flex-wrap items-center gap-1.5 text-xs text-hero-muted">
        <li><a class="no-underline hover:text-white" href="/">Home</a></li>
        <li aria-hidden="true">/</li>
        <li><span class="font-semibold text-hero-foreground" aria-current="page">Current issue</span></li>
      </ol>
    </nav>

    <p class="flex flex-wrap items-center gap-2">
      <Badge variant="gold">Current issue</Badge>
      {#if matched?.volumeNumber}<Badge variant="accent">Volume {matched.volumeNumber}</Badge>{/if}
      {#if matched?.issueNumber}<Badge>Issue {matched.issueNumber}</Badge>{/if}
    </p>

    <h1 class="mt-3 max-w-[46ch] display-1 font-bold text-hero-foreground lg:text-4xl">
      {title}
    </h1>
    <p class="mt-4 max-w-[60ch] text-base text-hero-muted">
      {articleCount} {articleCount === 1 ? 'article' : 'articles'} in this issue, published in full on the journal's
      content delivery network.
    </p>

    <dl class="mt-6 grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4">
      <div class="rounded-xl border border-white/15 bg-white/6 p-3 backdrop-blur-sm">
        <dt class="eyebrow flex items-center gap-1.5 text-hero-muted">
          <FileText class="size-3.5" aria-hidden="true" />Articles
        </dt>
        <dd class="mt-1 text-2xl font-bold text-hero-foreground tabular-nums">{articleCount}</dd>
      </div>
      <div class="rounded-xl border border-white/15 bg-white/6 p-3 backdrop-blur-sm">
        <dt class="eyebrow flex items-center gap-1.5 text-hero-muted">
          <Library class="size-3.5" aria-hidden="true" />Volume
        </dt>
        <dd class="mt-1 text-2xl font-bold text-hero-foreground tabular-nums">{matched?.volumeNumber ?? '—'}</dd>
      </div>
      <div class="rounded-xl border border-white/15 bg-white/6 p-3 backdrop-blur-sm">
        <dt class="eyebrow flex items-center gap-1.5 text-hero-muted">
          <LayoutGrid class="size-3.5" aria-hidden="true" />Issue
        </dt>
        <dd class="mt-1 text-2xl font-bold text-hero-foreground tabular-nums">{matched?.issueNumber ?? '—'}</dd>
      </div>
      <div class="rounded-xl border border-white/15 bg-white/6 p-3 backdrop-blur-sm">
        <dt class="eyebrow flex items-center gap-1.5 text-hero-muted">
          <CalendarDays class="size-3.5" aria-hidden="true" />Pages
        </dt>
        <dd class="mt-1 text-lg font-bold text-hero-foreground">{pageRange || '—'}</dd>
      </div>
    </dl>

    <div class="mt-6 flex flex-wrap gap-3">
      {#if matched}
        <Button variant="light" href={issuePath(matched.id)}>Issue landing page</Button>
      {/if}
      <Button variant="light" href="/archive.html">Archive</Button>
      <Button variant="light" href="/articles.html">Search all articles</Button>
    </div>
  </div>
</section>

<div class="container-page grid gap-10 py-10 lg:grid-cols-[minmax(0,1fr)_18rem]">
  <div>
    <div class="mb-5 flex flex-wrap items-end justify-between gap-3 border-b border-border pb-3">
      <h2 class="text-xl font-bold tracking-tight">Articles in this issue</h2>
      <p class="text-xs text-subtle-foreground">
        {matched ? 'Titles, authors, page ranges and PDFs from the journal archive index.' : 'As published on the journal\'s current-issue page.'}
      </p>
    </div>

    {#if matched}
      <ol class="grid gap-3">
        {#each matched.articles as article (article.num + article.title)}
          <ArticleCard {article} heading={3} showIssue={false} />
        {/each}
      </ol>
    {:else}
      <ol class="grid gap-3">
        {#each fallbackArticles as article (article.key)}
          <li class="grid gap-3 rounded-lg border border-border bg-surface p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
            <div class="min-w-0">
              <p class="paper-title text-[1.0625rem]">{article.title}</p>
              {#if article.authors}<p class="mt-1 text-sm text-muted-foreground">{article.authors}</p>{/if}
              {#if article.pages}<p class="mt-1 text-xs text-subtle-foreground">{formatPages(article.pages)}</p>{/if}
            </div>
            {#if article.pdf}
              <Button size="sm" href={article.pdf} target="_blank" rel="noopener noreferrer">PDF</Button>
            {:else}
              <span class="text-xs text-subtle-foreground italic">PDF not available</span>
            {/if}
          </li>
        {/each}
      </ol>
    {/if}
  </div>

  <aside class="grid content-start gap-6 lg:sticky lg:top-[9rem] lg:self-start">
    <Card padding="lg">
      <h2 class="eyebrow text-subtle-foreground">Issue summary</h2>
      <dl class="mt-3 grid gap-2 text-sm">
        <div class="flex items-center justify-between gap-3">
          <dt class="text-muted-foreground">Articles</dt>
          <dd class="font-semibold tabular-nums">{formatCount(articleCount)}</dd>
        </div>
        {#if pageRange}
          <div class="flex items-center justify-between gap-3">
            <dt class="text-muted-foreground">Pages</dt>
            <dd class="font-semibold">{pageRange}</dd>
          </div>
        {/if}
        <div class="flex items-center justify-between gap-3">
          <dt class="text-muted-foreground">Journal</dt>
          <dd class="font-semibold">{stats.issues} issues published</dd>
        </div>
      </dl>
      <div class="mt-4">
        <Button variant="outline" size="sm" href="/author-guideline.html">Submission guidelines</Button>
      </div>
    </Card>

    <Card padding="lg">
      <h2 class="eyebrow text-subtle-foreground">Previous issues</h2>
      <ul class="mt-3 grid gap-2">
        {#each previousIssues as item (item.id)}
          <li>
            <a class="text-sm text-muted-foreground no-underline hover:text-accent-foreground" href={issuePath(item.id)}>
              {item.title}
            </a>
          </li>
        {/each}
      </ul>
    </Card>
  </aside>
</div>
