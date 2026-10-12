<script lang="ts">
  import Seo from '$lib/components/site/seo.svelte';
  import Breadcrumbs from '$lib/components/site/breadcrumbs.svelte';
  import Card from '$lib/components/ui/card.svelte';
  import Button from '$lib/components/ui/button.svelte';
  import Badge from '$lib/components/ui/badge.svelte';
  import { content } from '$lib/data/content';
  import { SITE } from '$lib/config/site';
  import { breadcrumbNode, webPageNode } from '$lib/seo';
  import Mail from '@lucide/svelte/icons/mail';
  import ClipboardList from '@lucide/svelte/icons/clipboard-list';
  import Clock from '@lucide/svelte/icons/clock';
  import Info from '@lucide/svelte/icons/info';
  import Sparkles from '@lucide/svelte/icons/sparkles';

  /* The guidelines are the journal's existing published text (content.json),
     reproduced verbatim. Only the presentation is new. */

  function anchor(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  const guidelines = $derived(content.authorGuidelines);
  const sections = $derived(guidelines.sections.map((section) => ({ ...section, id: anchor(section.title) })));
  const highlights = $derived(guidelines.highlights);

  const description = $derived(`Author guidelines for the Global Journal of Management, Social Sciences and Humanities (GJMSSH): manuscript preparation, ${guidelines.sections.length} requirements sections, publication fee, decision timeline and submission process.`);
</script>

<Seo
  title="Author guidelines"
  {description}
  path="/author-guideline.html"
  jsonLd={[
    breadcrumbNode([
      { name: 'Home', path: '/' },
      { name: 'For authors', path: '/author-guideline.html' }
    ]),
    webPageNode({ path: '/author-guideline.html', name: 'Author guidelines', description })
  ]}
/>

<section class="border-b border-border bg-surface-muted">
  <div class="container-page py-10">
    <Breadcrumbs class="mb-5" items={[{ name: 'Home', href: '/' }, { name: 'For authors' }]} />
    <h1 class="text-3xl font-extrabold tracking-tight lg:text-4xl">Author guidelines</h1>
    <p class="mt-3 max-w-[72ch] text-muted-foreground">{guidelines.intro}</p>
    <div class="mt-6 flex flex-wrap gap-3">
      <Button variant="gold" href={`mailto:${SITE.email}?subject=Manuscript%20submission%20to%20GJMSSH`}>
        <Mail aria-hidden="true" />
        Submit to {SITE.email}
      </Button>
      <Button variant="outline" href="/contact.html">Contact the editorial office</Button>
    </div>
  </div>
</section>

<div class="container-page grid gap-10 py-10 lg:grid-cols-[16rem_minmax(0,1fr)]">
  <aside class="lg:sticky lg:top-[9rem] lg:self-start">
    <nav class="rounded-xl border border-border bg-card p-5 shadow-sm" aria-label="On this page">
      <h2 class="eyebrow text-subtle-foreground">On this page</h2>
      <ol class="mt-3 grid gap-1.5 text-sm">
        {#each sections as section (section.id)}
          <li>
            <a class="block rounded px-2 py-1 text-muted-foreground no-underline transition-colors hover:bg-muted hover:text-accent-foreground" href="#{section.id}">
              {section.title}
            </a>
          </li>
        {/each}
      </ol>
      <div class="mt-4 border-t border-dashed border-border pt-4">
        <a class="text-xs font-semibold text-accent-foreground no-underline hover:underline" href="#ethics-and-integrity">
          Ethics, plagiarism and integrity
        </a>
      </div>
    </nav>
  </aside>

  <div class="grid gap-10">
    <!-- Key facts authors need first -->
    <section aria-labelledby="key-facts">
      <h2 id="key-facts" class="text-xl font-bold tracking-tight">Before you submit</h2>
      <div class="mt-4 grid gap-4 sm:grid-cols-2">
        {#each highlights as highlight (highlight.title)}
          <Card padding="lg" class="border-gold-border bg-gold-soft">
            <p class="eyebrow flex items-center gap-2 text-gold-foreground">
              {#if highlight.title.toLowerCase().includes('fee')}
                <Sparkles class="size-3.5" aria-hidden="true" />
              {:else}
                <Clock class="size-3.5" aria-hidden="true" />
              {/if}
              {highlight.title}
            </p>
            <p class="mt-2 text-sm text-foreground">{highlight.text}</p>
          </Card>
        {/each}
      </div>
      <div class="mt-4 grid gap-3 sm:grid-cols-3">
        <Card padding="sm" class="flex items-center gap-3">
          <span class="eyebrow text-subtle-foreground">Decision within</span>
          <span class="ml-auto text-lg font-bold tabular-nums">{content.stats.daysToPublish} days</span>
        </Card>
        <Card padding="sm" class="flex items-center gap-3">
          <span class="eyebrow text-subtle-foreground">Acceptance rate</span>
          <span class="ml-auto text-lg font-bold tabular-nums">{content.stats.acceptanceRate}</span>
        </Card>
        <Card padding="sm" class="flex items-center gap-3">
          <span class="eyebrow text-subtle-foreground">Publication fee</span>
          <span class="ml-auto text-lg font-bold tabular-nums">{content.stats.publicationFee}</span>
        </Card>
      </div>
    </section>

    <!-- The published requirements -->
    <section aria-labelledby="requirements-heading">
      <div class="border-b border-border pb-3">
        <p class="eyebrow flex items-center gap-2 text-subtle-foreground">
          <ClipboardList class="size-3.5" aria-hidden="true" />Manuscript requirements
        </p>
        <h2 id="requirements-heading" class="mt-1 text-2xl font-bold tracking-tight">
          {sections.length} requirements of a GJMSSH manuscript
        </h2>
      </div>

      <div class="mt-6 grid gap-6">
        {#each sections as section, index (section.id)}
          <article id={section.id} class="scroll-mt-40 rounded-xl border border-border bg-card p-6 shadow-sm">
            <div class="flex items-baseline gap-3">
              <span class="text-xs font-bold text-subtle-foreground tabular-nums" aria-hidden="true">
                {String(index + 1).padStart(2, '0')}
              </span>
              <h3 class="text-lg font-bold tracking-tight">{section.title}</h3>
            </div>
            {#each section.text.split(/\n{2,}/) as paragraph (paragraph)}
              <p class="mt-3 max-w-[72ch] text-[0.9375rem] leading-relaxed text-muted-foreground">{paragraph}</p>
            {/each}
          </article>
        {/each}
      </div>
    </section>

    <!-- Ethics / plagiarism note (existing published text) -->
    <section id="ethics-and-integrity" class="scroll-mt-40" aria-labelledby="ethics-heading">
      <Card padding="lg" class="border-accent-border bg-accent">
        <p class="eyebrow flex items-center gap-2 text-accent-foreground">
          <Info class="size-3.5" aria-hidden="true" />Integrity
        </p>
        <h2 id="ethics-heading" class="mt-2 text-xl font-bold tracking-tight">Plagiarism and publication integrity</h2>
        {#each (sections.find((section) => section.id === 'plagiarism')?.text ?? '').split(/\n{2,}/) as paragraph (paragraph)}
          <p class="mt-3 max-w-[72ch] text-sm text-muted-foreground">{paragraph}</p>
        {/each}
        <p class="mt-4 max-w-[72ch] text-sm text-muted-foreground">
          Authors should also read the journal's statement of vision and mission, and contact the editorial office with
          any question about the review process.
        </p>
        <div class="mt-5 flex flex-wrap gap-3">
          <Button variant="outline" size="sm" href="/vision-mission.html">Vision &amp; mission</Button>
          <Button variant="outline" size="sm" href="/editorial-board.html">Editorial board</Button>
          <Button variant="outline" size="sm" href="/contact.html">Contact</Button>
        </div>
      </Card>
    </section>

    <!-- Disclaimer -->
    <section aria-labelledby="disclaimer-heading">
      <Card padding="lg" class="border-dashed">
        <h2 id="disclaimer-heading" class="eyebrow text-subtle-foreground">Disclaimer</h2>
        <p class="mt-3 max-w-[72ch] text-sm text-muted-foreground">{guidelines.disclaimer}</p>
      </Card>
    </section>

    <!-- Submit -->
    <section class="rounded-2xl border border-border bg-surface-muted p-8 text-center" aria-labelledby="submit-heading">
      <Badge variant="outline">{SITE.tagline}</Badge>
      <h2 id="submit-heading" class="mt-3 text-2xl font-bold tracking-tight">Ready to submit?</h2>
      <p class="mx-auto mt-2 max-w-[60ch] text-sm text-muted-foreground">
        Send your manuscript to the editorial office by email. Submissions are reviewed through the journal's blind peer
        review process.
      </p>
      <div class="mt-5 flex flex-wrap justify-center gap-3">
        <Button variant="gold" href={`mailto:${SITE.email}?subject=Manuscript%20submission%20to%20GJMSSH`}>
          <Mail aria-hidden="true" />
          {SITE.email}
        </Button>
        <Button variant="outline" href="/current-issue.html">See a recent issue</Button>
      </div>
    </section>
  </div>
</div>
