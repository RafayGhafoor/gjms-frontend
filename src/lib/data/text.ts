/* Trim an abstract into a meta description that reads well in a search result:
   break on a sentence where possible, otherwise on a word boundary, and keep it
   inside the ~155–160 character window search engines display. */

export function summariseForMeta(text: string, limit = 158): string {
  const clean = String(text ?? '')
    .replace(/\s+/g, ' ')
    .trim();
  if (clean.length <= limit) return clean;

  const window = clean.slice(0, limit + 1);
  const sentenceEnd = Math.max(window.lastIndexOf('. '), window.lastIndexOf('? '), window.lastIndexOf('! '));
  if (sentenceEnd > limit * 0.6) return window.slice(0, sentenceEnd + 1).trim();

  const wordEnd = window.lastIndexOf(' ');
  return `${(wordEnd > 0 ? window.slice(0, wordEnd) : window).trim()}…`;
}

/** Split a published author line into individual names (comma or "and"). */
export function splitAuthors(authors: string): string[] {
  return String(authors ?? '')
    .split(/,\s*|\s+and\s+/i)
    .map((name) => name.trim())
    .filter(Boolean);
}

/** "319-357" → { first: '319', last: '357' }; "97" → { first: '97' }. */
export function parsePageRange(pages: string): { first?: string; last?: string } {
  const value = String(pages ?? '').trim();
  if (!value) return {};
  const [from, to] = value.split('-');
  const clean = (part: string) => part.replace(/^0+(?=\d)/, '').trim();
  if (!from) return {};
  if (!to) return { first: clean(from) };
  return { first: clean(from), last: clean(to) };
}
