<script lang="ts">
  import Breadcrumbs from './breadcrumbs.svelte';
  import type { Snippet } from 'svelte';

  /* The standard interior-page masthead: breadcrumb trail, an optional kicker,
     the single H1, a lede, and a slot for anything else the page wants under
     the title (a definition list, actions, filters). Kept as one component so
     every interior page opens with the same rhythm. */
  let {
    title,
    eyebrow = '',
    description = '',
    items = [],
    headingClass = 'display-1',
    children,
    class: className = ''
  }: {
    title: string;
    eyebrow?: string;
    description?: string;
    items?: { name: string; href?: string }[];
    /* Article pages carry long titles, so they pass a slightly tighter display
       size in place of the default page-title scale. */
    headingClass?: string;
    children?: Snippet;
    class?: string;
  } = $props();
</script>

<section class={`border-b border-border bg-surface-muted ${className}`}>
  <div class="container-page pt-10 pb-12 lg:pt-14 lg:pb-16">
    {#if items.length}
      <Breadcrumbs class="mb-6" {items} />
    {/if}
    {#if eyebrow}
      <p class="eyebrow text-accent-foreground">{eyebrow}</p>
    {/if}
    <h1 class="{headingClass} mt-3 max-w-[26ch]">{title}</h1>
    {#if description}
      <p class="measure mt-4 text-muted-foreground">{description}</p>
    {/if}
    {@render children?.()}
  </div>
</section>
