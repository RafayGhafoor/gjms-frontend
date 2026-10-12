/* The journal's published page copy (content.json) — small, safe to import
 * anywhere, including content-only pages. */

import rawContent from '$content';
import type { JournalContent } from './types';

export const content = rawContent as unknown as JournalContent;
