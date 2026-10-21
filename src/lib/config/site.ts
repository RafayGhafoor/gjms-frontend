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
  /** Registered with the ISSN International Centre and printed on the masthead
   *  of every published issue. The print number is also the linking ISSN
   *  (ISSN-L) for the online number, so the two are always published together.
   *  Unlike the figures elsewhere in the repository this cannot be derived from
   *  the archive, so it is recorded here with its provenance: read off the
   *  journal's own published PDFs and confirmed against the ISSN register
   *  (portal.issn.org/resource/ISSN/2520-7113 and /2520-7121). */
  issn: {
    print: '2520-7113',
    online: '2520-7121'
  },
  /** Every article on the CDN is reachable over https; links are normalised to it. */
  cdn: 'https://gjms.b-cdn.net'
} as const;

/** The pair as the journal prints it on its masthead, for the footer and the
 *  plain-text surfaces that repeat the journal's identity. */
export const ISSN_LABEL = `ISSN ${SITE.issn.print} (print), ISSN ${SITE.issn.online} (online)`;

/** The journal's real submission route: a mailto to the editorial office. Declared
 *  before FOOTER_GROUPS so the footer's "Submission instructions" link can use it. */
export const SUBMIT_HREF = `mailto:${SITE.email}?subject=Manuscript%20submission%20to%20GJMSSH`;

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

/* The footer's three link columns. The journal's own identity (name, ISSN,
 * email) is the fourth column and is rendered by the footer component itself.
 * Every href points at a page that exists — no placeholder destinations. */
export const FOOTER_GROUPS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: 'Discover',
    links: [
      { label: 'Current issue', href: '/current-issue.html' },
      { label: 'Articles', href: '/articles.html' },
      { label: 'Archive', href: '/archive.html' }
    ]
  },
  {
    title: 'For authors',
    links: [
      { label: 'Author guidelines', href: '/author-guideline.html' },
      { label: 'Email your manuscript', href: SUBMIT_HREF },
      { label: 'Publication ethics', href: '/author-guideline.html#ethics-and-integrity' },
      { label: 'Publication fee', href: '/author-guideline.html' }
    ]
  },
  {
    title: 'Information',
    links: [
      { label: 'About the journal', href: '/vision-mission.html' },
      { label: 'Editorial board', href: '/editorial-board.html' },
      { label: 'Indexing and impact', href: '/impact-factor.html' },
      { label: 'Contact', href: '/contact.html' }
    ]
  }
];

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
