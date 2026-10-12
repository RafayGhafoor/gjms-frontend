# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Static HTML website for the **Global Journal of Management, Social Sciences and Humanities (GJMSSH)**, hosted at `gjmsweb.com` via GitHub Pages.

## Development

No build system or package manager. To preview locally, open any HTML file directly in a browser or use a simple HTTP server:

```sh
python3 -m http.server 8000
```

Deployment is automatic via GitHub Actions on every push to `main` (`.github/workflows/static.yml`).

## Architecture

**Static site, but much of its content is rendered client-side.** There is no
framework and no bundler, yet several pages fetch JSON in JavaScript, so the DOM
does not contain their content until that fetch resolves:

- **`content.json`** — page copy for the 7 informational pages (`index.html`,
  `impact-factor.html`, `current-issue.html`, `editorial-board.html`,
  `author-guideline.html`, `vision-mission.html`, `contact.html`), `fetch`ed and
  injected into the DOM.
- **`archive-data.json`** — issue and article metadata for `archive.html`.
- **`abstracts.json`** — abstract text keyed by PDF URL, lazy-loaded only when a
  reader clicks "Show abstract".

**Styling:** Tailwind CSS from the CDN (`cdn.tailwindcss.com`) with an **inline**
`tailwind.config` block in each page (dark mode + `navy`/`gold` palettes), plus a
small hand-written **`style.css`** that is linked from every page. `theme.js`
handles the light/dark toggle via `localStorage`.

**Pages (8 at the root):** `index.html`, `editorial-board.html`,
`current-issue.html`, `archive.html`, `author-guideline.html`,
`impact-factor.html`, `vision-mission.html`, `contact.html`.

**Generated pages:** `article/<slug>.html` — one per article (currently 342), plus
`sitemap.xml` and `robots.txt`.

**PDF hosting:** research paper PDFs are served from an external CDN at
`http://gjms.b-cdn.net/`. Links point there, not to this repo.

**Navigation:** hardcoded in each HTML file — when adding or renaming a page,
update the `<nav>` in every file, including the generated article pages (they use
`../`-prefixed links; see `build_pages.py` in the `gjmsweb` repo).

## Generated files — do not hand-edit

`archive-data.json`, `abstracts.json`, `article/`, `sitemap.xml` and
`robots.txt` are all produced by the automation repo
(`../gjmsweb/gjms-automation/`). Edit them there and re-run the tooling, or the
change will be overwritten on the next publish.

`run_automation.py` previews extracted metadata and asks for confirmation before
writing anything; `build_pages.py` regenerates the article pages from
`archive-data.json`. Each article carries a persisted `slug` that is only ever
assigned when missing, so **correcting a title never changes a published URL**.

## Search engine visibility

`archive.html` builds its article list in JavaScript, inside a modal, only after
the reader clicks an issue button. Search engines do not click, so that page
exposes no titles, authors, abstracts or PDF links.

`article/<slug>.html` is therefore the indexable surface: the abstract is inline
in the HTML, with `ScholarlyArticle` JSON-LD, a meta description, a canonical URL
and `citation_*` meta tags. The archive modal keeps using `abstracts.json` so the
archive page itself stays light.

`robots.txt` allows crawling and points at `sitemap.xml`, which lists every article
page. `sitemap.xml` must be submitted manually to Google Search Console — a new
sitemap is not discovered on its own.

## Common Tasks

**Publishing a new issue / adding a paper:** do not edit this repo by hand. Put
the PDFs in `test_files/` in the `gjmsweb` repo and run:

```sh
python gjms-automation/run_automation.py
```

That uploads to the CDN, updates `archive-data.json` and `abstracts.json`,
regenerates the article pages, commits and pushes. Use `--dry-run` to preview the
extracted metadata without changing anything.

`current-issue.html` is still maintained by hand — update it when publishing a new
issue.
