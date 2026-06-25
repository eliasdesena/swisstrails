"use client";

import { Heart, Clock, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import { cn, difficultyConfig, categoryConfig, formatDuration } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useFavoritesStore } from "@/store/favorites-store";
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
  const fav = isFavorite(location.id);
  const diff = difficultyConfig[location.difficulty];
  const cat = categoryConfig[location.category];

  return (
    <motion.div
      className={cn(
        "relative rounded-2xl overflow-hidden cursor-pointer group",
        "border transition-all duration-300",
        isSelected
          ? "border-alpine-600 shadow-[0_0_24px_rgba(81,94,255,0.2)]"
          : "border-stone-800 hover:border-stone-700",
        compact ? "h-20 flex" : "card-hover"
      )}
      whileHover={{ y: compact ? 0 : -2 }}
      onClick={onClick}
      layout
    >
      {compact ? (
        /* Compact list view */
        <>
          {/* Image thumb */}
          <div className="relative w-20 h-full flex-shrink-0 overflow-hidden">
            <Image
              src={location.heroImage.url}
              alt={location.heroImage.alt}
              fill
              className="object-cover"
              sizes="80px"
            />
            <div className="absolute inset-0 bg-trail-950/20" />
          </div>
          {/* Content */}
          <div className="flex-1 min-w-0 px-3 py-2.5 bg-trail-900">
            <p className="text-fg text-sm font-medium truncate">{location.name}</p>
            <p className="text-fg-subtle text-xs mt-0.5 truncate">
              {cat.emoji} {cat.label} · {formatDuration(location.travelTimeMinutes)}
            </p>
            <div className="flex items-center gap-2 mt-1.5">
              <span className={cn("text-xs font-medium", diff.color)}>
                {diff.label}
              </span>
            </div>
          </div>
          {/* Fav button */}
          <button
            className="px-3 flex items-center bg-trail-900"
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(location.id);
            }}
          >
            <Heart
              className={cn(
                "w-4 h-4 transition-colors",
                fav ? "fill-red-400 text-red-400" : "text-fg-subtle hover:text-fg"
              )}
            />
          </button>
        </>
      ) : (
        /* Card view */
        <>
          {/* Image */}
          <div className="relative aspect-[4/3] overflow-hidden">
            <Image
              src={location.heroImage.url}
              alt={location.heroImage.alt}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-trail-950/80 via-transparent to-transparent" />

            {/* Category badge */}
            <div className="absolute top-3 left-3">
              <Badge variant="default" className="bg-trail-950/80 backdrop-blur-sm border-stone-700/50 text-fg-muted">
                {cat.emoji} {cat.label}
              </Badge>
            </div>

            {/* Fav button */}
            <button
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-trail-950/70 backdrop-blur-sm border border-stone-700/50 flex items-center justify-center transition-colors hover:border-stone-500"
              onClick={(e) => {
                e.stopPropagation();
                toggleFavorite(location.id);
              }}
            >
              <Heart
                className={cn(
                  "w-3.5 h-3.5 transition-colors",
                  fav ? "fill-red-400 text-red-400" : "text-fg-muted"
                )}
              />
            </button>

            {/* New badge */}
            {location.isNew && (
              <div className="absolute bottom-3 right-3">
                <Badge variant="alpine" size="sm">New</Badge>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="p-4 bg-trail-900">
            <h3 className="text-fg font-semibold text-sm leading-snug mb-1">
              {location.name}
            </h3>
            <p className="text-fg-subtle text-xs mb-3 line-clamp-2 leading-relaxed">
              {location.tagline}
            </p>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-xs text-fg-subtle">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatDuration(location.travelTimeMinutes)}
                </span>
                <span className={cn("font-medium", diff.color)}>{diff.label}</span>
              </div>
              {location.saveCount > 0 && (
                <span className="flex items-center gap-1 text-xs text-fg-subtle">
                  <TrendingUp className="w-3 h-3" />
                  {location.saveCount}
                </span>
              )}
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
}
