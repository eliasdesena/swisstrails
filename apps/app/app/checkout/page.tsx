"use client";

import { useState } from "react";
import { Check, Shield, Zap } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/logo";
import { PRICING } from "@/data/categories";

const IS_MOCK = process.env.NEXT_PUBLIC_MOCK_MODE === "true";

export default function CheckoutPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");

  async function handleCheckout() {
    if (!email) return;
    setIsLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-trail-950 flex items-center justify-center px-4">
      <div className="absolute inset-0 hero-gradient pointer-events-none" />

      <motion.div
        className="relative z-10 w-full max-w-md"
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-4">
            <Logo
              iconClassName="text-alpine-500"
              wordmarkClassName="text-fg"
              className="justify-center"
            />
          </Link>
          <h1 className="t-h2 text-fg mb-2">Unlock the Map</h1>
          <p className="text-fg-muted text-sm">One payment. Lifetime access.</p>
        </div>

        {/* Mock mode shortcut */}
        {IS_MOCK && (
          <div className="mb-4 flex gap-2">
            <Button asChild variant="glass" size="sm" className="flex-1 text-xs">
              <Link href="/checkout/success">→ Preview Success Page</Link>
            </Button>
            <Button asChild variant="glass" size="sm" className="flex-1 text-xs">
              <Link href="/checkout/cancel">→ Preview Cancel Page</Link>
            </Button>
          </div>
        )}

        {/* Card */}
        <div className="card-solid rounded-2xl overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-gold-700 via-gold-400 to-gold-700" />

          <div className="p-7">
            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-fg-subtle text-lg">CHF</span>
              <span className="text-5xl font-bold text-fg tracking-tight">
                {PRICING.amount}
              </span>
              <span className="text-fg-subtle text-sm ml-1">one-time</span>
            </div>

            <ul className="space-y-3 mb-8">
              {PRICING.features.map((f) => (
                <li key={f} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-alpine-900 border border-alpine-700 flex items-center justify-center flex-shrink-0">
                    <Check className="w-2.5 h-2.5 text-alpine-400" />
                  </div>
                  <span className="text-fg-muted text-sm">{f}</span>
                </li>
              ))}
            </ul>

            <div className="mb-4">
              <label className="block text-fg-muted text-xs mb-1.5">
                Your email address
              </label>
              <input
                type="email"
                inputMode="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full h-11 bg-trail-800 border border-stone-800 rounded-xl text-base text-fg placeholder:text-fg-muted px-4 outline-none transition-[border-color,box-shadow] focus:border-alpine-600 focus:ring-2 focus:ring-alpine-900/50"
              />
            </div>

            <Button
              variant="gold"
              size="xl"
              className="w-full"
              onClick={handleCheckout}
              loading={isLoading}
              disabled={!email}
            >
              <Zap className="w-4 h-4" />
              Pay CHF 29 — Get Instant Access
            </Button>

            <div className="mt-4 flex items-center justify-center gap-2">
              <Shield className="w-3.5 h-3.5 text-fg-muted" />
              <p className="text-fg-muted text-xs">
                Secured by Stripe · Visit 3 spots or get refunded
              </p>
            </div>
          </div>
        </div>

        <p className="text-center text-fg-subtle text-xs mt-6">
          <Link href="/" className="hover:text-fg transition-colors">
            ← Back to swiss-trails.com
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
