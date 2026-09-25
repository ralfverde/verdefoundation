# Launch checklist

Placeholders carried over from the prototype that must be confirmed or
replaced before the site goes live. Each item says where to change it.

## Content

- [ ] **Event dates, venues and capacities.** All six events are placeholders:
  every venue reads "sede por confirmar" and the dates are the planned first
  season. Edit `src/content/events/*.md` (`date`, `venue`, `capacity`, and the
  `en:` block). Add any new city to `src/lib/cities.ts`.
- [ ] **Registered counts.** The prototype's numbers (34, 12, 9, 5, 4, 2) were
  placeholders and were not carried over. Real events start at 0: the counter
  only adds registrations submitted through the site. Before launch, clear any
  test registrations from the KV database (keys `fv:registered:<slug>`).
- [ ] **Contact details** in `src/lib/site.ts`:
  - [ ] `hola@fundacionverde.org` (also in `src/i18n/*.json` > `common.formError`
    and the privacy/terms text, and the Resend `CONTACT_TO` variable)
  - [ ] phone `(305) 000 0000` (`phoneDisplay`; also the form placeholders in
    `src/i18n/*.json` > `common.placeholderPhone`)
  - [ ] WhatsApp number `13050000000`, used in the `wa.me` links on /contacto
    and in the footer (`whatsappNumber`)
  - [ ] `@fundacionverde` handle, Instagram and Facebook URLs
  - [ ] physical address (`address`; /contacto shows "Dirección por confirmar"
    until it is set)
- [ ] **Board members on /mision.** Three "Nombre por confirmar" cards
  (Vicepresidencia, Tesorería, Coordinación de eventos) with generic bios:
  `src/i18n/*.json` > `mision.boardPending`, `boardRoles`, `boardBio`. Once
  names exist, give each card its own name and bio.
- [ ] **Founder bio** for Rafael Verde: `mision.founder` in `src/i18n/*.json`.
- [ ] **Testimonials.** The home page shows six "Preguntas que escuchamos"
  cards instead of testimonials, because there are no events yet. After the
  first event, add a "Voces" section with real quotes (the `.quote` and
  `.voices-grid` styles from the prototype are already in `global.css`). Do not
  invent quotes.
- [ ] **Announcement bar copy and the "Nuestra promesa" list** are final unless
  Rafael edits them (`announce.text`, `home.promises`).
- [ ] **501(c)(3) status.** The donation FAQ answer says the status is "en
  proceso" (`src/content/faqs/es/donar-01.md` and `en/donar-01.md`). Update once
  confirmed and add the EIN in `src/lib/site.ts` (`ein`); it then appears in
  the footer and in the Organization JSON-LD.
- [ ] **Transparency percentages on /donar** (60 / 25 / 10 / 5) are a planned
  split and labeled as such. Confirm with the treasurer (`donar.bars`).
- [ ] **Partner slots** in the home strip: "Tu organización comunitaria" and
  "Tu empresa" (`home.partnerSlotOrg`, `home.partnerSlotCompany`).
- [ ] **Privacy and terms pages** (`/privacidad`, `/terminos`) contain
  provisional text with a visible "pending legal review" notice and are
  `noindex`. Replace the text in `legal.privacy` / `legal.terms` and remove the
  notice (`legal.reviewNotice`) and the `noindex` in `src/views/LegalPage.astro`.
- [ ] **Photos.** 28 placeholders, listed in `PHOTO-SHOTLIST.md`.
- [ ] **Final logo.** If the brand bundle has a final SVG, swap it into
  `src/lib/logo.ts` (see README).

## English

- [ ] Review `src/i18n/en.json`, `src/content/faqs/en/` and the `en:` blocks in
  the events. Translator notes: "notario" was kept (notario fraud), "residencia"
  became "green card".
- [ ] Then set `PUBLIC_ENGLISH_ENABLED=true`. Until then the EN toggle shows
  the prototype's notice and `/en` pages are `noindex` and out of the sitemap.

## Services and configuration

- [ ] `PUBLIC_SITE_URL` set to the production domain.
- [ ] GoHighLevel webhook(s) created and `PUBLIC_GHL_WEBHOOK_URL` set. Map the
  fields in GHL: `newsletter_channel`, `newsletter_email`,
  `newsletter_whatsapp`, `event_slug`, `attendees`, `utm_*`, `tags`.
- [ ] Resend fallback: domain verified, `RESEND_API_KEY` and `RESEND_FROM` set.
  Send one test from each form with GHL disabled.
- [ ] KV database connected (capacity bars).
- [ ] Stripe: live keys set, customer receipt emails turned on, one real $1
  test (once and monthly), then refund. Until the keys are set, the donate
  button shows the prototype's notice.
- [ ] Analytics: `PUBLIC_PLAUSIBLE_DOMAIN` (or `PUBLIC_GA4_ID`) set; add the four
  custom events as goals.
- [ ] Deploy hook created and the `VERCEL_DEPLOY_HOOK_URL` secret added so past
  events roll off daily.
- [ ] Submit `https://fundacionverde.org/sitemap-index.xml` in Google Search
  Console.
