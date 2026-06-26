"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, ArrowUp, ArrowDown, Trash2, Star, Plus, RotateCcw, Upload, ImageOff, Undo2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { haptics } from "@/lib/haptics";
import { useImageOverridesStore } from "@/store/image-overrides-store";
import { resolveSourcedImages } from "@/lib/location-images";
import { SUPABASE_IMAGES_ENABLED } from "@/lib/flags";
import type { Location, LocationImage } from "@/types";

interface LocationImageEditorProps {
  location: Location;
  onClose: () => void;
}

/**
 * Admin image editor — a mobile-friendly drawer/modal for managing a single
 * location's image override.
 *
 * Reads/writes `image-overrides-store`, so changes reflect live everywhere the
 * app resolves images via `useLocationImages` (detail sheet, cards). When no
 * override exists the editor shows the sourced Unsplash/Wikimedia images;
 * editing any of them seeds an override from that sourced list first.
 */
export function LocationImageEditor({ location, onClose }: LocationImageEditorProps) {
  const override = useImageOverridesStore((s) => s.overrides[location.id]);
  const setOverride = useImageOverridesStore((s) => s.setOverride);
  const addImage = useImageOverridesStore((s) => s.addImage);
  const removeImage = useImageOverridesStore((s) => s.removeImage);
  const reorder = useImageOverridesStore((s) => s.reorder);
  const setPrimary = useImageOverridesStore((s) => s.setPrimary);
  const clearOverride = useImageOverridesStore((s) => s.clearOverride);

  const [url, setUrl] = useState("");
  const [alt, setAlt] = useState("");
  // Snapshot of the last removed image so the destructive action is undoable.
  const [lastRemoved, setLastRemoved] = useState<{ img: LocationImage; index: number } | null>(null);

  const sourced = resolveSourcedImages(location);
  const hasOverride = !!override && override.length > 0;
  // What the user sees + edits: the override if present, else the sourced list.
  const images: LocationImage[] = hasOverride ? override : sourced;

  /** Promote the (currently sourced) list to an editable override, then mutate. */
  function ensureOverride(): LocationImage[] {
    if (hasOverride) return override;
    setOverride(location.id, sourced);
    return sourced;
  }

  function handleAdd() {
    const trimmed = url.trim();
    if (!trimmed) return;
    haptics.tap();
    // Seed an override from sourced images first if we're still on defaults.
    ensureOverride();
    addImage(location.id, {
      id: "",
      url: trimmed,
      alt: alt.trim() || location.name,
    });
    setUrl("");
    setAlt("");
  }

  function handleMove(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= images.length) return;
    haptics.tap();
    ensureOverride();
    reorder(location.id, index, target);
  }

  function handleRemove(img: LocationImage, index: number) {
    haptics.warn();
    ensureOverride();
    setLastRemoved({ img, index });
    removeImage(location.id, img.url);
  }

  function handleUndoRemove() {
    if (!lastRemoved) return;
    haptics.tap();
    // Re-insert the removed image at its original position.
    const current = useImageOverridesStore.getState().overrides[location.id] ?? images;
    const next = [...current];
    const clampedIndex = Math.min(lastRemoved.index, next.length);
    next.splice(clampedIndex, 0, lastRemoved.img);
    setOverride(location.id, next);
    setLastRemoved(null);
  }

  function handleSetPrimary(img: LocationImage) {
    haptics.tap();
    ensureOverride();
    setPrimary(location.id, img.url);
  }

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        key="backdrop"
        className="fixed inset-0 z-[1500] bg-black/70"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
        onClick={onClose}
      />

      {/* Panel — bottom sheet on mobile, centred modal on lg. */}
      <motion.div
        key="panel"
        className={cn(
          "fixed z-[1600] flex flex-col overflow-hidden bg-trail-950",
          "inset-x-0 bottom-0 rounded-t-2xl",
          "lg:inset-auto lg:top-1/2 lg:left-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2",
          "lg:w-[540px] lg:max-h-[86vh] lg:rounded-2xl"
        )}
        style={{ maxHeight: "calc(100dvh - 24px)" }}
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Header */}
        <div className="flex-shrink-0 flex items-start justify-between gap-3 px-5 pt-4 pb-3 border-b border-white/[0.06]">
          <div className="min-w-0">
            <h2 className="text-fg text-lg font-semibold leading-tight truncate">
              Edit images
            </h2>
            <p className="text-fg-muted text-xs mt-0.5 truncate">
              {location.name}
              {" · "}
              {hasOverride ? (
                <span className="text-alpine-400">Admin override active</span>
              ) : (
                <span>Using sourced images</span>
              )}
            </p>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={() => {
              haptics.tap();
              onClose();
            }}
            className="icon-button -mr-2 flex-shrink-0 rounded-full text-stone-400 hover:text-fg hover:bg-white/[0.06]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-4 space-y-4">
          {/* Image list */}
          {images.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-10 text-fg-muted">
              <ImageOff className="w-6 h-6" />
              <p className="text-sm">No images yet. Add one by URL below.</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {images.map((img, i) => (
                <li
                  key={img.id || img.url}
                  className="rounded-xl bg-surface-1 p-2"
                >
                  {/* Top: thumb + meta */}
                  <div className="flex items-center gap-3">
                    {/* Thumb */}
                    <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-surface-1">
                      <Image
                        src={img.url}
                        alt={img.alt}
                        fill
                        className="object-cover"
                        sizes="64px"
                        unoptimized
                      />
                      {i === 0 && (
                        <span className="absolute top-1 left-1 inline-flex items-center gap-0.5 t-3xs font-semibold uppercase tracking-wide text-trail-950 bg-gold-400 rounded px-1 py-0.5">
                          <Star className="w-2.5 h-2.5 fill-trail-950" />
                          Hero
                        </span>
                      )}
                    </div>

                    {/* Meta */}
                    <div className="min-w-0 flex-1">
                      <p className="text-fg text-xs font-medium truncate">
                        {img.alt || "(no alt)"}
                      </p>
                      <p className="text-fg-subtle t-2xs truncate mt-0.5">{img.url}</p>
                    </div>

                    {/* Controls — inline on ≥sm, where the row has room. */}
                    <div className="hidden sm:flex items-center gap-1 flex-shrink-0">
                      <IconBtn label="Move up" disabled={i === 0} onClick={() => handleMove(i, -1)}>
                        <ArrowUp className="w-4 h-4" />
                      </IconBtn>
                      <IconBtn label="Move down" disabled={i === images.length - 1} onClick={() => handleMove(i, 1)}>
                        <ArrowDown className="w-4 h-4" />
                      </IconBtn>
                      <IconBtn label="Set as primary" disabled={i === 0} onClick={() => handleSetPrimary(img)}>
                        <Star className="w-4 h-4" />
                      </IconBtn>
                      <IconBtn label="Remove image" danger onClick={() => handleRemove(img, i)}>
                        <Trash2 className="w-4 h-4" />
                      </IconBtn>
                    </div>
                  </div>

                  {/* Controls — wrap to a second row on mobile so they don't
                      crowd the thumbnail meta at ~360px. */}
                  <div className="flex sm:hidden items-center justify-end gap-1 mt-1.5">
                    <IconBtn label="Move up" disabled={i === 0} onClick={() => handleMove(i, -1)}>
                      <ArrowUp className="w-4 h-4" />
                    </IconBtn>
                    <IconBtn label="Move down" disabled={i === images.length - 1} onClick={() => handleMove(i, 1)}>
                      <ArrowDown className="w-4 h-4" />
                    </IconBtn>
                    <IconBtn label="Set as primary" disabled={i === 0} onClick={() => handleSetPrimary(img)}>
                      <Star className="w-4 h-4" />
                    </IconBtn>
                    <IconBtn label="Remove image" danger onClick={() => handleRemove(img, i)}>
                      <Trash2 className="w-4 h-4" />
                    </IconBtn>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {/* Undo affordance for the destructive remove */}
          <AnimatePresence>
            {lastRemoved && (
              <motion.div
                key="undo-removed"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18 }}
                className="flex items-center justify-between gap-3 rounded-lg border border-white/[0.06] bg-surface-1 px-3 py-2"
              >
                <p className="text-fg-muted text-xs min-w-0 truncate">
                  Removed{" "}
                  <span className="text-fg">{lastRemoved.img.alt || "image"}</span>
                </p>
                <button
                  type="button"
                  onClick={handleUndoRemove}
                  className="pressable flex-shrink-0 inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-alpine-300 hover:bg-white/[0.06] transition-colors"
                >
                  <Undo2 className="w-3.5 h-3.5" />
                  Undo
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Add by URL */}
          <div className="rounded-xl border border-white/[0.06] p-3 space-y-2.5">
            <p className="text-[11px] font-medium tracking-[0.12em] uppercase text-fg-muted">
              Add image by URL
            </p>
            <Input
              type="url"
              inputMode="url"
              placeholder="https://…/photo.jpg"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAdd();
              }}
            />
            <Input
              type="text"
              placeholder="Alt text (optional)"
              value={alt}
              onChange={(e) => setAlt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAdd();
              }}
            />
            <Button
              variant="alpine"
              size="lg"
              className="w-full"
              disabled={!url.trim()}
              onClick={handleAdd}
            >
              <Plus className="w-4 h-4" />
              Add image
            </Button>
          </div>

          {/* Supabase upload — gated, disabled "coming soon". */}
          <button
            type="button"
            aria-disabled="true"
            disabled={!SUPABASE_IMAGES_ENABLED}
            className={cn(
              "w-full flex items-center justify-center gap-2 min-h-[44px] rounded-lg",
              "border border-dashed border-stone-700 text-sm font-medium transition-colors",
              SUPABASE_IMAGES_ENABLED
                ? "text-stone-300 hover:bg-white/[0.03]"
                : "text-fg-subtle opacity-70 cursor-default"
            )}
          >
            <Upload className="w-4 h-4" />
            Upload image
            {!SUPABASE_IMAGES_ENABLED && (
              <span className="text-[10px] font-medium uppercase tracking-wide text-fg-subtle bg-white/[0.04] px-2 py-0.5 rounded">
                Supabase — soon
              </span>
            )}
          </button>
        </div>

        {/* Footer — reset to sourced */}
        <div className="flex-shrink-0 border-t border-white/[0.06] px-5 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] flex items-center gap-2">
          <Button
            variant="outline"
            size="lg"
            className="flex-1"
            disabled={!hasOverride}
            onClick={() => {
              haptics.warn();
              clearOverride(location.id);
            }}
          >
            <RotateCcw className="w-4 h-4" />
            Reset to sourced
          </Button>
          <Button
            variant="alpine"
            size="lg"
            className="flex-1"
            onClick={() => {
              haptics.tap();
              onClose();
            }}
          >
            Done
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

function IconBtn({
  label,
  onClick,
  disabled,
  danger,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "icon-button rounded-lg",
        "disabled:opacity-30 disabled:pointer-events-none",
        danger
          ? "text-red-400 hover:bg-red-500/10"
          : "text-stone-300 hover:text-fg hover:bg-white/[0.06]"
      )}
    >
      {children}
    </button>
  );
}
