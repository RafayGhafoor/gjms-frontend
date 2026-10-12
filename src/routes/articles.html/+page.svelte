<!-- Placeholder route. The owning agent replaces this file entirely. -->
<script lang="ts">
  import Seo from '$lib/components/site/seo.svelte';

  const title = 'Articles';
  const description = 'Search every article published by GJMSSH by title, author, year, volume or issue.';
</script>

<Seo {title} {description} path='/articles.html' appendSiteName={true} />

<section class="container-page py-16">
  <h1 class="text-3xl font-extrabold tracking-tight">{title}</h1>
  <p class="mt-3 max-w-[60ch] text-muted-foreground">
    This page is being migrated to the new design system. Its content will come from the journal's existing published
    text — no new claims are introduced.
  </p>
</section>
