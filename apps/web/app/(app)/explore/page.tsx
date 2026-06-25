"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { Search, Map, List } from "lucide-react";
import { motion } from "framer-motion";
import { BottomSheet } from "@/components/app/bottom-sheet";
import { SearchPanel } from "@/components/app/search-panel";
import { cn } from "@/lib/utils";

const MapView = dynamic(
  () => import("@/components/app/map-view").then((m) => m.MapView),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-trail-900">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-alpine-600 border-t-alpine-400 rounded-full animate-spin" />
          <p className="text-fg-subtle text-sm">Loading map…</p>
        </div>
      </div>
    ),
  }
);

export default function ExplorePage() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [view, setView] = useState<"map" | "list">("map");

  return (
    <div className="relative w-full h-full flex">
      {/* Search panel (left sidebar on desktop / fullscreen on mobile) */}
      <SearchPanel
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

      {/* Map */}
      <div className="flex-1 relative">
        <MapView />

        {/* Top controls overlay */}
        <div className="absolute top-3 left-3 right-3 z-[1100] flex items-center gap-2 pointer-events-none">
          {/* Search button */}
          <motion.button
            className="pointer-events-auto flex items-center gap-2.5 bg-trail-900/90 backdrop-blur-xl border border-white/[0.1] rounded-2xl px-4 py-2.5 text-fg-muted hover:text-fg transition-colors shadow-lg flex-1 max-w-xs"
            onClick={() => setIsSearchOpen(true)}
            whileTap={{ scale: 0.98 }}
          >
            <Search className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm truncate">Search locations…</span>
          </motion.button>

          {/* View toggle */}
          <div className="pointer-events-auto flex bg-trail-900/90 backdrop-blur-xl border border-white/[0.1] rounded-2xl overflow-hidden shadow-lg">
            {[
              { v: "map" as const, icon: Map },
              { v: "list" as const, icon: List },
            ].map(({ v, icon: Icon }) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={cn(
                  "w-10 h-10 flex items-center justify-center transition-colors",
                  view === v
                    ? "bg-alpine-900 text-alpine-300"
                    : "text-fg-subtle hover:text-fg hover:bg-trail-800"
                )}
              >
                <Icon className="w-4 h-4" />
              </button>
            ))}
          </div>
        </div>

        {/* Location count overlay */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1100] pointer-events-none">
          <div className="bg-trail-900/90 backdrop-blur-xl border border-white/[0.1] rounded-full px-4 py-2 shadow-lg">
            <p className="text-fg-muted text-xs">
              <span className="text-fg font-semibold">381</span> locations ·{" "}
              <span className="text-alpine-400">Switzerland</span>
            </p>
          </div>
        </div>
      </div>

      {/* Location detail bottom sheet */}
      <BottomSheet />
    </div>
  );
}
