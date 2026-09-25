import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel/serverless';
import sitemap from '@astrojs/sitemap';
import { loadEnv } from 'vite';

const env = loadEnv(process.env.NODE_ENV ?? 'production', process.cwd(), '');
const site = env.PUBLIC_SITE_URL || 'https://fundacionverde.org';
const englishEnabled = env.PUBLIC_ENGLISH_ENABLED === 'true';

// Static by default ("hybrid"): every page is prerendered at build time.
// Only the files in src/pages/api opt out with `export const prerender = false`
// and run as serverless functions.
export default defineConfig({
  site,
  output: 'hybrid',
  adapter: vercel(),
  trailingSlash: 'never',
  devToolbar: { enabled: false },
  build: { format: 'file' },
  i18n: {
    defaultLocale: 'es',
    locales: ['es', 'en'],
    routing: { prefixDefaultLocale: false },
  },
  integrations: [
    sitemap({
      i18n: englishEnabled ? { defaultLocale: 'es', locales: { es: 'es-US', en: 'en-US' } } : undefined,
      filter: (page) =>
        !page.includes('/donar/gracias') &&
        !page.includes('/404') &&
        (englishEnabled || !/\/en(\/|$)/.test(page)),
    }),
  ],
});
