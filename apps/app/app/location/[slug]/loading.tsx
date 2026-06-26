export default function LocationLoading() {
  return (
    <div className="min-h-dvh bg-trail-950">
      <div className="h-[55vh] min-h-[340px] bg-surface-1 animate-pulse" />
      <div className="max-w-2xl mx-auto px-5 py-8 space-y-6">
        <div className="h-5 w-2/3 bg-white/[0.04] rounded animate-pulse" />
        <div className="space-y-2">
          <div className="h-4 bg-white/[0.03] rounded animate-pulse" />
          <div className="h-4 bg-white/[0.03] rounded animate-pulse w-5/6" />
          <div className="h-4 bg-white/[0.03] rounded animate-pulse w-4/6" />
        </div>
        <div className="flex gap-3">
          <div className="flex-1 h-11 rounded-lg bg-white/[0.04] animate-pulse" />
          <div className="flex-1 h-11 rounded-lg bg-white/[0.03] animate-pulse" />
        </div>
      </div>
    </div>
  );
}
