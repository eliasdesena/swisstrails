export default function FavoritesLoading() {
  return (
    <div className="h-full overflow-y-auto p-4 lg:p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="h-8 w-48 bg-white/[0.04] rounded-lg animate-pulse mb-2" />
          <div className="h-4 w-32 bg-white/[0.03] rounded animate-pulse" />
        </div>
        {/* Grid of cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-lg overflow-hidden bg-trail-900">
              <div className="aspect-[4/3] bg-white/[0.04] animate-pulse" />
              <div className="p-3 space-y-2">
                <div className="h-4 w-2/3 bg-white/[0.04] rounded animate-pulse" />
                <div className="h-3 w-full bg-white/[0.03] rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
