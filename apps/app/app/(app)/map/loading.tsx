export default function MapLoading() {
  return (
    <div className="fixed inset-0 bg-trail-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-full border-2 border-alpine-600/30 border-t-alpine-500 animate-spin" />
        <p className="text-fg-subtle text-sm">Loading map</p>
      </div>
    </div>
  );
}
