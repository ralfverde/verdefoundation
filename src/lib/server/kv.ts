// Registration counter in Upstash Redis / Vercel KV, over its REST API
// (no SDK, so it also runs on edge runtimes). Configure either
// KV_REST_API_URL + KV_REST_API_TOKEN (Vercel KV) or
// UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN.
import { env } from './env';

function config() {
  const url = env('KV_REST_API_URL') ?? env('UPSTASH_REDIS_REST_URL');
  const token = env('KV_REST_API_TOKEN') ?? env('UPSTASH_REDIS_REST_TOKEN');
  return url && token ? { url: url.replace(/\/$/, ''), token } : null;
}

export const kvConfigured = () => config() !== null;

async function command(args: (string | number)[]): Promise<unknown> {
  const c = config();
  if (!c) throw new Error('KV not configured');
  const res = await fetch(c.url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${c.token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(args),
  });
  if (!res.ok) throw new Error(`KV ${args[0]} failed: ${res.status}`);
  const data = (await res.json()) as { result?: unknown; error?: string };
  if (data.error) throw new Error(data.error);
  return data.result;
}

const key = (slug: string) => `fv:registered:${slug}`;

export async function addRegistrations(slug: string, attendees: number): Promise<number> {
  return Number(await command(['INCRBY', key(slug), attendees]));
}

export async function getRegistrations(slugs: string[]): Promise<Record<string, number>> {
  if (!slugs.length) return {};
  const values = (await command(['MGET', ...slugs.map(key)])) as (string | null)[];
  return Object.fromEntries(slugs.map((s, i) => [s, Number(values[i] ?? 0) || 0]));
}
