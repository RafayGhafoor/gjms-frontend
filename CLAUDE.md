# CLAUDE.md

Guidance for agents working in this repository — the website of the
**Global Journal of Management, Social Sciences and Humanities (GJMSSH)**, served at
`gjmsweb.com` from GitHub Pages.

## Stack

SvelteKit 2 + Svelte 5 (runes) + Vite 7 + Tailwind CSS v4, with shadcn-svelte-style components
under `src/lib/components/ui`. The site is fully prerendered by `@sveltejs/adapter-static`
into `build/` — there is no server at runtime.

```bash
npm install
npm run dev      # local dev server
npm run check    # svelte-check — must report 0 errors
npm run build    # static build → build/
npm run preview  # serve the production build locally
```

Deployment: `.github/workflows/static.yml` runs `npm ci && npm run check && npm run build` on every
push to `main` and publishes `build/` to GitHub Pages.

## Layout

```
archive-data.json      journal article archive — WRITTEN BY gjms-automation, never edit by hand
content.json           the journal's published page copy (site, stats, board, guidelines, contact)
src/app.css            Academic Nexus design tokens (light + AMOLED dark) and Tailwind theme
src/lib/config/site.ts navigation, footer links, canonical URLs, sitemap list
src/lib/data/          types, archive normalisation/derivation, journal.ts entry point
src/lib/components/    ui/ (shadcn-style primitives) · site/ (header, footer, Seo, breadcrumbs)
                       charts/ · archive/ (article card, issue card, year timeline, browser)
src/routes/<name>.html/+page.svelte   one folder per published URL (dots included on purpose)
legacy/                the previous static site and the first design pilot — reference only
docs/REDESIGN-CONVENTIONS.md   the design-system + conventions contract (read before editing pages)
```

## Non-negotiable rules

1. **No invented content.** Only use data that exists in `archive-data.json`, `content.json` or
   `legacy/site/*.html`. Never fabricate authors, abstracts, keywords, DOIs, metrics, statistics,
   dates, editorial members or indexing claims. If a section has no source content, omit it.
2. **URLs are frozen.** `archive.html`, `current-issue.html`, … must keep working. That is why route
   folders are named `<name>.html` — SvelteKit then emits `build/<name>.html`.
3. **Data flows one way.** `archive-data.json` is produced by `gjms-automation/` (its own repository)
   and updated on publishing. The website only reads it.
4. `npm run check` and `npm run build` must both pass; the prerenderer fails the build on broken
   internal links or missing `#anchors`, so keep links honest.
5. Import Lucide icons per icon (`@lucide/svelte/icons/search`), never from the barrel export.

## Content workflow when a new issue is published

1. `gjms-automation` extracts metadata, uploads PDFs to `gjms.b-cdn.net` and appends the issue to
   `archive-data.json` (top-level array, shape `{ volume, title, articles: [{ num, title, authors,
   pages, pdf }] }`).
2. Commit and push; the workflow rebuilds the site. The archive page, charts, timeline, sitemap and
   issue pages all pick the new issue up automatically at build time.
3. `current-issue.html` and the "Current issue" block on the home page read `content.json`, which is
   still edited by hand.
