/* Types for the journal's existing data files (archive-data.json, content.json).
   These describe the data as it is published by the automation — nothing here
   changes the stored shape. */

export type RawArticle = {
  num?: string | number;
  title?: string;
  authors?: string;
  pages?: string;
  pdf?: string;
  /** Stable, URL-safe id written by the automation (one per article). */
  slug?: string;
};

export type RawIssue = {
  volume?: string;
  title?: string;
  articles?: RawArticle[];
};

/** An article with the display fields derived from the source record. */
export type Article = {
  num: string;
  title: string;
  authors: string;
  pages: string;
  pdf: string;
  hasPdf: boolean;
  /** Used for the article page URL: /article/<slug>.html */
  slug: string;
  /** Filled from abstracts.json on the server; '' when no abstract was extracted. */
  abstract: string;
  year: number;
  volumeLabel: string;
  volumeNumber: number | null;
  isSpecial: boolean;
  issueNumber: number | null;
  issueTitle: string;
  issueId: string;
};

export type Issue = {
  id: string;
  title: string;
  volumeLabel: string;
  volumeNumber: number | null;
  isSpecial: boolean;
  issueNumber: number | null;
  year: number;
  articles: Article[];
};

export type ArchiveStats = {
  issues: number;
  articles: number;
  articlesWithPdf: number;
  articlesWithAuthors: number;
  volumes: number;
  specialEditions: number;
  firstYear: number;
  lastYear: number;
  /** Descending list of publication years that exist in the archive. */
  years: number[];
  /** Articles per publication year (oldest → newest) — for charts. */
  articlesByYear: ChartPoint[];
  /** Articles per numbered volume (volume order) — for charts. */
  articlesByVolume: ChartPoint[];
  /** Issues per publication year (oldest → newest) — for charts. */
  issuesByYear: ChartPoint[];
};

export type ChartPoint = {
  label: string;
  /** Compact form for the axis on narrow cards ("15" for 2015, "V3" for Vol 3).
   *  The full label stays in the tooltip and the accessible description. */
  short?: string;
  value: number;
  /** Optional secondary line for tooltips, e.g. "12 issues". */
  hint?: string;
  href?: string;
};

export type Archive = {
  issues: Issue[];
  articles: Article[];
  stats: ArchiveStats;
};

/* ------------------------------------------------------------------ content.json */

export type JournalContent = {
  site: {
    name: string;
    fullName: string;
    tagline: string;
    email: string;
    website: string;
    startYear: number;
  };
  stats: {
    impactFactor: string;
    daysToPublish: string;
    acceptanceRate: string;
    publicationFee: string;
  };
  home: {
    about: string;
    features: { title: string; description: string; linkText: string; linkHref: string }[];
  };
  impactFactor: {
    sjif: { year: string; value: string; trend: string; highlight: boolean }[];
    googleScholar: string;
  };
  currentIssue: {
    title: string;
    articles: RawArticle[];
  };
  editorialBoard: {
    editorInChief: string;
    members: { name: string; affiliation: string }[];
  };
  authorGuidelines: {
    intro: string;
    sections: {
      title: string;
      text: string;
      /** Optional second lead-in before the labelled list ("Reference formats:"). */
      text2?: string;
      /** Optional plain bullet list published with the section (abstract elements). */
      list?: string[];
      /** Optional list of labelled items (paper types, reference formats). */
      labeledList?: { label: string; text: string }[];
    }[];
    highlights: { title: string; text: string; style?: string }[];
    disclaimer: string;
  };
  visionMission: {
    vision: string;
    missionIntro: string;
    missionItems: string[];
  };
  contact: {
    intro: string;
    email: string;
    website: string;
  };
};
