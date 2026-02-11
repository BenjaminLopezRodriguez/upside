"use client";

import { useEffect, useState } from "react";
import { OrbSurface } from "@/components/orb-surface";
import { Safari } from "@/components/ui/safari";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard" },
  { id: "cards", label: "Cards" },
  { id: "receipts", label: "Receipts" },
  { id: "reports", label: "Reports" },
] as const;

const MOCK_RECEIPTS = [
  { merchant: "AWS", amount: "$1,240.00", status: "Matched" },
  { merchant: "United Airlines", amount: "$456.80", status: "Matched" },
  { merchant: "WeWork", amount: "$2,100.00", status: "Pending" },
];

const CURSOR_DURATION_MS = 3500;
const CLICK_AT_MS = 2300;

export default function WorkflowDemoWidget() {
  const [receiptsSelected, setReceiptsSelected] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setReceiptsSelected(true), CLICK_AT_MS);
    return () => clearTimeout(t);
  }, []);

  return (
    <OrbSurface variant="workflow" className="min-h-[320px] rounded-2xl py-10 sm:py-12">
      <div className="relative mx-auto max-w-4xl px-4 sm:px-6">
        <div className="rounded-2xl shadow-[var(--shadow-card)] ring-1 ring-border/40 transition-shadow hover:shadow-[var(--shadow-card-hover)]">
          <Safari url="dashboard.upside.com" mode="default">
            <div className="relative flex h-full min-h-[340px] overflow-hidden bg-background">
              {/* Sidebar */}
              <aside className="flex w-44 shrink-0 flex-col border-r border-border/60 bg-muted/30 py-5">
                <div className="px-4 text-xs font-semibold text-muted-foreground">
                  Upside
                </div>
                <nav className="mt-5 flex flex-col gap-0.5">
                  {NAV_ITEMS.map((item) => (
                    <div
                      key={item.id}
                      id={item.id === "receipts" ? "nav-receipts" : undefined}
                      className={cn(
                        "relative flex items-center rounded-md px-4 py-2.5 text-sm transition-colors",
                        item.id === "receipts" && receiptsSelected
                          ? "bg-primary/10 font-medium text-foreground"
                          : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                      )}
                    >
                      {item.label}
                    </div>
                  ))}
                </nav>
              </aside>

              {/* Main content */}
              <main className="min-w-0 flex-1 p-5 sm:p-6">
                {!receiptsSelected ? (
                  <>
                    <h2 className="text-sm font-semibold text-foreground">
                      Dashboard
                    </h2>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Overview of cards, spend, and receipts
                    </p>
                    <div className="mt-5 grid grid-cols-2 gap-3">
                      {["Cards", "Spend this month", "Receipts", "Alerts"].map(
                        (tile) => (
                          <div
                            key={tile}
                            className="rounded-lg border border-border/60 bg-muted/20 px-4 py-5 text-center"
                          >
                            <span className="text-xs text-muted-foreground">
                              {tile}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <h2 className="text-sm font-semibold text-foreground">
                      Receipts
                    </h2>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Each transaction matched to a receipt—audit-ready
                    </p>
                    <div className="mt-5 space-y-2">
                      {MOCK_RECEIPTS.map((r) => (
                        <div
                          key={r.merchant}
                          className="flex items-center justify-between rounded-md border border-border/50 bg-muted/20 px-3.5 py-2.5 text-xs"
                        >
                          <span className="font-medium text-foreground">
                            {r.merchant}
                          </span>
                          <span className="text-muted-foreground">
                            {r.amount}
                          </span>
                          <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-foreground">
                            {r.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </main>

              {/* Animated cursor */}
              <div
                className="pointer-events-none absolute z-20 text-foreground"
                style={{
                  animation: `workflow-cursor-move ${CURSOR_DURATION_MS}ms ease-in-out forwards`,
                }}
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="drop-shadow-md"
                  aria-hidden
                >
                  <path
                    d="M5 3L5 21L10 16L14 21L16 19L12 14L19 14L5 3Z"
                    fill="currentColor"
                    stroke="white"
                    strokeWidth="1"
                    strokeLinejoin="round"
                  />
                </svg>
                <span
                  className="absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-primary"
                  style={{
                    animation: `workflow-cursor-click ${CURSOR_DURATION_MS}ms ease-out forwards`,
                  }}
                />
              </div>
            </div>
          </Safari>
        </div>
      </div>
    </OrbSurface>
  );
}
