// Validation and delivery for the four site forms. Delivery goes to the
// GoHighLevel webhook when configured, otherwise to an email via Resend.
import { env, isDev } from './env';

export const FORM_TYPES = ['registration', 'volunteer', 'contact', 'newsletter'] as const;
export type FormType = (typeof FORM_TYPES)[number];

export type Payload = Record<string, string | number | boolean | string[] | null>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const clip = (v: unknown, max = 200) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const digits = (v: string) => v.replace(/\D/g, '');

export class FormError extends Error {}

function require(fields: Record<string, string>, names: string[]) {
  for (const n of names) if (!fields[n]) throw new FormError(`Missing field: ${n}`);
}

/** Normalize and validate a submission. Throws FormError on bad input. */
export function validate(type: FormType, raw: Record<string, unknown>): Record<string, string> {
  const f: Record<string, string> = {
    name: clip(raw.name),
    email: clip(raw.email).toLowerCase(),
    phone: clip(raw.phone, 40),
    city: clip(raw.city),
    role: clip(raw.role),
    reason: clip(raw.reason),
    message: clip(raw.message, 4000),
    channel: clip(raw.channel, 20),
    event_slug: clip(raw.event_slug, 120),
    attendees: clip(raw.attendees, 3),
    opt_in: raw.opt_in === 'yes' || raw.opt_in === true ? 'yes' : 'no',
    consent: raw.consent === 'yes' || raw.consent === true ? 'yes' : 'no',
  };
  if (f.email && !EMAIL.test(f.email)) throw new FormError('Invalid email');
  if (f.phone && digits(f.phone).length < 7) throw new FormError('Invalid phone');

  switch (type) {
    case 'registration': {
      require(f, ['name', 'phone', 'event_slug']);
      const n = Number.parseInt(f.attendees || '1', 10);
      if (!Number.isInteger(n) || n < 1 || n > 5) throw new FormError('Invalid attendees');
      f.attendees = String(n);
      break;
    }
    case 'volunteer':
      require(f, ['name', 'email', 'role']);
      if (f.consent !== 'yes') throw new FormError('Consent required');
      break;
    case 'contact':
      require(f, ['name', 'email', 'reason', 'message']);
      break;
    case 'newsletter':
      if (f.channel !== 'email' && f.channel !== 'whatsapp') throw new FormError('Invalid channel');
      if (f.channel === 'email') require(f, ['email']);
      else require(f, ['phone']);
      break;
  }
  return f;
}

function webhookFor(type: FormType): string | undefined {
  return env(`PUBLIC_GHL_WEBHOOK_URL_${type.toUpperCase()}`) ?? env('PUBLIC_GHL_WEBHOOK_URL');
}

async function sendToGhl(url: string, payload: Payload): Promise<void> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`GHL webhook responded ${res.status}`);
}

const SUBJECTS: Record<FormType, string> = {
  registration: 'Nueva reserva de evento',
  volunteer: 'Nueva solicitud de voluntariado o alianza',
  contact: 'Nuevo mensaje de contacto',
  newsletter: 'Nueva suscripción al boletín',
};

async function sendEmail(type: FormType, payload: Payload): Promise<void> {
  const key = env('RESEND_API_KEY');
  if (!key) throw new Error('Resend not configured');
  const to = env('CONTACT_TO') ?? 'hola@fundacionverde.org';
  const from = env('RESEND_FROM') ?? 'Fundación Verde <sitio@fundacionverde.org>';
  const text = Object.entries(payload)
    .filter(([, v]) => v !== '' && v !== null && !(Array.isArray(v) && !v.length))
    .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
    .join('\n');
  const subject = `${SUBJECTS[type]}${payload.event_title ? `: ${payload.event_title}` : ''}`;
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from,
      to: [to],
      subject,
      text,
      ...(typeof payload.email === 'string' && payload.email ? { reply_to: payload.email } : {}),
    }),
  });
  if (!res.ok) throw new Error(`Resend responded ${res.status}: ${await res.text()}`);
}

/**
 * Deliver a submission: GHL first (if configured), Resend as fallback.
 * Returns the channel used. Throws if nothing could deliver it.
 */
export async function deliver(type: FormType, payload: Payload): Promise<'ghl' | 'email' | 'dev-log'> {
  const errors: string[] = [];
  const hook = webhookFor(type);
  if (hook) {
    try {
      await sendToGhl(hook, payload);
      return 'ghl';
    } catch (err) {
      errors.push(String(err));
    }
  }
  if (env('RESEND_API_KEY')) {
    try {
      await sendEmail(type, payload);
      return 'email';
    } catch (err) {
      errors.push(String(err));
    }
  }
  if (!hook && !env('RESEND_API_KEY') && isDev) {
    console.info(`[forms] ${type} (no GHL or Resend configured, dev only):`, payload);
    return 'dev-log';
  }
  throw new Error(errors.length ? errors.join('; ') : 'No delivery channel configured (PUBLIC_GHL_WEBHOOK_URL or RESEND_API_KEY)');
}
