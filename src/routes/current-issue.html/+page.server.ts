import { archive } from '$lib/data/archive-index';
import { issuePath } from '$lib/data/paths';
import { sortIssues } from '$lib/data/archive';
import { getStats } from '$lib/server/stats';
import { content } from '$lib/data/content';
import type { Issue } from '$lib/data/types';
import type { PageServerLoad } from './$types';

/* The current issue is announced in content.json; where it also exists in the
 * archive index we use that record (one source of truth per article). The
 * volume/issue/year numbers come from the journal's own published title, and the
 * index itself stays server-side. */
function matchIssue(title: string): Issue | null {
  const volume = Number(title.match(/vol(?:ume)?\.?\s*(\d+)/i)?.[1] ?? NaN);
  const issueNumber = Number(title.match(/no\.?\s*(\d+)/i)?.[1] ?? NaN);
  const year = Number(title.match(/\b(19|20)\d{2}\b/)?.[0] ?? NaN);
  if (!Number.isFinite(volume)) return null;
  const candidates = archive.issues.filter((item) => item.volumeNumber === volume);
  return (
    candidates.find(
      (item) =>
        Number.isFinite(issueNumber) && item.issueNumber === issueNumber && (!Number.isFinite(year) || item.year === year)
    ) ??
    candidates.find((item) => Number.isFinite(year) && item.year === year) ??
    null
  );
}

export const load: PageServerLoad = () => {
  const title = content.currentIssue.title;
  const matched = matchIssue(title);

  return {
    matched,
    previousIssues: sortIssues(
      archive.issues.filter((item) => item.id !== matched?.id && item.year <= (matched?.year ?? archive.stats.lastYear)),
      -1
    ).slice(0, 4),
    issuePathTemplate: issuePath(''),
    stats: getStats()
  };
};
