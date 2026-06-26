"use client";

import { useEffect, useState } from "react";
import { Heart, Map } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LocationCard } from "@/components/app/location-card";
import { useFavoritesStore } from "@/store/favorites-store";
import { useMapStore } from "@/store/map-store";
import { PLACEHOLDER_LOCATIONS } from "@/data/locations";
import { EASE_OUT, SPRING } from "@/lib/motion";

export default function FavoritesPage() {
  const { favoriteIds } = useFavoritesStore();
  const { openBottomSheet } = useMapStore();

  // Persisted Zustand stores hydrate after mount; gate the list/count behind a
  // `mounted` flag so we don't flash a 0/empty state or risk an SSR mismatch.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const favoriteLocations = mounted
    ? PLACEHOLDER_LOCATIONS.filter((l) => favoriteIds.has(l.id))
    : [];

  const count = favoriteLocations.length;

  return (
    <div className="h-full overflow-y-auto px-4 lg:px-6 pb-[calc(var(--nav-h)+0.5rem)] lg:pb-6 pt-[max(1rem,env(safe-area-inset-top))] lg:pt-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="t-h2 text-fg mb-1">Your Favourites</h1>
          <p className="t-body text-fg-muted">
            {mounted && count > 0
              ? `${count} saved location${count > 1 ? "s" : ""}`
              : "Start saving locations you love"}
          </p>
        </div>

        {mounted && count === 0 ? (
          /* Empty state */
          <motion.div
            className="flex flex-col items-center justify-center py-24 text-center"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE_OUT }}
          >
            <div className="w-20 h-20 rounded-full bg-alpine-900/30 ring-1 ring-alpine-800/30 flex items-center justify-center mb-6">
              <Heart className="w-8 h-8 text-alpine-500/70" />
            </div>
            <h2 className="t-h3 text-fg mb-3">No saved locations yet</h2>
            <p className="t-body text-fg-muted max-w-sm mb-8">
              Explore the map and tap the heart icon on any location to save it here.
            </p>
            <Button asChild variant="alpine">
              <Link href="/explore">
                <Map className="w-4 h-4" />
                Explore the Map
              </Link>
            </Button>
          </motion.div>
        ) : (
          /* Favorites grid — popLayout so removed cards shrink out and the
             survivors reflow smoothly instead of teleporting. */
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <AnimatePresence mode="popLayout">
              {favoriteLocations.map((location, i) => (
                <motion.div
                  key={location.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{
                    duration: 0.35,
                    delay: Math.min(i * 0.04, 0.3),
                    ease: EASE_OUT,
                    layout: SPRING.gentle,
                  }}
                >
                  <LocationCard
                    location={location}
                    onClick={() => openBottomSheet(location.id)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
