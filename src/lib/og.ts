// Build-time image generation (OG cards, PNG logo, apple-touch-icon) with
// satori (layout -> SVG) and resvg (SVG -> PNG). Runs only during `astro build`.
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { Resvg } from '@resvg/resvg-js';
import satori from 'satori';
import { logoSvg } from './logo';

const require = createRequire(import.meta.url);
const fontFile = (w: number) =>
  readFileSync(require.resolve(`@fontsource/fira-sans/files/fira-sans-latin-${w}-normal.woff`));

let fonts: { name: string; data: Buffer; weight: 400 | 600 | 800; style: 'normal' }[] | null = null;
const getFonts = () =>
  (fonts ??= [
    { name: 'Fira Sans', data: fontFile(400), weight: 400, style: 'normal' },
    { name: 'Fira Sans', data: fontFile(600), weight: 600, style: 'normal' },
    { name: 'Fira Sans', data: fontFile(800), weight: 800, style: 'normal' },
  ]);

const logoDataUri = (variant: 'color' | 'navy' | 'white' = 'color') =>
  `data:image/svg+xml;base64,${Buffer.from(logoSvg(variant, 256)).toString('base64')}`;

type Node = { type: string; props: Record<string, unknown> };
const el = (type: string, style: Record<string, unknown>, children?: unknown, extra: Record<string, unknown> = {}): Node => ({
  type,
  props: { style, children, ...extra },
});

export function svgToPng(svg: string, width: number): Buffer {
  return new Resvg(svg, { fitTo: { mode: 'width', value: width } }).render().asPng();
}

/** 1200x630 social card: cream background, logo lockup, page title. */
export async function ogImage(title: string, eyebrow: string): Promise<Buffer> {
  const tree = el(
    'div',
    {
      width: 1200,
      height: 630,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '72px 80px',
      background: '#F7F5EE',
      fontFamily: 'Fira Sans',
      position: 'relative',
    },
    [
      el('img', { position: 'absolute', right: -60, bottom: -90, width: 520, height: 520, opacity: 0.08 }, undefined, {
        src: logoDataUri('navy'),
        width: 520,
        height: 520,
      }),
      el('div', { display: 'flex', alignItems: 'center', gap: 20 }, [
        el('img', { width: 84, height: 84 }, undefined, { src: logoDataUri('color'), width: 84, height: 84 }),
        el('div', { display: 'flex', fontSize: 46, fontWeight: 800, color: '#0B2545', letterSpacing: -1 }, [
          el('span', {}, 'Fundación\u00a0'),
          el('span', { color: '#0F8A5F' }, 'Verde'),
        ]),
      ]),
      el('div', { display: 'flex', flexDirection: 'column', gap: 22, maxWidth: 980 }, [
        el(
          'div',
          {
            display: 'flex',
            alignSelf: 'flex-start',
            padding: '8px 22px',
            borderRadius: 999,
            background: '#E3F2EA',
            color: '#0B6E4B',
            fontSize: 26,
            fontWeight: 600,
          },
          eyebrow,
        ),
        el('div', { display: 'flex', fontSize: title.length > 60 ? 58 : 68, fontWeight: 800, color: '#0B2545', lineHeight: 1.08, letterSpacing: -2 }, title),
      ]),
    ],
  );
  const svg = await satori(tree as never, { width: 1200, height: 630, fonts: getFonts() });
  return svgToPng(svg, 1200);
}

/** Square logo on cream (apple-touch-icon, JSON-LD logo). */
export function logoPng(size: number, background = '#F7F5EE'): Buffer {
  const pad = Math.round(size * 0.14);
  const inner = size - pad * 2;
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">` +
    `<rect width="${size}" height="${size}" fill="${background}"/>` +
    `<svg x="${pad}" y="${pad}" width="${inner}" height="${inner}" viewBox="0 0 64 64">${logoSvg('color').replace(/^<svg[^>]*>|<\/svg>$/g, '')}</svg></svg>`;
  return svgToPng(svg, size);
}
