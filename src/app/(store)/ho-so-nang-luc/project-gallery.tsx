"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type ProjectImage = { src: string; caption: string };

export function ProjectGallery({ images, projectTitle, className = "aspect-[16/10]" }: { images: readonly ProjectImage[]; projectTitle: string; className?: string }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const activeImage = activeIndex === null ? null : images[activeIndex];

  useEffect(() => {
    if (activeIndex === null) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActiveIndex(null);
      if (event.key === "ArrowRight") setActiveIndex((index) => index === null ? null : (index + 1) % images.length);
      if (event.key === "ArrowLeft") setActiveIndex((index) => index === null ? null : (index - 1 + images.length) % images.length);
    };
    window.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [activeIndex, images.length]);

  if (!images.length) return null;

  return (
    <>
      <button type="button" onClick={() => setActiveIndex(0)} aria-label={`Xem ${images.length} ảnh: ${projectTitle}`} className={`group relative block w-full overflow-hidden bg-ink-100 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700 ${className}`}>
        <Image src={images[0].src} alt={images[0].caption} fill sizes="(min-width:1280px) 45vw, 100vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
        <span className="absolute bottom-2 right-2 rounded bg-brand-950/85 px-3 py-1.5 text-xs font-semibold text-white">{images.length} ảnh · Xem bộ ảnh ↗</span>
      </button>

      {activeImage && <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/90 p-4 sm:p-8" role="dialog" aria-modal="true" aria-label={`Bộ ảnh: ${projectTitle}`} onMouseDown={(event) => { if (event.target === event.currentTarget) setActiveIndex(null); }}>
        <button type="button" onClick={() => setActiveIndex(null)} aria-label="Đóng bộ ảnh" className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-3xl text-white hover:bg-white/20">×</button>
        {images.length > 1 && <button type="button" onClick={() => setActiveIndex(((activeIndex ?? 0) - 1 + images.length) % images.length)} aria-label="Ảnh trước" className="absolute left-3 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-4xl text-white hover:bg-white/20 sm:left-6">‹</button>}
        <div className="flex max-h-full w-full max-w-6xl flex-col items-center gap-4">
          <div className="relative h-[min(68vh,900px)] w-full shrink-0">
            <Image src={activeImage.src} alt={activeImage.caption} fill sizes="100vw" className="object-contain" priority />
          </div>
          <div className="text-center text-sm text-white"><p className="font-semibold">{projectTitle}</p><p className="mt-1 text-white/70">{activeImage.caption} · {(activeIndex ?? 0) + 1} / {images.length}</p></div>
          <div className="flex max-w-full gap-2 overflow-x-auto pb-1" aria-label="Chọn ảnh">
            {images.map((image, index) => <button key={image.src} type="button" onClick={() => setActiveIndex(index)} aria-label={`Mở ảnh ${index + 1}: ${image.caption}`} aria-pressed={index === activeIndex} className={`relative h-14 w-20 shrink-0 overflow-hidden rounded border-2 ${index === activeIndex ? "border-white" : "border-white/25 opacity-65 hover:opacity-100"}`}><Image src={image.src} alt="" fill sizes="80px" className="object-cover" /></button>)}
          </div>
        </div>
        {images.length > 1 && <button type="button" onClick={() => setActiveIndex(((activeIndex ?? 0) + 1) % images.length)} aria-label="Ảnh tiếp theo" className="absolute right-3 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-4xl text-white hover:bg-white/20 sm:right-6">›</button>}
      </div>}
    </>
  );
}
