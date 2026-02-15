"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useRef, type ReactNode } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useInView,
  AnimatePresence,
} from "framer-motion";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import EarlySignupForm from "../early-signup-form";

/* ─────────────────────── Illustrography System ─────────────────────── */
/*
 * UPSIDE ILLUSTROGRAPHY SYSTEM
 * ─────────────────────────────
 * Visual language: "Currency engraving meets modern editorial"
 *
 * IMAGE CATEGORIES:
 * 1. Product — Card payments, terminals, card-in-hand shots
 * 2. Data    — Dashboards, analytics screens, financial charts
 * 3. Process — Documents, receipts, invoices, paper-based
 * 4. People  — Teams collaborating, business meetings
 * 5. Texture — Abstract purple/gold luxury textures for backgrounds
 *
 * COLOR TREATMENT:
 * - Images use a subtle purple overlay (mix-blend-multiply) to unify
 * - Dark sections: images at 40-60% opacity with overlay
 * - Light sections: images at full brightness with rounded corners
 * - Feature images: slight warm color grading (gold tint on shadows)
 *
 * ASPECT RATIOS:
 * - Feature panels: 4:3 or 16:10
 * - Step images: 1:1 (square)
 * - Hero accent: 3:2
 * - CTA banner: 2:1 (wide)
 *
 * NANO BANANA PROMPT TEMPLATES (for generating custom replacements):
 * - Product: "A premium dark purple corporate card with gold accents, held elegantly, soft studio lighting, shallow depth of field, editorial style"
 * - Dashboard: "A clean financial dashboard interface showing charts and transaction data, on a modern laptop, soft ambient lighting, overhead angle"
 * - Receipt: "A receipt being scanned by a modern phone app, clean minimal desk, soft natural light, overhead shot"
 * - Invoice: "A beautifully designed invoice document on a marble desk, gold pen nearby, luxury office setting"
 * - Team: "A diverse finance team collaborating around a modern conference table, glass office, warm natural light"
 * - Abstract: "Flowing abstract liquid texture in deep purple and gold tones, luxury material feel, high resolution macro"
 */

const IMAGES = {
  // Product / Card imagery
  cardHeld:
    "https://plus.unsplash.com/premium_photo-1664202219791-58870741c9dd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  cardTerminal:
    "https://images.unsplash.com/photo-1556742031-c6961e8560b0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
  cardPayment:
    "https://images.unsplash.com/photo-1728044849325-47f4f5a21da3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",

  // Data / Dashboard imagery
  dashboardAnalytics:
    "https://images.unsplash.com/photo-1551288049-bebda4e38f71?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  tabletAnalytics:
    "https://images.unsplash.com/photo-1748609160056-7b95f30041f0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
  dataScreen:
    "https://images.unsplash.com/photo-1460925895917-afdab827c52f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",

  // Documents / Receipts / Invoices
  invoiceDocument:
    "https://images.unsplash.com/photo-1554224155-cfa08c2a758f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
  receiptPhone:
    "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
  financeBills:
    "https://plus.unsplash.com/premium_photo-1661433019622-851b0fb9b58d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",

  // People / Teams
  teamMeeting:
    "https://images.unsplash.com/photo-1758518729685-f88df7890776?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  teamCollab:
    "https://images.unsplash.com/photo-1758873268364-15bef4162221?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
  officeHallway:
    "https://images.unsplash.com/photo-1758691736995-fd7222612210?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",

  // Abstract / Texture
  purpleGoldLiquid:
    "https://images.unsplash.com/photo-1743275062438-4502369061a3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200",
  purpleGoldAbstract:
    "https://images.unsplash.com/photo-1743275062441-d392b5bd8fba?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200",
  goldenShapes:
    "https://plus.unsplash.com/premium_photo-1747939639350-fef62332ccd5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200",
} as const;

/* ─────────────────────── Data ─────────────────────── */

