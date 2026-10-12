/* Structured data builders. Only facts that exist in the journal's own data are
   emitted — no invented ISSNs, metrics, DOIs or abstracts. */

import { SITE, absoluteUrl } from '$lib/config/site';
import type { Article, Issue } from '$lib/data/types';

export function organizationNode() {
  return {
    '@type': 'Organization',
    '@id': `${SITE.origin}/#organization`,
    name: SITE.fullName,
    alternateName: SITE.name,
    url: `${SITE.origin}/`,
    email: SITE.email,
    logo: {
      '@type': 'ImageObject',
      url: absoluteUrl('/icon-512.png'),
      width: 512,
      height: 351
    }
  };
}

export function periodicalNode() {
  return {
    '@type': 'Periodical',
    '@id': `${SITE.origin}/#journal`,
    name: SITE.fullName,
    alternateName: SITE.name,
    url: `${SITE.origin}/`,
    inLanguage: 'en',
    publisher: { '@id': `${SITE.origin}/#organization` },
    image: absoluteUrl('/og-image.jpg'),
    issn: undefined
  };
}

export function websiteNode() {
  return {
    '@type': 'WebSite',
    '@id': `${SITE.origin}/#website`,
    url: `${SITE.origin}/`,
    name: `${SITE.name} — ${SITE.fullName}`,
    inLanguage: 'en',
    publisher: { '@id': `${SITE.origin}/#organization` },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE.origin}/articles.html?q={search_term_string}`
      },
      'query-input': 'required name=search_term_string'
    }
  };
}

export function breadcrumbNode(items: { name: string; path: string }[]) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path)
    }))
  };
}

export function collectionPageNode(options: { path: string; name: string; description: string }) {
  return {
    '@type': 'CollectionPage',
    '@id': absoluteUrl(options.path),
    url: absoluteUrl(options.path),
    name: options.name,
    description: options.description,
    inLanguage: 'en',
    isPartOf: { '@id': `${SITE.origin}/#journal` },
    about: { '@id': `${SITE.origin}/#journal` }
  };
}

export function webPageNode(options: { path: string; name: string; description: string }) {
  return {
    '@type': 'WebPage',
    '@id': absoluteUrl(options.path),
    url: absoluteUrl(options.path),
    name: options.name,
    description: options.description,
    inLanguage: 'en',
    isPartOf: { '@id': `${SITE.origin}/#website` }
  };
}

function clean<T extends Record<string, unknown>>(node: T): T {
  return Object.fromEntries(Object.entries(node).filter(([, value]) => value !== undefined && value !== null)) as T;
}

/** ScholarlyArticle for records that really exist in archive-data.json. */
export function scholarlyArticleNode(article: Article, issuePath?: string) {
  const authors = article.authors
    ? article.authors
        .split(/,\s*|\s+and\s+/i)
        .map((name) => name.trim())
        .filter(Boolean)
    : [];

  return clean({
    '@type': 'ScholarlyArticle',
    headline: article.title,
    inLanguage: 'en',
    pagination: article.pages || undefined,
    url: article.hasPdf ? article.pdf : issuePath ? absoluteUrl(issuePath) : undefined,
    author: authors.length ? authors.map((name) => ({ '@type': 'Person', name })) : undefined,
    isPartOf: clean({
      '@type': 'PublicationIssue',
      name: article.issueTitle,
      issueNumber: article.issueNumber != null ? String(article.issueNumber) : undefined,
      datePublished: article.year ? String(article.year) : undefined,
      isPartOf: { '@id': `${SITE.origin}/#journal` }
    }),
    publisher: { '@id': `${SITE.origin}/#organization` }
  });
}

export function publicationIssueNodes(issues: Issue[], limit = 50) {
  return issues.slice(0, limit).map((issue) =>
    clean({
      '@type': 'PublicationIssue',
      name: issue.title,
      issueNumber: issue.issueNumber != null ? String(issue.issueNumber) : undefined,
      datePublished: issue.year ? String(issue.year) : undefined,
      isPartOf: { '@id': `${SITE.origin}/#journal` },
      numberOfPages: undefined,
      about: issue.articles.length
        ? { '@type': 'ItemList', numberOfItems: issue.articles.length }
        : undefined
    })
  );
}

/** Person schema for editorial members that are actually listed in content.json. */
export function personNode(member: { name: string; affiliation: string }, role?: string) {
  return clean({
    '@type': 'Person',
    name: member.name,
    affiliation: member.affiliation ? { '@type': 'Organization', name: member.affiliation } : undefined,
    jobTitle: role,
    worksFor: { '@id': `${SITE.origin}/#journal` }
  });
}

export function graph(nodes: (Record<string, unknown> | null | undefined)[]) {
  return {
    '@context': 'https://schema.org',
    '@graph': nodes.filter(Boolean)
  };
}

/**
 * Serialise structured data into a ready-to-inject <script> tag.
 *
 * Svelte treats a `<script>` element written in a template as raw text, so
 * expressions inside it are never evaluated — the tag has to be built as a
 * string and rendered with `{@html}`. `<`, `>` and `&` are escaped as JSON
 * unicode escapes (still valid JSON) so the payload can never close the tag.
 */
export function jsonLdScript(data: unknown): string {
  const json = JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026');
  return `<script type="application/ld+json">${json}</script>`;
}
