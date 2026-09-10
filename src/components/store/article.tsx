"use client";

import { useEffect, useState } from "react";

/** Extracts H2 headings from the rendered article content (DOM query) for the table of contents. */
export function ArticleTOC() {
  const [items, setItems] = useState<{ id: string; text: string }[]>([]);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    const el = document.querySelector<HTMLElement>(".rich-content");
    if (!el) return;
    const headings = Array.from(el.querySelectorAll<HTMLElement>("h2"));
    const out: { id: string; text: string }[] = [];
    headings.forEach((h, i) => {
      if (!h.id) h.id = `h2-${i + 1}`;
      out.push({ id: h.id, text: h.textContent?.trim() ?? "" });
    });
    setItems(out);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  if (!items.length) return null;
  return (
    <nav aria-label="Mục lục" className="card p-4">
      <p className="mb-2 text-[12px] font-bold uppercase tracking-wide text-ink-500">Mục lục</p>
      <ol className="space-y-1.5">
        {items.map((it, i) => (
          <li key={it.id}>
            <a href={`#${it.id}`} className="text-[13px] text-ink-600 hover:text-brand-700">
              {i + 1}. {it.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
