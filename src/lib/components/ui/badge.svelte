<script lang="ts">
  import { cn } from '$lib/utils';
  import { tv, type VariantProps } from 'tailwind-variants';
  import type { Snippet } from 'svelte';

  /* Metadata tags, not chips. A near-square corner, small caps and a hairline
     border — the way a printed journal labels a volume or a page range. */
  export const badgeVariants = tv({
    base: 'inline-flex w-fit shrink-0 items-center gap-1.5 whitespace-nowrap rounded-[3px] border px-2 py-[0.1875rem] text-[0.6875rem] font-semibold tracking-[0.06em] uppercase [&_svg]:size-3',
    variants: {
      variant: {
        default: 'border-border bg-transparent text-subtle-foreground',
        accent: 'border-accent-border bg-accent text-accent-foreground',
        gold: 'border-gold-border bg-gold-soft text-gold-foreground',
        cyan: 'border-cyan/40 bg-cyan-soft text-cyan-foreground',
        outline: 'border-border-strong bg-transparent text-muted-foreground',
        solid: 'border-transparent bg-[var(--cta-surface)] text-[var(--cta-foreground)]'
      }
    },
    defaultVariants: { variant: 'default' }
  });

  let {
    class: className = '',
    variant = 'default',
    children,
    ...rest
  }: {
    class?: string;
    variant?: VariantProps<typeof badgeVariants>['variant'];
    children?: Snippet;
    [key: string]: unknown;
  } = $props();
</script>

<span class={cn(badgeVariants({ variant }), className)} {...rest}>{@render children?.()}</span>
