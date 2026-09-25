import { CITIES, REGIONS } from './cities';
import { monthLong } from './dates';
import { dict, fmt, type Lang } from './i18n';
import type { EventView } from './events';

export interface RegionSummary {
  id: string;
  name: string;
  /** Cities with upcoming events, in date order */
  cities: string[];
  count: number;
  /** Line under the region name in the "sedes" list */
  listSub: string;
  /** Small label next to the map marker */
  mapSub: string;
  ring: { x: number; y: number; r: number };
  label: { x: number; y: number };
  dots: { x: number; y: number }[];
}

/** Group upcoming events by map region (drives FloridaMap and the "sedes" list). */
export function summarizeRegions(events: EventView[], lang: Lang): RegionSummary[] {
  const t = dict(lang).where;
  const subs = t.regionSubs as Record<string, string>;
  return Object.values(REGIONS)
    .map((region) => {
      const evs = events.filter((e) => CITIES[e.city]?.region === region.id);
      const cities = [...new Set(evs.map((e) => e.city))];
      const first = evs[0];
      const multi = cities.length > 1;
      return {
        id: region.id,
        name: region.name,
        cities,
        count: evs.length,
        listSub: subs[region.name] ?? cities.join(', '),
        mapSub: !first ? '' : multi ? fmt(t.multiSince, { n: cities.length, month: monthLong(first.date, lang) }) : monthLong(first.date, lang),
        ring: multi ? region.ring : { ...region.ring, r: 9 },
        label: region.label,
        dots: cities.map((c) => ({ x: CITIES[c].x, y: CITIES[c].y })),
      };
    })
    .filter((r) => r.count > 0);
}
