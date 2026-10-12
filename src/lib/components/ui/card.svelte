<script lang="ts">
  import { cn } from '$lib/utils';
  import { tv, type VariantProps } from 'tailwind-variants';
  import type { Snippet } from 'svelte';

  export const cardVariants = tv({
    base: 'rounded-xl border border-border bg-card text-card-foreground',
    variants: {
      variant: {
        default: 'shadow-sm',
        flat: 'shadow-none',
        elevated: 'shadow-md',
        interactive:
          'shadow-sm transition-[transform,border-color,box-shadow,background-color] duration-300 ease-nexus hover:-translate-y-0.5 hover:border-accent-border hover:bg-surface hover:shadow-lg'
      },
      padding: {
        none: '',
        sm: 'p-4',
        default: 'p-5',
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
