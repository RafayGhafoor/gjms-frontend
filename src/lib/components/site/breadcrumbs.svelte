<script lang="ts">
  import ChevronRight from '@lucide/svelte/icons/chevron-right';

  /* Visible breadcrumb trail. The same items are emitted as BreadcrumbList
     structured data by the page's <Seo> component. */
  let { items, class: className = '' }: { items: { name: string; href?: string }[]; class?: string } = $props();
</script>

<nav class={className} aria-label="Breadcrumb">
  <ol class="flex flex-wrap items-center gap-2 text-[0.8125rem]">
    {#each items as item, index (item.name)}
      <li class="flex items-center gap-2">
        {#if index > 0}
          <ChevronRight class="size-3 text-border-strong" aria-hidden="true" />
        {/if}
        {#if item.href && index < items.length - 1}
          <a class="py-0.5 text-accent-foreground no-underline hover:underline hover:underline-offset-4" href={item.href}>
            {item.name}
          </a>
        {:else}
          <span class="text-subtle-foreground" aria-current="page">{item.name}</span>
        {/if}
      </li>
    {/each}
  </ol>
</nav>
