"use client";

import { Heart, Bookmark, CheckCircle2, type LucideIcon } from "lucide-react";
import { useSocialStore } from "@/store/social-store";
import { displayedCount } from "@/lib/social-counts";
import { cn } from "@/lib/utils";
import type { ReactionKind } from "@/types";

const REACTIONS: {
  kind: ReactionKind;
  label: string;
  Icon: LucideIcon;
  activeColor: string;
  fill?: boolean;
}[] = [
  { kind: "like", label: "Like", Icon: Heart, activeColor: "text-rose-400", fill: true },
  { kind: "wantToGo", label: "Want to go", Icon: Bookmark, activeColor: "text-alpine-300", fill: true },
  { kind: "beenThere", label: "Been there", Icon: CheckCircle2, activeColor: "text-emerald-400" },
];

/**
 * Like / Want-to-go / Been-there reaction chips. Counts are deterministic
 * "community" base counts (no backend) plus the local user's own toggle.
 * `data-no-drag` so taps never start a bottom-sheet drag.
 */
export function ReactionBar({
  locationId,
  className,
}: {
  locationId: string;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {REACTIONS.map((r) => (
        <ReactionChip key={r.kind} locationId={locationId} {...r} />
      ))}
    </div>
  );
}

function ReactionChip({
  locationId,
  kind,
  label,
  Icon,
  activeColor,
  fill,
}: {
  locationId: string;
  kind: ReactionKind;
  label: string;
  Icon: LucideIcon;
  activeColor: string;
  fill?: boolean;
}) {
  const on = useSocialStore((s) => s.hasReaction(locationId, kind));
  const toggle = useSocialStore((s) => s.toggleReaction);
  const count = displayedCount(locationId, kind, on);

  return (
    <button
      type="button"
      data-no-drag
      aria-pressed={on}
      aria-label={`${label} — ${count}`}
      onClick={() => toggle(locationId, kind)}
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
}
