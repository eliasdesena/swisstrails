"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useMapStore } from "@/store/map-store";
import { CATEGORIES } from "@/data/categories";
import { cn } from "@/lib/utils";
import { haptics } from "@/lib/haptics";
import type { LocationCategory, Difficulty, Region } from "@/types";

// Selectable filter chip — filled when active, so selection reads at a glance
// (replacing the old flat half-width text rows with a faint check).
const CHIP = "pressable inline-flex items-center rounded-full px-3.5 min-h-[40px] text-sm transition-colors";
const CHIP_ON = "bg-alpine-900/50 text-alpine-300 ring-1 ring-inset ring-alpine-700/40";
const CHIP_OFF = "bg-surface-1 text-fg-muted hover:text-fg";

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
              "bottom-[calc(var(--nav-clear)+0.5rem)] left-2 right-2 max-h-[72dvh] rounded-xl",
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
                      className="icon-button -mr-2.5 text-fg-muted hover:text-fg"
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
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map((cat) => {
                      const on = activeFilters.categories.includes(cat.id as LocationCategory);
                      return (
                        <button
                          key={cat.id}
                          onClick={() => {
                            haptics.tap();
                            setFilters({
                              categories: toggle(activeFilters.categories, cat.id as LocationCategory),
                            });
                          }}
                          className={cn(CHIP, on ? CHIP_ON : CHIP_OFF)}
                        >
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
                  <div className="flex flex-wrap gap-2">
                    {DIFFICULTIES.map(({ id, label }) => {
                      const on = activeFilters.difficulties.includes(id);
                      return (
                        <button
                          key={id}
                          onClick={() => {
                            haptics.tap();
                            setFilters({
                              difficulties: toggle(activeFilters.difficulties, id),
                            });
                          }}
                          className={cn(
                            CHIP,
                            on
                              ? cn("bg-surface-3 ring-1 ring-inset ring-white/10", DIFF_COLORS[id])
                              : CHIP_OFF
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
                  <p className="text-fg-muted text-[11px] font-medium tracking-[0.12em] uppercase mb-2.5">
                    Region
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {REGIONS.map(({ id, label }) => {
                      const on = activeFilters.regions.includes(id);
                      return (
                        <button
                          key={id}
                          onClick={() => {
                            haptics.tap();
                            setFilters({
                              regions: toggle(activeFilters.regions, id),
                            });
                          }}
                          className={cn(CHIP, on ? CHIP_ON : CHIP_OFF)}
                        >
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
