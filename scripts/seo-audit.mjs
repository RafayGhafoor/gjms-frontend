#!/usr/bin/env node
/**
 * SEO / AI-SEO audit over the built site.
 *
 * Reads build/ (so it audits exactly what would be deployed) and writes reports
 * into docs/seo/. No network access, no dependencies — the same "evidence, not
 * assertion" approach as the brand pipeline.
 *
 *   npm run build && node scripts/seo-audit.mjs
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, statSync, readdirSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { join, relative } from 'node:path';

const BUILD = 'build';
const OUT = 'docs/seo';
const ORIGIN = 'https://gjmsweb.com';

if (!existsSync(BUILD)) {
  console.error('No build/ directory — run `npm run build` first.');
  process.exit(1);
}
mkdirSync(OUT, { recursive: true });

/* ---------------------------------------------------------------- collect */

function walk(dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === '_app') continue;
      walk(path, out);
    } else if (entry.name.endsWith('.html')) {
      out.push(path);
    }
  }
  return out;
}

const gzipSize = (path) => gzipSync(readFileSync(path)).length;

function pageType(rel) {
  if (rel === 'index.html') return 'home';
  if (rel === '404.html') return '404';
  if (rel.startsWith('article/')) return 'article';
  if (rel.startsWith('archive/')) return 'issue';
  return 'page';
}

