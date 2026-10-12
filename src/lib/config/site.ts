/* Single source of truth for navigation, footer links and canonical URLs.
   Pages never hard-code a menu — they render from here, so a new page appears
   everywhere at once and the sitemap stays in sync. */

export const SITE = {
  name: 'GJMSSH',
  fullName: 'Global Journal of Management, Social Sciences and Humanities',
  tagline: 'A Blind Peer-Reviewed Quarterly Journal',
  email: 'gjmsweb@proton.me',
  website: 'gjmsweb.com',
  origin: 'https://gjmsweb.com',
  startYear: 2015,
  /** Every article on the CDN is reachable over https; links are normalised to it. */
  cdn: 'https://gjms.b-cdn.net'
} as const;

export type NavItem = {
  label: string;
  href: string;
  /** Optional short description used by the mobile panel and the sitemap. */
  description?: string;
  /** Extra paths that should mark this item as current. */
  match?: string[];
};

/** Primary navigation — kept short so the full bar fits a laptop viewport;
 *  Contact lives in the top strip and the footer instead. */
export const NAV_ITEMS: NavItem[] = [
  { label: 'Home', href: '/' },
  { label: 'Articles', href: '/articles.html', description: 'Search every published article' },
  {
    label: 'Current Issue',
    href: '/current-issue.html',
    description: 'The latest published issue'
  },
  { label: 'Archive', href: '/archive.html', description: 'Browse by year, volume and issue' },
  {
    label: 'Editorial Board',
    href: '/editorial-board.html',
    description: 'Editor-in-chief and international members'
  },
  {
    label: 'For Authors',
    href: '/author-guideline.html',
    description: 'Guidelines, submission process and policies'
  },
  { label: 'About', href: '/vision-mission.html', description: 'Vision, mission and journal scope' }
];

export const FOOTER_GROUPS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: 'Explore',
    links: [
      { label: 'Archive', href: '/archive.html' },
      { label: 'Current issue', href: '/current-issue.html' },
      { label: 'All articles', href: '/articles.html' },
      { label: 'Indexing & impact', href: '/impact-factor.html' }
    ]
  },
  {
    title: 'For authors',
    links: [
      { label: 'Author guidelines', href: '/author-guideline.html' },
      { label: 'Publication ethics & policies', href: '/author-guideline.html' },
      { label: 'Submit a manuscript', href: `mailto:${SITE.email}?subject=Manuscript%20submission%20to%20GJMSSH` }
    ]
  },
  {
    title: 'Journal',
    links: [
      { label: 'Editorial board', href: '/editorial-board.html' },
      { label: 'Vision & mission', href: '/vision-mission.html' },
      { label: 'Contact', href: '/contact.html' }
    ]
  }
];

export const SUBMIT_HREF = `mailto:${SITE.email}?subject=Manuscript%20submission%20to%20GJMSSH`;

export function absoluteUrl(path: string): string {
  if (!path || path === '/') return `${SITE.origin}/`;
  if (path.startsWith('http')) return path;
  return `${SITE.origin}${path.startsWith('/') ? path : `/${path}`}`;
}

/** Marked up in /sitemap.xml. Keep in step with the pages that actually exist.
 *
 * `lastmod` is only declared for pages whose content is regenerated from the
 * archive on every build. Issue and article pages deliberately carry none: the
 * journal's records contain a year, not a publication day, and a fabricated
 * date is worse than no date — an unreliable lastmod can make a crawler ignore
 * the field for the whole sitemap. */
export const SITEMAP_PAGES: { path: string; priority: string; lastmod: 'build' | 'none' }[] = [
  { path: '/', priority: '1.0', lastmod: 'build' },
  { path: '/current-issue.html', priority: '0.9', lastmod: 'build' },
  { path: '/archive.html', priority: '0.9', lastmod: 'build' },
  { path: '/articles.html', priority: '0.8', lastmod: 'build' },
  { path: '/editorial-board.html', priority: '0.7', lastmod: 'none' },
  { path: '/author-guideline.html', priority: '0.7', lastmod: 'none' },
  { path: '/vision-mission.html', priority: '0.6', lastmod: 'none' },
  { path: '/impact-factor.html', priority: '0.6', lastmod: 'none' },
  { path: '/contact.html', priority: '0.5', lastmod: 'none' }
];
