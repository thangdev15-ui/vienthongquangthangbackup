"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    gtag?: (command: "event", eventName: string, params?: Record<string, string>) => void;
  }
}

export function LeadEvents() {
  useEffect(() => {
    const trackContact = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const link = target.closest<HTMLAnchorElement>("a[href]");
      if (!link) return;

      const href = link.href;
      const contactMethod = href.startsWith("tel:")
        ? "phone"
        : href.startsWith("mailto:")
          ? "email"
          : href.includes("zalo.me")
            ? "zalo"
            : null;
      if (!contactMethod) return;

      window.gtag?.("event", "generate_lead", {
        contact_method: contactMethod,
        page_path: window.location.pathname,
      });
    };

    document.addEventListener("click", trackContact, { capture: true });
    return () => document.removeEventListener("click", trackContact, { capture: true });
  }, []);

  return null;
}
