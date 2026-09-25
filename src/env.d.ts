/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_SITE_URL?: string;
  readonly PUBLIC_ENGLISH_ENABLED?: string;
  readonly PUBLIC_GHL_WEBHOOK_URL?: string;
  readonly PUBLIC_GHL_WEBHOOK_URL_REGISTRATION?: string;
  readonly PUBLIC_GHL_WEBHOOK_URL_VOLUNTEER?: string;
  readonly PUBLIC_GHL_WEBHOOK_URL_CONTACT?: string;
  readonly PUBLIC_GHL_WEBHOOK_URL_NEWSLETTER?: string;
  readonly RESEND_API_KEY?: string;
  readonly RESEND_FROM?: string;
  readonly CONTACT_TO?: string;
  readonly STRIPE_SECRET_KEY?: string;
  readonly PUBLIC_STRIPE_PUBLISHABLE_KEY?: string;
  readonly KV_REST_API_URL?: string;
  readonly KV_REST_API_TOKEN?: string;
  readonly UPSTASH_REDIS_REST_URL?: string;
  readonly UPSTASH_REDIS_REST_TOKEN?: string;
  readonly PUBLIC_PLAUSIBLE_DOMAIN?: string;
  readonly PUBLIC_PLAUSIBLE_SRC?: string;
  readonly PUBLIC_GA4_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
