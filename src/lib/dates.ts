import type { Lang } from './i18n';
import { SITE } from './site';

const MONTHS = {
  es: ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'],
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
};
const MONTHS_LONG = {
  es: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'],
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
};
const DAYS = {
  es: ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'],
  en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
};

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** Parse YYYY-MM-DD as a calendar date (no time zone shifting). */
export function parts(iso: string) {
  const [y, m, d] = iso.split('-').map(Number);
  const weekday = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  return { y, m, d, weekday };
}

/** "Sábado 23 de enero de 2027" / "Saturday, January 23, 2027" */
export function fmtLong(iso: string, lang: Lang): string {
  const { y, m, d, weekday } = parts(iso);
  return lang === 'es'
    ? `${cap(DAYS.es[weekday])} ${d} de ${MONTHS_LONG.es[m - 1]} de ${y}`
    : `${DAYS.en[weekday]}, ${MONTHS_LONG.en[m - 1]} ${d}, ${y}`;
}

/** "23 ene 2027" / "Jan 23, 2027" */
export function fmtMedium(iso: string, lang: Lang): string {
  const { y, m, d } = parts(iso);
  return lang === 'es' ? `${d} ${MONTHS.es[m - 1]} ${y}` : `${MONTHS.en[m - 1]} ${d}, ${y}`;
}

/** "sáb 23 ene" / "Sat Jan 23" (announcement bar) */
export function fmtShort(iso: string, lang: Lang): string {
  const { m, d, weekday } = parts(iso);
  return lang === 'es'
    ? `${DAYS.es[weekday].slice(0, 3)} ${d} ${MONTHS.es[m - 1]}`
    : `${DAYS.en[weekday].slice(0, 3)} ${MONTHS.en[m - 1]} ${d}`;
}

export const monthShort = (iso: string, lang: Lang) => MONTHS[lang][parts(iso).m - 1];
export const monthLong = (iso: string, lang: Lang) => MONTHS_LONG[lang][parts(iso).m - 1];
export const dayName = (iso: string, lang: Lang) => DAYS[lang][parts(iso).weekday];
/** "Enero 2027" / "January 2027" (month group heading) */
export const monthHeading = (iso: string, lang: Lang) => `${cap(monthLong(iso, lang))} ${parts(iso).y}`;

/** "10:00" -> "10:00 a.m." */
export function fmtTime(hhmm: string): string {
  const [h, m] = hhmm.split(':').map(Number);
  const suffix = h < 12 ? 'a.m.' : 'p.m.';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, '0')} ${suffix}`;
}

/** Add minutes to "HH:MM". */
export function addMinutes(hhmm: string, minutes: number): string {
  const [h, m] = hhmm.split(':').map(Number);
  const t = h * 60 + m + minutes;
  return `${String(Math.floor(t / 60) % 24).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`;
}

/** Today's date (YYYY-MM-DD) in Miami, regardless of where the build runs. */
export function todayISO(now = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: SITE.timezone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
}

/** Whole days from today (Miami) to the given date. */
export function daysUntil(iso: string, today = todayISO()): number {
  const a = parts(today);
  const b = parts(iso);
  return Math.round((Date.UTC(b.y, b.m - 1, b.d) - Date.UTC(a.y, a.m - 1, a.d)) / 86400000);
}

/** UTC instant for a local wall-clock time in Miami, as an ICS/ISO stamp. */
export function localToUtc(iso: string, hhmm: string): Date {
  const { y, m, d } = parts(iso);
  const [h, min] = hhmm.split(':').map(Number);
  const guess = Date.UTC(y, m - 1, d, h, min);
  // Offset of America/New_York at that instant (handles DST).
  const tz = new Intl.DateTimeFormat('en-US', { timeZone: SITE.timezone, timeZoneName: 'longOffset' })
    .formatToParts(new Date(guess))
    .find((p) => p.type === 'timeZoneName')?.value ?? 'GMT-05:00';
  const match = tz.match(/GMT([+-])(\d{2}):(\d{2})/);
  const offsetMin = match ? (match[1] === '-' ? -1 : 1) * (Number(match[2]) * 60 + Number(match[3])) : -300;
  return new Date(guess - offsetMin * 60000);
}

/** ISO 8601 with the Miami offset, for JSON-LD: 2027-01-23T10:00:00-05:00 */
export function isoWithOffset(iso: string, hhmm: string): string {
  const utc = localToUtc(iso, hhmm);
  const { y, m, d } = parts(iso);
  const [h, min] = hhmm.split(':').map(Number);
  const offsetMin = Math.round((Date.UTC(y, m - 1, d, h, min) - utc.getTime()) / 60000);
  const sign = offsetMin < 0 ? '-' : '+';
  const abs = Math.abs(offsetMin);
  return `${iso}T${hhmm}:00${sign}${String(Math.floor(abs / 60)).padStart(2, '0')}:${String(abs % 60).padStart(2, '0')}`;
}
