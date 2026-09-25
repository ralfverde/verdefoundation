// Organization details used across the site. Items marked PLACEHOLDER are
// listed in LAUNCH-CHECKLIST.md and must be replaced before launch.

export const SITE = {
  name: 'Fundación Verde',
  url: (import.meta.env.PUBLIC_SITE_URL || 'https://fundacionverde.org').replace(/\/$/, ''),
  email: 'hola@fundacionverde.org', // PLACEHOLDER: confirm inbox
  phoneDisplay: '(305) 000 0000', // PLACEHOLDER
  whatsappNumber: '13050000000', // PLACEHOLDER: digits only, used in wa.me links
  instagramHandle: '@fundacionverde', // PLACEHOLDER
  instagramUrl: 'https://www.instagram.com/fundacionverde', // PLACEHOLDER
  facebookUrl: 'https://www.facebook.com/fundacionverde', // PLACEHOLDER
  city: 'Miami, Florida',
  address: null as string | null, // PLACEHOLDER: physical address ("Dirección por confirmar")
  ein: null as string | null, // PLACEHOLDER: add once 501(c)(3) status is confirmed
  timezone: 'America/New_York',
  foundingYear: 2026,
};

export const ENGLISH_ENABLED = import.meta.env.PUBLIC_ENGLISH_ENABLED === 'true';

export const STRIPE_READY = Boolean(import.meta.env.PUBLIC_STRIPE_PUBLISHABLE_KEY);

export const TOPICS = ['Orientación migratoria', 'Navegar el sistema', 'Conoce tus derechos'] as const;
export type Topic = (typeof TOPICS)[number];
