import Image from "next/image";
import { LoginLink } from "@kinde-oss/kinde-auth-nextjs/components";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Sign in — Upside",
};

export default async function SignInPage() {
  const { isAuthenticated } = getKindeServerSession();
  if (await isAuthenticated()) {
    redirect("/dashboard");
  }

  const features = [
    "Smart cards",
    "Expense tracking",
    "Bill pay",
    "Reimbursements",
  ];

  return (
    <main
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden"
      style={{
        backgroundImage: `
          radial-gradient(ellipse 55% 45% at 62% 28%, oklch(0.82 0.24 130 / 0.16) 0%, transparent 70%),
          linear-gradient(oklch(0.5 0.01 75 / 0.06) 1px, transparent 1px),
          linear-gradient(90deg, oklch(0.5 0.01 75 / 0.06) 1px, transparent 1px)
        `,
        backgroundSize: "auto, 48px 48px, 48px 48px",
      }}
    >
      <div className="relative z-10 flex flex-col items-center gap-9 px-6 text-center">
        {/* Logo */}
        <div className="animate-page-in">
          <Image
            src="/logo.svg"
            alt="Upside"
            width={164}
            height={44}
            className="dark:invert"
            priority
          />
        </div>

        {/* Heading + subtitle */}
        <div className="animate-page-in stagger-1 max-w-[420px] space-y-3">
          <h1 className="text-[42px] font-semibold leading-[1.08] tracking-tight">
            Spend smarter,
            <br />
            grow faster.
          </h1>
          <p className="text-base leading-relaxed text-muted-foreground">
            Cards, expenses, reimbursements, and bill pay —
            unified for modern finance teams.
          </p>
        </div>

        {/* Feature pills */}
        <div className="animate-page-in stagger-2 flex flex-wrap items-center justify-center gap-2">
          {features.map((feat) => (
            <span
              key={feat}
              className="rounded-full border border-border/60 bg-card/70 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur-sm"
            >
              {feat}
            </span>
          ))}
        </div>

        {/* CTA */}
        <div className="animate-page-in stagger-3">
          <LoginLink className="inline-flex h-11 items-center justify-center rounded-4xl bg-primary px-8 text-sm font-semibold text-primary-foreground shadow-sm transition-[opacity,transform] duration-150 hover:opacity-90 active:scale-[0.98]">
            Sign in to Upside
          </LoginLink>
        </div>
      </div>
    </main>
  );
}
