<script lang="ts">
  import Seo from '$lib/components/site/seo.svelte';
  import Breadcrumbs from '$lib/components/site/breadcrumbs.svelte';
  import Card from '$lib/components/ui/card.svelte';
  import Input from '$lib/components/ui/input.svelte';
  import Button from '$lib/components/ui/button.svelte';
  import Badge from '$lib/components/ui/badge.svelte';
  import { content } from '$lib/data/content';
  import type { PageProps } from './$types';

  let { data }: PageProps = $props();
  const stats = $derived(data.stats);
  import { breadcrumbNode, collectionPageNode, personNode } from '$lib/seo';
  import { formatCount } from '$lib/utils';
  import Mail from '@lucide/svelte/icons/mail';
  import SearchX from '@lucide/svelte/icons/search-x';
  import Users from '@lucide/svelte/icons/users';

  /* The roster is reproduced exactly as published in content.json:
   * name + affiliation only. No photos, titles, countries or biographies are
   * invented — the avatar is the member's own initials. */

  function initials(name: string): string {
    const cleaned = name
      .replace(/\b(prof|professor|dr|mr|mrs|ms|engr|syed|hafiz|sir|miss)\.?\b/gi, ' ')
      .replace(/[^\p{L}\s]/gu, ' ')
      .trim();
    const parts = cleaned.split(/\s+/).filter(Boolean);
    if (!parts.length) return name.slice(0, 2).toUpperCase();
    const first = parts[0][0] ?? '';
    const last = parts.length > 1 ? (parts[parts.length - 1][0] ?? '') : '';
    return `${first}${last}`.toUpperCase();
  }

  const palette = [
    'bg-accent text-accent-foreground',
    'bg-gold-soft text-gold-foreground',
    'bg-cyan-soft text-cyan-foreground',
    'bg-surface-strong text-foreground'
  ];

  function tone(name: string): string {
    let hash = 0;
    for (const character of name) hash = (hash * 31 + character.charCodeAt(0)) % 9973;
    return palette[hash % palette.length];
  }

  const members = $derived(content.editorialBoard.members);
  const affiliations = $derived(new Set(members.map((member) => member.affiliation.trim())).size);

  let q = $state('');
  const filtered = $derived.by(() => {
    const term = q.trim().toLowerCase();
    if (!term) return members;
    return members.filter(
      (member) => member.name.toLowerCase().includes(term) || member.affiliation.toLowerCase().includes(term)
    );
  });

  const description = $derived(`The editor-in-chief and ${members.length} international editorial board members of the Global Journal of Management, Social Sciences and Humanities (GJMSSH), with their published affiliations.`);
</script>

<Seo
  title="Editorial board"
  {description}
  path="/editorial-board.html"
  jsonLd={[
    breadcrumbNode([
      { name: 'Home', path: '/' },
      { name: 'Editorial board', path: '/editorial-board.html' }
    ]),
    collectionPageNode({ path: '/editorial-board.html', name: 'Editorial board', description }),
    personNode({ name: content.editorialBoard.editorInChief, affiliation: '' }, 'Editor-in-chief'),
    ...members.map((member) => personNode(member, 'Editorial board member'))
  ]}
/>

<section class="border-b border-border bg-surface-muted">
  <div class="container-page py-10">
    <Breadcrumbs class="mb-5" items={[{ name: 'Home', href: '/' }, { name: 'Editorial board' }]} />
    <h1 class="display-1 font-bold">Editorial board</h1>
    <p class="mt-3 max-w-[70ch] text-muted-foreground">
      GJMSSH is guided by an editor-in-chief and an international board of academics and professionals. The roster below
      is reproduced from the journal's published editorial board page — names and affiliations only.
    </p>
    <dl class="mt-6 grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-3">
      <div class="rounded-xl border border-border bg-card p-4 shadow-sm">
        <dt class="eyebrow text-subtle-foreground">Board members</dt>
        <dd class="mt-1 text-2xl font-bold tabular-nums">{formatCount(members.length)}</dd>
      </div>
      <div class="rounded-xl border border-border bg-card p-4 shadow-sm">
        <dt class="eyebrow text-subtle-foreground">Affiliated institutions</dt>
        <dd class="mt-1 text-2xl font-bold tabular-nums">{formatCount(affiliations)}</dd>
      </div>
      <div class="rounded-xl border border-border bg-card p-4 shadow-sm">
        <dt class="eyebrow text-subtle-foreground">Issues published</dt>
        <dd class="mt-1 text-2xl font-bold tabular-nums">{formatCount(stats.issues)}</dd>
      </div>
    </dl>
  </div>
