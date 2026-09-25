import { defineCollection, z } from 'astro:content';
import { TOPICS } from '../lib/site';

const hhmm = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Use 24-hour HH:MM, e.g. "10:00"');

const events = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    /** Local date of the event (America/New_York), YYYY-MM-DD */
    date: z
      .union([z.date(), z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD')])
      .transform((d) => (d instanceof Date ? d.toISOString().slice(0, 10) : d)),
    /** Start and end time, 24-hour HH:MM, local time */
    time: hhmm,
    end: hhmm,
    topic: z.enum(TOPICS),
    /** Must exist in src/lib/cities.ts so it can be placed on the Florida map */
    city: z.string(),
    venue: z.string(),
    description: z.string(),
    /** Placeholder description of the intended photo; also the image file name hint */
    photo: z.string(),
    registrationOpen: z.boolean().default(true),
    /** Seats available. Leave empty to hide the capacity bar. */
    capacity: z.number().int().positive().optional().nullable(),
    en: z
      .object({
        title: z.string().optional(),
        venue: z.string().optional(),
        description: z.string().optional(),
        photo: z.string().optional(),
      })
      .optional(),
  }),
});

const faqs = defineCollection({
  type: 'content',
  schema: z.object({
    question: z.string(),
    group: z.enum(['programas', 'donar']),
    order: z.number().int(),
  }),
});

export const collections = { events, faqs };
