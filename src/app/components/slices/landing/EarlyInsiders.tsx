"use client";

import { RevealOnScroll } from "./utils";
import EarlySignupForm from "../../early-signup-form";

export function EarlyInsiders() {
  return (
    <section
      className="px-6 py-24 sm:px-8 lg:py-28"
      aria-labelledby="early-insiders-heading"
    >
      <RevealOnScroll>
        <div className="mx-auto max-w-2xl rounded-2xl border border-[var(--upside-border)] bg-[var(--upside-surface)] px-8 py-16 text-center sm:px-12 lg:py-20">
          <p className="font-mono text-xs font-medium uppercase tracking-wider text-[var(--upside-purple)]">
            Early access
          </p>
          <h2
            id="early-insiders-heading"
            className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
          >
            Early insiders
          </h2>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            Get notified when Upside goes live. No spam, just one email.
          </p>
          <div className="mt-10">
            <EarlySignupForm />
          </div>
        </div>
      </RevealOnScroll>
    </section>
  );
}
