"use client";

import { createRib } from "nextjs-ribs";
import { api } from "@/trpc/react";

export const DashboardRib = createRib({
  name: "Dashboard",

  interactor: (_deps: Record<string, never>) => {
    const summary = api.dashboard.getSummary.useQuery();
    const spendByCategory = api.dashboard.getSpendByCategory.useQuery();
    const spendByCategoryOverTime = api.dashboard.getSpendByCategoryOverTime.useQuery();
    const recentTransactions = api.dashboard.getRecentTransactions.useQuery();

    return {
      summary: summary.data,
      spendByCategory: spendByCategory.data,
      spendByCategoryOverTime: spendByCategoryOverTime.data,
      recentTransactions: recentTransactions.data,
      isLoading:
        summary.isLoading ||
        spendByCategory.isLoading ||
        spendByCategoryOverTime.isLoading ||
        recentTransactions.isLoading,
    };
  },

  presenter: (state) => ({
    ...state,
    formattedTotalSpend: formatCents(state.summary?.totalSpend ?? 0),
    formattedUpcomingBills: formatCents(state.summary?.upcomingBills ?? 0),
    pendingReimbursements: state.summary?.pendingReimbursements ?? 0,
    activeCards: state.summary?.activeCards ?? 0,
    chartData: (state.spendByCategory ?? []).map((c) => ({
      name: c.category,
      value: c.total / 100,
    })),
    spendOverTimeLineData: deriveSpendOverTimeLineData(state),
    spendOverTimeCategories: derivePercentageLineCategories(state),
    recentTx: (state.recentTransactions ?? []).map((tx) => ({
      id: tx.id,
      merchant: tx.merchant.name,
      user: tx.user.name,
      amount: formatCents(tx.amount),
      status: tx.status,
      date: tx.transactionDate,
      category: tx.category,
    })),
  }),
});

function formatCents(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

function categorySlug(label: string): string {
  return label.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "") || label;
}

function derivePercentageLineCategories(state: {
  spendByCategoryOverTime?: { categories: { key: string; label: string }[] };
  spendByCategory?: { category: string; total: number }[];
}): { key: string; label: string }[] {
  const fromOverTime = state.spendByCategoryOverTime?.categories ?? [];
  if (fromOverTime.length > 0) return fromOverTime;
  const fromCategory = state.spendByCategory ?? [];
  return fromCategory.map((c) => ({ key: categorySlug(c.category), label: c.category }));
}

/** X = timeline (period), Y = spend amount ($) per period. Amounts in dollars. */
function deriveSpendOverTimeLineData(state: {
  spendByCategoryOverTime?: { periods: Record<string, number | string>[] };
  spendByCategory?: { category: string; total: number }[];
}): Record<string, number | string>[] {
  const fromOverTime = state.spendByCategoryOverTime?.periods ?? [];
  if (fromOverTime.length > 0) {
    return fromOverTime.map((p) => {
      const out: Record<string, number | string> = { period: p.period as string };
      for (const [k, v] of Object.entries(p)) {
        if (k === "period") continue;
        out[k] = typeof v === "number" ? v / 100 : v;
      }
      return out;
    });
  }
  const fromCategory = state.spendByCategory ?? [];
  if (fromCategory.length === 0) return [];
  const amounts: Record<string, number> = {};
  fromCategory.forEach((c) => {
    amounts[categorySlug(c.category)] = c.total / 100;
  });
  return [{ period: "To date", ...amounts }];
}
