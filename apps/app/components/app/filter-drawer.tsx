"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Check } from "lucide-react";
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
  { id: "graubunden", label: "Graubünden" },
  { id: "valais", label: "Valais" },
  { id: "bern", label: "Bern" },
  { id: "ticino", label: "Ticino" },
  { id: "uri", label: "Uri" },
  { id: "schwyz", label: "Schwyz" },
  { id: "glarus", label: "Glarus" },
  { id: "lucerne", label: "Lucerne" },
  { id: "obwalden", label: "Obwalden" },
  { id: "nidwalden", label: "Nidwalden" },
  { id: "st-gallen", label: "St. Gallen" },
  { id: "appenzell", label: "Appenzell" },
  { id: "fribourg", label: "Fribourg" },
  { id: "vaud", label: "Vaud" },
  { id: "jura", label: "Jura" },
  { id: "neuchatel", label: "Neuchâtel" },
  { id: "solothurn", label: "Solothurn" },
];

const DIFF_COLORS: Record<Difficulty, string> = {
  easy: "text-alpine-300",
  moderate: "text-yellow-300",
  challenging: "text-orange-300",
  expert: "text-red-300",
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
            className="fixed inset-0 z-[1190] bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            className={cn(
              "fixed z-[1200] bg-trail-950 overflow-hidden flex flex-col",
              "bottom-[calc(4rem+env(safe-area-inset-bottom))] left-2 right-2 max-h-[72dvh] rounded-xl",
              "lg:bottom-auto lg:left-auto lg:top-[56px] lg:right-4 lg:w-72 lg:max-h-[calc(100vh-72px)] lg:rounded-xl"
            )}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex-1 overflow-y-auto overscroll-contain min-h-0">
              <div className="p-4 pb-2">
                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2.5">
                    <span className="text-fg text-sm font-semibold tracking-tight">Filters</span>
                    {totalActive > 0 && (
                      <span className="text-xs text-fg-muted">
                        {totalActive} active
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {totalActive > 0 && (
                      <button
                        onClick={clearFilters}
                        className="text-xs text-fg-muted hover:text-fg transition-colors px-2 py-1"
                      >
                        Clear
                      </button>
                    )}
                    <button
                      onClick={onClose}
                      aria-label="Close filters"
                      className="w-9 h-9 -mr-1.5 flex items-center justify-center text-fg-muted hover:text-fg transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Category */}
                <div className="mb-5">
                  <p className="text-fg-muted text-[11px] font-medium tracking-[0.12em] uppercase mb-2.5">
                    Category
                  </p>
                  <div className="flex flex-wrap gap-x-0 gap-y-0">
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
                            "flex items-center gap-2 px-2 py-2.5 min-h-[44px] text-sm transition-colors duration-100 w-1/2 text-left",
                            on ? "text-fg" : "text-stone-400 hover:text-fg"
                          )}
                        >
                          <Check
                            className={cn(
                              "w-3 h-3 flex-shrink-0 transition-opacity",
                              on ? "opacity-100 text-alpine-400" : "opacity-0"
                            )}
                          />
                          {cat.name}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Difficulty */}
                <div className="mb-5">
                  <p className="text-fg-muted text-[11px] font-medium tracking-[0.12em] uppercase mb-2.5">
                    Difficulty
                  </p>
                  <div className="flex flex-wrap gap-x-0 gap-y-0">
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
                            "flex items-center gap-2 px-2 py-2.5 min-h-[44px] text-sm transition-colors duration-100 w-1/2 text-left",
                            on ? DIFF_COLORS[id] : "text-stone-400 hover:text-fg"
                          )}
                        >
                          <Check
                            className={cn(
                              "w-3 h-3 flex-shrink-0 transition-opacity",
                              on ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Region */}
                <div className="mb-5">
                  <p className="text-fg-muted text-[11px] font-medium tracking-[0.12em] uppercase mb-2.5">
                    Region
                  </p>
                  <div className="flex flex-wrap gap-x-0 gap-y-0">
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
                            "flex items-center gap-2 px-2 py-2.5 min-h-[44px] text-sm transition-colors duration-100 w-1/2 text-left",
                            on ? "text-fg" : "text-stone-400 hover:text-fg"
                          )}
                        >
                          <Check
                            className={cn(
                              "w-3 h-3 flex-shrink-0 transition-opacity",
                              on ? "opacity-100 text-alpine-400" : "opacity-0"
                            )}
                          />
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>
            </div>

            {/* Pinned footer CTA — always reachable even on the long Region list */}
            <div className="flex-shrink-0 border-t border-white/[0.06] bg-trail-950/95 p-3">
              <button
                onClick={onClose}
                className="w-full py-3 bg-alpine-600 hover:bg-alpine-500 active:bg-alpine-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Show {resultCount} result{resultCount !== 1 ? "s" : ""}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
