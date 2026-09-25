import es from '../i18n/es.json';
import en from '../i18n/en.json';
import { ENGLISH_ENABLED } from './site';

export type Lang = 'es' | 'en';
export type Dict = typeof es;

export const DICTS: Record<Lang, Dict> = { es, en: en as Dict };
export const LANGS: Lang[] = ['es', 'en'];

export function dict(lang: Lang): Dict {
  return DICTS[lang];
}

/** Replace {placeholders} in a string. */
export function fmt(template: string, vars: Record<string, string | number> = {}): string {
  return template.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m));
}

/** Language of a URL pathname. */
export function langFromPath(pathname: string): Lang {
  return /^\/en(\/|$)/.test(pathname) ? 'en' : 'es';
}

/** Build a localized internal URL from a Spanish-site path such as "/eventos". */
export function href(lang: Lang, path: string): string {
  if (lang === 'es') return path;
  if (path === '/') return '/en';
  return `/en${path}`;
}

/** Strip the language prefix, giving the equivalent Spanish-site path. */
export function basePath(pathname: string): string {
  const p = pathname.replace(/^\/en(?=\/|$)/, '') || '/';
  return p.length > 1 ? p.replace(/\/$/, '') : p;
}

/**
 * Where the header toggle should point. While the English copy is under
 * review (PUBLIC_ENGLISH_ENABLED is not "true") the EN option stays visible
 * but does not navigate, as in the prototype.
 */
export function alternateHref(pathname: string, target: Lang): string | null {
  if (target === 'en' && !ENGLISH_ENABLED) return null;
  return href(target, basePath(pathname));
}