const FEATURES = [
  {
    id: "spend",
    label: "Spend Controls",
    number: "01",
    description: "Set controls for your corporate cards",
    detail:
      "Define spend limits, merchant restrictions, and approval workflows per card, team, or program. Real-time visibility into every transaction with instant alerts and automated policy enforcement.",
    image: IMAGES.cardHeld,
    imageAlt: "Premium corporate card being held",
  },
  {
    id: "receipts",
    label: "Receipt Tracking",
    number: "02",
    description: "Automatic receipt capture and matching",
    detail:
      "Every transaction is automatically matched to a receipt. AI-powered categorization, OCR extraction, and audit-ready documentation. No more chasing down paper receipts.",
    image: IMAGES.financeBills,
    imageAlt: "Entrepreneur analyzing financial documents and receipts",
  },
  {
    id: "invoicing",
    label: "Invoicing",
    number: "03",
    description: "Send and manage invoices seamlessly",
    detail:
      "Create, send, and track invoices with automated payment reminders. Reconcile payments against your books in real time. Connect to your existing accounting tools.",
    image: IMAGES.invoiceDocument,
    imageAlt: "Clean invoice document on white surface",
  },
  {
    id: "more",
    label: "Integrations",
    number: "04",
    description: "Reporting, APIs, and beyond",
    detail:
      "REST APIs, webhooks, ERP integrations, custom reports, and everything else your finance team needs to stay in control.",
    image: IMAGES.dashboardAnalytics,
    imageAlt: "Performance analytics dashboard on laptop screen",
  },
];

const STATS = [
  { value: "99.9%", label: "Uptime SLA" },
  { value: "<50ms", label: "API response" },
  { value: "256-bit", label: "Encryption" },
  { value: "SOC 2", label: "Compliant" },
];

const STEPS = [
  {
    step: "01",
    title: "Connect",
    description:
      "Link your bank accounts and existing cards. We handle the heavy lifting of integration.",
    image: IMAGES.cardTerminal,
    imageAlt: "Card being inserted into payment terminal",
  },
  {
    step: "02",
    title: "Configure",
    description:
      "Set spend policies, approval chains, and receipt rules that match how your team works.",
    image: IMAGES.tabletAnalytics,
    imageAlt: "Person analyzing financial data on a tablet",
  },
  {
    step: "03",
    title: "Control",
    description:
      "Issue cards, track receipts, and manage invoices from a single dashboard. Real-time, always.",
    image: IMAGES.dataScreen,
    imageAlt: "Financial dashboard graphical interface",
  },
];

