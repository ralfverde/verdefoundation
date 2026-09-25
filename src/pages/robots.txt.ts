import type { APIRoute } from 'astro';
import { ENGLISH_ENABLED } from '../lib/site';

export const GET: APIRoute = ({ site }) => {
  const lines = ['User-agent: *', 'Allow: /', 'Disallow: /api/', 'Disallow: /donar/gracias'];
  if (!ENGLISH_ENABLED) lines.push('# English pages are noindex until the translation is reviewed');
  lines.push('', `Sitemap: ${new URL('/sitemap-index.xml', site).href}`, '');
  return new Response(lines.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
