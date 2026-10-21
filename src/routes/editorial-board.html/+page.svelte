<script lang="ts">
  import Seo from '$lib/components/site/seo.svelte';
  import PageHeader from '$lib/components/site/page-header.svelte';
  import Input from '$lib/components/ui/input.svelte';
  import Button from '$lib/components/ui/button.svelte';
  import { content } from '$lib/data/content';
  import type { PageProps } from './$types';
  import { breadcrumbNode, collectionPageNode, personNode } from '$lib/seo';
  import { formatCount } from '$lib/utils';
  import Mail from '@lucide/svelte/icons/mail';
  import SearchX from '@lucide/svelte/icons/search-x';

  /* The roster is reproduced exactly as published in content.json:
   * name + affiliation only. No photos, titles, countries or biographies are
   * invented — the only typographic device is the editor-in-chief's monogram,
   * built from the published name itself. */

  let { data }: PageProps = $props();
  const stats = $derived(data.stats);

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

  const description = $derived(
    `The editor-in-chief and ${members.length} international editorial board members of the Global Journal of Management, Social Sciences and Humanities (GJMSSH), with their published affiliations.`
  );
</script>

<Seo
  title="Editorial board: editor-in-chief and members"
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

<PageHeader
  eyebrow="Masthead"
  title="Editorial board"
  description="GJMSSH is guided by an editor-in-chief and an international board of academics and professionals. The roster below is reproduced from the journal's published editorial board page — names and affiliations only."
  items={[{ name: 'Home', href: '/' }, { name: 'Editorial board' }]}
>
  <dl class="mt-9 grid grid-cols-2 gap-x-8 gap-y-6 border-t border-border-strong pt-6 sm:grid-cols-3">
    <div>
      <dt class="text-[0.8125rem] text-subtle-foreground">Board members</dt>
      <dd class="mt-1.5 font-serif text-[1.5rem] leading-none font-semibold tabular-nums">{formatCount(members.length)}</dd>
    </div>
    <div>
      <dt class="text-[0.8125rem] text-subtle-foreground">Affiliated institutions</dt>
      <dd class="mt-1.5 font-serif text-[1.5rem] leading-none font-semibold tabular-nums">{formatCount(affiliations)}</dd>
    </div>
    <div>
      <dt class="text-[0.8125rem] text-subtle-foreground">Issues published</dt>
      <dd class="mt-1.5 font-serif text-[1.5rem] leading-none font-semibold tabular-nums">{formatCount(stats.issues)}</dd>
    </div>
  </dl>
</PageHeader>

<div class="container-page grid gap-16 py-14 lg:py-16">
  <!-- Editor-in-chief, treated as a masthead entry rather than a profile card. -->
  <section aria-labelledby="eic-heading">
    <h2 id="eic-heading" class="eyebrow text-accent-foreground">Editor-in-chief</h2>
    <div class="mt-6 flex flex-wrap items-center gap-x-8 gap-y-5 border-y border-border py-8">
      <span
        class="grid size-16 shrink-0 place-items-center rounded-md bg-accent font-serif text-[1.375rem] font-semibold text-accent-foreground"
        aria-hidden="true"
      >
        {initials(content.editorialBoard.editorInChief)}
      </span>
      <div class="min-w-0">
        <p class="font-serif text-[1.5rem] leading-tight font-semibold text-heading">
          {content.editorialBoard.editorInChief}
        </p>
        <p class="mt-2 text-[0.875rem] text-subtle-foreground">
          Editor-in-chief
        </p>
      </div>
      <div class="sm:ml-auto">
        <Button
          variant="outline"
          size="sm"
          href={`mailto:${content.site.email}?subject=GJMSSH%20editorial%20office`}
        >
          <Mail aria-hidden="true" />
          Editorial office
        </Button>
      </div>
    </div>
  </section>

  <!-- Board directory -->
  <section aria-labelledby="members-heading">
    <div class="flex flex-wrap items-end justify-between gap-x-8 gap-y-5 border-b border-border-strong pb-4">
      <div>
        <h2 id="members-heading" class="display-2">Editorial board members</h2>
        <p aria-live="polite" aria-atomic="true" class="mt-2 text-[0.9375rem] text-muted-foreground">
          {#if q.trim()}
            Showing <span class="font-semibold text-heading tabular-nums">{formatCount(filtered.length)}</span> of
            <span class="tabular-nums">{formatCount(members.length)}</span> members
          {:else}
            <span class="tabular-nums">{formatCount(members.length)}</span> members
          {/if}
        </p>
      </div>
      <div class="w-full sm:w-72">
        <Input label="Filter members" name="board-filter" placeholder="Name or institution" bind:value={q} />
      </div>
    </div>

    {#if filtered.length === 0}
      <div class="mt-8 rounded-lg border border-border bg-surface-muted px-6 py-14 text-center">
        <SearchX class="mx-auto size-7 text-subtle-foreground" aria-hidden="true" />
        <h3 class="mt-4 font-serif text-[1.1875rem]">No member matches “{q}”</h3>
        <p class="measure mx-auto mt-3 text-[0.9375rem] text-muted-foreground">
          Try a shorter search term, or clear the filter to list every member of the board.
        </p>
        <div class="mt-6">
          <Button variant="outline" onclick={() => (q = '')}>Clear filter</Button>
        </div>
      </div>
    {:else}
      <ul class="mt-2 grid gap-x-12 md:grid-cols-2">
        {#each filtered as member (member.name)}
          <li class="border-b border-border py-5">
            <h3 class="font-serif text-[1.0625rem] leading-snug">{member.name}</h3>
            <p class="measure mt-1.5 text-[0.875rem] leading-relaxed text-muted-foreground">{member.affiliation}</p>
          </li>
        {/each}
      </ul>
    {/if}
  </section>

  <section aria-labelledby="board-cta">
    <h2 id="board-cta" class="display-2">Publishing with GJMSSH</h2>
    <p class="measure mt-4 text-muted-foreground">
      Submissions are assessed through the journal's blind peer review process. Read the author guidelines for the
      manuscript requirements, or contact the editorial office with any question about the process.
    </p>
    <div class="mt-7 flex flex-wrap gap-3">
      <Button variant="navy" href="/author-guideline.html">Author guidelines</Button>
      <Button variant="outline" href="/contact.html">Contact the editorial office</Button>
      <Button variant="ghost" href="/vision-mission.html">Vision and mission</Button>
    </div>
  </section>
</div>
