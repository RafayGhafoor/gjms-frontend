import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** shadcn-svelte's class helper: merge conditional + conflicting Tailwind classes. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function escapeHtml(value: unknown): string {
  return String(value ?? '').replace(
    /[&<>"']/g,
    (character) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character] as string
  );
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Escape a string and wrap case-insensitive matches of `query` in a <mark>. */
export function highlight(value: unknown, query = ''): string {
  const text = String(value ?? '');
  const term = query.trim();
  if (term.length < 2) return escapeHtml(text);
  const pattern = new RegExp(`(${escapeRegExp(term)})`, 'gi');
  return text
    .split(pattern)
    .map((part) =>
      part.toLowerCase() === term.toLowerCase() ? `<mark class="mark">${escapeHtml(part)}</mark>` : escapeHtml(part)
    )
    .join('');
}

export function formatCount(value: number): string {
  return Number(value || 0).toLocaleString('en-US');
}

/** "319-357" → "pp. 319–357"; "97" → "p. 97"; anything else is passed through. */
/** "319-357" → "Pages 319–357"; "97" → "Page 97"; blank → "". */
export function formatPages(pages: string): string {
  const label = pageRangeValue(pages);
  if (!label) return '';
  return label.includes('–') ? `Pages ${label}` : `Page ${label}`;
}

/**
 * The bare range, for places that already print a "Pages" label next to it
 * ("319–357", "97") — avoids "Pages  Pages 319–357".
 */
export function pageRangeValue(pages: string): string {
  const value = String(pages ?? '').trim();
  if (!value) return '';
  // "01-33" → "1–33": drop leading zeros so the printed range reads like a page range
  const tidy = (part: string) => part.trim().replace(/^0+(?=\d)/, '');
  if (value.includes('-')) {
    const [from, to] = value.split('-');
    if (from && to) return `${tidy(from)}–${tidy(to)}`;
  }
  return tidy(value);
}

export function formatDateRange(years: number[]): string {
  if (!years.length) return '';
  const min = Math.min(...years);
  const max = Math.max(...years);
  return min === max ? String(min) : `${min}–${max}`;
}
