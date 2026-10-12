<script lang="ts">
  import { onMount } from 'svelte';
  import { cn } from '$lib/utils';
  import type { ChartPoint } from '$lib/data/types';

  /* Smooth area/line chart for a short series (e.g. an index value per year).
     The path is drawn in a 0–100 space and stretched with preserveAspectRatio
     "none"; labels and hover targets stay in normal HTML so nothing distorts. */
  let {
    points,
    height = 190,
    ariaLabel,
    tone = 'cyan',
    class: className = ''
  }: {
    points: ChartPoint[];
    height?: number;
    ariaLabel: string;
    tone?: 'primary' | 'gold' | 'cyan';
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

  const values = $derived(points.map((p) => p.value));
  const min = $derived(Math.min(...values));
  const max = $derived(Math.max(...values));
  const span = $derived(max - min || 1);

  /* Pad the value range so the line never touches the frame. */
  const scale = $derived((value: number) => 12 + ((value - min) / span) * 76);

  const coords = $derived(
    points.map((point, index) => ({
      x: points.length === 1 ? 50 : (index / (points.length - 1)) * 100,
      y: 100 - scale(point.value),
      ...point
    }))
  );

  const line = $derived(
    coords
      .map((c, i) => {
        if (i === 0) return `M ${c.x} ${c.y}`;
        const prev = coords[i - 1];
        const cx = (prev.x + c.x) / 2;
        return `C ${cx} ${prev.y}, ${cx} ${c.y}, ${c.x} ${c.y}`;
      })
      .join(' ')
  );
  const area = $derived(`${line} L 100 100 L 0 100 Z`);

  const stroke = $derived(tone === 'gold' ? 'var(--chart-3)' : tone === 'primary' ? 'var(--chart-1)' : 'var(--chart-2)');
  const gradientId = $derived(`area-${tone}-${Math.random().toString(36).slice(2, 7)}`);
</script>

<div class={cn('w-full', className)}>
  <div class="relative" style="height: {height}px" role="img" aria-label={ariaLabel}>
    <svg class="absolute inset-0 size-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style="stop-color:{stroke};stop-opacity:0.35" />
          <stop offset="1" style="stop-color:{stroke};stop-opacity:0" />
        </linearGradient>
      </defs>
      {#each [25, 50, 75] as gridY (gridY)}
        <line x1="0" y1={gridY} x2="100" y2={gridY} stroke="var(--border)" stroke-width="0.4" stroke-dasharray="2 3" vector-effect="non-scaling-stroke" />
      {/each}
      <path
        d={area}
        fill="url(#{gradientId})"
        class="transition-opacity duration-1000"
        class:opacity-0={!drawn}
        vector-effect="non-scaling-stroke"
      />
      <path
        d={line}
        fill="none"
        stroke={stroke}
        stroke-width="2"
        stroke-linecap="round"
        vector-effect="non-scaling-stroke"
        class="transition-[opacity,stroke-dashoffset] duration-1000"
        class:opacity-0={!drawn}
      />
    </svg>

    <div class="absolute inset-0 flex">
      {#each coords as point (point.label)}
        <div class="group relative flex-1">
          <div
            class="absolute size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-background transition-opacity duration-500"
            style="left: {point.x}%; top: {point.y}%; background: {stroke}"
            class:opacity-0={!drawn}
          ></div>
          <div class="pointer-events-none absolute top-0 left-1/2 z-20 -translate-x-1/2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            <span class="block rounded-md border border-border bg-popover px-2 py-1 text-[0.6875rem] font-semibold whitespace-nowrap text-popover-foreground shadow-md">
              {point.label}: {point.value.toLocaleString('en-US')}
            </span>
          </div>
        </div>
      {/each}
    </div>
  </div>

  <div class="mt-2 flex border-t border-border pt-2">
    {#each points as point (point.label)}
      <span class="min-w-0 flex-1 truncate text-center text-[0.6875rem] font-medium text-subtle-foreground">
        {point.short ?? point.label}
      </span>
    {/each}
  </div>
</div>
