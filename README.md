# Fundación Verde

Website for Fundación Verde, a family nonprofit in Miami that hosts free,
in-person legal-orientation events for the immigrant community. Spanish first
(`/`), English at `/en` (hidden behind a notice until the translation is
reviewed).

Built with **Astro 4** (static pages plus three small serverless functions),
TypeScript and plain CSS using the design tokens from the approved prototype.

- `PHOTO-SHOTLIST.md`: every photo placeholder, its page and the intended shot.
- `LAUNCH-CHECKLIST.md`: placeholders that must be replaced before launch.

## Local setup

Requirements: Node 20.3 or newer (22 recommended) and npm.

```bash
npm install
cp .env.example .env   # optional; everything works without it
npm run dev            # http://localhost:4321
```

Without any environment variables:

- forms validate and show their success state; submissions are printed to the
  dev server console instead of being sent;
- the donate button shows the prototype's "payment gateway coming soon" notice;
- capacity bars stay hidden (no registration counts).

Other commands:

| Command | What it does |
| --- | --- |
| `npm run build` | Type-check (`astro check`), build to `.vercel/output`, pin the functions' Node runtime |
| `npm run check` | Type-check only |
| `npm run shotlist` | Regenerate `PHOTO-SHOTLIST.md` (also marks which photos are done) |

## Project structure

```
src/
  pages/                 routes (thin wrappers; Spanish at /, English at /en)
    api/submit.ts        form submissions -> GHL webhook, Resend fallback
    api/checkout.ts      Stripe Checkout session (one-time or monthly)
    api/registrations.ts live registered counts for the capacity bars
    eventos/[slug].astro event detail page; [slug].ics.ts calendar file
    og/[...path].png.ts  generated social images (1200x630)
  views/                 one component per page, shared by both languages
  components/            Header, Footer, Logo, Icon, Photo, FloridaMap, EventCard...
  content/events/*.md    events collection
  content/faqs/{es,en}/  FAQ collection (/programas and /donar)
  i18n/es.json, en.json  every interface string
  data/photos.json       photo placeholders (alt text, tag, color)
  lib/                   dates, events, i18n, cities (map positions), site constants
  scripts/main.ts        browser behavior (modal, forms, filters, donate widget)
  styles/global.css      the prototype stylesheet, unchanged except where noted
```

## Content

### Events

One Markdown file per event in `src/content/events/`. The file name is the URL
slug (`/eventos/2027-01-23-hialeah`).

```yaml
---
title: "Cómo obtener tu estatus: opciones reales y primeros pasos"
date: 2027-01-23          # local date in Miami
time: "10:00"             # 24-hour start
end: "12:30"              # 24-hour end
topic: "Orientación migratoria"   # or "Navegar el sistema", "Conoce tus derechos"
city: "Hialeah"           # must exist in src/lib/cities.ts
venue: "Centro comunitario (sede por confirmar)"
description: "..."
photo: "Salón comunitario en Hialeah durante la charla"  # shot description / alt text
registrationOpen: true
capacity: 120             # omit to hide the capacity bar
en:                       # optional English versions
  title: "..."
  venue: "..."
  description: "..."
  photo: "..."
---
```

Everything else is derived: the home cards (next three), the calendar grouped
by month with its filters, "Eventos anteriores", the hero ticket, the
announcement bar, the countdown, the next event per program on `/programas`,
the Florida map markers and the "sedes" list.

**New city?** Add it to `src/lib/cities.ts` with its position on the map
(the build fails with a clear message otherwise).

Past events drop out of the upcoming lists at build time. The
`Daily rebuild` GitHub Action redeploys every morning so that happens without
anyone pushing a change (see Deploy).

### Photos

Put the image in `src/assets/img/` using the path from `PHOTO-SHOTLIST.md`
(e.g. `src/assets/img/inicio/hero.jpg`). `Photo.astro` picks it up on the next
build, generates responsive WebP sizes, lazy-loads it (except the hero) and
removes the placeholder. Event photos are `src/assets/img/eventos/<slug>.jpg`.

