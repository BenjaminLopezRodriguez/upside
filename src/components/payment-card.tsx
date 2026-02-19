"use client";

import { cn } from "@/lib/utils";

interface PaymentCardProps {
  cardName: string;
  last4: string;
  type: "virtual" | "physical";
  status: "active" | "frozen" | "cancelled";
  spendLimitCents: number;
  currentSpendCents: number;
  /** Logo or avatar of the card issuer — shown top-left */
  issuerLogo?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export function PaymentCard({
  cardName,
  last4,
  type,
  status,
  spendLimitCents,
  currentSpendCents,
  issuerLogo,
  onClick,
  className,
}: PaymentCardProps) {
  const spendPercent =
    spendLimitCents > 0
      ? Math.min(Math.round((currentSpendCents / spendLimitCents) * 100), 100)
      : 0;

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-lg aspect-[1.586]",
        "bg-card-foreground text-card",
        status === "cancelled" && "opacity-50",
        onClick &&
          "cursor-pointer transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20",
        className,
      )}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
    >
   

      {/* Status — top right, only shown when non-active */}
      {status !== "active" && (
        <div className="absolute right-5 top-4">
          <span
            className={cn(
              "text-[11px] font-medium uppercase tracking-wider",
              status === "frozen" ? "text-blue-300/70" : "text-white/40",
            )}
          >
            {status}
          </span>
        </div>
      )}

      {/* Card number */}
      <div className="absolute inset-x-4 top-2/12 -translate-y-1/2 font-bold  text-2xl  text-white/80 ">
      {cardName}

      </div>

      {/* Card name + type — bottom row */}
      <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-2">
           {/* Issuer logo or avatar — top left */}
      {issuerLogo != null && (
        <div className="absolute left-5 top-4 flex h-9 w-9 items-center justify-center overflow-hidden rounded-md [&>img]:h-full [&>img]:w-full [&>img]:object-contain">
          {issuerLogo}
        </div>
      )}
        <span className="min-w-0 truncate text-[11px] text-white/40">
          •••• {last4}

        </span>
        <span className="shrink-0 text-[11px] font-medium uppercase tracking-wider text-white/30">
          {type}
        </span>
      </div>

      {/* Spend progress — strip at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/6">
        <div
          className={cn(
            "h-full rounded-r-full transition-[width] duration-300",
            spendPercent >= 90
              ? "bg-red-400/70"
              : spendPercent >= 75
                ? "bg-amber-400/70"
                : "bg-white/40",
          )}
          style={{ width: `${spendPercent}%` }}
        />
      </div>
    </div>
  );
}
