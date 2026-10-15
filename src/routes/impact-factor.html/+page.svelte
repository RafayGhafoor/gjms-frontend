<script lang="ts">
  import Seo from '$lib/components/site/seo.svelte';
  import PageHeader from '$lib/components/site/page-header.svelte';
  import Button from '$lib/components/ui/button.svelte';
  import AreaChart from '$lib/components/charts/area-chart.svelte';
  import { content } from '$lib/data/content';
  import { SITE } from '$lib/config/site';
  import type { PageProps } from './$types';
  import { breadcrumbNode, webPageNode } from '$lib/seo';
  import { formatCount } from '$lib/utils';

  /* All figures here are the journal's own published declarations from
     content.json — nothing is calculated, extrapolated or compared, and the
     provider of every metric is named so it cannot be mistaken for another
     publisher's index. */

  let { data }: PageProps = $props();
  const stats = $derived(data.stats);

  const sjif = $derived(content.impactFactor.sjif);
  const latest = $derived(sjif.find((entry) => entry.highlight) ?? sjif[0]);
  const series = $derived(
    sjif
      .slice()
      .reverse()
      .map((entry) => ({ label: entry.year, value: Number(entry.value) }))
      .filter((point) => Number.isFinite(point.value))
  );

  const figures = $derived([
    {
      term: 'SJIF',
      value: latest?.value ?? '—',
      hint: `Journal's published figure${latest?.year ? `, ${latest.year}` : ''}`
    },
    {
      term: 'Google Scholar',
      value: content.impactFactor.googleScholar,
      hint: "Journal's published figure"
    },
    {
      term: 'Decision timeline',
      value: `${content.stats.daysToPublish} days`,
      hint: 'Published in the author guidelines'
    },
    {
      term: 'Acceptance rate',
      value: content.stats.acceptanceRate,
      hint: "Journal's own declaration"
    }
  ]);

  const publishingFacts = $derived([
    { term: 'ISSN (print)', detail: SITE.issn.print, hint: 'Also the linking ISSN (ISSN-L)' },
    { term: 'ISSN (online)', detail: SITE.issn.online, hint: 'Registered with the ISSN International Centre' },
    { term: 'Publication fee', detail: content.stats.publicationFee, hint: 'As published in the author guidelines' },
    { term: 'Articles published', detail: formatCount(stats.articles), hint: 'Counted from the journal article index' }
  ]);

  const description = $derived(
    `Indexing and impact information published by the Global Journal of Management, Social Sciences and Humanities (GJMSSH): the journal's own SJIF series (latest ${latest?.value ?? ''}), its Google Scholar figure and its declared review timeline.`
  );
</script>

<Seo
  title="Indexing and impact"
  {description}
  path="/impact-factor.html"
  jsonLd={[
    breadcrumbNode([
      { name: 'Home', path: '/' },
      { name: 'Indexing and impact', path: '/impact-factor.html' }
    ]),
    webPageNode({ path: '/impact-factor.html', name: 'Indexing and impact', description })
  ]}
/>

<PageHeader
  eyebrow="Journal metrics"
  title="Indexing and impact"
  description="The figures on this page are the journal's own published declarations. They are shown exactly as published, with the source of each figure named, and the underlying values are listed in the table beside the chart."
  items={[{ name: 'Home', href: '/' }, { name: 'Indexing and impact' }]}
/>

