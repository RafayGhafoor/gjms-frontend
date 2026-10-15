<script lang="ts">
  import Seo from '$lib/components/site/seo.svelte';
  import PageHeader from '$lib/components/site/page-header.svelte';
  import Button from '$lib/components/ui/button.svelte';
  import { content } from '$lib/data/content';
  import type { PageProps } from './$types';
  import { SITE } from '$lib/config/site';
  import { breadcrumbNode, webPageNode } from '$lib/seo';
  import { formatCount } from '$lib/utils';
  import Mail from '@lucide/svelte/icons/mail';
  import Globe from '@lucide/svelte/icons/globe';

  let { data }: PageProps = $props();
  const stats = $derived(data.stats);

  const description =
    'Contact the editorial office of the Global Journal of Management, Social Sciences and Humanities (GJMSSH) about manuscript submissions, publication policies or collaboration.';

  const elsewhere = $derived([
    { label: 'Author guidelines', href: '/author-guideline.html', body: 'Manuscript requirements, fee and review timeline.' },
    { label: 'Editorial board', href: '/editorial-board.html', body: 'Who reviews and guides the journal.' },
    { label: 'Journal archive', href: '/archive.html', body: `Every issue published since ${stats.firstYear}.` }
  ]);
</script>

<Seo
  title="Contact"
  {description}
  path="/contact.html"
  jsonLd={[
    breadcrumbNode([
      { name: 'Home', path: '/' },
      { name: 'Contact', path: '/contact.html' }
    ]),
    webPageNode({ path: '/contact.html', name: 'Contact', description })
  ]}
/>

<PageHeader
  eyebrow="Editorial office"
  title="Contact"
  description={content.contact.intro}
  items={[{ name: 'Home', href: '/' }, { name: 'Contact' }]}
/>

<div class="container-page grid gap-12 py-14 grid-cols-1 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-16 lg:py-16">
  <div class="grid content-start gap-14">
    <section aria-labelledby="office-heading">
      <h2 id="office-heading" class="display-2 border-b border-border-strong pb-3">How to reach us</h2>
      <p class="measure mt-6 text-muted-foreground">
        Manuscript submissions and editorial correspondence are handled by email. Please include the manuscript title and
        the names of all authors in your message.
      </p>

      <dl class="mt-7 grid gap-x-10 gap-y-6 sm:grid-cols-2">
        <div class="border-t border-border-strong pt-4">
          <dt class="eyebrow flex items-center gap-2 text-accent-foreground">
            <Mail class="size-3.5" aria-hidden="true" />Email
          </dt>
          <dd class="mt-2">
            <a
              class="text-[1.0625rem] font-semibold break-all text-heading no-underline hover:text-accent-foreground hover:underline"
              href={`mailto:${SITE.email}?subject=Manuscript%20submission%20to%20GJMSSH`}
            >
              {SITE.email}
            </a>
          </dd>
        </div>
        <div class="border-t border-border-strong pt-4">
          <dt class="eyebrow flex items-center gap-2 text-accent-foreground">
            <Globe class="size-3.5" aria-hidden="true" />Website
          </dt>
          <dd class="mt-2">
            <a
              class="text-[1.0625rem] font-semibold text-heading no-underline hover:text-accent-foreground hover:underline"
              href={`https://${SITE.website}`}
              rel="noopener"
            >
              {SITE.website}
            </a>
          </dd>
        </div>
      </dl>

      <div class="mt-8">
        <Button variant="navy" href={`mailto:${SITE.email}?subject=Manuscript%20submission%20to%20GJMSSH`}>
          <Mail aria-hidden="true" />
          Submit a manuscript
        </Button>
      </div>
    </section>

    <section aria-labelledby="before-heading">
      <h2 id="before-heading" class="display-2 border-b border-border-strong pb-3">Before you write</h2>
      <p class="measure mt-6 text-muted-foreground">
        Most questions are answered on the pages below — checking them first may save you time.
      </p>
      <ul class="mt-6">
        {#each elsewhere as item (item.href)}
          <li class="border-t border-border last:border-b">
            <a class="group block py-4 no-underline" href={item.href}>
              <span class="font-serif text-[1.125rem] text-heading group-hover:text-accent-foreground">{item.label}</span>
              <span class="mt-1 block text-[0.875rem] text-muted-foreground">{item.body}</span>
            </a>
          </li>
        {/each}
      </ul>
    </section>
  </div>

  <aside class="grid content-start gap-10">
    <section aria-labelledby="journal-facts-heading">
      <h2 id="journal-facts-heading" class="eyebrow text-subtle-foreground">The journal</h2>
      <dl class="mt-4 grid gap-3">
        {#each [
          { term: 'Name', detail: SITE.fullName },
          { term: 'Print ISSN', detail: SITE.issn.print },
          { term: 'Online ISSN', detail: SITE.issn.online },
          { term: 'Published since', detail: String(SITE.startYear) },
          { term: 'Issues', detail: formatCount(stats.issues) },
          { term: 'Articles', detail: formatCount(stats.articles) }
        ] as row (row.term)}
          <div class="border-t border-border pt-3">
            <dt class="text-[0.75rem] tracking-[0.06em] text-subtle-foreground uppercase">{row.term}</dt>
            <dd class="mt-1 text-[0.875rem] leading-snug font-medium">{row.detail}</dd>
          </div>
        {/each}
      </dl>
      <div class="mt-5">
        <Button variant="outline" size="sm" href="/current-issue.html">Current issue</Button>
      </div>
    </section>

    <section class="rounded-lg border border-border bg-surface-muted p-6" aria-labelledby="submitting-heading">
      <h2 id="submitting-heading" class="eyebrow text-subtle-foreground">Submitting a manuscript</h2>
      <p class="mt-3 text-[0.9375rem] leading-relaxed text-muted-foreground">
        Read the author guidelines, then send your manuscript to
        <a class="inline-block py-0.5 font-semibold text-accent-foreground underline underline-offset-2" href={`mailto:${SITE.email}`}>
          {SITE.email}
        </a>.
      </p>
      <div class="mt-5">
        <Button variant="outline" size="sm" href="/author-guideline.html">Open the guidelines</Button>
      </div>
    </section>
  </aside>
</div>
