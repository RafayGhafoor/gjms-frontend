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
                       (num, title, authors, pages, pdf, slug per article)
abstracts.json         extracted abstracts keyed by PDF URL — also written by the automation
content.json           the journal's published page copy (site, stats, board, guidelines, contact)
src/app.css            Academic Nexus design tokens (light + AMOLED dark) and Tailwind theme
src/lib/config/site.ts navigation, footer links, canonical URLs, sitemap list
static/                brand artwork and icons copied verbatim into build/
docs/brand/            the original logo sources + how the web assets are generated
scripts/brand/         build-brand-assets.py — regenerates static/brand and the favicons
src/lib/data/          types · archive.ts (pure helpers) · archive-index.ts (records)
                       · content.ts (page copy) · text.ts · paths.ts — see “Which data module”
src/lib/server/        build-time only: abstracts.ts (abstract lookup) · stats.ts (counts)
src/lib/components/    ui/ (shadcn-style primitives) · site/ (header, footer, Seo, breadcrumbs)
                       charts/ · archive/ (article card, issue card, year timeline, browser)
                       · article/ (article detail, citation card)
src/routes/<name>.html/+page.svelte   one folder per published URL (dots included on purpose)
src/routes/archive/[issue]/           one prerendered page per issue  → /archive/<issue>.html
src/routes/article/[slug]/             one prerendered page per article → /article/<slug>.html
legacy/                the previous static site and the first design pilot — reference only
docs/REDESIGN-CONVENTIONS.md   the design-system + conventions contract (read before editing pages)
```

### Which data module to import

`archive-data.json` is large (all 342 records), so the data layer is split. Importing the wrong module
ships the whole archive to the browser on pages that do not need it:

| Need | Import |
| --- | --- |
| Article/issue records (archive, articles, home, current issue, issue and article pages) | `$lib/data/archive-index` |
| The journal's page copy only (guidelines, contact, editorial board, impact, vision) | `$lib/data/content` |
| Derived counts on a content page | a `+page.server.ts` load using `$lib/server/stats` |
| One article's abstract | `$lib/server/abstracts` (server-only — never import from client code) |

`$lib/data/journal` re-exports both data files for build-time scripts; importing it from a page pulls
the archive index into that page's bundle, which is why the content pages avoid it.

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

## Brand assets

The GJMSSH logo exists in two forms, both kept in `docs/brand/`:

- `gjms-icon-source.png` — the square icon mark (globe on an open book)
- `gjms-lockup-source.png` — the horizontal icon + wordmark lockup

Both sources are artwork on a white background, so `scripts/brand/build-brand-assets.py` crops the
margin, converts white to alpha (with an un-premultiply pass so edges carry no white fringe) and emits
a **dark-UI variant** where the navy ink becomes light slate while the cyan swoosh and gold dot stay.
Run it after replacing a source:

```bash
python3 scripts/brand/build-brand-assets.py   # needs pillow + numpy; cwebp for the .webp variants
```

It writes `static/brand/gjms-{mark,lockup}{,-dark}.{png,webp}`, `static/icon-192.png`,
`static/icon-512.png`, `static/apple-touch-icon.png`, `static/favicon-32{,-dark}.png`,
`static/favicon.ico` and `static/og-image.jpg` (the 1200×630 social card).

The pages never choose a variant with `<picture>`: because the theme is a class on `<html>` rather than
the OS preference, the light/dark artwork is declared as CSS `background-image` on `.brand-lockup` and
`.brand-mark` (see `src/app.css`), so exactly one image is downloaded for the active theme. Use those
classes — not bare `<img>` tags — when a page needs the logo.

## Content workflow when a new issue is published

1. `gjms-automation` extracts metadata, uploads PDFs to `gjms.b-cdn.net`, appends the issue to
   `archive-data.json` (top-level array, shape `{ volume, title, articles: [{ num, title, authors,
   pages, pdf, slug }] }`) and writes the extracted text to `abstracts.json` (keyed by PDF URL).
2. Commit and push; the workflow rebuilds the site. The archive page, charts, timeline, sitemap,
   issue pages and article pages all pick the new issue up automatically at build time.
3. `current-issue.html` and the "Current issue" block on the home page read `content.json`, which is
   still edited by hand.

Article page URLs come from the automation's `slug` field. Never hand-write or renumber a slug —
existing `/article/<slug>.html` links depend on it.
