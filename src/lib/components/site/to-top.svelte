<script lang="ts">
  import { onMount } from 'svelte';
    import ArrowUp from '@lucide/svelte/icons/arrow-up';

  let visible = $state(false);

  onMount(() => {
    const update = () => (visible = window.scrollY > 700);
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  });
</script>

{#if visible}
  <button
    type="button"
    class="fixed right-5 bottom-5 z-40 inline-flex items-center gap-1.5 rounded-full border border-border-strong bg-surface px-3 py-2 text-xs font-semibold text-muted-foreground shadow-md transition-colors hover:border-accent-border hover:text-accent-foreground no-print"
    onclick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
  >
    <ArrowUp class="size-3.5" aria-hidden="true" />
    <span class="hidden sm:inline">Top</span>
    <span class="sr-only sm:hidden">Back to top</span>
  </button>
{/if}
