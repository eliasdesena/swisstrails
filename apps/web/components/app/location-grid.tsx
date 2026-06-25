"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { SlidersHorizontal } from "lucide-react";
import { LocationCard } from "@/components/app/location-card";
import { useMapStore } from "@/store/map-store";
import type { Location } from "@/types";

const PAGE_SIZE = 24;

interface LocationGridProps {
  locations: Location[];
  totalCount: number;
  activeFilterCount: number;
  onOpenFilters: () => void;
}

export function LocationGrid({
  locations,
  totalCount,
  activeFilterCount,
  onOpenFilters,
}: LocationGridProps) {
  const [page, setPage] = useState(1);
  const { openBottomSheet } = useMapStore();

  const visible = locations.slice(0, page * PAGE_SIZE);
  const hasMore = visible.length < locations.length;

  if (locations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-center p-8">
        <div className="w-12 h-12 rounded-lg bg-white/[0.04] flex items-center justify-center mb-4">
          <SlidersHorizontal className="w-5 h-5 text-stone-600" />
        </div>
        <p className="text-fg text-sm font-medium mb-1">No locations found</p>
        <p className="text-fg-subtle text-xs">
          Try a different search or{" "}
          <button
            onClick={onOpenFilters}
            className="text-alpine-400 hover:text-alpine-300 transition-colors underline underline-offset-2"
          >
            adjust filters
          </button>
        </p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-5xl mx-auto px-4 pt-4 pb-6">
        {/* Results header */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-fg-subtle text-xs">
            <span className="text-fg font-semibold">{locations.length}</span>
            {locations.length < totalCount && (
              <span> of {totalCount}</span>
            )}{" "}
            location{locations.length !== 1 ? "s" : ""}
            {activeFilterCount > 0 && (
              <span className="text-alpine-400"> · {activeFilterCount} filter{activeFilterCount !== 1 ? "s" : ""} active</span>
            )}
          </p>
          {activeFilterCount > 0 && (
            <button
              onClick={onOpenFilters}
              className="flex items-center gap-1.5 text-xs text-fg-subtle hover:text-fg transition-colors"
            >
              <SlidersHorizontal className="w-3 h-3" />
              Edit filters
            </button>
          )}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {visible.map((loc, i) => (
            <motion.div
              key={loc.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.3,
                delay: Math.min(i % PAGE_SIZE, 10) * 0.03,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <LocationCard
                location={loc}
                onClick={() => openBottomSheet(loc.id)}
              />
            </motion.div>
          ))}
        </div>

        {/* Load more */}
        {hasMore && (
          <div className="flex justify-center mt-6">
            <button
              className="px-5 py-2.5 bg-trail-800 border border-white/[0.07] text-fg-muted text-sm rounded-xl hover:text-fg hover:border-white/[0.12] transition-colors"
              onClick={() => setPage((p) => p + 1)}
            >
              Load more · {locations.length - visible.length} remaining
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
