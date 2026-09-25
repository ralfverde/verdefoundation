import type { APIRoute } from 'astro';
import { logoPng } from '../lib/og';

export const GET: APIRoute = () => new Response(logoPng(180), { headers: { 'Content-Type': 'image/png' } });
