<script lang="ts">
  import { userPrefersMode, setMode } from 'mode-watcher';
    import Sun from '@lucide/svelte/icons/sun';
  import Moon from '@lucide/svelte/icons/moon';
  import Monitor from '@lucide/svelte/icons/monitor';
  import { cn } from '$lib/utils';

  let { class: className = '' }: { class?: string } = $props();

  const options = [
    { value: 'light', label: 'Light theme', Icon: Sun },
    { value: 'system', label: 'Match system theme', Icon: Monitor },
    { value: 'dark', label: 'Dark theme', Icon: Moon }
  ] as const;
</script>

<div
  class={cn(
    'inline-flex items-center gap-0.5 rounded-full border border-border bg-muted p-0.5',
    className
  )}
  role="group"
  aria-label="Colour theme"
>
  {#each options as option (option.value)}
    {@const active = userPrefersMode.current === option.value}
    <button
      type="button"
      class={cn(
        'grid size-7 place-items-center rounded-full text-subtle-foreground transition-[background-color,color,box-shadow] duration-200 outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50',
        active && 'bg-surface text-accent-foreground shadow-sm'
      )}
      aria-pressed={active}
      aria-label={option.label}
      title={option.label}
      onclick={() => setMode(option.value)}
    >
      <option.Icon class="size-3.5" aria-hidden="true" />
    </button>
  {/each}
</div>
