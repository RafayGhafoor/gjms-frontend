# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Two confirmed audiences, in the order the editorial office names them:

1. **Prospective authors** — researchers who have a manuscript and are deciding whether
   GJMSSH is a credible, fast, affordable place to publish it. They arrive to check scope,
   fee, review timeline, ethics rules, formatting requirements and who the editors are, then
   submit by email.
2. **Researchers reading and citing the journal** — people who need a specific article, a
   back issue, or evidence that the journal and a given paper exist. They arrive from a search
   engine, a citation in another paper, or a check of the journal's indexing claims.

A third audience is implied by the content but not confirmed as a design target: the editorial
office itself, maintaining the published record.

## Product Purpose

The public journal site of the Global Journal of Management, Social Sciences and Humanities
(GJMSSH). Asked what success looks like, the answer was *"it's a Journal"* — the site's job is to
**be the journal**: the authoritative public record of everything it has published since 2015, and
the authoritative statement of what publishing in it involves. It is a scholarly serial's presence,
not a marketing funnel.

**Open decision — success metric.** No measurable target was established. Candidates named but not
chosen: submission emails arriving, PDF downloads on the CDN, articles surfacing in Google Scholar
and search, or credibility signals for indexing review. Until one is chosen, work should be judged
against the purpose above rather than optimised for a single conversion.

## Positioning

What a neighbouring journal site could not truthfully copy: **the complete own archive, individually
addressable.** All 50 issues and 341 articles are prerendered as their own pages with real PDFs and
Highwire `citation_*` metadata (title, authors, ISSN pair, volume, issue, pages, PDF URL), so every
paper is a first-class citable object that Google Scholar can index — no login, no search portal, no
paywall in front of the record. The journal's own declarations (SJIF series, Google Scholar figure,
review timeline, fee) are published with their source named rather than aggregated or compared.

## Operating Context

- **Quarterly issues.** Vol 1 No. 1 is Oct–Dec 2015; the current issue is Vol 12 No. 1 (Jan–Mar 2026).
- **Submission is email.** There is no submission system, no dashboard, no account. The route is
  `gjmsweb@proton.me`; this is the journal's real process and must not be replaced by a form.
- **Published PDFs live on a CDN** (`gjms.b-cdn.net`), normalised to https. The site links to them;
  it does not host them.
- **Two upstream data files are written by the journal's automation** (a separate repository, run
  when an issue publishes): `archive-data.json` (issues and article records) and `abstracts.json`
  (extracted text keyed by PDF URL, 301 of 341 articles covered). Neither is edited by hand.
- **`content.json` is hand-edited page copy** — the journal's own published words for the home page,
  guidelines, board, metrics, vision and contact.
- **Build is static.** SvelteKit prerenders every route to `build/`, deployed by GitHub Actions to
  GitHub Pages on push to `main`. There is no runtime server, no database, no API at request time.

## Capabilities and Constraints

Confirmed functionality: home, current issue, full article index with search, archive by
year/volume/issue, one page per article (metadata, abstract where extracted, citation card, PDF
link), author guidelines, editorial board, indexing and impact, vision and mission, contact, 404.

Constraints that later work must preserve:

- **Published URLs are frozen** (`archive.html`, `current-issue.html`, `/article/<slug>.html`, …).
  Existing inbound links and citations depend on them.
- **No invented content.** Copy comes from `content.json`, records from `archive-data.json`,
  abstracts from `abstracts.json`. No fabricated authors, abstracts, keywords, DOIs, metrics,
  dates, board members or indexing claims. Absent data is omitted, not filled.
- **Slugs and numbering belong to the automation.** Never hand-write or renumber an article slug.
- **No DOI and no keyword data exists** in the records, so none may be displayed or emitted in
  metadata.
- **A missing date is better than a guessed date** — records carry a year, not a publication day.
- **The site is fully prerendered**, so anything requiring a request-time server is out of scope.
- Terminology in use: *blind peer review*, *issue* (volume + number), *article*, *author
  guidelines*, *publication fee*, *editorial board*, *indexing and impact*.

Open decisions: no measurable success metric (above); no defined editorial workflow for who
approves copy changes in `content.json` beyond "edited by hand in this repository".

## Brand Commitments

- Name **GJMSSH**, full name **Global Journal of Management, Social Sciences and Humanities**,
  tagline **"A Blind Peer-Reviewed Quarterly Journal"**, established **2015**.
- **ISSN 2520-7113 (print, also the linking ISSN) and 2520-7121 (online)** — registered with the
  ISSN International Centre, printed on every issue, and published as a pair. These are the
  journal's identity and cannot be restated approximately.
- Contact identity: `gjmsweb@proton.me`, `gjmsweb.com`.
- Logo: the globe-on-an-open-book mark and the horizontal lockup, in light and dark-UI variants.
- Editor-in-chief **Prof. Dr. Nicholas Perdikis**; 23 named international board members with their
  real affiliations.
- Voice is the journal's own: formal academic register, first-person institutional ("The authors
  are requested…"), no sales language. It is quoted, not rewritten.

## Evidence on Hand

- `content.json` — all published page copy, the SJIF series (9 years, latest highlighted figure
  5.99 in 2023), Google Scholar figure 2.89, 30-day publication claim, 50% acceptance rate,
  US$200 fee with low-income-country waivers, 16 author-guideline sections, 2 highlighted callouts,
  7 mission principles, board roster.
- `archive-data.json` — 50 issues, 341 articles with authors, page ranges and CDN PDF URLs.
- `abstracts.json` — extracted abstract text for 301 articles.
- `static/` — brand artwork, icons, social card, self-hosted webfonts.
- `legacy/site/` — the previous site, reference only.

Known absences that future work must not fill in: no testimonials or endorsements, no customer or
institutional logos, no DOIs, no keywords, no publication dates finer than a year per issue, no
author photographs or personal profiles, no submission platform, no pricing tiers beyond the single
published fee, no certified indexing claims beyond the journal's own named figures.

## Product Principles

1. **The record is the product.** A complete, individually addressable archive of everything
   published outranks promotional surfaces; anything that hides or delays the record is wrong.
2. **Quote the journal, never embellish it.** Every number, name and sentence is the journal's own
   published statement, attributed to its source, and omitted when it does not exist.
3. **Serve both sides of the same page.** An author deciding whether to submit and a reader hunting
   one paper are the same visit; each article and each policy must answer both without a funnel.
4. **Be the citation target.** Metadata, stable URLs and machine-readable identity matter more than
   interface novelty, because being indexed and cited is what a journal is for.
5. **Fast and unfragile by construction.** Static, prerendered, self-hosted and single-purpose: the
   site must stay readable on a slow connection, in a locked-down network, and for years.
