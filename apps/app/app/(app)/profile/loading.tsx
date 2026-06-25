export default function ProfileLoading() {
  return (
    <div className="min-h-screen bg-trail-950 pt-16">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-full bg-white/[0.04] animate-pulse" />
          <div className="space-y-2">
            <div className="h-5 w-32 bg-white/[0.04] rounded animate-pulse" />
            <div className="h-4 w-48 bg-white/[0.03] rounded animate-pulse" />
          </div>
        </div>
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 rounded-xl bg-white/[0.03] animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}
