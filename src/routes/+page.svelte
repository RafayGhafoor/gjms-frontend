<script lang="ts">
  import Seo from '$lib/components/site/seo.svelte';
  import Button from '$lib/components/ui/button.svelte';
  import ArticleCard from '$lib/components/archive/article-card.svelte';
  import { content } from '$lib/data/content';
  import type { PageProps } from './$types';
  import { SITE, SUBMIT_HREF } from '$lib/config/site';
  import { issuePath } from '$lib/data/paths';
  import { collectionPageNode, scholarlyArticleNode, webPageNode } from '$lib/seo';
  import { formatCount } from '$lib/utils';
  import ArrowRight from '@lucide/svelte/icons/arrow-right';
  import ArrowUpRight from '@lucide/svelte/icons/arrow-up-right';

  let { data }: PageProps = $props();

  /* Home page. Every sentence and figure below comes from the journal's own
     records — content.json for the published copy and archive-data.json for the
     articles and counts. Nothing is summarised, estimated or invented. */
  const stats = $derived(data.stats);
  const currentIssue = $derived(data.currentIssue);
  const previousIssues = $derived(data.previousIssues);

  /* The published description of the journal, reproduced verbatim. */
  const about = $derived(content.home.about);
  /* The journal's own statement of vision, opening sentences only. */
  const visionLead = $derived(
    content.visionMission.vision.split(/(?<=\.)\s+/).slice(0, 2).join(' ')
  );
  const featured = $derived(currentIssue.articles[0] ?? null);
  const coverage = $derived(`${stats.firstYear}–${stats.lastYear}`);

  /* Counted from the archive index, newest year first. */
  const years = $derived([...stats.articlesByYear].reverse());

  const glance = $derived([
    { term: 'Publication frequency', detail: 'Quarterly' },
    { term: 'Published since', detail: String(SITE.startYear) },
    { term: 'Peer review', detail: 'Blind peer review' },
    { term: 'Full text', detail: 'Open access PDF' },
    { term: 'ISSN (print)', detail: SITE.issn.print },
    { term: 'ISSN (online)', detail: SITE.issn.online },
    { term: 'Articles published', detail: formatCount(stats.articles) },
    { term: 'Issues published', detail: formatCount(stats.issues) }
  ]);

  const disciplines = [
    {
      name: 'Management',
      body: 'Research on organisations, strategy, finance and entrepreneurship, and on the management of people and resources.'
    },
    {
      name: 'Social Sciences',
      body: 'Research on economies, societies and public policy, and on the institutions that shape public life.'
    },
    {
      name: 'Humanities',
      body: 'Research on culture, language and history, and the critical study of human expression.'
    }
  ];

  const authorSteps = [
    {
      step: '01',
      title: 'Prepare your manuscript',
      body: 'Review the manuscript requirements — length, title, author details, abstract, keywords, figures, tables and APA references.',
      href: '/author-guideline.html',
      linkText: 'Author guidelines'
    },
    {
      step: '02',
      title: 'Understand the review process',
      body: 'Submissions are assessed through the journal’s blind peer review. The published decision timeline is two weeks from submission.',
      href: '/author-guideline.html#key-facts',
      linkText: 'Review timeline and fee'
    },
    {
      step: '03',
      title: 'Submit your research',
      body: 'Send the manuscript to the editorial office by email, including the paper title and the names of every contributing author.',
      href: SUBMIT_HREF,
      linkText: 'Email the editorial office'
    }
  ];

  const policies: { title: string; links: { label: string; href: string }[] }[] = [
    {
      title: 'About and governance',
      links: [
        { label: 'Editorial board', href: '/editorial-board.html' },
        { label: 'Vision and mission', href: '/vision-mission.html' },
        { label: 'Contact the editorial office', href: '/contact.html' }
      ]
    },
    {
      title: 'Publishing information',
      links: [
        { label: 'Author guidelines', href: '/author-guideline.html' },
        { label: 'Publication ethics and plagiarism', href: '/author-guideline.html#ethics-and-integrity' },
        { label: 'Publication fee', href: '/author-guideline.html#key-facts' }
      ]
    },
    {
      title: 'Research and discovery',
      links: [
        { label: 'Current issue', href: '/current-issue.html' },
        { label: 'Archive', href: '/archive.html' },
        { label: 'Articles', href: '/articles.html' },
        { label: 'Indexing and impact', href: '/impact-factor.html' }
      ]
    }
  ];

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
    collectionPageNode({ path: '/', name: 'GJMSSH — journal home', description }),
    ...currentIssue.articles.map((article) => scholarlyArticleNode(article))
  ]}
