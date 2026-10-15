<script lang="ts">
  import Seo from '$lib/components/site/seo.svelte';
  import PageHeader from '$lib/components/site/page-header.svelte';
  import Button from '$lib/components/ui/button.svelte';
  import ArchiveBrowser from '$lib/components/archive/archive-browser.svelte';
  import { SUBMIT_HREF } from '$lib/config/site';
  import { breadcrumbNode, collectionPageNode, publicationIssueNodes } from '$lib/seo';
  import { archive } from '$lib/data/archive-index';
  import { formatCount } from '$lib/utils';

  /* The archive is a build-time import of archive-data.json: no fetch, no
     server round trip, and the filters run entirely in the browser. */

  const description =
    'Browse every volume, issue and open-access article published by the Global Journal of Management, Social Sciences and Humanities — filter the archive by year, volume, issue, title or author.';

  const figures = [
    { term: 'Articles', detail: formatCount(archive.stats.articles) },
    { term: 'Issues', detail: formatCount(archive.stats.issues) },
    { term: 'Numbered volumes', detail: formatCount(archive.stats.volumes) },
    { term: 'Published', detail: `${archive.stats.firstYear}–${archive.stats.lastYear}` }
  ];
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

<PageHeader
  eyebrow="Complete published record"
  title="Journal archive"
  description={`Every volume and issue published since ${archive.stats.firstYear}, with direct access to the full text of each article. Filter the archive by year, volume, issue, title or author — each record shows the information the journal itself publishes: title, authors, page range and the PDF.`}
  items={[{ name: 'Home', href: '/' }, { name: 'Archive' }]}
>
  <dl class="mt-9 grid grid-cols-2 gap-x-8 gap-y-6 border-t border-border-strong pt-6 sm:grid-cols-4">
    {#each figures as figure (figure.term)}
      <div>
        <dt class="text-[0.8125rem] text-subtle-foreground">{figure.term}</dt>
        <dd class="mt-1.5 font-serif text-[1.5rem] leading-none font-semibold tabular-nums">{figure.detail}</dd>
      </div>
    {/each}
  </dl>

  <div class="mt-8 flex flex-wrap gap-3">
    <Button variant="navy" href={SUBMIT_HREF}>Submit manuscript</Button>
    <Button variant="outline" href="/current-issue.html">Current issue</Button>
    <Button variant="ghost" href="/articles.html">Search all articles</Button>
  </div>
</PageHeader>

<ArchiveBrowser {archive} />
