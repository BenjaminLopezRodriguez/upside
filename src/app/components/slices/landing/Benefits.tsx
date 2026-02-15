"use client";

import Image from "next/image";
import { RevealOnScroll } from "./utils";
import { IMAGES } from "./constants";

const BENEFIT_ITEMS = [
  {
    title: "Control",
    description:
      "Set spend limits and merchant rules per card or team. See activity the moment it happens.",
    image: IMAGES.cardPayment,
    imageAlt: "Person holding credit card for payment",
  },
  {
    title: "Compliance",
    description:
      "Receipt-level audit trail with automatic categorization. Always audit-ready.",
    image: IMAGES.receiptPhone,
    imageAlt: "Person holding phone and receipt for expense tracking",
  },
  {
    title: "Integration",
    description:
      "REST APIs and webhooks that connect to your existing tools and workflows out of the box.",
    image: IMAGES.dashboardAnalytics,
    imageAlt: "Analytics dashboard showing performance data",
  },
];

export function Benefits() {
  return (
    <section
      className="px-6 py-24 sm:px-8 lg:py-32"
      aria-labelledby="benefits-heading"
    >
      <div className="mx-auto max-w-5xl">
        <RevealOnScroll>
          <div className="mb-16">
            <p className="font-mono text-xs font-medium uppercase tracking-wider text-[var(--upside-purple)]">
              Advantages
            </p>
            <h2
              id="benefits-heading"
              className="mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl"
            >
              Why teams choose Upside
            </h2>
            <p className="mt-4 max-w-xl text-muted-foreground">
              Finance and operations get clarity and control without the usual
              friction.
            </p>
          </div>
        </RevealOnScroll>

        <div className="grid gap-8 sm:grid-cols-3">
          {BENEFIT_ITEMS.map((item, i) => (
            <RevealOnScroll key={item.title} delay={i * 0.08}>
              <div className="group overflow-hidden rounded-2xl border border-[var(--upside-border)] bg-card transition-colors hover:bg-[var(--upside-surface)]">
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image
                    src={item.image}
                    alt={item.imageAlt}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                    sizes="(max-width: 640px) 100vw, 33vw"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-foreground">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-muted-foreground leading-relaxed">
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
