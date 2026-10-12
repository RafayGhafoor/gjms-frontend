/* URL builders shared by every page and by the sitemap.
   New (additive) URLs only — the legacy .html URLs stay untouched. */

/**
 * Normalise a dynamic route param.
 *
 * The prerendered files are named `<id>.html`, so the parameter the router hands
 * to a page is the literal URL segment — including the `.html` suffix — while the
 * ids in the data never carry it. Without this, server rendering is correct but
 * hydration looks the id up with ".html" attached and renders the not-found
 * branch instead.
 */
export function paramId(value: string | undefined): string {
  return String(value ?? '').replace(/\.html$/i, '');
}

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
