import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPageBySlug } from "@/lib/data";
import { Breadcrumbs } from "@/components/ui";

export const dynamic = "force-dynamic";

const ALLOWED: Record<string, string> = {
  "huong-dan-mua-hang": "Hướng dẫn mua hàng online",
  "hinh-thuc-thanh-toan": "Hình thức thanh toán",
  "chinh-sach-bao-hanh": "Chính sách bảo hành",
  "chinh-sach-doi-tra": "Chính sách đổi trả",
  "chinh-sach-giao-nhan": "Chính sách giao nhận",
  "chinh-sach-bao-mat": "Chính sách bảo mật",
  "doi-tac-chien-luoc": "Đối tác chiến lược",
};

export async function generateMetadata({ params }: { params: Promise<Record<string, string | undefined>> }): Promise<Metadata> {
  const p = await params;
  const slug = Object.values(p)[0] as string;
  const title = ALLOWED[slug];
  if (!title) return { title: "Trang không tồn tại" };
  const page = await getPageBySlug(slug);
  return { title: page?.seoTitle ?? title, description: page?.seoDescription ?? title };
}

export default async function CmsPage({ params }: { params: Promise<Record<string, string | undefined>> }) {
  const p = await params;
  const slug = Object.values(p)[0] as string;
  const fallbackTitle = ALLOWED[slug];
  if (!fallbackTitle) notFound();
  const page = await getPageBySlug(slug);
  if (!page) notFound();
  return (
    <div className="wrap py-6">
      <Breadcrumbs items={[{ label: page.title }]} />
      <h1 className="mt-3 text-2xl font-extrabold text-ink-950">{page.title}</h1>
      <div className="rich-content mt-5 max-w-3xl" dangerouslySetInnerHTML={{ __html: page.content }} />
    </div>
  );
}
