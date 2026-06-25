"use client";

import dynamic from "next/dynamic";
import { useMemo, useRef, useState, useEffect } from "react";
import { Search, Map, LayoutGrid, SlidersHorizontal, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { BottomSheet } from "@/components/app/bottom-sheet";
import { LocationGrid } from "@/components/app/location-grid";
import { FilterDrawer } from "@/components/app/filter-drawer";
import { useMapStore } from "@/store/map-store";
import { PLACEHOLDER_LOCATIONS } from "@/data/locations";
import { filterLocations, countActiveFilters } from "@/lib/filters";
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

export default function MapPage() {
  const { searchQuery, setSearchQuery, activeFilters, clearFilters } = useMapStore();
  const [view, setView] = useState<"map" | "list">("map");
  const [showFilters, setShowFilters] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  const filteredLocations = useMemo(
    () => filterLocations(PLACEHOLDER_LOCATIONS, searchQuery, activeFilters),
    [searchQuery, activeFilters]
  );

  const activeFilterCount = useMemo(
    () => countActiveFilters(activeFilters),
    [activeFilters]
  );

  const filterKey = `${searchQuery}-${JSON.stringify(activeFilters)}`;

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    if (mq.matches) searchRef.current?.focus();
  }, []);

  return (
    <div className="relative w-full h-full flex flex-col">
      {/* Search / control bar */}
      <div className="flex-shrink-0 flex items-center gap-2 px-3 py-2 border-b border-white/[0.06] bg-trail-950/80 backdrop-blur-xl z-[1100]">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-fg-subtle pointer-events-none" />
          <input
            ref={searchRef}
            type="search"
            placeholder="Search 381 locations…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 bg-trail-800 border border-white/[0.07] rounded-xl text-sm text-fg placeholder:text-fg-subtle outline-none transition-colors focus:border-alpine-600/60 focus:bg-trail-700"
            style={{ paddingLeft: "2.25rem", paddingRight: searchQuery ? "2.25rem" : "0.75rem" }}
          />
          <AnimatePresence>
            {searchQuery && (
              <motion.button
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-fg-subtle hover:text-fg transition-colors"
                onClick={() => setSearchQuery("")}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.12 }}
              >
                <X className="w-3.5 h-3.5" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        <motion.button
          className={cn(
            "relative flex items-center gap-1.5 h-9 px-3 rounded-xl border text-sm font-medium transition-colors flex-shrink-0",
            showFilters || activeFilterCount > 0
              ? "bg-alpine-900 border-alpine-700 text-alpine-300"
              : "bg-trail-800 border-white/[0.07] text-fg-muted hover:text-fg hover:border-white/[0.12]"
          )}
          onClick={() => setShowFilters((v) => !v)}
          whileTap={{ scale: 0.97 }}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Filters</span>
          {activeFilterCount > 0 && (
            <span className="flex items-center justify-center w-4 h-4 text-[10px] font-bold bg-alpine-500 text-white rounded-full">
              {activeFilterCount}
            </span>
          )}
        </motion.button>

        <div className="flex h-9 bg-trail-800 border border-white/[0.07] rounded-xl overflow-hidden flex-shrink-0">
          {(
            [
              { v: "map" as const, icon: Map, label: "Map" },
              { v: "list" as const, icon: LayoutGrid, label: "List" },
            ] as const
          ).map(({ v, icon: Icon, label }) => (
            <button
              key={v}
              onClick={() => setView(v)}
              title={label}
              className={cn(
                "w-9 flex items-center justify-center transition-colors",
                view === v
                  ? "bg-alpine-900 text-alpine-300"
                  : "text-fg-subtle hover:text-fg hover:bg-trail-700"
              )}
            >
              <Icon className="w-3.5 h-3.5" />
            </button>
          ))}
        </div>
      </div>

      {/* Active filter strip */}
      <AnimatePresence>
        {(activeFilterCount > 0 || searchQuery) && (
          <motion.div
            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 border-b border-white/[0.04] overflow-x-auto z-[1099]"
            style={{ scrollbarWidth: "none" }}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <span className="text-fg-subtle text-xs flex-shrink-0">
              {filteredLocations.length} result{filteredLocations.length !== 1 ? "s" : ""}
            </span>
            <span className="text-white/20 text-xs">·</span>
            <button
              onClick={() => {
                clearFilters();
                setSearchQuery("");
              }}
              className="text-xs text-fg-subtle hover:text-fg transition-colors flex-shrink-0"
            >
              Clear all
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      <div className="flex-1 relative overflow-hidden">
        <div className={cn("absolute inset-0", view !== "map" && "pointer-events-none invisible")}>
          <MapView locations={filteredLocations} />
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1100] pointer-events-none">
            <div className="bg-trail-900/90 backdrop-blur-xl border border-white/[0.1] rounded-full px-4 py-1.5 shadow-lg">
              <p className="text-fg-muted text-xs whitespace-nowrap">
                <span className="text-fg font-semibold">{filteredLocations.length}</span>
                {filteredLocations.length < PLACEHOLDER_LOCATIONS.length && (
                  <span> of {PLACEHOLDER_LOCATIONS.length}</span>
                )}{" "}
                locations
              </p>
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {view === "list" && (
            <motion.div
              key="list"
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              <LocationGrid
                key={filterKey}
                locations={filteredLocations}
                totalCount={PLACEHOLDER_LOCATIONS.length}
                activeFilterCount={activeFilterCount}
                onOpenFilters={() => setShowFilters(true)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <FilterDrawer
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        resultCount={filteredLocations.length}
      />

      <BottomSheet />
    </div>
  );
}
