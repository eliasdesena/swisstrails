"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, SlidersHorizontal, X, Sparkles } from "lucide-react";
import { useMapStore } from "@/store/map-store";
import { useGeoStore } from "@/store/geo-store";
import { PLACEHOLDER_LOCATIONS } from "@/data/locations";
import { filterLocations, countActiveFilters } from "@/lib/filters";
import { sortLocations, type SortMode } from "@/lib/sort";
import { currentSeason, isInSeason } from "@/lib/season";
import { seasonConfig } from "@/lib/utils";
import { FilterDrawer } from "@/components/app/filter-drawer";
import { SortControl } from "@/components/app/sort-control";
import { LocationDetailSheet } from "@/components/app/location-detail-sheet";
import { TripPill } from "@/components/app/trip-pill";
import { categoryConfig, regionConfig, cn } from "@/lib/utils";
import type { Location } from "@/types";

const ASPECT_RATIOS = ["3/4", "4/5", "2/3", "4/5", "3/4", "1/1", "4/5", "3/5"];

// How many spots to show in the "In season now" rail.
const SEASON_RAIL_LIMIT = 12;

// Infinite-scroll page size for the masonry — keeps the DOM light and avoids
// mounting all 500 cards (and fetching their images) up front, which would
// burn Unsplash/Vercel bandwidth the user may never scroll to.
const MASONRY_PAGE = 24;

