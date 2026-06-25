"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

interface RevealProps {
  children: React.ReactNode;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  duration?: number;
  className?: string;
  once?: boolean;
  amount?: number;
}

export function Reveal({
  children,
  delay = 0,
  direction = "up",
  duration = 0.65,
  className,
  once = true,
  amount = 0.1,
}: RevealProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, amount });

  const directionMap = {
    up: { y: 32, x: 0 },
    down: { y: -32, x: 0 },
    left: { y: 0, x: 32 },
    right: { y: 0, x: -32 },
    none: { y: 0, x: 0 },
  };

  const initial = {
    opacity: 0,
    ...directionMap[direction],
  };

  return (
    <motion.div
      ref={ref}
      initial={initial}
      animate={
        isInView
          ? { opacity: 1, y: 0, x: 0 }
          : initial
      }
      transition={{
        duration,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface StaggerProps {
  children: React.ReactNode[];
  staggerDelay?: number;
  initialDelay?: number;
  direction?: RevealProps["direction"];
  className?: string;
  once?: boolean;
  amount?: number;
}

export function Stagger({
  children,
  staggerDelay = 0.08,
  initialDelay = 0,
  direction = "up",
  className,
  once = true,
  amount = 0.1,
}: StaggerProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, amount });

  const directionMap = {
    up: { y: 24, x: 0 },
    down: { y: -24, x: 0 },
    left: { y: 0, x: 24 },
    right: { y: 0, x: -24 },
    none: { y: 0, x: 0 },
  };

  return (
    <div ref={ref} className={className}>
      {children.map((child, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, ...directionMap[direction] }}
          animate={
            isInView
              ? { opacity: 1, y: 0, x: 0 }
              : { opacity: 0, ...directionMap[direction] }
          }
          transition={{
            duration: 0.6,
            delay: initialDelay + i * staggerDelay,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          {child}
        </motion.div>
      ))}
    </div>
  );
}
