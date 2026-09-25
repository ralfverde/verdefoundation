// The split-heart mark: an emerald heart cut by a chevron and a center gap,
// with the navy chevron drawn below it. Single source for Logo.astro, the
// favicon, the OG image and the photo placeholder watermark.
//
// To swap in the final logo from the brand bundle, replace the markup in
// `logoSvg` (keep viewBox 0 0 64 64 so lockup sizes do not change).

export const LOGO_COLORS = {
  color: { heart: '#0F8A5F', chevron: '#0B2545' },
  navy: { heart: '#0B2545', chevron: '#0B2545' },
  white: { heart: '#FFFFFF', chevron: '#FFFFFF' },
} as const;

export type LogoVariant = keyof typeof LOGO_COLORS;

let counter = 0;

/** Inner markup (defs + shapes) for a 64x64 viewBox. `id` keeps masks unique per page. */
export function logoInner(variant: LogoVariant = 'color', id = `mark-cut-${++counter}`): string {
  const c = LOGO_COLORS[variant];
  return (
    `<defs><mask id="${id}"><rect width="64" height="64" fill="#fff"/>` +
    `<polygon points="-2,15.1 32,49.1 66,15.1 66,70 -2,70" fill="#000"/>` +
    `<rect x="30.4" width="3.2" height="64" fill="#000"/></mask></defs>` +
    `<path d="M32 56C32 56 6 40 6 22 6 14 12 8 20 8c6 0 10 3 12 7 2-4 6-7 12-7 8 0 14 6 14 14 0 18-26 34-26 34z" fill="${c.heart}" mask="url(#${id})"/>` +
    `<polyline points="11,38 32,59 53,38" fill="none" stroke="${c.chevron}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>`
  );
}

/** Standalone SVG document (favicon, OG image). */
export function logoSvg(variant: LogoVariant = 'color', size = 64): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="${size}" height="${size}">${logoInner(variant, 'm')}</svg>`;
}
