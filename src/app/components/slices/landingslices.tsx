import Link from "next/link";
import { OrbSurface } from "@/components/orb-surface";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import CardIssuingWidget from "../widgets/cardissuingwidget";
import ReceiptTrackingWidget from "../widgets/receipttrackingwidget";
import WorkflowDemoWidget from "../widgets/workflowdemowidget";

function Nav() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/60 bg-background/95 backdrop-blur-sm supports-[backdrop-filter]:bg-background/80">
      <nav
        className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6 sm:px-8 lg:px-10"
        aria-label="Main"
      >
        <Link
          href="/"
          className="text-base font-semibold tracking-tight text-foreground transition-opacity hover:opacity-90"
        >
          Upside
        </Link>
        <div className="flex items-center gap-1 sm:gap-3">
          <Link
            href="#features"
            className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Product
          </Link>
          <Link
            href="#contact"
            className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Contact
          </Link>
          <Button variant="ghost" size="sm" className="rounded-full" asChild>
            <Link href="#contact">Log in</Link>
          </Button>
          <Button
            size="sm"
            className="rounded-full bg-foreground px-4 text-background hover:bg-foreground/90 focus-visible:ring-ring"
            asChild
          >
            <Link href="#contact">Get started</Link>
          </Button>
        </div>
      </nav>
    </header>
  );
}

function Hero() {
  return (
    <OrbSurface variant="hero" className="min-h-[72vh]">
      <section
        className="relative px-6 pt-36 pb-28 sm:px-8 lg:pt-44 lg:pb-32 lg:px-10"
        aria-labelledby="hero-heading"
      >
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-5 text-sm font-medium uppercase tracking-wider text-muted-foreground">
            Card issuing and receipt intelligence for business
          </p>
          <h1
            id="hero-heading"
            className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-[2.5rem] lg:leading-tight"
          >
            Issue cards. Track every receipt.
          </h1>
          <p className="mx-auto mt-7 max-w-xl text-base leading-relaxed text-muted-foreground">
            Give your team full control over spend. Issue virtual or physical
            cards via API, then automatically capture and match receipts to every
            transaction—so finance stays in control and audit is simple.
          </p>
          <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
            <Button
              size="lg"
              className="rounded-full bg-foreground px-6 text-background shadow-sm hover:bg-foreground/90 focus-visible:ring-ring"
              asChild
            >
              <Link href="#contact">Request a demo</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="rounded-full border-2 focus-visible:ring-ring"
              asChild
            >
              <Link href="#features">See how it works</Link>
            </Button>
          </div>
        </div>
      </section>
    </OrbSurface>
  );
}

function Features() {
  return (
    <section
      id="features"
      className="scroll-mt-20 px-6 py-24 sm:px-8 lg:py-32 lg:px-10"
      aria-labelledby="features-heading"
    >
      <div className="mx-auto max-w-5xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium text-muted-foreground">Product</p>
          <h2
            id="features-heading"
            className="mt-3 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
          >
            Built for modern finance teams
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            Control spend with programmable cards. Trust every transaction with
            matched, audit-ready receipts.
          </p>
        </div>
        <div className="mt-16 space-y-12">
          <CardIssuingWidget />
          <ReceiptTrackingWidget />
          <WorkflowDemoWidget />
        </div>
        <div className="mt-20 grid gap-8 sm:grid-cols-2">
          <Card className="overflow-hidden border border-border/60 bg-card shadow-[var(--shadow-card)] ring-0 transition-shadow hover:shadow-[var(--shadow-card-hover)]">
            <CardHeader className="gap-5 px-6 pb-8 pt-6 sm:px-8 sm:pb-10 sm:pt-8">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-border/80 bg-muted/50 text-foreground">
                <svg
                  className="size-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  viewBox="0 0 24 24"
                  aria-hidden
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                  />
                </svg>
              </div>
              <CardTitle className="text-base font-semibold">
                Card issuing
              </CardTitle>
              <CardDescription className="text-sm leading-relaxed text-muted-foreground">
                Issue virtual and physical cards via API. Configure spend
                limits, merchant rules, and policies per card or program—then
                sync with your treasury and accounting systems.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card className="overflow-hidden border border-border/60 bg-card shadow-[var(--shadow-card)] ring-0 transition-shadow hover:shadow-[var(--shadow-card-hover)]">
            <CardHeader className="gap-5 px-6 pb-8 pt-6 sm:px-8 sm:pb-10 sm:pt-8">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-border/80 bg-muted/50 text-foreground">
                <svg
                  className="size-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  viewBox="0 0 24 24"
                  aria-hidden
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                  />
                </svg>
              </div>
              <CardTitle className="text-base font-semibold">
                Receipt tracking
              </CardTitle>
              <CardDescription className="text-sm leading-relaxed text-muted-foreground">
                Every transaction is matched to a receipt. We capture, enrich,
                and categorize automatically—so reconciliation and audit are
                straightforward. Export to your ERP or use our APIs.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </section>
  );
}

