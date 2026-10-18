# GJMSSH redesign — conventions for page agents

Read this whole file before writing code. The archive page (`src/routes/archive.html/+page.svelte`
and `src/lib/components/archive/*`) is the **reference implementation** — match its structure,
spacing, tone and level of polish.

## 1. Stack

| Piece | Choice |
| --- | --- |
| Framework | SvelteKit 2 + Svelte 5 (runes: `$props`, `$state`, `$derived`, `$effect`) |
| Build | Vite 7 + `@sveltejs/adapter-static` → `build/`, deployed to GitHub Pages |
| Styling | Tailwind CSS v4 (`src/app.css`) + shadcn-svelte-style components |
| Icons | `@lucide/svelte` — **always** import per icon: `import Search from '@lucide/svelte/icons/search';` (the barrel import pulls in 4000+ modules and makes builds 60× slower) |
| Theme | `mode-watcher` (light / system / dark) |

Commands:

```bash
npm run dev      # local dev server
npm run check    # svelte-check (must be 0 errors)
npm run build    # static build → build/
```

Every page is prerendered (`src/routes/+layout.ts`). A new route needs no config.
The prerenderer **fails the build on a broken internal link or a missing `#anchor`** — so every
link you write must resolve.

## 2. Data rules (non-negotiable)

1. Use **only** existing published data:
   - `archive-data.json` — the article archive (owned by the `gjms-automation` pipeline at the repo root)
   - `content.json` — the journal's published page copy (site info, impact table, current issue,
     editorial board, author guidelines, vision/mission, contact)
   - `legacy/site/*.html` — the previous site, kept as a reference for existing published text
2. **Never invent** authors, abstracts, keywords, DOIs, impact factors, statistics, dates,
   indexing claims, editorial members, publication numbers or testimonials.
3. Every figure shown in the UI must be computed at build time from the data above.
4. If a section has no source content, **omit it** and report the gap. Do not write filler copy
   that looks like journal policy.
5. Do not edit `archive-data.json` or `content.json`.
6. Do not change the URL of an existing page.

## 3. URLs

Existing URLs must stay byte-identical. Routes are folders named after the URL, including `.html`:

| URL | Route folder |
| --- | --- |
| `/` | `src/routes/+page.svelte` |
| `/archive.html` | `src/routes/archive.html/` |
| `/articles.html` | `src/routes/articles.html/` |
| `/current-issue.html` | `src/routes/current-issue.html/` |
| `/editorial-board.html` | `src/routes/editorial-board.html/` |
| `/author-guideline.html` | `src/routes/author-guideline.html/` |
| `/vision-mission.html` | `src/routes/vision-mission.html/` |
| `/impact-factor.html` | `src/routes/impact-factor.html/` |
| `/contact.html` | `src/routes/contact.html/` |
| `/archive/<issueId>.html` | `src/routes/archive/[issue]/` (new, additive) |

## 4. Data layer

```ts
import { archive } from '$lib/data/archive-index';   // article + issue records (large)
import { content } from '$lib/data/content';         // the journal's page copy (small)
// archive.issues / archive.articles / archive.stats
// content.site | stats | home | impactFactor | currentIssue
//         | editorialBoard | authorGuidelines | visionMission | contact
```

Do not import `$lib/data/journal` from a page — it re-exports both files for build-time scripts and
would pull the whole archive index into that page's client bundle. Content-only pages take their
figures from a `+page.server.ts` load built on `$lib/server/stats`.

Types live in `$lib/data/types.ts`. Helpers:

```ts
import { issueLabel, sortIssues, sortArticles, filterArticles, filterIssues, SEARCH_MIN_LENGTH } from '$lib/data/archive';
import { issuePath, articlePath } from '$lib/data/paths';
import { cn, formatCount, pageRangeValue, formatDateRange, highlight } from '$lib/utils';
```

Server-only helpers (`+page.server.ts` loads, never page components):

```ts
import { getStats } from '$lib/server/stats';              // derived counts, no archive in the client
import { abstractFor } from '$lib/server/abstracts';       // one article's abstract
import { matchCurrentIssue, announcedIssue, recentIssues } from '$lib/server/current-issue';
import { collectCitationMeta } from '$lib/data/citation';  // Highwire citation_* tags
```

