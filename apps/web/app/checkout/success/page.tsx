"use client";

import { useEffect } from "react";
import { Check, ArrowRight, Map } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/logo";

function useConfetti() {
  useEffect(() => {
    let frame = 0;
    const canvas = document.createElement("canvas");
    canvas.style.cssText =
      "position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999;";
    document.body.appendChild(canvas);
    const ctx = canvas.getContext("2d")!;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Array<{
      x: number; y: number; vx: number; vy: number;
      color: string; size: number; rotation: number; rotSpeed: number;
    }> = [];

    const colors = ["#47A462", "#F5B828", "#6ABD83", "#FAC95A", "#FFFFFF", "#C5E8CF"];

    for (let i = 0; i < 120; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: -20,
        vx: (Math.random() - 0.5) * 4,
        vy: Math.random() * 3 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 8 + 4,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.2,
      });
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.05;
        p.rotation += p.rotSpeed;
        if (p.y < canvas.height + 20) {
          alive = true;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
          ctx.restore();
        }
      }
      if (alive) {
        frame = requestAnimationFrame(animate);
      } else {
        canvas.remove();
      }
    }

    frame = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(frame);
      canvas.remove();
    };
  }, []);
}

export default function CheckoutSuccessPage() {
  useConfetti();

  return (
    <div className="min-h-screen bg-trail-950 flex items-center justify-center px-4">
      <div className="absolute inset-0 hero-gradient pointer-events-none" />

      <motion.div
        className="relative z-10 w-full max-w-md text-center"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Logo */}
        <div className="flex justify-center mb-10">
          <Link href="/">
            <Logo
              iconClassName="text-alpine-500"
              wordmarkClassName="text-fg"
            />
          </Link>
        </div>

        {/* Success icon */}
        <motion.div
          className="w-24 h-24 rounded-full bg-alpine-900 border-2 border-alpine-600 flex items-center justify-center mx-auto mb-8 shadow-[0_0_40px_rgba(81,94,255,0.3)]"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 300, damping: 20 }}
        >
          <Check className="w-10 h-10 text-alpine-300" strokeWidth={2.5} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <h1 className="t-h1 text-fg mb-4">
            Welcome to
            <br />
            <span className="text-gradient-alpine">Swiss Trails.</span>
          </h1>

          <p className="t-body text-fg-muted max-w-sm mx-auto mb-10">
            Your adventure starts now. 50+ hidden locations across Switzerland
            are waiting for you. Go find something extraordinary.
          </p>

          <div className="space-y-3">
            <Button asChild variant="gold" size="xl" className="w-full">
              <Link href="/explore">
                <Map className="w-4 h-4" />
                Open The Map
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>

            <Button asChild variant="ghost" size="md" className="w-full">
              <Link href="/">Back to website</Link>
            </Button>
          </div>

          <p className="text-fg-subtle text-xs mt-8">
            Your access has been activated. Check your email for a confirmation.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
