export default function MapLoading() {
  return (
    <div className="h-full flex flex-col">
      {/* Search / control bar */}
      <div className="flex-shrink-0 flex items-center gap-2 px-3 py-2">
        <div className="flex-1 h-11 rounded-lg bg-white/[0.05] animate-pulse" />
        <div className="w-11 h-11 rounded-lg bg-white/[0.05] animate-pulse" />
        <div className="w-[88px] h-11 rounded-lg bg-white/[0.05] animate-pulse" />
      </div>
      {/* Map area */}
      <div className="flex-1 bg-trail-900 flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-2 border-alpine-600/30 border-t-alpine-500 animate-spin" />
      </div>
    </div>
  );
}