</section>

<div class="container-page grid gap-10 py-10">
  <section aria-labelledby="eic-heading">
    <h2 id="eic-heading" class="text-xl font-bold tracking-tight">Editor-in-chief</h2>
    <Card padding="lg" variant="elevated" class="mt-4 flex flex-wrap items-center gap-5">
      <span
        class="grid size-16 shrink-0 place-items-center rounded-xl bg-[linear-gradient(140deg,var(--primary),#1e40af_55%,var(--cyan))] text-xl font-bold text-white"
        aria-hidden="true"
      >
        {initials(content.editorialBoard.editorInChief)}
      </span>
      <div class="min-w-0">
        <p class="text-lg font-bold">{content.editorialBoard.editorInChief}</p>
        <p class="mt-1 flex flex-wrap items-center gap-2">
          <Badge variant="accent">Editor-in-chief</Badge>
          <Badge variant="outline">{stats.firstYear}–{stats.lastYear}</Badge>
        </p>
      </div>
      <div class="ml-auto">
        <Button variant="outline" href={`mailto:${content.site.email}?subject=GJMSSH%20editorial%20office`}>
          <Mail aria-hidden="true" />
          Editorial office
        </Button>
      </div>
    </Card>
  </section>

  <section aria-labelledby="members-heading">
    <div class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h2 id="members-heading" class="text-xl font-bold tracking-tight">Editorial board members</h2>
        <p aria-live="polite" aria-atomic="true" class="mt-1 text-sm text-muted-foreground">
          Showing <span class="font-semibold text-foreground">{formatCount(filtered.length)}</span> of
          {formatCount(members.length)} members
        </p>
      </div>
      <div class="w-full sm:w-72">
        <Input label="Filter members" name="board-filter" placeholder="Name or institution" bind:value={q} />
      </div>
    </div>

    {#if filtered.length === 0}
      <Card padding="lg" class="mt-5 grid justify-items-center gap-3 text-center">
        <SearchX class="size-8 text-subtle-foreground" aria-hidden="true" />
        <h3 class="text-base font-bold">No member matches “{q}”</h3>
        <p class="text-sm text-muted-foreground">Try a shorter search term, or clear the filter.</p>
        <Button variant="outline" onclick={() => (q = '')}>Clear filter</Button>
      </Card>
    {:else}
      <ul class="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {#each filtered as member (member.name)}
          <li>
            <Card variant="interactive" padding="lg" class="flex h-full gap-4">
              <span
                class="grid size-11 shrink-0 place-items-center rounded-lg text-sm font-bold {tone(member.name)}"
                aria-hidden="true"
              >
                {initials(member.name)}
              </span>
              <div class="min-w-0">
                <h3 class="text-base font-semibold">{member.name}</h3>
                <p class="mt-1 text-sm text-muted-foreground">{member.affiliation}</p>
              </div>
            </Card>
          </li>
        {/each}
      </ul>
    {/if}
  </section>

  <section class="rounded-2xl border border-border bg-surface-muted p-8" aria-labelledby="board-cta">
    <Users class="size-6 text-accent-foreground" aria-hidden="true" />
    <h2 id="board-cta" class="mt-3 text-xl font-bold tracking-tight">Publishing with GJMSSH</h2>
    <p class="mt-2 max-w-[70ch] text-sm text-muted-foreground">
      Submissions are assessed through the journal's blind peer review process. Read the author guidelines for the
      manuscript requirements, or contact the editorial office with any question about the process.
    </p>
    <div class="mt-5 flex flex-wrap gap-3">
      <Button variant="gold" href="/author-guideline.html">Author guidelines</Button>
      <Button variant="outline" href="/contact.html">Contact the editorial office</Button>
      <Button variant="outline" href="/vision-mission.html">Vision &amp; mission</Button>
    </div>
  </section>
</div>
