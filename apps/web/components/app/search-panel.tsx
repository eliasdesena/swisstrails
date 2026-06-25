"use client";

import { Search, SlidersHorizontal, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { LocationCard } from "@/components/app/location-card";
import { useMapStore } from "@/store/map-store";
import { cn } from "@/lib/utils";
import { PLACEHOLDER_LOCATIONS } from "@/data/locations";
import { CATEGORIES } from "@/data/categories";
import type { Location } from "@/types";

interface SearchPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchPanel({ isOpen, onClose }: SearchPanelProps) {
  const { openBottomSheet, setFilters, activeFilters, clearFilters, searchQuery, setSearchQuery } =
    useMapStore();

  const [showFilters, setShowFilters] = useState(false);

  const filteredLocations: Location[] = PLACEHOLDER_LOCATIONS.filter((loc) => {
    const q = searchQuery.toLowerCase();
    if (q && !loc.name.toLowerCase().includes(q) && !loc.tagline.toLowerCase().includes(q)) {
      return false;
    }
    if (activeFilters.categories.length > 0 && !activeFilters.categories.includes(loc.category)) {
      return false;
    }
    if (activeFilters.difficulties.length > 0 && !activeFilters.difficulties.includes(loc.difficulty)) {
      return false;
    }
    return true;
  });

  const activeFilterCount =
    activeFilters.categories.length +
    activeFilters.difficulties.length +
    activeFilters.regions.length;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="absolute top-14 lg:top-14 left-0 right-0 bottom-0 lg:left-0 lg:right-auto lg:w-96 z-30 bg-trail-950/90 backdrop-blur-2xl flex flex-col shadow-[8px_0_40px_rgba(0,0,0,0.5)]"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -20, opacity: 0 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Search header */}
          <div className="flex-shrink-0 p-4 bg-white/[0.02]">
            <div className="flex items-center gap-2 mb-3">
              <Input
                icon={<Search className="w-4 h-4" />}
                placeholder="Search locations…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                suffix={
                  searchQuery ? (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="hover:text-fg transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  ) : undefined
                }
              />
              <button
                className={cn(
                  "relative w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center transition-colors",
                  showFilters
                    ? "bg-alpine-900/60 text-alpine-300"
                    : "bg-white/[0.05] text-fg-muted hover:bg-white/[0.08] hover:text-fg"
                )}
                onClick={() => setShowFilters(!showFilters)}
              >
                <SlidersHorizontal className="w-4 h-4" />
                {activeFilterCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-alpine-400 text-trail-950 text-xs rounded-full flex items-center justify-center font-bold">
                    {activeFilterCount}
                  </span>
                )}
              </button>
              <button
                className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center bg-white/[0.05] text-fg-muted hover:bg-white/[0.08] hover:text-fg transition-colors lg:hidden"
                onClick={onClose}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Category filters */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <div className="pt-3">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-fg-subtle text-xs">Categories</p>
                      {activeFilterCount > 0 && (
                        <button
                          onClick={clearFilters}
                          className="text-fg-subtle hover:text-fg text-xs transition-colors"
                        >
                          Clear all
                        </button>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {CATEGORIES.map((cat) => {
                        const isActive = activeFilters.categories.includes(cat.id);
                        return (
                          <button
                            key={cat.id}
                            className={cn(
                              "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all",
                              isActive
                                ? "bg-alpine-900/60 text-alpine-300"
                                : "bg-white/[0.05] text-fg-muted hover:bg-white/[0.08]"
                            )}
                            onClick={() => {
                              const curr = activeFilters.categories;
                              setFilters({
                                categories: isActive
                                  ? curr.filter((c) => c !== cat.id)
                                  : [...curr, cat.id],
                              });
                            }}
                          >
                            <span>{cat.icon}</span>
                            {cat.name}
                          </button>
                        );
                      })}
                    </div>

                    <div className="mt-3">
                      <p className="text-fg-subtle text-xs mb-2">Difficulty</p>
                      <div className="flex flex-wrap gap-1.5">
                        {(["easy", "moderate", "challenging", "expert"] as const).map((d) => {
                          const isActive = activeFilters.difficulties.includes(d);
                          return (
                            <button
                              key={d}
                              className={cn(
                                "px-2.5 py-1 rounded-lg text-xs font-medium transition-all capitalize",
                                isActive
                                  ? "bg-alpine-900/60 text-alpine-300"
                                  : "bg-white/[0.05] text-fg-muted hover:bg-white/[0.08]"
                              )}
                              onClick={() => {
                                const curr = activeFilters.difficulties;
                                setFilters({
                                  difficulties: isActive
                                    ? curr.filter((x) => x !== d)
                                    : [...curr, d],
                                });
                              }}
                            >
                              {d}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Results count */}
            <p className="text-fg-subtle text-xs mt-3">
              {filteredLocations.length} location{filteredLocations.length !== 1 ? "s" : ""}
              {activeFilterCount > 0 && " (filtered)"}
            </p>
          </div>

          {/* Results list */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {filteredLocations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-center px-4">
                <div className="w-10 h-10 rounded-full bg-white/[0.04] flex items-center justify-center mb-3">
                  <svg className="w-5 h-5 text-stone-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"/></svg>
                </div>
                <p className="text-fg-muted text-sm font-medium">No locations found</p>
                <p className="text-fg-subtle text-xs mt-1">Try adjusting your filters</p>
              </div>
            ) : (
              filteredLocations.map((loc) => (
                <LocationCard
                  key={loc.id}
                  location={loc}
                  compact
                  onClick={() => {
                    openBottomSheet(loc.id);
                    onClose();
                  }}
                />
              ))
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
