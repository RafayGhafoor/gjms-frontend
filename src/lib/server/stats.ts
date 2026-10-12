/* Build-time stats access for the pages that only display counts.
 *
 * Importing `$lib/data/journal` from a page component pulls the whole archive
 * (all 342 records, ~150 KB) into that page's client bundle. Content pages such
 * as the editorial board or the impact page never filter that data — they show
 * a handful of derived numbers — so they take the stats through a
 * +page.server.ts load instead. Only the small figures are serialised into the
 * page payload, and the archive itself never reaches the browser.
 */

import { archive } from '$lib/data/archive-index';
import type { ArchiveStats } from '$lib/data/types';

export function getStats(): ArchiveStats {
  return archive.stats;
}
