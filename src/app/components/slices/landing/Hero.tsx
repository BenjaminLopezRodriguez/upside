"use client";

import Link from "next/link";
import Image from "next/image";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import { DemoDialog } from "./DemoDialog";
import { IMAGES } from "./constants";

export function Hero() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const y = useTransform(scrollYProgress, [0, 0.5], ["0%", "12%"]);
  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
  const patternY = useTransform(scrollYProgress, [0, 1], ["0%", "15%"]);

  return (
    <section
      ref={heroRef}
      className="relative flex min-h-screen items-center justify-center overflow-hidden"
    >
      <div className="hero-bg absolute inset-0" />
      <motion.div
        className="hero-pattern absolute inset-0 opacity-20"
        style={{ y: patternY }}
      />
      <div className="tech-grid absolute inset-0 opacity-60" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-background/90" />

      {/* Floating product image — parallax */}
      <motion.div
        className="pointer-events-none absolute right-[5%] bottom-[15%] hidden w-[280px] opacity-40 lg:block xl:w-[340px]"
        style={{ y: imageY }}
        aria-hidden
      >
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
          <Image
            src={IMAGES.cardHeld}
            alt=""
            fill
            className="object-cover"
            sizes="340px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--upside-deep)]/80 to-transparent mix-blend-multiply" />
        </div>
      </motion.div>


      <motion.div
        className="relative z-10 px-6 text-center"
        style={{ y, opacity }}
      >
        <motion.h1
          className="font-serif text-[clamp(2.75rem,9vw,5.5rem)] font-bold leading-[0.95] tracking-tight text-[var(--upside-on-dark)]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          make money{" "}
          <span className="italic">moves</span>
        </motion.h1>
        <motion.p
          className="mx-auto mt-6 max-w-md text-lg leading-relaxed text-[var(--upside-on-dark-muted)] sm:text-xl"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Card issuing, receipt tracking, and invoicing for modern finance teams.
        </motion.p>

        <motion.div
          className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <DemoDialog>
            <Button
              size="lg"
              className="tap-target h-12 min-h-[48px] rounded-full bg-white px-8 text-base font-semibold text-[var(--upside-deep)] transition-colors hover:bg-white/95 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f2030]"
            >
              Request a demo
            </Button>
          </DemoDialog>
          <Link
            href="#features"
            className="tap-target flex min-h-[44px] items-center gap-2 rounded-full border border-[var(--upside-on-dark-muted)] px-5 py-2.5 text-sm font-medium text-[var(--upside-on-dark-muted)] transition-colors hover:border-[var(--upside-on-dark)] hover:text-[var(--upside-on-dark)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f2030]"
          >
            Explore
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <polyline points="19,12 12,19 5,12" />
            </svg>
          </Link>
        </motion.div>
      </motion.div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
