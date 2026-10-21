---
name: GJMSSH — Academic Editorial
description: The journal website of the Global Journal of Management, Social Sciences and Humanities — warm ivory paper, ink navy, one muted teal action.
colors:
  ink-navy: "#102a3a"
  ink-body: "#172b3a"
  warm-ivory: "#faf9f6"
  paper-white: "#ffffff"
  paper-muted: "#f1f2f0"
  paper-strong: "#e7eae7"
  academic-teal: "#24676b"
  teal-deep: "#1c5559"
  teal-hover: "#1c5559"
  teal-wash: "#e9f1f0"
  slate-muted: "#55636b"
  slate-subtle: "#5f6d75"
  rule: "#e1e5e4"
  rule-strong: "#ccd3d1"
  brass: "#b49a69"
  brass-ink: "#7d6432"
  brass-wash: "#f4efe3"
  band-navy: "#102a3a"
  band-navy-deep: "#0c2130"
  band-text: "#f4f7f7"
  band-muted: "#a3b6c0"
  dark-canvas: "#0e1519"
  dark-surface: "#131d22"
  dark-primary: "#5aa9ad"
  dark-heading: "#f2f6f7"
typography:
  display-hero:
    fontFamily: "Source Serif 4, Iowan Old Style, Palatino Linotype, Palatino, Georgia, serif"
    fontSize: "clamp(2.25rem, 1.6rem + 2.6vw, 3.5rem)"
    fontWeight: 600
    lineHeight: 1.06
    letterSpacing: "-0.018em"
  display-1:
    fontFamily: "Source Serif 4, Georgia, serif"
    fontSize: "clamp(2rem, 1.65rem + 1.5vw, 2.85rem)"
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: "-0.015em"
  display-2:
    fontFamily: "Source Serif 4, Georgia, serif"
    fontSize: "clamp(1.5rem, 1.3rem + 0.85vw, 2.05rem)"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  article-title:
    fontFamily: "Source Serif 4, Georgia, serif"
    fontSize: "clamp(1.1875rem, 1.12rem + 0.35vw, 1.375rem)"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-0.006em"
  body:
    fontFamily: "Source Sans 3, system-ui, -apple-system, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.65
  reading:
    fontFamily: "Source Sans 3, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.8
  label:
    fontFamily: "Source Sans 3, system-ui, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "0.14em"
rounded:
  control: "7px"
  panel: "8px"
  pill: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "24px"
  xl: "48px"
  section: "clamp(3.25rem, 2.2rem + 3.2vw, 6.5rem)"
components:
  button-primary:
    backgroundColor: "{colors.academic-teal}"
    textColor: "{colors.paper-white}"
    rounded: "{rounded.control}"
    height: "44px"
    padding: "0 20px"
  button-primary-hover:
    backgroundColor: "{colors.teal-hover}"
    textColor: "{colors.paper-white}"
    rounded: "{rounded.control}"
  button-submit:
    backgroundColor: "{colors.band-navy}"
    textColor: "{colors.paper-white}"
    rounded: "{rounded.control}"
    height: "44px"
    padding: "0 20px"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.ink-body}"
    rounded: "{rounded.control}"
    height: "44px"
    padding: "0 20px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.slate-muted}"
    rounded: "{rounded.control}"
    height: "44px"
    padding: "0 20px"
  button-small:
    backgroundColor: "transparent"
    textColor: "{colors.ink-body}"
    rounded: "{rounded.control}"
    height: "36px"
    padding: "0 14px"
  input-search:
    backgroundColor: "{colors.paper-white}"
    textColor: "{colors.ink-body}"
    rounded: "{rounded.control}"
    height: "36px"
    padding: "0 12px"
  card-record:
    backgroundColor: "{colors.paper-white}"
    textColor: "{colors.ink-body}"
    rounded: "{rounded.panel}"
    padding: "24px"
---

# Design System: GJMSSH — Academic Editorial

## Overview

**Creative North Star: "The Offprint"**

The system should read as a journal's offprint: warm paper, an ink-navy serif voice, hairline rules instead of boxes, and exactly one muted teal marker telling you where the action is. The look is committed to the academic record rather than a dashboard — the interface is mostly typography and rules, and its largest ornament is a published article's own title.

