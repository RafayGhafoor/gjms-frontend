<script lang="ts">
  import type { Article } from '$lib/data/types';
  import { SITE } from '$lib/config/site';
  import { articlePath } from '$lib/data/paths';
  import Card from '$lib/components/ui/card.svelte';
  import Button from '$lib/components/ui/button.svelte';
  import CircleCheck from '@lucide/svelte/icons/circle-check';
  import Copy from '@lucide/svelte/icons/copy';

  /* A ready-to-paste reference, assembled only from the journal's own metadata
     (authors, year, title, volume/issue, pages, canonical URL). It is a
     convenience format, clearly labelled as such — not an official style. */
  let { article }: { article: Article } = $props();

  const citation = $derived.by(() => {
    const authors = article.authors ? `${article.authors} ` : '';
    const year = article.year ? `(${article.year}). ` : '';
    const volume = article.volumeNumber ? `, ${article.volumeNumber}` : '';
    const issue = article.issueNumber ? `(${article.issueNumber})` : '';
    const pages = article.pages ? `, ${article.pages}` : '';
    const url = `${SITE.origin}${articlePath(article.slug)}`;
    return `${authors}${year}${article.title}. ${SITE.fullName}${volume}${issue}${pages}. ${url}`;
  });

  let copied = $state(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(citation);
      copied = true;
      window.setTimeout(() => (copied = false), 2500);
    } catch {
      copied = false;
    }
  }
</script>

<section aria-labelledby="citation-heading">
  <h2 id="citation-heading" class="text-xl tracking-tight">Cite this article</h2>
  <Card padding="lg" class="mt-4">
    <p class="max-w-[72ch] text-sm break-words text-muted-foreground select-all">{citation}</p>
    <div class="mt-4 flex flex-wrap items-center gap-3">
      <Button variant="outline" size="sm" onclick={copy}>
        {#if copied}
          <CircleCheck aria-hidden="true" />
          Copied
        {:else}
          <Copy aria-hidden="true" />
          Copy reference
        {/if}
      </Button>
      <p class="text-xs text-subtle-foreground" aria-live="polite">
        {copied ? 'Reference copied to the clipboard.' : 'Assembled from the journal\'s published metadata.'}
      </p>
    </div>
  </Card>
</section>
