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
import { issuePath } from '$lib/data/paths';
import { cn, formatCount, formatPages, formatDateRange, highlight } from '$lib/utils';
```

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

<!-- src/lib/components/ui/ -->
<Button variant="default|gold|outline|secondary|ghost|light|link" size="sm|default|lg|icon|iconSm" href="…">…</Button>
<Badge variant="default|accent|gold|cyan|outline|solid">…</Badge>
<Card variant="default|flat|elevated|interactive" padding="none|sm|default|lg">…</Card>
<Input label="Search" placeholder="…" bind:value={q} name="q" />
<Select label="Year" options={[{ value: 'all', label: 'All years' }]} bind:value={year} />
<Separator />
<Skeleton rows={5} />
<AnimatedNumber value={342} />
<StatCard value={342} label="Articles" hint="…" variant="card|hero">{#snippet icon()}<FileText />{/snippet}</StatCard>

<!-- src/lib/components/charts/ -->
<BarChart points={archive.stats.articlesByYear} ariaLabel="…" tone="primary|gold|cyan" onSelect={(point) => …} />
<AreaChart points={archive.stats.issuesByYear} ariaLabel="…" tone="cyan" />

<!-- src/lib/components/archive/ -->
<ArticleCard article={a} query={q} heading={3} showIssue={true} />
<IssueCard issue={issue} open={false} ontoggle={() => {}} issueHref={issuePath(issue.id)} heading={4} />
<YearTimeline years={[{ year: 2025, issues: 3, articles: 9 }]} />
```

`StatCard`/`AnimatedNumber` prerender the **final** number and animate from 1 in the browser;
never hide a value behind an animation.

## 6. Design language ("Academic Nexus")

Use semantic tokens only — no raw hex/`gray-*` classes:

- Surfaces: `bg-background`, `bg-surface`, `bg-surface-muted`, `bg-card`, `border-border`, `border-border-strong`
- Text: `text-foreground`, `text-muted-foreground`, `text-subtle-foreground`
- Brand: `bg-primary text-primary-foreground`, `bg-accent text-accent-foreground`, `border-accent-border`
- Accents: `bg-gold text-gold-foreground`, `bg-cyan-soft text-cyan-foreground`
- Hero: `hero-surface`, `hero-grid`, `text-hero-foreground`, `text-hero-muted`
- Brand artwork: `brand-lockup` (horizontal icon + wordmark) and `brand-mark` (icon only). They are
  CSS backgrounds that swap light/dark variants automatically, so always use these spans — never a
  bare `<img>` — and give the surrounding link an `sr-only` name, with the artwork marked
  `aria-hidden="true"`. See `CLAUDE.md` → Brand assets for the regeneration script.
- Helpers: `container-page`, `container-narrow`, `eyebrow`, `paper-title` (serif article titles),
  `glass`, `reveal`, `shimmer`, `mark`, `no-scrollbar`, `sr-only`, `no-print`

Rhythm: page sections use `container-page` + `py-10`/`py-14`/`py-16`; cards `rounded-xl` + `p-5`/`p-6`;
headings `text-3xl`/`text-4xl` with `font-extrabold tracking-tight`; section eyebrows in `eyebrow`.
Sticky offsets: header is `4.25rem` tall (`6.5rem` with the desktop info strip) — reuse
`scroll-mt-44` / `top-17 lg:top-[6.5rem]` like the archive page.

Motion: subtle only (≤300ms transitions, `ease-nexus`); charts/counters animate once on mount.
`prefers-reduced-motion` is already handled globally — do not add your own guards for CSS.

## 7. Accessibility checklist (every page)

- Exactly one `<h1>`; headings descend without skipping (`h2` → `h3` → `h4`).
- Every form control has a visible `<label>` (the `Input`/`Select` components render one).
- Icon-only buttons need `aria-label`; toggles use `aria-pressed`; expanders use `aria-expanded` + `aria-controls`.
- Live regions (`aria-live="polite"`) for result counts that change without navigation.
- Keyboard reachable; visible focus (`:focus-visible` is styled globally).
- Never rely on colour alone to convey meaning.

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

## 9. Report format (end of every task)

1. Files added/changed (paths).
2. Exact commands run and their results (`npm run check`, `npm run build`, plus any verification).
3. Content gaps you deliberately left out (e.g. "no ethics text exists in the repo").
4. Anything you could not verify, and any risk to another agent's files.
