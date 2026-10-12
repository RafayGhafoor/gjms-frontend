<script lang="ts">
  import { cn } from '$lib/utils';

  let { class: className = '', rows = 4 }: { class?: string; rows?: number } = $props();
</script>

<div class={cn('grid gap-3', className)} aria-hidden="true">
  {#each Array.from({ length: rows }) as _, index (index)}
    <div class="shimmer h-20 rounded-lg border border-border"></div>
  {/each}
</div>
