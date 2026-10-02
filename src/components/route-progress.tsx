"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export function RouteProgress() {
  const pathname = usePathname();
  const [pending, setPending] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setPending(false), 0);
    return () => clearTimeout(timer);
  }, [pathname]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    function onClick(event: MouseEvent) {
      const target = event.target instanceof Element ? event.target.closest("a") : null;
      if (!target || event.defaultPrevented || event.button !== 0) return;
      if (target.target === "_blank" || target.hasAttribute("download")) return;
      const href = target.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return;
      try {
        const url = new URL(href, window.location.href);
        if (url.origin !== window.location.origin || url.pathname === window.location.pathname && url.search === window.location.search) return;
        setPending(true);
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => setPending(false), 12000);
      } catch {
        // Ignore malformed links and let the browser handle them normally.
      }
    }
    document.addEventListener("click", onClick, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      if (timer) clearTimeout(timer);
    };
  }, []);

  if (!pending) return null;
  return <div className="route-progress" role="status" aria-label="Đang chuyển trang"><span /></div>;
}
