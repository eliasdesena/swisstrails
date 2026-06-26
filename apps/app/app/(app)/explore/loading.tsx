// Skeleton must mirror the real masonry (aspect-ratio columns, not fixed px
// heights) so swapping to content doesn't re-flow the wall. Keep in sync with
// ASPECT_RATIOS in page.tsx.
const ASPECT_RATIOS = ["3/4", "4/5", "2/3", "4/5", "3/4", "1/1", "4/5", "3/5"];

export default function ExploreLoading() {
  return (
    <div className="h-full flex flex-col">
      {/* Search bar */}
      <div className="flex-shrink-0 flex items-center gap-2 px-3 py-2.5">
        <div className="flex-1 h-11 rounded-lg bg-surface-2 animate-pulse" />
        <div className="w-11 h-11 rounded-lg bg-surface-2 animate-pulse" />
      </div>
      {/* Sort strip */}
      <div className="flex-shrink-0 flex gap-2 px-3 pb-2">
        {[64, 80, 72].map((w, i) => (
          <div key={i} className="h-9 rounded-full bg-surface-1 animate-pulse" style={{ width: w }} />
        ))}
      </div>
      {/* Masonry */}
      <div className="flex-1 overflow-hidden">
        <div className="columns-2 lg:columns-3 xl:columns-4 [column-gap:4px] lg:[column-gap:6px] px-1 pt-1">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="break-inside-avoid mb-1 lg:mb-1.5 rounded-md bg-surface-1 animate-pulse"
              style={{ aspectRatio: ASPECT_RATIOS[i % ASPECT_RATIOS.length] }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
