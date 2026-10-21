import { SITE } from '$lib/config/site';
import type { RequestHandler } from './$types';

export const prerender = true;

/* Search engines and answer engines are deliberately both welcome.
 *
 * GJMSSH is an open-access journal: its value to its authors comes from being
 * read and cited, so blocking model crawlers would work against the journal's
 * own interest. The named blocks document that decision explicitly (the
 * wildcard group already allows them), which makes the policy reviewable rather
 * than accidental.
 *
 * The Disallow rules keep crawlers out of filtered views — `/archive.html?year=`
 * and `?open=` are the same document as the canonical page and add nothing but
 * duplicate URLs — and out of SvelteKit's `__data.json` endpoints, which serve
 * the same content as JSON and would otherwise be indexable in their own right. */
const AI_AND_ANSWER_ENGINE_CRAWLERS = [
  'GPTBot', // OpenAI training
  'OAI-SearchBot', // OpenAI search index
  'ChatGPT-User', // user-initiated fetches
  'ClaudeBot', // Anthropic
  'Claude-User',
  'Claude-SearchBot',
  'PerplexityBot',
  'Google-Extended', // Gemini grounding/training (does not affect Search)
  'Applebot-Extended',
  'Bingbot',
  'CCBot' // Common Crawl
];

export const GET: RequestHandler = () => {
  const body = [
    '# Global Journal of Management, Social Sciences and Humanities (GJMSSH)',
    '# Open-access journal: crawlers, including AI/answer engines, are welcome.',
    '',
    'User-agent: *',
    'Allow: /',
    'Disallow: /*?q=',
    'Disallow: /*?open=',
    'Disallow: /404.html',
    '# Internal type-pairing harness — not part of the journal\'s published content.',
    'Disallow: /type/',
    '# SvelteKit data endpoints: every page is also served as JSON at <page>__data.json.',
    '# Same content, second URL — keep crawlers out.',
    'Disallow: /*__data.json',
    '',
    '# Answer engines and AI crawlers — explicitly allowed',
    ...AI_AND_ANSWER_ENGINE_CRAWLERS.map((bot) => `User-agent: ${bot}`),
    'Allow: /',
    'Disallow: /*?q=',
    'Disallow: /*?open=',
    'Disallow: /type/',
    'Disallow: /*__data.json',
    '',
    '# A plain-text summary for language models (llmstxt.org)',
    `# ${SITE.origin}/llms.txt`,
    '',
    `Sitemap: ${SITE.origin}/sitemap.xml`,
    ''
  ].join('\n');

  return new Response(body, {
    headers: { 'content-type': 'text/plain; charset=utf-8' }
  });
};
