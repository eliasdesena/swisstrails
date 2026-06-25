export default function ExploreLoading() {
  return (
    <div className="min-h-screen bg-trail-950 pt-16">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="h-8 w-48 bg-white/[0.04] rounded-lg animate-pulse mb-6" />
        <div className="columns-2 lg:columns-3 xl:columns-4 gap-3">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="break-inside-avoid mb-3 rounded-xl bg-white/[0.03] animate-pulse"
              style={{ height: 180 + (i % 3) * 60 }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
