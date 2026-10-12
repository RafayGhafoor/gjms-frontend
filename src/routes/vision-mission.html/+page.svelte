<script lang="ts">
  import Seo from '$lib/components/site/seo.svelte';
  import Breadcrumbs from '$lib/components/site/breadcrumbs.svelte';
  import Card from '$lib/components/ui/card.svelte';
  import Button from '$lib/components/ui/button.svelte';
  import { content } from '$lib/data/content';
  import type { PageProps } from './$types';

  let { data }: PageProps = $props();
  const stats = $derived(data.stats);
  import { SITE } from '$lib/config/site';
  import { breadcrumbNode, webPageNode } from '$lib/seo';
  import { formatCount } from '$lib/utils';
  import CircleCheck from '@lucide/svelte/icons/circle-check';
  import Library from '@lucide/svelte/icons/library';
  import Quote from '@lucide/svelte/icons/quote';
  import ShieldCheck from '@lucide/svelte/icons/shield-check';
  import Users from '@lucide/svelte/icons/users';

  /* The vision and mission text is the journal's own published statement,
     reproduced verbatim from content.json. */

  const vision = $derived(content.visionMission.vision);
  const missionIntro = $derived(content.visionMission.missionIntro);
  const missionItems = $derived(content.visionMission.missionItems);

  const description = `The vision and mission of the Global Journal of Management, Social Sciences and Humanities (GJMSSH) — a blind peer-reviewed quarterly journal published since ${SITE.startYear}.`;
</script>

<Seo
  title="Vision and mission"
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

<section class="border-b border-border bg-surface-muted">
  <div class="container-page py-10">
    <Breadcrumbs class="mb-5" items={[{ name: 'Home', href: '/' }, { name: 'About' }]} />
    <h1 class="display-1">Vision and mission</h1>
    <p class="mt-3 max-w-[70ch] text-muted-foreground">
      {SITE.fullName} — {SITE.tagline.toLowerCase()}, published since {SITE.startYear}. This is the journal's own
      statement of its purpose and principles.
    </p>
  </div>
</section>

<div class="container-page grid gap-10 py-10 lg:grid-cols-[minmax(0,1fr)_18rem]">
  <div class="grid gap-10">
    <section aria-labelledby="vision-heading">
      <p class="eyebrow flex items-center gap-2 text-subtle-foreground">
        <Quote class="size-3.5" aria-hidden="true" />Vision
      </p>
      <h2 id="vision-heading" class="mt-2 text-2xl tracking-tight">Why the journal exists</h2>
      <div class="mt-5 border-l-2 border-accent-border pl-6">
        <p class="reading max-w-[72ch] text-muted-foreground">{vision}</p>
      </div>
    </section>

    <section aria-labelledby="mission-heading">
      <p class="eyebrow flex items-center gap-2 text-subtle-foreground">
        <ShieldCheck class="size-3.5" aria-hidden="true" />Mission
      </p>
      <h2 id="mission-heading" class="mt-2 text-2xl tracking-tight">Core objectives</h2>
      <p class="mt-4 max-w-[72ch] text-muted-foreground">{missionIntro}</p>

      <ol class="mt-6 grid gap-3">
        {#each missionItems as item, index (item)}
          <li class="flex gap-4 rounded-xl border border-border bg-card p-5 shadow-sm">
            <span
              class="grid size-8 shrink-0 place-items-center rounded-lg bg-accent text-xs font-bold text-accent-foreground tabular-nums"
              aria-hidden="true"
            >
              {index + 1}
            </span>
            <p class="text-[0.9375rem] text-muted-foreground">{item}</p>
          </li>
        {/each}
      </ol>
    </section>

    <section class="rounded-2xl border border-border bg-surface-muted p-8" aria-labelledby="scope-heading">
      <h2 id="scope-heading" class="text-xl tracking-tight">The journal in numbers</h2>
      <p class="mt-2 max-w-[70ch] text-sm text-muted-foreground">
        All figures below are counted from the journal's published article index.
      </p>
      <dl class="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div>
          <dt class="eyebrow text-subtle-foreground">Articles</dt>
          <dd class="mt-1 text-2xl font-bold tabular-nums">{formatCount(stats.articles)}</dd>
        </div>
        <div>
          <dt class="eyebrow text-subtle-foreground">Issues</dt>
          <dd class="mt-1 text-2xl font-bold tabular-nums">{formatCount(stats.issues)}</dd>
        </div>
        <div>
          <dt class="eyebrow text-subtle-foreground">Volumes</dt>
          <dd class="mt-1 text-2xl font-bold tabular-nums">{formatCount(stats.volumes)}</dd>
        </div>
        <div>
          <dt class="eyebrow text-subtle-foreground">Published since</dt>
          <dd class="mt-1 text-2xl font-bold tabular-nums">{stats.firstYear}</dd>
        </div>
      </dl>
      <div class="mt-6 flex flex-wrap gap-3">
        <Button href="/archive.html">
          <Library aria-hidden="true" />
          Browse the archive
        </Button>
        <Button variant="outline" href="/editorial-board.html">
          <Users aria-hidden="true" />
          Editorial board
        </Button>
        <Button variant="outline" href="/author-guideline.html">
          <CircleCheck aria-hidden="true" />
          Author guidelines
        </Button>
      </div>
    </section>
  </div>

  <aside class="grid content-start gap-6 lg:sticky lg:top-[9rem] lg:self-start">
    <Card padding="lg">
      <h2 class="eyebrow text-subtle-foreground">On this page</h2>
      <ul class="mt-3 grid gap-2 text-sm">
        <li><a class="text-muted-foreground no-underline hover:text-accent-foreground" href="#vision-heading">Vision</a></li>
        <li><a class="text-muted-foreground no-underline hover:text-accent-foreground" href="#mission-heading">Core objectives</a></li>
        <li><a class="text-muted-foreground no-underline hover:text-accent-foreground" href="#scope-heading">The journal in numbers</a></li>
      </ul>
    </Card>

    <Card padding="lg">
      <h2 class="eyebrow text-subtle-foreground">At a glance</h2>
      <ul class="mt-3 grid gap-2 text-sm text-muted-foreground">
        <li>{SITE.name} — {SITE.tagline}</li>
        <li>Published since {SITE.startYear}</li>
        <li>{formatCount(stats.articles)} articles, {formatCount(stats.issues)} issues</li>
        <li>{formatCount(stats.specialEditions)} special editions</li>
      </ul>
      <div class="mt-4">
        <Button variant="outline" size="sm" href="/contact.html">Contact the journal</Button>
      </div>
    </Card>
  </aside>
</div>
