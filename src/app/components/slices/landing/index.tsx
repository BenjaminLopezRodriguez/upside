"use client";

import { useState } from "react";
import { Nav } from "./Nav";
import { RibbonMenu } from "./RibbonMenu";
import { Hero } from "./Hero";
import { Features } from "./Features";
import { Stats } from "./Stats";
import { Benefits } from "./Benefits";
import { HowItWorks } from "./HowItWorks";
import { CTA } from "./CTA";
import { EarlyInsiders } from "./EarlyInsiders";
import { Footer } from "./Footer";

export default function LandingSlices() {
  const [ribbonOpen, setRibbonOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-foreground focus:px-4 focus:py-3 focus:text-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      >
        Skip to main content
      </a>
      <Nav
        ribbonOpen={ribbonOpen}
        onRibbonToggle={() => setRibbonOpen((o) => !o)}
        onRibbonClose={() => setRibbonOpen(false)}
      />
      <main id="main-content" tabIndex={-1}>
        <Hero />
        <Features />
        <Stats />
        <Benefits />
        <HowItWorks />
        <CTA />
        <EarlyInsiders />
      </main>
      <Footer />
    </div>
  );
}
