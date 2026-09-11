"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const HERO_IMAGES = ["/banner1.png", "/banner2.png", "/banner3.png"];

export function HeroCarousel() {
  const images = HERO_IMAGES;
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
    </div>
  );
}
