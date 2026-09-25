import { getCollection, type CollectionEntry } from 'astro:content';
import { CITIES } from './cities';
import { daysUntil, fmtLong, fmtMedium, fmtShort, fmtTime, monthShort, parts, dayName, todayISO, addMinutes } from './dates';
import { dict, fmt, href, type Lang } from './i18n';
import { SITE } from './site';

export type EventEntry = CollectionEntry<'events'>;

export interface EventView {
  slug: string;
  title: string;
  venue: string;
  description: string;
  photo: string;
  date: string;
  time: string;
  end: string;
  topic: EventEntry['data']['topic'];
  topicLabel: string;
  city: string;
  capacity: number | null;
  registrationOpen: boolean;
  past: boolean;
  url: string;
  absoluteUrl: string;
  icsUrl: string;
  mapsUrl: string;
  timeLabel: string;
  endLabel: string;
  timeRange: string;
  dateLong: string;
  dateMedium: string;
  dateShort: string;
  day: number;
  month: string;
  year: number;
  weekday: string;
  place: string;
  agenda: { time: string; label: string }[];
}

let cache: EventEntry[] | null = null;

async function entries(): Promise<EventEntry[]> {
  if (!cache) {
    cache = (await getCollection('events')).sort((a, b) =>
      (a.data.date + a.data.time).localeCompare(b.data.date + b.data.time),
    );
    for (const e of cache) {
      if (!CITIES[e.data.city]) {
        throw new Error(
          `Event "${e.slug}" uses city "${e.data.city}", which is not in src/lib/cities.ts. Add it there with its map position.`,
        );
      }
    }
  }
  return cache;
}

const AGENDA_OFFSETS = [0, 15, 60, 90];

export function toView(e: EventEntry, lang: Lang, today = todayISO()): EventView {
  const t = dict(lang);
  const d = e.data;
  const en = lang === 'en' ? d.en ?? {} : {};
  const title = en.title || d.title;
  const venue = en.venue || d.venue;
  const p = parts(d.date);
  const url = href(lang, `/eventos/${e.slug}`);
  const timeLabel = fmtTime(d.time);
  const endLabel = fmtTime(d.end);
  return {
    slug: e.slug,
    title,
    venue,
    description: en.description || d.description,
    photo: en.photo || d.photo,
    date: d.date,
    time: d.time,
    end: d.end,
    topic: d.topic,
    topicLabel: t.events.topics[d.topic],
    city: d.city,
    capacity: d.capacity ?? null,
    registrationOpen: d.registrationOpen,
    past: daysUntil(d.date, today) < 0,
    url,
    absoluteUrl: `${SITE.url}${url}`,
    icsUrl: href(lang, `/eventos/${e.slug}.ics`),
    mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${d.venue.replace(/ \(.*\)/, '')}, ${d.city}, FL`)}`,
    timeLabel,
    endLabel,
    timeRange: fmt(t.events.timeRange, { start: timeLabel, end: endLabel }),
    dateLong: fmtLong(d.date, lang),
    dateMedium: fmtMedium(d.date, lang),
    dateShort: fmtShort(d.date, lang),
    day: p.d,
    month: monthShort(d.date, lang),
    year: p.y,
    weekday: dayName(d.date, lang),
    place: `${venue}, ${d.city}, FL`,
    agenda: t.modal.agenda.map((label, i) => ({ time: addMinutes(d.time, AGENDA_OFFSETS[i] ?? 0), label })),
  };
}

export async function allEvents(lang: Lang): Promise<EventView[]> {
  const today = todayISO();
  return (await entries()).map((e) => toView(e, lang, today));
}

/** Upcoming events (today included), soonest first. */
export async function upcomingEvents(lang: Lang): Promise<EventView[]> {
  return (await allEvents(lang)).filter((e) => !e.past);
}

/** Past events, most recent first. */
export async function pastEvents(lang: Lang): Promise<EventView[]> {
  return (await allEvents(lang)).filter((e) => e.past).reverse();
}

export async function eventEntries(): Promise<EventEntry[]> {
  return entries();
}

/** Minimal data the browser needs (modal, share text), keyed by slug. */
export function clientEvent(e: EventView) {
  return {
    slug: e.slug,
    title: e.title,
    topic: e.topicLabel,
    date: e.date,
    dateLong: e.dateLong,
    timeRange: e.timeRange,
    time: e.timeLabel,
    place: e.place,
    description: e.description,
    url: e.url,
    absoluteUrl: e.absoluteUrl,
    icsUrl: e.icsUrl,
    mapsUrl: e.mapsUrl,
    capacity: e.capacity,
    registrationOpen: e.registrationOpen,
    agenda: e.agenda,
  };
}
