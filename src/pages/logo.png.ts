import type { APIRoute } from 'astro';
import { logoPng } from '../lib/og';

export const GET: APIRoute = () => new Response(logoPng(512), { headers: { 'Content-Type': 'image/png' } });
