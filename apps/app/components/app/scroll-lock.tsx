"use client";

import { useEffect } from "react";

/**
 * Locks the document (html/body) to the viewport while mounted, so the page
 * behaves like a native app shell: the document itself can't scroll or
 * rubber-band, and only the inner scroll containers move. Mounted by the
 * (app) tab-route layout; unmounting (navigating to a scrolling page like
 * /location, /checkout, /login) restores normal document scrolling.
 *
 * The lock is class-based (see `.app-shell-locked` in globals.css) so it can't
 * be clobbered by components that toggle `body.style.overflow` inline (e.g.
 * bottom sheets locking background scroll).
 */
export function ScrollLock() {
  useEffect(() => {
    const { documentElement: html, body } = document;
    html.classList.add("app-shell-locked");
    body.classList.add("app-shell-locked");
    return () => {
      html.classList.remove("app-shell-locked");
      body.classList.remove("app-shell-locked");
    };
  }, []);

  return null;
}
