/* Convenience entry point for BUILD-TIME (server) code that needs both data
 * files, e.g. the sitemap and the stats helper.
 *
 * Do NOT import this from a page or component that only needs `content`:
 * importing it pulls the whole archive index into that page's client bundle.
 * Client-facing code should import `$lib/data/archive-index` (records) or
 * `$lib/data/content` (page copy) directly. */

export { archive } from './archive-index';
export { content } from './content';
