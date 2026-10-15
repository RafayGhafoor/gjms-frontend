import { matchCurrentIssue, currentIssueTitle, recentIssues } from '$lib/server/current-issue';
import { getStats } from '$lib/server/stats';
import type { PageServerLoad } from './$types';

/* The current issue is announced in content.json; where it also exists in the
 * archive index we use that record (one source of truth per article). The
 * volume/issue/year numbers come from the journal's own published title, and the
 * index itself stays server-side. */
export const load: PageServerLoad = () => {
  const matched = matchCurrentIssue();

  return {
    matched,
    title: currentIssueTitle(),
    previousIssues: recentIssues(4, matched?.id),
    stats: getStats()
  };
};
