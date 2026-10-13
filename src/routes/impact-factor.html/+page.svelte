<script lang="ts">
  import Seo from '$lib/components/site/seo.svelte';
  import Breadcrumbs from '$lib/components/site/breadcrumbs.svelte';
  import Card from '$lib/components/ui/card.svelte';
  import Button from '$lib/components/ui/button.svelte';
  import Badge from '$lib/components/ui/badge.svelte';
  import AreaChart from '$lib/components/charts/area-chart.svelte';
  import StatCard from '$lib/components/ui/stat-card.svelte';
  import { content } from '$lib/data/content';
  import { SITE } from '$lib/config/site';
  import type { PageProps } from './$types';

  let { data }: PageProps = $props();
  const stats = $derived(data.stats);
  import { breadcrumbNode, webPageNode } from '$lib/seo';
  import { formatCount } from '$lib/utils';
  import Info from '@lucide/svelte/icons/info';
  import Clock from '@lucide/svelte/icons/clock';
  import CircleCheck from '@lucide/svelte/icons/circle-check';
  import TrendingUp from '@lucide/svelte/icons/trending-up';

  /* All figures here are the journal's own published declarations from
     content.json — nothing is calculated, extrapolated or compared. */

  const sjif = $derived(content.impactFactor.sjif);
  const latest = $derived(sjif.find((entry) => entry.highlight) ?? sjif[0]);
  const series = $derived(
    sjif
      .slice()
      .reverse()
      .map((entry) => ({ label: entry.year, value: Number(entry.value) }))
      .filter((point) => Number.isFinite(point.value))
  );

  const description = $derived(`Indexing and impact information published by the Global Journal of Management, Social Sciences and Humanities (GJMSSH): ${sjif.length}-year SJIF series (latest ${latest?.value ?? ''}) and Google Scholar figure, with the journal's own declared review timeline.`);
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

<section class="border-b border-border bg-surface-muted">
  <div class="container-page py-10">
    <Breadcrumbs class="mb-5" items={[{ name: 'Home', href: '/' }, { name: 'Indexing and impact' }]} />
    <h1 class="display-1">Indexing and impact</h1>
    <p class="mt-3 max-w-[72ch] text-muted-foreground">
      The figures on this page are the journal's own published declarations. They are shown exactly as published, and
      the underlying values are listed in the table below the chart.
    </p>
  </div>
</section>

