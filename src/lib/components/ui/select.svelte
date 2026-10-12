<script lang="ts">
  import { cn } from '$lib/utils';

  type Option = { value: string; label: string; disabled?: boolean };

  let {
    class: className = '',
    value = $bindable(''),
    label = '',
    options = [],
    id,
    name,
    disabled = false,
    ...rest
  }: {
    class?: string;
    value?: string;
    label?: string;
    options?: Option[];
    id?: string;
    name?: string;
    disabled?: boolean;
    [key: string]: unknown;
  } = $props();

  const selectId = $derived(id ?? name ?? `select-${Math.random().toString(36).slice(2, 8)}`);
</script>

<!-- Single root element: the field must behave as ONE grid/flex item. -->
<div class={cn('grid gap-1', className)}>
  {#if label}
    <label class="eyebrow block text-subtle-foreground" for={selectId}>{label}</label>
  {/if}
  <div class="relative">
    <select
      id={selectId}
      {name}
      {disabled}
      bind:value
      class={cn(
        'h-9 w-full appearance-none rounded-md border border-input bg-surface py-1 pr-8 pl-3 text-sm text-foreground shadow-xs transition-[border-color,box-shadow] duration-200 outline-none hover:border-accent-border focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-60'
      )}
      {...rest}
    >
      {#each options as option (option.value)}
        <option value={option.value} disabled={option.disabled}>{option.label}</option>
      {/each}
    </select>
    <svg
      class="pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 text-subtle-foreground"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      stroke-width="1.8"
      stroke-linecap="round"
      aria-hidden="true"
    >
      <path d="M6 8l4 4 4-4" />
    </svg>
  </div>
</div>
