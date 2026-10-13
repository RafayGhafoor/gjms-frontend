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
  import Mail from '@lucide/svelte/icons/mail';
  import Globe from '@lucide/svelte/icons/globe';
  import ClipboardList from '@lucide/svelte/icons/clipboard-list';
  import Users from '@lucide/svelte/icons/users';
  import Library from '@lucide/svelte/icons/library';

  const description = `Contact the editorial office of the Global Journal of Management, Social Sciences and Humanities (GJMSSH) about manuscript submissions, publication policies or collaboration.`;
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

<section class="border-b border-border bg-surface-muted">
  <div class="container-page py-10">
    <Breadcrumbs class="mb-5" items={[{ name: 'Home', href: '/' }, { name: 'Contact' }]} />
    <h1 class="display-1">Contact</h1>
    <p class="mt-3 max-w-[72ch] text-muted-foreground">{content.contact.intro}</p>
  </div>
</section>

<div class="container-page grid gap-6 py-10 lg:grid-cols-[minmax(0,1fr)_20rem]">
  <div class="grid content-start gap-6">
    <Card padding="lg" variant="elevated">
      <h2 class="text-xl tracking-tight">Editorial office</h2>
      <p class="mt-2 max-w-[70ch] text-sm text-muted-foreground">
        Manuscript submissions and editorial correspondence are handled by email. Please include the manuscript title and
        the names of all authors in your message.
      </p>
      <div class="mt-5 grid gap-4 sm:grid-cols-2">
        <a
          class="flex items-center gap-3 rounded-xl border border-border bg-surface p-4 no-underline transition-colors hover:border-accent-border"
          href={`mailto:${SITE.email}?subject=Manuscript%20submission%20to%20GJMSSH`}
        >
          <span class="grid size-9 place-items-center rounded-lg bg-accent text-accent-foreground" aria-hidden="true">
            <Mail class="size-4" />
          </span>
          <span class="min-w-0">
            <span class="eyebrow block text-subtle-foreground">Email</span>
            <span class="block truncate text-sm font-semibold text-foreground">{SITE.email}</span>
          </span>
        </a>
        <a
          class="flex items-center gap-3 rounded-xl border border-border bg-surface p-4 no-underline transition-colors hover:border-accent-border"
          href={`https://${SITE.website}`}
          rel="noopener"
        >
          <span class="grid size-9 place-items-center rounded-lg bg-accent text-accent-foreground" aria-hidden="true">
            <Globe class="size-4" />
          </span>
          <span class="min-w-0">
            <span class="eyebrow block text-subtle-foreground">Website</span>
            <span class="block truncate text-sm font-semibold text-foreground">{SITE.website}</span>
          </span>
        </a>
      </div>
    </Card>

    <Card padding="lg">
      <h2 class="text-xl tracking-tight">Before you write</h2>
      <p class="mt-2 max-w-[70ch] text-sm text-muted-foreground">
        Most questions are answered on the pages below — checking them first may save you time.
      </p>
      <div class="mt-5 grid gap-4 sm:grid-cols-3">
        {#each [
          { title: 'Author guidelines', body: 'Manuscript requirements, fee and review timeline.', href: '/author-guideline.html', icon: ClipboardList },
          { title: 'Editorial board', body: 'Who reviews and guides the journal.', href: '/editorial-board.html', icon: Users },
          { title: 'Archive', body: 'Every issue and article published since 2015.', href: '/archive.html', icon: Library }
        ] as item (item.href)}
          {@const Icon = item.icon}
          <a class="group rounded-xl border border-border bg-surface p-4 no-underline transition-colors hover:border-accent-border" href={item.href}>
            <Icon class="size-4 text-accent-foreground" aria-hidden="true" />
            <span class="mt-2 block text-sm font-semibold text-foreground group-hover:text-accent-foreground">{item.title}</span>
            <span class="mt-1 block text-xs text-muted-foreground">{item.body}</span>
          </a>
        {/each}
      </div>
    </Card>
  </div>

  <aside class="grid content-start gap-6">
    <Card padding="lg">
      <h2 class="eyebrow text-subtle-foreground">Journal</h2>
      <dl class="mt-3 grid gap-2 text-sm">
        <div><dt class="text-subtle-foreground">Name</dt><dd class="font-semibold">{SITE.fullName}</dd></div>
        <div>
          <dt class="text-subtle-foreground">ISSN</dt>
          <dd class="font-semibold tabular-nums">{SITE.issn.print} <span class="font-normal text-muted-foreground">(print)</span><br />{SITE.issn.online} <span class="font-normal text-muted-foreground">(online)</span></dd>
        </div>
        <div><dt class="text-subtle-foreground">Published since</dt><dd class="font-semibold">{SITE.startYear}</dd></div>
        <div><dt class="text-subtle-foreground">Issues</dt><dd class="font-semibold tabular-nums">{formatCount(stats.issues)}</dd></div>
        <div><dt class="text-subtle-foreground">Articles</dt><dd class="font-semibold tabular-nums">{formatCount(stats.articles)}</dd></div>
      </dl>
      <div class="mt-4">
        <Button variant="outline" size="sm" href="/current-issue.html">Current issue</Button>
      </div>
    </Card>

    <Card padding="lg" class="border-gold-border bg-gold-soft">
      <h2 class="eyebrow text-gold-foreground">Submitting a manuscript</h2>
      <p class="mt-2 text-sm text-foreground">
        Read the author guidelines, then send your manuscript to
        <a class="font-semibold text-gold-foreground" href={`mailto:${SITE.email}`}>{SITE.email}</a>.
      </p>
      <div class="mt-4">
        <Button variant="gold" size="sm" href="/author-guideline.html">Open the guidelines</Button>
      </div>
    </Card>
  </aside>
</div>