function Benefits() {
  const items = [
    {
      title: "Control",
      description:
        "Set spend limits and merchant rules per card or team. See activity in real time.",
    },
    {
      title: "Compliance",
      description:
        "Receipt-level audit trail with automatic categorization for tax and audit.",
    },
    {
      title: "Integration",
      description:
        "REST APIs and webhooks connect to your existing tools and workflows.",
    },
  ];

  return (
    <section
      className="border-t border-border/50 bg-muted/30 px-6 py-24 sm:px-8 lg:py-32 lg:px-10"
      aria-labelledby="benefits-heading"
    >
      <div className="mx-auto max-w-5xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2
            id="benefits-heading"
            className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
          >
            Why teams choose Upside
          </h2>
          <p className="mt-4 text-base text-muted-foreground">
            Finance and operations get clarity and control without the usual
            friction.
          </p>
        </div>
        <div className="mt-16 grid gap-8 sm:grid-cols-3">
          {items.map((item) => (
            <div
              key={item.title}
              className="relative rounded-xl border border-border/40 bg-card/50 px-6 py-7 text-center shadow-sm sm:px-8 sm:py-8"
            >
              <h3 className="text-sm font-semibold text-foreground">
                {item.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <OrbSurface variant="cta" className="border-t border-border/50">
      <section
        id="contact"
        className="relative scroll-mt-20 px-6 py-24 sm:px-8 lg:py-32 lg:px-10"
        aria-labelledby="cta-heading"
      >
        <div className="mx-auto max-w-2xl text-center">
          <h2
            id="cta-heading"
            className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
          >
            Ready to take control of spend?
          </h2>
          <p className="mt-4 text-base text-muted-foreground">
            See how Upside fits your card and receipt workflows. Our team will
            walk you through a short demo.
          </p>
          <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
            <Button
              size="lg"
              className="rounded-full bg-foreground px-6 text-background shadow-sm hover:bg-foreground/90 focus-visible:ring-ring"
              asChild
            >
              <Link href="mailto:hello@upside.com">Request a demo</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="rounded-full border-2 focus-visible:ring-ring"
              asChild
            >
              <Link href="mailto:hello@upside.com">Contact sales</Link>
            </Button>
          </div>
        </div>
      </section>
    </OrbSurface>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border/50 bg-background px-6 py-16 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col items-center justify-between gap-10 sm:flex-row">
          <Link
            href="/"
            className="text-base font-semibold tracking-tight text-foreground transition-opacity hover:opacity-90"
          >
            Upside
          </Link>
          <nav
            className="flex flex-wrap justify-center gap-x-10 gap-y-2 text-sm text-muted-foreground"
            aria-label="Footer"
          >
            <Link
              href="#features"
              className="transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:rounded"
            >
              Product
            </Link>
            <Link
              href="#contact"
              className="transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:rounded"
            >
              Contact
            </Link>
            <Link
              href="#"
              className="transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:rounded"
            >
              Privacy
            </Link>
            <Link
              href="#"
              className="transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:rounded"
            >
              Terms
            </Link>
          </nav>
        </div>
        <p className="mt-12 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Upside. Card issuing and receipt
          tracking for business.
        </p>
      </div>
    </footer>
  );
}

export default function LandingSlices() {
  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <main id="main-content">
        <Hero />
        <Features />
        <Benefits />
        <CTA />
        <Footer />
      </main>
    </div>
  );
}