`matchCurrentIssue()` resolves the issue announced in `content.json` against the archive index; the
homepage and `/current-issue.html` share it so the announcement has one interpretation. Never build an
issue or article URL by hand — go through `issuePath(id)` / `articlePath(slug)`.

`archive.stats` gives you `articles`, `issues`, `volumes`, `specialEditions`, `firstYear`, `lastYear`,
`years[]`, `articlesByYear[]`, `articlesByVolume[]`, `issuesByYear[]` — the chart series are real
counts, ready for `<BarChart>` / `<AreaChart>`.

`Article` fields: `num, title, authors ('' when the record has none), pages, pdf, hasPdf, year,
volumeLabel, volumeNumber, isSpecial, issueNumber, issueTitle, issueId, slug, abstract`.
**Always check `article.authors` before rendering a byline.**

`slug` is the stable id used for the article URL (`articlePath(slug)` → `/article/<slug>.html`) and
comes from the automation — never derive or edit it. `abstract` is populated **only** on article
pages, from the server-only `$lib/server/abstracts` lookup; on the index pages it is `''`, so check
before rendering and never invent one.

## 5. Components you must reuse (do not edit them)

Layout (already rendered by `+layout.svelte` — never add them per page):
`Header`, `Footer`, `ToTop`, `ModeWatcher`, skip link.

```svelte
<!-- src/lib/components/site/ -->
<Seo title="Articles" description="…" path="/articles.html" jsonLd={[…] } />
<Breadcrumbs items={[{ name: 'Home', href: '/' }, { name: 'Articles' }]} />
<PageHeader eyebrow="Article index" title="Articles" description="…" items={[…]} headingClass="display-1">
  <!-- Optional children render under the lede: a figures <dl>, actions, filters. -->
</PageHeader>

<!-- src/lib/components/ui/ -->
<Button variant="default|navy|outline|secondary|ghost|light|brass|link" size="sm|default|lg|icon|iconSm" href="…">…</Button>
<Badge variant="default|accent|gold|cyan|outline|solid">…</Badge>
<Card variant="default|flat|elevated|interactive" padding="none|sm|default|lg">…</Card>
<Input label="Search" placeholder="…" bind:value={q} name="q" />
<Select label="Year" options={[{ value: 'all', label: 'All years' }]} bind:value={year} />
<Separator />
<Skeleton rows={5} />

<!-- src/lib/components/charts/ -->
<BarChart points={archive.stats.articlesByYear} ariaLabel="…" tone="primary|gold|cyan" onSelect={(point) => …} />
<AreaChart points={archive.stats.issuesByYear} ariaLabel="…" tone="cyan" />

<!-- src/lib/components/archive/ -->
<ArticleCard article={a} query={q} heading={3} showIssue={true} />
<IssueCard issue={issue} open={false} ontoggle={() => {}} issueHref={issuePath(issue.id)} heading={4} />
<YearTimeline years={[{ year: 2025, issues: 3, articles: 9 }]} />
```

`StatCard` and `AnimatedNumber` **were deleted** in the editorial redesign — a figure is a
`<dl>` row (label above a serif value), not a KPI tile, and nothing animates. `Button variant="gold"`
was replaced by `variant="navy"` for manuscript submission; the brass accent survives only as
`brass`/`gold-*` tokens for small editorial marks. If you are reading an older revision of this file
that mentions them, trust this one.

## 6. Design language ("Academic Editorial")

**Light-first.** The default theme is the warm-ivory editorial theme; dark is a layered
charcoal/navy. `ModeWatcher` is set to `defaultMode="light"` and the pre-paint script in `src/app.html`
resolves an unset preference to light rather than to the OS setting.

Use semantic tokens only — no raw hex/`gray-*` classes:

- Surfaces: `bg-background` (ivory), `bg-surface` (white), `bg-surface-muted`, `bg-card`, `border-border`, `border-border-strong`
- Text: `text-foreground`, `text-heading` (ink navy — headings inherit it from the base layer),
  `text-muted-foreground`, `text-subtle-foreground`
