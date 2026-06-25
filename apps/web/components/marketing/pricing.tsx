"use client";

import { motion } from "framer-motion";
import { Check, Zap, Shield } from "lucide-react";
import { Reveal } from "@/components/shared/reveal";
import { Button } from "@/components/ui/button";
import { PRICING } from "@/data/categories";


export function Pricing() {
  return (
    <section id="pricing" className="py-24 lg:py-36 relative overflow-hidden">
      {/* Glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-gold-900/10 blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <Reveal>
            <p className="t-eyebrow mb-4">Pricing</p>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="t-h1 mb-4">
              One payment.
              <br />
              <span className="text-gradient-gold">A summer of memories.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="t-body text-fg-muted max-w-md mx-auto">
              No subscriptions. No hidden fees. No nonsense.
              Pay once, explore forever.
            </p>
          </Reveal>
        </div>

        {/* Pricing card */}
        <div className="max-w-lg mx-auto">
          <motion.div
            className="relative card-solid rounded-2xl overflow-hidden"
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Top gradient bar */}
            <div className="h-1 bg-gradient-to-r from-gold-700 via-gold-400 to-gold-700" />

            <div className="p-8 lg:p-10">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-gold-950/60 rounded-lg px-2.5 py-1 mb-6">
                <Zap className="w-3 h-3 text-gold-500" />
                <span className="text-gold-400 text-xs font-medium">Instant access</span>
              </div>

              {/* Price */}
              <div className="mb-8">
                <div className="flex items-baseline gap-3">
                  <span className="text-fg-subtle text-xl">CHF</span>
                  <span className="text-7xl font-bold text-fg tracking-tight leading-none">
                    {PRICING.amount}
                  </span>
                </div>
                <p className="text-fg-subtle text-sm mt-2">
                  One-time payment · Access for life
                </p>
              </div>

              {/* Features */}
              <ul className="space-y-4 mb-10">
                {PRICING.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3.5 h-3.5 text-alpine-500" />
                    </div>
                    <span className="t-sm text-fg-muted">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Button
                asChild
                variant="gold"
                size="xl"
                className="w-full shadow-[0_0_40px_rgba(245,184,40,0.2)]"
              >
                <a href="/checkout">
                  Unlock The Map — CHF 29 →
                </a>
              </Button>

              {/* Reassurance */}
              <div className="mt-5 flex items-center justify-center gap-2">
                <Shield className="w-3.5 h-3.5 text-fg-subtle" />
                <p className="text-center text-fg-subtle text-xs">
                  Secured by Stripe · Visit 3 spots, love it or get refunded
                </p>
              </div>
            </div>
          </motion.div>

          {/* Social proof under card */}
          <Reveal delay={0.3}>
            <p className="mt-6 text-center text-stone-600 text-sm">
              <span className="text-stone-400">3,200+</span> explorers already inside
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
