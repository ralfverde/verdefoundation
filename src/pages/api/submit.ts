import type { APIRoute } from 'astro';
import { eventEntries } from '../../lib/events';
import { deliver, FORM_TYPES, FormError, validate, type FormType, type Payload } from '../../lib/server/forms';
import { json } from '../../lib/server/env';
import { addRegistrations, kvConfigured } from '../../lib/server/kv';

export const prerender = false;

const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'] as const;
const str = (v: unknown, max = 500) => (typeof v === 'string' ? v.slice(0, max) : '');

export const POST: APIRoute = async ({ request }) => {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return json({ ok: false, error: 'invalid_json' }, 400);
  }

  // Honeypot: real people never see this field. Pretend success so bots move on.
  if (str(body.website)) return json({ ok: true });

  const type = body.form_type as FormType;
  if (!FORM_TYPES.includes(type)) return json({ ok: false, error: 'invalid_form_type' }, 400);

  let fields: Record<string, string>;
  try {
    fields = validate(type, (body.fields ?? {}) as Record<string, unknown>);
  } catch (err) {
    if (err instanceof FormError) return json({ ok: false, error: err.message }, 422);
    throw err;
  }

  const payload: Payload = {
    form_type: type,
    language: body.lang === 'en' ? 'en' : 'es',
    name: fields.name,
    first_name: fields.name.split(/\s+/)[0] ?? '',
    last_name: fields.name.split(/\s+/).slice(1).join(' '),
    email: fields.email,
    phone: fields.phone,
    page_url: str(body.page_url),
    referrer: str(body.referrer),
    submitted_at: new Date().toISOString(),
    tags: [`web-${type}`],
  };
  for (const k of UTM_KEYS) payload[k] = str((body.utm as Record<string, unknown> | undefined)?.[k], 200);

  let slug = '';
  let attendees = 0;
  switch (type) {
    case 'registration': {
      const entry = (await eventEntries()).find((e) => e.slug === fields.event_slug);
      if (!entry) return json({ ok: false, error: 'unknown_event' }, 422);
      slug = entry.slug;
      attendees = Number(fields.attendees);
      Object.assign(payload, {
        event_slug: slug,
        event_title: entry.data.title,
        event_date: entry.data.date,
        event_time: entry.data.time,
        event_city: entry.data.city,
        event_venue: entry.data.venue,
        attendees,
        newsletter_opt_in: fields.opt_in === 'yes',
      });
      (payload.tags as string[]).push(`evento-${slug}`);
      break;
    }
    case 'volunteer':
      Object.assign(payload, { city: fields.city, volunteer_role: fields.role, message: fields.message, consent: true });
      break;
    case 'contact':
      Object.assign(payload, { contact_reason: fields.reason, message: fields.message });
      break;
    case 'newsletter':
      // Channel and value go in separate fields so WhatsApp broadcasts and
      // email sends can be segmented in GHL.
      Object.assign(payload, {
        newsletter_channel: fields.channel,
        newsletter_email: fields.channel === 'email' ? fields.email : '',
        newsletter_whatsapp: fields.channel === 'whatsapp' ? fields.phone : '',
      });
      (payload.tags as string[]).push(`boletin-${fields.channel}`);
      break;
  }

  try {
    await deliver(type, payload);
  } catch (err) {
    console.error('[submit] delivery failed:', err);
    return json({ ok: false, error: 'delivery_failed' }, 502);
  }

  if (type === 'registration' && kvConfigured()) {
    try {
      await addRegistrations(slug, attendees);
    } catch (err) {
      // The registration itself was delivered; a counter hiccup should not fail it.
      console.error('[submit] registration counter failed:', err);
    }
  }

  return json({ ok: true });
};