Density is editorial, not dense: generous section rhythm (76–104px), a 1216px measure of content, and reading columns held at ~70 characters. Colour is restrained to four voices — ivory paper, ink navy, muted teal, brass — with brass reserved for small editorial marks and never for an action. The world is light-first by identity: the default theme is warm ivory even when the operating system prefers dark, and the dark theme is a layered charcoal-navy restatement of the same hierarchy, not a separate brand.

Depth comes from tone and hairlines, not from shadow. Cards appear only where a block genuinely needs a boundary (a record panel, the citation card, a filter bar); lists of articles are hairline rows. Decoration is refused: no gradient text, no glow, no card grids standing in for a record list.

**Key Characteristics:**
- Warm ivory paper (`#faf9f6`) with a white surface for panels; dark theme layers `#0e1519` → `#131d22`.
- Ink navy headings (`#102a3a`) in Source Serif 4 at weight 600; Source Sans 3 for everything functional.
- One teal action per view (`#24676b`); the manuscript CTA keeps its own ink navy.
- Hairline `1px` rules (`#e1e5e4`, `#ccd3d1`) at 8px panel radius and 7px control radius.
- 76–104px section rhythm, articles as rows, charts demoted behind disclosure.

## Colors

A paper-and-ink palette with a single muted teal signal and a restrained brass accent; every value is a semantic token, never a raw hue utility.

### Primary
- **Muted Academic Teal** (`#24676b`): links, the primary button, the active nav rule, chart series 1, focus ring. Deepened to **Teal Ink** (`#1c5559`) on hover and for accent text on the teal wash.
- **Teal Wash** (`#e9f1f0`): the selected/active row background (timeline year, current issue number) and the accent callout surface, always paired with Teal Ink text.

### Secondary
- **Restrained Brass** (`#b49a69`): small editorial marks only — the leading number on a guideline step, the publication-fee callout rule, chart series 3. Its ink form (`#7d6432`) is the only brass text on paper, and its wash (`#f4efe3`) is a callout background.

### Neutral
- **Warm Ivory** (`#faf9f6`): the page canvas.
- **Paper White** (`#ffffff`): panels, inputs, the record card.
- **Paper Muted** (`#f1f2f0`): the page-header band, alternating sections, hover fills.
- **Ink Navy** (`#102a3a`): headings, and the surface of the submission band and footer.
- **Body Ink** (`#172b3a`): running text.
- **Slate Muted / Slate Subtle** (`#55636b` / `#5f6d75`): secondary prose and metadata. Subtle is a 5.07:1 reading of the same grey, chosen so 13px metadata still clears AA.
- **Rule / Rule Strong** (`#e1e5e4` / `#ccd3d1`): the only dividers in the system; `1px` in the regular weight, `2px` where a table or list needs a header edge.

### Named Rules
**The One Teal Rule.** Exactly one teal action is visible per viewport. A second teal button on the same screen is a hierarchy bug, not a style choice.

**The Brass Is Never A Button Rule.** Brass marks things; it never invites a click. No brass button, no brass link.

**The Band Is Navy Rule.** The submission band and the footer are the only full-bleed navy surfaces in the light theme, and they carry their own text pair (`--band-foreground` / `--band-muted`, 7.08:1). Never derive them from `--heading`, which flips to near-white in dark mode.

## Typography

**Display Font:** Source Serif 4 (with Iowan Old Style, Palatino, Georgia)
**Body Font:** Source Sans 3 (with system-ui, Segoe UI, Roboto, Helvetica Neue, Arial)

**Character:** A scholarly pairing: a transitional serif at weight 600 for the masthead, section headings and article titles, and a humanist sans for every functional string — metadata, labels, controls, prose. Both ship self-hosted as variable files (300–700) with latin-ext, preloaded, `font-display: swap`.

