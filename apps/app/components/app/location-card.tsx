"use client";

import { Heart, Clock, TrendingUp, MapPin, Check } from "lucide-react";
import Image from "next/image";
import { cn, difficultyConfig, categoryConfig, formatDuration } from "@/lib/utils";
import { useFavoritesStore } from "@/store/favorites-store";
import { useVisitedStore } from "@/store/visited-store";
import { useGeoStore } from "@/store/geo-store";
import { distanceKm, formatDistance } from "@/lib/distance";
import { useLocationImages } from "@/lib/location-images";
import type { Location } from "@/types";

interface LocationCardProps {
  location: Location;
  onClick?: () => void;
  isSelected?: boolean;
  compact?: boolean;
}

export function LocationCard({
  location,
  onClick,
  isSelected = false,
  compact = false,
}: LocationCardProps) {
  const { isFavorite, toggleFavorite } = useFavoritesStore();
  const visited = useVisitedStore((s) => s.visitedIds.has(location.id));
  const userPosition = useGeoStore((s) => s.position);
  const fav = isFavorite(location.id);
  const diff = difficultyConfig[location.difficulty];
  const cat = categoryConfig[location.category];

  // Card image — first resolved image by source priority (admin override →
  // sourced). Falls back to the sourced hero. See lib/location-images.ts.
  const cardImage = useLocationImages(location)[0] ?? location.heroImage;

  // Real, honest distance when we know where the user is; otherwise fall back
  // to the static travel-time estimate (relabelled "~X by car", no "away").
  const awayKm = userPosition
    ? formatDistance(distanceKm(userPosition, location.coordinates))
    : null;

  return (
    <div
      className={cn(
        "relative rounded-lg overflow-hidden cursor-pointer group",
        "transition-all duration-200",
        isSelected
          ? "ring-1 ring-alpine-600"
          : "hover:bg-trail-800",
        compact ? "h-20 flex" : ""
      )}
      onClick={onClick}
    >
      {compact ? (
        <>
          {/* Image thumb */}
          <div className="relative w-20 h-full flex-shrink-0 overflow-hidden">
            <Image
              src={cardImage.url}
              alt={cardImage.alt}
              fill
              className="object-cover"
              sizes="80px"
            />
            <div className="absolute inset-0 bg-trail-950/20" />
            {/* Visited badge */}
            {visited && (
              <div
                aria-label="Visited"
                className="absolute top-1 left-1 w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center shadow-sm"
              >
                <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
              </div>
            )}
          </div>
          {/* Content */}
          <div className="flex-1 min-w-0 px-3 py-2.5 bg-trail-900">
            <p className="text-fg text-sm font-medium truncate">{location.name}</p>
            <p className="text-fg-muted text-xs mt-0.5 truncate">
              {cat.label} ·{" "}
              {awayKm ? `${awayKm} away` : `~${formatDuration(location.travelTimeMinutes)} by car`}
            </p>
            <div className="flex items-center gap-2 mt-1.5">
              <span className={cn("text-xs font-medium", diff.color)}>
                {diff.label}
              </span>
            </div>
          </div>
          {/* Fav button */}
          <button
            aria-label={fav ? "Remove favourite" : "Add favourite"}
            className="min-w-[48px] flex items-center justify-center bg-trail-900"
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(location.id);
            }}
          >
            <Heart
              className={cn(
                "w-5 h-5 transition-colors",
                fav ? "fill-red-400 text-red-400" : "text-stone-400 hover:text-fg"
              )}
            />
          </button>
        </>
      ) : (
        <>
          {/* Image */}
          <div className="relative aspect-[4/3] overflow-hidden">
            <Image
              src={cardImage.url}
              alt={cardImage.alt}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-trail-950/80 via-transparent to-transparent" />

            {/* Category label */}
            <div className="absolute top-3 left-3">
              <span className="text-[10px] font-medium tracking-[0.1em] uppercase text-white/70 bg-black/40 backdrop-blur-sm rounded px-1.5 py-0.5">
                {cat.label}
              </span>
            </div>

            {/* Fav button */}
            <button
              aria-label={fav ? "Remove favourite" : "Add favourite"}
              className="absolute top-2 right-2 w-11 h-11 rounded-lg bg-black/40 backdrop-blur-sm flex items-center justify-center transition-colors hover:bg-black/60 active:scale-95"
              onClick={(e) => {
                e.stopPropagation();
                toggleFavorite(location.id);
              }}
            >
              <Heart
                className={cn(
                  "w-4 h-4 transition-colors",
                  fav ? "fill-red-400 text-red-400" : "text-white/80"
                )}
              />
            </button>

            {/* Visited chip */}
            {visited && (
              <div className="absolute bottom-3 left-3">
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold tracking-wide uppercase text-emerald-300 bg-emerald-900/70 backdrop-blur-sm rounded px-1.5 py-0.5">
                  <Check className="w-2.5 h-2.5" strokeWidth={3} />
                  Visited
                </span>
              </div>
            )}

            {/* New label */}
            {location.isNew && (
              <div className="absolute bottom-3 right-3">
                <span className="text-[10px] font-semibold tracking-wide uppercase text-alpine-300 bg-alpine-900/70 backdrop-blur-sm rounded px-1.5 py-0.5">
                  New
                </span>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="p-3 bg-trail-900">
            <h3 className="text-fg font-medium text-sm leading-snug mb-0.5">
              {location.name}
            </h3>
            <p className="text-fg-muted text-xs mb-2.5 line-clamp-2 leading-relaxed">
              {location.tagline}
            </p>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-xs text-fg-muted">
                {awayKm ? (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {awayKm} away
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    ~{formatDuration(location.travelTimeMinutes)} by car
                  </span>
                )}
                <span className={cn("font-medium", diff.color)}>{diff.label}</span>
              </div>
              {location.saveCount > 0 && (
                <span className="flex items-center gap-1 text-xs text-fg-muted">
                  <TrendingUp className="w-3 h-3" />
                  {location.saveCount}
                </span>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
