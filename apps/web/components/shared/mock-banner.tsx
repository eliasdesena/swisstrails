"use client";


export function MockBanner() {
  if (process.env.NEXT_PUBLIC_MOCK_MODE !== "true") return null;

  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex items-center gap-2 bg-trail-800 border border-alpine-700/60 rounded-full px-3 py-1.5 shadow-lg pointer-events-none">
      <span className="w-1.5 h-1.5 rounded-full bg-alpine-500 animate-pulse" />
      <span className="text-alpine-300 text-xs font-medium">Demo Mode</span>
    </div>
  );
}
