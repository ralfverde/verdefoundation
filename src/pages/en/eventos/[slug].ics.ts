import type { APIRoute, GetStaticPaths } from 'astro';
import { eventEntries, toView } from '../../../lib/events';
import { icsFor } from '../../../lib/ics';
import { dict } from '../../../lib/i18n';

export const getStaticPaths = (async () => {
  const entries = await eventEntries();
  return entries.map((entry) => ({ params: { slug: entry.slug }, props: { event: toView(entry, 'en') } }));
}) satisfies GetStaticPaths;

export const GET: APIRoute = ({ props }) =>
  new Response(icsFor(props.event, dict('en').common.entryFree), {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="fundacion-verde-${props.event.slug}.ics"`,
    },
  });
