"use client";

import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import { useEffect, type ReactNode } from "react";

export function PostHogProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://app.posthog.com";

    if (key && typeof window !== "undefined") {
      posthog.init(key, {
        api_host: host,
        capture_pageview: true,
        persistence: "localStorage",
        autocapture: false, // only track explicit events
      });
    }
  }, []);

  return <PHProvider client={posthog}>{children}</PHProvider>;
}

/** Track a custom event (safe to call even if PostHog isn't configured) */
export function trackEvent(event: string, properties?: Record<string, any>) {
  try {
    if (typeof window !== "undefined" && posthog.__loaded) {
      posthog.capture(event, properties);
    }
  } catch {}
}
