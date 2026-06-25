"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, ArrowRight, Clock, Mountain, Navigation, Calendar } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMapStore } from "@/store/map-store";
import { useGeoStore } from "@/store/geo-store";
import { distanceKm as haversineKm, formatDistance } from "@/lib/distance";
import { categoryConfig, regionConfig, cn } from "@/lib/utils";
import { OpenInSheet } from "@/components/app/open-in-sheet";
import { WeatherWidget } from "@/components/app/weather-widget";
import { PLACEHOLDER_LOCATIONS } from "@/data/locations";
import type { Location, Difficulty } from "@/types";

interface LocationDetailSheetProps {
  location: Location | null;
  onClose: () => void;
  onSelectSimilar: (location: Location) => void;
}

// Deterministic shuffle seeded by a number
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

const DIFF_COLORS: Record<Difficulty, string> = {
  easy: "text-alpine-400",
  moderate: "text-yellow-400",
  challenging: "text-orange-400",
  expert: "text-red-400",
};

export function LocationDetailSheet({
  location,
  onClose,
  onSelectSimilar,
}: LocationDetailSheetProps) {
  const router = useRouter();
  const { openBottomSheet } = useMapStore();
  const userPosition = useGeoStore((s) => s.position);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [openInSheet, setOpenInSheet] = useState(false);

  // Real straight-line distance from the user, when we know their position.
  const awayKm =
    location && userPosition
      ? formatDistance(haversineKm(userPosition, location.coordinates))
      : null;

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

  useEffect(() => {
    if (location) {
      scrollRef.current?.scrollTo(0, 0);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
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
            className="fixed inset-0 z-[1300] bg-black/70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            className={cn(
              "fixed z-[1400] flex flex-col overflow-hidden bg-trail-950",
              "inset-x-0 bottom-0 rounded-t-xl",
              "lg:inset-auto lg:top-1/2 lg:left-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2",
              "lg:w-[520px] lg:max-h-[86vh] lg:rounded-xl"
            )}
            style={{ maxHeight: "calc(100dvh - 24px)" }}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Hero */}
            <div className="relative flex-shrink-0 h-[40vh] lg:h-56 bg-trail-900">
              <img
                src={location.heroImage.url}
                alt={location.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-trail-950 via-trail-950/10 to-transparent" />

              <button
                onClick={onClose}
                aria-label="Close"
                className="absolute top-3 right-3 w-11 h-11 bg-black/60 backdrop-blur-md rounded-lg flex items-center justify-center text-white/80 hover:text-white active:scale-95 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="absolute bottom-0 left-0 right-0 px-5 pb-4">
                <p className="text-xs font-medium tracking-[0.12em] uppercase text-fg-muted mb-1">
                  {cat?.label}
                </p>
                <h2 className="text-fg text-xl font-semibold leading-tight">{location.name}</h2>
                {location.tagline && (
                  <p className="text-fg-muted text-sm mt-0.5 line-clamp-1">{location.tagline}</p>
                )}
              </div>
            </div>

            {/* Body */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto overscroll-contain">
              <div className="px-5 py-4 space-y-5">
                {/* Meta row */}
                <div className="flex flex-wrap gap-3 text-xs text-fg-muted">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3 h-3" />
                    {region?.label ?? location.region}
                  </span>
                  <span className={cn("font-medium", DIFF_COLORS[location.difficulty])}>
                    {location.difficulty.charAt(0).toUpperCase() + location.difficulty.slice(1)}
                  </span>
                  {location.elevation != null && (
                    <span className="flex items-center gap-1.5">
                      <Mountain className="w-3 h-3" />
                      {location.elevation}m
                    </span>
                  )}
                  {awayKm && (
                    <span className="flex items-center gap-1.5">
                      <Navigation className="w-3 h-3" />
                      {awayKm} away
                    </span>
                  )}
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3 h-3" />
                    {location.visitDurationHours.min}–{location.visitDurationHours.max}h visit
                  </span>
                  {location.bestSeason.length > 0 && (
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3 h-3" />
                      {location.bestSeason
                        .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
                        .join(", ")}
                    </span>
                  )}
                </div>

                {/* Description */}
                {location.description && (
                  <p className="text-stone-400 text-sm leading-relaxed">{location.description}</p>
                )}

                {/* Highlights */}
                {location.highlights.length > 0 && (
                  <div>
                    <p className="text-[11px] font-medium tracking-[0.12em] uppercase text-fg-muted mb-2.5">
                      Highlights
                    </p>
                    <ul className="space-y-1.5">
                      {location.highlights.map((h, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-sm text-stone-400">
                          <span className="w-px h-3 bg-alpine-600 mt-1.5 flex-shrink-0" />
                          {h}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Weather */}
                <WeatherWidget
                  lat={location.coordinates.lat}
                  lng={location.coordinates.lng}
                />

                {/* Tags */}
                {location.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {location.tags.map((tag) => (
                      <span key={tag} className="text-fg-muted text-xs">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Similar */}
                {similar.length > 0 && (
                  <div>
                    <p className="text-[11px] font-medium tracking-[0.12em] uppercase text-fg-muted mb-2.5">
                      More {cat?.label} spots
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
                          className="flex-shrink-0 w-28 rounded-lg overflow-hidden bg-white/[0.04] text-left"
                        >
                          <div className="relative h-16">
                            <img
                              src={sim.heroImage.url}
                              alt={sim.name}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                          </div>
                          <div className="p-1.5">
                            <p className="text-stone-200 text-xs font-medium line-clamp-1">{sim.name}</p>
                            <p className="text-fg-muted text-[11px] mt-0.5">{regionConfig[sim.region].label}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="h-1" />
              </div>
            </div>

            {/* Sticky footer CTA — always visible above the fold + home indicator */}
            <div className="flex-shrink-0 border-t border-white/[0.06] bg-trail-950/95 px-5 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] flex gap-2">
              {/* Get directions / Open in… — opens the deep-link sheet */}
              <button
                onClick={() => setOpenInSheet(true)}
                className="flex items-center justify-center gap-2 px-4 min-h-[44px] py-3.5 bg-white/[0.05] hover:bg-white/[0.08] active:bg-white/[0.1] text-stone-200 text-sm font-medium rounded-lg transition-colors flex-shrink-0"
              >
                <Navigation className="w-4 h-4" />
                Directions
              </button>
              {/* In-app navigation to the map */}
              <button
                onClick={viewOnMap}
                className="flex-1 flex items-center justify-center gap-2 min-h-[44px] py-3.5 bg-alpine-600 hover:bg-alpine-500 active:bg-alpine-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <MapPin className="w-4 h-4" />
                View on Map
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>

          {/* Open in… sheet (deep links) */}
          <OpenInSheet
            location={openInSheet ? location : null}
            onClose={() => setOpenInSheet(false)}
          />
        </>
      )}
    </AnimatePresence>
  );
}
