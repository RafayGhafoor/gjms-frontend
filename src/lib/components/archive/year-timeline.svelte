<script lang="ts">
  import { onMount } from 'svelte';
  import { cn } from '$lib/utils';

  /* Left-hand year timeline for the archive.
     A vertical rail on large screens, a horizontal scroller on mobile.
     Each node links to its year section and carries the real article count for
     that year as a small bar, so the rail doubles as a distribution chart. */
  type YearNode = { year: number; issues: number; articles: number };

  let { years, class: className = '' }: { years: YearNode[]; class?: string } = $props();

  let activeYear = $state<number | null>(null);
  const active = $derived(activeYear ?? years[0]?.year ?? null);
  const max = $derived(Math.max(1, ...years.map((y) => y.articles)));

  onMount(() => {
    const sections = years
      .map((y) => document.getElementById(`year-${y.year}`))
      .filter((el): el is HTMLElement => Boolean(el));
    if (!sections.length || !('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length) {
          activeYear = Number(visible[0].target.id.replace('year-', ''));
        }
      },
      { rootMargin: '-25% 0px -60% 0px', threshold: [0, 0.2, 1] }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  });
</script>

<nav
  class={cn('no-print', className)}
  aria-label="Timeline of publication years"
>
  <p class="eyebrow mb-3 text-subtle-foreground">Timeline</p>

  <!-- Vertical rail (large screens) -->
  <ol class="relative hidden border-l border-border pl-0 lg:grid lg:gap-0.5">
    {#each years as node (node.year)}
      {@const isActive = active === node.year}
      <li class="relative">
        <a
          href="#year-{node.year}"
          aria-current={isActive ? 'true' : undefined}
          class={cn(
            'group flex items-center gap-3 rounded-r-md py-2 pr-3 pl-4 no-underline transition-colors duration-200 hover:bg-muted',
            isActive && 'bg-accent'
          )}
        >
          <span
            class={cn(
              'absolute -left-[5px] size-2.5 rounded-full border-2 border-background transition-all duration-300',
              isActive ? 'scale-125 bg-primary' : 'bg-border-strong group-hover:bg-primary'
            )}
            aria-hidden="true"
          ></span>
          <span
            class={cn(
              'text-sm font-semibold tabular-nums transition-colors',
              isActive ? 'text-accent-foreground' : 'text-muted-foreground group-hover:text-foreground'
            )}
          >
            {node.year}
          </span>
          <span
            class="ml-auto h-1.5 rounded-full bg-border transition-[width,background-color] duration-500 group-hover:bg-primary/60 {isActive
              ? 'bg-primary'
              : ''}"
            style="width: {Math.max(6, (node.articles / max) * 46)}px"
            aria-hidden="true"
          ></span>
          <span class="w-14 shrink-0 text-right text-[0.625rem] text-subtle-foreground tabular-nums">
            {node.articles} art.
          </span>
        </a>
      </li>
    {/each}
  </ol>

  <!-- Horizontal rail (mobile / tablet) -->
  <ul class="flex gap-2 overflow-x-auto pb-1 no-scrollbar lg:hidden">
    {#each years as node (node.year)}
      <li class="shrink-0">
        <a
          href="#year-{node.year}"
          class="flex items-center gap-2 rounded-full border border-border-strong bg-surface px-3 py-1.5 text-xs font-semibold text-muted-foreground no-underline transition-colors hover:border-primary hover:text-accent-foreground"
        >
          {node.year}
          <span class="text-subtle-foreground tabular-nums">{node.articles}</span>
        </a>
      </li>
    {/each}
  </ul>
</nav>