### Text

All interface copy is in `src/i18n/es.json` and `src/i18n/en.json` (same keys).
FAQs are in `src/content/faqs/`. Organization details (email, phone, WhatsApp
number, social links, address, EIN) are in `src/lib/site.ts`.

### Logo

`src/lib/logo.ts` holds the split-heart mark. It feeds `Logo.astro`, the
favicon, `/logo.png`, the apple-touch icon, the OG images and the photo
placeholder watermark. To use the final SVG from the brand bundle, replace the
markup in `logoInner()` keeping `viewBox="0 0 64 64"`.

## Integrations

| Feature | Variables | Notes |
| --- | --- | --- |
| Forms | `PUBLIC_GHL_WEBHOOK_URL` (or per form `PUBLIC_GHL_WEBHOOK_URL_REGISTRATION`, `_VOLUNTEER`, `_CONTACT`, `_NEWSLETTER`) | JSON payload with `form_type`, contact fields, `utm_*`, `page_url`, `referrer`, `tags`. Registrations add `event_slug`, `event_title`, `event_date`, `attendees`. Newsletter sends `newsletter_channel` plus `newsletter_email` or `newsletter_whatsapp` in separate fields. Honeypot field `website`. |
| Form fallback | `RESEND_API_KEY`, `RESEND_FROM`, `CONTACT_TO` | Used when GHL is not set or fails. `RESEND_FROM` must be on a domain verified in Resend. |
| Capacity bars | `KV_REST_API_URL` + `KV_REST_API_TOKEN` (Vercel KV / Upstash) | Each registration adds its attendee count. Bars and "lugares disponibles" appear only when real counts load. |
| Donations | `STRIPE_SECRET_KEY`, `PUBLIC_STRIPE_PUBLISHABLE_KEY` | Checkout in USD, one-time (`payment`) or monthly (`subscription`). Success returns to `/donar/gracias`, cancel to `/donar`. Turn on "Successful payments" customer emails in Stripe so donors get the receipt the site promises. |
| Analytics | `PUBLIC_PLAUSIBLE_DOMAIN` or `PUBLIC_GA4_ID` | Custom events: `Event Registration`, `Donate Click`, `Checkout Started`, `Newsletter Signup`. |
| English | `PUBLIC_ENGLISH_ENABLED=true` | Turns the EN toggle into a link, indexes `/en`, adds hreflang and English sitemap entries. |

## Deploy

### Vercel (recommended)

1. Import the repository in Vercel. The Astro preset is detected; the build
   command is `npm run build`, and the output is written to `.vercel/output`.
2. Add the environment variables above (Production and Preview).
3. For capacity bars: Storage > create a KV (Upstash Redis) database and
   connect it to the project; that sets `KV_REST_API_URL` and `KV_REST_API_TOKEN`.
4. Domain: add `fundacionverde.org` and set `PUBLIC_SITE_URL` to match.
5. Daily rebuild: Settings > Git > Deploy Hooks > create a hook for the
   production branch, then add its URL as the GitHub Actions secret
   `VERCEL_DEPLOY_HOOK_URL`.

`scripts/vercel-runtime.mjs` sets the serverless functions to `nodejs22.x`
after the build, because the Astro 4 adapter would otherwise fall back to
Node 18, which Vercel has retired. Override with `VERCEL_NODE_RUNTIME`.

### Cloudflare Pages (alternative)

The API routes use only `fetch` (no Node-only SDKs), so they run on Workers.

1. `npm uninstall @astrojs/vercel && npm install @astrojs/cloudflare@10`
2. In `astro.config.mjs`, replace the adapter with
   `cloudflare({ imageService: 'compile' })` and remove the
   `vercel-runtime.mjs` step from the build script.
3. Pages project: build command `npm run build`, output directory `dist`.
   Add the same environment variables. For the capacity counter, use an
   Upstash Redis database (`UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`).
4. Replace the deploy hook in the daily rebuild with a Cloudflare Pages
   deploy hook.
