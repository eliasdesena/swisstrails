"use client";

import { useEffect, useRef, useState } from "react";
import { User, MapPin, Heart, Settings, LogOut, Shield, ChevronRight, Mountain, Route, Users } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useFavoritesStore } from "@/store/favorites-store";
import { useVisitedStore } from "@/store/visited-store";
import { useMapPrefStore } from "@/store/map-pref-store";
import { PLACEHOLDER_LOCATIONS } from "@/data/locations";
import { fadeUp } from "@/lib/motion";
import { haptics } from "@/lib/haptics";
import { cn } from "@/lib/utils";

const MAP_APP_OPTIONS = [
  { v: "auto", label: "Auto" },
  { v: "apple", label: "Apple Maps" },
  { v: "google", label: "Google Maps" },
] as const;

const MENU_ITEMS = [
  {
    icon: MapPin,
    label: "Explore the map",
    href: "/map",
    description: "Discover new locations",
    soon: false,
  },
  {
    icon: Heart,
    label: "Saved locations",
    href: "/favorites",
    description: "View your favourites",
    soon: false,
  },
  {
    icon: Route,
    label: "My trip",
    href: "/trip",
    description: "Plan your itinerary",
    soon: false,
  },
  {
    icon: Users,
    label: "Hike Buddy",
    href: "/hike-buddy",
    description: "Find hiking partners",
    soon: true,
  },
  {
    icon: Settings,
    label: "Account settings",
    href: "#",
    description: "Email, password, preferences",
    soon: true,
  },
  {
    icon: Shield,
    label: "Privacy & data",
    href: "#",
    description: "Manage your data",
    soon: true,
  },
];

/** Map of location id → region, so we can count distinct cantons visited. */
const REGION_BY_ID = new Map(PLACEHOLDER_LOCATIONS.map((l) => [l.id, l.region]));

/** Animated integer that counts up from 0 on mount. */
function CountUp({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (value <= 0) {
      setDisplay(0);
      return;
    }
    const duration = 600; // ms
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      // easeOutExpo, matching the app's settle curve.
      const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      setDisplay(Math.round(eased * value));
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [value]);

  return <>{display}</>;
}

