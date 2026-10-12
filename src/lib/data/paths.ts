/* URL builders shared by every page and by the sitemap.
   New (additive) URLs only — the legacy .html URLs stay untouched. */

/** /archive/<issue-id>.html — one prerendered page per published issue. */
export function issuePath(issueId: string): string {
  return `/archive/${issueId}.html`;
}

/**
 * /article/<slug>.html — one prerendered page per article.
 * The slug comes from archive-data.json and matches the URLs the journal's
 * earlier static build published, so existing links keep working.
 */
export function articlePath(slug: string): string {
  return `/article/${slug}.html`;
}