### Hierarchy
- **Display Hero** (600, `clamp(2.25rem, 1.6rem + 2.6vw, 3.5rem)`, 1.06): the journal's own name on the home page only.
- **Display 1** (600, `clamp(2rem, 1.65rem + 1.5vw, 2.85rem)`, 1.1): page titles inside `PageHeader`.
- **Display 2** (600, `clamp(1.5rem, 1.3rem + 0.85vw, 2.05rem)`, 1.2): section headings; always separated from its content by a `border-b border-border-strong` rule.
- **Display Title** (600, `clamp(1.75rem, 1.45rem + 1.3vw, 2.5rem)`, 1.14): one article's title on its own page, capped at 32ch on large screens because published titles run long.
- **Article Title** (600, `clamp(1.1875rem, 1.12rem + 0.35vw, 1.375rem)`, 1.3): titles inside article rows and issue lists.
- **Body** (400, 1rem, 1.65): interface copy and metadata; **Reading** (400, 1.0625rem, 1.8) for abstracts and policy prose, capped by `.measure` at 70ch.
- **Label / Eyebrow** (600, 0.6875rem, 0.14em tracking, uppercase): the keyword above a page `H1` and the small group label inside an aside or a form field.

### Named Rules
**The Heading Owns Its Weight Rule.** Headings inherit 600 and their colour from the base layer. Never add `font-bold` or a colour utility to an `h1`–`h3`, and never bake a colour into a `display-*` utility — that is what lets `text-band-foreground` win on the navy band.

**The One Keyword Rule.** At most one eyebrow above a page heading; never one above every section heading. It names the page's category ("Article index", "For authors"), not a decoration.

**The 70-Character Rule.** Prose carries `.measure` (70ch). It applies to the element that bears it — not just `<p>` — and it is what keeps guideline definitions and list values from running to 118 characters.

## Layout

A single 1216px content column (`container-page`, max-width 76rem, gutters `clamp(1.125rem, 4vw, 3rem)`) with a 52rem `container-narrow` for prose-only blocks. Vertical rhythm between major sections is `section-y`: `clamp(3.25rem, 2.2rem + 3.2vw, 6.5rem)` — 104px at desktop, 52px on a phone.

Two-column patterns, all `grid` and none of them floating: page header `1.15fr / 1fr` (title against a figures list), article detail `minmax(0,1fr) / 20rem` with the record card in a sticky aside at `top: 7.5rem`, archive `12rem / minmax(0,1fr)` with the sticky year rail, guidelines `15rem / minmax(0,1fr)` with the sticky contents rail. Everything collapses to one column below `lg` (1024px).

Toolbars (article index, archive browser) are sticky at `top: 5.0625rem` under the 5rem header, with in-page anchors using `scroll-mt-32`/`scroll-mt-40`. Filter controls sit in a `grid` that is 2-up on a phone and a single 5-item row from `lg`; all controls in a toolbar share one height (36px) so the row reads as one instrument. The header is a single 80px tier — no desktop info strip.

## Elevation & Depth

Flat by default, depth by tone. Three shadows exist (`--shadow-sm` 0 1px 2px, `--shadow-md` 0 3px 10px -4px, `--shadow-lg` 0 16px 36px -20px, all in ink navy at 5–22% alpha) and they are used on controls and raised panels only; sections never float. Hierarchy between blocks is carried by the tonal steps of the paper (ivory → white → muted) and by `1px`/`2px` rules.

### Named Rules
**The Rule Before The Card Rule.** A list is hairline rows (`article-row`), not a card grid. `Card` appears only where a block genuinely needs a boundary: the record panel, the citation card, a filter bar, a statistics disclosure. Nested cards are always wrong.

**The No Glow Rule.** No coloured halos, no zero-offset shadows, no gradient text. If something needs emphasis it gets weight, size or a rule.

## Shapes

Rectilinear with a small radius: panels `8px`, controls `7px`, pills `9999px` (badges, chips, the mobile year rail). Nothing is clipped, tilted or masked. Borders are hairlines; the strongest edge in the system is a `2px` rule under a section heading and the `1px` `border-border-strong` frame of a panel.

The one recurring silhouette is the editorial row: a quiet numeric rail (2.25rem), a serif title, a metadata line, and an outlined PDF control at the far right — on a hairline separator, never in a box.

## Components

