<script lang="ts">
  import { cn } from '$lib/utils';
  import { tv, type VariantProps } from 'tailwind-variants';
  import type { Snippet } from 'svelte';

  /* Buttons are restrained: 44px tall by default, a 7px radius, no glow and no
     scale-on-press. The primary action is the muted teal; `navy` is the ink
     navy reserved for the manuscript-submission calls to action; `brass`
     remains available but is deliberately not used for actions. */
  export const buttonVariants = tv({
    base: 'inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-md font-semibold no-underline transition-[background-color,border-color,color,box-shadow] duration-200 ease-nexus focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/45 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-55 [&_svg]:size-4 [&_svg]:shrink-0',
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary-hover',
        navy: 'bg-[var(--cta-surface)] text-[var(--cta-foreground)] hover:bg-[var(--cta-surface-hover)]',
        outline: 'border border-border-strong bg-transparent text-foreground hover:border-primary hover:bg-accent hover:text-accent-foreground',
        secondary: 'border border-transparent bg-secondary text-secondary-foreground hover:bg-surface-strong',
        ghost: 'text-muted-foreground hover:bg-muted hover:text-foreground',
        /* For use on the navy band only. */
        light: 'border border-white/25 bg-white/8 text-white hover:bg-white/16',
        brass: 'bg-gold text-[#241a06] hover:bg-gold-hover',
        link: 'p-0 text-accent-foreground underline-offset-4 hover:underline'
      },
      size: {
        sm: 'h-9 px-3.5 text-sm',
        default: 'h-11 px-5 text-[0.9375rem]',
        lg: 'h-12 px-6 text-base',
        icon: 'size-11',
        iconSm: 'size-9'
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
