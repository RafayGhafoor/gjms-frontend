import { archive } from '$lib/data/archive-index';
import { sortIssues } from '$lib/data/archive';
import { paramId } from '$lib/data/paths';
import type { EntryGenerator, PageServerLoad } from './$types';

/* One prerendered page per issue, generated from the server module (see the
 * article route for why this is not a universal +page.ts). */
export const entries: EntryGenerator = () => archive.issues.map((issue) => ({ issue: issue.id }));

/* Resolved at build time so an issue page ships one issue plus its neighbours
 * rather than the whole archive index. */
export const load: PageServerLoad = ({ params }) => {
  const issueId = paramId(params.issue);
  const issue = archive.issues.find((item) => item.id === issueId) ?? null;

  if (!issue) return { issueId, issue: null, newer: null, older: null, siblings: [] };

  const ordered = sortIssues(archive.issues, -1);
  const position = ordered.findIndex((item) => item.id === issue.id);
  const siblings = archive.issues
    .filter((item) => item.id !== issue.id && (item.volumeLabel === issue.volumeLabel || item.year === issue.year))
    .sort((a, b) => (a.issueNumber ?? 0) - (b.issueNumber ?? 0));

  return {
    issueId,
    issue,
    newer: position > 0 ? ordered[position - 1] : null,
    older: position >= 0 && position < ordered.length - 1 ? ordered[position + 1] : null,
    siblings
  };
};
