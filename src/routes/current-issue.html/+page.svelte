<script lang="ts">
  import Seo from '$lib/components/site/seo.svelte';
  import PageHeader from '$lib/components/site/page-header.svelte';
  import Button from '$lib/components/ui/button.svelte';
  import ArticleCard from '$lib/components/archive/article-card.svelte';
  import { content } from '$lib/data/content';
  import type { PageProps } from './$types';
  import { issuePath } from '$lib/data/paths';
  import { normalisePdfUrl } from '$lib/data/archive';
  import { breadcrumbNode, publicationIssueNodes, scholarlyArticleNode, webPageNode } from '$lib/seo';
  import { formatCount, pageRangeValue } from '$lib/utils';

  /* The current issue is announced in content.json and resolved against the
     archive index in the server load. Volume, issue, year and page range are
     all taken from the journal's published records — never derived from a
     target or an estimate. */
  let { data }: PageProps = $props();

  const title = $derived(data.title);
  const matched = $derived(data.matched);

  const fallbackArticles = $derived(
    content.currentIssue.articles.map((article) => ({
      key: `${article.num ?? ''}-${article.title ?? ''}`,
      num: String(article.num ?? ''),
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
    return from === to ? pageRangeValue(String(from)) : `${from}–${to}`;
  });

  const previousIssues = $derived(data.previousIssues);

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

<PageHeader
  eyebrow="Current issue"
  title={title}
  description={`${articleCount} ${articleCount === 1 ? 'article' : 'articles'} in this issue, published in full on the journal's content delivery network.`}
  items={[{ name: 'Home', href: '/' }, { name: 'Current issue' }]}
>
  <dl class="mt-9 grid grid-cols-2 gap-x-8 gap-y-6 border-t border-border-strong pt-6 sm:grid-cols-3 lg:grid-cols-5">
    <div>
      <dt class="text-[0.8125rem] text-subtle-foreground">Articles</dt>
      <dd class="mt-1.5 font-serif text-[1.5rem] leading-none font-semibold tabular-nums">{articleCount}</dd>
    </div>
    {#if matched?.volumeNumber}
      <div>
        <dt class="text-[0.8125rem] text-subtle-foreground">Volume</dt>
        <dd class="mt-1.5 font-serif text-[1.5rem] leading-none font-semibold tabular-nums">{matched.volumeNumber}</dd>
      </div>
    {/if}
    {#if matched?.issueNumber}
      <div>
        <dt class="text-[0.8125rem] text-subtle-foreground">Issue</dt>
        <dd class="mt-1.5 font-serif text-[1.5rem] leading-none font-semibold tabular-nums">{matched.issueNumber}</dd>
      </div>
    {/if}
    {#if matched?.year}
      <div>
        <dt class="text-[0.8125rem] text-subtle-foreground">Published</dt>
        <dd class="mt-1.5 font-serif text-[1.5rem] leading-none font-semibold tabular-nums">{matched.year}</dd>
      </div>
    {/if}
    {#if pageRange}
      <div>
        <dt class="text-[0.8125rem] text-subtle-foreground">Page range</dt>
        <dd class="mt-1.5 font-serif text-[1.5rem] leading-none font-semibold tabular-nums">{pageRange}</dd>
      </div>
    {/if}
  </dl>

  <div class="mt-8 flex flex-wrap gap-3">
    {#if matched}
      <Button href={issuePath(matched.id)}>Open the issue</Button>
    {/if}
    <Button variant="outline" href="/archive.html">Archive</Button>
    <Button variant="outline" href="/articles.html">Search all articles</Button>
  </div>
</PageHeader>

<div class="container-page grid gap-12 py-14 grid-cols-1 lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-16 lg:py-16">
  <div>
    <div class="flex flex-wrap items-end justify-between gap-x-8 gap-y-3 border-b border-border-strong pb-4">
      <h2 class="display-2">Articles in this issue</h2>
      <p class="text-[0.8125rem] text-subtle-foreground">
        {matched
          ? 'Titles, authors, page ranges and PDFs from the journal archive index.'
          : "As published on the journal's current-issue page."}
      </p>
    </div>

    {#if matched}
      <ol>
        {#each matched.articles as article (article.num + article.title)}
          <ArticleCard {article} heading={3} showIssue={false} />
        {/each}
      </ol>
    {:else}
      <ol>
        {#each fallbackArticles as article (article.key)}
          <li class="article-row grid gap-x-6 gap-y-3.5 sm:grid-cols-[2.25rem_minmax(0,1fr)] grid-cols-1 lg:grid-cols-[2.25rem_minmax(0,1fr)_auto]">
            <span class="hidden font-serif text-sm leading-7 text-subtle-foreground tabular-nums sm:block" aria-hidden="true">
              {article.num}
            </span>
            <div class="min-w-0">
              <p class="article-title">{article.title}</p>
              {#if article.authors}
                <p class="mt-2 text-[0.9375rem] leading-snug text-muted-foreground">{article.authors}</p>
              {/if}
              {#if article.pages}
                <p class="meta-row mt-3">Pages {pageRangeValue(article.pages)}</p>
              {/if}
            </div>
            <div class="flex items-start sm:col-start-2 lg:col-start-3 lg:justify-end">
              {#if article.pdf}
                <Button variant="outline" size="sm" href={article.pdf} target="_blank" rel="noopener noreferrer">
                  PDF
                </Button>
              {:else}
                <span class="pt-2 text-xs text-subtle-foreground italic">PDF not available</span>
              {/if}
            </div>
          </li>
        {/each}
      </ol>
    {/if}
  </div>

  <aside class="grid content-start gap-8 lg:sticky lg:top-[7.5rem] lg:self-start">

    {#if previousIssues.length}
      <section aria-labelledby="previous-issues-heading">
        <h2 id="previous-issues-heading" class="eyebrow text-subtle-foreground">Previous issues</h2>
        <ul class="mt-4">
          {#each previousIssues as item (item.id)}
            <li class="border-t border-border last:border-b">
              <a
                class="block py-3 text-[0.9375rem] leading-snug text-muted-foreground no-underline transition-colors hover:text-accent-foreground"
                href={issuePath(item.id)}
              >
                {item.title}
              </a>
            </li>
          {/each}
        </ul>
      </section>
    {/if}
  </aside>
</div>
