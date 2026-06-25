"use client";

import { Heart, Map } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LocationCard } from "@/components/app/location-card";
import { useFavoritesStore } from "@/store/favorites-store";
import { useMapStore } from "@/store/map-store";
import { PLACEHOLDER_LOCATIONS } from "@/data/locations";
import { Reveal } from "@/components/shared/reveal";

export default function FavoritesPage() {
  const { favoriteIds } = useFavoritesStore();
  const { openBottomSheet } = useMapStore();

  const favoriteLocations = PLACEHOLDER_LOCATIONS.filter((l) =>
    favoriteIds.has(l.id)
  );

  return (
    <div className="h-full overflow-y-auto p-4 lg:p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Reveal>
            <h1 className="t-h2 text-fg mb-1">Your Favourites</h1>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="t-body text-fg-muted">
              {favoriteLocations.length > 0
                ? `${favoriteLocations.length} saved location${favoriteLocations.length > 1 ? "s" : ""}`
                : "Start saving locations you love"}
            </p>
          </Reveal>
        </div>

        {favoriteLocations.length === 0 ? (
          /* Empty state */
          <motion.div
            className="flex flex-col items-center justify-center py-24 text-center"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="w-20 h-20 rounded-2xl bg-trail-800 border border-stone-800 flex items-center justify-center mb-6">
              <Heart className="w-8 h-8 text-fg-subtle" />
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
          /* Favorites grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {favoriteLocations.map((location, i) => (
              <motion.div
                key={location.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.5,
                  delay: i * 0.08,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                <LocationCard
                  location={location}
                  onClick={() => openBottomSheet(location.id)}
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
