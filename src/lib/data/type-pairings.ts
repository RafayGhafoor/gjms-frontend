/* Typography pairings under evaluation for the GJMSSH redesign.
 *
 * Sizes follow the spec being compared: H1 48–56px, article titles 32–40px,
 * body 17–19px with 1.7 line-height, navigation 14–16px. The `current` entry is
 * the pairing the redesign ships today, kept for reference. */

export type Pairing = {
  id: string;
  label: string;
  heading: string;
  body: string;
  note: string;
  fontsHref: string;
  h1: string;
  articleTitle: string;
  bodySize: string;
  navSize: string;
  headingWeight: number;
};

export const PAIRINGS: Record<string, Pairing> = {
  '1': {
    id: '1',
    label: 'Merriweather + Inter',
    heading: "'Merriweather', Georgia, serif",
    body: "'Inter', system-ui, sans-serif",
    note: 'Classic academic — the Nature / Elsevier / Oxford Academic register',
    fontsHref:
      'https://fonts.googleapis.com/css2?family=Merriweather:wght@300;400;700;900&family=Inter:wght@400;500;600;700&display=swap',
    h1: 'clamp(2.25rem, 2rem + 1.4vw, 3.5rem)',
    articleTitle: 'clamp(1.5rem, 1.3rem + 0.9vw, 2.5rem)',
    bodySize: '1.125rem',
    navSize: '0.9375rem',
    headingWeight: 700
  },
  '2': {
    id: '2',
    label: 'Libre Baskerville + Roboto',
    heading: "'Libre Baskerville', Georgia, serif",
    body: "'Roboto', system-ui, sans-serif",
    note: 'Traditional and serious — the most book-like of the five',
    fontsHref:
      'https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Roboto:wght@400;500;700&display=swap',
    h1: 'clamp(2.25rem, 2rem + 1.3vw, 3.4rem)',
    articleTitle: 'clamp(1.5rem, 1.3rem + 0.85vw, 2.4rem)',
    bodySize: '1.0625rem',
    navSize: '0.9375rem',
    headingWeight: 700
  },
  '3': {
    id: '3',
    label: 'DM Serif Display + Inter',
    heading: "'DM Serif Display', Georgia, serif",
    body: "'Inter', system-ui, sans-serif",
    note: 'Modern research platform — high-contrast headings, very clean UI',
    fontsHref:
      'https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Inter:wght@400;500;600;700&display=swap',
    h1: 'clamp(2.5rem, 2.1rem + 1.8vw, 3.75rem)',
    articleTitle: 'clamp(1.75rem, 1.4rem + 1.2vw, 2.5rem)',
    bodySize: '1.125rem',
    navSize: '0.9375rem',
    headingWeight: 400
  },
  '4': {
    id: '4',
    label: 'Playfair Display + Source Sans 3',
    heading: "'Playfair Display', Georgia, serif",
    body: "'Source Sans 3', system-ui, sans-serif",
    note: 'Premium editorial — magazine feel, the most personality of the five',
    fontsHref:
      'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Source+Sans+3:wght@400;600&display=swap',
    h1: 'clamp(2.5rem, 2.1rem + 1.8vw, 3.75rem)',
    articleTitle: 'clamp(1.75rem, 1.4rem + 1.2vw, 2.5rem)',
    bodySize: '1.125rem',
    navSize: '1rem',
    headingWeight: 600
  },
  '5': {
    id: '5',
    label: 'Crimson Text + Open Sans',
    heading: "'Crimson Text', Georgia, serif",
    body: "'Open Sans', system-ui, sans-serif",
    note: 'University journal — institutional, very readable at length',
    fontsHref:
      'https://fonts.googleapis.com/css2?family=Crimson+Text:wght@400;600;700&family=Open+Sans:wght@400;500;600&display=swap',
    h1: 'clamp(2.5rem, 2.1rem + 1.7vw, 3.6rem)',
    articleTitle: 'clamp(1.6rem, 1.35rem + 1vw, 2.4rem)',
    bodySize: '1.1875rem',
    navSize: '0.9375rem',
    headingWeight: 600
  },
  current: {
    id: 'current',
    label: 'Current site (Poppins + system serif)',
    heading: "'Poppins', system-ui, sans-serif",
    body: "'Poppins', system-ui, sans-serif",
    note: 'What the redesign uses today — sans headings, serif only for article titles',
    fontsHref: 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap',
    h1: 'clamp(2.3rem, 1.9rem + 1.6vw, 3.4rem)',
    articleTitle: '1.0625rem',
    bodySize: '1rem',
    navSize: '0.8125rem',
    headingWeight: 700
  }
};