const NAV_LINKS = [
  { href: "#features", label: "Product" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#contact", label: "Contact" },
];

/* ─────────────────────── Utilities ─────────────────────── */

function RevealOnScroll({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 32 }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function UpsideLogo({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="7" y1="17" x2="17" y2="7" />
      <polyline points="7,7 17,7 17,17" />
    </svg>
  );
}

/* ─────────────────────── Nav ─────────────────────── */

function Nav() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
        {/* Left: menu + logo */}
        <div className="flex items-center gap-4">
          <Sheet>
            <SheetTrigger asChild>
              <button
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-[var(--upside-deep)] shadow-lg backdrop-blur-md transition-all hover:bg-white hover:shadow-xl"
                aria-label="Open menu"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                >
                  <line x1="4" y1="7" x2="20" y2="7" />
                  <line x1="4" y1="12" x2="16" y2="12" />
                  <line x1="4" y1="17" x2="12" y2="17" />
                </svg>
              </button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="w-[320px] border-r-0 bg-[var(--upside-deep)] sm:max-w-[360px]"
            >
              <SheetHeader className="pb-2">
                <SheetTitle className="flex items-center gap-2 text-white">
                  <UpsideLogo size={14} />
                  <span className="font-serif text-lg font-semibold tracking-tight">
                    upside
                  </span>
                </SheetTitle>
              </SheetHeader>

              <div className="gold-line mx-6 opacity-40" />

              <nav className="flex flex-col gap-1 px-6 pt-6">
                {NAV_LINKS.map((link) => (
                  <SheetClose key={link.href} asChild>
                    <Link
                      href={link.href}
                      className="group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-white/70 transition-all hover:bg-white/10 hover:text-white"
                    >
                      <span className="h-px w-4 bg-current opacity-40 transition-all group-hover:w-6 group-hover:opacity-100" />
                      {link.label}
                    </Link>
                  </SheetClose>
                ))}

                <Separator className="my-4 bg-white/10" />

                <span className="mb-2 px-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/30">
                  Resources
                </span>
                {[
                  { href: "#", label: "Documentation" },
                  { href: "#", label: "API Reference" },
                  { href: "#", label: "Changelog" },
                ].map((link) => (
                  <SheetClose key={link.label} asChild>
                    <Link
                      href={link.href}
                      className="rounded-xl px-4 py-2.5 text-sm text-white/50 transition-colors hover:bg-white/5 hover:text-white/70"
                    >
                      {link.label}
                    </Link>
                  </SheetClose>
                ))}
              </nav>

              {/* Sidebar bottom image accent */}
              <div className="mt-auto flex flex-col gap-3 p-6">
                <div className="relative h-24 overflow-hidden rounded-xl">
                  <Image
                    src={IMAGES.purpleGoldLiquid}
                    alt=""
                    fill
                    className="object-cover opacity-40"
                    aria-hidden
                  />
                  <div className="absolute inset-0 bg-[var(--upside-deep)]/60" />
                </div>
                <div className="gold-line opacity-40" />
                <p className="pt-2 text-[11px] leading-relaxed text-white/30">
                  Card issuing and receipt tracking
                  <br />
                  for modern business.
                </p>
              </div>
            </SheetContent>
          </Sheet>

          <Link
            href="/"
            className="flex items-center gap-1.5 rounded-full bg-white/90 px-4 py-2.5 text-sm font-semibold tracking-tight text-[var(--upside-deep)] shadow-lg backdrop-blur-md transition-all hover:bg-white hover:shadow-xl"
          >
            <UpsideLogo size={14} />
            upside
          </Link>
        </div>

        {/* Right: nav links + CTA */}
        <div className="flex items-center gap-2">
          <nav className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-full px-4 py-2 text-sm font-medium text-white/80 transition-colors hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}

/* ─────────────────────── Demo Dialog ─────────────────────── */

function DemoDialog({ children }: { children: ReactNode }) {
  const [submitted, setSubmitted] = useState(false);

  return (
    <Dialog onOpenChange={() => setSubmitted(false)}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl font-bold text-[var(--upside-purple)]">
            Request a demo
          </DialogTitle>
          <DialogDescription>
            See how Upside fits your card and receipt workflows. Our team will
            walk you through a personalized demo.
          </DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {!submitted ? (
            <motion.form
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onSubmit={(e) => {
                e.preventDefault();
                setSubmitted(true);
              }}
              className="flex flex-col gap-4"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="demo-name"
                    className="text-xs font-medium text-muted-foreground"
                  >
                    Full name
                  </label>
                  <Input
                    id="demo-name"
                    placeholder="Jane Smith"
                    required
                    className="rounded-lg"
                    autoComplete="name"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="demo-company"
                    className="text-xs font-medium text-muted-foreground"
                  >
                    Company
                  </label>
                  <Input
                    id="demo-company"
                    placeholder="Acme Inc."
                    className="rounded-lg"
                    autoComplete="organization"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="demo-email"
                  className="text-xs font-medium text-muted-foreground"
                >
                  Work email
                </label>
                <Input
                  id="demo-email"
                  type="email"
                  placeholder="jane@acme.com"
                  required
                  className="rounded-lg"
                  autoComplete="email"
                />
              </div>
              <Button
                type="submit"
                size="lg"
                className="mt-2 w-full rounded-xl bg-[var(--upside-purple)] text-white hover:bg-[var(--upside-deep)]"
              >
                Schedule demo
              </Button>
            </motion.form>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-3 py-6 text-center"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--upside-lavender)]">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--upside-purple)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20,6 9,17 4,12" />
                </svg>
              </div>
              <p className="font-serif text-lg font-semibold text-[var(--upside-purple)]">
                We&apos;ll be in touch
              </p>
              <p className="text-sm text-muted-foreground">
                Expect to hear from our team within 24 hours.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}

/* ─────────────────────── Hero ─────────────────────── */

function Hero() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.8], [1, 0.92]);
  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);

  return (
    <section
      ref={heroRef}
      className="relative flex min-h-screen items-center justify-center overflow-hidden"
    >
      {/* Parallax background layers */}
      <motion.div className="hero-bg absolute inset-0" style={{ y: bgY }} />
      <motion.div
        className="hero-pattern absolute inset-0 opacity-20"
        style={{ y: bgY }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/40" />



      {/* Floating product image — parallax at different speed */}
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

      {/* Decorative lines */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute top-[20%] left-[8%] h-px w-[15%] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div className="absolute right-[10%] bottom-[25%] h-px w-[12%] bg-gradient-to-r from-transparent via-[var(--upside-gold)]/20 to-transparent" />
        <div className="absolute top-[35%] right-[5%] h-[10%] w-px bg-gradient-to-b from-transparent via-white/10 to-transparent" />
      </div>

      {/* Main content */}
      <motion.div
        className="relative z-10 px-6 text-center"
        style={{ y: textY, opacity, scale }}
      >


        <motion.h1
          className="font-serif text-[clamp(3rem,10vw,9rem)] leading-[0.92] font-bold tracking-tight text-white"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          make money
          <br />
          <span className="italic">moves</span>
        </motion.h1>

        <motion.p
          className="mx-auto mt-6 max-w-md text-base leading-relaxed text-white/60 sm:text-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          Card issuing, receipt tracking, and invoicing.
          <br className="hidden sm:block" /> One platform for modern finance
          teams.
        </motion.p>

        <motion.div
          className="mt-10 flex flex-wrap items-center justify-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
        >
          <DemoDialog>
            <Button
              size="lg"
              className="rounded-full bg-white px-8 text-sm font-semibold text-[var(--upside-deep)] shadow-2xl transition-all hover:bg-white/90 hover:shadow-[0_8px_30px_rgba(255,255,255,0.2)]"
            >
              Request a demo
            </Button>
          </DemoDialog>
          <Link
            href="#features"
            className="group flex items-center gap-2 rounded-full border border-white/20 px-6 py-2.5 text-sm font-medium text-white/80 backdrop-blur-sm transition-all hover:border-white/40 hover:text-white"
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
              className="transition-transform group-hover:translate-y-0.5"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <polyline points="19,12 12,19 5,12" />
            </svg>
          </Link>
        </motion.div>
      </motion.div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-22  bg-gradient-to-t from-indigo-200/40 to-transparent" />
    </section>
  );
}

/* ─────────────────────── Features ─────────────────────── */

function Features() {
  const [activeTab, setActiveTab] = useState("spend");
  const activeFeature = FEATURES.find((f) => f.id === activeTab)!;

  return (
    <section
      id="features"
      className="relative scroll-mt-20 px-4 pb-28 sm:px-6 lg:px-8 pt-10"
      aria-labelledby="features-heading"
    >
      <div className="mx-auto max-w-6xl">
        <RevealOnScroll>
          <div
            className="overflow-hidden rounded-[2rem] shadow-2xl"
            style={{ backgroundColor: "var(--upside-lavender)" }}
          >
            {/* Header */}
            <div className="px-8 pt-10 sm:px-12 sm:pt-14 lg:px-16 lg:pt-16">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <Badge
                    variant="secondary"
                    className="mb-4 bg-[var(--upside-purple)]/10 text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--upside-purple)]"
                  >
                    Platform
                  </Badge>
                  <h2
                    id="features-heading"
                    className="font-serif text-4xl font-bold italic sm:text-5xl lg:text-6xl"
                    style={{ color: "var(--upside-purple)" }}
                  >
                    find your upside
                  </h2>
                </div>
                <p
                  className="max-w-xs text-sm leading-relaxed opacity-60"
                  style={{ color: "var(--upside-purple)" }}
                >
                  Everything your finance team needs, unified under one roof.
                </p>
              </div>
            </div>

            {/* Tab row */}
            <div className="mt-10 px-8 sm:px-12 lg:px-16">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
                {FEATURES.map((feature) => (
                  <button
                    key={feature.id}
                    onClick={() => setActiveTab(feature.id)}
                    className={`group relative rounded-2xl px-5 py-5 text-left transition-all duration-300 ${
                      activeTab === feature.id
                        ? "bg-white/80 shadow-lg"
                        : "bg-transparent hover:bg-white/30"
                    }`}
                  >
                    <span
                      className={`font-serif mb-1 block text-xs font-bold transition-opacity ${
                        activeTab === feature.id ? "opacity-40" : "opacity-20"
                      }`}
                      style={{ color: "var(--upside-purple)" }}
                    >
                      {feature.number}
                    </span>
                    <span
                      className={`block text-lg font-semibold transition-opacity sm:text-xl ${
                        activeTab === feature.id ? "opacity-100" : "opacity-50"
                      }`}
                      style={{ color: "var(--upside-purple)" }}
                    >
                      {feature.label}
                    </span>
                    {activeTab === feature.id && (
                      <motion.span
                        layoutId="feature-desc"
                        className="mt-2 block text-sm leading-relaxed opacity-60"
                        style={{ color: "var(--upside-purple)" }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.6 }}
                        transition={{ duration: 0.3 }}
                      >
                        {feature.description}
                      </motion.span>
                    )}
                    {activeTab === feature.id && (
                      <motion.div
                        layoutId="feature-indicator"
                        className="absolute bottom-0 left-1/2 h-1 w-8 -translate-x-1/2 rounded-full"
                        style={{ backgroundColor: "var(--upside-gold)" }}
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 30,
                        }}
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Expanded content with image */}
            <div className="p-8 sm:p-12 lg:p-16">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeFeature.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.3 }}
                  className="grid gap-6 rounded-2xl bg-white/60 p-6 backdrop-blur-sm sm:p-8 lg:grid-cols-2 lg:gap-8"
                >
                  {/* Text */}
                  <div className="flex flex-col justify-center">
                    <span
                      className="font-serif text-sm font-bold opacity-30"
                      style={{ color: "var(--upside-purple)" }}
                    >
                      {activeFeature.number}
                    </span>
                    <h3
                      className="font-serif mt-1 text-2xl font-semibold"
                      style={{ color: "var(--upside-purple)" }}
                    >
                      {activeFeature.label}
                    </h3>
                    <p
                      className="mt-3 max-w-md text-base leading-relaxed opacity-70"
                      style={{ color: "var(--upside-purple)" }}
                    >
                      {activeFeature.detail}
                    </p>
                  </div>

                  {/* Image */}
                  <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
                    <Image
                      src={activeFeature.image}
                      alt={activeFeature.imageAlt}
                      fill
                      className="object-cover transition-transform duration-700 hover:scale-105"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                    <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-black/5" />
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}

/* ─────────────────────── Stats ─────────────────────── */

function Stats() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      ref={ref}
      className="relative overflow-hidden px-6 py-20 sm:px-8 lg:py-28"
    >
      <div className="engraving-texture absolute inset-0" />
      <div className="gold-line mx-auto mb-16 max-w-md opacity-50" />

      <div className="relative mx-auto grid max-w-5xl grid-cols-2 gap-8 sm:grid-cols-4 sm:gap-6">
        {STATS.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{
              duration: 0.6,
              delay: i * 0.1,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="text-center"
          >
            <span
              className="font-serif block text-3xl font-bold tracking-tight sm:text-4xl"
              style={{ color: "var(--upside-purple)" }}
            >
              {stat.value}
            </span>
            <span className="mt-2 block text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
              {stat.label}
            </span>
          </motion.div>
        ))}
      </div>

      <div className="gold-line mx-auto mt-16 max-w-md opacity-50" />
    </section>
  );
}

