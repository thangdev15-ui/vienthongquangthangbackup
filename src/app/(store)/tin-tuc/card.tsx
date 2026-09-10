import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/ui";

export function ArticleCard({
  title,
  slug,
  excerpt,
  category,
  cover,
  date,
}: {
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  cover: string | null;
  date: Date;
}) {
  return (
    <Link href={`/tin-tuc/${slug}`} className="card group flex flex-col overflow-hidden transition-all hover:border-brand-400 hover:shadow-md">
      <div className="relative aspect-[16/9] overflow-hidden bg-ink-950">
        {cover ? (
          <Image src={cover} alt={title} fill sizes="(min-width:1280px) 25vw, (min-width:768px) 33vw, 90vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Icon name="file-text" className="h-9 w-9 text-brand-400" />
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center gap-2 text-[11px]">
          <span className="font-bold uppercase tracking-wide text-brand-700">{category}</span>
          <span className="text-ink-300">•</span>
          <time className="text-ink-400">{new Date(date).toLocaleDateString("vi-VN")}</time>
        </div>
        <h2 className="mt-1.5 line-clamp-2 text-[15px] font-bold leading-snug text-ink-900 group-hover:text-brand-700">{title}</h2>
        <p className="mt-1.5 line-clamp-3 text-[13px] leading-6 text-ink-500">{excerpt}</p>
        <span className="mt-auto flex items-center gap-1 pt-3 text-[13px] font-semibold text-brand-700">
          Đọc tiếp
          <Icon name="arrow-right" className="h-3.5 w-3.5" />
        </span>
      </div>
    </Link>
  );
}
