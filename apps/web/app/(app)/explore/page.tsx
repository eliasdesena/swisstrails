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

// Aspect ratios that cycle across cards to create Pinterest-like height variation
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
      {/* Search bar */}
      <div className="flex-shrink-0 flex items-center gap-2 px-3 py-2 border-b border-white/[0.06] bg-trail-950/80 backdrop-blur-xl z-[1100]">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-fg-subtle pointer-events-none" />
          <input
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

        <button
          onClick={() => setShowFilters((v) => !v)}
          className={cn(
            "relative flex items-center gap-1.5 h-9 px-3 rounded-xl border text-sm font-medium transition-colors flex-shrink-0",
            showFilters || activeFilterCount > 0
              ? "bg-alpine-900 border-alpine-700 text-alpine-300"
              : "bg-trail-800 border-white/[0.07] text-fg-muted hover:text-fg hover:border-white/[0.12]"
          )}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Filters</span>
          {activeFilterCount > 0 && (
            <span className="flex items-center justify-center w-4 h-4 text-[10px] font-bold bg-alpine-500 text-white rounded-full">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Active filter strip */}
      <AnimatePresence>
        {(activeFilterCount > 0 || searchQuery) && (
          <motion.div
            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 border-b border-white/[0.04]"
            style={{ scrollbarWidth: "none" }}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <span className="text-fg-subtle text-xs">
              {filteredLocations.length} result{filteredLocations.length !== 1 ? "s" : ""}
            </span>
            <span className="text-white/20 text-xs">·</span>
            <button
              onClick={() => {
                clearFilters();
                setSearchQuery("");
              }}
              className="text-xs text-fg-subtle hover:text-fg transition-colors"
            >
              Clear all
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Masonry wall */}
      <div className="flex-1 overflow-y-auto overscroll-contain">
        {filteredLocations.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-trail-800 border border-white/[0.06] flex items-center justify-center mb-4">
              <span className="text-2xl">🏔</span>
            </div>
            <p className="text-fg text-sm font-semibold mb-1">No locations found</p>
            <p className="text-fg-subtle text-xs">
              Try a different search or{" "}
              <button
                onClick={() => setShowFilters(true)}
                className="text-alpine-400 hover:text-alpine-300 underline underline-offset-2 transition-colors"
              >
                adjust filters
              </button>
            </p>
          </div>
        ) : (
          /* Two-column masonry with offset second column for Pinterest rhythm */
          <div className="flex gap-1.5 px-1.5 pt-1.5 pb-20 lg:max-w-4xl lg:mx-auto lg:px-4 lg:pt-4 lg:gap-2 lg:pb-8">
            {/* Column 1 */}
            <div className="flex-1 flex flex-col gap-1.5 lg:gap-2">
              {filteredLocations
                .filter((_, i) => i % 2 === 0)
                .map((loc, i) => (
                  <MasonryCard
                    key={loc.id}
                    location={loc}
                    aspectRatio={ASPECT_RATIOS[(i * 2) % ASPECT_RATIOS.length]}
                    onClick={() => setSelectedLocation(loc)}
                    animDelay={Math.min(i * 0.04, 0.32)}
                  />
                ))}
            </div>

            {/* Column 2 — shifted down slightly to break the symmetry */}
            <div className="flex-1 flex flex-col gap-1.5 lg:gap-2 mt-10">
              {filteredLocations
                .filter((_, i) => i % 2 === 1)
                .map((loc, i) => (
                  <MasonryCard
                    key={loc.id}
                    location={loc}
                    aspectRatio={ASPECT_RATIOS[(i * 2 + 1) % ASPECT_RATIOS.length]}
                    onClick={() => setSelectedLocation(loc)}
                    animDelay={Math.min(i * 0.04 + 0.06, 0.36)}
                  />
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Filter drawer */}
      <FilterDrawer
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        resultCount={filteredLocations.length}
      />

      {/* Location detail sheet */}
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
  const cat = categoryConfig[location.category];
  const [imgError, setImgError] = useState(false);

  return (
    <motion.button
      className="relative w-full rounded-xl overflow-hidden bg-trail-800 block"
      style={{ aspectRatio }}
      onClick={onClick}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.38, delay: animDelay, ease: [0.16, 1, 0.3, 1] }}
      whileTap={{ scale: 0.96 }}
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
        /* Gradient fallback if image fails */
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-trail-800 to-trail-900">
          <span className="text-5xl opacity-40">{cat.emoji}</span>
        </div>
      )}

      {/* Bottom gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

      {/* Card text */}
      <div className="absolute bottom-0 left-0 right-0 p-2.5 lg:p-3 text-left">
        <p className="text-white text-xs font-semibold leading-tight line-clamp-2">{location.name}</p>
        <p className="text-white/55 text-[10px] mt-0.5">
          {cat.emoji} {regionConfig[location.region].label}
        </p>
      </div>
    </motion.button>
  );
}
