"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { LocationImage } from "@/types";

interface PhotoStripProps {
  /** Ordered photos — typically `[heroImage, ...gallery]`. */
  photos: LocationImage[];
  className?: string;
}

/**
 * Horizontal, swipeable row of photo thumbnails shown directly under the
 * sheet's title. Tapping a thumbnail opens a full-screen lightbox carousel.
 *
 * The strip is marked `data-no-drag` so the parent draggable sheet ignores
 * pointer-drags that start here — horizontal swipes scroll the photos instead
 * of moving the sheet.
 */
export function PhotoStrip({ photos, className }: PhotoStripProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  if (photos.length === 0) return null;

  return (
    <>
      <div
        data-no-drag
        className={[
          "flex gap-2 overflow-x-auto overscroll-x-contain pb-0.5",
          "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          className ?? "",
        ].join(" ")}
        style={{ WebkitOverflowScrolling: "touch", touchAction: "pan-x" }}
      >
        {photos.map((img, i) => (
          <button
            key={img.id ?? img.url}
            type="button"
            data-no-drag
            onClick={() => setLightboxIndex(i)}
            aria-label={`Open photo ${i + 1} of ${photos.length}`}
            className="relative flex-shrink-0 h-24 w-32 rounded-xl overflow-hidden bg-white/[0.04] active:scale-[0.98] transition-transform"
          >
            <Image
              src={img.url}
              alt={img.alt}
              fill
              className="object-cover"
              sizes="128px"
              priority={i === 0}
            />
          </button>
        ))}
      </div>

      <Lightbox
        photos={photos}
        index={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onIndexChange={setLightboxIndex}
      />
    </>
  );
}

interface LightboxProps {
  photos: LocationImage[];
  index: number | null;
  onClose: () => void;
  onIndexChange: (index: number) => void;
}

/** Simple full-screen carousel lightbox with prev/next + swipe. */
function Lightbox({ photos, index, onClose, onIndexChange }: LightboxProps) {
  const isOpen = index !== null;

  const go = useCallback(
    (dir: number) => {
      if (index === null) return;
      const next = (index + dir + photos.length) % photos.length;
      onIndexChange(next);
    },
    [index, photos.length, onIndexChange]
  );

  useEffect(() => {
    if (!isOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, go, onClose]);

  return (
    <AnimatePresence>
      {index !== null && (
        <motion.div
          className="fixed inset-0 z-[1800] bg-black/95 backdrop-blur-xl flex items-center justify-center select-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={onClose}
        >
          <button
            aria-label="Close"
            className="absolute top-[max(1rem,env(safe-area-inset-top))] right-4 w-11 h-11 rounded-lg bg-white/10 flex items-center justify-center text-white/80 hover:text-white active:scale-95 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
          >
            <X className="w-5 h-5" />
          </button>

          {photos.length > 1 && (
            <>
              <button
                aria-label="Previous photo"
                className="absolute left-2 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 flex items-center justify-center text-white/80 hover:text-white active:scale-95 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  go(-1);
                }}
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                aria-label="Next photo"
                className="absolute right-2 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 flex items-center justify-center text-white/80 hover:text-white active:scale-95 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  go(1);
                }}
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          <motion.div
            key={index}
            className="relative w-full max-w-3xl aspect-[4/3] mx-4"
            drag={photos.length > 1 ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={(_, info) => {
              if (info.offset.x < -80) go(1);
              else if (info.offset.x > 80) go(-1);
            }}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={photos[index].url}
              alt={photos[index].alt}
              fill
              className="object-contain rounded-lg"
              sizes="100vw"
              draggable={false}
            />
          </motion.div>

          {photos.length > 1 && (
            <p className="absolute bottom-[max(1.25rem,env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 text-white/70 text-xs font-medium tabular-nums">
              {index + 1} / {photos.length}
            </p>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
