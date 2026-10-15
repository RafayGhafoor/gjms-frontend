<script lang="ts">
  import { onMount } from 'svelte';
  import { cn } from '$lib/utils';
  import type { ChartPoint } from '$lib/data/types';

  /* Dependency-free bar chart built from the archive's own counts.
     When `onSelect` is supplied the bars are real buttons, so the chart doubles
     as a keyboard-accessible filter control. */
  let {
    points,
    height = 170,
    tone = 'primary',
    ariaLabel,
    showValues = true,
    onSelect,
    class: className = ''
  }: {
    points: ChartPoint[];
    height?: number;
    tone?: 'primary' | 'gold' | 'cyan';
    ariaLabel: string;
    showValues?: boolean;
    onSelect?: (point: ChartPoint) => void;
    class?: string;
  } = $props();

  let drawn = $state(false);
  onMount(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      drawn = true;
      return;
    }
    const id = requestAnimationFrame(() => (drawn = true));
    return () => cancelAnimationFrame(id);
  });

  const max = $derived(Math.max(1, ...points.map((p) => p.value)));
  const barTone = $derived(tone === 'gold' ? 'bg-gold' : tone === 'cyan' ? 'bg-cyan' : 'bg-primary');

  const barClass = $derived(
    cn(
      'block w-full rounded-t-[4px] transition-[height,filter,box-shadow] duration-700 ease-nexus',
      barTone,
      onSelect && 'cursor-pointer hover:brightness-110 focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:outline-none'
    )
  );
</script>

<div class={cn('w-full', className)}>
  <div class="flex items-end gap-1.5 sm:gap-2" style="height: {height}px" role="img" aria-label={ariaLabel}>
    {#each points as point (point.label)}
      {@const pct = drawn ? Math.max(3, (point.value / max) * 100) : 0}
      <div class="group relative flex h-full min-w-0 flex-1 flex-col justify-end">
        <div
          class="pointer-events-none absolute -top-1 left-1/2 z-20 -translate-x-1/2 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100"
        >
          <span
            class="block rounded-md border border-border bg-popover px-2 py-1 text-[0.6875rem] font-semibold whitespace-nowrap text-popover-foreground shadow-md"
          >
            {point.label}: {point.value.toLocaleString('en-US')}
            {#if point.hint}<span class="font-normal text-subtle-foreground"> · {point.hint}</span>{/if}
          </span>
        </div>

        {#if showValues}
          <span
            class="mb-1 text-center text-[0.625rem] font-semibold text-subtle-foreground transition-opacity duration-300 tabular-nums"
            class:opacity-0={!drawn}
          >
            {point.value}
          </span>
        {/if}

        {#if onSelect}
          <button
            type="button"
            class={barClass}
            style="height: {pct}%"
            aria-label="{point.label}: {point.value} articles — filter the archive"
            onclick={() => onSelect(point)}
          ></button>
        {:else if point.href}
          <a
            href={point.href}
            class={barClass}
            style="height: {pct}%"
            aria-label="{point.label}: {point.value} articles"
          ></a>
        {:else}
          <div class={barClass} style="height: {pct}%"></div>
        {/if}
      </div>
    {/each}
  </div>

  <div class="mt-2 flex gap-1.5 border-t border-border pt-2 sm:gap-2">
    {#each points as point (point.label)}
      <span class="min-w-0 flex-1 truncate text-center text-[0.6875rem] font-medium text-subtle-foreground">
        {point.short ?? point.label}
      </span>
    {/each}
  </div>
</div>
