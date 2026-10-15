<script lang="ts">
  import { FOOTER_GROUPS, ISSN_LABEL, SITE } from '$lib/config/site';
  import Mail from '@lucide/svelte/icons/mail';
  import Globe from '@lucide/svelte/icons/globe';

  const year = new Date().getFullYear();
</script>

<footer class="band-navy mt-auto no-print">
  <div class="container-page grid gap-10 py-14 grid-cols-1 lg:grid-cols-[1.5fr_repeat(3,minmax(0,1fr))]">
    <div>
      <a class="inline-flex items-center no-underline" href="/">
        <span class="sr-only">{SITE.name} — {SITE.fullName}</span>
        <span class="brand-lockup" aria-hidden="true"></span>
      </a>
      <p class="mt-5 max-w-[42ch] font-serif text-[1.0625rem] leading-snug text-band-foreground">
        {SITE.fullName}
      </p>
      <p class="mt-2 max-w-[46ch] text-[0.875rem] leading-relaxed text-band-muted">
        {SITE.tagline}, published since {SITE.startYear}. Every article is open access and hosted on the journal's
        content delivery network.
      </p>
      <p class="mt-4 text-[0.8125rem] text-band-muted">{ISSN_LABEL}</p>
      <ul class="mt-5 grid gap-2 text-[0.875rem]">
        <li>
          <a
            class="inline-flex items-center gap-2 py-0.5 text-band-muted no-underline transition-colors hover:text-band-foreground"
            href={`mailto:${SITE.email}`}
          >
            <Mail class="size-4 shrink-0" aria-hidden="true" />{SITE.email}
          </a>
        </li>
        <li>
          <a
            class="inline-flex items-center gap-2 py-0.5 text-band-muted no-underline transition-colors hover:text-band-foreground"
            href={`https://${SITE.website}`}
            rel="noopener"
          >
            <Globe class="size-4 shrink-0" aria-hidden="true" />{SITE.website}
          </a>
        </li>
      </ul>
    </div>

    {#each FOOTER_GROUPS as group (group.title)}
      <div>
        <h2 class="eyebrow text-band-foreground">{group.title}</h2>
        <ul class="mt-4 grid gap-2.5">
          {#each group.links as link (link.label)}
            <li>
              <a
                class="inline-block py-0.5 text-[0.9375rem] text-band-muted no-underline transition-colors hover:text-band-foreground hover:underline hover:underline-offset-4"
                href={link.href}
              >
                {link.label}
              </a>
            </li>
          {/each}
        </ul>
      </div>
    {/each}
  </div>

  <div class="border-t border-band-border">
    <div class="container-page flex flex-wrap items-center justify-between gap-x-6 gap-y-2 py-6 text-[0.8125rem] text-band-muted">
      <p>&copy; {year} {SITE.fullName}. All rights reserved.</p>
      <p>Article records are reproduced from the journal's published archive.</p>
    </div>
  </div>
</footer>
