/* The journal archive index (archive-data.json), normalised once at module load.
 *
 * This module is heavy — every article record ships to the browser — so only
 * pages that actually need the records (archive, articles, home, current issue,
 * issue and article pages) may import it. Content-only pages take their figures
 * through $lib/server/stats instead. */

import rawArchive from '$archive';
import { buildArchive } from './archive';
import type { Archive, RawIssue } from './types';

export const archive: Archive = buildArchive(rawArchive as RawIssue[]);
