"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { useMapStore } from "@/store/map-store";
import { PLACEHOLDER_LOCATIONS } from "@/data/locations";
import { filterLocations, countActiveFilters } from "@/lib/filters";
import { FilterDrawer } from "@/components/app/filter-drawer";
import { LocationDetailSheet } from "@/components/app/location-detail-sheet";
import { categoryConfig, regionConfig, cn } from "@/lib/utils";
import type { Location } from "@/types";

const ASPECT_RATIOS = ["3/4", "4/5", "2/3", "4/5", "3/4", "1/1", "4/5", "3/5"];

export default function ExplorePage() {
  const { searchQuery, setSearchQuery, activeFilters, clearFilters } = useMapStore();
  const [showFilters, setShowFilters] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);

  const filteredLocations = useMemo(
    () => filterLocations(PLACEHOLDER_LOCATIONS, searchQuery, activeFilters),
    [searchQuery, activeFilters]
  );

  const activeFilterCount = useMemo(
    () => countActiveFilters(activeFilters),
    [activeFilters]
  );

  return (
    <div className="relative w-full h-full flex flex-col">
      {/* Search bar — no border, bg shift handles separation */}
      <div className="flex-shrink-0 flex items-center gap-2 px-3 py-2.5 bg-trail-950/90 backdrop-blur-xl z-[1100]">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-600 pointer-events-none" />
          <input
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
          onClick={() => setShowFilters((v) => !v)}
          className={cn(
            "flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium transition-colors flex-shrink-0",
            activeFilterCount > 0
              ? "bg-alpine-900/50 text-alpine-300"
              : "text-stone-500 hover:text-stone-300"
          )}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Filters</span>
          {activeFilterCount > 0 && (
            <span className="text-[10px] font-bold text-alpine-400 ml-0.5">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Active filter strip */}
      <AnimatePresence>
        {(activeFilterCount > 0 || searchQuery) && (
          <motion.div
            className="flex-shrink-0 flex items-center gap-2 px-3 py-1 bg-trail-950/70"
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

      {/* Masonry wall — full width, no max-width cap */}
      <div className="flex-1 overflow-y-auto overscroll-contain">
        {filteredLocations.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 text-center">
            <div className="w-12 h-12 rounded-lg bg-white/[0.04] flex items-center justify-center mb-4">
              <Search className="w-5 h-5 text-stone-600" />
            </div>
            <p className="text-fg text-sm font-medium mb-1">No results</p>
            <p className="text-stone-500 text-xs">
              Try a different search or{" "}
              <button
                onClick={() => setShowFilters(true)}
                className="text-alpine-400 underline underline-offset-2"
              >
                adjust filters
              </button>
            </p>
          </div>
        ) : (
            <div className="columns-2 lg:columns-3 xl:columns-4 [column-gap:4px] lg:[column-gap:6px] px-1 pt-1 pb-20 lg:px-1.5 lg:pt-1.5 lg:pb-8">
            {filteredLocations.map((loc, i) => (
              <MasonryCard
                key={loc.id}
                location={loc}
                aspectRatio={ASPECT_RATIOS[i % ASPECT_RATIOS.length]}
                onClick={() => setSelectedLocation(loc)}
                animDelay={Math.min(i * 0.025, 0.3)}
              />
            ))}
          </div>
        )}
      </div>

      <FilterDrawer
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        resultCount={filteredLocations.length}
      />

      <LocationDetailSheet
        location={selectedLocation}
        onClose={() => setSelectedLocation(null)}
        onSelectSimilar={(loc) => setSelectedLocation(loc)}
      />
    </div>
  );
}

interface MasonryCardProps {
  location: Location;
  aspectRatio: string;
  onClick: () => void;
  animDelay: number;
}

function MasonryCard({ location, aspectRatio, onClick, animDelay }: MasonryCardProps) {
  const [imgError, setImgError] = useState(false);

  return (
    <motion.button
      className="relative w-full rounded-md overflow-hidden bg-white/[0.04] block break-inside-avoid mb-1 lg:mb-1.5"
      style={{ aspectRatio }}
      onClick={onClick}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, delay: animDelay }}
      whileTap={{ scale: 0.99 }}
    >
      {!imgError ? (
        <img
          src={location.heroImage.url}
          alt={location.name}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={() => setImgError(true)}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-trail-800">
          <span className="text-stone-700 text-xs">{categoryConfig[location.category].label}</span>
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-transparent" />

      <div className="absolute bottom-0 left-0 right-0 p-2.5 text-left">
        <p className="text-white text-xs font-medium leading-tight line-clamp-2">{location.name}</p>
        <p className="text-white/45 text-[10px] mt-0.5">{regionConfig[location.region].label}</p>
      </div>
    </motion.button>
  );
}
