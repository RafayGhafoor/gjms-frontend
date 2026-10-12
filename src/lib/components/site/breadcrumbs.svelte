<script lang="ts">
    import ChevronRight from '@lucide/svelte/icons/chevron-right';

  /* Visible breadcrumb trail. The same items are emitted as BreadcrumbList
     structured data by the page's <Seo> component. */
  let { items, class: className = '' }: { items: { name: string; href?: string }[]; class?: string } = $props();
</script>

<nav class={className} aria-label="Breadcrumb">
  <ol class="flex flex-wrap items-center gap-1.5 text-xs text-subtle-foreground">
    {#each items as item, index (item.name)}
      <li class="flex items-center gap-1.5">
        {#if index > 0}
          <ChevronRight class="size-3 text-border-strong" aria-hidden="true" />
        {/if}
        {#if item.href && index < items.length - 1}
          <a class="rounded transition-colors hover:text-accent-foreground" href={item.href}>{item.name}</a>
        {:else}
          <span class="font-semibold text-muted-foreground" aria-current="page">{item.name}</span>
        {/if}
      </li>
    {/each}
  </ol>
</nav>
