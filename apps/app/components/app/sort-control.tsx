"use client";

import { MapPin, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useGeoStore } from "@/store/geo-store";
import { SORT_OPTIONS, type SortMode } from "@/lib/sort";

interface SortControlProps {
  value: SortMode;
  onChange: (mode: SortMode) => void;
  className?: string;
}

/**
 * Horizontal pill selector for sort mode. "Nearest" is location-aware: tapping
 * it requests geolocation if needed, shows a spinner while prompting, and an
 * inline hint if the user has denied access — without nagging.
 */
export function SortControl({ value, onChange, className }: SortControlProps) {
  const status = useGeoStore((s) => s.status);
  const position = useGeoStore((s) => s.position);
  const requestLocation = useGeoStore((s) => s.requestLocation);

  const prompting = status === "prompting";
  const needsLocation =
    !position && (status === "denied" || status === "unavailable");

  function handleSelect(mode: SortMode) {
    if (mode === "nearest" && !position) {
      // Ask for permission; selection still flips so the sort kicks in as soon
      // as a position arrives. If denied, the hint below explains why.
      requestLocation();
    }
    onChange(mode);
  }

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div className="flex items-center gap-1.5 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
        {SORT_OPTIONS.map((opt) => {
          const active = value === opt.value;
          const isNearest = opt.value === "nearest";
          return (
            <button
              key={opt.value}
              onClick={() => handleSelect(opt.value)}
              aria-pressed={active}
              className={cn(
                "flex items-center gap-1.5 h-9 px-3 rounded-lg text-xs font-medium whitespace-nowrap transition-colors flex-shrink-0",
                active
                  ? "bg-alpine-900/50 text-alpine-300"
                  : "bg-white/[0.05] text-fg-muted hover:text-fg"
              )}
            >
              {isNearest &&
                (prompting && active ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <MapPin className="w-3.5 h-3.5" />
                ))}
              {opt.label}
            </button>
          );
        })}
      </div>

      <AnimatePresence>
        {value === "nearest" && needsLocation && (
          <motion.p
            className="text-[11px] text-fg-muted px-1"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.15 }}
          >
            {status === "denied"
              ? "Location access needed to sort by distance."
              : "Location unavailable — try again outdoors or check device settings."}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
