"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowDown, Droplets, MountainSnow, Moon, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRef } from "react";

const FLOATING_BADGES = [
  {
    id: 1,
    label: "Hidden Lake",
    sub: "Valais · 2,100m",
    Icon: Droplets,
    delay: 0,
    className: "hidden sm:flex top-[28%] right-[8%] lg:right-[12%]",
  },
  {
    id: 2,
    label: "Secret Viewpoint",
    sub: "Bern · 1,650m",
    Icon: MountainSnow,
    delay: 0.4,
    className: "hidden sm:flex top-[55%] right-[3%] lg:right-[6%]",
  },
  {
    id: 3,
    label: "Midnight Sky",
    sub: "Obwalden · ★★★★★",
    Icon: Moon,
    delay: 0.8,
    className: "bottom-[20%] left-[2%] lg:left-[5%] hidden md:flex",
  },
];

export function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex flex-col overflow-hidden"
    >
      {/* Background layers */}
      <div className="absolute inset-0 hero-gradient" />

      {/* Static ambient glow — no animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-1/4 left-1/3 w-[700px] h-[700px] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(81,94,255,0.09) 0%, transparent 65%)",
          }}
        />
      </div>

      {/* Noise overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Content */}
      <motion.div
        className="relative z-10 flex flex-col items-center justify-center flex-1 text-center px-6 pt-28 pb-20 lg:pt-36"
        style={{ y, opacity }}
      >
        {/* Eyebrow */}
        <motion.div
          className="flex items-center gap-2 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="t-eyebrow text-alpine-400">Switzerland · Summer 2025</span>
          <span className="w-1 h-1 rounded-full bg-alpine-700" />
          <span className="t-eyebrow text-fg-subtle">500+ Hidden Locations</span>
        </motion.div>

        {/* Main headline */}
        <motion.h1
          className="t-display max-w-4xl mx-auto mb-6"
          initial={{ opacity: 0, y: 36 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="text-fg">Your Best Summer,</span>
          <br />
          <span className="text-gradient-hero">Already Planned.</span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          className="t-xl text-fg-muted max-w-xl mx-auto mb-10"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          500+ handpicked locations across Switzerland — hidden lakes, secret viewpoints,
          and weekends you&apos;ll remember forever. One payment. Lifetime access.
        </motion.p>

        {/* CTAs */}
        <motion.div
          className="flex flex-col sm:flex-row items-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          <Button
            asChild
            variant="gold"
            size="xl"
            className="shadow-[0_0_40px_rgba(245,184,40,0.2)]"
          >
            <a href="#pricing">
              Unlock The Map — CHF 29
            </a>
          </Button>
          <Button asChild variant="ghost" size="xl">
            <a href="#solution" className="flex items-center gap-2">
              See what&apos;s inside
              <ArrowDown className="w-4 h-4" />
            </a>
          </Button>
        </motion.div>

        {/* Social proof micro */}
        <motion.div
          className="flex items-center gap-6 mt-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <div className="flex items-center gap-2">
            <span className="text-fg-muted text-sm">3,200+ explorers</span>
          </div>
          <span className="text-stone-700">·</span>
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star key={i} className="w-3.5 h-3.5 fill-gold-400 text-gold-400" />
            ))}
            <span className="text-fg-muted text-sm ml-1">4.9 rating</span>
          </div>
        </motion.div>
      </motion.div>

      {/* Floating location badges */}
      {FLOATING_BADGES.map((badge) => (
        <motion.div
          key={badge.id}
          className={`absolute z-20 ${badge.className}`}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.6,
            delay: 1.0 + badge.delay,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          <div
            className="flex items-center gap-2.5 cursor-default select-none"
            style={{
              background: "rgba(11,15,28,0.88)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 10,
              padding: "9px 13px",
            }}
          >
            <badge.Icon size={13} style={{ color: "var(--color-alpine-400)", flexShrink: 0 }} />
            <div>
              <p className="text-fg font-medium leading-tight" style={{ fontSize: 12 }}>{badge.label}</p>
              <p className="text-fg-subtle leading-tight mt-0.5" style={{ fontSize: 10 }}>{badge.sub}</p>
            </div>
          </div>
        </motion.div>
      ))}

      {/* Scroll indicator — bottom */}
      <motion.div
        className="absolute bottom-8 left-0 right-0 flex justify-center z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.8 }}
      >
        <button
          aria-label="Scroll down"
          className="flex flex-col items-center gap-2 p-3 text-stone-500 hover:text-stone-300 transition-colors cursor-pointer"
          onClick={() =>
            document.getElementById("stats")?.scrollIntoView({ behavior: "smooth" })
          }
        >
          <ArrowDown className="w-4 h-4" />
        </button>
      </motion.div>
    </section>
  );
}
