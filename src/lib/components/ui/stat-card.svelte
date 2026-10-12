<script lang="ts">
  import { cn } from '$lib/utils';
  import AnimatedNumber from './animated-number.svelte';
  import type { Snippet } from 'svelte';

  /* A single derived figure. Every value must come from the journal's own data
     (archive-data.json / content.json) — never a target or estimate. */
  let {
    value,
    label,
    hint = '',
    decimals = 0,
    suffix = '',
    prefix = '',
    tone = 'default',
    variant = 'card',
    icon,
    class: className = ''
  }: {
    value: number | string;
    label: string;
    hint?: string;
    decimals?: number;
    suffix?: string;
    prefix?: string;
    tone?: 'default' | 'gold' | 'cyan' | 'ghost';
    variant?: 'card' | 'hero';
    icon?: Snippet;
    class?: string;
  } = $props();

  const numeric = $derived(typeof value === 'number');
  const hero = $derived(variant === 'hero');
</script>

<div
  class={cn(
    'flex flex-col',
    hero
      ? 'rounded-xl border border-white/15 bg-white/6 p-4 backdrop-blur-sm'
      : 'rounded-xl border border-border bg-card p-5 shadow-sm',
    className
  )}
>
  <div class="flex items-center gap-2">
    {#if icon}
      <span
        class={cn(
          'grid size-8 place-items-center rounded-lg',
          tone === 'gold'
            ? 'bg-gold-soft text-gold-foreground'
            : tone === 'cyan'
              ? 'bg-cyan-soft text-cyan-foreground'
              : 'bg-accent text-accent-foreground'
        )}
      >
        {@render icon()}
      </span>
    {/if}
    <span class={cn('eyebrow', hero ? 'text-hero-muted' : 'text-subtle-foreground')}>{label}</span>
  </div>

  <p
    class={cn(
      'mt-2 font-bold tracking-tight',
      hero ? 'text-3xl text-hero-foreground' : 'text-2xl text-foreground',
      tone === 'gold' && !hero && 'text-gold-foreground',
      tone === 'cyan' && !hero && 'text-cyan-foreground'
    )}
  >
    {#if prefix}<span class="text-lg font-semibold">{prefix}</span>{/if}
    {#if numeric}
      <AnimatedNumber value={Number(value)} {decimals} />
    {:else}
      {value}
    {/if}
    {#if suffix}<span class="text-lg font-semibold">{suffix}</span>{/if}
  </p>

  {#if hint}
    <p class={cn('mt-1 text-xs', hero ? 'text-hero-muted' : 'text-subtle-foreground')}>{hint}</p>
  {/if}
</div>
