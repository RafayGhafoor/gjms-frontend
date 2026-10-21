<script lang="ts">
  import { onMount } from 'svelte';
  import Seo from '$lib/components/site/seo.svelte';
  import PageHeader from '$lib/components/site/page-header.svelte';
  import Button from '$lib/components/ui/button.svelte';
  import { content } from '$lib/data/content';
  import { SITE } from '$lib/config/site';
  import { breadcrumbNode, webPageNode } from '$lib/seo';
  import Mail from '@lucide/svelte/icons/mail';

  /* The guidelines are the journal's existing published text (content.json),
     reproduced verbatim — including the bullet list of abstract elements and the
     labelled lists of paper types and reference formats, which the earlier
     design dropped. Only the presentation is new. */

  function anchor(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  const guidelines = $derived(content.authorGuidelines);
  const sections = $derived(guidelines.sections.map((section) => ({ ...section, id: anchor(section.title) })));
  const highlights = $derived(guidelines.highlights);

  /* Contents list. The two sections that bracket the numbered requirements are
     part of the page, so they belong in it; the rail marks where the reader is. */
  const toc = $derived([
    { id: 'key-facts', title: 'Before you submit' },
    ...sections.map((section) => ({ id: section.id, title: section.title })),
    { id: 'ethics-and-integrity', title: 'Ethics and publication integrity' },
    { id: 'disclaimer-heading', title: 'Disclaimer' }
  ]);

  let activeId = $state('');

  onMount(() => {
    const targets = toc
      .map((entry) => document.getElementById(entry.id))
      .filter((element): element is HTMLElement => Boolean(element));
    if (!targets.length || !('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length) activeId = visible[0].target.id;
      },
      { rootMargin: '-20% 0px -70% 0px', threshold: [0, 1] }
    );

    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  });

  /* The 30-day figure is the journal's time to publication — its own guidelines
     publish a two-week decision and publication in 30 days — so the label says
     which of the two it is. The fee is written "US$200" in the guidelines text
     and "$200" in the stats block; the page uses the guidelines' form. */
  const fee = $derived(content.stats.publicationFee.replace(/^\$/, 'US$'));

  const facts = $derived([
    { term: 'Publication within', detail: `${content.stats.daysToPublish} days` },
    { term: 'Acceptance rate', detail: content.stats.acceptanceRate },
    { term: 'Publication fee', detail: fee }
  ]);

  const description = $derived(
    `Author guidelines for the Global Journal of Management, Social Sciences and Humanities (GJMSSH): manuscript preparation, ${guidelines.sections.length} requirements sections, publication fee, decision timeline and submission process.`
  );
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

<PageHeader
  eyebrow="For authors"
  title="Author guidelines"
  description={guidelines.intro}
  items={[{ name: 'Home', href: '/' }, { name: 'For authors' }]}
>
  <div class="mt-8 flex flex-wrap gap-3">
    <Button variant="navy" href={`mailto:${SITE.email}?subject=Manuscript%20submission%20to%20GJMSSH`}>
      <Mail aria-hidden="true" />
      Submit to {SITE.email}
    </Button>
    <Button variant="outline" href="/contact.html">Contact the editorial office</Button>
  </div>
</PageHeader>

<div class="container-page grid gap-12 py-14 grid-cols-1 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-16 lg:py-16">
  <aside class="lg:sticky lg:top-[7.5rem] lg:self-start">
    <nav aria-labelledby="on-this-page">
      <h2 id="on-this-page" class="eyebrow text-subtle-foreground">On this page</h2>
      <ol class="mt-4">
        {#each toc as entry (entry.id)}
          <li class="border-t border-border last:border-b">
            <a
              class="block py-2.5 text-[0.875rem] no-underline transition-colors {activeId === entry.id
                ? 'font-semibold text-accent-foreground'
                : 'text-muted-foreground hover:text-accent-foreground'}"
              href="#{entry.id}"
              aria-current={activeId === entry.id ? 'true' : undefined}
            >
              {entry.title}
            </a>
          </li>
        {/each}
      </ol>
    </nav>
  </aside>

  <div class="grid gap-16">
    <!-- The facts an author needs before preparing anything. -->
    <section aria-labelledby="key-facts">
      <h2 id="key-facts" class="display-2 border-b border-border-strong pb-3">Before you submit</h2>

      <div class="mt-7 grid gap-5 sm:grid-cols-2">
        {#each highlights as highlight (highlight.title)}
          <div
            class="border-l-2 pl-5 {highlight.style === 'gold' ? 'border-gold-border' : 'border-accent-border'}"
          >
            <h3 class="font-serif text-[1.0625rem]">{highlight.title}</h3>
            <p class="measure mt-2.5 text-[0.9375rem] leading-relaxed text-muted-foreground">{highlight.text}</p>
          </div>
        {/each}
      </div>

      <dl class="mt-8 grid grid-cols-1 gap-x-8 gap-y-5 border-t border-border-strong pt-6 sm:grid-cols-3">
        {#each facts as fact (fact.term)}
          <div>
            <dt class="text-[0.8125rem] text-subtle-foreground">{fact.term}</dt>
            <dd class="mt-1.5 font-serif text-[1.375rem] leading-none font-semibold tabular-nums">{fact.detail}</dd>
          </div>
        {/each}
      </dl>
    </section>

    <!-- The published requirements, verbatim. -->
    <section aria-labelledby="requirements-heading">
      <h2 id="requirements-heading" class="display-2 border-b border-border-strong pb-3">
        {sections.length} requirements of a GJMSSH manuscript
      </h2>

      <div class="mt-8 grid gap-12">
        {#each sections as section, index (section.id)}
          <article id={section.id} class="scroll-mt-32">
            <div class="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-x-4">
              <span class="font-serif text-[0.9375rem] leading-7 text-gold-foreground tabular-nums" aria-hidden="true">
                {String(index + 1).padStart(2, '0')}
              </span>
              <div class="min-w-0">
                <h3 class="font-serif text-[1.375rem] leading-snug">{section.title}</h3>

                {#each section.text.split(/\n{2,}/) as paragraph (paragraph)}
                  <p class="measure mt-3 text-[0.9375rem] leading-relaxed text-muted-foreground">{paragraph}</p>
                {/each}

                {#if section.list?.length}
                  <ul class="mt-4 grid gap-2">
                    {#each section.list as item (item)}
                      <li class="flex gap-3 text-[0.9375rem] leading-relaxed text-muted-foreground">
                        <span class="mt-2.5 size-1 shrink-0 rounded-full bg-gold" aria-hidden="true"></span>
                        <span>{item}</span>
                      </li>
                    {/each}
                  </ul>
                {/if}

                {#if section.text2}
                  <p class="measure mt-4 text-[0.9375rem] font-semibold text-foreground">{section.text2}</p>
                {/if}

                {#if section.labeledList?.length}
                  <dl class="mt-3">
                    {#each section.labeledList as entry (entry.label)}
                      <div class="border-t border-border py-4 last:border-b">
                        <dt class="font-serif text-[1.0625rem]">{entry.label}</dt>
                        <dd class="measure mt-1.5 text-[0.9375rem] leading-relaxed text-muted-foreground">
                          {entry.text}
                        </dd>
                      </div>
                    {/each}
                  </dl>
                {/if}
              </div>
            </div>
          </article>
        {/each}
      </div>
    </section>

    <!-- Ethics / plagiarism note (existing published text). -->
    <section id="ethics-and-integrity" class="scroll-mt-32" aria-labelledby="ethics-heading">
      <div class="rounded-lg border border-accent-border bg-accent p-6 sm:p-8">
        <p class="eyebrow text-accent-foreground">Integrity</p>
        <h2 id="ethics-heading" class="display-2 mt-3">Plagiarism and publication integrity</h2>
        {#each (sections.find((section) => section.id === 'plagiarism')?.text ?? '').split(/\n{2,}/) as paragraph (paragraph)}
          <p class="measure mt-3 text-[0.9375rem] leading-relaxed text-muted-foreground">{paragraph}</p>
        {/each}
        <p class="measure mt-3 text-[0.9375rem] leading-relaxed text-muted-foreground">
          Authors should also read the journal's statement of vision and mission, and contact the editorial office with
          any question about the review process.
        </p>
        <div class="mt-6 flex flex-wrap gap-3">
          <Button variant="outline" size="sm" href="/vision-mission.html">Vision and mission</Button>
          <Button variant="outline" size="sm" href="/editorial-board.html">Editorial board</Button>
          <Button variant="ghost" size="sm" href="/contact.html">Contact</Button>
        </div>
      </div>
    </section>

    <section aria-labelledby="disclaimer-heading">
      <h2 id="disclaimer-heading" class="eyebrow text-subtle-foreground">Disclaimer</h2>
      <p class="measure mt-3 text-[0.875rem] leading-relaxed text-muted-foreground">{guidelines.disclaimer}</p>
    </section>
  </div>
</div>

<section class="band-navy" aria-labelledby="submit-heading">
  <div class="container-page section-y">
    <div class="grid gap-x-12 gap-y-8 grid-cols-1 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
      <div>
        <h2 id="submit-heading" class="display-2 text-band-foreground">Ready to submit?</h2>
        <p class="measure mt-4 leading-relaxed text-band-muted">
          Send your manuscript to the editorial office by email. Submissions are reviewed through the journal's blind
          peer review process, and the published decision timeline is two weeks from submission.
        </p>
      </div>
      <div class="flex flex-wrap gap-3">
        <Button variant="light" href={`mailto:${SITE.email}?subject=Manuscript%20submission%20to%20GJMSSH`}>
          <Mail aria-hidden="true" />
          {SITE.email}
        </Button>
        <Button variant="light" href="/current-issue.html">See a recent issue</Button>
      </div>
    </div>
  </div>
</section>
