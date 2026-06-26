"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Map, Heart, User, Compass } from "lucide-react";
import { cn } from "@/lib/utils";
import { SPRING } from "@/lib/motion";
import { Logo } from "@/components/brand/logo";

const NAV_ITEMS = [
  { href: "/explore", icon: Compass, label: "Explore" },
  { href: "/map", icon: Map, label: "Map" },
  { href: "/favorites", icon: Heart, label: "Favourites" },
  { href: "/profile", icon: User, label: "Profile" },
];

export function AppHeader() {
  const pathname = usePathname();

  return (
    <>
      {/* Top bar — desktop */}
      <header className="hidden lg:flex fixed top-0 left-0 right-0 z-40 h-14 bg-trail-950/95 backdrop-blur-xl items-center px-6 gap-6" style={{ boxShadow: "0 1px 0 rgba(255,255,255,0.04)" }}>
        <Link href="/explore" className="mr-2">
          <Logo
            iconClassName="h-5 text-alpine-500"
            wordmarkClassName="h-3.5 text-fg"
          />
        </Link>

        <nav className="flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || (item.href === "/explore" && pathname === "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "pressable flex items-center gap-1.5 px-3 py-1.5 text-sm transition-colors duration-150 rounded-lg",
                  isActive ? "text-fg bg-surface-1" : "text-fg-muted hover:text-fg"
                )}
              >
                <item.icon className={cn("w-4 h-4", isActive ? "text-alpine-400" : "")} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-4">
          <Link href="/" className="text-fg-subtle hover:text-fg text-xs transition-colors">
            ← Back to site
          </Link>
        </div>
      </header>

      {/* Bottom nav — mobile: a floating glass pill. The outer wrapper is
          click-through (pointer-events-none) so the map fills the gaps beside
          the pill; only the pill itself is interactive. Geometry keys off the
          shared --nav vars so the shell padding and bottom sheet stay in sync. */}
      <nav
        className="lg:hidden fixed inset-x-0 z-40 px-3 pointer-events-none"
        style={{ bottom: "calc(var(--safe-b) + var(--nav-gap))" }}
      >
        <div
          className="mx-auto flex max-w-md items-stretch gap-1 rounded-full card-glass-strong shadow-lg pointer-events-auto px-1.5"
          style={{ height: "var(--nav-bar-h)" }}
        >
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || (item.href === "/explore" && pathname === "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className="pressable relative flex flex-1 flex-col items-center justify-center gap-0.5"
              >
                {isActive && (
                  <motion.span
                    layoutId="navActivePill"
                    className="absolute inset-y-1.5 inset-x-0.5 rounded-full bg-surface-2 ring-1 ring-white/[0.06]"
                    transition={SPRING.snappy}
                  />
                )}
                <item.icon
                  className={cn(
                    "relative w-[22px] h-[22px] transition-colors duration-150",
                    isActive ? "text-alpine-300" : "text-fg-muted"
                  )}
                />
                <span
                  className={cn(
                    "relative t-3xs transition-colors duration-150",
                    isActive ? "text-alpine-300" : "text-fg-muted"
                  )}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
