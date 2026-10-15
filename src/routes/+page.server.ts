import { announcedIssue, matchCurrentIssue, recentIssues } from '$lib/server/current-issue';
import { getStats } from '$lib/server/stats';
import type { PageServerLoad } from './$types';

/* The home page renders one issue's articles plus a handful of issue summaries
 * and the archive's counts — all decided at build time. Resolving it here keeps
 * the ~30 KB gzipped archive index out of the browser; only the records that are
 * actually painted are serialised into the page. */
export const load: PageServerLoad = () => {
  const matched = matchCurrentIssue();
  const announced = announcedIssue();

  return {
    stats: getStats(),
    /* The announced current issue, from the archive index where it exists and
       from content.json's announcement where it has not been indexed yet. */
    currentIssue: matched
      ? {
          id: matched.id as string | null,
          title: matched.title,
          volumeNumber: matched.volumeNumber,
          issueNumber: matched.issueNumber,
          year: matched.year,
          articles: matched.articles
        }
      : {
          id: null,
          title: announced.title,
          volumeNumber: null,
          issueNumber: null,
          year: null,
          articles: announced.articles
        },
    /* Previous issues — the current one is excluded, so the homepage never
       repeats the same papers twice. */
    previousIssues: recentIssues(4, matched?.id)
  };
};