- Interactive: `bg-primary text-primary-foreground`, `bg-accent text-accent-foreground`, `border-accent-border`
- Brass — decorative marks only, **never** a primary action: `text-gold-foreground`, `bg-gold-soft`, `border-gold-border`
- Navy band: `band-navy` with `text-band-foreground` / `text-band-muted` (submission CTA, footer)
- Hero: `hero-surface` (warm paper + hairline rule, **not** a dark gradient) and `hero-grid` (a soft wash,
  not the old dot matrix). `text-hero-foreground` / `text-hero-muted` resolve to ink in the light theme
- Type: `display-hero` (journal title), `display-1` (page title), `display-2` (section heading),
  `display-title` (one article's title), `article-title` (listing titles), `reading` (abstract prose),
  `measure` (70ch cap), `eyebrow` (kickers only — never above every heading)
- Structure: `container-page` (1216px), `container-wide`, `section-y` (76–104px section rhythm),
  `article-row` (hairline listing row), `arrow-link` (text link + trailing arrow), `meta-row`
- Brand artwork: `brand-lockup` (horizontal icon + wordmark) and `brand-mark` (icon only). They are
  CSS backgrounds that swap light/dark variants automatically, so always use these spans — never a
  bare `<img>` — and give the surrounding link an `sr-only` name, with the artwork marked
  `aria-hidden="true"`. See `CLAUDE.md` → Brand assets for the regeneration script.
- Helpers: `glass`, `reveal`, `shimmer`, `mark`, `no-scrollbar`, `sr-only`, `no-print`

Rhythm: sections are `container-page` + `section-y`; a list of articles is `article-row`s — hairline
separators, not boxes. **Prefer a rule to a card**, and reach for `Card` only when a block genuinely
needs a boundary. Panels are `rounded-lg` (8px); controls `rounded-md`. Headings take their weight (600)
and their colour from the base layer, so **never** add `font-bold` or a colour utility to an `h1`–`h3`,
and never bake a colour into a `display-*` utility — that is what lets `text-band-foreground` win on
the navy band.

Sticky offsets: the header is a single 5rem (80px) tier with no desktop info strip; in-page anchors use
`scroll-mt-32`/`scroll-mt-40`, and the sticky archive/articles toolbars sit at `top-[5.0625rem]`.

Motion: ≤200ms transitions with `ease-nexus`. The archive charts mount on first disclosure open and
animate once. `prefers-reduced-motion` is handled globally — do not add your own guards for CSS.

## 7. Accessibility checklist (every page)

- Exactly one `<h1>`; headings descend without skipping (`h2` → `h3` → `h4`).
- Every form control has a visible `<label>` (the `Input`/`Select` components render one).
- Icon-only buttons need `aria-label`; toggles use `aria-pressed`; expanders use `aria-expanded` + `aria-controls`.
- Live regions (`aria-live="polite"`) for result counts that change without navigation.
- Keyboard reachable; visible focus (`:focus-visible` is styled globally).
- Never rely on colour alone to convey meaning.

Four failures the 2026 audit actually caught — all four are easy to reintroduce:

- **If a control has visible text, its accessible name must contain that text** (WCAG 2.5.3 Label in
  Name). `aria-label="Download PDF — <title> (opens in a new tab)"` passes; `"Open the PDF of
  <title>"` fails on all 341 article pages because it does not contain "Download PDF".
- **A link inside a sentence must be underlined**, not colour-only (WCAG 1.4.1). The base layer
  underlines `p a:not(:only-child)` and `blockquote a` — so keep `no-underline` off inline prose links.
- **Standalone text links need a 24×24px hit area** (WCAG 2.2 target size): `.arrow-link` sets
  `min-height: 1.5rem`; an inline anchor needs `py-0.5`.
- **Decorative text is still text.** A `·` separator in a near-invisible colour is a contrast failure
  *even with* `aria-hidden="true"`, because a checker still has to measure it — WAVE reported three on
  the homepage while Lighthouse scored 100. Draw separators (`.meta-row` uses a 4px `bg-border-strong`
  dot).

Verify with **WAVE as well as Lighthouse**: WAVE's contrast checker is stricter, and it was WAVE that
found all three real contrast errors above.

## 8. SEO checklist (every page)

```svelte
<Seo
  title="Unique, specific title"           <!-- "| GJMSSH" is appended automatically -->
  description="One factual sentence."
  path="/page.html"
  jsonLd={[breadcrumbNode([{ name: 'Home', path: '/' }, { name: 'Page' }]), webPageNode({…})]}
/>
```

Available builders in `$lib/seo`: `organizationNode`, `periodicalNode`, `websiteNode`, `breadcrumbNode`,
`collectionPageNode`, `webPageNode`, `scholarlyArticleNode`, `publicationIssueNodes`, `personNode`, `graph`.
Emit `Person`/`ScholarlyArticle` nodes **only** for records that exist in the data.

Highwire `citation_*` tags for Google Scholar come from `$lib/data/citation` via
`collectCitationMeta(article, abstract, entries)`, rendered as `<meta>` tags in the article route. Only
emit tags for fields the record actually has — 54 special editions have no volume or issue, so
`citation_volume`/`citation_issue` are deliberately absent for them, and five front-matter records have
no published author line so `citation_author` is absent. Omit; never invent.

Indexation rules:

- **Filtered views are the same document.** `Seo path` is always the clean URL, so `?year=`, `?volume=`,
  `?issue=`, `?sort=` and `?view=` all canonicalise to `/archive.html`. `robots.txt` disallows only
  `?q=` and `?open=` (search-shaped and disclosure-state URLs); `?year=` stays crawlable precisely
  *because* its canonical is then visible to a crawler.
- `/index.html` canonicalises to `/`. The 404 is `noindex` with **no** canonical and no site graph, and
  `/type/` is both `noindex` and `Disallow`ed.
- After touching metadata, run `npm run seo:audit`. It regenerates `docs/seo/*.md` from `build/`. If it
  reports a finding, check whether the *checker* is wrong before changing the site — three of the last
  audit's findings were measurement artifacts (HTML-escaped entities inflating description length, the
  legacy redirect stub counted as an article, and the deliberately-bare 404 counted as invalid schema).

