/* Lazily-loaded abstracts for the listing pages.
 *
 * The article pages carry their abstract inline — that is the indexable surface
 * — while the archive and article indexes stay light and only pull
 * abstracts.json when a reader actually asks for one. The file is ~300 KB, so
 * it is fetched once, cached, and re-used for every later disclosure.
 */

type AbstractMap = Record<string, string>;

const normalise = (url: string) => String(url).trim().replace(/^http:\/\//i, 'https://').replace(/ /g, '%20');

let pending: Promise<AbstractMap> | null = null;
let lookup: AbstractMap | null = null;

function load(): Promise<AbstractMap> {
  if (!pending) {
    pending = fetch('/abstracts.json', { cache: 'force-cache' })
      .then((response) => (response.ok ? response.json() : {}))
      .then((raw: AbstractMap) => {
        // The file's keys are raw spellings (http vs https, literal spaces in
        // some older records), so normalise the keys once on arrival.
        lookup = Object.fromEntries(Object.entries(raw).map(([pdf, text]) => [normalise(pdf), text]));
        return raw;
      })
      .catch(() => ({}) as AbstractMap);
  }
  return pending;
}

/** The published abstract for a PDF URL, or '' when none is held. */
export async function loadAbstract(pdf: string): Promise<string> {
  if (!pdf) return '';
  await load();
  return lookup?.[normalise(pdf)] ?? '';
}
