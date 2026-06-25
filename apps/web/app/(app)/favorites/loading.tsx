export default function FavoritesLoading() {
  return (
    <div className="min-h-screen bg-trail-950 pt-16">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="h-8 w-36 bg-white/[0.04] rounded-lg animate-pulse mb-8" />
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-24 rounded-xl bg-white/[0.03] animate-pulse"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
