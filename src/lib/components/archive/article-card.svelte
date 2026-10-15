<script lang="ts">
  import type { Article } from '$lib/data/types';
  import { issueLabel } from '$lib/data/archive';
  import { articlePath } from '$lib/data/paths';
  import { pageRangeValue } from '$lib/utils';
  import { highlight } from '$lib/utils';
  import { loadAbstract } from '$lib/client/abstracts';
  import Button from '$lib/components/ui/button.svelte';
  import ChevronDown from '@lucide/svelte/icons/chevron-down';
  import Download from '@lucide/svelte/icons/download';

  /* An article as an editorial row, not a card: a hairline separator above, a
     quiet number rail, the title leading at serif reading size, and the
     bibliographic detail set small underneath. Only fields that exist in
     archive-data.json are shown.
     Abstracts are not inlined: the row stays light and the abstract is fetched
     from abstracts.json the first time a reader asks for one. */
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
  const panelId = $derived(`abstract-${article.issueId}-${article.num}`);
  const pages = $derived(pageRangeValue(article.pages));

  let open = $state(false);
  let loading = $state(false);
  let abstract = $state('');

  async function toggle() {
    if (open) {
      open = false;
      return;
    }
    open = true;
    if (abstract || !article.hasPdf) return;
    loading = true;
    abstract = await loadAbstract(article.pdf);
    loading = false;
  }
</script>

<li
  class="article-row grid gap-x-6 gap-y-3.5 sm:grid-cols-[2.25rem_minmax(0,1fr)] grid-cols-1 lg:grid-cols-[2.25rem_minmax(0,1fr)_auto] {className}"
>
  <span class="hidden font-serif text-sm leading-7 text-subtle-foreground tabular-nums sm:block" aria-hidden="true">
    {article.num}
  </span>

  <div class="min-w-0">
    <svelte:element this={Heading} class="article-title">
      {#if article.slug}
        <!-- The title links to the article's own page, which carries its abstract inline. -->
        <a
          class="text-heading no-underline decoration-accent-border decoration-1 underline-offset-4 transition-colors hover:text-accent-foreground hover:underline"
          href={articlePath(article.slug)}
        >
          {@html highlight(article.title, query)}
        </a>
      {:else}
        {@html highlight(article.title, query)}
      {/if}
    </svelte:element>

    {#if article.authors}
      <p class="mt-2 text-[0.9375rem] leading-snug text-muted-foreground">
        {@html highlight(article.authors, query)}
      </p>
    {/if}

    <p class="meta-row mt-3">
      {#if showIssue}
        <span>{issueLabel(article)}</span>
        {#if pages}<span aria-hidden="true" class="text-border-strong">·</span>{/if}
      {/if}
      {#if pages}<span>Pages {pages}</span>{/if}
      {#if article.hasPdf}
        <span aria-hidden="true" class="text-border-strong">·</span>
        <span>Open access</span>
      {/if}
    </p>

    {#if article.hasPdf}
      <button
        type="button"
        class="mt-3 inline-flex items-center gap-1.5 py-0.5 text-[0.8125rem] font-semibold text-accent-foreground transition-colors hover:underline hover:underline-offset-4"
        aria-expanded={open}
        aria-controls={panelId}
        onclick={toggle}
      >
        {open ? 'Hide abstract' : 'View abstract'}
        <ChevronDown
          class="size-3.5 transition-transform duration-200 {open ? 'rotate-180' : ''}"
          aria-hidden="true"
        />
      </button>
    {/if}

    {#if open}
      <div id={panelId} class="mt-3 border-l-2 border-accent-border bg-surface-muted py-4 pr-4 pl-5">
        {#if loading}
          <p class="text-sm text-subtle-foreground">Loading the abstract…</p>
        {:else if abstract}
          {#each abstract.split(/\n{2,}/) as paragraph (paragraph)}
            <p class="measure text-[0.9375rem] leading-relaxed text-muted-foreground first:mt-0 [&:not(:first-child)]:mt-3">
              {paragraph}
            </p>
          {/each}
          <p class="mt-4 text-xs text-subtle-foreground">
            Abstract reproduced from the published article.
            {#if article.slug}
              <a class="font-semibold text-accent-foreground no-underline hover:underline" href={articlePath(article.slug)}>
                Open the article page
              </a>
            {/if}
          </p>
        {:else}
          <p class="measure text-[0.9375rem] text-muted-foreground">
            No abstract is held for this record in the journal's archive. The published full text is available as a PDF.
          </p>
        {/if}
      </div>
    {/if}
  </div>

  <div class="flex items-start sm:col-start-2 lg:col-start-3 lg:justify-end">
    {#if article.hasPdf}
      <Button
        variant="outline"
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
      <span class="pt-2 text-xs text-subtle-foreground italic">PDF not available</span>
    {/if}
  </div>
</li>
