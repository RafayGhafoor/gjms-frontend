<script lang="ts">
  import Seo from '$lib/components/site/seo.svelte';
  import Button from '$lib/components/ui/button.svelte';
  import Card from '$lib/components/ui/card.svelte';
  import Badge from '$lib/components/ui/badge.svelte';
  import StatCard from '$lib/components/ui/stat-card.svelte';
  import BarChart from '$lib/components/charts/bar-chart.svelte';
  import AreaChart from '$lib/components/charts/area-chart.svelte';
  import ArticleCard from '$lib/components/archive/article-card.svelte';
  import { archive, content } from '$lib/data/journal';
  import { normalisePdfUrl, sortArticles } from '$lib/data/archive';
  import { SITE, SUBMIT_HREF } from '$lib/config/site';
  import { collectionPageNode, scholarlyArticleNode, webPageNode } from '$lib/seo';
  import { formatCount, formatPages } from '$lib/utils';
  import ArrowUpRight from '@lucide/svelte/icons/arrow-up-right';
  import BookOpen from '@lucide/svelte/icons/book-open';
  import CalendarDays from '@lucide/svelte/icons/calendar-days';
  import Clock from '@lucide/svelte/icons/clock';
  import FileText from '@lucide/svelte/icons/file-text';
  import GraduationCap from '@lucide/svelte/icons/graduation-cap';
  import LayoutGrid from '@lucide/svelte/icons/layout-grid';
  import Library from '@lucide/svelte/icons/library';
  import Mail from '@lucide/svelte/icons/mail';
  import ShieldCheck from '@lucide/svelte/icons/shield-check';
  import Sparkles from '@lucide/svelte/icons/sparkles';
  import Users from '@lucide/svelte/icons/users';

  /* Home page. Every figure is derived from archive-data.json / content.json at
     build time; no summary, metric or claim is invented. */

  const latest = $derived(sortArticles(archive.articles, -1).slice(0, 8));
  const currentIssue = $derived(content.currentIssue);
  /* content.json records are untyped JSON — normalise once here. */
  const currentIssueArticles = $derived(
    content.currentIssue.articles.map((article) => ({
      key: `${article.num ?? ''}-${article.title ?? ''}`,
      title: String(article.title ?? ''),
      authors: String(article.authors ?? ''),
      pages: String(article.pages ?? ''),
      pdf: normalisePdfUrl(article.pdf)
    }))
  );
  const about = $derived(content.home.about);
  // The published description, trimmed to its opening sentences — verbatim.
  const lead = $derived(about.split(/(?<=\.)\s+/).slice(0, 2).join(' '));
  const coverage = $derived(`${archive.stats.firstYear}–${archive.stats.lastYear}`);

  const facts = $derived([
    { label: 'Impact factor (SJIF)', value: content.stats.impactFactor, href: '/impact-factor.html' },
    { label: 'Decision within', value: `${content.stats.daysToPublish} days`, href: '/author-guideline.html' },
    { label: 'Acceptance rate', value: content.stats.acceptanceRate, href: '/impact-factor.html' },
    { label: 'Publication fee', value: content.stats.publicationFee, href: '/author-guideline.html' }
  ]);

  const description =
    'Global Journal of Management, Social Sciences and Humanities (GJMSSH) — a blind peer-reviewed quarterly journal publishing management, social sciences and humanities research since 2015. Browse every published volume, issue and open-access article.';
</script>

<Seo
  title="Global Journal of Management, Social Sciences and Humanities | GJMSSH"
  {description}
  path="/"
  appendSiteName={false}
  jsonLd={[
    webPageNode({ path: '/', name: SITE.fullName, description }),
    collectionPageNode({
      path: '/',
      name: 'GJMSSH — journal home',
      description
    }),
    ...latest.map((article) => scholarlyArticleNode(article))
  ]}
/>

