"use client";


export function MockBanner() {
  if (process.env.NEXT_PUBLIC_MOCK_MODE !== "true") return null;

  return (
    <div className="fixed right-3 z-30 flex items-center gap-2 bg-trail-800 border border-alpine-700/60 rounded-full px-3 py-1.5 shadow-lg pointer-events-none bottom-[calc(5.5rem+env(safe-area-inset-bottom))] lg:bottom-4 lg:right-4">
      <span className="w-1.5 h-1.5 rounded-full bg-alpine-500 animate-pulse" />
      <span className="text-alpine-300 text-xs font-medium">Demo Mode</span>
    </div>
  );
}
