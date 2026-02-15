"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DemoDialog } from "./DemoDialog";
import { RevealOnScroll } from "./utils";

export function CTA() {
  return (
    <section
      id="contact"
      className="scroll-mt-20 border-y border-[var(--upside-border)] bg-[var(--upside-surface)] px-6 py-24 sm:px-8 lg:py-32"
      aria-labelledby="cta-heading"
    >
      <div className="mx-auto max-w-2xl text-center">
        <RevealOnScroll>
          <h2
            id="cta-heading"
            className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl"
          >
            Ready to take control of spend?
          </h2>
          <p className="mt-5 text-muted-foreground">
            See how Upside fits your card and receipt workflows. Our team will
            walk you through a personalized demo.
          </p>
          <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <DemoDialog>
              <Button
                size="lg"
                className="tap-target h-12 min-h-[48px] rounded-full bg-[var(--upside-purple)] px-8 text-base font-medium text-white transition-colors hover:bg-[var(--upside-deep)] focus-visible:ring-2 focus-visible:ring-[var(--upside-purple)] focus-visible:ring-offset-2"
              >
                Request a demo
              </Button>
            </DemoDialog>
            <Link
              href="mailto:hello@upside.com"
              className="tap-target flex min-h-[44px] items-center rounded-full border border-[var(--upside-border)] px-6 text-sm font-medium text-muted-foreground transition-colors hover:bg-[var(--upside-surface)] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Contact sales
            </Link>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}
