"use client";

import {
  Clock, MapPin, Navigation, Heart, Share2, Mountain,
  ChevronLeft, Camera, X, Bus, Car, Lightbulb, Package,
  Waves, Sun, Leaf, Snowflake, MoreHorizontal
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useFavoritesStore } from "@/store/favorites-store";
import { useGeoStore } from "@/store/geo-store";
import { distanceKm, formatDistance } from "@/lib/distance";
import {
  cn,
  difficultyConfig,
  categoryConfig,
  seasonConfig,
  formatDuration,
} from "@/lib/utils";
import { platformDirections } from "@/lib/deep-links";
import { OpenInSheet } from "@/components/app/open-in-sheet";
import type { Location } from "@/types";

interface LocationDetailProps {
  location: Location;
  onClose: () => void;
}

const SEASON_ICONS = {
  spring: Leaf,
  summer: Sun,
  autumn: Leaf,
  winter: Snowflake,
  "year-round": Waves,
};

const DIFF_COLOR: Record<string, string> = {
  easy: "text-alpine-400",
  moderate: "text-yellow-400",
  challenging: "text-orange-400",
  expert: "text-red-400",
};

export function LocationDetail({ location, onClose }: LocationDetailProps) {
  const [activeGalleryIndex, setActiveGalleryIndex] = useState<number | null>(null);
  const [openInSheet, setOpenInSheet] = useState(false);
  const { isFavorite, toggleFavorite } = useFavoritesStore();
  const userPosition = useGeoStore((s) => s.position);
  const fav = isFavorite(location.id);
  const diff = difficultyConfig[location.difficulty];
  const cat = categoryConfig[location.category];

  const awayKm = userPosition
    ? formatDistance(distanceKm(userPosition, location.coordinates))
    : null;

  return (
    <div className="flex flex-col h-full">
      {/* Hero image */}
      <div className="relative flex-shrink-0 h-52 sm:h-64">
        <Image
          src={location.heroImage.url}
          alt={location.heroImage.alt}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-trail-950 via-trail-950/10 to-transparent" />

        {/* Close */}
        <button
          aria-label="Close"
          className="absolute top-3 left-3 w-11 h-11 bg-black/50 backdrop-blur-md rounded-lg flex items-center justify-center text-white/80 hover:text-white active:scale-95 transition-colors"
          onClick={onClose}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Action buttons */}
        <div className="absolute top-3 right-3 flex items-center gap-2">
          <button
            aria-label="Share"
            className="w-11 h-11 bg-black/50 backdrop-blur-md rounded-lg flex items-center justify-center text-white/80 hover:text-white active:scale-95 transition-colors"
            onClick={() => {
              const url = `https://swiss-trails.com/location/${location.slug}`;
              if (navigator.share) {
                void navigator.share({ title: location.name, url });
              } else {
                void navigator.clipboard.writeText(url);
              }
            }}
          >
            <Share2 className="w-4 h-4" />
          </button>
          <button
            aria-label={fav ? "Remove favourite" : "Add favourite"}
            className={cn(
              "w-11 h-11 rounded-lg backdrop-blur-md flex items-center justify-center active:scale-95 transition-colors",
              fav ? "bg-red-500/20 text-red-400" : "bg-black/50 text-white/80 hover:text-white"
            )}
            onClick={() => toggleFavorite(location.id)}
          >
            <Heart className={cn("w-4 h-4", fav && "fill-red-400")} />
          </button>
        </div>

        {/* Name overlay */}
        <div className="absolute bottom-0 left-0 right-0 px-5 pb-4">
          <p className="text-xs font-medium tracking-[0.12em] uppercase text-fg-muted mb-1">
            {cat.label}
          </p>
          <h2 className="text-fg text-xl font-semibold leading-tight">{location.name}</h2>
          {location.tagline && (
            <p className="text-fg-muted text-sm mt-0.5 line-clamp-1">{location.tagline}</p>
          )}
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto overscroll-contain">
        <div className="px-5 py-4 space-y-6">
          {/* Quick meta row */}
          <div className="flex items-center gap-4 text-xs text-fg-muted">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3 h-3" />
              {location.region.charAt(0).toUpperCase() + location.region.slice(1).replace("-", " ")}
            </span>
            <span className={cn("font-medium", DIFF_COLOR[location.difficulty])}>
              {diff.label}
            </span>
            {awayKm ? (
              <span className="flex items-center gap-1.5">
                <Navigation className="w-3 h-3" />
                {awayKm} away
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <Clock className="w-3 h-3" />
                ~{formatDuration(location.travelTimeMinutes)} by car
              </span>
            )}
            {location.elevation && (
              <span className="flex items-center gap-1.5">
                <Mountain className="w-3 h-3" />
                {location.elevation}m
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
              <p className="text-[11px] font-medium tracking-[0.12em] uppercase text-fg-muted mb-3">
                Highlights
              </p>
              <ul className="space-y-2">
                {location.highlights.map((h) => (
                  <li key={h} className="flex items-start gap-2.5 text-sm text-stone-400">
                    <span className="w-px h-3 bg-alpine-600 mt-1 flex-shrink-0" />
                    {h}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Best season */}
          <div>
            <p className="text-[11px] font-medium tracking-[0.12em] uppercase text-fg-muted mb-3">
              Best season
            </p>
            <div className="flex flex-wrap gap-2">
              {location.bestSeason.map((s) => {
                const sc = seasonConfig[s];
                const Icon = SEASON_ICONS[s] ?? Sun;
                return (
                  <div
                    key={s}
                    className="flex items-center gap-1.5 bg-white/[0.04] rounded px-2.5 py-1.5"
                  >
                    <Icon className="w-3 h-3 text-fg-muted" />
                    <div>
                      <p className="text-stone-200 text-xs font-medium">{sc.label}</p>
                      <p className="text-fg-muted text-[11px]">{sc.months}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tips */}
          {location.tips.length > 0 && (
            <div>
              <p className="text-[11px] font-medium tracking-[0.12em] uppercase text-fg-muted mb-3 flex items-center gap-1.5">
                <Lightbulb className="w-3 h-3" />
                Insider tips
              </p>
              <ol className="space-y-2.5">
                {location.tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-stone-400">
                    <span className="text-alpine-400 text-[11px] font-mono mt-0.5 flex-shrink-0">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {tip}
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* What to bring */}
          {location.whatToBring.length > 0 && (
            <div>
              <p className="text-[11px] font-medium tracking-[0.12em] uppercase text-fg-muted mb-3 flex items-center gap-1.5">
                <Package className="w-3 h-3" />
                What to bring
              </p>
              <div className="flex flex-wrap gap-1.5">
                {location.whatToBring.map((item) => (
                  <span
                    key={item}
                    className="bg-white/[0.04] text-stone-400 text-xs px-2.5 py-1 rounded"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {location.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {location.tags.map((tag) => (
                <span key={tag} className="text-fg-muted text-xs">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Getting there */}
          <div>
            <p className="text-[11px] font-medium tracking-[0.12em] uppercase text-fg-muted mb-3 flex items-center gap-1.5">
              <Navigation className="w-3 h-3" />
              Getting there
            </p>
            {location.accessInfo && (
              <p className="text-stone-400 text-sm mb-3">{location.accessInfo}</p>
            )}
            <div className="flex gap-3">
              {location.parkingAvailable && (
                <span className="flex items-center gap-1.5 text-xs text-fg-muted">
                  <Car className="w-3 h-3" /> Parking
                </span>
              )}
              {location.publicTransport && (
                <span className="flex items-center gap-1.5 text-xs text-fg-muted">
                  <Bus className="w-3 h-3" /> Public transport
                </span>
              )}
            </div>
          </div>

          {/* Coordinates */}
          <div className="bg-white/[0.03] rounded-lg p-3 flex items-center justify-between">
            <p className="font-mono text-fg-muted text-xs">
              {location.coordinates.lat.toFixed(6)}, {location.coordinates.lng.toFixed(6)}
            </p>
            <MapPin className="w-3 h-3 text-fg-subtle" />
          </div>

          {/* Gallery */}
          {location.gallery.length > 0 && (
            <div>
              <p className="text-[11px] font-medium tracking-[0.12em] uppercase text-fg-muted mb-3 flex items-center gap-1.5">
                <Camera className="w-3 h-3" />
                Gallery
              </p>
              <div className="grid grid-cols-3 gap-1.5">
                {location.gallery.map((img, i) => (
                  <button
                    key={img.id}
                    className="aspect-square rounded overflow-hidden relative"
                    onClick={() => setActiveGalleryIndex(i)}
                  >
                    <Image
                      src={img.url}
                      alt={img.alt}
                      fill
                      className="object-cover hover:scale-105 transition-transform duration-300"
                      sizes="100px"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="flex-shrink-0 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] flex gap-2">
        <button
          className={cn(
            "flex items-center justify-center gap-2 h-11 px-4 text-sm rounded-lg bg-white/[0.04] transition-colors flex-shrink-0",
            fav ? "text-red-400 bg-red-950/30" : "text-stone-400 hover:text-fg"
          )}
          onClick={() => toggleFavorite(location.id)}
        >
          <Heart className={cn("w-4 h-4", fav && "fill-red-400")} />
          {fav ? "Saved" : "Save"}
        </button>
        {/* One-tap platform-default directions (Apple Maps on iOS, Google elsewhere) */}
        <Button variant="alpine" size="lg" className="flex-1" asChild>
          <a
            href={platformDirections(
              location.coordinates.lat,
              location.coordinates.lng,
              location.name
            )}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Navigation className="w-4 h-4" />
            Get directions
          </a>
        </Button>
        {/* Open the full "Open in…" sheet for more apps */}
        <button
          aria-label="More apps"
          onClick={() => setOpenInSheet(true)}
          className="w-11 h-11 flex-shrink-0 flex items-center justify-center rounded-lg bg-white/[0.04] text-stone-400 hover:text-fg active:scale-95 transition-colors"
        >
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* Open in… sheet */}
      <OpenInSheet
        location={openInSheet ? location : null}
        onClose={() => setOpenInSheet(false)}
      />

      {/* Gallery lightbox */}
      <AnimatePresence>
        {activeGalleryIndex !== null && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={() => setActiveGalleryIndex(null)}
          >
            <button aria-label="Close" className="absolute top-[max(1rem,env(safe-area-inset-top))] right-4 w-11 h-11 rounded-lg bg-white/10 flex items-center justify-center text-white/80 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <div className="relative w-full max-w-2xl aspect-video rounded-lg overflow-hidden">
              <Image
                src={location.gallery[activeGalleryIndex].url}
                alt={location.gallery[activeGalleryIndex].alt}
                fill
                className="object-cover"
                sizes="100vw"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
