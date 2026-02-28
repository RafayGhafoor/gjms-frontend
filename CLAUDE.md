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

**Pure static site** — 8 standalone HTML files, no JavaScript framework, no bundler, no dependencies to install.

**Styling:** Tailwind CSS loaded from CDN (`cdn.tailwindcss.com`). All styles are utility classes inline in the HTML — there is no separate CSS file or Tailwind config.

**Pages:**
- `index.html` — Home / landing
- `editorial-board.html` — Editorial board members
- `current-issue.html` — Current journal issue (update this when publishing new issues)
- `archive.html` — All past volumes and issues
- `author-guideline.html` — Submission guidelines
- `impact-factor.html` — Impact factor info
- `vision-mission.html` — Vision and mission
- `contact.html` — Contact page

**PDF hosting:** Research paper PDFs are served from an external CDN at `http://gjms.b-cdn.net/`. Links to papers point there, not to this repo.

**Navigation:** Hardcoded in each HTML file — when adding/renaming pages, update the `<nav>` in every file.

## Common Tasks

**Publishing a new issue:** Update `current-issue.html` with new volume/issue details and add the previous issue to `archive.html`.

**Adding a paper:** Add PDF to the CDN (`gjms.b-cdn.net`) and add the corresponding link in the relevant issue page.
