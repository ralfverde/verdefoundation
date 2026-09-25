// Tiny wrapper over Plausible or GA4 (whichever Analytics.astro loaded).
type Props = Record<string, string | number | boolean>;

declare global {
  interface Window {
    plausible?: (event: string, options?: { props?: Props }) => void;
    gtag?: (...args: unknown[]) => void;
  }
}

export const EVENTS = {
  registration: 'Event Registration',
  donateClick: 'Donate Click',
  checkoutStarted: 'Checkout Started',
  newsletter: 'Newsletter Signup',
} as const;

export function track(event: string, props: Props = {}): void {
  try {
    if (window.plausible) window.plausible(event, { props });
    else if (window.gtag) window.gtag('event', event.toLowerCase().replace(/\s+/g, '_'), props);
  } catch {
    /* analytics must never break the page */
  }
}
