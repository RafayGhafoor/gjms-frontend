import { archive } from '$lib/data/archive-index';
import { sortIssues } from '$lib/data/archive';
import { paramId } from '$lib/data/paths';
import type { Issue } from '$lib/data/types';
import type { EntryGenerator, PageServerLoad } from './$types';

/* One prerendered page per issue, generated from the server module (see the
 * article route for why this is not a universal +page.ts). */
export const entries: EntryGenerator = () => archive.issues.map((issue) => ({ issue: issue.id }));

/* Resolved at build time so an issue page ships one issue plus its neighbours
 * rather than the whole archive index. */
/* Only what the issue page links with — see the note on `siblings` below. */
const summarise = (item: Issue) => ({
  id: item.id,
  title: item.title,
  volumeLabel: item.volumeLabel,
  volumeNumber: item.volumeNumber,
  issueNumber: item.issueNumber,
  isSpecial: item.isSpecial,
  year: item.year
});

export const load: PageServerLoad = ({ params }) => {
  const issueId = paramId(params.issue);
  const issue = archive.issues.find((item) => item.id === issueId) ?? null;

  if (!issue) return { issueId, issue: null, newer: null, older: null, siblings: [] };

  const ordered = sortIssues(archive.issues, -1);
  const position = ordered.findIndex((item) => item.id === issue.id);
  /* Summaries only: passing whole Issue objects also inlines their nested
     article arrays, which added every sibling issue's articles to this page's
     payload for links that only need a title and an id. */
  const siblings = archive.issues
    .filter((item) => item.id !== issue.id && (item.volumeLabel === issue.volumeLabel || item.year === issue.year))
    .sort((a, b) => (a.issueNumber ?? 0) - (b.issueNumber ?? 0))
    .map(summarise);

  return {
    issueId,
    issue,
    /* Prev/next are summaries too: a whole Issue carries its own articles, and
       those would be inlined into this page's payload for a bare title link. */
    newer: position > 0 ? summarise(ordered[position - 1]) : null,
    older: position >= 0 && position < ordered.length - 1 ? summarise(ordered[position + 1]) : null,
    siblings
  };
};
