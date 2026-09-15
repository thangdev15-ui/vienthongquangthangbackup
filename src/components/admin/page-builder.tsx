"use client";

import { useEffect, useRef } from "react";
import grapesjs, { type Editor } from "grapesjs";
import "grapesjs/dist/css/grapes.min.css";

const DEFAULT_CONTENT = `
<section style="padding: 48px 24px; max-width: 1100px; margin: 0 auto;">
  <h1 style="font-size: 36px; margin-bottom: 16px;">Tiêu đề trang</h1>
  <p style="font-size: 18px; line-height: 1.7;">Kéo các khối bên trái vào đây để bắt đầu tạo nội dung.</p>
</section>`;

function serialize(editor: Editor) {
  const html = editor.getHtml();
  const css = editor.getCss();
  return `${html}${css ? `\n<style data-grapesjs>${css}</style>` : ""}`;
}

export function GrapesPageEditor({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const blocksRef = useRef<HTMLDivElement>(null);
  const stylesRef = useRef<HTMLDivElement>(null);
  const layersRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<Editor | null>(null);
  const initialValueRef = useRef(value);
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // GrapesJS owns the editor DOM; keep it alive while the form state updates.
  useEffect(() => {
    if (!canvasRef.current || !blocksRef.current || editorRef.current) return;

    const editor = grapesjs.init({
      container: canvasRef.current,
      height: "680px",
      width: "auto",
      fromElement: false,
      storageManager: false,
      selectorManager: { componentFirst: true },
      blockManager: {
        appendTo: blocksRef.current,
        blocks: [
          { id: "section", label: "Khu vực", category: "Bố cục", content: { type: "section", components: "<h2>Tiêu đề khu vực</h2><p>Nội dung khu vực...</p>" } },
          { id: "heading", label: "Tiêu đề", category: "Nội dung", content: "<h2>Tiêu đề mới</h2>" },
          { id: "text", label: "Văn bản", category: "Nội dung", content: { type: "text", content: "Nhập nội dung của bạn ở đây..." } },
          { id: "image", label: "Hình ảnh", category: "Nội dung", content: { type: "image" } },
          { id: "quote", label: "Trích dẫn", category: "Nội dung", content: "<blockquote>Nhập nội dung trích dẫn...</blockquote>" },
          { id: "list", label: "Danh sách", category: "Nội dung", content: "<ul><li>Mục thứ nhất</li><li>Mục thứ hai</li><li>Mục thứ ba</li></ul>" },
          { id: "button", label: "Nút liên kết", category: "Nội dung", content: { type: "link", content: "Xem thêm", attributes: { href: "#" }, style: { display: "inline-block", padding: "12px 20px", color: "#ffffff", "background-color": "#f58220", "border-radius": "6px", "text-decoration": "none" } } },
          { id: "gallery", label: "Khung ảnh", category: "Media", content: { type: "default", components: [{ tagName: "div", style: { display: "grid", "grid-template-columns": "repeat(3, 1fr)", gap: "12px" }, components: [{ type: "image" }, { type: "image" }, { type: "image" }] }] } },
          { id: "video", label: "Video", category: "Media", content: { type: "video", attributes: { controls: true }, style: { width: "100%" } } },
          { id: "columns", label: "Hai cột", category: "Bố cục", content: { type: "default", components: [{ tagName: "div", style: { display: "flex", gap: "24px", "align-items": "flex-start" }, components: [{ tagName: "div", style: { flex: "1" }, components: "<h3>Cột trái</h3><p>Nội dung...</p>" }, { tagName: "div", style: { flex: "1" }, components: "<h3>Cột phải</h3><p>Nội dung...</p>" }] }] } },
          { id: "divider", label: "Đường phân cách", category: "Bố cục", content: "<hr style=\"border:0;border-top:1px solid #dce6f0;margin:24px 0;\" />" },
          { id: "spacer", label: "Khoảng cách", category: "Bố cục", content: { type: "default", style: { height: "48px" } } },
        ],
      },
      styleManager: { appendTo: stylesRef.current ?? undefined },
      layerManager: { appendTo: layersRef.current ?? undefined },
      assetManager: {
        upload: "/api/upload",
        uploadName: "file",
        autoAdd: true,
      },
      panels: { defaults: [] },
      deviceManager: { devices: [{ id: "desktop", name: "Desktop", width: "" }, { id: "mobile", name: "Mobile", width: "375px" }] },
    });

    editor.setComponents(initialValueRef.current || DEFAULT_CONTENT);
    editor.on("update", () => onChangeRef.current(serialize(editor)));
    editorRef.current = editor;

    return () => {
      editor.destroy();
      editorRef.current = null;
    };
  }, []);

  return (
    <div className="page-builder overflow-hidden rounded-md border border-line bg-white">
      <div className="flex items-center justify-between border-b border-line bg-ink-50 px-3 py-2 text-xs text-ink-600">
        <span>Kéo thả các khối vào vùng thiết kế, chọn phần tử để chỉnh sửa.</span>
        <span className="hidden sm:inline">GrapesJS Page Builder</span>
      </div>
      <div className="grid min-h-[680px] grid-cols-[220px_minmax(0,1fr)_250px]">
        <aside ref={blocksRef} className="min-w-0 overflow-y-auto border-r border-line bg-ink-50 p-2" aria-label="Các khối thiết kế" />
        <div ref={canvasRef} className="min-w-0" />
        <aside className="builder-inspector min-w-0 overflow-y-auto border-l border-line" aria-label="Bảng thiết kế">
          <div className="border-b border-white/10 px-4 py-3 text-sm font-bold text-white">Thiết kế <span className="float-right font-normal text-ink-300">Nâng cao</span></div>
          <div ref={stylesRef} />
          <div className="border-y border-white/10 px-4 py-3 text-sm font-bold text-white">Lớp</div>
          <div ref={layersRef} />
        </aside>
      </div>
    </div>
  );
}
