import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import {
  transactions,
  cards,
  reimbursements,
  bills,
  merchants,
  users,
} from "@/server/db/schema";
import { eq, sql, desc, gte } from "drizzle-orm";

export const dashboardRouter = createTRPCRouter({
  getSummary: publicProcedure.query(async ({ ctx }) => {
    const [spendResult] = await ctx.db
      .select({ total: sql<number>`coalesce(sum(${transactions.amount}), 0)` })
      .from(transactions)
      .where(eq(transactions.status, "completed"));

    const [pendingReimbResult] = await ctx.db
      .select({ count: sql<number>`count(*)` })
      .from(reimbursements)
      .where(eq(reimbursements.status, "pending"));

    const [activeCardsResult] = await ctx.db
      .select({ count: sql<number>`count(*)` })
      .from(cards)
      .where(eq(cards.status, "active"));

    const [upcomingBillsResult] = await ctx.db
      .select({ total: sql<number>`coalesce(sum(${bills.amount}), 0)` })
      .from(bills)
      .where(eq(bills.status, "pending"));

    return {
      totalSpend: Number(spendResult?.total ?? 0),
      pendingReimbursements: Number(pendingReimbResult?.count ?? 0),
      activeCards: Number(activeCardsResult?.count ?? 0),
      upcomingBills: Number(upcomingBillsResult?.total ?? 0),
    };
  }),

  getSpendByCategory: publicProcedure.query(async ({ ctx }) => {
    const result = await ctx.db
      .select({
        category: transactions.category,
        total: sql<number>`sum(${transactions.amount})`,
      })
      .from(transactions)
      .where(eq(transactions.status, "completed"))
      .groupBy(transactions.category)
      .orderBy(sql`sum(${transactions.amount}) desc`);

    return result.map((r) => ({
      category: r.category,
      total: Number(r.total),
    }));
  }),

  getRecentTransactions: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.query.transactions.findMany({
      orderBy: [desc(transactions.transactionDate)],
      limit: 10,
      with: {
        merchant: true,
        user: true,
        card: true,
      },
    });
  }),

  /** Spend amount by time period (month) and category; timeline X, spend $ per period on Y. */
  getSpendByCategoryOverTime: publicProcedure.query(async ({ ctx }) => {
    const rows = await ctx.db
      .select({
        period: sql<Date>`date_trunc('month', ${transactions.transactionDate})::date`,
        category: transactions.category,
        total: sql<number>`sum(${transactions.amount})`,
      })
      .from(transactions)
      .where(eq(transactions.status, "completed"))
      .groupBy(
        sql`date_trunc('month', ${transactions.transactionDate})`,
        transactions.category,
      )
      .orderBy(sql`date_trunc('month', ${transactions.transactionDate})`);

    const byPeriod = new Map<
      string,
      { period: Date; label: string; totals: Record<string, number> }
    >();
    for (const r of rows) {
      const period =
        r.period instanceof Date ? r.period : new Date(r.period as string);
      const periodKey = period.toISOString().slice(0, 7);
      const label = period.toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      });
      if (!byPeriod.has(periodKey)) {
        byPeriod.set(periodKey, { period, label, totals: {} });
      }
      const row = byPeriod.get(periodKey)!;
      row.totals[r.category] = Number(r.total);
    }

    const periods = Array.from(byPeriod.values()).sort(
      (a, b) => a.period.getTime() - b.period.getTime(),
    );
    const allCategories = Array.from(
      new Set(periods.flatMap((p) => Object.keys(p.totals))),
    ).sort();
    const categorySlug = (name: string) =>
      name.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");
    const categories = allCategories.map((label) => ({
      key: categorySlug(label) || label,
      label,
    }));

    return {
      periods: periods.map((p) => {
        const amounts: Record<string, number> = {};
        for (const c of categories) {
          amounts[c.key] = p.totals[c.label] ?? 0;
        }
        return { period: p.label, ...amounts };
      }),
      categories,
    };
  }),
});
