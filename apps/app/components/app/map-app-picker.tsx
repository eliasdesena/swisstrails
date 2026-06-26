"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Apple, Navigation, X } from "lucide-react";
import { useMapPrefStore } from "@/store/map-pref-store";

/**
 * First-use directions picker. The first time the user taps "Get directions"
 * (with no saved preference) this asks which maps app to use, remembers it, and
 * opens the destination. Changeable later in Profile › Directions app.
 * Mounted once near the app root.
 */
export function MapAppPicker() {
  const target = useMapPrefStore((s) => s.pickerTarget);
  const choose = useMapPrefStore((s) => s.chooseAndOpen);
  const dismiss = useMapPrefStore((s) => s.dismissPicker);

  return (
    <AnimatePresence>
      {target && (
        <>
          <motion.div
            className="fixed inset-0 z-[1700] bg-black/70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={dismiss}
          />
          <motion.div
            role="dialog"
            aria-label="Choose your maps app"
            className="fixed z-[1800] inset-x-0 bottom-0 rounded-t-xl bg-trail-950 lg:inset-auto lg:top-1/2 lg:left-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2 lg:w-[400px] lg:rounded-xl"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex justify-center pt-2.5 pb-1 lg:hidden">
              <span className="w-9 h-1 rounded-full bg-white/15" />
            </div>

            <div className="flex items-start justify-between px-5 pt-2">
              <div className="min-w-0">
                <h3 className="text-fg text-base font-semibold leading-tight">
                  Open directions in…
                </h3>
                <p className="text-fg-muted text-xs mt-1">
                  We&apos;ll remember your choice — change it anytime in Profile.
                </p>
              </div>
              <button
                onClick={dismiss}
                aria-label="Cancel"
                className="w-11 h-11 -mr-2 -mt-1 flex items-center justify-center text-fg-muted hover:text-fg transition-colors flex-shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-3 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] space-y-1.5">
              <button
                type="button"
                onClick={() => choose("apple")}
                className="w-full flex items-center gap-3 px-3 min-h-[56px] rounded-xl bg-white/[0.04] hover:bg-white/[0.07] active:scale-[0.99] transition-colors"
              >
                <span className="w-10 h-10 rounded-lg bg-white/[0.06] flex items-center justify-center flex-shrink-0">
                  <Apple className="w-5 h-5 text-fg" />
                </span>
                <span className="text-sm text-fg font-medium">Apple Maps</span>
              </button>
              <button
                type="button"
                onClick={() => choose("google")}
                className="w-full flex items-center gap-3 px-3 min-h-[56px] rounded-xl bg-white/[0.04] hover:bg-white/[0.07] active:scale-[0.99] transition-colors"
              >
                <span className="w-10 h-10 rounded-lg bg-white/[0.06] flex items-center justify-center flex-shrink-0">
                  <Navigation className="w-5 h-5 text-alpine-300" />
                </span>
                <span className="text-sm text-fg font-medium">Google Maps</span>
              </button>
              <button
                type="button"
                onClick={() => choose("auto")}
                className="w-full flex items-center justify-center min-h-[44px] rounded-xl text-sm text-fg-muted hover:text-fg transition-colors"
              >
                Use my device default
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
