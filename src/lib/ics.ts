import { localToUtc } from './dates';
import type { EventView } from './events';
import { SITE } from './site';

const pad = (n: number) => String(n).padStart(2, '0');
const stamp = (d: Date) =>
  `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`;
const clean = (s: string) => s.replace(/\\/g, '\\\\').replace(/;/g, '\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');

/** Fold lines longer than 75 octets, as RFC 5545 requires. */
function fold(line: string): string {
  const bytes = new TextEncoder().encode(line);
  if (bytes.length <= 75) return line;
  const out: string[] = [];
  let current = '';
  for (const ch of line) {
    if (new TextEncoder().encode(current + ch).length > (out.length ? 74 : 75)) {
      out.push(current);
      current = ch;
    } else current += ch;
  }
  out.push(current);
  return out.join('\r\n ');
}

/** Calendar file for one event (served statically at /eventos/<slug>.ics). */
export function icsFor(ev: EventView, freeLine: string): string {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Fundacion Verde//Eventos//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${ev.slug}@fundacionverde.org`,
    `DTSTAMP:${stamp(new Date())}`,
    `DTSTART:${stamp(localToUtc(ev.date, ev.time))}`,
    `DTEND:${stamp(localToUtc(ev.date, ev.end))}`,
    `SUMMARY:${clean(ev.title)}`,
    `LOCATION:${clean(ev.place)}`,
    `DESCRIPTION:${clean(`${ev.description} ${freeLine}. ${SITE.name}.\n${ev.absoluteUrl}`)}`,
    `URL:${ev.absoluteUrl}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  return lines.map(fold).join('\r\n') + '\r\n';
}
