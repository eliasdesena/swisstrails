"use client";

import { Heart, Bookmark, CheckCircle2, type LucideIcon } from "lucide-react";
import { useFavoritesStore } from "@/store/favorites-store";
import { useVisitedStore } from "@/store/visited-store";
import { useSocialStore } from "@/store/social-store";
import { displayedCount } from "@/lib/social-counts";
import { cn } from "@/lib/utils";

/**
 * Engagement chips under the title — the canonical toggles, kept in sync with
 * the rest of the app, each showing a community count plus the user's own:
 *   ❤️ Like       → favourites store (the Favourites tab)
 *   🔖 Want to go  → "want to go" list (social store)
 *   ✓ Been there   → visited store (the Explored stat)
 * `data-no-drag` so taps never start a bottom-sheet drag.
 */
export function ReactionBar({
  locationId,
  className,
}: {
  locationId: string;
  className?: string;
}) {
  const liked = useFavoritesStore((s) => s.favoriteIds.has(locationId));
  const toggleLike = useFavoritesStore((s) => s.toggleFavorite);
  const wantToGo = useSocialStore((s) => s.wantToGo.has(locationId));
  const toggleWant = useSocialStore((s) => s.toggleWantToGo);
  const been = useVisitedStore((s) => s.visitedIds.has(locationId));
  const toggleBeen = useVisitedStore((s) => s.toggleVisited);

  const chips: {
    kind: "like" | "wantToGo" | "beenThere";
    on: boolean;
    toggle: () => void;
    Icon: LucideIcon;
    activeColor: string;
    fill?: boolean;
  }[] = [
    { kind: "like", on: liked, toggle: () => toggleLike(locationId), Icon: Heart, activeColor: "text-rose-400", fill: true },
    { kind: "wantToGo", on: wantToGo, toggle: () => toggleWant(locationId), Icon: Bookmark, activeColor: "text-alpine-300", fill: true },
    { kind: "beenThere", on: been, toggle: () => toggleBeen(locationId), Icon: CheckCircle2, activeColor: "text-emerald-400" },
  ];

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {chips.map(({ kind, on, toggle, Icon, activeColor, fill }) => {
        const count = displayedCount(locationId, kind, on);
        return (
          <button
            key={kind}
            type="button"
            data-no-drag
            aria-pressed={on}
            onClick={toggle}
            className={cn(
              "flex items-center gap-1.5 h-8 px-2.5 rounded-full text-xs font-medium transition-colors active:scale-95",
              on
                ? cn("bg-white/[0.08]", activeColor)
                : "bg-white/[0.04] text-fg-muted hover:text-fg"
            )}
          >
            <Icon className={cn("w-3.5 h-3.5", on && fill && "fill-current")} />
            {count.toLocaleString()}
          </button>
        );
      })}
    </div>
  );
}
