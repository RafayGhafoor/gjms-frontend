import { SITE } from '$lib/config/site';
import type { RequestHandler } from './$types';

export const prerender = true;

export const GET: RequestHandler = () => {
  const body = [
    'User-agent: *',
    'Allow: /',
    'Disallow: /*?q=',
    'Disallow: /*?open=',
    '',
    `Sitemap: ${SITE.origin}/sitemap.xml`,
    ''
  ].join('\n');

  return new Response(body, {
    headers: { 'content-type': 'text/plain; charset=utf-8' }
  });
};
