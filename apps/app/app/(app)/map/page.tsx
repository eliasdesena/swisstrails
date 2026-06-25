"use client";

import dynamic from "next/dynamic";
import { useMemo, useRef, useState, useEffect } from "react";
import { Search, Map, LayoutGrid, SlidersHorizontal, X, Layers } from "lucide-react";
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
        <div className="w-6 h-6 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
      </div>
    ),
  }
);

export default function MapPage() {
  const { searchQuery, setSearchQuery, activeFilters, clearFilters } = useMapStore();
  const [view, setView] = useState<"map" | "list">("map");
  const [showFilters, setShowFilters] = useState(false);
  const [isSatellite, setIsSatellite] = useState(true);
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
      {/* Search / control bar — no bottom border, backdrop blur handles visual separation */}
      <div className="flex-shrink-0 flex items-center gap-2 px-3 py-2 bg-trail-950/90 backdrop-blur-xl z-[1100]">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-600 pointer-events-none" />
          <input
            ref={searchRef}
            type="search"
            placeholder="Search locations…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-8 bg-white/[0.05] rounded-lg text-sm text-fg placeholder:text-stone-600 outline-none transition-colors focus:bg-white/[0.09]"
            style={{ paddingLeft: "2.25rem", paddingRight: searchQuery ? "2rem" : "0.75rem" }}
          />
          <AnimatePresence>
            {searchQuery && (
              <motion.button
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-600 hover:text-stone-400 transition-colors"
                onClick={() => setSearchQuery("")}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.1 }}
              >
                <X className="w-3.5 h-3.5" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        <button
          className={cn(
            "flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium transition-colors flex-shrink-0",
            activeFilterCount > 0
              ? "bg-alpine-900/50 text-alpine-300"
              : "text-stone-500 hover:text-stone-300"
          )}
          onClick={() => setShowFilters((v) => !v)}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Filters</span>
          {activeFilterCount > 0 && (
            <span className="text-[10px] font-bold text-alpine-400 ml-0.5">
              {activeFilterCount}
            </span>
          )}
        </button>

        <div className="flex h-8 bg-white/[0.05] rounded-lg overflow-hidden flex-shrink-0">
          {(
            [
              { v: "map" as const, icon: Map },
              { v: "list" as const, icon: LayoutGrid },
            ] as const
          ).map(({ v, icon: Icon }) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={cn(
                "w-8 flex items-center justify-center transition-colors",
                view === v ? "bg-white/[0.1] text-fg" : "text-stone-600 hover:text-stone-400"
              )}
            >
              <Icon className="w-3.5 h-3.5" />
            </button>
          ))}
        </div>
      </div>

      {/* Active filter strip — no border, just subtle bg shift */}
      <AnimatePresence>
        {(activeFilterCount > 0 || searchQuery) && (
          <motion.div
            className="flex-shrink-0 flex items-center gap-2 px-3 py-1 bg-trail-950/70 z-[1099]"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <span className="text-stone-600 text-xs">
              {filteredLocations.length} result{filteredLocations.length !== 1 ? "s" : ""}
            </span>
            <span className="text-stone-800 text-xs">·</span>
            <button
              onClick={() => { clearFilters(); setSearchQuery(""); }}
              className="text-xs text-stone-600 hover:text-stone-400 transition-colors"
            >
              Clear
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      <div className="flex-1 relative overflow-hidden">
        <div className={cn("absolute inset-0", view !== "map" && "pointer-events-none invisible")}>
          <MapView locations={filteredLocations} isSatellite={isSatellite} />

          {/* Satellite/map toggle — floating bottom-left above zoom */}
          <div className="absolute bottom-16 left-3 z-[1100]">
            <button
              onClick={() => setIsSatellite((v) => !v)}
              className={cn(
                "flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium transition-all",
                "shadow-[0_2px_12px_rgba(0,0,0,0.4)]",
                isSatellite
                  ? "bg-trail-950/90 text-stone-300 backdrop-blur-md"
                  : "bg-white/90 text-trail-950 backdrop-blur-md"
              )}
            >
              <Layers className="w-3.5 h-3.5" />
              {isSatellite ? "Map" : "Satellite"}
            </button>
          </div>

          {/* Location count — bottom center */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1100] pointer-events-none">
            <div className="bg-trail-950/80 backdrop-blur-xl rounded-lg px-3 py-1">
              <p className="text-stone-500 text-xs whitespace-nowrap">
                <span className="text-stone-300 font-medium">{filteredLocations.length}</span>
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
              transition={{ duration: 0.15 }}
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
