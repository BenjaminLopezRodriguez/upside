import { subMonths } from "date-fns";

export type TransactionForTrend = {
  amount: number;
  category: string;
  transactionDate: Date;
  merchant?: { name: string } | null;
};

export type CategorySummary = {
  category: string;
  totalCents: number;
  count: number;
  pctOfTotal: number;
};

export type MonthSummary = {
  month: string; // YYYY-MM
  totalCents: number;
  count: number;
  byCategory: CategorySummary[];
};

export type SpendTrends = {
  summary: string;
  totalLast90DaysCents: number;
  byCategory: CategorySummary[];
  byMonth: MonthSummary[];
  monthOverMonthPct: number | null; // last month vs previous month
  topMerchants: { name: string; totalCents: number; count: number }[];
};

/**
 * Aggregate transactions into spend trends for the last 90 days.
 * Used to power the "Ask Deltra" trend tool and context.
 */
export function computeSpendTrends(
  transactions: TransactionForTrend[],
  options?: { windowMonths?: number }
): SpendTrends {
  const windowMonths = options?.windowMonths ?? 3;
  const now = new Date();
  const cutoff = subMonths(now, windowMonths);
  const txs = transactions.filter(
    (t) => new Date(t.transactionDate) >= cutoff
  );

  const totalLast90DaysCents = txs.reduce((s, t) => s + t.amount, 0);

  // By category
  const byCategoryMap = new Map<string, { totalCents: number; count: number }>();
  for (const t of txs) {
    const cat = t.category || "Uncategorized";
    const cur = byCategoryMap.get(cat) ?? { totalCents: 0, count: 0 };
    cur.totalCents += t.amount;
    cur.count += 1;
    byCategoryMap.set(cat, cur);
  }
  const byCategory: CategorySummary[] = Array.from(byCategoryMap.entries())
    .map(([category, { totalCents, count }]) => ({
      category,
      totalCents,
      count,
      pctOfTotal:
        totalLast90DaysCents > 0
          ? Math.round((totalCents / totalLast90DaysCents) * 1000) / 10
          : 0,
    }))
    .sort((a, b) => b.totalCents - a.totalCents);

  // By month
  const byMonthMap = new Map<
    string,
    { totalCents: number; count: number; byCategory: Map<string, number> }
  >();
  for (const t of txs) {
    const d = new Date(t.transactionDate);
    const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    let cur = byMonthMap.get(monthKey);
    if (!cur) {
      cur = { totalCents: 0, count: 0, byCategory: new Map() };
      byMonthMap.set(monthKey, cur);
    }
    cur.totalCents += t.amount;
    cur.count += 1;
    const cat = t.category || "Uncategorized";
    cur.byCategory.set(cat, (cur.byCategory.get(cat) ?? 0) + t.amount);
  }
  const byMonth: MonthSummary[] = Array.from(byMonthMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, { totalCents, count, byCategory: catMap }]) => ({
      month,
      totalCents,
      count,
      byCategory: Array.from(catMap.entries())
        .map(([category, catTotal]) => ({
          category,
          totalCents: catTotal,
          count: 0,
          pctOfTotal:
            totalCents > 0
              ? Math.round((catTotal / totalCents) * 1000) / 10
              : 0,
        }))
        .sort((a, b) => b.totalCents - a.totalCents),
    }));

  // Month-over-month % (last full month vs previous)
  let monthOverMonthPct: number | null = null;
  if (byMonth.length >= 2) {
    const last = byMonth[byMonth.length - 1];
    const prev = byMonth[byMonth.length - 2];
    if (last && prev && prev.totalCents > 0) {
      monthOverMonthPct =
        Math.round(((last.totalCents - prev.totalCents) / prev.totalCents) * 1000) / 10;
    }
  }

  // Top merchants
  const merchantMap = new Map<string, { totalCents: number; count: number }>();
  for (const t of txs) {
    const name = t.merchant?.name ?? "Unknown";
    const cur = merchantMap.get(name) ?? { totalCents: 0, count: 0 };
    cur.totalCents += t.amount;
    cur.count += 1;
    merchantMap.set(name, cur);
  }
  const topMerchants = Array.from(merchantMap.entries())
    .map(([name, { totalCents, count }]) => ({ name, totalCents, count }))
    .sort((a, b) => b.totalCents - a.totalCents)
    .slice(0, 10);

  const formatMoney = (cents: number) =>
    `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const summary = [
    `Total spend (last ${windowMonths} months): ${formatMoney(totalLast90DaysCents)} across ${txs.length} transactions.`,
    byCategory.length
      ? `Top categories: ${byCategory.slice(0, 5).map((c) => `${c.category} (${formatMoney(c.totalCents)}, ${c.pctOfTotal}%)`).join("; ")}.`
      : "",
    monthOverMonthPct != null
      ? `Month-over-month change: ${monthOverMonthPct > 0 ? "+" : ""}${monthOverMonthPct}%.`
      : "",
  ]
    .filter(Boolean)
    .join(" ");

  return {
    summary,
    totalLast90DaysCents,
    byCategory,
    byMonth,
    monthOverMonthPct,
    topMerchants,
  };
}
