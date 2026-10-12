<script lang="ts">
  import { page } from '$app/state';
  import { NAV_ITEMS, SITE, SUBMIT_HREF } from '$lib/config/site';
  import { cn } from '$lib/utils';
  import Menu from '@lucide/svelte/icons/menu';
  import X from '@lucide/svelte/icons/x';
  import Search from '@lucide/svelte/icons/search';
  import ArrowUpRight from '@lucide/svelte/icons/arrow-up-right';
  import ThemeToggle from './theme-toggle.svelte';
  import Button from '$lib/components/ui/button.svelte';

  let open = $state(false);

  const currentPath = $derived(page.url.pathname || '/');
  const isCurrent = (href: string) => currentPath === href || (href !== '/' && currentPath.startsWith(href));

  /* Contact is a top-strip and footer link so the primary bar fits a laptop. */
  const mobileNav = [...NAV_ITEMS, { label: 'Contact', href: '/contact.html', description: 'Reach the editorial office' }];
</script>

<header class="sticky top-0 z-50 border-b border-glass-border glass no-print">
  <div class="hidden border-b border-border/70 lg:block">
    <div class="container-wide flex h-9 items-center justify-between text-[0.6875rem] text-subtle-foreground">
      <p class="eyebrow">{SITE.tagline}</p>
      <div class="flex items-center gap-3">
        <a class="transition-colors hover:text-accent-foreground" href={`mailto:${SITE.email}`}>{SITE.email}</a>
        <span aria-hidden="true" class="text-border-strong">|</span>
        <a class="transition-colors hover:text-accent-foreground" href="/author-guideline.html">Submission guidelines</a>
        <span aria-hidden="true" class="text-border-strong">|</span>
        <a class="transition-colors hover:text-accent-foreground" href="/contact.html">Contact</a>
      </div>
    </div>
  </div>

  <div class="container-wide flex min-h-16 items-center gap-3 py-2">
    <a class="flex shrink-0 items-center no-underline" href="/">
      <!-- The full lockup from small screens up, the icon alone on the narrowest
           viewports. The artwork itself is decorative here: the accessible name
           comes from the hidden text below, so screen readers and crawlers get
           the journal's name in words. -->
      <span class="sr-only">{SITE.name} — {SITE.fullName}</span>
      <span class="brand-lockup hidden sm:block" aria-hidden="true"></span>
      <span class="brand-mark sm:hidden" aria-hidden="true"></span>
    </a>

    <nav class="mx-auto hidden min-w-0 xl:block" aria-label="Primary">
      <ul class="flex items-center gap-0.5 no-scrollbar">
        {#each NAV_ITEMS as item (item.href)}
          <li class="shrink-0">
            <a
              href={item.href}
              aria-current={isCurrent(item.href) ? 'page' : undefined}
              class={cn(
                'block rounded-md px-2.5 py-2 text-sm font-medium whitespace-nowrap text-muted-foreground no-underline transition-colors duration-200 hover:bg-muted hover:text-foreground',
                isCurrent(item.href) && 'bg-accent font-semibold text-accent-foreground'
              )}
            >
              {item.label}
            </a>
          </li>
        {/each}
      </ul>
    </nav>

    <div class="ml-auto flex shrink-0 items-center gap-2">
      <a
        class="grid size-9 place-items-center rounded-md text-muted-foreground no-underline transition-colors hover:bg-muted hover:text-foreground"
        href="/articles.html"
        aria-label="Search articles"
        title="Search articles"
      >
        <Search class="size-4" aria-hidden="true" />
      </a>
      <Button class="hidden sm:inline-flex" size="sm" href={SUBMIT_HREF}>
        <span class="hidden 2xl:inline">Submit manuscript</span>
        <span class="2xl:hidden">Submit</span>
        <ArrowUpRight aria-hidden="true" />
      </Button>
      <ThemeToggle />
      <button
        type="button"
        class="grid size-9 place-items-center rounded-md border border-border bg-surface text-foreground xl:hidden"
        aria-expanded={open}
        aria-controls="mobile-nav"
        aria-label={open ? 'Close menu' : 'Open menu'}
        onclick={() => (open = !open)}
      >
        {#if open}
          <X class="size-4" aria-hidden="true" />
        {:else}
          <Menu class="size-4" aria-hidden="true" />
        {/if}
      </button>
    </div>
  </div>

  {#if open}
    <div id="mobile-nav" class="border-t border-border bg-surface xl:hidden">
      <nav class="container-wide py-3" aria-label="Primary mobile">
        <ul class="grid gap-0.5">
          {#each mobileNav as item (item.href)}
            <li>
              <a
                href={item.href}
                aria-current={isCurrent(item.href) ? 'page' : undefined}
                class={cn(
                  'block rounded-md px-3 py-2.5 no-underline transition-colors hover:bg-muted',
                  isCurrent(item.href) ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
                )}
                onclick={() => (open = false)}
              >
                <span class="text-sm font-semibold">{item.label}</span>
                {#if item.description}
                  <span class="mt-0.5 block text-xs text-subtle-foreground">{item.description}</span>
                {/if}
              </a>
            </li>
          {/each}
        </ul>
        <Button class="mt-3 w-full sm:hidden" href={SUBMIT_HREF}>Submit manuscript</Button>
      </nav>
    </div>
  {/if}
</header>
