/* Server-only access to the extracted abstracts.
 *
 * abstracts.json is written by the gjms-automation pipeline and keyed by the
 * article's PDF URL. It is ~300 KB, so it is NEVER imported into client code —
 * only the abstract of the article being rendered is passed to the page, via a
 * +page.server.ts load, which keeps every other bundle small while still
 * putting the abstract in the prerendered HTML.
 *
 * The keys are raw spellings: most are https and percent-encoded, some carry a
 * literal space, and older records are plain http. The archive data is
 * normalised (https + %20) before it reaches this module, so the lookup table
 * is normalised the same way — matching one side only is what silently dropped
 * a third of the abstracts the first time round.
 */

import abstracts from '$abstracts';

const normalise = (url: string) =>
  String(url).trim().replace(/^http:\/\//i, 'https://').replace(/ /g, '%20');

const byPdfUrl: Record<string, string> = Object.fromEntries(
  Object.entries(abstracts as Record<string, string>).map(([pdf, abstract]) => [normalise(pdf), abstract])
);

export function abstractFor(pdf: string | undefined): string {
  if (!pdf) return '';
  return byPdfUrl[normalise(pdf)] ?? '';
}
