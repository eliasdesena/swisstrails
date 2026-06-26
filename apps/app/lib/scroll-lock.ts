/**
 * Ref-counted body-scroll lock for transient overlays (detail sheets, open-in
 * sheets, …).
 *
 * Multiple sheets can be mounted/closing at once; each previously wrote
 * `document.body.style.overflow` directly and reset it to `""` on cleanup,
 * which races: closing one sheet would clear the lock another still needs, or a
 * stale cleanup would leave the page dead-scrolled. This counter applies the
 * lock only on the 0→1 transition and removes it only on 1→0, so overlapping
 * locks compose correctly.
 *
 * It is deliberately independent of the class-based `ScrollLock`
 * (`.app-shell-locked`, applied by the tab-route layout): we save and restore
 * whatever `body.style.overflow` was before we touched it, so the lock is safe
 * whether or not the app shell is also locked.
 */

let count = 0;
let previousOverflow = "";

export function lockBodyScroll(): void {
  if (typeof document === "undefined") return;
  count += 1;
  if (count === 1) {
    previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
  }
}

export function unlockBodyScroll(): void {
  if (typeof document === "undefined") return;
  if (count === 0) return;
  count -= 1;
  if (count === 0) {
    document.body.style.overflow = previousOverflow;
    previousOverflow = "";
  }
}
