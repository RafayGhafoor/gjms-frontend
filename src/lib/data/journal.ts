/* Single entry point for the journal's own data.
   --------------------------------------------------------------------------
   Both JSON files live at the repository root and are read-only for the site:
   archive-data.json is written by the gjms-automation pipeline, content.json
   holds the journal's published page copy.

   They are imported directly (not fetched) so that:
     • every prerendered page already contains real content in its HTML, and
     • the browser downloads the data once as a cached chunk instead of a
       per-page request. */

import rawArchive from '$archive';
import rawContent from '$content';
import { buildArchive } from './archive';
import type { Archive, JournalContent, RawIssue } from './types';

export const archive: Archive = buildArchive(rawArchive as RawIssue[]);

export const content = rawContent as unknown as JournalContent;
