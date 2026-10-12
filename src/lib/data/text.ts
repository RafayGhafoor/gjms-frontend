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