export default function ProfilePage() {
  const router = useRouter();
  const { favoriteIds } = useFavoritesStore();
  const { visitedIds } = useVisitedStore();
  const mapApp = useMapPrefStore((s) => s.preferredMapApp);
  const setMapApp = useMapPrefStore((s) => s.setPreferredMapApp);

  // Persisted stores hydrate after mount; gate the stats so they don't paint 0
  // then jump (and to avoid an SSR mismatch).
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Distinct cantons among visited locations — a real metric in place of the
  // old placeholder "Since 2025".
  const cantonsVisited = mounted
    ? new Set(
        Array.from(visitedIds)
          .map((id) => REGION_BY_ID.get(id))
          .filter(Boolean)
      ).size
    : 0;

  const stats = [
    { label: "Saved", value: mounted ? favoriteIds.size : 0, Icon: Heart },
    { label: "Explored", value: mounted ? visitedIds.size : 0, Icon: MapPin },
    { label: "Cantons", value: cantonsVisited, Icon: Mountain },
  ];

  const handleSignOut = () => {
    haptics.tap();
    router.push("/login");
  };

  const handleMapApp = (v: (typeof MAP_APP_OPTIONS)[number]["v"]) => {
    haptics.tap();
    setMapApp(v);
  };

  return (
    <div className="h-full overflow-y-auto">
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="show"
        className="max-w-lg mx-auto px-4 lg:px-6 pb-4 lg:pb-6 pt-[max(1rem,env(safe-area-inset-top))] lg:pt-6"
      >
        {/* Profile header */}
        <div className="flex items-center gap-4 mb-8 p-5 card-solid rounded-xl">
          <div className="w-12 h-12 rounded-full bg-white/[0.06] flex items-center justify-center flex-shrink-0">
            <User className="w-5 h-5 text-stone-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="t-h4 text-fg truncate">Demo Explorer</h2>
            <p className="text-fg-muted text-sm truncate mt-0.5">
              Full access · all locations
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="card-solid rounded-lg p-4 text-center"
            >
              <stat.Icon className="w-4 h-4 text-fg-muted mx-auto mb-2" />
              <p className="text-fg text-2xl font-semibold tabular-nums leading-none">
                <CountUp value={stat.value} />
              </p>
              <p className="text-fg-subtle text-xs mt-1.5">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Menu */}
        <div className="card-solid rounded-xl overflow-hidden mb-6">
          {MENU_ITEMS.map((item) => {
            const inner = (
              <>
                <div
                  className={cn(
                    "w-9 h-9 rounded-lg bg-white/[0.04] flex items-center justify-center flex-shrink-0",
                    item.soon && "opacity-60"
                  )}
                >
                  <item.icon
                    className={cn(
                      "w-4 h-4",
                      item.soon
                        ? "text-fg-subtle"
                        : "text-fg-muted group-hover:text-fg transition-colors"
                    )}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={cn(
                      "text-sm font-medium",
                      item.soon ? "text-fg-muted" : "text-fg"
                    )}
                  >
                    {item.label}
                  </p>
                  <p className="text-fg-subtle text-xs mt-0.5">{item.description}</p>
                </div>
                {item.soon ? (
                  <span className="text-[10px] font-medium uppercase tracking-wide text-fg-subtle bg-white/[0.04] px-2 py-1 rounded flex-shrink-0">
                    Soon
                  </span>
                ) : (
                  <ChevronRight className="w-4 h-4 text-fg-subtle group-hover:text-fg-muted transition-colors flex-shrink-0" />
                )}
              </>
            );
            return item.soon ? (
              <div
                key={item.label}
                aria-disabled="true"
                className="flex items-center gap-3 px-5 min-h-[60px] py-3 opacity-55 cursor-default select-none group"
              >
                {inner}
              </div>
            ) : (
              <Link
                key={item.label}
                href={item.href}
                className="pressable-sm flex items-center gap-3 px-5 min-h-[60px] py-3 hover:bg-white/[0.03] active:bg-white/[0.05] transition-colors group"
              >
                {inner}
              </Link>
            );
          })}
        </div>

        {/* Directions app preference — segmented control with a sliding thumb. */}
        <div className="card-solid rounded-xl p-5 mb-6">
          <p className="text-[11px] font-medium tracking-[0.12em] uppercase text-fg-muted mb-3">
            Directions app
          </p>
          <div className="flex gap-1 p-1 rounded-lg bg-surface-1">
            {MAP_APP_OPTIONS.map((opt) => {
              const active = (mapApp ?? "auto") === opt.v;
              return (
                <button
                  key={opt.v}
                  onClick={() => handleMapApp(opt.v)}
                  className={cn(
                    "pressable-sm relative flex-1 h-9 rounded-md text-sm font-medium transition-colors",
                    active ? "text-white" : "text-fg-muted hover:text-fg"
                  )}
                >
                  {active && (
                    <motion.div
                      layoutId="map-app-thumb"
                      transition={{ type: "spring", stiffness: 520, damping: 40 }}
                      className="absolute inset-0 rounded-md bg-alpine-700/80"
                    />
                  )}
                  <span className="relative z-10">{opt.label}</span>
                </button>
              );
            })}
          </div>
          <p className="text-fg-subtle text-xs mt-2.5">
            Used when you tap “Get directions”.
            {mapApp == null && " You'll be asked the first time."}
          </p>
        </div>

        {/* Access info */}
        <div className="p-4 bg-white/[0.02] rounded-xl mb-6">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-white/[0.04] flex items-center justify-center flex-shrink-0">
              <Shield className="w-3.5 h-3.5 text-alpine-500" />
            </div>
            <div>
              <p className="text-fg text-sm font-medium">Full access active</p>
              <p className="text-fg-muted text-xs">Lifetime · includes all future locations</p>
            </div>
          </div>
        </div>

        {/* Sign out */}
        <Button
          variant="ghost"
          onClick={handleSignOut}
          className="w-full text-fg-muted hover:text-fg"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </Button>
      </motion.div>
    </div>
  );
}
