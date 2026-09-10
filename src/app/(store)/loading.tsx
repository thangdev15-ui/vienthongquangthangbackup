export default function StoreLoading() {
  return (
    <div className="wrap animate-pulse py-8" aria-label="Đang tải">
      <div className="h-4 w-32 rounded bg-ink-100" />
      <div className="mt-5 h-8 w-72 rounded bg-ink-100" />
      <div className="mt-3 h-4 w-[min(100%,36rem)] rounded bg-ink-100" />
      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => <div key={item} className="aspect-[4/3] rounded-lg bg-ink-100" />)}
      </div>
    </div>
  );
}
