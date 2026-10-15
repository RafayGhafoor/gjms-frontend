<script lang="ts">
  import type { Article, Issue } from '$lib/data/types';
  import { SITE } from '$lib/config/site';
  import { articlePath, issuePath } from '$lib/data/paths';
  import { pageRangeValue } from '$lib/utils';
  import PageHeader from '$lib/components/site/page-header.svelte';
  import Button from '$lib/components/ui/button.svelte';
  import CitationCard from './citation-card.svelte';
  import ArrowRight from '@lucide/svelte/icons/arrow-right';
  import Download from '@lucide/svelte/icons/download';

  /* Article detail page. Everything shown comes from the journal's own records:
     archive-data.json for the metadata and abstracts.json for the abstract.
     Fields that do not exist in the data (DOI, keywords, references) are simply
     not rendered. */
  let { article, issue = null, abstract = '' }: { article: Article; issue?: Issue | null; abstract?: string } = $props();

  const related = $derived(issue ? issue.articles.filter((item) => item.slug !== article.slug).slice(0, 6) : []);

  const eyebrow = $derived(
    [
      'Research article',
      issue
        ? issue.volumeNumber
          ? `Volume ${issue.volumeNumber}${issue.issueNumber ? `, Issue ${issue.issueNumber}` : ''}`
          : 'Special edition'
        : 'GJMSSH',
      article.year ? String(article.year) : null
    ]
      .filter(Boolean)
      .join(' · ')
  );

  const record = $derived([
    { term: 'Journal', detail: SITE.fullName },
    { term: 'Print ISSN', detail: SITE.issn.print },
    { term: 'Online ISSN', detail: SITE.issn.online },
    ...(article.volumeNumber ? [{ term: 'Volume', detail: String(article.volumeNumber) }] : []),
    ...(article.issueNumber ? [{ term: 'Issue', detail: String(article.issueNumber) }] : []),
    ...(article.year ? [{ term: 'Year', detail: String(article.year) }] : []),
    ...(article.pages ? [{ term: 'Pages', detail: pageRangeValue(article.pages) }] : []),
    ...(article.num ? [{ term: 'Article number', detail: article.num }] : [])
  ]);
</script>

<PageHeader
  {eyebrow}
  title={article.title}
  headingClass="display-title"
  items={[
    { name: 'Home', href: '/' },
    { name: 'Archive', href: '/archive.html' },
    ...(issue ? [{ name: issue.title, href: issuePath(issue.id) }] : []),
    { name: 'Article' }
  ]}