export default function ExplorePage() {
  const { searchQuery, setSearchQuery, activeFilters, clearFilters } = useMapStore();
  const userPosition = useGeoStore((s) => s.position);
  const [showFilters, setShowFilters] = useState(false);
  const [sortMode, setSortMode] = useState<SortMode>("featured");
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [seasonRailDismissed, setSeasonRailDismissed] = useState(false);

  const filteredLocations = useMemo(
    () =>
      sortLocations(
        filterLocations(PLACEHOLDER_LOCATIONS, searchQuery, activeFilters),
        sortMode,
        userPosition
      ),
    [searchQuery, activeFilters, sortMode, userPosition]
  );

  const activeFilterCount = useMemo(
    () => countActiveFilters(activeFilters),
    [activeFilters]
  );

  // "In season now" — month-of-year based, applied uniformly to every category.
  // Featured spots first so the rail leads with the strongest picks.
  const season = currentSeason();
  const inSeasonLocations = useMemo(
    () =>
      PLACEHOLDER_LOCATIONS.filter((loc) => isInSeason(loc, season))
        .slice()
        .sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured))
        .slice(0, SEASON_RAIL_LIMIT),
    [season]
  );

  // Only surface the rail on the unfiltered, unsearched default view so it never
  // competes with an active search/filter result set.
  const showSeasonRail =
    !seasonRailDismissed &&
    !searchQuery &&
    activeFilterCount === 0 &&
    inSeasonLocations.length > 0;

  // Continuous loading: render a window of cards and grow it as the user nears
  // the end, so we never mount all 500 (and their images) at once.
  const scrollRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(MASONRY_PAGE);

  // Reset the window (and scroll to top) whenever the result set changes.
  useEffect(() => {
    setVisibleCount(MASONRY_PAGE);
    scrollRef.current?.scrollTo({ top: 0 });
  }, [filteredLocations]);

  // Grow the window when the sentinel nears view. Rooted on the inner scroll
  // container since the document itself is locked on tab routes.
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((c) => Math.min(c + MASONRY_PAGE, filteredLocations.length));
        }
      },
      { root: scrollRef.current, rootMargin: "800px 0px" }
    );
    io.observe(sentinel);
    return () => io.disconnect();
  }, [filteredLocations.length]);

  const visibleLocations = filteredLocations.slice(0, visibleCount);
  const hasMore = visibleCount < filteredLocations.length;

  return (
    <div className="relative w-full h-full flex flex-col">
      {/* Search bar — no border, bg shift handles separation */}
      <div className="flex-shrink-0 flex items-center gap-2 px-3 pb-2.5 pt-[max(0.625rem,env(safe-area-inset-top))] lg:pt-2.5 bg-trail-950/90 backdrop-blur-xl z-20">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500 pointer-events-none" />
          <input
            type="search"
            placeholder="Search locations…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 bg-white/[0.05] rounded-lg text-base text-fg placeholder:text-stone-500 outline-none transition-colors focus:bg-white/[0.09]"
            style={{ paddingLeft: "2.5rem", paddingRight: searchQuery ? "2.5rem" : "0.875rem" }}
          />
          <AnimatePresence>
            {searchQuery && (
              <motion.button
                aria-label="Clear search"
                className="absolute right-1 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center text-stone-400 hover:text-fg transition-colors"
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
          onClick={() => setShowFilters((v) => !v)}
          aria-label="Filters"
          className={cn(
            "flex items-center gap-1.5 h-11 px-3.5 rounded-lg text-sm font-medium transition-colors flex-shrink-0",
            activeFilterCount > 0
              ? "bg-alpine-900/50 text-alpine-300"
              : "text-fg-muted hover:text-fg"
          )}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span className="hidden sm:inline">Filters</span>
          {activeFilterCount > 0 && (
            <span className="text-[10px] font-bold text-alpine-400 ml-0.5">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Sort strip */}
      <div className="flex-shrink-0 px-3 pb-2 bg-trail-950/90 backdrop-blur-xl z-10">
        <SortControl value={sortMode} onChange={setSortMode} />
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
            <span className="text-fg-muted text-xs">
              {filteredLocations.length} result{filteredLocations.length !== 1 ? "s" : ""}
            </span>
            <span className="text-stone-700 text-xs">·</span>
            <button
              onClick={() => { clearFilters(); setSearchQuery(""); }}
              className="text-xs text-fg-muted hover:text-fg transition-colors py-1"
            >
              Clear
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Masonry wall — full width, no max-width cap */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto overscroll-contain">
        {/* "In season now" rail — dismissible, sits above the masonry */}
        <AnimatePresence initial={false}>
          {showSeasonRail && (
            <motion.section
              aria-label={`In season now — ${seasonConfig[season].label}`}
              className="overflow-hidden"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="pt-2 pb-1">
                <div className="flex items-center justify-between px-3 mb-2">
                  <p className="flex items-center gap-1.5 text-[11px] font-medium tracking-[0.12em] uppercase text-fg-muted">
                    <Sparkles className="w-3 h-3 text-gold-400" />
                    In season now
                    <span className="text-stone-600 normal-case tracking-normal">
                      · {seasonConfig[season].label}
                    </span>
                  </p>
                  <button
                    onClick={() => setSeasonRailDismissed(true)}
                    aria-label="Dismiss in-season suggestions"
                    className="w-11 h-11 -mr-2 flex items-center justify-center text-stone-500 hover:text-fg transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div
                  className="flex gap-2 overflow-x-auto px-3 pb-2"
                  style={{ scrollbarWidth: "none" }}
                >
                  {inSeasonLocations.map((loc) => (
                    <button
                      key={loc.id}
                      onClick={() => setSelectedLocation(loc)}
                      className="group relative flex-shrink-0 w-36 h-24 rounded-lg overflow-hidden bg-white/[0.04] text-left active:scale-[0.98] transition-transform"
                    >
                      <img
                        src={loc.heroImage.url}
                        alt={loc.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-2">
                        <p className="text-white text-xs font-medium leading-tight line-clamp-2">
                          {loc.name}
                        </p>
                        <p className="text-white/70 text-[11px] mt-0.5">
                          {regionConfig[loc.region].label}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {filteredLocations.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 text-center">
            <div className="w-12 h-12 rounded-lg bg-white/[0.04] flex items-center justify-center mb-4">
              <Search className="w-5 h-5 text-stone-600" />
            </div>
            <p className="text-fg text-base font-medium mb-1">No results</p>
            <p className="text-fg-muted text-sm">
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
            {visibleLocations.map((loc, i) => (
              <MasonryCard
                key={loc.id}
                location={loc}
                aspectRatio={ASPECT_RATIOS[i % ASPECT_RATIOS.length]}
                onClick={() => setSelectedLocation(loc)}
                animDelay={Math.min((i % MASONRY_PAGE) * 0.025, 0.3)}
              />
            ))}
          </div>
        )}
        {/* Infinite-scroll sentinel — loading the next window before it's reached */}
        {hasMore && <div ref={sentinelRef} aria-hidden className="h-4" />}
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

      {/* Floating "Trip · N" pill — bottom-left, above the nav */}
      <TripPill />
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
        <p className="text-white/70 text-[11px] mt-0.5">{regionConfig[location.region].label}</p>
      </div>
    </motion.button>
  );
}
