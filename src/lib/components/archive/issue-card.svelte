<script lang="ts">
  import type { Issue } from '$lib/data/types';
  import { highlight, formatCount } from '$lib/utils';
  import Badge from '$lib/components/ui/badge.svelte';
  import Button from '$lib/components/ui/button.svelte';
  import ArticleCard from './article-card.svelte';
  import ChevronDown from '@lucide/svelte/icons/chevron-down';

  /* Issue card. The article list is rendered when the issue is opened — the
     archive page therefore stays light — and every issue also has its own
     prerendered page (/archive/<issue>.html) where the full list is static
     HTML for search engines and for direct linking. */
  let {
    issue,
    query = '',
    open = false,
    ontoggle,
    heading = 3,
    issueHref = ''
  }: {
    issue: Issue;
    query?: string;
    open?: boolean;
    ontoggle?: () => void;
    heading?: 3 | 4;
    issueHref?: string;
  } = $props();

  const Heading = $derived((['h3', 'h4'] as const)[heading - 3]);
  const panelId = $derived(`panel-${issue.id}`);
  const volume = $derived(issue.volumeNumber ? `Vol ${issue.volumeNumber}` : 'Special Edition');
</script>

<article
  id={issue.id}
  class="scroll-mt-44 overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm transition-[border-color,box-shadow] duration-300 {open
    ? 'border-accent-border shadow-md ring-1 ring-accent-border/60'
    : ''}"
>
  <div class="p-5">
    <p class="flex flex-wrap items-center gap-2">
      <Badge variant="accent">{volume}</Badge>
      {#if issue.issueNumber}
        <Badge>Issue {issue.issueNumber}</Badge>
      {/if}
      {#if issue.year}
        <Badge>{issue.year}</Badge>
      {/if}
      {#if issue.isSpecial}
        <Badge variant="gold">Special</Badge>
      {/if}
    </p>

    <svelte:element this={Heading} class="mt-2 text-base font-semibold text-foreground">
      {@html highlight(issue.title, query)}
    </svelte:element>

    <div class="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-dashed border-border pt-3">
      <span class="text-xs text-subtle-foreground">
        {formatCount(issue.articles.length)}
        {issue.articles.length === 1 ? 'article' : 'articles'}
      </span>
      <span class="flex items-center gap-2">
        {#if issueHref}
          <a
            class="text-xs font-semibold text-accent-foreground no-underline hover:underline"
            href={issueHref}
          >
            Issue page
          </a>
        {/if}
        <Button variant="outline" size="sm" aria-expanded={open} aria-controls={panelId} onclick={() => ontoggle?.()}>
          {open ? 'Hide' : 'Browse'}
          <ChevronDown class="transition-transform duration-300 {open ? 'rotate-180' : ''}" aria-hidden="true" />
        </Button>
      </span>
    </div>
  </div>

  {#if open}
    <div id={panelId} class="border-t border-border bg-surface-muted">
      <ol class="grid gap-3 p-5">
        {#each issue.articles as article (article.num + article.title)}
          <ArticleCard {article} {query} showIssue={false} heading={4} />
        {/each}
      </ol>
    </div>
  {/if}
</article>
