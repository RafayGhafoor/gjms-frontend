/* URL builders shared by every page and by the sitemap.
   New (additive) URLs only — the legacy .html URLs stay untouched. */

/** /archive/<issue-id>.html — one prerendered page per published issue. */
export function issuePath(issueId: string): string {
  return `/archive/${issueId}.html`;
}
