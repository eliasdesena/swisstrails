"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, ArrowRight, Clock, Mountain, Navigation, Calendar } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMapStore } from "@/store/map-store";
import { categoryConfig, regionConfig, cn } from "@/lib/utils";
import { PLACEHOLDER_LOCATIONS } from "@/data/locations";
import type { Location, Difficulty } from "@/types";

interface LocationDetailSheetProps {
  location: Location | null;
  onClose: () => void;
  onSelectSimilar: (location: Location) => void;
}

// Deterministic shuffle seeded by a number — keeps renders stable
function seededShuffle<T>(arr: T[], seed: number): T[] {
  const copy = [...arr];
  let s = seed;
  for (let i = copy.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    const j = Math.abs(s) % (i + 1);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

const DIFF_STYLES: Record<Difficulty, string> = {
  easy: "text-alpine-300 bg-alpine-900/50 border-alpine-800/50",
  moderate: "text-yellow-300 bg-yellow-900/40 border-yellow-800/40",
  challenging: "text-orange-300 bg-orange-900/40 border-orange-800/40",
  expert: "text-red-300 bg-red-900/40 border-red-800/40",
};

export function LocationDetailSheet({
  location,
  onClose,
  onSelectSimilar,
}: LocationDetailSheetProps) {
  const router = useRouter();
  const { openBottomSheet } = useMapStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  // TODO: Replace with visual similarity engine — currently picks same-category locations
  // using a deterministic shuffle seeded by the location ID hash to keep renders stable.
  const similar = location
    ? seededShuffle(
        PLACEHOLDER_LOCATIONS.filter(
          (l) => l.category === location.category && l.id !== location.id
        ),
        location.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0)
      ).slice(0, 10)
    : [];

  // Lock body scroll while open
  useEffect(() => {
    if (location) {
      scrollRef.current?.scrollTo(0, 0);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [location?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  function viewOnMap() {
    if (!location) return;
    openBottomSheet(location.id);
    router.push("/map");
    onClose();
  }

  const cat = location ? categoryConfig[location.category] : null;
  const region = location ? regionConfig[location.region] : null;

  return (
    <AnimatePresence>
      {location && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[1300] bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />

          {/* Sheet — full screen on mobile, centered modal on desktop */}
          <motion.div
            className={cn(
              "fixed z-[1400] flex flex-col overflow-hidden bg-trail-950",
              // Mobile: slide up from bottom, full screen
              "inset-x-0 bottom-0 rounded-t-2xl",
              // Desktop: centered modal
              "lg:inset-auto lg:top-1/2 lg:left-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2",
              "lg:w-[560px] lg:max-h-[88vh] lg:rounded-2xl"
            )}
            style={{ maxHeight: "calc(100dvh - env(safe-area-inset-top, 0px) - 24px)" }}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 32, mass: 0.9 }}
          >
            {/* Hero image */}
            <div className="relative flex-shrink-0 h-[42vh] lg:h-64 bg-trail-900">
              <img
                src={location.heroImage.url}
                alt={location.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-trail-950 via-trail-950/20 to-transparent" />

              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/50 backdrop-blur-md border border-white/[0.15] flex items-center justify-center text-white hover:bg-black/70 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Category badge */}
              <div className="absolute top-4 left-4">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-black/50 backdrop-blur-md border border-white/[0.12] rounded-full text-xs text-white font-medium">
                  {cat?.emoji} {cat?.label}
                </span>
              </div>

              {/* Name at bottom of hero */}
              <div className="absolute bottom-0 left-0 right-0 px-5 pb-4 pt-8">
                <h2 className="text-fg text-xl font-bold leading-tight">{location.name}</h2>
                {location.tagline && (
                  <p className="text-fg-subtle text-sm mt-0.5 line-clamp-1">{location.tagline}</p>
                )}
              </div>
            </div>

            {/* Scrollable body */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto overscroll-contain">
              <div className="px-5 py-4 space-y-5 pb-8">
                {/* Meta chips */}
                <div className="flex flex-wrap gap-1.5">
                  <Chip icon={<MapPin className="w-3 h-3" />} label={region?.label ?? location.region} />
                  <Chip
                    label={location.difficulty.charAt(0).toUpperCase() + location.difficulty.slice(1)}
                    className={DIFF_STYLES[location.difficulty]}
                  />
                  {location.elevation != null && (
                    <Chip icon={<Mountain className="w-3 h-3" />} label={`${location.elevation}m`} />
                  )}
                  {location.distanceKm != null && (
                    <Chip icon={<Navigation className="w-3 h-3" />} label={`${location.distanceKm}km`} />
                  )}
                  <Chip
                    icon={<Clock className="w-3 h-3" />}
                    label={`${location.visitDurationHours.min}–${location.visitDurationHours.max}h`}
                  />
                  {location.bestSeason.length > 0 && (
                    <Chip
                      icon={<Calendar className="w-3 h-3" />}
                      label={location.bestSeason
                        .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
                        .join(", ")}
                    />
                  )}
                </div>

                {/* Description */}
                {location.description && (
                  <p className="text-fg-muted text-sm leading-relaxed">{location.description}</p>
                )}

                {/* Highlights */}
                {location.highlights.length > 0 && (
                  <div>
                    <SectionLabel>Highlights</SectionLabel>
                    <ul className="space-y-1.5 mt-2">
                      {location.highlights.map((h, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-fg-muted">
                          <span className="text-alpine-500 mt-0.5 flex-shrink-0">·</span>
                          {h}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Tips */}
                {location.tips.length > 0 && (
                  <div>
                    <SectionLabel>Tips</SectionLabel>
                    <ul className="space-y-1.5 mt-2">
                      {location.tips.map((t, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-fg-muted">
                          <span className="text-yellow-500 mt-0.5 flex-shrink-0">→</span>
                          {t}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Tags */}
                {location.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {location.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 bg-trail-800 border border-white/[0.06] rounded-full text-xs text-fg-subtle"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* View on map CTA */}
                <button
                  onClick={viewOnMap}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-alpine-600 hover:bg-alpine-500 active:bg-alpine-700 text-white text-sm font-semibold rounded-xl transition-colors"
                >
                  <MapPin className="w-4 h-4" />
                  View on Map
                  <ArrowRight className="w-4 h-4" />
                </button>

                {/* Similar locations */}
                {similar.length > 0 && (
                  <div>
                    <SectionLabel>Similar locations</SectionLabel>
                    <p className="text-fg-subtle text-[10px] mt-0.5 mb-3">
                      More {cat?.label.toLowerCase()} spots to discover
                    </p>
                    <div
                      className="flex gap-2 overflow-x-auto pb-1"
                      style={{ scrollbarWidth: "none" }}
                    >
                      {similar.map((sim) => (
                        <button
                          key={sim.id}
                          onClick={() => {
                            scrollRef.current?.scrollTo(0, 0);
                            onSelectSimilar(sim);
                          }}
                          className="flex-shrink-0 w-32 rounded-xl overflow-hidden bg-trail-800 border border-white/[0.06] text-left hover:border-white/[0.12] transition-colors"
                        >
                          <div className="relative h-20">
                            <img
                              src={sim.heroImage.url}
                              alt={sim.name}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                          </div>
                          <div className="p-2">
                            <p className="text-fg text-xs font-medium line-clamp-1">{sim.name}</p>
                            <p className="text-fg-subtle text-[10px] mt-0.5">
                              {regionConfig[sim.region].label}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function Chip({
  icon,
  label,
  className,
}: {
  icon?: React.ReactNode;
  label: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs border",
        "text-fg-muted bg-trail-800 border-white/[0.06]",
        className
      )}
    >
      {icon}
      {label}
    </span>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-fg-subtle text-[10px] font-semibold tracking-widest uppercase">
      {children}
    </p>
  );
}
