<script lang="ts">
  import { onMount } from 'svelte';
  import { cn } from '$lib/utils';

  /* Counts up from `start` to `value` when the element scrolls into view.
     The final value is what gets prerendered, so crawlers and no-JS visitors
     always see the real number — the animation only runs in the browser. */
  let {
    value,
    start = 1,
    duration = 1500,
    decimals = 0,
    locale = 'en-US',
    class: className = '',
    animate = true
  }: {
    value: number;
    start?: number;
    duration?: number;
    decimals?: number;
    locale?: string;
    class?: string;
    animate?: boolean;
  } = $props();

  let node = $state<HTMLElement | null>(null);
  // `shown` mirrors the prop until an animation takes over, so the prerendered
  // HTML (and any no-JS visitor) always sees the real number.
  let animated = $state<number | null>(null);
  const shown = $derived(animated ?? value);
  let pulsing = $state(false);

  const format = (n: number) =>
    n.toLocaleString(locale, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

  function run() {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!animate || reduce || value <= start) {
      animated = null;
      return;
    }
    animated = start;
    pulsing = true;
    const t0 = performance.now();
    const step = (now: number) => {
      const p = Math.min(1, (now - t0) / duration);
      // easeOutExpo — fast start, gentle settle
      const eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
      animated = start + (value - start) * eased;
      if (p < 1) requestAnimationFrame(step);
      else {
        animated = null;
        window.setTimeout(() => (pulsing = false), 400);
      }
    };
    requestAnimationFrame(step);
  }

  onMount(() => {
    if (!node) return;
    if (!('IntersectionObserver' in window)) {
      run();
      return;
    }
    let done = false;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !done) {
            done = true;
            run();
            io.disconnect();
          }
        });
      },
      { threshold: 0.35 }
    );
    io.observe(node);
    return () => io.disconnect();
  });
</script>

<span
  bind:this={node}
  class={cn('tabular-nums', pulsing && 'count-pop', className)}
  aria-label={format(value)}
  data-value={value}
>
  {format(shown)}
</span>
