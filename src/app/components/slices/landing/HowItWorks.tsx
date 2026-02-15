"use client";

import Image from "next/image";
import { RevealOnScroll } from "./utils";
import { STEPS } from "./constants";

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="tech-grid scroll-mt-20 bg-[var(--upside-deep)] px-6 py-24 sm:px-8 lg:py-32"
      aria-labelledby="how-heading"
    >
      <div className="relative mx-auto max-w-5xl">
        <RevealOnScroll>
          <div className="mb-16">
            <p className="font-mono text-xs font-medium uppercase tracking-wider text-[var(--upside-lavender)]">
              Process
            </p>
            <h2
              id="how-heading"
              className="mt-2 text-3xl font-semibold tracking-tight text-[var(--upside-on-dark)] sm:text-4xl"
            >
              Three steps to clarity
            </h2>
            <p className="mt-4 text-[var(--upside-on-dark-muted)]">
              From signup to full visibility in under a week.
            </p>
          </div>
        </RevealOnScroll>

        <div className="grid gap-8 sm:grid-cols-3">
          {STEPS.map((item, i) => (
            <RevealOnScroll key={item.step} delay={i * 0.08}>
              <div className="overflow-hidden rounded-2xl border border-[var(--upside-lavender)] bg-white/5 transition-colors hover:bg-white/10">
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image
                    src={item.image}
                    alt={item.imageAlt}
                    fill
                    className="object-cover opacity-80"
                    sizes="(max-width: 640px) 100vw, 33vw"
                  />
                  <span className="font-mono absolute bottom-4 left-4 rounded border border-[var(--upside-lavender)] bg-[var(--upside-deep)] px-2 py-1 text-xs font-medium text-[var(--upside-lavender)]">
                    {item.step}
                  </span>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-[var(--upside-on-dark)]">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-[var(--upside-on-dark-muted)] leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
