<script lang="ts">
  import { cn } from '$lib/utils';
  import { tv, type VariantProps } from 'tailwind-variants';
  import type { Snippet } from 'svelte';

  export const buttonVariants = tv({
    base: 'inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-md font-semibold no-underline transition-[transform,background-color,border-color,box-shadow,color] duration-200 ease-nexus focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 active:scale-[0.985] [&_svg]:size-4 [&_svg]:shrink-0',
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground shadow-sm hover:bg-primary-hover hover:shadow-md',
        gold: 'bg-gold text-[#1a1204] shadow-sm hover:bg-gold-hover',
        outline: 'border border-border-strong bg-transparent text-foreground hover:border-primary hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-surface-strong',
        ghost: 'text-muted-foreground hover:bg-muted hover:text-foreground',
        light: 'border border-white/25 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20',
        link: 'p-0 text-primary underline-offset-4 hover:underline'
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        default: 'h-9 px-4 text-sm',
        lg: 'h-11 px-6 text-base',
        icon: 'size-9',
        iconSm: 'size-8'
      }
    },
    defaultVariants: { variant: 'default', size: 'default' }
  });

  type Props = {
    class?: string;
    variant?: VariantProps<typeof buttonVariants>['variant'];
    size?: VariantProps<typeof buttonVariants>['size'];
    href?: string;
    type?: 'button' | 'submit' | 'reset';
    children?: Snippet;
    [key: string]: unknown;
  };

  let { class: className = '', variant = 'default', size = 'default', href, type = 'button', children, ...rest }: Props =
    $props();

  const classes = $derived(cn(buttonVariants({ variant, size }), className));
</script>

{#if href}
  <a {href} class={classes} {...rest}>{@render children?.()}</a>
{:else}
  <button {type} class={classes} {...rest}>{@render children?.()}</button>
{/if}
