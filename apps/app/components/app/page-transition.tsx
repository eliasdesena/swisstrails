"use client";

import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { EASE_OUT } from "@/lib/motion";

/**
 * Cross-route enter transition for the (app) tab shell. Keyed on the pathname
 * so each tab change re-runs a short fade + lift instead of a hard cut — the
 * single biggest "this is a website" tell the audit flagged.
 *
 * Enter-only (no AnimatePresence exit): in the App Router the new route's
 * children are already mounted by the time `usePathname()` changes, so an exit
 * variant would animate the wrong content. A keyed enter gives a clean,
 * reliable in-animation without that pitfall. Reduced-motion users get an
 * instant swap via the global CSS guard.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <motion.div
      key={pathname}
      className="h-full"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: EASE_OUT }}
    >
      {children}
    </motion.div>
  );
}
