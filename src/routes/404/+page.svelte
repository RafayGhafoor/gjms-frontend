<script lang="ts">
  import Seo from '$lib/components/site/seo.svelte';
  import Button from '$lib/components/ui/button.svelte';
  import type { PageProps } from './$types';
  import { formatCount } from '$lib/utils';
  import FileText from '@lucide/svelte/icons/file-text';
  import Library from '@lucide/svelte/icons/library';

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

<section class="container-page py-20 lg:py-28">
  <div class="mx-auto max-w-[62ch]">
    <p class="eyebrow text-accent-foreground">Error 404</p>
    <h1 class="display-1 mt-4">We could not find that page</h1>
    <p class="measure mt-5 text-muted-foreground">
      The link may be out of date, or the address may contain a typo. Everything the journal publishes is still
      reachable from the archive and the article index — {formatCount(data.stats.articles)} article records across
      {formatCount(data.stats.issues)} issues.
    </p>
    <div class="mt-9 flex flex-wrap gap-3">
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

  <div class="mx-auto mt-16 grid max-w-3xl gap-x-12 gap-y-10 sm:grid-cols-2">
    <section class="border-t border-border-strong pt-5">
      <h2 class="font-serif text-[1.125rem]">Looking for a specific article?</h2>
      <p class="measure mt-3 text-[0.9375rem] leading-relaxed text-muted-foreground">
        Article addresses follow <span class="font-mono text-[0.8125rem]">/article/&lt;slug&gt;.html</span>. Search by
        title, author, year or volume from the article index, or find the issue in the archive.
      </p>
    </section>
    <section class="border-t border-border-strong pt-5">
      <h2 class="font-serif text-[1.125rem]">Submitting a manuscript?</h2>
      <p class="measure mt-3 text-[0.9375rem] leading-relaxed text-muted-foreground">
        The author guidelines cover manuscript requirements, the publication fee and the review timeline, and the
        editorial office handles submissions by email.
      </p>
      <div class="mt-5 flex flex-wrap gap-3">
        <Button variant="outline" size="sm" href="/author-guideline.html">Author guidelines</Button>
        <Button variant="ghost" size="sm" href="/contact.html">Contact</Button>
      </div>
    </section>
  </div>
</section>