<div class="container-page grid gap-16 py-14 lg:py-16">
  <section aria-labelledby="headline-heading">
    <h2 id="headline-heading" class="display-2 border-b border-border-strong pb-3">Published figures</h2>
    <dl class="mt-7 grid grid-cols-1 gap-x-8 gap-y-6 border-t border-border-strong pt-6 sm:grid-cols-2 lg:grid-cols-4">
      {#each figures as figure (figure.term)}
        <div>
          <dt class="text-[0.8125rem] text-subtle-foreground">{figure.term}</dt>
          <dd class="mt-2 font-serif text-[1.75rem] leading-none font-semibold tabular-nums">{figure.value}</dd>
          <dd class="mt-2 text-[0.8125rem] leading-snug text-subtle-foreground">{figure.hint}</dd>
        </div>
      {/each}
    </dl>
  </section>

  <section aria-labelledby="series-heading">
    <div class="flex flex-wrap items-end justify-between gap-x-8 gap-y-3 border-b border-border-strong pb-3">
      <h2 id="series-heading" class="display-2">
        {sjif.length} years of published SJIF values
      </h2>
      {#if series.length}
        <p class="text-[0.8125rem] text-subtle-foreground tabular-nums">
          {series[0].label}–{series[series.length - 1].label}
        </p>
      {/if}
    </div>

    <div class="mt-7 grid gap-10 grid-cols-1 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-14">
      <figure>
        <figcaption class="text-[0.8125rem] text-subtle-foreground">
          SJIF value by year, as published by the journal.
        </figcaption>
        <div class="mt-5">
          <AreaChart points={series} ariaLabel="SJIF value published per year" height={200} tone="gold" />
        </div>
      </figure>

      <div>
        <h3 class="eyebrow text-subtle-foreground">Published values</h3>
        <div class="mt-4 overflow-x-auto">
          <table class="w-full border-collapse text-[0.9375rem]">
            <caption class="sr-only">SJIF values per year as published by the journal</caption>
            <thead>
              <tr class="border-b border-border-strong text-left">
                <th scope="col" class="py-2.5 pr-4 font-semibold">Year</th>
                <th scope="col" class="py-2.5 pr-4 font-semibold">Value</th>
                <th scope="col" class="py-2.5 font-semibold">Published trend</th>
              </tr>
            </thead>
            <tbody>
              {#each sjif as entry (entry.year)}
                <tr class="border-b border-border last:border-0">
                  <th scope="row" class="py-2.5 pr-4 text-left font-medium tabular-nums">{entry.year}</th>
                  <td class="py-2.5 pr-4 font-semibold tabular-nums">
                    {entry.value}
                    {#if entry.highlight}<span class="ml-2 text-[0.75rem] font-semibold text-gold-foreground">Latest</span>{/if}
                  </td>
                  <td class="py-2.5 text-muted-foreground tabular-nums">{entry.trend}</td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </section>

  <section aria-labelledby="publishing-heading">
    <h2 id="publishing-heading" class="display-2 border-b border-border-strong pb-3">Publishing facts</h2>
    <dl class="mt-7 grid grid-cols-1 gap-x-8 gap-y-6 border-t border-border-strong pt-6 sm:grid-cols-2 lg:grid-cols-4">
      {#each publishingFacts as fact (fact.term)}
        <div>
          <dt class="text-[0.8125rem] text-subtle-foreground">{fact.term}</dt>
          <dd class="mt-2 font-serif text-[1.5rem] leading-none font-semibold tabular-nums">{fact.detail}</dd>
          <dd class="mt-2 text-[0.8125rem] leading-snug text-subtle-foreground">{fact.hint}</dd>
        </div>
      {/each}
    </dl>
  </section>

  <section aria-labelledby="caveat-heading">
    <div class="rounded-lg border border-border bg-surface-muted p-6 sm:p-8">
      <h2 id="caveat-heading" class="display-2">About these numbers</h2>
      <p class="measure mt-4 leading-relaxed text-muted-foreground">
        Every value on this page is reproduced from the journal's published records — its own impact page, its author
        guidelines and its registered ISSNs. The website adds no estimates, projections or third-party comparisons.
      </p>
      <p class="measure mt-4 leading-relaxed text-muted-foreground">
        SJIF is the journal's own published impact figure and is shown for the year the journal states it. It is
        <strong class="font-semibold text-foreground">not</strong> the Journal Impact Factor published by Clarivate, and
        the journal makes no claim of indexing in Web of Science, Scopus or DOAJ on this website. For verification or
        clarification, contact the editorial office.
      </p>
      <div class="mt-6 flex flex-wrap gap-3">
        <Button variant="outline" size="sm" href="/contact.html">Contact the editorial office</Button>
        <Button variant="ghost" size="sm" href="/author-guideline.html">Author guidelines</Button>
      </div>
    </div>
  </section>
</div>