<!-- Hero -->
<section class="hero-surface relative overflow-hidden">
  <div class="hero-grid pointer-events-none absolute inset-0" aria-hidden="true"></div>
  <div class="container-page relative py-12 lg:py-16">
    <div class="grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-center">
      <div class="max-w-[62ch]">
        <p class="eyebrow text-hero-muted">{SITE.tagline}</p>
        <h1 class="mt-3 text-4xl font-extrabold tracking-tight text-hero-foreground lg:text-5xl">
          {SITE.fullName}
        </h1>
        <p class="mt-5 text-base text-hero-muted">{lead}</p>
        <div class="mt-7 flex flex-wrap gap-3">
          <Button variant="gold" href={SUBMIT_HREF}>Submit manuscript</Button>
          <Button variant="light" href="/current-issue.html">Current issue</Button>
          <Button variant="light" href="/archive.html">Browse the archive</Button>
        </div>
        <p class="mt-5 text-xs text-hero-muted">
          Published since {SITE.startYear} · {formatCount(archive.stats.issues)} issues ·{' '}
          {formatCount(archive.stats.articles)} open-access articles
        </p>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <StatCard variant="hero" value={archive.stats.articles} label="Articles" hint="{archive.stats.articlesWithPdf} with an open-access PDF">
          {#snippet icon()}<FileText class="size-4" aria-hidden="true" />{/snippet}
        </StatCard>
        <StatCard variant="hero" value={archive.stats.issues} label="Issues" hint="{archive.stats.specialEditions} special editions">
          {#snippet icon()}<LayoutGrid class="size-4" aria-hidden="true" />{/snippet}
        </StatCard>
        <StatCard variant="hero" value={archive.stats.volumes} label="Volumes" hint="Volume 1 to Volume {archive.stats.volumes}">
          {#snippet icon()}<Library class="size-4" aria-hidden="true" />{/snippet}
        </StatCard>
        <StatCard variant="hero" value={coverage} label="Coverage" hint="{archive.stats.years.length} publication years">
          {#snippet icon()}<CalendarDays class="size-4" aria-hidden="true" />{/snippet}
        </StatCard>
      </div>
    </div>
  </div>
</section>

<div class="container-page grid gap-12 py-12 lg:py-16">
  <!-- About + activities -->
  <section class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]" aria-labelledby="about-heading">
    <Card padding="lg">
      <p class="eyebrow text-subtle-foreground">About the journal</p>
      <h2 id="about-heading" class="mt-2 text-2xl font-bold tracking-tight">A platform for management and social science research</h2>
      <p class="mt-4 text-muted-foreground">{about}</p>
      <div class="mt-5 flex flex-wrap gap-3">
        <Button variant="outline" href="/vision-mission.html">Vision &amp; mission</Button>
        <Button variant="outline" href="/editorial-board.html">Editorial board</Button>
      </div>
    </Card>

    <div class="grid gap-4">
      <Card padding="lg">
        <p class="eyebrow text-subtle-foreground">Articles published per year</p>
        <p class="mt-1 text-sm text-muted-foreground">
          {formatCount(archive.stats.articles)} articles across {archive.stats.years.length} publication years
        </p>
        <div class="mt-4">
          <BarChart points={archive.stats.articlesByYear} ariaLabel="Articles published per year" height={140} />
        </div>
      </Card>
      <Card padding="lg">
        <p class="eyebrow text-subtle-foreground">Issues published per year</p>
        <p class="mt-1 text-sm text-muted-foreground">
          {formatCount(archive.stats.issues)} issues from {archive.stats.firstYear} to {archive.stats.lastYear}
        </p>
        <div class="mt-4">
          <AreaChart points={archive.stats.issuesByYear} ariaLabel="Issues published per year" height={130} />
        </div>
      </Card>
    </div>
  </section>

  <!-- Latest articles -->
  <section aria-labelledby="latest-heading">
    <div class="mb-5 flex flex-wrap items-end justify-between gap-3 border-b border-border pb-3">
      <div>
        <p class="eyebrow text-subtle-foreground">Latest records</p>
        <h2 id="latest-heading" class="mt-1 text-2xl font-bold tracking-tight">Recently published articles</h2>
      </div>
      <Button variant="outline" size="sm" href="/articles.html">
        Search all {formatCount(archive.stats.articles)} articles
        <ArrowUpRight aria-hidden="true" />
      </Button>
    </div>
    <ol class="grid gap-3">
      {#each latest as article (article.issueId + '-' + article.num)}
        <ArticleCard {article} heading={3} showIssue={true} />
      {/each}
    </ol>
  </section>

  <!-- Current issue -->
  <section aria-labelledby="current-heading">
    <Card padding="lg" variant="elevated">
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p class="eyebrow text-subtle-foreground">Current issue</p>
          <h2 id="current-heading" class="mt-1 text-2xl font-bold tracking-tight">{currentIssue.title}</h2>
          <p class="mt-2 text-sm text-muted-foreground">
            {currentIssueArticles.length} articles published in this issue.
          </p>
        </div>
        <Button href="/current-issue.html">Open the current issue</Button>
      </div>

      <ol class="mt-6 grid gap-3">
        {#each currentIssueArticles as article (article.key)}
          <li class="grid gap-2 rounded-lg border border-border bg-surface p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
            <div class="min-w-0">
              <p class="paper-title text-[1.0625rem]">{article.title}</p>
              {#if article.authors}<p class="mt-1 text-sm text-muted-foreground">{article.authors}</p>{/if}
              {#if article.pages}<p class="mt-1 text-xs text-subtle-foreground">{formatPages(article.pages)}</p>{/if}
            </div>
            {#if article.pdf}
              <Button size="sm" variant="outline" href={article.pdf} target="_blank" rel="noopener noreferrer">
                PDF
              </Button>
            {/if}
          </li>
        {/each}
      </ol>
    </Card>
  </section>

  <!-- Why publish here (existing published copy) -->
  <section aria-labelledby="features-heading">
    <p class="eyebrow text-subtle-foreground">For authors</p>
    <h2 id="features-heading" class="mt-1 text-2xl font-bold tracking-tight">Publishing with GJMSSH</h2>
    <div class="mt-5 grid gap-4 md:grid-cols-3">
      {#each content.home.features as feature (feature.title)}
        {@const href =
          feature.linkHref.endsWith('.html') ? `/${feature.linkHref}` : feature.linkHref}
        <Card variant="interactive" padding="lg" class="flex flex-col">
          <span class="grid size-9 place-items-center rounded-lg bg-accent text-accent-foreground" aria-hidden="true">
            {#if feature.title.includes('Submit')}
              <Mail class="size-4" />
            {:else if feature.title.includes('Editorial')}
              <Users class="size-4" />
            {:else}
              <Clock class="size-4" />
            {/if}
          </span>
          <h3 class="mt-3 text-base font-semibold">{feature.title}</h3>
          <p class="mt-1 flex-1 text-sm text-muted-foreground">{feature.description}</p>
          <a class="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-accent-foreground no-underline hover:underline" {href}>
            {feature.linkText}
            <ArrowUpRight class="size-3.5" aria-hidden="true" />
          </a>
        </Card>
      {/each}
    </div>
  </section>

  <!-- Journal facts (the journal's own published figures) -->
  <section aria-labelledby="facts-heading">
    <div class="mb-4">
      <p class="eyebrow text-subtle-foreground">Journal facts</p>
      <h2 id="facts-heading" class="mt-1 text-2xl font-bold tracking-tight">Figures published by the journal</h2>
      <p class="mt-2 max-w-[70ch] text-sm text-muted-foreground">
        These are the journal's own published declarations. The archive figures above are counted directly from the
        journal's article index.
      </p>
    </div>
    <dl class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {#each facts as fact (fact.label)}
        <Card padding="lg" class="flex flex-col">
          <dt class="eyebrow text-subtle-foreground">{fact.label}</dt>
          <dd class="mt-2 text-2xl font-bold">{fact.value}</dd>
          <a class="mt-3 text-xs font-semibold text-accent-foreground no-underline hover:underline" href={fact.href}>
            Read more
          </a>
        </Card>
      {/each}
    </dl>
  </section>

  <!-- Explore -->
  <section aria-labelledby="explore-heading">
    <div class="mb-5 border-b border-border pb-3">
      <p class="eyebrow text-subtle-foreground">Information</p>
      <h2 id="explore-heading" class="mt-1 text-2xl font-bold tracking-tight">Explore the journal</h2>
    </div>
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {#each [
        { title: 'Archive', body: 'Browse all volumes, issues and articles by year.', href: '/archive.html', icon: Library },
        { title: 'Articles', body: 'Search the full article index by title, author, year or issue.', href: '/articles.html', icon: FileText },
        { title: 'Current issue', body: 'The most recently published issue.', href: '/current-issue.html', icon: Sparkles },
        { title: 'Editorial board', body: 'Editor-in-chief and international members.', href: '/editorial-board.html', icon: Users },
        { title: 'Author guidelines', body: 'Submission requirements, policies and templates.', href: '/author-guideline.html', icon: GraduationCap },
        { title: 'Indexing & impact', body: 'The journal\'s published indexing and impact figures.', href: '/impact-factor.html', icon: ShieldCheck }
      ] as item (item.href)}
        {@const Icon = item.icon}
        <Card variant="interactive" padding="lg" class="flex flex-col">
          <Icon class="size-4 text-accent-foreground" aria-hidden="true" />
          <h3 class="mt-3 text-base font-semibold">{item.title}</h3>
          <p class="mt-1 flex-1 text-sm text-muted-foreground">{item.body}</p>
          <a class="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-accent-foreground no-underline hover:underline" href={item.href}>
            Open
            <ArrowUpRight class="size-3.5" aria-hidden="true" />
          </a>
        </Card>
      {/each}
    </div>
  </section>

  <!-- Submit CTA -->
  <section class="rounded-2xl border border-border bg-surface-muted p-8 text-center" aria-labelledby="submit-heading">
    <BookOpen class="mx-auto size-6 text-accent-foreground" aria-hidden="true" />
    <h2 id="submit-heading" class="mt-3 text-2xl font-bold tracking-tight">Submit your manuscript</h2>
    <p class="mx-auto mt-2 max-w-[60ch] text-sm text-muted-foreground">
      Send your manuscript to the editorial office by email. Please read the author guidelines before submitting.
    </p>
    <div class="mt-5 flex flex-wrap justify-center gap-3">
      <Button variant="gold" href={SUBMIT_HREF}>{SITE.email}</Button>
      <Button variant="outline" href="/author-guideline.html">Author guidelines</Button>
    </div>
    <p class="mt-4"><Badge variant="outline">{SITE.tagline}</Badge></p>
  </section>
</div>
