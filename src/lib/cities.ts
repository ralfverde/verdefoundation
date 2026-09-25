// Venue cities and where they sit on the stylized Florida map
// (FloridaMap.astro, viewBox 0 0 250 262). Every event's `city` must be listed
// here. Cities in the same region share one ring and label on the map.

export interface Region {
  id: string;
  name: string;
  ring: { x: number; y: number; r: number };
  label: { x: number; y: number };
}

export const REGIONS: Record<string, Region> = {
  miami: { id: 'miami', name: 'Miami-Dade', ring: { x: 187, y: 210, r: 14 }, label: { x: 204, y: 207 } },
  orlando: { id: 'orlando', name: 'Orlando', ring: { x: 170, y: 100, r: 9 }, label: { x: 178, y: 98 } },
  tampa: { id: 'tampa', name: 'Tampa', ring: { x: 127, y: 131, r: 9 }, label: { x: 134, y: 128 } },
};

export const CITIES: Record<string, { region: keyof typeof REGIONS; x: number; y: number }> = {
  Hialeah: { region: 'miami', x: 190, y: 204 },
  Doral: { region: 'miami', x: 186, y: 209 },
  Kendall: { region: 'miami', x: 185, y: 215 },
  Homestead: { region: 'miami', x: 183, y: 222 },
  Orlando: { region: 'orlando', x: 170, y: 100 },
  Tampa: { region: 'tampa', x: 127, y: 131 },
};
