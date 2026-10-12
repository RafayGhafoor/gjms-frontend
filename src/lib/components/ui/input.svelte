<script lang="ts">
  import { cn } from '$lib/utils';
  import type { FullAutoFill } from 'svelte/elements';

  let {
    class: className = '',
    value = $bindable(''),
    label = '',
    hint = '',
    placeholder = '',
    id,
    name,
    type = 'search',
    autocomplete = 'off',
    icon = true,
    ...rest
  }: {
    class?: string;
    value?: string;
    label?: string;
    hint?: string;
    placeholder?: string;
    id?: string;
    name?: string;
    type?: string;
    autocomplete?: FullAutoFill;
    icon?: boolean;
    [key: string]: unknown;
  } = $props();

  const inputId = $derived(id ?? name ?? `input-${Math.random().toString(36).slice(2, 8)}`);
</script>

<!-- Single root element: the field must behave as ONE grid/flex item. -->
<div class={cn('grid gap-1', className)}>
  {#if label}
    <label class="eyebrow block text-subtle-foreground" for={inputId}>{label}</label>
  {/if}
  <div class="relative">
    {#if icon}
      <svg
        class="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-subtle-foreground"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
        aria-hidden="true"
      >
        <circle cx="11" cy="11" r="7" />
        <path d="M20 20l-3.5-3.5" />
      </svg>
    {/if}
    <input
      id={inputId}
      {name}
      {type}
      {placeholder}
      {autocomplete}
      bind:value
      class={cn(
        'h-9 w-full rounded-md border border-input bg-surface px-3 py-1 text-sm text-foreground shadow-xs transition-[border-color,box-shadow] duration-200 outline-none placeholder:text-subtle-foreground hover:border-accent-border focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/30',
        icon && 'pl-8.5'
      )}
      {...rest}
    />
  </div>
  {#if hint}
    <p class="text-xs text-subtle-foreground">{hint}</p>
  {/if}
</div>
