import { SITE, absoluteUrl } from '$lib/config/site';
import { archive, content } from '$lib/data/journal';
import { articlePath, issuePath } from '$lib/data/paths';
import { sortIssues } from '$lib/data/archive';
import type { RequestHandler } from './$types';

export const prerender = true;

/* /llms.txt — the emerging convention (llmstxt.org) for handing language models
 * a curated, plain-text map of a site instead of making them infer one from
 * HTML. Everything below is generated from the journal's own records: figures
 * are counted from archive-data.json, and the policy facts come from
 * content.json. Nothing is asserted that the journal does not publish. */
export const GET: RequestHandler = () => {
  const { stats } = archive;
  const recent = sortIssues(archive.issues, -1).slice(0, 5);
  const link = (title: string, path: string, note: string) => `- [${title}](${absoluteUrl(path)}): ${note}`;

  const body = [
    `# ${SITE.fullName} (${SITE.name})`,
    '',
    `> ${SITE.tagline} published since ${SITE.startYear}. The archive holds ${stats.articles} articles in ${stats.issues} issues across ${stats.volumes} numbered volumes${stats.specialEditions ? ` plus ${stats.specialEditions} special editions` : ''} (${stats.firstYear}–${stats.lastYear}). Each article has a landing page carrying its title, authors, page range and published abstract, with the full text as a public PDF.`,
    '',
    '## Key pages',
    link('Journal home', '/', 'About the journal, latest articles, publication activity'),
    link('Archive', '/archive.html', 'Browse every issue by year, volume and issue'),
    link('Article index', '/articles.html', `Search all ${stats.articles} article records by title, author, year or volume`),
    link('Current issue', '/current-issue.html', 'The most recently published issue'),
    link('Editorial board', '/editorial-board.html', `Editor-in-chief and ${content.editorialBoard.members.length} board members with their published affiliations`),
    link('Author guidelines', '/author-guideline.html', 'Manuscript requirements, submission process, publication fee and review timeline'),
    link('Indexing and impact', '/impact-factor.html', "The journal's own published impact figures"),
    link('Vision and mission', '/vision-mission.html', 'The journal\'s statement of purpose and core objectives'),
    link('Contact', '/contact.html', 'Editorial office contact details'),
    '',
    '## Article pages',
    '- URL pattern: `/article/<slug>.html` (one page per article record, e.g.',
    `  ${absoluteUrl(articlePath(archive.articles.find((a) => a.slug)?.slug ?? 'example'))})`,
    '- Each page carries the published abstract, authors, volume, issue, year, page range, a',
    '  downloadable open-access PDF, a citation-ready reference and `ScholarlyArticle` JSON-LD.',
    '- Issue pages live at `/archive/<issue-id>.html` and list every article in that issue.',
    '',
    '## Publication facts (as published by the journal)',
    `- Journal: ${SITE.fullName} (${SITE.name})`,
    `- ISSN: ${SITE.issn.print} (print), ${SITE.issn.online} (online)`,
    `- Established: ${SITE.startYear}`,
    `- Description: ${SITE.tagline}`,
    `- Peer review: blind peer review`,
    `- Publication fee: ${content.stats.publicationFee}`,
    `- Review timeline: decision within ${content.stats.daysToPublish} days`,
    `- Acceptance rate: ${content.stats.acceptanceRate}`,
    `- Impact factor (SJIF, latest published): ${content.stats.impactFactor}`,
    `- Google Scholar: ${content.impactFactor.googleScholar}`,
    `- Contact: ${SITE.email}`,
    '',
    '## Recent issues',
    ...recent.map((issue) =>
      `- [${issue.title}](${absoluteUrl(issuePath(issue.id))}): ${issue.articles.length} article${issue.articles.length === 1 ? '' : 's'}`
    ),
    '',
    '## Notes for automated readers',
    '- Article titles, authors, page ranges and abstracts are reproduced from the journal\'s own archive;',
    '  records without an extractable abstract say so instead of substituting generated text.',
    `- The full sitemap is at ${absoluteUrl('/sitemap.xml')} (${stats.articles + stats.issues + 9} URLs).`,
    '- Filtered views such as `/archive.html?year=2025` are the same document as the canonical page.',
    ''
  ].join('\n');

  return new Response(body, {
    headers: { 'content-type': 'text/plain; charset=utf-8' }
  });
};
