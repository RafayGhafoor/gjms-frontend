# Live audit of gjmsweb.com — 2026-10-22

**Hand-written.** The other three files in this directory (`audit.md`,
`internal-linking.md`, `readiness.md`) are regenerated from `build/` by
`npm run seo:audit`. This one records what only the deployed site can answer:
response headers, DNS, redirects, whether the data in the archive is actually
research, and how the copy reads to an answer engine. Amend it after each
re-audit instead of deleting what it used to say — the "was" is the record.

## Method

- Crawled **all 400 sitemap URLs** (1 home + 8 pages + 50 issues + 341
  articles), one request each, parsing `<head>` for title, description,
  canonical, robots, Open Graph/Twitter, `citation_*` and every
  `application/ld+json` block. **400/400 returned 200**; zero 4xx, zero 5xx.
- Probed the URL surface the sitemap does not list: `http://`, `www`,
  extension-less paths, trailing slashes, `/index.html`, `/__data.json`,
  `/404.html`, `/type/`.
- Checked response headers, compression, and cache policy on HTML, JS, fonts
  and images; timed TTFB; summed the per-page transfer.
- Cross-checked the archive against the rendered schema in `build/` to find
  records with no author, no page range, no abstract.
- **Not measured:** Google Search Console index state and CrUX field data. The
  PageSpeed Insights API returned `429 quota exceeded` (no key configured), so
  every performance number here is server-side or lab-by-hand, not field data.

## Score at audit time — **77 / 100**

| Category | Weight | Score | Basis |
| --- | --- | --- | --- |
| Technical SEO | 22% | 86 | Everything crawlable and canonicalised; duplicate URL surfaces and no long-lived asset caching |
| Content Quality / E-E-A-T | 23% | 64 | 341 genuine papers, but no policy layer, 40 abstract-less pages, 4 front-matter records typed as articles |
| On-Page SEO | 20% | 79 | Complete metadata; 6 one-word titles, 319 titles over 60 chars |
| Schema / Structured Data | 10% | 82 | Rich, valid, `@id`-linked; entity identity was missing at node level |
| Performance (CWV) | 10% | 74 | Static, ~9–12 KB gzip HTML; but 600-second caching on immutable assets, gzip only |
| AI Search Readiness | 10% | 87 | `llms.txt` + AI allowlist + abstracts in HTML; one published figure contradicted the site |
| Images | 5% | 62 | Zero `<img>` elements on all 400 pages |

The ten merged fixes below address the On-Page, Schema, AI-readiness and Images
rows. Technical and Performance stay where they are until the host changes —
they are response-header problems, and GitHub Pages does not let a repository
set them.

## Findings

Priority is what it costs the journal, not what it costs to fix. `Fixed` means
merged into `ui-critique-polish` as `6b25242`.

| # | Finding | Priority | Status |
| --- | --- | --- | --- |
| F1 | Every asset served `cache-control: max-age=600`, including `_app/immutable/*` and the two preloaded `woff2` files; gzip only, no Brotli | Critical | Open — blocked on DNS (staged in `scripts/cloudflare/`) |
| F2 | `llms.txt` published "decision within **30 days**" while the guidelines promise a decision "within two weeks of submission" and 30 days is time to *publication* | High | **Fixed** |
| F3 | `www.gjmsweb.com` does not resolve at all — no record, so no redirect | High | Open — needs a DNS record |
| F4 | Four archive records are the journal's own Author's Guideline, typed `ScholarlyArticle`, in the sitemap, with `citation_title` and no author | High | Open — `gjms-automation` |
| F5 | No E-E-A-T policy layer: ethics, peer review, copyright/licence, privacy, data availability, COI, archiving, retraction | High | Open — owner copy |
| F6 | 40 of 341 article pages have no abstract (`abstracts.json` has no extraction) | High | Open — `gjms-automation` |
| F7 | No `sameAs` on the Organization node — no entity reconciliation to Scholar/DOAJ/Crossref | High | Open — needs real profile URLs |
| F8 | `<page>.html` is also served at `<page>` and `<page>/`, with 200 | Medium | Open — host behaviour; 301 possible behind Cloudflare |
| F9 | SvelteKit `__data.json` endpoints indexable and not in robots.txt | Medium | **Fixed** |
| F10 | `WebSite.potentialAction` SearchAction at `articles.html?q=` — retired by Google (Nov 2024) and a URL robots.txt excludes | Medium | **Fixed** |
| F11 | 319 titles exceed 60 characters (longest 187) | Medium | Accepted — academic titles; the discriminating words are front-loaded, and the `\| GJMSSH` suffix is what truncates |
| F12 | Six pages published 16–28 character titles | Medium | **Fixed** (5 of 6; `author-guideline.html` deferred) |
| F13 | Zero `<img>` elements site-wide — no Images surface, no per-article social card | Medium | Open — product decision |
| F14 | `icon-512.png` was 512×351, `icon-192.png` 192×132, favicons 32×21 — while the manifest and `<link sizes>` declared squares | Medium | **Fixed** |
| F15 | `Organization.logo` declared `width: 512, height: 351` | Medium | **Fixed** |
| F16 | "Google Scholar: 2.89" published as a journal metric beside SJIF 5.99; Google Scholar publishes no journal-level metric | Medium | Open — owner decision |
| F17 | 21 `modulepreload` chunks / 217 KB raw JS on a static article page; `articles.html` 270 KB raw | Medium | Open — accepted hydration cost for now |
| F18 | `ScholarlyArticle` and `PublicationIssue` carried no `@id`; issue nodes had no `volumeNumber` | Medium | **Fixed** (partially: `keywords`, `license` and full `datePublished` still need data the archive does not hold) |
| F19 | No RSS/Atom feed and no `<link rel="alternate" type="application/rss+xml">` | Low | Open |
| F20 | No `google-site-verification` / `msvalidate.01`; index coverage unknown | Low | Open — verify |
| F21 | No DOIs, no Crossref deposit, no ORCID for authors | Low | Open — long-term |

