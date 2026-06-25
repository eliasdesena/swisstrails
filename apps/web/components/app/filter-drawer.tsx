"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useMapStore } from "@/store/map-store";
import { CATEGORIES } from "@/data/categories";
import { cn } from "@/lib/utils";
import type { LocationCategory, Difficulty, Region } from "@/types";

const DIFFICULTIES: { id: Difficulty; label: string }[] = [
  { id: "easy", label: "Easy" },
  { id: "moderate", label: "Moderate" },
  { id: "challenging", label: "Challenging" },
  { id: "expert", label: "Expert" },
];

const REGIONS: { id: Region; label: string }[] = [
  { id: "valais", label: "Valais" },
  { id: "bern", label: "Bern" },
  { id: "graubunden", label: "Graubünden" },
  { id: "ticino", label: "Ticino" },
  { id: "lucerne", label: "Lucerne" },
  { id: "uri", label: "Uri" },
  { id: "zurich", label: "Zurich" },
  { id: "fribourg", label: "Fribourg" },
  { id: "vaud", label: "Vaud" },
  { id: "obwalden", label: "Obwalden" },
  { id: "st-gallen", label: "St. Gallen" },
  { id: "appenzell", label: "Appenzell" },
];

const DIFF_ACTIVE: Record<Difficulty, string> = {
  easy: "bg-alpine-900 border-alpine-700 text-alpine-300",
  moderate: "bg-yellow-900/60 border-yellow-700/60 text-yellow-300",
  challenging: "bg-orange-900/60 border-orange-700/60 text-orange-300",
  expert: "bg-red-900/60 border-red-700/60 text-red-300",
};

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  resultCount: number;
}

export function FilterDrawer({ isOpen, onClose, resultCount }: FilterDrawerProps) {
  const { activeFilters, setFilters, clearFilters } = useMapStore();

  const totalActive =
    activeFilters.categories.length +
    activeFilters.difficulties.length +
    activeFilters.regions.length;

  function toggle<T>(arr: T[], val: T): T[] {
    return arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val];
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[1190] bg-black/40 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
          />

          {/* Panel
              Mobile:  floats above bottom nav (bottom-[76px], inset-x-3)
              Desktop: slides in from top-right below the header (top-[58px] right-3, w-80) */}
          <motion.div
            className={cn(
              "fixed z-[1200] bg-trail-950 border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden",
              // mobile
              "bottom-[76px] left-3 right-3 max-h-[70vh]",
              // desktop
              "lg:bottom-auto lg:left-auto lg:top-[58px] lg:right-3 lg:w-80 lg:max-h-[calc(100vh-74px)]"
            )}
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="overflow-y-auto max-h-[inherit]">
              <div className="p-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-fg text-sm font-semibold">Filters</span>
                    {totalActive > 0 && (
                      <span className="flex items-center justify-center w-4 h-4 text-[10px] font-bold bg-alpine-600 text-white rounded-full">
                        {totalActive}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {totalActive > 0 && (
                      <button
                        onClick={clearFilters}
                        className="text-fg-subtle hover:text-fg text-xs transition-colors"
                      >
                        Clear all
                      </button>
                    )}
                    <button
                      onClick={onClose}
                      className="w-6 h-6 rounded-lg bg-trail-800 border border-white/[0.06] flex items-center justify-center text-fg-subtle hover:text-fg transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Category */}
                <div className="mb-4">
                  <p className="text-fg-subtle text-[10px] font-semibold tracking-widest uppercase mb-2">
                    Category
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {CATEGORIES.map((cat) => {
                      const on = activeFilters.categories.includes(cat.id as LocationCategory);
                      return (
                        <button
                          key={cat.id}
                          onClick={() =>
                            setFilters({
                              categories: toggle(activeFilters.categories, cat.id as LocationCategory),
                            })
                          }
                          className={cn(
                            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all",
                            on
                              ? "bg-alpine-900 border-alpine-700 text-alpine-300"
                              : "bg-trail-800 border-white/[0.06] text-fg-muted hover:border-white/[0.12] hover:text-fg"
                          )}
                        >
                          <span className="text-[11px]">{cat.icon}</span>
                          {cat.name}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Difficulty */}
                <div className="mb-4">
                  <p className="text-fg-subtle text-[10px] font-semibold tracking-widest uppercase mb-2">
                    Difficulty
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {DIFFICULTIES.map(({ id, label }) => {
                      const on = activeFilters.difficulties.includes(id);
                      return (
                        <button
                          key={id}
                          onClick={() =>
                            setFilters({
                              difficulties: toggle(activeFilters.difficulties, id),
                            })
                          }
                          className={cn(
                            "px-2.5 py-1 rounded-full text-xs font-medium border transition-all",
                            on
                              ? DIFF_ACTIVE[id]
                              : "bg-trail-800 border-white/[0.06] text-fg-muted hover:border-white/[0.12] hover:text-fg"
                          )}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Region */}
                <div className="mb-5">
                  <p className="text-fg-subtle text-[10px] font-semibold tracking-widest uppercase mb-2">
                    Region
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {REGIONS.map(({ id, label }) => {
                      const on = activeFilters.regions.includes(id);
                      return (
                        <button
                          key={id}
                          onClick={() =>
                            setFilters({
                              regions: toggle(activeFilters.regions, id),
                            })
                          }
                          className={cn(
                            "px-2.5 py-1 rounded-full text-xs font-medium border transition-all",
                            on
                              ? "bg-alpine-900 border-alpine-700 text-alpine-300"
                              : "bg-trail-800 border-white/[0.06] text-fg-muted hover:border-white/[0.12] hover:text-fg"
                          )}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* CTA */}
                <button
                  onClick={onClose}
                  className="w-full py-2.5 bg-alpine-600 hover:bg-alpine-500 text-white text-sm font-semibold rounded-xl transition-colors"
                >
                  Show {resultCount} result{resultCount !== 1 ? "s" : ""}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
