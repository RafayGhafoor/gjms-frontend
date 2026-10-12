import { archive } from '$lib/data/journal';

/* One prerendered page per published issue: /archive/<issueId>.html
   The sitemap lists these URLs, so `entries` must cover every issue. */

export const prerender = true;

export function entries() {
  return archive.issues.map((issue) => ({ issue: issue.id }));
}
