# AI-SEO readiness — GJMSSH

**Overall: 88/100** (unweighted mean of the ten criteria below; every score is derived from the built site.)

| Criterion | Score | Basis |
| --- | --- | --- |
| Crawlability & indexing | 100/100 | robots.txt with AI policy, 400-URL sitemap, canonicals on every indexable page, branded 404, no orphans |
| Structured data | 100/100 | Organization, Periodical, WebSite, Breadcrumb, CollectionPage, PublicationIssue, ScholarlyArticle, Person |
| Academic metadata | 100/100 | Highwire citation_* tags on every article page |
| Metadata hygiene | 100/100 | Unique titles, 50–160 char descriptions, OG + Twitter cards |
| Social previews | 100/100 | OG + Twitter tags with a 1200×630 card on every indexable page (per-article cards listed under gaps) |
| Internal linking | 100/100 | 0 orphans, 0 pages deeper than 3 clicks |
| Performance | 95/100 | Median page 9 KB gzipped, 2 stylesheets (app + self-hosted font sheet), 2 preloaded variable webfonts, no third-party origin |
| AI/answer-engine access | 85/100 | llms.txt, named AI crawler allow-list, abstracts verbatim in HTML, no FAQ layer yet |
| E-E-A-T / entity | 70/100 | Journal entity + editorial roster + guidelines + registered ISSNs on 100% of indexable pages (footer, citation_issn, Periodical JSON-LD, llms.txt) + no policy layer (ethics, peer review, copyright, privacy, data sharing); no sameAs profiles |
| Topical authority | 30/100 | No research-area landing pages; articles carry no subject classification |

## What the remaining points need

| Gap | Blocked by |
| --- | --- |
| E-E-A-T policy layer | Journal must publish ethics, peer-review, copyright, open-access, privacy, data-sharing and conflict-of-interest text — none exists in the repository |
| ISSN | **Resolved.** The registered pair is published on every indexable page: the footer, the indexing page, `citation_issn` on article pages, `Periodical` JSON-LD and `llms.txt`. Both numbers and their provenance live in `SITE.issn`, and this row is computed from the build |
| Entity reconciliation | External profile URLs (Scholar, DOAJ, ResearchGate, Crossref) for `sameAs` |
| Per-article social images | Build-time image rendering (adds a native dependency to CI) |
| Answer-engine excerpts | A signed-off FAQ whose answers reuse the journal's published wording |
| Topical authority | A subject classification the editors agree on, so research-area pages can list real articles |
| Author affiliations / keywords / references | Not extracted yet — roadmap item for gjms-automation |
