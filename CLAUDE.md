@AGENTS.md

# Verde+ (verdeplus.com)

This repo holds the website for **Verde+**, served at verdeplus.com. The repo is named `verdefoundation`, but the product and brand is Verde+.

## What Verde+ is

- A **Spanish-first news and information brand** for **immigrants living in the United States**.
- Audience: Spanish-speaking immigrants and their families in the US who want clear, reliable news and practical information in their own language.

## Verde+ is separate from Verde Law

Verde+ and Verde Law (a law firm) are **different brands**. Keep them apart in everything you build here:

- Do not use Verde Law's name, logo, colors, copy, phone numbers, emails, or other assets anywhere on the site.
- Do not add legal-services calls to action ("agende una consulta", "hable con un abogado", intake forms, case evaluations, and so on).
- Do not frame content as legal advice or as coming from lawyers. Verde+ publishes news and general information.
- Do not link to, promote, or mention Verde Law in site content unless the user explicitly asks for it.

## Content and language rules

- **Spanish is the default and primary language.** Write all user-facing copy (headings, body text, buttons, labels, metadata, alt text, error pages) in Spanish first.
- The root `<html>` element uses `lang="es"`. Keep it that way. If English pages are ever added, treat them as secondary and mark them with their own `lang`.
- Use clear, plain, neutral Spanish that people from many countries can read easily. Avoid heavy regional slang and unexplained legal or bureaucratic jargon.
- Use correct accents and punctuation (á, é, í, ó, ú, ñ, ü, ¿ ?, ¡ !). Files are UTF-8.
- Do not invent facts, statistics, sources, or quotes. Placeholder copy must be obviously placeholder.

## Stack

- Next.js 16 (App Router) with React 19, in the `src/` directory (`src/app/`).
- TypeScript (strict). Import alias `@/*` maps to `src/*`.
- Tailwind CSS v4 through `@tailwindcss/postcss`. There is no `tailwind.config.*`; theme tokens live in `src/app/globals.css` (`@theme inline`). Light and dark mode follow `prefers-color-scheme`.
- Fonts: Geist and Geist Mono via `next/font/google`, exposed as `--font-geist-sans` / `--font-geist-mono` and mapped to Tailwind's `font-sans` / `font-mono`. The build downloads them, so `npm run build` needs network access.
- ESLint 9 flat config (`eslint.config.mjs`) using `eslint-config-next`.
- Package manager: **npm**. Commit `package-lock.json`.

## Commands

```bash
npm install      # install dependencies
npm run dev      # dev server at http://localhost:3000
npm run lint     # ESLint
npm run build    # production build (also type-checks)
npm run start    # serve the production build
npx next typegen && npx tsc --noEmit   # type-check only; route types like LayoutProps are generated into .next/types
```

Run `npm run lint` and `npm run build` before considering a change done.

## Current state

- A minimal placeholder homepage only (`src/app/page.tsx`): the "Verde+" name, a one-line Spanish tagline, and "Muy pronto."
- Root layout (`src/app/layout.tsx`) sets `lang="es"`, the title "Verde+", and a Spanish description.
- There is no navigation, CMS, article model, analytics, i18n routing, or other pages yet. There is no brand palette, logo, or favicon yet, so do not invent one.
- The 404 page is still Next's built-in English default. A Spanish `src/app/not-found.tsx` is a known to-do.
- Do not add dependencies beyond what `create-next-app` installed without a clear need.

## Files

```
src/app/layout.tsx    root layout
src/app/page.tsx      placeholder homepage
src/app/globals.css   Tailwind import and theme tokens
public/               static files served from / (none yet; create it when needed)
AGENTS.md             Next.js agent rules, maintained by `next dev`; do not edit
```
