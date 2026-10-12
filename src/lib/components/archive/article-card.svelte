<script lang="ts">
  import type { Article } from '$lib/data/types';
  import { issueLabel } from '$lib/data/archive';
  import { articlePath } from '$lib/data/paths';
  import { formatPages, highlight } from '$lib/utils';
  import Badge from '$lib/components/ui/badge.svelte';
  import Button from '$lib/components/ui/button.svelte';
    import Download from '@lucide/svelte/icons/download';

  /* Article card — shows only fields that exist in archive-data.json.
     No abstract, keywords, DOI or category is ever invented. */
  let {
    article,
    query = '',
    showIssue = true,
    heading = 4,
    class: className = ''
  }: {
    article: Article;
    query?: string;
    showIssue?: boolean;
    heading?: 3 | 4 | 5;
    class?: string;
  } = $props();

  const Heading = $derived((['h3', 'h4', 'h5'] as const)[heading - 3]);
</script>

<li
  class="group grid gap-3 rounded-lg border border-border bg-surface p-4 transition-[border-color,background-color,box-shadow] duration-200 hover:border-accent-border hover:bg-card hover:shadow-sm sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:gap-4 {className}"
>
  <span
    class="grid size-8 shrink-0 place-items-center rounded-md bg-accent text-xs font-bold text-accent-foreground tabular-nums"
    aria-hidden="true"
  >
    {article.num}
  </span>

  <div class="grid min-w-0 gap-1">
    <svelte:element this={Heading} class="paper-title text-[1.0625rem] text-foreground">
      {#if article.slug}
        <!-- The title links to the article's own page, which carries its abstract. -->
        <a class="text-foreground no-underline hover:text-accent-foreground hover:underline" href={articlePath(article.slug)}>
          {@html highlight(article.title, query)}
        </a>
      {:else}
        {@html highlight(article.title, query)}
      {/if}
    </svelte:element>
    {#if article.authors}
      <p class="text-sm text-muted-foreground">{@html highlight(article.authors, query)}</p>
    {/if}
    <div class="mt-0.5 flex flex-wrap items-center gap-2">
      {#if showIssue}
        <Badge variant="accent">{issueLabel(article)}</Badge>
      {/if}
      {#if article.pages}
        <Badge>{formatPages(article.pages)}</Badge>
      {/if}
    </div>
  </div>

  <div class="flex items-start sm:justify-end">
    {#if article.hasPdf}
      <Button
        size="sm"
        href={article.pdf}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Open the PDF of {article.title} in a new tab"
      >
        <Download aria-hidden="true" />
        PDF
      </Button>
    {:else}
      <span class="text-xs text-subtle-foreground italic">PDF not available</span>
    {/if}
  </div>
</li>
