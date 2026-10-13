# AI-SEO readiness — GJMSSH

**Overall: 87/100** (unweighted mean of the ten criteria below; every score is derived from the built site.)

| Criterion | Score | Basis |
| --- | --- | --- |
| Crawlability & indexing | 100/100 | robots.txt with AI policy, 401-URL sitemap, canonicals on every indexable page, branded 404, no orphans |
| Structured data | 100/100 | Organization, Periodical, WebSite, Breadcrumb, CollectionPage, PublicationIssue, ScholarlyArticle, Person |
| Academic metadata | 100/100 | Highwire citation_* tags on every article page |
| Metadata hygiene | 97/100 | Unique titles, 50–160 char descriptions, OG + Twitter cards |
| Social previews | 100/100 | OG + Twitter tags with a 1200×630 card on every indexable page (per-article cards listed under gaps) |
| Internal linking | 100/100 | 0 orphans, 0 pages deeper than 3 clicks |
| Performance | 92/100 | Median page 9 KB gzipped, single 9 KB CSS, no webfonts, no framework on content pages |
| AI/answer-engine access | 85/100 | llms.txt, named AI crawler allow-list, abstracts verbatim in HTML, no FAQ layer yet |
| E-E-A-T / entity | 70/100 | Journal entity + editorial roster + guidelines + registered ISSNs (footer, citation_issn, Periodical JSON-LD, llms.txt); missing policy pages (ethics, peer review, copyright, privacy, data sharing), no sameAs profiles |
| Topical authority | 30/100 | No research-area landing pages; articles carry no subject classification |

## What the remaining points need

| Gap | Blocked by |
| --- | --- |
| E-E-A-T policy layer | Journal must publish ethics, peer-review, copyright, open-access, privacy, data-sharing and conflict-of-interest text — none exists in the repository |
| ISSN | **Resolved.** The registered pair (print 2520-7113, online 2520-7121) is published on every page: the footer, the indexing page, `citation_issn` on article pages, `Periodical` JSON-LD and `llms.txt`. Both numbers and their provenance are recorded in `SITE.issn` |
| Entity reconciliation | External profile URLs (Scholar, DOAJ, ResearchGate, Crossref) for `sameAs` |
| Per-article social images | Build-time image rendering (adds a native dependency to CI) |
| Answer-engine excerpts | A signed-off FAQ whose answers reuse the journal's published wording |
| Topical authority | A subject classification the editors agree on, so research-area pages can list real articles |
| Author affiliations / keywords / references | Not extracted yet — roadmap item for gjms-automation |