/>

<!-- ============================================================ 1 · HERO -->
<section class="hero-surface relative overflow-hidden">
  <div class="hero-grid pointer-events-none absolute inset-0" aria-hidden="true"></div>
  <div class="container-page relative pt-14 pb-14 lg:pt-20 lg:pb-20">
    <div class="grid gap-12 grid-cols-1 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:items-start lg:gap-16">
      <div>
        <p class="eyebrow text-subtle-foreground">{SITE.tagline}</p>
        <h1 class="display-hero mt-5 max-w-[19ch]">{SITE.fullName}</h1>
        <p class="measure mt-6 text-[1.0625rem] leading-relaxed text-muted-foreground">{about}</p>

        <div class="mt-8 flex flex-wrap items-center gap-3">
          <Button href="/current-issue.html">Explore the current issue</Button>
          <Button variant="outline" href="/author-guideline.html">Author guidelines</Button>
        </div>

        <p class="mt-7 text-[0.8125rem] text-subtle-foreground">
          Published since {SITE.startYear} · {formatCount(stats.issues)} issues · {formatCount(stats.articles)} open-access
          articles · {coverage}
        </p>
      </div>

      <!-- Current-issue panel: the journal's own record, not a dashboard widget. -->
      <aside class="border-t-2 border-heading/85 pt-6" aria-labelledby="hero-issue-heading">
        <p class="eyebrow text-gold-foreground">Current issue</p>
        <h2 id="hero-issue-heading" class="mt-3 font-serif text-[1.375rem] leading-snug">
          {currentIssue.title}
        </h2>

        <dl class="mt-5 grid grid-cols-2 gap-x-6 gap-y-3 text-[0.8125rem]">
          {#if currentIssue.volumeNumber != null}
            <div>
              <dt class="text-subtle-foreground">Volume</dt>
              <dd class="mt-0.5 font-semibold tabular-nums">{currentIssue.volumeNumber}</dd>
            </div>
          {/if}
          {#if currentIssue.issueNumber != null}
            <div>
              <dt class="text-subtle-foreground">Issue</dt>
              <dd class="mt-0.5 font-semibold tabular-nums">{currentIssue.issueNumber}</dd>
            </div>
          {/if}
          <div>
            <dt class="text-subtle-foreground">Articles</dt>
            <dd class="mt-0.5 font-semibold tabular-nums">{currentIssue.articles.length}</dd>
          </div>
          {#if currentIssue.year}
            <div>
              <dt class="text-subtle-foreground">Year</dt>
              <dd class="mt-0.5 font-semibold tabular-nums">{currentIssue.year}</dd>
            </div>
          {/if}
        </dl>

        {#if featured}
          <div class="mt-6 border-t border-border pt-5">
            <p class="eyebrow text-subtle-foreground">Featured article</p>
            <p class="mt-2.5 font-serif text-[1.0625rem] leading-snug">{featured.title}</p>
            {#if featured.authors}
              <p class="mt-2 text-[0.875rem] leading-snug text-muted-foreground">{featured.authors}</p>
            {/if}
          </div>
        {/if}

        <a class="arrow-link mt-6" href="/current-issue.html">
          View the issue
          <ArrowRight aria-hidden="true" />
        </a>
      </aside>
    </div>
  </div>
</section>

<!-- ================================================= 2 · CURRENT ISSUE -->
{#if currentIssue.articles.length}
  <section class="container-page section-y" aria-labelledby="current-issue-heading">
    <header class="flex flex-wrap items-end justify-between gap-x-8 gap-y-4 border-b border-border-strong pb-5">
      <div>
        <h2 id="current-issue-heading" class="display-2">Current issue</h2>
        <p class="mt-2 text-[0.9375rem] text-muted-foreground">
          {currentIssue.title} · {currentIssue.articles.length}
          {currentIssue.articles.length === 1 ? 'article' : 'articles'}
        </p>
      </div>
      <a class="arrow-link" href="/current-issue.html">
        View the complete issue
        <ArrowRight aria-hidden="true" />
      </a>
    </header>

    <ol class="mt-4">
      {#each currentIssue.articles as article (article.issueId + '-' + article.num)}
        <ArticleCard {article} heading={3} showIssue={false} />
      {/each}
    </ol>
  </section>
{/if}

<!-- ================================================== 3 · RECENT ISSUES -->
{#if previousIssues.length}
  <section class="border-y border-border bg-surface-muted" aria-labelledby="recent-issues-heading">
    <div class="container-page section-y">
      <header class="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
        <div>
          <h2 id="recent-issues-heading" class="display-2">Previously published</h2>
          <p class="mt-2 text-[0.9375rem] text-muted-foreground">
            The issues that precede the current one, newest first.
          </p>
        </div>
        <a class="arrow-link" href="/archive.html">
          Browse the full archive
          <ArrowRight aria-hidden="true" />
        </a>
      </header>

      <ul class="mt-10 grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
        {#each previousIssues as issue (issue.id)}
          <li class="flex flex-col border-t border-border-strong pt-5">
            <h3 class="font-serif text-[1.0625rem] leading-snug">
              <a class="text-heading no-underline transition-colors hover:text-accent-foreground hover:underline hover:underline-offset-4" href={issuePath(issue.id)}>
                {issue.title}
              </a>
            </h3>
            <p class="mt-3 text-[0.8125rem] text-subtle-foreground">
              {issue.articleCount} {issue.articleCount === 1 ? 'article' : 'articles'}
            </p>
            <p class="mt-auto pt-4">
              <a class="arrow-link" href={issuePath(issue.id)}>
                View issue
                <ArrowRight aria-hidden="true" />
              </a>
            </p>
          </li>
        {/each}
      </ul>
    </div>
  </section>
{/if}

<!-- ================================================ 4 · ABOUT THE JOURNAL -->
<section class="container-page section-y" aria-labelledby="about-heading">
  <div class="grid gap-12 grid-cols-1 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-16">
    <div>
      <h2 id="about-heading" class="display-2 max-w-[22ch]">Advancing research across disciplines</h2>
      <p class="measure mt-5 leading-relaxed text-muted-foreground">{visionLead}</p>
      <p class="measure mt-4 leading-relaxed text-muted-foreground">
        The journal is guided by an editor-in-chief and an international editorial board, and every submission is
        assessed on merit through blind peer review.
      </p>
      <div class="mt-7 flex flex-wrap gap-3">
        <Button variant="outline" href="/vision-mission.html">
          About the journal
          <ArrowUpRight aria-hidden="true" />
        </Button>
        <Button variant="outline" href="/editorial-board.html">
          Editorial board
          <ArrowUpRight aria-hidden="true" />
        </Button>
      </div>
    </div>

    <div>
      <h3 class="eyebrow text-subtle-foreground">Journal at a glance</h3>
      <dl class="mt-5 grid gap-x-8 gap-y-4 sm:grid-cols-2">
        {#each glance as row (row.term)}
          <div class="border-t border-border pt-3">
            <dt class="text-[0.8125rem] text-subtle-foreground">{row.term}</dt>
            <dd class="mt-1 font-medium tabular-nums">{row.detail}</dd>
          </div>
        {/each}
      </dl>
    </div>
  </div>
</section>

<!-- ===================================================== 5 · DISCIPLINES -->
<section class="border-y border-border bg-surface-muted" aria-labelledby="scope-heading">
  <div class="container-page section-y">
    <header class="max-w-[62ch]">
      <h2 id="scope-heading" class="display-2">Scope of the journal</h2>
      <p class="measure mt-4 text-muted-foreground">
        GJMSSH publishes research in management, the social sciences and the humanities, and invites submissions from
        researchers worldwide.
      </p>
    </header>

    <ul class="mt-10 grid gap-x-10 gap-y-8 md:grid-cols-3">
      {#each disciplines as discipline (discipline.name)}
        <li class="border-t border-border-strong pt-5">
          <h3 class="font-serif text-[1.1875rem]">{discipline.name}</h3>
          <p class="measure mt-3 text-[0.9375rem] leading-relaxed text-muted-foreground">{discipline.body}</p>
        </li>
      {/each}
    </ul>

    <p class="mt-10">
      <a class="arrow-link" href="/vision-mission.html">
        Read the journal's aims and scope
        <ArrowRight aria-hidden="true" />
      </a>
    </p>
  </div>
</section>

<!-- ==================================================== 6 · FOR AUTHORS -->
<section class="container-page section-y" aria-labelledby="authors-heading">
  <header class="max-w-[62ch]">
    <h2 id="authors-heading" class="display-2">Publishing with GJMSSH</h2>
    <p class="measure mt-4 text-muted-foreground">
      Everything authors need to prepare and submit their research.
    </p>
  </header>

  <ol class="mt-10 grid gap-x-10 gap-y-8 md:grid-cols-3">
    {#each authorSteps as item (item.step)}
      <li class="border-t border-border-strong pt-5">
        <p class="font-serif text-[1.0625rem] text-gold-foreground tabular-nums" aria-hidden="true">{item.step}</p>
        <h3 class="mt-3 font-serif text-[1.1875rem]">{item.title}</h3>
        <p class="measure mt-3 text-[0.9375rem] leading-relaxed text-muted-foreground">{item.body}</p>
        <a class="arrow-link mt-4" href={item.href}>
          {item.linkText}
          <ArrowRight aria-hidden="true" />
        </a>
      </li>
    {/each}
  </ol>

  <div class="mt-12 border-t border-border pt-6">
    <h3 class="eyebrow text-subtle-foreground">Submission information</h3>
    <ul class="mt-4 flex flex-wrap gap-x-8 gap-y-3">
      {#each [
        { label: 'Author guidelines', href: '/author-guideline.html' },
        { label: 'Manuscript requirements', href: '/author-guideline.html#requirements-heading' },
        { label: 'Publication fee', href: '/author-guideline.html#key-facts' },
        { label: 'Publication ethics', href: '/author-guideline.html#ethics-and-integrity' }
      ] as link (link.href)}
        <li>
          <a
            class="inline-block py-0.5 text-[0.9375rem] font-medium text-accent-foreground no-underline hover:underline hover:underline-offset-4"
            href={link.href}
          >
            {link.label}
          </a>
        </li>
      {/each}
    </ul>
  </div>
</section>

<!-- ======================================================= 7 · ARCHIVE -->
<section class="border-y border-border bg-surface-muted" aria-labelledby="archive-heading">
  <div class="container-page section-y">
    <div class="grid gap-12 grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)] lg:gap-16">
      <div>
        <h2 id="archive-heading" class="display-2">Explore the journal archive</h2>
        <p class="measure mt-4 text-muted-foreground">
          Every volume and issue the journal has published is in the archive, with direct access to the full text of
          each article. The published record runs from {stats.firstYear} to {stats.lastYear} —
          {formatCount(stats.articles)} articles across {formatCount(stats.issues)} issues and
          {formatCount(stats.volumes)} numbered volumes{#if stats.specialEditions}, including
            {formatCount(stats.specialEditions)} special editions{/if}.
        </p>

        <form class="mt-7 flex max-w-lg items-stretch gap-2" action="/articles.html" method="get">
          <label class="sr-only" for="home-archive-search">
            Search articles by title, author or page range
          </label>
          <input
            id="home-archive-search"
            name="q"
            type="search"
            placeholder="Title, author or page range"
            class="h-11 min-w-0 flex-1 rounded-md border border-input bg-surface px-3.5 text-[0.9375rem] text-foreground outline-none placeholder:text-subtle-foreground hover:border-accent-border focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/30"
          />
          <Button type="submit">Search</Button>
        </form>

        <p class="mt-6">
          <a class="arrow-link" href="/archive.html">
            View the full archive
            <ArrowRight aria-hidden="true" />
          </a>
        </p>
      </div>

      <div>
        <h3 class="eyebrow text-subtle-foreground">Browse by year</h3>
        <ul class="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-3">
          {#each years as year (year.label)}
            <li class="bg-background">
              <a
                class="flex items-baseline justify-between gap-3 px-4 py-3.5 no-underline transition-colors hover:bg-accent"
                href={`/archive.html?year=${year.label}`}
              >
                <span class="font-serif text-[1.0625rem] text-heading tabular-nums">{year.label}</span>
                <span class="text-[0.75rem] text-subtle-foreground tabular-nums">{year.value}</span>
              </a>
            </li>
          {/each}
        </ul>
        <p class="mt-3 text-[0.75rem] text-subtle-foreground">
          Each year links to that year's issues and articles in the archive. The count is the number of articles
          published in that year.
        </p>
      </div>
    </div>
  </div>
</section>

<!-- ================================== 8 · JOURNAL INFORMATION/POLICIES -->
<section class="container-page section-y" aria-labelledby="information-heading">
  <h2 id="information-heading" class="display-2">Journal information and policies</h2>

  <div class="mt-10 grid gap-x-10 gap-y-10 md:grid-cols-3">
    {#each policies as group (group.title)}
      <div>
        <h3 class="eyebrow text-subtle-foreground">{group.title}</h3>
        <ul class="mt-4">
          {#each group.links as link (link.href + link.label)}
            <li class="border-t border-border">
              <a
                class="block py-3 text-[0.9375rem] text-muted-foreground no-underline transition-colors hover:text-accent-foreground"
                href={link.href}
              >
                {link.label}
              </a>
            </li>
          {/each}
        </ul>
      </div>
    {/each}
  </div>
</section>

<!-- =================================================== 9 · SUBMIT CTA -->
<section class="band-navy" aria-labelledby="submit-heading">
  <div class="container-page section-y">
    <div class="grid gap-x-12 gap-y-8 grid-cols-1 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
      <div>
        <h2 id="submit-heading" class="display-2 text-band-foreground">Submit your research</h2>
        <p class="measure mt-4 leading-relaxed text-band-muted">
          Share your work with the journal's editorial team. Review the submission guidelines before sending your
          manuscript — the published decision timeline is two weeks from submission.
        </p>
      </div>
      <div class="flex flex-wrap gap-3">
        <Button variant="light" href={SUBMIT_HREF}>Submission instructions</Button>
        <Button variant="light" href="/author-guideline.html">Author guidelines</Button>
      </div>
    </div>

    <p class="mt-8 border-t border-band-border pt-6 text-[0.8125rem] text-band-muted">
      Manuscripts are received by email at
      <a class="inline-block py-0.5 text-band-foreground no-underline underline underline-offset-4" href={`mailto:${SITE.email}`}>{SITE.email}</a>.
    </p>
  </div>
</section>
