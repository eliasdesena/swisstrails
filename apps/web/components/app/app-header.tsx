"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Map, Heart, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Logo } from "@/components/brand/logo";

const NAV_ITEMS = [
  { href: "/explore", icon: Map, label: "Explore" },
  { href: "/favorites", icon: Heart, label: "Favourites" },
  { href: "/profile", icon: User, label: "Profile" },
];

export function AppHeader() {
  const pathname = usePathname();

  return (
    <>
      {/* Top bar — desktop */}
      <header className="hidden lg:flex fixed top-0 left-0 right-0 z-40 h-14 bg-trail-900/90 backdrop-blur-xl border-b border-white/[0.07] items-center px-4 gap-4">
        {/* Logo */}
        <Link href="/explore" className="mr-4">
          <Logo
            iconClassName="h-6 text-alpine-500"
            wordmarkClassName="h-4 text-fg"
          />
        </Link>

        {/* Nav links */}
        <nav className="flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all duration-150",
                  isActive
                    ? "bg-alpine-900/60 text-alpine-300 border border-alpine-800/50"
                    : "text-fg-muted hover:text-fg hover:bg-trail-800"
                )}
              >
                <item.icon className="w-3.5 h-3.5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right side */}
        <div className="ml-auto flex items-center gap-3">
          <Link
            href="/"
            className="text-fg-subtle hover:text-fg text-xs transition-colors"
          >
            ← Back to site
          </Link>
        </div>
      </header>

      {/* Bottom nav — mobile */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-trail-900/95 backdrop-blur-xl border-t border-white/[0.07] safe-bottom">
        <div className="flex items-center justify-around h-16 px-4">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center gap-1 px-4 py-2 relative"
              >
                {isActive && (
                  <motion.div
                    layoutId="mobile-nav-indicator"
                    className="absolute inset-0 bg-alpine-900/50 rounded-xl border border-alpine-800/50"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <item.icon
                  className={cn(
                    "relative z-10 w-5 h-5 transition-colors",
                    isActive ? "text-alpine-400" : "text-fg-subtle"
                  )}
                />
                <span
                  className={cn(
                    "relative z-10 text-xs transition-colors",
                    isActive ? "text-alpine-400" : "text-fg-subtle"
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