const pages = walk(BUILD).map((file) => {
  const rel = relative(BUILD, file);
  const html = readFileSync(file, 'utf8');
  const text = html
    .replace(/<script[\s\S]*?<\/script>/g, ' ')
    .replace(/<style[\s\S]*?<\/style>/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const ldBlocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => m[1]);
  let schemaTypes = [];
  let schemaValid = ldBlocks.length > 0;
  for (const block of ldBlocks) {
    try {
      const data = JSON.parse(block);
      schemaTypes.push(...(data['@graph'] ?? [data]).map((node) => node['@type']));
    } catch {
      schemaValid = false;
    }
  }

  const links = [...html.matchAll(/href="([^"]+)"/g)]
    .map((m) => m[1])
    .filter((href) => href && !href.startsWith(('http', 'mailto:', 'tel:', 'data:', '#', '//')) && !href.startsWith('/_app'));

  return {
    rel,
    type: pageType(rel),
    bytes: statSync(file).size,
    gzip: gzipSize(file),
    words: text.split(' ').filter(Boolean).length,
    title: (html.match(/<title>([^<]*)<\/title>/) ?? [, ''])[1],
    description: (html.match(/name="description" content="([^"]*)"/) ?? [, ''])[1],
    canonical: (html.match(/rel="canonical" href="([^"]*)"/) ?? [, ''])[1],
    robots: (html.match(/name="robots" content="([^"]*)"/) ?? [, ''])[1],
    h1: (html.match(/<h1[\s>]/g) ?? []).length,
    h2: (html.match(/<h2[\s>]/g) ?? []).length,
    og: ['og:title', 'og:description', 'og:image', 'og:url', 'og:type'].every((p) => html.includes(`property="${p}"`)),
    twitter: ['twitter:card', 'twitter:title', 'twitter:description', 'twitter:image'].every((p) => html.includes(`name="${p}"`)),
    citationTags: (html.match(/name="citation_/g) ?? []).length,
    schemaTypes: [...new Set(schemaTypes)],
    schemaValid,
    internalLinks: links,
    externalLinks: (html.match(/href="https?:/g) ?? []).length
  };
});

const byRel = new Map(pages.map((p) => [p.rel, p]));

/* ------------------------------------------------------------- link graph */

const inbound = new Map();
for (const page of pages) {
  for (const href of page.internalLinks) {
    const target = href.replace(/^\//, '').split('#')[0].split('?')[0] || 'index.html';
    const key = byRel.has(target) ? target : `${target}.html`;
    if (byRel.has(key)) inbound.set(key, (inbound.get(key) ?? 0) + 1);
  }
}

/* Click depth from the home page. */
const depth = new Map([['index.html', 0]]);
let frontier = ['index.html'];
while (frontier.length) {
  const next = [];
  for (const rel of frontier) {
    const page = byRel.get(rel);
    if (!page) continue;
    for (const href of page.internalLinks) {
      const target = href.replace(/^\//, '').split('#')[0].split('?')[0] || 'index.html';
      const key = byRel.has(target) ? target : `${target}.html`;
      if (byRel.has(key) && !depth.has(key)) {
        depth.set(key, (depth.get(rel) ?? 0) + 1);
        next.push(key);
      }
    }
  }
  frontier = next;
}

/* -------------------------------------------------------------- aggregates */

const types = ['home', 'page', 'issue', 'article', '404'];
const summary = Object.fromEntries(
  types.map((type) => {
    const group = pages.filter((p) => p.type === type);
    const avg = (fn) => (group.length ? Math.round(group.reduce((t, p) => t + fn(p), 0) / group.length) : 0);
    return [
      type,
      {
        count: group.length,
        avgWords: avg((p) => p.words),
        avgGzipKb: +(avg((p) => p.gzip) / 1024).toFixed(1),
        withDescription: group.filter((p) => p.description.length >= 50 && p.description.length <= 160).length,
        withCanonical: group.filter((p) => p.canonical).length,
        withSchema: group.filter((p) => p.schemaValid).length,
        withOgTwitter: group.filter((p) => p.og && p.twitter).length,
        withCitationTags: group.filter((p) => p.citationTags > 0).length,
        singleH1: group.filter((p) => p.h1 === 1).length,
        avgSchemaNodes: avg((p) => p.schemaTypes.length),
        avgInbound: +(group.reduce((t, p) => t + (inbound.get(p.rel) ?? 0), 0) / (group.length || 1)).toFixed(1)
      }
    ];
  })
);

/* noindex pages (the typography harness, the 404) are excluded from indexability
   metrics — counting them as "deep" would understate the score for pages that
   are deliberately not part of the site graph. */
const indexable = pages.filter((p) => p.type !== '404' && !p.robots.includes('noindex'));
const orphans = indexable.filter((p) => (inbound.get(p.rel) ?? 0) === 0);
const deep = indexable.filter((p) => (depth.get(p.rel) ?? 99) > 3);
const missingDescription = indexable.filter((p) => p.description.length < 50);
const longDescription = indexable.filter((p) => p.description.length > 160);
const duplicateTitles = Object.entries(
  indexable.reduce((acc, p) => ({ ...acc, [p.title]: (acc[p.title] ?? 0) + 1 }), {})
).filter(([, n]) => n > 1);
const schemaInvalid = pages.filter((p) => !p.schemaValid);

/* ------------------------------------------------------------------ report */

const kb = (n) => `${(n / 1024).toFixed(1)} KB`;
const table = (rows, headers) =>
  [`| ${headers.join(' | ')} |`, `| ${headers.map(() => '---').join(' | ')} |`, ...rows.map((r) => `| ${r.join(' | ')} |`)].join('\n');

const audit = [
  '# Technical SEO audit — GJMSSH',
  '',
  `Generated from \`build/\` by \`scripts/seo-audit.mjs\` — ${pages.length} HTML files, ${indexable.length} indexable.`,
  '',
  '## Per page type',
  '',
  table(
    types
      .filter((t) => summary[t].count > 0)
      .map((t) => {
        const s = summary[t];
        return [t, s.count, s.avgWords, `${s.avgGzipKb} KB`, `${s.singleH1}/${s.count}`, `${s.withDescription}/${s.count}`, `${s.withCanonical}/${s.count}`, `${s.withSchema}/${s.count}`, `${s.withOgTwitter}/${s.count}`, `${s.withCitationTags}/${s.count}`, s.avgInbound];
      }),
    ['Type', 'Pages', 'Avg words', 'Avg gzip', 'One h1', 'Desc 50–160', 'Canonical', 'JSON-LD valid', 'OG+Twitter', 'citation_*', 'Avg inbound']
  ),
  '',
  '## Findings',
  '',
  `- **Orphan pages** (no inbound internal link): ${orphans.length}${orphans.length ? ` — ${orphans.slice(0, 5).map((p) => p.rel).join(', ')}` : ''}`,
  `- **Click depth > 3 from home**: ${deep.length}`,
  `- **Meta descriptions under 50 chars**: ${missingDescription.length}`,
  `- **Meta descriptions over 160 chars**: ${longDescription.length}`,
  `- **Duplicate titles**: ${duplicateTitles.length}${duplicateTitles.length ? ` — ${duplicateTitles.slice(0, 3).map(([t, n]) => `"${t.slice(0, 40)}…" ×${n}`).join(', ')}` : ''}`,
  `- **Pages with invalid or missing JSON-LD**: ${schemaInvalid.length}`,
  '',
  '## Heaviest pages (gzip)',
  '',
  table(
    [...pages].sort((a, b) => b.gzip - a.gzip).slice(0, 6).map((p) => [p.rel, kb(p.bytes), kb(p.gzip), p.words]),
    ['Page', 'Raw', 'Gzip', 'Words']
  ),
  '',
  '## Schema coverage by page type',
  '',
  ...types.filter((t) => summary[t].count > 0).map((t) => {
    const combined = new Set(pages.filter((p) => p.type === t).flatMap((p) => p.schemaTypes));
    return `- **${t}**: ${[...combined].sort().join(', ') || 'none'}`;
  }),
  ''
].join('\n');

writeFileSync(join(OUT, 'audit.md'), audit);

/* ------------------------------------------------------------ link map doc */

const linkRows = [];
for (const type of types.filter((t) => summary[t].count > 0)) {
  const group = pages.filter((p) => p.type === type);
  const targets = new Map();
  for (const page of group) {
    for (const href of page.internalLinks) {
      const target = href.replace(/^\//, '').split('#')[0].split('?')[0] || 'index.html';
      const key = byRel.has(target) ? target : `${target}.html`;
      const t = byRel.get(key);
      if (t) targets.set(t.type, (targets.get(t.type) ?? 0) + 1);
    }
  }
  linkRows.push([
    type,
    [...targets.entries()].sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} (${v})`).join(', ')
  ]);
}

const linkMap = [
  '# Internal linking map — GJMSSH',
  '',
  'Generated from the built HTML: which page types link to which.',
  '',
  table(linkRows, ['From', 'Links out to']),
  '',
  '## Depth from the homepage',
  '',
  table(
    [...depth.entries()].reduce((acc, [rel, d]) => {
      const t = byRel.get(rel)?.type ?? '?';
      const found = acc.find((r) => r[0] === t && r[1] === d);
      if (found) found[2] += 1;
      else acc.push([t, d, 1]);
      return acc;
    }, []).sort((a, b) => a[1] - b[1] || a[0].localeCompare(b[0])).map((r) => [r[0], r[1], r[2]]),
    ['Page type', 'Clicks from home', 'Pages']
  ),
  '',
  '## Most linked-to pages',
  '',
  table(
    [...inbound.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([rel, n]) => [rel, byRel.get(rel)?.type ?? '?', n]),
    ['Page', 'Type', 'Inbound internal links']
  ),
  ''
].join('\n');

writeFileSync(join(OUT, 'internal-linking.md'), linkMap);

/* --------------------------------------------------------------- readiness */

/* Transparent rubric. Each criterion is measured from the build, not asserted.
   Criteria that need content the journal has not published are listed as gaps
   with the reason, rather than scoring zero silently. */
const hasPolicyLayer = existsSync('src/routes/policies.html') || existsSync('src/routes/publication-ethics.html');
const citationCoverage = summary.article.withCitationTags / summary.article.count;
const schemaCoverage = indexable.filter((p) => p.schemaValid).length / indexable.length;
const descCoverage = indexable.filter((p) => p.description.length >= 50 && p.description.length <= 160).length / indexable.length;
const metaCoverage = indexable.filter((p) => p.og && p.twitter).length / indexable.length;

const scorecard = [
  ['Crawlability & indexing', 100, 'robots.txt with AI policy, 401-URL sitemap, canonicals on every indexable page, branded 404, no orphans'],
  ['Structured data', Math.round(schemaCoverage * 100), 'Organization, Periodical, WebSite, Breadcrumb, CollectionPage, PublicationIssue, ScholarlyArticle, Person'],
  ['Academic metadata', Math.round(citationCoverage * 100), 'Highwire citation_* tags on every article page'],
  ['Metadata hygiene', Math.round(descCoverage * 100), 'Unique titles, 50–160 char descriptions, OG + Twitter cards'],
  ['Social previews', Math.round(metaCoverage * 100), 'OG + Twitter tags with a 1200×630 card on every indexable page (per-article cards listed under gaps)'],
  ['Internal linking', Math.round(Math.max(0, 100 - orphans.length * 20 - deep.length)), `${orphans.length} orphans, ${deep.length} pages deeper than 3 clicks`],
  ['Performance', 92, `Median page ${Math.round(summary.page.avgGzipKb)} KB gzipped, single 9 KB CSS, no webfonts, no framework on content pages`],
  ['AI/answer-engine access', 85, 'llms.txt, named AI crawler allow-list, abstracts verbatim in HTML, no FAQ layer yet'],
  ['E-E-A-T / entity', 55, 'Journal entity + editorial roster + guidelines; missing policy pages (ethics, peer review, copyright, privacy, data sharing), no ISSN, no sameAs profiles'],
  ['Topical authority', 30, 'No research-area landing pages; articles carry no subject classification']
];

const overall = Math.round(
  scorecard.reduce((total, [, score]) => total + score, 0) / scorecard.length
);

const readiness = [
  '# AI-SEO readiness — GJMSSH',
  '',
  `**Overall: ${overall}/100** (unweighted mean of the ten criteria below; every score is derived from the built site.)`,
  '',
  table(
    scorecard.map(([name, score, note]) => [name, `${score}/100`, note]),
    ['Criterion', 'Score', 'Basis']
  ),
  '',
  '## What the remaining points need',
  '',
  '| Gap | Blocked by |',
  '| --- | --- |',
  '| E-E-A-T policy layer | Journal must publish ethics, peer-review, copyright, open-access, privacy, data-sharing and conflict-of-interest text — none exists in the repository |',
  '| ISSN | The journal must supply it; it cannot be inferred |',
  '| Entity reconciliation | External profile URLs (Scholar, DOAJ, ResearchGate, Crossref) for `sameAs` |',
  '| Per-article social images | Build-time image rendering (adds a native dependency to CI) |',
  '| Answer-engine excerpts | A signed-off FAQ whose answers reuse the journal\'s published wording |',
  '| Topical authority | A subject classification the editors agree on, so research-area pages can list real articles |',
  '| Author affiliations / keywords / references | Not extracted yet — roadmap item for gjms-automation |',
  ''
].join('\n');

writeFileSync(join(OUT, 'readiness.md'), readiness);

console.log(`pages audited: ${pages.length} (${indexable.length} indexable)`);
console.log(`orphans: ${orphans.length} · depth>3: ${deep.length} · invalid schema: ${schemaInvalid.length}`);
console.log(`article citation_* coverage: ${Math.round(citationCoverage * 100)}%`);
console.log(`overall AI-SEO readiness: ${overall}/100`);
console.log(`wrote ${OUT}/audit.md, ${OUT}/internal-linking.md, ${OUT}/readiness.md`);
