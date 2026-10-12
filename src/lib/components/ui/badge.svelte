<script lang="ts">
  import { cn } from '$lib/utils';
  import { tv, type VariantProps } from 'tailwind-variants';
  import type { Snippet } from 'svelte';

  export const badgeVariants = tv({
    base: 'inline-flex w-fit shrink-0 items-center gap-1 whitespace-nowrap rounded-full border font-semibold [&_svg]:size-3',
    variants: {
      variant: {
        default: 'border-border bg-muted px-2 py-0.5 text-[0.6875rem] text-muted-foreground',
        accent: 'border-accent-border bg-accent px-2 py-0.5 text-[0.6875rem] text-accent-foreground',
        gold: 'border-gold-border bg-gold-soft px-2 py-0.5 text-[0.6875rem] text-gold-foreground',
        cyan: 'border-cyan bg-cyan-soft px-2 py-0.5 text-[0.6875rem] text-cyan-foreground',
        outline: 'border-border-strong bg-transparent px-2 py-0.5 text-[0.6875rem] text-muted-foreground',
        solid: 'border-transparent bg-primary px-2 py-0.5 text-[0.6875rem] uppercase tracking-wide text-primary-foreground'
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
