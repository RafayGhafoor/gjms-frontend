<script lang="ts">
  import { cn } from '$lib/utils';
  import type { Pairing } from '$lib/data/type-pairings';

  /* Typography comparison harness.
     Each pairing renders the SAME real journal content — a published article
     title, its authors, issue metadata and its abstract — so the comparison is
     about type, not copy. Sizes follow the spec being evaluated:
     H1 48–56px, article titles 32–40px, body 17–19px/1.7, nav 14–16px. */

  let {
    pairing,
    articles,
    abstract,
    navLabels,
    totalArticles = 0,
    totalIssues = 0
  }: {
    pairing: Pairing;
    articles: { title: string; authors: string; venue: string; pages: string }[];
    abstract: string;
    navLabels: string[];
    totalArticles?: number;
    totalIssues?: number;
  } = $props();

  const lead = $derived(articles[0]);
</script>

<div style="font-family: {pairing.body}; font-size: {pairing.bodySize}; line-height: 1.7">
  <!-- site chrome, so the pairing is judged in context -->
  <header class="border-b border-gray-200 bg-white">
    <div class="mx-auto flex max-w-6xl items-center gap-6 px-6 py-4">
      <span class="text-base font-extrabold tracking-tight" style="font-family: {pairing.heading}">GJMSSH</span>
      <nav class="hidden flex-1 gap-5 md:flex" style="font-size: {pairing.navSize}">
        {#each navLabels as label (label)}
          <span class={cn('text-gray-600', label === 'Archive' && 'font-semibold text-blue-700')}>{label}</span>
        {/each}
      </nav>
      <span class="ml-auto rounded-md bg-blue-600 px-3.5 py-2 text-sm font-semibold text-white">Submit manuscript</span>
    </div>
  </header>

  <main class="mx-auto max-w-6xl px-6 py-12">
    <p class="text-xs font-semibold tracking-[0.14em] text-gray-500 uppercase">Journal archive</p>
    <h1
      class="mt-3 max-w-[42ch] leading-[1.12] tracking-tight text-gray-900"
      style="font-family: {pairing.heading}; font-size: {pairing.h1}; font-weight: {pairing.headingWeight}"
    >
      Global Journal of Management, Social Sciences and Humanities
    </h1>
    <p class="mt-5 max-w-[62ch] text-gray-600">
      A blind peer-reviewed quarterly journal publishing research in management, social sciences and humanities, with
      {totalArticles} open-access articles across {totalIssues} issues. This is the same published article, abstract and
      issue metadata in every pairing — only the type changes.
    </p>

    <!-- an article record, exactly as the site presents one -->
    <article class="mt-10 rounded-xl border border-gray-200 bg-gray-50 p-6">
      <p class="flex flex-wrap gap-2 text-xs font-semibold">
        <span class="rounded-full bg-blue-50 px-2.5 py-1 text-blue-700">Vol 12 · Issue 1</span>
        <span class="rounded-full bg-gray-100 px-2.5 py-1 text-gray-600">2026</span>
        <span class="rounded-full bg-gray-100 px-2.5 py-1 text-gray-600">{lead.pages}</span>
      </p>

      <h2
        class="mt-4 max-w-[46ch] leading-[1.2] tracking-tight text-gray-900"
        style="font-family: {pairing.heading}; font-size: {pairing.articleTitle}; font-weight: {pairing.headingWeight}"
      >
        {lead.title}
      </h2>

      <p class="mt-3 text-gray-500" style="font-size: 0.9375rem">{lead.authors}</p>

      <div class="mt-5 border-t border-dashed border-gray-300 pt-5">
        <p class="text-xs font-bold tracking-[0.12em] text-gray-500 uppercase">Abstract</p>
        <p class="mt-3 max-w-[70ch] text-gray-700">{abstract}</p>
        <div class="mt-5 flex flex-wrap gap-3">
          <span class="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white">Download PDF</span>
          <span class="rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700">View the issue</span>
        </div>
      </div>
    </article>

    <!-- reading sample: a table of contents, where hierarchy shows -->
    <section class="mt-12">
      <h3
        class="leading-tight tracking-tight text-gray-900"
        style="font-family: {pairing.heading}; font-size: clamp(1.25rem, 1.1rem + 0.6vw, 1.75rem); font-weight: {pairing.headingWeight}"
      >
        Articles in this issue
      </h3>
      <ol class="mt-5 space-y-4">
        {#each articles as item (item.title)}
          <li class="border-b border-gray-100 pb-4 last:border-0">
            <p class="text-gray-900" style="font-family: {pairing.heading}; font-size: 1.1875rem; font-weight: {pairing.headingWeight}">
              {item.title}
            </p>
            <p class="mt-1 text-sm text-gray-500">{item.authors} · {item.venue} · {item.pages}</p>
          </li>
        {/each}
      </ol>
    </section>
  </main>

  <footer class="border-t border-gray-200 bg-gray-50 px-6 py-8 text-center text-sm text-gray-500">
    © 2026 Global Journal of Management, Social Sciences and Humanities. All rights reserved.
  </footer>
</div>