## Evidence

### F1 — cache policy on immutable assets

```
$ curl -sSI https://gjmsweb.com/_app/immutable/entry/start.DEjuSpF3.js
cache-control: max-age=600
content-length: 28642

$ curl -sSI https://gjmsweb.com/fonts/source-serif-4/latin-300-700.woff2
cache-control: max-age=600

$ curl -sSI -H 'Accept-Encoding: br, gzip' https://gjmsweb.com/archive.html
content-encoding: gzip          # no brotli
cache-control: max-age=600
```

A hashed filename is immutable by construction, so `max-age=600` revalidates
~25 assets on every repeat visit and on every hop between issue pages. The
`scripts/cloudflare/` rules (1 year immutable on `/_app/immutable/`, 30 days on
`/fonts/` `/brand/` and the icons, Brotli, HTTP/3) fix this, and the same
config carries the `www` record. **Nothing is live — the zone is staged and the
nameservers at the registrar are still the old ones.**

### F2 — two clocks, one label

`content.json` holds `daysToPublish: "30"` and the guidelines say the decision
is communicated "within two weeks of submission" with "publication in 30 days".
`llms.txt` labelled the 30 as a *decision* window. Answer engines ingest that
file verbatim, so the wrong timeframe reached anyone asking an assistant how long
GJMSSH takes. It is now two lines:

```
- Decision timeline: within two weeks of submission
- Publication timeline: 30 days
```

### F3 — www

```
$ curl -sS https://www.gjmsweb.com/
curl: (6) Could not resolve host: www.gjmsweb.com
$ curl -sS http://gjmsweb.com/            # apex http→https is fine
301 https://gjmsweb.com/
```

### F4 / F5 / F6 / F13 / F16 — the data and copy findings

These are not code defects and the website may not paper over them (rule 1: no
invented content). Measured from `build/`:

```
article pages            342 (1 redirect stub, 341 indexable)
no abstract              40
no author                5   → 4 Author's Guideline records + a-constrastive-study-of-gtm-and-clt-…
no page range            2   → 2 of those 4 records
<img> elements           0   across all 400 indexable pages
```

So the published claim of "341 open-access articles" is really **337 research
papers plus four copies of one front-matter document**, and 40 records are the
thinnest pages on the site. `readiness.md` scores E-E-A-T at 70/100 for the
policy layer and Topical authority at 30/100 for the missing subject
classification — both are owner/automation work, not website work.

### F8 — duplicate URL surface (host behaviour)

```
/archive.html                200
/archive                     200   same document
/contact                     200   → contact.html
/archive/vol-1-issue-1       200   → vol-1-issue-1.html
/archive.html/               404
/Article/vol-1-issue-1.html  404
/index.html                  200   canonical → "/"
```

The self-referencing canonical on every page is what keeps this from becoming a
duplicate-content problem; GitHub Pages cannot emit the 301.

### F12 — titles before and after

```
articles.html         17 → 48   Article index: search all 341 articles
contact.html          16 → 37   Contact the editorial office
editorial-board.html  24 → 54   Editorial board: editor-in-chief and members
author-guideline.html 26 → 26   (deferred — see the todo list)
vision-mission.html   27 → 46   Aims, scope and mission of the journal
impact-factor.html    28 → 45   Indexing and impact: published figures
```

### F14 — the icon that lied about its size

`fit_box()` scaled to the long side of a 1.46:1 mark, so four declarations were
false at once: the manifest's `512x512` and `192x192`, the head's
`sizes="32x32"`, and `Organization.logo`. `square_tile()` now centres the mark
on a square canvas — the painted mark is exactly as large as before, only the
canvas is square. 512×351 → 512×512 (142 KB → 114 KB).

## What the build-time audit cannot see

`npm run seo:audit` reads `build/`, so it is blind to everything in the table
above that is not in the HTML: response headers, DNS, redirect behaviour, and
whether the records describe what they claim to. That is why this file exists —
run the crawl, not just the script.
