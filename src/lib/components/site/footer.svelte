<script lang="ts">
  import { FOOTER_GROUPS, SITE } from '$lib/config/site';
    import Mail from '@lucide/svelte/icons/mail';
  import Globe from '@lucide/svelte/icons/globe';

  const year = new Date().getFullYear();
</script>

<footer class="mt-auto border-t border-border bg-surface-muted no-print">
  <div class="container-page grid gap-8 py-12 lg:grid-cols-[1.4fr_repeat(3,minmax(0,1fr))]">
    <div>
      <a class="flex items-center no-underline" href="/">
        <span class="sr-only">{SITE.name} — {SITE.fullName}</span>
        <span class="brand-lockup" aria-hidden="true"></span>
      </a>
      <p class="mt-5 max-w-[46ch] text-sm text-muted-foreground">
        {SITE.fullName} — {SITE.tagline.toLowerCase()}, published since {SITE.startYear}. Articles are open access and
        hosted on the journal's content delivery network.
      </p>
      <ul class="mt-4 grid gap-2 text-sm">
        <li>
          <a class="inline-flex items-center gap-2 text-muted-foreground no-underline hover:text-accent-foreground" href={`mailto:${SITE.email}`}>
            <Mail class="size-3.5" aria-hidden="true" />{SITE.email}
          </a>
        </li>
        <li>
          <a class="inline-flex items-center gap-2 text-muted-foreground no-underline hover:text-accent-foreground" href={`https://${SITE.website}`} rel="noopener">
            <Globe class="size-3.5" aria-hidden="true" />{SITE.website}
          </a>
        </li>
      </ul>
    </div>

    {#each FOOTER_GROUPS as group (group.title)}
      <div>
        <h2 class="eyebrow text-foreground">{group.title}</h2>
        <ul class="mt-3 grid gap-2">
          {#each group.links as link (link.label)}
            <li>
              <a class="text-sm text-muted-foreground no-underline transition-colors hover:text-accent-foreground" href={link.href}>
                {link.label}
              </a>
            </li>
          {/each}
        </ul>
      </div>
    {/each}
  </div>

  <div class="border-t border-border">
    <div class="container-page flex flex-wrap items-center justify-between gap-3 py-5 text-xs text-subtle-foreground">
      <p>&copy; {year} {SITE.fullName}. All rights reserved.</p>
      <p>Article records are reproduced from the journal's published archive.</p>
    </div>
  </div>
</footer>
