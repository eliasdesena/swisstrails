"use client";

import { Users, Map } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/shared/reveal";
import { HIKE_BUDDY_ENABLED } from "@/lib/flags";

export default function HikeBuddyPage() {
  // Gated: the route exists so deep links don't 404, but the feature is not
  // usable until the flag is flipped on. Until then, render "Coming Soon".
  if (!HIKE_BUDDY_ENABLED) {
    return (
      <div className="h-full overflow-y-auto px-4 lg:px-6 pb-4 lg:pb-6 pt-[max(1rem,env(safe-area-inset-top))] lg:pt-6">
        <div className="max-w-lg mx-auto">
          <motion.div
            className="flex flex-col items-center justify-center py-24 text-center"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="w-14 h-14 rounded-lg bg-white/[0.04] flex items-center justify-center mb-6">
              <Users className="w-6 h-6 text-stone-600" />
            </div>
            <span className="text-[10px] font-medium uppercase tracking-wide text-fg-subtle bg-white/[0.04] px-2.5 py-1 rounded mb-4">
              Coming Soon
            </span>
            <h1 className="t-h2 text-fg mb-3">Hike Buddy</h1>
            <p className="t-body text-fg-muted max-w-sm mb-8">
              Find hiking partners who match your pace, favourite regions and
              availability. We&apos;re putting the finishing touches on it.
            </p>
            <Button asChild variant="alpine">
              <Link href="/explore">
                <Map className="w-4 h-4" />
                Explore the Map
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  // When enabled, the matching UI would render here. The store + matching
  // logic are already in place (see store/hike-buddy-store + lib/hike-buddy).
  return (
    <div className="h-full overflow-y-auto px-4 lg:px-6 pb-4 lg:pb-6 pt-[max(1rem,env(safe-area-inset-top))] lg:pt-6">
      <div className="max-w-lg mx-auto">
        <Reveal>
          <h1 className="t-h2 text-fg mb-1">Hike Buddy</h1>
        </Reveal>
      </div>
    </div>
  );
}
