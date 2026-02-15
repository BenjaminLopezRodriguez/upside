"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { RevealOnScroll } from "./utils";
import { FEATURES } from "./constants";

export function Features() {
  const [activeTab, setActiveTab] = useState("spend");
  const activeFeature = FEATURES.find((f) => f.id === activeTab)!;

  return (
    <section
      id="features"
      className="scroll-mt-20 px-6 py-24 sm:px-8 lg:py-32"
      aria-labelledby="features-heading"
    >
      <div className="mx-auto max-w-5xl">
        <RevealOnScroll>
          <div className="mb-16">
            <p className="font-mono text-xs font-medium uppercase tracking-wider text-[var(--upside-purple)]">
              Platform
            </p>
            <h2
              id="features-heading"
              className="mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl"
            >
              Find your upside
            </h2>
            <p className="mt-4 max-w-xl text-muted-foreground">
              Everything your finance team needs, unified under one roof.
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--upside-border)] bg-[var(--upside-surface)] p-6 sm:p-10">
            <div className="mb-8 flex flex-wrap gap-2" role="tablist" aria-label="Product features">
              {FEATURES.map((feature) => (
                <button
                  key={feature.id}
                  role="tab"
                  aria-selected={activeTab === feature.id}
                  aria-controls={`panel-${feature.id}`}
                  id={`tab-${feature.id}`}
                  onClick={() => setActiveTab(feature.id)}
                  className={`tap-target min-h-[44px] rounded-full px-5 py-2.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                    activeTab === feature.id
                      ? "bg-[var(--upside-purple)] text-white"
                      : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                  }`}
                >
                  {feature.label}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeFeature.id}
                id={`panel-${activeFeature.id}`}
                role="tabpanel"
                aria-labelledby={`tab-${activeFeature.id}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                className="grid gap-10 lg:grid-cols-2 lg:gap-14"
              >
                <div>
                  <span className="font-mono text-xs text-muted-foreground">
                    {activeFeature.number}
                  </span>
                  <h3 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
                    {activeFeature.label}
                  </h3>
                  <p className="mt-4 text-muted-foreground leading-relaxed">
                    {activeFeature.detail}
                  </p>
                </div>
                <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-[var(--upside-border)]">
                  <Image
                    src={activeFeature.image}
                    alt={activeFeature.imageAlt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}
