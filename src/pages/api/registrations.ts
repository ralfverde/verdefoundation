import type { APIRoute } from 'astro';
import { eventEntries } from '../../lib/events';
import { json } from '../../lib/server/env';
import { getRegistrations, kvConfigured } from '../../lib/server/kv';

export const prerender = false;

/** Live registered counts for the capacity bars: { counts: { [slug]: number } } */
export const GET: APIRoute = async () => {
  if (!kvConfigured()) return json({ configured: false, counts: {} }, 200, { 'Cache-Control': 'public, s-maxage=300' });
  try {
    const slugs = (await eventEntries()).map((e) => e.slug);
    const counts = await getRegistrations(slugs);
    return json({ configured: true, counts }, 200, {
      'Cache-Control': 'public, max-age=0, s-maxage=30, stale-while-revalidate=120',
    });
  } catch (err) {
    console.error('[registrations]', err);
    return json({ configured: true, error: 'unavailable', counts: {} }, 503);
  }
};
