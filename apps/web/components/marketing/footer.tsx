import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/logo";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-white/[0.06]">
      {/* Final CTA */}
      <div className="py-20 lg:py-28 text-center border-b border-white/[0.06] bg-trail-900/30 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-alpine-900/10 blur-3xl" />
        </div>
        <div className="relative max-w-2xl mx-auto px-6">
          <p className="t-eyebrow mb-6">Ready?</p>
          <h2 className="t-h1 mb-6">
            Stop scrolling.
            <br />
            <span className="text-alpine-300">Start exploring.</span>
          </h2>
          <p className="t-body text-fg-muted mb-10">
            The best Swiss summer of your life is one click away.
          </p>
          <Button
            asChild
            variant="gold"
            size="xl"
            className="shadow-[0_0_40px_rgba(245,184,40,0.2)]"
          >
            <a href="#pricing">Unlock The Map — CHF 29 →</a>
          </Button>
        </div>
      </div>

      {/* Footer links */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          {/* Logo + description */}
          <div className="flex flex-col gap-3">
            <Link href="/">
              <Logo
                iconClassName="text-alpine-500"
                wordmarkClassName="text-fg"
              />
            </Link>
            <p className="text-fg-subtle text-xs max-w-xs">
              Curated collection of Switzerland&apos;s most beautiful,
              underrated, and unforgettable locations.
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-wrap gap-x-8 gap-y-3">
            {[
              { label: "About", href: "#" },
              { label: "Pricing", href: "#pricing" },
              { label: "FAQ", href: "#faq" },
              { label: "Contact", href: "mailto:hello@swiss-trails.com" },
              { label: "Privacy", href: "/privacy" },
              { label: "Terms", href: "/terms" },
            ].map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-fg-subtle hover:text-fg text-sm transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-white/[0.06] flex flex-col lg:flex-row items-center justify-between gap-4">
          <p className="text-fg-subtle text-xs">
            © {currentYear} Swiss Trails. All rights reserved.
          </p>
          <p className="text-fg-subtle text-xs">
            Made with love in Switzerland 🇨🇭
          </p>
        </div>
      </div>
    </footer>
  );
}
