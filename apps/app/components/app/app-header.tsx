"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Map, Heart, User, Compass } from "lucide-react";
import { cn } from "@/lib/utils";
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
                  "flex items-center gap-1.5 px-3 py-1.5 text-sm transition-colors duration-150 rounded",
                  isActive ? "text-fg" : "text-fg-muted hover:text-fg"
                )}
              >
                <item.icon className={cn("w-3.5 h-3.5", isActive ? "text-alpine-400" : "")} />
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

      {/* Bottom nav — mobile */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-trail-950/98 backdrop-blur-xl pb-2.5" style={{ boxShadow: "0 -1px 0 rgba(255,255,255,0.04)" }}>
        <div className="flex items-stretch justify-around h-16 px-2">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || (item.href === "/explore" && pathname === "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className="flex flex-1 flex-col items-center justify-center gap-1.5 min-w-[56px]"
              >
                <item.icon
                  className={cn(
                    "w-6 h-6 transition-colors duration-150",
                    isActive ? "text-alpine-400" : "text-fg-muted"
                  )}
                />
                <span
                  className={cn(
                    "text-[11px] font-medium tracking-wide transition-colors duration-150",
                    isActive ? "text-alpine-400" : "text-fg-muted"
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
