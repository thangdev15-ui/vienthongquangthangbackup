"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Icon } from "@/components/ui";

const HERO_IMAGES = [
  "https://images.pexels.com/photos/5073493/pexels-photo-5073493.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=800&w=1400",
  "https://images.pexels.com/photos/2881229/pexels-photo-2881229.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=800&w=1400",
  "https://images.pexels.com/photos/325229/pexels-photo-325229.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=800&w=1400",
];

export function HeroCarousel({ firstImage }: { firstImage?: string | null }) {
  const images = firstImage ? [firstImage, ...HERO_IMAGES.slice(1)] : HERO_IMAGES;
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => setActive((current) => (current + 1) % images.length), 5000);
    return () => window.clearInterval(timer);
  }, [images.length]);

  return (
    <div className="hero-carousel relative overflow-hidden rounded-md">
      {images.map((src, index) => (
        <Image
          key={src}
          src={src}
          alt="Thiết bị viễn thông chính hãng"
          fill
          priority={index === 0}
          sizes="(min-width:1536px) 1200px, 100vw"
          className={`object-cover transition-opacity duration-700 ${active === index ? "opacity-100" : "opacity-0"}`}
        />
      ))}
      <div className="absolute inset-0 bg-black/20" />
      <button type="button" onClick={() => setActive((active - 1 + images.length) % images.length)} className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/25 text-white transition-colors hover:bg-black/45" aria-label="Ảnh trước">
        <Icon name="chevron-left" className="h-5 w-5" />
      </button>
      <button type="button" onClick={() => setActive((active + 1) % images.length)} className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/25 text-white transition-colors hover:bg-black/45" aria-label="Ảnh tiếp theo">
        <Icon name="chevron-right" className="h-5 w-5" />
      </button>
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-5 sm:p-8">
        <div className="max-w-lg text-white drop-shadow-md">
          <p className="text-xs font-semibold uppercase tracking-wider text-white/80">Quang Thang Telecom</p>
          <h1 className="mt-1 text-2xl font-extrabold leading-tight sm:text-4xl">Thiết bị viễn thông chính hãng</h1>
          <p className="mt-2 hidden text-sm text-white/90 sm:block">Cáp mạng, cáp quang, camera, switch PoE và giải pháp hạ tầng cho công trình.</p>
          <Link href="/san-pham" className="btn-accent mt-4 h-10">Khám phá sản phẩm <Icon name="arrow-right" className="h-4 w-4" /></Link>
        </div>
        <div className="flex gap-1.5">
          {images.map((src, index) => (
            <button key={src} type="button" onClick={() => setActive(index)} className={`h-2 w-6 rounded-full ${active === index ? "bg-white" : "bg-white/50"}`} aria-label={`Chuyển đến ảnh ${index + 1}`} />
          ))}
        </div>
      </div>
    </div>
  );
}
