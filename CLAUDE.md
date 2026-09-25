# Fundación Verde (fundacionverde.org)

Website for Fundación Verde, a family nonprofit in Miami that hosts free,
in-person legal-orientation events for the immigrant community. It works
alongside Verde Law (the law firm that provides volunteer lawyers) but is an
independent nonprofit. The site mentions Verde Law only where the approved copy
already does (partner strip, /mision).

## Stack

- Astro 4 (`output: 'hybrid'`: every page is prerendered; only `src/pages/api/*`
  run as serverless functions). Vercel adapter 7. TypeScript strict.
- Plain CSS in `src/styles/global.css`, ported from the approved prototype. No
  Tailwind. Keep the tokens in `:root` as they are.
- Content collections: `events`, `faqs` (`src/content/config.ts`).
- i18n: Spanish at `/` (default), English at `/en`. Page files in `src/pages`
  are thin wrappers around `src/views/*Page.astro`, which take a `lang` prop.

## Commands

```bash
npm run dev       # http://localhost:4321
npm run build     # astro check + build + pin Node runtime. Must pass before committing.
npm run shotlist  # regenerate PHOTO-SHOTLIST.md after adding photos or events
```

## Rules

- **Copy:** Spanish first, sentence case, never em dashes or en dashes (use
  commas, colons or periods). Do not rewrite approved copy. Every string lives
  in `src/i18n/es.json` and `src/i18n/en.json` with identical keys; add new
  strings to both.
- **No legal advice** is given through the site. Keep the footer disclaimer and
  the note on the contact form.
- **Never invent** testimonials, quotes, names, numbers or dates. Placeholders
  are tracked in `LAUNCH-CHECKLIST.md`; update it when you add or resolve one.
- **Design:** the prototype is the source of truth. Allowed motion: the hero
  entrance only. Keep breakpoints 1080 / 960 / 640, the `prefers-reduced-motion`
  rules and the mobile sticky bar.
- **Photos** go through `Photo.astro` with an entry in `src/data/photos.json`.
  Event photos are keyed by slug.
- **Events:** each event's `city` must exist in `src/lib/cities.ts` (map
  position). Registered counts come only from real registrations (KV counter).
- **Accessibility:** labels on every field, `aria-pressed` on toggles, focus
  trap in the modal, AA contrast. Lighthouse mobile target is 95+ in all four
  categories.
