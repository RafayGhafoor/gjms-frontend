<script lang="ts">
  import type { Issue } from '$lib/data/types';
  import { highlight, formatCount } from '$lib/utils';
  import ArticleCard from './article-card.svelte';
  import ChevronDown from '@lucide/svelte/icons/chevron-down';

  /* Issue entry in the archive browser. An editorial row, not a card: a hairline
     separator, the issue title leading, its bibliographic line underneath, and a
     disclosure for the article list. Every issue also has its own prerendered
     page (/archive/<issue>.html) where the full list is static HTML for search
     engines and for direct linking. */
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

  const meta = $derived(
    [
      issue.volumeNumber ? `Volume ${issue.volumeNumber}` : 'Special edition',
      issue.issueNumber ? `Issue ${issue.issueNumber}` : null,
      issue.year ? String(issue.year) : null,
      `${formatCount(issue.articles.length)} ${issue.articles.length === 1 ? 'article' : 'articles'}`
    ]
      .filter(Boolean)
      .join(' · ')
  );
</script>

<article id={issue.id} class="scroll-mt-40 border-t border-border">
  <div class="py-5">
    <svelte:element this={Heading} class="article-title">
      {#if issueHref}
        <a
          class="text-heading no-underline decoration-accent-border decoration-1 underline-offset-4 transition-colors hover:text-accent-foreground hover:underline"
          href={issueHref}
        >
          {@html highlight(issue.title, query)}
        </a>
      {:else}
        {@html highlight(issue.title, query)}
      {/if}
    </svelte:element>

    <p class="meta-row mt-2.5">{meta}</p>

    <div class="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2">
      <button
        type="button"
        class="inline-flex items-center gap-1.5 py-0.5 text-[0.8125rem] font-semibold text-accent-foreground transition-colors hover:underline hover:underline-offset-4"
        aria-expanded={open}
        aria-controls={panelId}
        onclick={() => ontoggle?.()}
      >
        {open ? 'Hide articles' : 'Browse articles'}
        <ChevronDown class="size-3.5 transition-transform duration-200 {open ? 'rotate-180' : ''}" aria-hidden="true" />
      </button>
      {#if issueHref}
        <a class="arrow-link text-[0.8125rem]" href={issueHref}>Issue page</a>
      {/if}
    </div>
  </div>

  {#if open}
    <div id={panelId} class="border-l-2 border-accent-border bg-surface-muted px-5">
      <ol>
        {#each issue.articles as article (article.num + article.title)}
          <ArticleCard {article} {query} showIssue={false} heading={4} />
        {/each}
      </ol>
    </div>
  {/if}
</article>