>
  {#if article.authors}
    <p class="measure mt-5 text-[1.0625rem] leading-relaxed text-muted-foreground">{article.authors}</p>
  {/if}

  <div class="mt-8 flex flex-wrap items-center gap-3">
    {#if article.hasPdf}
      <Button
        href={article.pdf}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Download PDF — {article.title} (opens in a new tab)"
      >
        <Download aria-hidden="true" />
        Download PDF
      </Button>
    {/if}
    {#if issue}
      <Button variant="outline" href={issuePath(issue.id)}>View the issue</Button>
    {/if}
    <Button variant="ghost" href="/articles.html">Search all articles</Button>
  </div>

  {#if article.pages || article.year}
    <p class="meta-row mt-7 border-t border-border pt-5">
      {#if article.year}<span>{article.year}</span>{/if}
      {#if article.pages}
        <span aria-hidden="true" class="size-1 shrink-0 rounded-full bg-border-strong"></span>
        <span>Pages {pageRangeValue(article.pages)}</span>
      {/if}
      <span aria-hidden="true" class="size-1 shrink-0 rounded-full bg-border-strong"></span>
      <span>{article.hasPdf ? 'Open access PDF' : 'Full text not available'}</span>
    </p>
  {/if}
</PageHeader>

<div class="container-page grid gap-12 py-14 grid-cols-1 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-16 lg:py-16">
  <div class="grid gap-12">
    {#if abstract}
      <section id="abstract" aria-labelledby="abstract-heading">
        <h2 id="abstract-heading" class="display-2 border-b border-border-strong pb-3">Abstract</h2>
        <div class="mt-6 max-w-[70ch]">
          {#each abstract.split(/\n{2,}/) as paragraph (paragraph)}
            <p class="reading mt-4 text-muted-foreground first:mt-0">{paragraph}</p>
          {/each}
        </div>
        <p class="measure mt-6 text-[0.8125rem] text-subtle-foreground">
          Abstract reproduced from the published article. The full text is available as an open-access PDF.
        </p>
        {#if article.hasPdf}
          <div class="mt-6">
            <Button href={article.pdf} target="_blank" rel="noopener noreferrer">
              <Download aria-hidden="true" />
              Read the full text (PDF)
            </Button>
          </div>
        {/if}
      </section>
    {:else}
      <section id="abstract" aria-labelledby="no-abstract-heading">
        <h2 id="no-abstract-heading" class="display-2 border-b border-border-strong pb-3">Full text</h2>
        <p class="measure mt-6 text-muted-foreground">
          No abstract is held for this record in the journal's archive. The published full text is available as a PDF.
        </p>
        {#if article.hasPdf}
          <div class="mt-6">
            <Button href={article.pdf} target="_blank" rel="noopener noreferrer">
              <Download aria-hidden="true" />
              Open the PDF
            </Button>
          </div>
        {/if}
      </section>
    {/if}

    {#if issue}
      <section aria-labelledby="issue-heading">
        <h2 id="issue-heading" class="display-2 border-b border-border-strong pb-3">Published in</h2>
        <p class="mt-6 font-serif text-[1.1875rem] leading-snug">{issue.title}</p>
        <p class="mt-2 text-[0.9375rem] text-muted-foreground">
          {issue.volumeNumber ? `Volume ${issue.volumeNumber}` : 'Special edition'}{issue.issueNumber
            ? `, Issue ${issue.issueNumber}`
            : ''} · {issue.articles.length}
          {issue.articles.length === 1 ? 'article' : 'articles'} · published {issue.year}
        </p>
        <p class="mt-5">
          <a class="arrow-link" href={issuePath(issue.id)}>
            All articles in this issue
            <ArrowRight aria-hidden="true" />
          </a>
        </p>
      </section>
    {/if}

    <CitationCard {article} />
  </div>

  <aside class="grid content-start gap-8 lg:sticky lg:top-[7.5rem] lg:self-start">
    <section class="rounded-lg border border-border bg-card p-6" aria-labelledby="record-heading">
      <h2 id="record-heading" class="eyebrow text-subtle-foreground">Record details</h2>
      <dl class="mt-4 grid gap-3">
        {#each record as entry (entry.term + entry.detail)}
          <div class="border-t border-border pt-3 first:border-0 first:pt-0">
            <dt class="text-[0.75rem] tracking-[0.06em] text-subtle-foreground uppercase">{entry.term}</dt>
            <dd class="mt-1 text-[0.875rem] leading-snug font-medium break-words">{entry.detail}</dd>
          </div>
        {/each}
      </dl>
      {#if article.hasPdf}
        <div class="mt-5 border-t border-border pt-5">
          <a
            class="inline-block py-0.5 text-xs break-all text-accent-foreground no-underline hover:underline"
            href={article.pdf}
            target="_blank"
            rel="noopener noreferrer"
          >
            Open the PDF record
          </a>
        </div>
      {/if}
    </section>

    {#if related.length}
      <section aria-labelledby="related-heading">
        <h2 id="related-heading" class="eyebrow text-subtle-foreground">More from this issue</h2>
        <ul class="mt-4">
          {#each related as item (item.slug || item.title)}
            <li class="border-t border-border last:border-b">
              <a
                class="block py-3 text-[0.9375rem] leading-snug text-muted-foreground no-underline transition-colors hover:text-accent-foreground"
                href={articlePath(item.slug)}
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
