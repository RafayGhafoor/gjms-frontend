<script lang="ts">
  import { page } from '$app/state';
  import Seo from '$lib/components/site/seo.svelte';
  import TypeSample from '$lib/components/type/type-sample.svelte';
  import { PAIRINGS } from '$lib/data/type-pairings';
  import { paramId } from '$lib/data/paths';
  import { cn } from '$lib/utils';

  let { data } = $props();

  /* Derived straight from the route param so the prerendered HTML carries the
     right fonts — an $effect would only apply in the browser, and every page
     would be built with the first pairing. */
  const pairId = $derived(paramId(page.params.pair) || '1');
  const pairing = $derived(PAIRINGS[pairId] ?? PAIRINGS['1']);
  const order = $derived(Object.keys(PAIRINGS));
</script>

<Seo
  title="Typography comparison — {pairing.label}"
  description="Internal typography comparison for the GJMSSH redesign."
  path="/type/{pairId}"
  noindex={true}
  includeSiteGraph={false}
/>

<!-- switcher -->
<div class="sticky top-0 z-10 border-b border-border glass">
  <div class="mx-auto flex max-w-6xl flex-wrap items-center gap-2 px-6 py-3">
    <span class="eyebrow mr-1 text-subtle-foreground">Pairing</span>
    {#each order as id (id)}
      <a
        href="/type/{id}"
        class={cn(
          'rounded-full border px-3 py-1.5 text-xs font-semibold no-underline transition-colors',
          id === pairId
            ? 'border-primary bg-primary text-primary-foreground'
            : 'border-border-strong text-muted-foreground hover:border-primary hover:text-accent-foreground'
        )}
      >
        {id === 'current' ? 'current' : `#${id}`} · {PAIRINGS[id].label.split(' + ')[0]}
      </a>
    {/each}
  </div>
  <div class="mx-auto max-w-6xl px-6 pb-3 text-xs text-muted-foreground">
    <strong class="font-semibold text-foreground">{pairing.label}</strong> — {pairing.note} · heading {pairing.h1.replace('clamp(', '')} @ {pairing.headingWeight} · body {pairing.bodySize}/1.7 · nav {pairing.navSize}
  </div>
</div>

<TypeSample
  {pairing}
  articles={data.articles}
  abstract={data.abstract}
  navLabels={data.navLabels}
  totalArticles={data.totalArticles}
  totalIssues={data.totalIssues}
/>
