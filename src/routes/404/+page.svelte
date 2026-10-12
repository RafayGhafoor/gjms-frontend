<script lang="ts">
  import Seo from '$lib/components/site/seo.svelte';
  import Button from '$lib/components/ui/button.svelte';
  import Card from '$lib/components/ui/card.svelte';
  import type { PageProps } from './$types';
  import { formatCount } from '$lib/utils';
  import FileText from '@lucide/svelte/icons/file-text';
  import Library from '@lucide/svelte/icons/library';
  import SearchX from '@lucide/svelte/icons/search-x';

  let { data }: PageProps = $props();

  /* This route is built to 404.html, which is the file GitHub Pages serves for
     any unmatched path. It is noindex, so it can never compete with real pages. */
</script>

<Seo
  title="Page not found"
  description="The requested page is not part of the Global Journal of Management, Social Sciences and Humanities website."
  path="/404.html"
  noindex={true}
  includeSiteGraph={false}
/>

<section class="container-page py-16 lg:py-24">
  <div class="mx-auto max-w-[60ch] text-center">
    <SearchX class="mx-auto size-8 text-subtle-foreground" aria-hidden="true" />
    <p class="eyebrow mt-4 text-subtle-foreground">Error 404</p>
    <h1 class="mt-2 display-1">We could not find that page</h1>
    <p class="mt-4 text-muted-foreground">
      The link may be out of date, or the address may contain a typo. Everything the journal publishes is still
      reachable from the archive and the article index — {formatCount(data.stats.articles)} article records across
      {formatCount(data.stats.issues)} issues.
    </p>
    <div class="mt-7 flex flex-wrap justify-center gap-3">
      <Button href="/">Journal home</Button>
      <Button variant="outline" href="/archive.html">
        <Library aria-hidden="true" />
        Browse the archive
      </Button>
      <Button variant="outline" href="/articles.html">
        <FileText aria-hidden="true" />
        Search all articles
      </Button>
    </div>
  </div>

  <div class="mx-auto mt-12 grid max-w-3xl gap-4 sm:grid-cols-2">
    <Card padding="lg">
      <h2 class="text-base font-semibold">Looking for a specific article?</h2>
      <p class="mt-2 text-sm text-muted-foreground">
        Article addresses follow <span class="font-mono text-xs">/article/&lt;slug&gt;.html</span>. Search by title,
        author, year or volume from the article index, or find the issue in the archive.
      </p>
    </Card>
    <Card padding="lg">
      <h2 class="text-base font-semibold">Submitting a manuscript?</h2>
      <p class="mt-2 text-sm text-muted-foreground">
        The author guidelines cover manuscript requirements, the publication fee and the review timeline, and the
        editorial office handles submissions by email.
      </p>
      <div class="mt-4 flex flex-wrap gap-2">
        <Button variant="outline" size="sm" href="/author-guideline.html">Author guidelines</Button>
        <Button variant="ghost" size="sm" href="/contact.html">Contact</Button>
      </div>
    </Card>
  </div>
</section>
