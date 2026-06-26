"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  animate,
} from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { SPRING } from "@/lib/motion";
import { haptics } from "@/lib/haptics";
import { cn } from "@/lib/utils";
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
            onClick={() => {
              haptics.tap();
              setLightboxIndex(i);
            }}
            aria-label={`Open photo ${i + 1} of ${photos.length}`}
            className="pressable relative flex-shrink-0 h-24 w-32 rounded-xl overflow-hidden bg-surface-1"
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

function Lightbox({ photos, index, onClose, onIndexChange }: LightboxProps) {
  return (
    <AnimatePresence>
      {index !== null && (
        <LightboxInner
          photos={photos}
          index={index}
          onClose={onClose}
          onIndexChange={onIndexChange}
        />
      )}
    </AnimatePresence>
  );
}

/**
 * Full-screen, native-feeling lightbox:
 *  - a paged track driven by a shared `x` so the neighbouring photo slides in
 *    under the finger (not a jump-on-threshold);
 *  - swipe-down (or up) to dismiss, with the backdrop dimming as you pull;
 *  - velocity-aware spring settles, load shimmer, and haptics.
 * `dragDirectionLock` keeps a single gesture to one axis (page vs dismiss).
 */
function LightboxInner({
  photos,
  index,
  onClose,
  onIndexChange,
}: {
  photos: LocationImage[];
  index: number;
  onClose: () => void;
  onIndexChange: (index: number) => void;
}) {
  const [w, setW] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth : 0
  );
  const x = useMotionValue(-index * w);
  const y = useMotionValue(0);
  // Backdrop fades as the photo is pulled away from centre.
  const dim = useTransform(y, [-260, 0, 260], [0, 1, 0]);
  const indexRef = useRef(index);
  indexRef.current = index;

  useEffect(() => {
    const onResize = () => setW(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Keep the track aligned to the active page (buttons / keyboard / resize).
  useEffect(() => {
    const controls = animate(x, -index * w, SPRING.soft);
    return () => controls.stop();
  }, [index, w, x]);

  const go = useCallback(
    (dir: number) => {
      const next = (indexRef.current + dir + photos.length) % photos.length;
      if (next !== indexRef.current) haptics.tap();
      onIndexChange(next);
    },
    [photos.length, onIndexChange]
  );

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, onClose]);

  function onDragEnd(
    _: unknown,
    info: { offset: { x: number; y: number }; velocity: { x: number; y: number } }
  ) {
    const { offset, velocity } = info;
    // Vertical-dominant pull → dismiss.
    if (
      Math.abs(offset.y) > Math.abs(offset.x) &&
      (Math.abs(offset.y) > 110 || Math.abs(velocity.y) > 550)
    ) {
      haptics.tap();
      onClose();
      return;
    }
    // Otherwise settle: snap vertical back, page horizontally by offset/velocity.
    animate(y, 0, SPRING.soft);
    let target = index;
    if (offset.x < -w * 0.22 || velocity.x < -450)
      target = Math.min(photos.length - 1, index + 1);
    else if (offset.x > w * 0.22 || velocity.x > 450)
      target = Math.max(0, index - 1);
    if (target !== index) {
      haptics.tap();
      onIndexChange(target);
    }
    animate(x, -target * w, { ...SPRING.soft, velocity: velocity.x });
  }

  return (
    <motion.div
      className="fixed inset-0 z-[1800] select-none overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
    >
      {/* Backdrop — solid at rest; the dim transform fades it as you pull away. */}
      <motion.div
        className="absolute inset-0 bg-black backdrop-blur-xl"
        style={{ opacity: dim }}
      />

      {/* Paged track */}
      <motion.div
        className="absolute inset-0 flex"
        style={{ x, y, width: photos.length * w || "100%" }}
        drag={photos.length > 1 ? true : "y"}
        dragDirectionLock
        dragElastic={0.16}
        dragConstraints={{ left: -(photos.length - 1) * w, right: 0 }}
        onDragEnd={onDragEnd}
      >
        {photos.map((img, i) => (
          <LightboxPage
            key={img.id ?? img.url}
            img={img}
            width={w}
            active={i === index}
          />
        ))}
      </motion.div>

      {/* Close */}
      <button
        aria-label="Close"
        className="icon-button absolute top-[max(1rem,env(safe-area-inset-top))] right-3 rounded-full bg-white/10 text-white/80 hover:text-white"
        onClick={onClose}
      >
        <X className="w-5 h-5" />
      </button>

      {/* Desktop prev/next */}
      {photos.length > 1 && (
        <>
          <button
            aria-label="Previous photo"
            className="icon-button absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/10 text-white/80 hover:text-white max-lg:hidden"
            onClick={() => go(-1)}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            aria-label="Next photo"
            className="icon-button absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/10 text-white/80 hover:text-white max-lg:hidden"
            onClick={() => go(1)}
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          <p className="absolute bottom-[max(1.25rem,env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 text-white/70 text-xs font-medium tabular-nums pointer-events-none">
            {index + 1} / {photos.length}
          </p>
        </>
      )}
    </motion.div>
  );
}

function LightboxPage({
  img,
  width,
  active,
}: {
  img: LocationImage;
  width: number;
  active: boolean;
}) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div
      className="relative h-full flex-shrink-0"
      style={{ width: width || "100%" }}
    >
      {!loaded && <div className="absolute inset-8 skeleton rounded-lg" />}
      <Image
        src={img.url}
        alt={img.alt}
        fill
        className={cn(
          "object-contain transition-opacity duration-300",
          loaded ? "opacity-100" : "opacity-0"
        )}
        sizes="100vw"
        draggable={false}
        priority={active}
        onLoad={() => setLoaded(true)}
      />
    </div>
  );
}
