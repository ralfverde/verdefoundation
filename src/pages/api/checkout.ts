import type { APIRoute } from 'astro';
import { env, json } from '../../lib/server/env';

export const prerender = false;

const MIN = 1;
const MAX = 25000;

/**
 * Creates a Stripe Checkout Session for a one-time donation or a monthly
 * subscription, in USD, and returns its URL. Uses the Stripe REST API
 * directly (no SDK) so it runs on any serverless runtime.
 */
export const POST: APIRoute = async ({ request }) => {
  const secret = env('STRIPE_SECRET_KEY');
  if (!secret) return json({ ok: false, error: 'not_configured' }, 503);

  let body: { amount?: unknown; frequency?: unknown; lang?: unknown; page_url?: unknown };
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: 'invalid_json' }, 400);
  }
  const amount = Number(body.amount);
  const monthly = body.frequency === 'monthly';
  const lang = body.lang === 'en' ? 'en' : 'es';
  if (!Number.isInteger(amount) || amount < MIN || amount > MAX) return json({ ok: false, error: 'invalid_amount' }, 422);

  const origin = new URL(request.url).origin;
  const prefix = lang === 'en' ? '/en' : '';
  const name = monthly
    ? lang === 'en' ? 'Monthly donation to Fundación Verde' : 'Donación mensual a Fundación Verde'
    : lang === 'en' ? 'Donation to Fundación Verde' : 'Donación a Fundación Verde';

  const form = new URLSearchParams({
    mode: monthly ? 'subscription' : 'payment',
    success_url: `${origin}${prefix}/donar/gracias?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}${prefix}/donar`,
    locale: lang,
    'line_items[0][quantity]': '1',
    'line_items[0][price_data][currency]': 'usd',
    'line_items[0][price_data][unit_amount]': String(amount * 100),
    'line_items[0][price_data][product_data][name]': name,
    'metadata[frequency]': monthly ? 'monthly' : 'once',
    'metadata[source]': 'fundacionverde.org',
  });
  if (monthly) {
    form.set('line_items[0][price_data][recurring][interval]', 'month');
    form.set('subscription_data[metadata][source]', 'fundacionverde.org');
  } else {
    form.set('submit_type', 'donate');
    form.set('customer_creation', 'always');
  }
  if (typeof body.page_url === 'string') form.set('metadata[page_url]', body.page_url.slice(0, 450));

  const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${secret}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: form,
  });
  const data = (await res.json()) as { url?: string; error?: { message?: string } };
  if (!res.ok || !data.url) {
    console.error('[checkout] Stripe error:', res.status, data.error?.message);
    return json({ ok: false, error: 'stripe_error' }, 502);
  }
  return json({ ok: true, url: data.url });
};