## 9. Report format (end of every task)

1. Files added/changed (paths).
2. Exact commands run and their results (`npm run check`, `npm run build`, plus any verification).
3. Content gaps you deliberately left out (e.g. "no ethics text exists in the repo").
4. Anything you could not verify, and any risk to another agent's files.

## 10. Performance, SEO and ops scripts

| Command | What it does |
| --- | --- |
| `npm run seo:audit` | regenerates `docs/seo/{audit,internal-linking,readiness}.md` from `build/` |
| `node scripts/fetch-fonts.mjs` | re-vendors the webfonts, writing **two** sheets (`font-faces.css` for the two shipped families, `font-faces-harness.css` for the `/type/` comparison families) |
| `npm run cf:plan` / `cf:apply` / `cf:verify` | the Cloudflare edge configuration — read `scripts/cloudflare/README.md` first |
| `npm run clean` | empties `build/`; also runs before every `npm run build`, because `adapter-static` never empties the output directory and a withdrawn or renamed slug would otherwise leave its old page live |

Measured baseline — re-measure after touching the fonts, the CSS volume or the hero:

- **PageSpeed Insights:** homepage 97 mobile / 100 desktop; archive 96 mobile. LCP 2.0–2.1 s, CLS 0,
  TBT 40–50 ms, a11y/best-practices/SEO 100.
- **WAVE:** 0 errors, 0 contrast errors, AIM 9.9/10.
- Lighthouse's performance score for **one unchanged URL varies by up to 13 points** across consecutive
  runs (measured: 86, 95, 99 for the same page). Do not chase a movement smaller than that, and do not
  trade the brand typeface or the CSS cache for it.
- CrUX has no field data for this origin yet; re-check the 75th-percentile CWV once ~28 days of traffic
  have accumulated.
