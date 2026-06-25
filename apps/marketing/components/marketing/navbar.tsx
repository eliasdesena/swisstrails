"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, useScroll } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/logo";
import { cn } from "@/lib/utils";
import { APP_URL } from "@/lib/config";

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const { scrollY } = useScroll();

  useEffect(() => {
    const unsub = scrollY.on("change", (y) => setHasScrolled(y > 60));
    return unsub;
  }, [scrollY]);

  // Lock body scroll while the mobile menu is open.
  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isMenuOpen]);

  const navLinks = [
    { label: "What's Inside", href: "#whats-inside" },
    { label: "How It Works", href: "#solution" },
    { label: "Testimonials", href: "#testimonials" },
    { label: "Pricing", href: "#pricing" },
  ];

  return (
    <>
      <motion.header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
          hasScrolled
            ? "bg-trail-950/85 backdrop-blur-xl shadow-[0_2px_40px_rgba(0,0,0,0.4)]"
            : "bg-transparent"
        )}
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link href="/" className="group">
              <Logo
                iconClassName="text-alpine-500 group-hover:text-alpine-400 transition-colors"
                wordmarkClassName="text-fg"
              />
            </Link>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-fg-muted hover:text-fg text-sm transition-colors duration-150"
                >
                  {link.label}
                </a>
              ))}
            </nav>

            {/* Desktop CTA */}
            <div className="hidden lg:flex items-center gap-3">
              <a
                href={`${APP_URL}/login`}
                className="text-fg-muted hover:text-fg text-sm transition-colors"
              >
                Log in
              </a>
              <Button asChild size="sm" variant="gold">
                <a href="#pricing">Get Access →</a>
              </Button>
            </div>

            {/* Mobile menu button */}
            <button
              className="lg:hidden -mr-2 w-11 h-11 flex items-center justify-center text-fg-muted hover:text-fg"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile menu */}
      <motion.div
        className="fixed inset-0 z-40 lg:hidden"
        initial={false}
        animate={isMenuOpen ? { opacity: 1, pointerEvents: "auto" } : { opacity: 0, pointerEvents: "none" }}
        transition={{ duration: 0.2 }}
      >
        <div
          className="absolute inset-0 bg-trail-950/95 backdrop-blur-xl"
          onClick={() => setIsMenuOpen(false)}
        />
        <motion.div
          className="absolute top-16 left-0 right-0 bg-trail-900 p-6"
          initial={{ y: -20, opacity: 0 }}
          animate={isMenuOpen ? { y: 0, opacity: 1 } : { y: -20, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          <nav className="flex flex-col gap-1 mb-6">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-fg-muted hover:text-fg py-3 px-2 -mx-2 text-base transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
          </nav>
          <div className="flex flex-col gap-3">
            <Button asChild variant="gold" size="lg" className="w-full">
              <a href="#pricing" onClick={() => setIsMenuOpen(false)}>
                Unlock the Map — CHF 29
              </a>
            </Button>
            <a
              href={`${APP_URL}/login`}
              className="block text-center text-fg-muted hover:text-fg text-sm py-3 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Already have access? Log in
            </a>
          </div>
        </motion.div>
      </motion.div>
    </>
  );
}
