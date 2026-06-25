export default function ProfileLoading() {
  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-lg mx-auto p-4 lg:p-6">
        {/* Header card */}
        <div className="flex items-center gap-4 mb-8 p-5 card-solid rounded-xl">
          <div className="w-12 h-12 rounded-lg bg-white/[0.04] animate-pulse flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-5 w-28 bg-white/[0.04] rounded animate-pulse" />
            <div className="h-4 w-40 bg-white/[0.03] rounded animate-pulse" />
          </div>
        </div>
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-[88px] card-solid rounded-lg animate-pulse" />
          ))}
        </div>
        {/* Menu */}
        <div className="card-solid rounded-xl overflow-hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-[60px] border-b border-white/[0.04] last:border-0 animate-pulse"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