### Buttons
- **Shape:** 7px radius, no glow, no scale-on-press, 200ms `ease-nexus` on colour and border.
- **Primary:** teal `#24676b`, white text, 44px tall, `0 20px` padding, weight 600, 15px.
- **Submit (`navy`):** ink navy `#102a3a` with white text — reserved for the manuscript-submission action, the single most authoritative control on any page.
- **Outline:** transparent with a `1px` `#ccd3d1` edge; hover shifts the border to teal and the fill to the teal wash.
- **Ghost:** text-only, muted slate, for tertiary routes ("Search all articles").
- **Light:** translucent white on the navy band only.
- **Small / Icon:** 36px and 44px square; icon-only buttons always carry `aria-label`.
- **Focus:** 2px ring at 45% ring colour with a 2px offset in the page background.

### Inputs & Selects
- **Style:** white fill, `1px` `#ccd3d1` edge, 7px radius, 36px tall, `0 12px` padding; the search field carries a leading Lucide magnifier at 16px.
- **Label:** the eyebrow style above the control, always visible — never a placeholder acting as a label.
- **Focus:** teal border plus a 2px ring at 30%; hover darkens the edge to the accent border.
- **Select:** native `<select>` with `appearance: none` and a 16px chevron drawn in SVG at the right inset.

### Cards / Panels
- **Corner:** 8px. **Background:** white on paper, `#131d22` on dark.
- **Border:** `1px` `border-border`; the record card uses `bg-card p-6` and separates rows with `border-t` rules between `<dt>`/`<dd>` pairs.
- **Shadow:** none at rest; `--shadow-sm` only where a control needs to lift off the paper.

### Navigation
- **Desktop header:** 80px, brand lockup at left (CSS background that swaps light/dark artwork), seven nav links in 15px sans with a 2px teal underline on the current page, then search, mail, the navy Submit button, and a three-way theme control (light / system / dark).
- **Mobile:** the wordmark reduces to the icon mark; search and a 44px menu button remain. The theme control and submit live inside the menu panel.
- **Footer:** the navy band in four columns — journal identity with the ISSN pair, then Discover / For authors / Information. Every link resolves to a real page or an explained mailto.

### Article Row (signature)
A hairline `article-row`: a 2.25rem numeric rail in serif, the title in `article-title`, authors in muted sans, and a `meta-row` line ("Vol 12 · Issue 1 · 2026", pages, "Open access") whose separators are drawn `4px` dots rather than `·` characters. The PDF control is an outlined small button at the far right; "View abstract" is a disclosure toggle, not a link.

### Record Card (signature)
The article's citation identity as a `<dl>`: journal, print ISSN, online ISSN, volume, issue, year, pages, article number — label above value, hairline between each. It is the component that makes every article a first-class citation target, so the ISSN pair is always shown together.

## Do's and Don'ts

### Do:
- **Do** use semantic tokens (`bg-surface`, `text-muted-foreground`, `border-border-strong`) and never a raw hex or `gray-*` utility.
- **Do** reproduce the journal's published copy verbatim, and omit a section entirely when the journal has no published text for it.
- **Do** keep the primary teal to one instance per viewport, and give the manuscript CTA the navy variant.
- **Do** draw separators with a `4px` dot element (`.meta-row`), not a `·` character.
- **Do** keep body and metadata contrast at AA or better — 4.5:1 for text under 24px, including 13px metadata in `--subtle-foreground`.
- **Do** hold prose at `.measure` (70ch) and let the reading size be 17px/1.8.
- **Do** keep every control in a toolbar the same height, and every interactive target at least 24×24px.

### Don't:
- **Don't** add `font-bold` or a colour utility to an `h1`–`h3`, and don't bake colour into a `display-*` utility.
- **Don't** invent scope, metrics, dates, featured status or author claims to fill a layout — if the data file has no field, the UI does not show it.
- **Don't** put a brass-coloured button or link anywhere; brass is a mark, never an action.
- **Don't** wrap article lists in cards, and never nest cards inside cards.
- **Don't** use a gradient as decoration, gradient text, a coloured halo, or a zero-offset shadow.
- **Don't** add a second eyebrow above section headings; one keyword per page heading only.
- **Don't** let a `<dd>` or `<li>` lose its measure — the utility applies to the element, and a full-width definition line runs to 118 characters.
