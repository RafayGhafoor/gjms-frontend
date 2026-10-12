<script lang="ts">
  import Seo from '$lib/components/site/seo.svelte';
  import Breadcrumbs from '$lib/components/site/breadcrumbs.svelte';
  import StatCard from '$lib/components/ui/stat-card.svelte';
  import Button from '$lib/components/ui/button.svelte';
  import ArchiveBrowser from '$lib/components/archive/archive-browser.svelte';
  import { SUBMIT_HREF } from '$lib/config/site';
  import { breadcrumbNode, collectionPageNode, publicationIssueNodes } from '$lib/seo';
  import { archive } from '$lib/data/archive-index';
    import CalendarDays from '@lucide/svelte/icons/calendar-days';
  import FileText from '@lucide/svelte/icons/file-text';
  import LayoutGrid from '@lucide/svelte/icons/layout-grid';
  import Library from '@lucide/svelte/icons/library';

  /* The archive is a build-time import of archive-data.json: no fetch, no
     server round trip, and the filters run entirely in the browser. */

  const description =
    'Browse every volume, issue and open-access article published by the Global Journal of Management, Social Sciences and Humanities — filter the archive by year, volume, issue, title or author.';
</script>

<Seo
  title="Archive: all volumes and issues"
  {description}
  path="/archive.html"
  jsonLd={[
    breadcrumbNode([
      { name: 'Home', path: '/' },
      { name: 'Archive', path: '/archive.html' }
    ]),
    collectionPageNode({ path: '/archive.html', name: 'Journal archive', description }),
    ...publicationIssueNodes(archive.issues, 60)
  ]}
/>

<section class="hero-surface relative overflow-hidden">
  <div class="hero-grid pointer-events-none absolute inset-0" aria-hidden="true"></div>
  <div class="container-page relative py-10 lg:py-14">
    <Breadcrumbs
      class="mb-6"
      items={[{ name: 'Home', href: '/' }, { name: 'Archive' }]}
    />

    <div class="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-end">
      <div class="max-w-[62ch]">
        <p class="eyebrow text-hero-muted">Global Journal of Management, Social Sciences &amp; Humanities</p>
        <h1 class="mt-3 display-1 text-hero-foreground">Journal archive</h1>
        <p class="mt-4 text-base text-hero-muted">
          Every volume and issue published since {archive.stats.firstYear}, with direct access to the full text of each
          article. Filter the archive by year, volume, issue, title or author. Records show the information the journal
          itself publishes — title, author, page range and the PDF.
        </p>
        <div class="mt-6 flex flex-wrap gap-3">
          <Button variant="gold" href={SUBMIT_HREF}>Submit manuscript</Button>
          <Button variant="light" href="/current-issue.html">Current issue</Button>
          <Button variant="light" href="/articles.html">Search all articles</Button>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-3 sm:grid-cols-2">
        <StatCard variant="hero" value={archive.stats.articles} label="Articles" hint="{archive.stats.articlesWithPdf} with an open-access PDF">
          {#snippet icon()}<FileText class="size-4" aria-hidden="true" />{/snippet}
        </StatCard>
        <StatCard variant="hero" value={archive.stats.issues} label="Issues" hint="{archive.stats.specialEditions} special editions">
          {#snippet icon()}<LayoutGrid class="size-4" aria-hidden="true" />{/snippet}
        </StatCard>
        <StatCard variant="hero" value={archive.stats.volumes} label="Volumes" hint="Volume 1 to Volume {archive.stats.volumes}">
          {#snippet icon()}<Library class="size-4" aria-hidden="true" />{/snippet}
        </StatCard>
        <StatCard
          variant="hero"
          value="{archive.stats.firstYear}–{archive.stats.lastYear}"
          label="Coverage"
          hint="{archive.stats.years.length} publication years"
        >
          {#snippet icon()}<CalendarDays class="size-4" aria-hidden="true" />{/snippet}
        </StatCard>
      </div>
    </div>
  </div>
</section>

<ArchiveBrowser {archive} />
