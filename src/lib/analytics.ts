import posthog from 'posthog-js';

export function initPostHog(): void {
  if (typeof window === 'undefined') return;
  if (posthog.__loaded) return;

  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://eu.i.posthog.com';

  if (!key || key.startsWith('phc_SUBSTITUA')) return;

  posthog.init(key, {
    api_host: host,
    capture_pageview: true,
    capture_pageleave: true,
    persistence: 'localStorage',
    loaded: (ph) => {
      if (process.env.NODE_ENV === 'development') ph.opt_out_capturing();
    },
  });
}

export const analytics = {
  capture(event: string, properties?: Record<string, unknown>): void {
    if (typeof window === 'undefined') return;
    if (!posthog.__loaded) return;
    posthog.capture(event, properties);
  },

  captureException(error: Error, context?: Record<string, unknown>): void {
    if (typeof window === 'undefined') return;
    if (!posthog.__loaded) return;
    posthog.captureException(error, { ...context });
  },
};
