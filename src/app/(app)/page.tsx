import Image from "next/image";
import Link from "next/link";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
import type { ComponentProps } from "react";
import {
  CreditCardIcon,
  ReceiptDollarIcon,
  InvoiceIcon,
  Wallet01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { BentoCard, BentoGrid } from "@/components/ui/bento-grid";

function withHugeIcon(
  Icon: ComponentProps<typeof HugeiconsIcon>["icon"]
) {
  return function BentoIcon(props: ComponentProps<"svg">) {
    return <HugeiconsIcon icon={Icon} strokeWidth={1.5} {...props} />;
  };
}

export const metadata = {
  title: "Deltra — Spend smarter, grow faster",
  description:
    "Cards, expenses, reimbursements, and bill pay — unified for modern finance teams.",
};

const bentoFeatures = [
  {
    name: "One platform for spend",
    description:
      "Cards, expenses, bill pay, and reimbursements in a single place. No more switching tools or chasing receipts.",
    Icon: withHugeIcon(CreditCardIcon),
    className: "col-span-3 md:col-span-2 md:row-span-2 rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm dark:bg-card/60",
    background: (
      <>
        <div
          className="absolute -right-20 -top-20 h-64 w-64 rounded-full opacity-[0.15] animate-mesh-drift"
          style={{ background: "var(--primary)" }}
        />
        <div
          className="absolute bottom-0 left-0 right-0 h-1/2 opacity-[0.06]"
          style={{
            background: "linear-gradient(to top, var(--primary), transparent)",
          }}
        />
      </>
    ),
  },
  {
    name: "Smart cards",
    description:
      "Issue and manage company cards with real-time controls and spending limits.",
    Icon: withHugeIcon(CreditCardIcon),
    className: "col-span-3 md:col-span-1 rounded-2xl border border-border/50 bg-card/70 backdrop-blur-sm dark:bg-card/50",
    background: (
      <div
        className="absolute inset-0 opacity-[0.08] transition-opacity duration-300 group-hover:opacity-[0.14]"
        style={{
          background: "radial-gradient(circle at 70% 30%, var(--primary) 0%, transparent 55%)",
        }}
      />
    ),
  },
  {
    name: "Expense tracking",
    description:
      "Capture receipts and categorize spend in one place. No more spreadsheets.",
    Icon: withHugeIcon(ReceiptDollarIcon),
    className: "col-span-3 md:col-span-1 rounded-2xl border border-border/50 bg-card/70 backdrop-blur-sm dark:bg-card/50",
    background: (
      <div
        className="absolute inset-0 opacity-[0.08] transition-opacity duration-300 group-hover:opacity-[0.14]"
        style={{
          background: "radial-gradient(circle at 30% 70%, var(--chart-2) 0%, transparent 55%)",
        }}
      />
    ),
  },
  {
    name: "Bill pay & reimbursements",
    description:
      "Pay vendors and approve employee reimbursements from one hub. One workflow, fewer surprises.",
    Icon: withHugeIcon(InvoiceIcon),
    className: "col-span-3 md:col-span-2 rounded-2xl border border-border/50 bg-card/70 backdrop-blur-sm dark:bg-card/50",
    background: (
      <div
        className="absolute inset-0 opacity-[0.08] transition-opacity duration-300 group-hover:opacity-[0.14]"
        style={{
          background: "radial-gradient(circle at 70% 50%, var(--chart-3) 0%, transparent 55%)",
        }}
      />
    ),
  },
];

export default async function LandingPage() {
  const { isAuthenticated } = getKindeServerSession();
  if (await isAuthenticated()) {
    redirect("/dashboard");
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      {/* Gradient mesh background */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div
          className="absolute left-1/2 top-0 h-[80vh] w-[120%] -translate-x-1/2 rounded-full opacity-[0.12] blur-3xl animate-mesh-drift"
          style={{
            background: "radial-gradient(ellipse 60% 50% at 50% 0%, var(--primary) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute bottom-1/4 right-0 h-96 w-96 rounded-full opacity-[0.08] blur-3xl"
          style={{ background: "var(--chart-2)" }}
        />
        <div
          className="absolute bottom-1/3 left-0 h-80 w-80 rounded-full opacity-[0.08] blur-3xl"
          style={{ background: "var(--chart-3)" }}
        />
        <div
          className="absolute inset-0 bg-[linear-gradient(oklch(0.5_0.01_75/0.04)_1px,transparent_1px),linear-gradient(90deg,oklch(0.5_0.01_75/0.04)_1px,transparent_1px)] bg-size-[56px_56px]"
          aria-hidden
        />
      </div>

      <div className="relative z-10 mx-auto flex max-w-6xl flex-col px-6 pb-36 pt-16 md:px-10 md:pt-24 lg:px-14">
        {/* Hero */}
        <header className="flex flex-col items-center text-center">
          <div className="animate-page-in">
            <Image
              src="/logo.svg"
              alt="Deltra"
              width={164}
              height={44}
              className="dark:invert"
              priority
            />
          </div>
          <p className="animate-page-in stagger-1 mt-8 text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
            For modern finance teams
          </p>
          <div className="animate-page-in stagger-1 mt-4 max-w-[520px] space-y-5">
            <h1 className="text-[48px] font-bold leading-[1.05] tracking-tight md:text-[64px] lg:text-[72px]">
              Spend smarter,{" "}
              <span className="text-gradient-hero">grow faster.</span>
            </h1>
            <p className="text-lg leading-relaxed text-muted-foreground md:text-xl">
              Cards, expenses, reimbursements, and bill pay — unified so your
              team can focus on what matters.
            </p>
          </div>

          {/* Proof / outcome strip */}
          <div className="animate-page-in stagger-2 mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden />
              Unified spend
            </span>
            <span className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-chart-2" aria-hidden />
              Real-time control
            </span>
            <span className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-chart-3" aria-hidden />
              Less admin
            </span>
          </div>

          {/* Primary CTA */}
          <div className="animate-page-in stagger-2 mt-12 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/sign-in"
              className="inline-flex h-12 items-center justify-center rounded-2xl bg-primary px-8 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-[opacity,transform,box-shadow] duration-200 hover:opacity-95 hover:shadow-xl hover:shadow-primary/30 active:scale-[0.98]"
            >
              Get started
            </Link>
            <Link
              href="/sign-in"
              className="inline-flex h-12 items-center justify-center rounded-2xl border border-border bg-background/80 px-8 text-base font-medium backdrop-blur-sm transition-[opacity,transform] duration-200 hover:bg-muted/50 active:scale-[0.98]"
            >
              Log in
            </Link>
          </div>
        </header>

        {/* Bento — asymmetric grid, large spacing */}
        <section
          className="animate-page-in stagger-2 mt-32 w-full max-w-5xl md:mt-44 lg:mt-52"
          aria-label="Why Deltra"
        >
          <p className="mb-10 text-center text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">
            One platform, every part of spend
          </p>
          <BentoGrid
            className="auto-rows-[20rem] gap-5 md:auto-rows-[22rem] md:grid-cols-2 md:gap-8 lg:auto-rows-[24rem] lg:gap-10"
          >
            {bentoFeatures.map((feature) => (
              <BentoCard
                key={feature.name}
                {...feature}
                href="/sign-in"
                cta="Get started"
              />
            ))}
          </BentoGrid>
        </section>

        {/* Bottom CTA */}
        <div className="animate-page-in stagger-3 mt-28 flex flex-col items-center gap-4 text-center md:mt-36">
          <p className="text-muted-foreground">
            Ready to simplify spend?
          </p>
          <Link
            href="/sign-in"
            className="inline-flex h-12 items-center justify-center rounded-2xl bg-primary px-10 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-[opacity,transform,box-shadow] duration-200 hover:opacity-95 hover:shadow-xl hover:shadow-primary/30 active:scale-[0.98]"
          >
            Log in
          </Link>
        </div>
      </div>
    </main>
  );
}
