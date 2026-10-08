"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { Banner } from "@/lib/types";

const FALLBACK_IMAGES = ["/banner1.png", "/banner2.png", "/banner3.png"];

export function HeroCarousel({ banners }: { banners: Banner[] }) {
  const slides = banners.filter((banner) => banner.image).map((banner) => ({
    src: banner.image as string,
    href: banner.buttonUrl,
    title: banner.title,
  }));
  const items = slides.length > 0 ? slides : FALLBACK_IMAGES.map((src) => ({ src, href: null, title: "Thiết bị viễn thông chính hãng" }));
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => setActive((current) => (current + 1) % items.length), 5000);
    return () => window.clearInterval(timer);
  }, [items.length]);

  const slide = items[active];
  const image = <Image src={slide.src} alt={slide.title} fill priority={active === 0} sizes="100vw" className="object-contain bg-white" />;

  return (
    <div className="hero-carousel group relative overflow-hidden">
      {slide.href ? <Link href={slide.href} className="absolute inset-0 block" aria-label="Xem nội dung banner">{image}</Link> : image}
      <button type="button" onClick={() => setActive((active - 1 + items.length) % items.length)} aria-label="Banner trước" className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink-800 opacity-0 shadow-md transition-opacity group-hover:opacity-100 focus:opacity-100">
        <span aria-hidden="true" className="text-xl leading-none">‹</span>
      </button>
      <button type="button" onClick={() => setActive((active + 1) % items.length)} aria-label="Banner tiếp theo" className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink-800 opacity-0 shadow-md transition-opacity group-hover:opacity-100 focus:opacity-100">
        <span aria-hidden="true" className="text-xl leading-none">›</span>
      </button>
      <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-white/80 px-2 py-1">
        {items.map((item, index) => (
          <button key={`${item.src}-${index}`} type="button" onClick={() => setActive(index)} aria-label={`Chọn banner ${index + 1}`} aria-current={active === index} className={`h-2 rounded-full transition-all ${active === index ? "w-6 bg-brand-700" : "w-2 bg-ink-300 hover:bg-brand-400"}`} />
        ))}
      </div>
    </div>
  );
}
