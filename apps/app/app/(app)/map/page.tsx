"use client";

import dynamic from "next/dynamic";
import { useMemo, useRef, useState, useEffect } from "react";
import { Search, Map, LayoutGrid, SlidersHorizontal, X, Layers } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { BottomSheet } from "@/components/app/bottom-sheet";
import { LocationGrid } from "@/components/app/location-grid";
import { FilterDrawer } from "@/components/app/filter-drawer";
import { useMapStore } from "@/store/map-store";
import { useGeoStore } from "@/store/geo-store";
import { PLACEHOLDER_LOCATIONS } from "@/data/locations";
import { filterLocations, countActiveFilters } from "@/lib/filters";
import { sortLocations, type SortMode } from "@/lib/sort";
import { SortControl } from "@/components/app/sort-control";
import { TripPill } from "@/components/app/trip-pill";
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

// Shared frosted-pill styling for the floating map controls
const PILL = "bg-trail-950/85 backdrop-blur-md shadow-[0_2px_12px_rgba(0,0,0,0.45)]";

export default function MapPage() {
  const { searchQuery, setSearchQuery, activeFilters } = useMapStore();
  const userPosition = useGeoStore((s) => s.position);
  const [view, setView] = useState<"map" | "list">("map");
  const [showFilters, setShowFilters] = useState(false);
  const [sortMode, setSortMode] = useState<SortMode>("featured");
  const [isSatellite, setIsSatellite] = useState(true);
  const searchRef = useRef<HTMLInputElement>(null);

  const filteredLocations = useMemo(
    () => filterLocations(PLACEHOLDER_LOCATIONS, searchQuery, activeFilters),
    [searchQuery, activeFilters]
  );

  // List view honours the sort control; the map keeps marker order stable.
  const sortedLocations = useMemo(
    () => sortLocations(filteredLocations, sortMode, userPosition),
    [filteredLocations, sortMode, userPosition]
  );

  const activeFilterCount = useMemo(
    () => countActiveFilters(activeFilters),
    [activeFilters]
  );

  const filterKey = `${searchQuery}-${JSON.stringify(activeFilters)}-${sortMode}-${userPosition ? "geo" : "nogeo"}`;

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    if (mq.matches) searchRef.current?.focus();
  }, []);

  return (
    <div className="relative w-full h-full">
      {/* Map — fills the entire area; controls float on top */}
      <div className={cn("absolute inset-0", view !== "map" && "pointer-events-none invisible")}>
        <MapView locations={filteredLocations} isSatellite={isSatellite} />

        {/* Satellite/map toggle — floating below the search row */}
        <div className="absolute top-[calc(4rem+env(safe-area-inset-top))] right-3 z-[1100]">
          <button
            onClick={() => setIsSatellite((v) => !v)}
            className={cn(
              "flex items-center gap-1.5 h-10 px-3.5 rounded-lg text-sm font-medium transition-all",
              "shadow-[0_2px_12px_rgba(0,0,0,0.45)]",
              isSatellite
                ? "bg-trail-950/90 text-fg backdrop-blur-md"
                : "bg-white/90 text-trail-950 backdrop-blur-md"
            )}
          >
            <Layers className="w-4 h-4" />
            {isSatellite ? "Map" : "Satellite"}
          </button>
        </div>

        {/* Location count — bottom center */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1100] pointer-events-none">
          <div className="bg-trail-950/80 backdrop-blur-xl rounded-lg px-3 py-1.5">
            <p className="text-fg-muted text-xs whitespace-nowrap">
              <span className="text-fg font-medium">{filteredLocations.length}</span>
              {filteredLocations.length < PLACEHOLDER_LOCATIONS.length && (
                <span> of {PLACEHOLDER_LOCATIONS.length}</span>
              )}{" "}
              locations
            </p>
          </div>
        </div>
      </div>

      {/* List view — opaque, covers the map; padded to clear the floating controls */}
      <AnimatePresence mode="wait">
        {view === "list" && (
          <motion.div
            key="list"
            className="absolute inset-0 flex flex-col bg-trail-950 pt-[calc(4.25rem+env(safe-area-inset-top))]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <div className="flex-shrink-0 px-4 pt-1 max-w-5xl mx-auto w-full">
              <SortControl value={sortMode} onChange={setSortMode} />
            </div>
            <div className="flex-1 min-h-0">
              <LocationGrid
                key={filterKey}
                locations={sortedLocations}
                totalCount={PLACEHOLDER_LOCATIONS.length}
                activeFilterCount={activeFilterCount}
                onOpenFilters={() => setShowFilters(true)}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating controls — transparent container, frosted pills.
          z above Leaflet's internal panes/controls (~1000) so they sit over the map. */}
      <div className="absolute top-0 left-0 right-0 z-[1100] flex items-center gap-2 px-3 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none z-10" />
          <input
            ref={searchRef}
            type="search"
            placeholder="Search locations…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn(
              "w-full h-11 rounded-lg text-base text-fg placeholder:text-stone-400 outline-none transition-colors focus:bg-trail-950/95",
              PILL
            )}
            style={{ paddingLeft: "2.5rem", paddingRight: searchQuery ? "2.5rem" : "0.875rem" }}
          />
          <AnimatePresence>
            {searchQuery && (
              <motion.button
                aria-label="Clear search"
                className="absolute right-1 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center text-stone-400 hover:text-fg transition-colors z-10"
                onClick={() => setSearchQuery("")}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.1 }}
              >
                <X className="w-4 h-4" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        <button
          aria-label="Filters"
          className={cn(
            "flex items-center gap-1.5 h-11 px-3.5 rounded-lg text-sm font-medium transition-colors flex-shrink-0 backdrop-blur-md shadow-[0_2px_12px_rgba(0,0,0,0.45)]",
            activeFilterCount > 0
              ? "bg-alpine-700/85 text-white"
              : "bg-trail-950/85 text-fg-muted hover:text-fg"
          )}
          onClick={() => setShowFilters((v) => !v)}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span className="hidden sm:inline">Filters</span>
          {activeFilterCount > 0 && (
            <span className="text-[10px] font-bold ml-0.5">{activeFilterCount}</span>
          )}
        </button>

        <div className={cn("flex h-11 rounded-lg overflow-hidden flex-shrink-0", PILL)}>
          {(
            [
              { v: "map" as const, icon: Map },
              { v: "list" as const, icon: LayoutGrid },
            ] as const
          ).map(({ v, icon: Icon }) => (
            <button
              key={v}
              onClick={() => setView(v)}
              aria-label={v === "map" ? "Map view" : "List view"}
              className={cn(
                "w-11 flex items-center justify-center transition-colors",
                view === v ? "bg-white/[0.14] text-fg" : "text-fg-muted hover:text-fg"
              )}
            >
              <Icon className="w-4 h-4" />
            </button>
          ))}
        </div>
      </div>

      <FilterDrawer
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        resultCount={filteredLocations.length}
      />

      <BottomSheet />

      {/* Floating "Trip · N" pill — bottom-left, above the nav */}
      <TripPill />
    </div>
  );
}
