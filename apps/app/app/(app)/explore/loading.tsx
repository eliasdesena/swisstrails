export default function ExploreLoading() {
  return (
    <div className="h-full flex flex-col">
      {/* Search bar */}
      <div className="flex-shrink-0 flex items-center gap-2 px-3 py-2.5">
        <div className="flex-1 h-11 rounded-lg bg-white/[0.05] animate-pulse" />
        <div className="w-11 h-11 rounded-lg bg-white/[0.05] animate-pulse" />
      </div>
      {/* Masonry */}
      <div className="flex-1 overflow-hidden">
        <div className="columns-2 lg:columns-3 xl:columns-4 [column-gap:4px] lg:[column-gap:6px] px-1 pt-1">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="break-inside-avoid mb-1 lg:mb-1.5 rounded-md bg-white/[0.03] animate-pulse"
              style={{ height: 160 + (i % 4) * 50 }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