/* ─────────────────────── Benefits ─────────────────────── */

function Benefits() {
  const items = [
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

  return (
    <section
      className="px-6 py-24 sm:px-8 lg:px-10 lg:py-32"
      aria-labelledby="benefits-heading"
    >
      <div className="mx-auto max-w-5xl">
        <RevealOnScroll>
          <div className="mx-auto max-w-2xl text-center">
            <Badge
              variant="secondary"
              className="mb-4 bg-[var(--upside-lavender)]/60 text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--upside-purple)]"
            >
              Advantages
            </Badge>
            <h2
              id="benefits-heading"
              className="font-serif text-3xl font-bold tracking-tight sm:text-4xl"
              style={{ color: "var(--upside-purple)" }}
            >
              Why teams choose Upside
            </h2>
            <p className="mt-4 text-base text-muted-foreground">
              Finance and operations get clarity and control without the usual
              friction.
            </p>
          </div>
        </RevealOnScroll>

        <div className="mt-16 grid gap-6 sm:grid-cols-3">
          {items.map((item, i) => (
            <RevealOnScroll key={item.title} delay={i * 0.12}>
              <div className="group overflow-hidden rounded-2xl border border-border/40 bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                {/* Card image */}
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image
                    src={item.image}
                    alt={item.imageAlt}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
                </div>
                {/* Card text */}
                <div className="px-6 pb-8 pt-4 sm:px-8">
                  <h3
                    className="font-serif text-lg font-semibold"
                    style={{ color: "var(--upside-purple)" }}
                  >
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
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

/* ─────────────────────── How It Works ─────────────────────── */

function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="relative scroll-mt-20 overflow-hidden px-6 py-24 sm:px-8 lg:px-10 lg:py-32"
      style={{ backgroundColor: "var(--upside-deep)" }}
      aria-labelledby="how-heading"
    >
      <div className="hero-pattern absolute inset-0 opacity-10" />

      {/* Background texture image */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <Image
          src={IMAGES.purpleGoldAbstract}
          alt=""
          fill
          className="object-cover opacity-15 mix-blend-screen"
          sizes="100vw"
        />
      </div>

      {/* Decorative corner lines */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute top-8 left-8 h-16 w-px bg-gradient-to-b from-[var(--upside-gold)]/30 to-transparent" />
        <div className="absolute top-8 left-8 h-px w-16 bg-gradient-to-r from-[var(--upside-gold)]/30 to-transparent" />
        <div className="absolute right-8 bottom-8 h-16 w-px bg-gradient-to-t from-[var(--upside-gold)]/30 to-transparent" />
        <div className="absolute right-8 bottom-8 h-px w-16 bg-gradient-to-l from-[var(--upside-gold)]/30 to-transparent" />
      </div>

      <div className="relative mx-auto max-w-5xl">
        <RevealOnScroll>
          <div className="mx-auto max-w-2xl text-center">
            <Badge
              variant="outline"
              className="mb-4 border-white/15 bg-white/5 text-[10px] font-semibold uppercase tracking-[0.15em] text-white/50"
            >
              Process
            </Badge>
            <h2
              id="how-heading"
              className="font-serif text-3xl font-bold tracking-tight text-white sm:text-4xl"
            >
              Three steps to clarity
            </h2>
            <p className="mt-4 text-base text-white/50">
              From signup to full visibility in under a week.
            </p>
          </div>
        </RevealOnScroll>

        <div className="mt-16 grid gap-8 sm:grid-cols-3">
          {STEPS.map((item, i) => (
            <RevealOnScroll key={item.step} delay={i * 0.15}>
              <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm transition-all duration-300 hover:border-white/20 hover:bg-white/10">
                {/* Step image */}
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image
                    src={item.image}
                    alt={item.imageAlt}
                    fill
                    className="object-cover opacity-60 transition-all duration-500 group-hover:opacity-80 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--upside-deep)] via-[var(--upside-deep)]/60 to-transparent" />
                  <span
                    className="font-serif absolute bottom-4 left-6 text-4xl font-bold"
                    style={{ color: "var(--upside-gold)", opacity: 0.5 }}
                  >
                    {item.step}
                  </span>
                </div>

                {/* Step text */}
                <div className="p-6 sm:p-8">
                  <h3 className="text-xl font-semibold text-white">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-white/50">
                    {item.description}
                  </p>
                </div>

                {i < STEPS.length - 1 && (
                  <div className="absolute -right-4 top-1/2 hidden -translate-y-1/2 text-white/20 sm:block">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    >
                      <polyline points="9,6 15,12 9,18" />
                    </svg>
                  </div>
                )}
              </div>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────── CTA ─────────────────────── */

function CTA() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "-10%"]);
  const imgScale = useTransform(scrollYProgress, [0, 1], [1.1, 1]);

  return (
    <section
      id="contact"
      ref={ref}
      className="relative scroll-mt-20 overflow-hidden px-6 py-24 sm:px-8 lg:px-10 lg:py-32"
      aria-labelledby="cta-heading"
    >
      {/* Parallax background */}
      <motion.div
        className="absolute inset-0 opacity-25"
        style={{
          backgroundColor: "var(--upside-lavender)",
          y: bgY,
        }}
      />
      <div className="engraving-texture absolute inset-0" />

      {/* Background team image */}
      <motion.div
        className="pointer-events-none absolute inset-0"
        style={{ scale: imgScale }}
        aria-hidden
      >
        <Image
          src={IMAGES.teamMeeting}
          alt=""
          fill
          className="object-cover opacity-15"
          sizes="100vw"
        />
      </motion.div>

      <div className="relative mx-auto max-w-2xl text-center">
        <RevealOnScroll>
          <h2
            id="cta-heading"
            className="font-serif text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl"
            style={{ color: "var(--upside-purple)" }}
          >
            Ready to take control
            <br />
            <span className="italic">of spend?</span>
          </h2>
          <p className="mt-4 text-base text-muted-foreground">
            See how Upside fits your card and receipt workflows. Our team will
            walk you through a personalized demo.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <DemoDialog>
              <Button
                size="lg"
                className="rounded-full bg-[var(--upside-purple)] px-8 text-sm font-semibold text-white shadow-lg transition-all hover:bg-[var(--upside-deep)] hover:shadow-xl"
              >
                Request a demo
              </Button>
            </DemoDialog>
            <Link
              href="mailto:hello@upside.com"
              className="rounded-full border-2 px-8 py-2.5 text-sm font-semibold transition-all hover:bg-[var(--upside-lavender-light)]"
              style={{
                borderColor: "var(--upside-purple)",
                color: "var(--upside-purple)",
              }}
            >
              Contact sales
            </Link>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}

/* ─────────────────────── Early Insiders ─────────────────────── */

function EarlyInsiders() {
  return (
    <section
      className="border-t border-border/50 px-6 py-16 sm:px-8 lg:px-10 lg:py-20"
      aria-labelledby="early-insiders-heading"
    >
      <RevealOnScroll>
        <div className="mx-auto max-w-2xl text-center">
          <Badge
            variant="secondary"
            className="mb-4 bg-[var(--upside-lavender)]/60 text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--upside-purple)]"
          >
            Early access
          </Badge>
          <h2
            id="early-insiders-heading"
            className="font-serif text-2xl font-bold tracking-tight sm:text-3xl"
            style={{ color: "var(--upside-purple)" }}
          >
            Early insiders
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Get notified when Upside goes live. No spam, just one email.
          </p>
          <div className="mx-auto mt-8 max-w-xl">
            <EarlySignupForm />
          </div>
        </div>
      </RevealOnScroll>
    </section>
  );
}

/* ─────────────────────── Footer ─────────────────────── */

function Footer() {
  const footerColumns = [
    {
      title: "Product",
      links: [
        { label: "Spend Controls", href: "#features" },
        { label: "Receipt Tracking", href: "#features" },
        { label: "Invoicing", href: "#features" },
        { label: "Integrations", href: "#features" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "About", href: "#" },
        { label: "Careers", href: "#" },
        { label: "Contact", href: "#contact" },
        { label: "Blog", href: "#" },
      ],
    },
    {
      title: "Legal",
      links: [
        { label: "Privacy", href: "#" },
        { label: "Terms", href: "#" },
        { label: "Security", href: "#" },
        { label: "Compliance", href: "#" },
      ],
    },
  ];

  return (
    <footer
      className="relative overflow-hidden px-6 py-16 sm:px-8 lg:px-10"
      style={{ backgroundColor: "var(--upside-deep)" }}
    >
      {/* Subtle texture image in footer */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <Image
          src={IMAGES.goldenShapes}
          alt=""
          fill
          className="object-cover opacity-10 mix-blend-screen"
          sizes="100vw"
        />
      </div>

      <div className="relative mx-auto max-w-6xl">
        {/* Top area */}
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand column */}
          <div className="lg:col-span-2">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-base font-semibold tracking-tight text-white"
            >
              <UpsideLogo size={14} />
              <span className="font-serif">upside</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/40">
              Card issuing, receipt tracking, and invoicing for modern finance
              teams. One platform, total clarity.
            </p>
          </div>

          {/* Link columns */}
          {footerColumns.map((col) => (
            <div key={col.title}>
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/30">
                {col.title}
              </span>
              <ul className="mt-4 flex flex-col gap-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/50 transition-colors hover:text-white/80"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="gold-line mt-12 opacity-20" />
        <div className="mt-8 flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-xs text-white/30">
            &copy; {new Date().getFullYear()} Upside. All rights reserved.
          </p>
          <div className="flex gap-6">
            {["Twitter", "LinkedIn", "GitHub"].map((social) => (
              <Link
                key={social}
                href="#"
                className="text-xs text-white/30 transition-colors hover:text-white/60"
              >
                {social}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ─────────────────────── Main Export ─────────────────────── */

export default function LandingSlices() {
  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <main id="main-content">
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
