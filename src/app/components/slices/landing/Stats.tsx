"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { STATS } from "./constants";

export function Stats() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      ref={ref}
      className="border-y border-[var(--upside-border)] bg-[var(--upside-surface)] px-6 py-20 sm:px-8 lg:py-28"
    >
      <div className="mx-auto grid max-w-4xl grid-cols-2 gap-16 sm:grid-cols-4">
        {STATS.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{
              duration: 0.5,
              delay: i * 0.06,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="rounded-xl py-4 text-center transition-colors hover:bg-white/50"
          >
            <span className="font-mono text-2xl font-semibold text-[var(--upside-purple)] sm:text-3xl">
              {stat.value}
            </span>
            <span className="mt-2 block text-sm text-muted-foreground">
              {stat.label}
            </span>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
