<script lang="ts">
  import { cn } from '$lib/utils';
  import { tv, type VariantProps } from 'tailwind-variants';
  import type { Snippet } from 'svelte';

  /* A panel, not a decoration. Borders are hairlines and shadows are avoided —
     on this design a card should read as a bounded block of text. */
  export const cardVariants = tv({
    base: 'rounded-lg border border-border bg-card text-card-foreground',
    variants: {
      variant: {
        default: '',
        flat: 'border-transparent bg-surface-muted',
        elevated: 'shadow-sm',
        interactive:
          'transition-[border-color,background-color] duration-200 ease-nexus hover:border-accent-border'
      },
      padding: {
        none: '',
        sm: 'p-4',
        default: 'p-6',
        lg: 'p-6 sm:p-8'
      }
    },
    defaultVariants: { variant: 'default', padding: 'default' }
  });

  let {
    class: className = '',
    variant = 'default',
    padding = 'default',
    children,
    ...rest
  }: {
    class?: string;
    variant?: VariantProps<typeof cardVariants>['variant'];
    padding?: VariantProps<typeof cardVariants>['padding'];
    children?: Snippet;
    [key: string]: unknown;
  } = $props();
</script>

<div class={cn(cardVariants({ variant, padding }), className)} {...rest}>{@render children?.()}</div>
