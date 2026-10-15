<script lang="ts">
  import { page } from '$app/state';
  import { NAV_ITEMS, SITE, SUBMIT_HREF } from '$lib/config/site';
  import { cn } from '$lib/utils';
  import Menu from '@lucide/svelte/icons/menu';
  import X from '@lucide/svelte/icons/x';
  import Search from '@lucide/svelte/icons/search';
  import Mail from '@lucide/svelte/icons/mail';
  import ThemeToggle from './theme-toggle.svelte';
  import Button from '$lib/components/ui/button.svelte';

  let open = $state(false);

  const currentPath = $derived(page.url.pathname || '/');
  const isCurrent = (href: string) => currentPath === href || (href !== '/' && currentPath.startsWith(href));

  /* The mobile panel carries everything the desktop bar carries, plus Contact,
     which the primary bar has no room for. */
  const mobileNav = [
    ...NAV_ITEMS,
    { label: 'Contact', href: '/contact.html', description: 'Reach the editorial office' }
  ];

  function close() {
    open = false;
  }

  const onKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && open) close();
  };
</script>

<svelte:window onkeydown={onKeydown} />

<header class="sticky top-0 z-50 border-b border-border bg-background no-print">
  <div class="container-wide flex min-h-[5rem] items-center gap-3 py-2.5">
    <!-- Masthead: the journal's own mark with the acronym, and the full title
         beneath it once there is room. The visible text is decorative for
         assistive tech — the accessible name comes from the sr-only line, so
         the link is still named when only the mark is painted. -->
    <a class="flex min-w-0 shrink-0 items-center gap-3 no-underline" href="/" aria-label="{SITE.name} — home">
      <span class="sr-only">{SITE.name} — {SITE.fullName}</span>
      <span class="brand-mark" aria-hidden="true"></span>
      <span class="hidden min-w-0 flex-col justify-center sm:flex" aria-hidden="true">
        <span class="font-serif text-[1.3125rem] leading-none font-semibold tracking-tight text-heading">
          {SITE.name}
        </span>
        <span class="mt-1 hidden text-[0.6875rem] leading-[1.25] text-subtle-foreground 2xl:block">
          Global Journal of Management, Social Sciences and Humanities
        </span>
      </span>
    </a>

    <nav class="mx-auto hidden min-w-0 lg:block" aria-label="Primary">
      <ul class="flex items-center gap-0.5">
        {#each NAV_ITEMS as item (item.href)}
          <li class="shrink-0">
            <a
              href={item.href}
              aria-current={isCurrent(item.href) ? 'page' : undefined}
              class={cn(
                'relative block rounded-[3px] px-2 py-2 text-[0.875rem] font-medium whitespace-nowrap no-underline transition-colors duration-200 xl:px-2.5',
                isCurrent(item.href)
                  ? 'text-heading'
                  : 'text-muted-foreground hover:bg-muted hover:text-heading'
              )}
            >
              {item.label}
              {#if isCurrent(item.href)}
                <span class="absolute inset-x-2 -bottom-0.5 h-[2px] rounded-full bg-primary xl:inset-x-2.5" aria-hidden="true"></span>
              {/if}
            </a>
          </li>
        {/each}
      </ul>
    </nav>

    <div class="ml-auto flex shrink-0 items-center gap-2">
      <a
        class="grid size-10 place-items-center rounded-md text-muted-foreground no-underline transition-colors hover:bg-muted hover:text-heading"
        href="/articles.html"
        aria-label="Search articles"
        title="Search articles"
      >
        <Search class="size-[1.125rem]" aria-hidden="true" />
      </a>

      <a
        class="hidden size-10 place-items-center rounded-md text-muted-foreground no-underline transition-colors hover:bg-muted hover:text-heading xl:grid"
        href={`mailto:${SITE.email}`}
        aria-label="Email the editorial office"
        title={SITE.email}
      >
        <Mail class="size-[1.125rem]" aria-hidden="true" />
      </a>

      <Button variant="navy" size="sm" href={SUBMIT_HREF} class="hidden sm:inline-flex">
        <span class="xl:hidden">Submit</span>
        <span class="hidden xl:inline">Submit manuscript</span>
      </Button>

      <ThemeToggle class="hidden sm:inline-flex" />

      <button
        type="button"
        class="grid size-10 place-items-center rounded-md border border-border-strong bg-surface text-foreground lg:hidden"
        aria-expanded={open}
        aria-controls="mobile-nav"
        aria-label={open ? 'Close menu' : 'Open menu'}
        onclick={() => (open = !open)}
      >
        {#if open}
          <X class="size-[1.125rem]" aria-hidden="true" />
        {:else}
          <Menu class="size-[1.125rem]" aria-hidden="true" />
        {/if}
      </button>
    </div>
  </div>

  {#if open}
    <div id="mobile-nav" class="border-t border-border bg-background lg:hidden">
      <nav class="container-wide py-4" aria-label="Primary mobile">
        <ul class="grid">
          {#each mobileNav as item (item.href)}
            <li class="border-b border-border last:border-b-0">
              <a
                href={item.href}
                aria-current={isCurrent(item.href) ? 'page' : undefined}
                class={cn(
                  'block py-3 no-underline transition-colors',
                  isCurrent(item.href) ? 'text-accent-foreground' : 'text-muted-foreground'
                )}
                onclick={close}
              >
                <span class={cn('font-serif text-[1.0625rem]', isCurrent(item.href) && 'font-semibold')}>
                  {item.label}
                </span>
                {#if item.description}
                  <span class="mt-0.5 block text-[0.8125rem] leading-snug text-subtle-foreground">
                    {item.description}
                  </span>
                {/if}
              </a>
            </li>
          {/each}
        </ul>

        <div class="mt-5 flex flex-wrap items-center gap-3">
          <Button variant="navy" href={SUBMIT_HREF} onclick={close}>Submit manuscript</Button>
          <a class="text-sm font-medium text-accent-foreground no-underline hover:underline" href={`mailto:${SITE.email}`}>
            {SITE.email}
          </a>
        </div>
        <div class="mt-5 sm:hidden">
          <ThemeToggle />
        </div>
      </nav>
    </div>
  {/if}
</header>
