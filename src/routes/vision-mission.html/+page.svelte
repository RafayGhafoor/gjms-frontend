<script lang="ts">
  import Seo from '$lib/components/site/seo.svelte';
  import PageHeader from '$lib/components/site/page-header.svelte';
  import Button from '$lib/components/ui/button.svelte';
  import { content } from '$lib/data/content';
  import type { PageProps } from './$types';
  import { SITE } from '$lib/config/site';
  import { breadcrumbNode, webPageNode } from '$lib/seo';
  import { formatCount } from '$lib/utils';

  /* The vision and mission text is the journal's own published statement,
     reproduced verbatim from content.json. */

  let { data }: PageProps = $props();
  const stats = $derived(data.stats);

  const vision = $derived(content.visionMission.vision);
  const missionIntro = $derived(content.visionMission.missionIntro);
  const missionItems = $derived(content.visionMission.missionItems);

  const figures = $derived([
    { term: 'Articles', detail: formatCount(stats.articles) },
    { term: 'Issues', detail: formatCount(stats.issues) },
    { term: 'Volumes', detail: formatCount(stats.volumes) },
    { term: 'Published since', detail: String(stats.firstYear) }
  ]);

  const description = `The vision and mission of the Global Journal of Management, Social Sciences and Humanities (GJMSSH) — a blind peer-reviewed quarterly journal published since ${SITE.startYear}.`;
</script>

<Seo
  title="Aims, scope and mission of the journal"
  {description}
  path="/vision-mission.html"
  jsonLd={[
    breadcrumbNode([
      { name: 'Home', path: '/' },
      { name: 'About', path: '/vision-mission.html' }
    ]),
    webPageNode({ path: '/vision-mission.html', name: 'Vision and mission', description })
  ]}
/>

<PageHeader
  eyebrow="About the journal"
  title="Vision and mission"
  description="{SITE.fullName} — {SITE.tagline.toLowerCase()}, published since {SITE.startYear}. This is the journal's own statement of its purpose and principles."
  items={[{ name: 'Home', href: '/' }, { name: 'About' }]}
/>

<div class="container-page grid gap-12 py-14 grid-cols-1 lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-16 lg:py-16">
  <div class="grid gap-16">
    <section aria-labelledby="vision-heading">
      <h2 id="vision-heading" class="display-2 border-b border-border-strong pb-3">Why the journal exists</h2>
      <blockquote class="mt-7 border-l-2 border-accent-border pl-6">
        <p class="reading measure text-muted-foreground">{vision}</p>
      </blockquote>
    </section>

    <section aria-labelledby="mission-heading">
      <h2 id="mission-heading" class="display-2 border-b border-border-strong pb-3">Core objectives</h2>
      <p class="measure mt-6 text-muted-foreground">{missionIntro}</p>

      <ol class="mt-7">
        {#each missionItems as item, index (item)}
          <li class="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-x-4 border-t border-border py-4 last:border-b">
            <span class="font-serif text-[0.9375rem] leading-7 text-gold-foreground tabular-nums" aria-hidden="true">
              {String(index + 1).padStart(2, '0')}
            </span>
            <p class="measure text-[0.9375rem] leading-relaxed text-muted-foreground">{item}</p>
          </li>
        {/each}
      </ol>
    </section>

    <section aria-labelledby="scope-heading">
      <h2 id="scope-heading" class="display-2 border-b border-border-strong pb-3">The journal in numbers</h2>
      <p class="measure mt-6 text-[0.9375rem] text-subtle-foreground">
        All figures below are counted from the journal's published article index.
      </p>
      <dl class="mt-6 grid grid-cols-2 gap-x-8 gap-y-6 border-t border-border-strong pt-6 sm:grid-cols-4">
        {#each figures as figure (figure.term)}
          <div>
            <dt class="text-[0.8125rem] text-subtle-foreground">{figure.term}</dt>
            <dd class="mt-1.5 font-serif text-[1.5rem] leading-none font-semibold tabular-nums">{figure.detail}</dd>
          </div>
        {/each}
      </dl>
      <div class="mt-8 flex flex-wrap gap-3">
        <Button href="/archive.html">Browse the archive</Button>
        <Button variant="outline" href="/editorial-board.html">Editorial board</Button>
        <Button variant="ghost" href="/author-guideline.html">Author guidelines</Button>
      </div>
    </section>
  </div>

  <aside class="grid content-start gap-10 lg:sticky lg:top-[7.5rem] lg:self-start">
    <nav aria-labelledby="on-this-page">
      <h2 id="on-this-page" class="eyebrow text-subtle-foreground">On this page</h2>
      <ul class="mt-4">
        {#each [
          { label: 'Vision', href: '#vision-heading' },
          { label: 'Core objectives', href: '#mission-heading' },
          { label: 'The journal in numbers', href: '#scope-heading' }
        ] as link (link.href)}
          <li class="border-t border-border last:border-b">
            <a
              class="block py-3 text-[0.9375rem] text-muted-foreground no-underline transition-colors hover:text-accent-foreground"
              href={link.href}
            >
              {link.label}
            </a>
          </li>
        {/each}
      </ul>
    </nav>

    <section aria-labelledby="glance-heading">
      <h2 id="glance-heading" class="eyebrow text-subtle-foreground">At a glance</h2>
      <ul class="mt-4 grid gap-2.5 text-[0.9375rem] text-muted-foreground">
        <li>{SITE.name} — {SITE.tagline}</li>
        <li>Published since {SITE.startYear}</li>
        <li>{formatCount(stats.articles)} articles, {formatCount(stats.issues)} issues</li>
        <li>{formatCount(stats.specialEditions)} special editions</li>
      </ul>
      <div class="mt-5">
        <Button variant="outline" size="sm" href="/contact.html">Contact the journal</Button>
      </div>
    </section>
  </aside>
</div>