<div class="container-page grid gap-10 py-10">
  <section aria-labelledby="headline-heading">
    <h2 id="headline-heading" class="text-xl tracking-tight">Published figures</h2>
    <div class="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard value={Number(latest?.value ?? 0)} decimals={2} label="Latest SJIF" hint="Year {latest?.year ?? '—'}" tone="gold">
        {#snippet icon()}<TrendingUp class="size-4" aria-hidden="true" />{/snippet}
      </StatCard>
      <StatCard value={Number(content.impactFactor.googleScholar)} decimals={2} label="Google Scholar" hint="Published journal figure">
        {#snippet icon()}<CircleCheck class="size-4" aria-hidden="true" />{/snippet}
      </StatCard>
      <StatCard value={Number(content.stats.daysToPublish)} label="Days to publication" hint="Declared review timeline">
        {#snippet icon()}<Clock class="size-4" aria-hidden="true" />{/snippet}
      </StatCard>
      <StatCard value={Number(String(content.stats.acceptanceRate).replace(/[^0-9.]/g, ''))} suffix="%" label="Acceptance rate" hint="Declared by the journal">
        {#snippet icon()}<CircleCheck class="size-4" aria-hidden="true" />{/snippet}
      </StatCard>
    </div>
  </section>

  <section aria-labelledby="series-heading">
    <div class="mb-4 flex flex-wrap items-end justify-between gap-3">
      <div>
        <p class="eyebrow text-subtle-foreground">SJIF series</p>
        <h2 id="series-heading" class="mt-1 text-xl tracking-tight">
          {sjif.length} years of published SJIF values
        </h2>
      </div>
      <Badge variant="outline">{series.length ? `${series[0].label}–${series[series.length - 1].label}` : ''}</Badge>
    </div>

    <div class="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
      <Card padding="lg">
        <p class="eyebrow text-subtle-foreground">SJIF value by year</p>
        <div class="mt-4">
          <AreaChart points={series} ariaLabel="SJIF value published per year" height={200} tone="gold" />
        </div>
      </Card>

      <Card padding="lg">
        <p class="eyebrow text-subtle-foreground">Published values</p>
        <div class="mt-3 overflow-x-auto">
          <table class="w-full border-collapse text-sm">
            <caption class="sr-only">SJIF values per year as published by the journal</caption>
            <thead>
              <tr class="border-b border-border text-left">
                <th scope="col" class="py-2 pr-4 font-semibold">Year</th>
                <th scope="col" class="py-2 pr-4 font-semibold">Value</th>
                <th scope="col" class="py-2 font-semibold">Published trend</th>
              </tr>
            </thead>
            <tbody>
              {#each sjif as entry (entry.year)}
                <tr class="border-b border-border/60 last:border-0 {entry.highlight ? 'bg-gold-soft' : ''}">
                  <th scope="row" class="py-2 pr-4 text-left font-medium tabular-nums">{entry.year}</th>
                  <td class="py-2 pr-4 font-semibold tabular-nums">
                    {entry.value}
                    {#if entry.highlight}<Badge variant="gold" class="ml-2">Latest</Badge>{/if}
                  </td>
                  <td class="py-2 text-muted-foreground">{entry.trend}</td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  </section>

  <section aria-labelledby="publishing-heading">
    <h2 id="publishing-heading" class="text-xl tracking-tight">Publishing facts</h2>
    <div class="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card padding="lg">
        <p class="eyebrow text-subtle-foreground">ISSN</p>
        <p class="mt-2 text-2xl font-bold tabular-nums">{SITE.issn.print}</p>
        <p class="mt-1 text-xs text-subtle-foreground">
          Print, and the linking ISSN (ISSN-L). Online: {SITE.issn.online}.
        </p>
      </Card>
      <Card padding="lg">
        <p class="eyebrow text-subtle-foreground">Publication fee</p>
        <p class="mt-2 text-2xl font-bold">{content.stats.publicationFee}</p>
        <p class="mt-1 text-xs text-subtle-foreground">As published in the author guidelines.</p>
      </Card>
      <Card padding="lg">
        <p class="eyebrow text-subtle-foreground">Articles published</p>
        <p class="mt-2 text-2xl font-bold tabular-nums">{formatCount(stats.articles)}</p>
        <p class="mt-1 text-xs text-subtle-foreground">Counted from the journal's article index.</p>
      </Card>
      <Card padding="lg">
        <p class="eyebrow text-subtle-foreground">Issues published</p>
        <p class="mt-2 text-2xl font-bold tabular-nums">{formatCount(stats.issues)}</p>
        <p class="mt-1 text-xs text-subtle-foreground">Including {formatCount(stats.specialEditions)} special editions.</p>
      </Card>
    </div>
  </section>

  <section aria-labelledby="caveat-heading">
    <Card padding="lg" class="border-dashed">
      <p class="eyebrow flex items-center gap-2 text-subtle-foreground">
        <Info class="size-3.5" aria-hidden="true" />About these numbers
      </p>
      <h2 id="caveat-heading" class="mt-2 text-base">The journal's own declarations</h2>
      <p class="mt-2 max-w-[72ch] text-sm text-muted-foreground">
        Every value on this page is reproduced from the journal's published records (its impact-factor page, author
        guidelines and registered ISSNs). The website adds no estimates, projections or third-party comparisons. For
        verification or clarification, contact the editorial office.
      </p>
      <div class="mt-4 flex flex-wrap gap-3">
        <Button variant="outline" size="sm" href="/contact.html">Contact the editorial office</Button>
        <Button variant="outline" size="sm" href="/author-guideline.html">Author guidelines</Button>
      </div>
    </Card>
  </section>
</div>
