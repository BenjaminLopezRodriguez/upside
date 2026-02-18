import { and, desc, eq, sql } from "drizzle-orm";
import { z } from "zod";

import { createTRPCRouter, protectedProcedureWithUser } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import {
  bills,
  cards,
  reimbursements,
  transactions,
} from "@/server/db/schema";

export const dashboardRouter = createTRPCRouter({
  getSummary: protectedProcedureWithUser.query(async ({ ctx }) => {
    const uid = ctx.dbUser.id;
    const [spendResult] = await ctx.db
      .select({ total: sql<number>`coalesce(sum(${transactions.amount}), 0)` })
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, uid),
          eq(transactions.status, "completed"),
        ),
      );

    const [pendingReimbResult] = await ctx.db
      .select({ count: sql<number>`count(*)` })
      .from(reimbursements)
      .where(
        and(
          eq(reimbursements.userId, uid),
          eq(reimbursements.status, "pending"),
        ),
      );

    const [activeCardsResult] = await ctx.db
      .select({ count: sql<number>`count(*)` })
      .from(cards)
      .where(
        and(eq(cards.userId, uid), eq(cards.status, "active")),
      );

    const [upcomingBillsResult] = await ctx.db
      .select({ total: sql<number>`coalesce(sum(${bills.amount}), 0)` })
      .from(bills)
      .where(
        and(eq(bills.userId, uid), eq(bills.status, "pending")),
      );

    return {
      totalSpend: Number(spendResult?.total ?? 0),
      pendingReimbursements: Number(pendingReimbResult?.count ?? 0),
      activeCards: Number(activeCardsResult?.count ?? 0),
      upcomingBills: Number(upcomingBillsResult?.total ?? 0),
    };
  }),

  getSpendByCategory: protectedProcedureWithUser
    .input(z.object({}).strict().optional())
    .query(async ({ ctx }) => {
      try {
        const result = await ctx.db
          .select({
            category: transactions.category,
            total: sql<number>`sum(${transactions.amount})`,
          })
          .from(transactions)
          .where(
            and(
              eq(transactions.userId, ctx.dbUser.id),
              eq(transactions.status, "completed"),
            ),
          )
          .groupBy(transactions.category)
          .orderBy(sql`sum(${transactions.amount}) desc`);

        return result.map((r) => ({
          category: r.category,
          total: Number(r.total ?? 0),
        }));
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "getSpendByCategory failed";
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message,
          cause: err,
        });
      }
    }),

  getRecentTransactions: protectedProcedureWithUser.query(
    async ({ ctx }) => {
      return ctx.db.query.transactions.findMany({
        where: eq(transactions.userId, ctx.dbUser.id),
        orderBy: [desc(transactions.transactionDate)],
        limit: 10,
        with: {
          merchant: true,
          user: true,
          card: true,
        },
      });
    },
  ),

  /** Spend amount by time period (month) and category; timeline X, spend $ per period on Y. */
  getSpendByCategoryOverTime: protectedProcedureWithUser.query(
    async ({ ctx }) => {
      const rows = await ctx.db
        .select({
          period: sql<Date>`date_trunc('month', ${transactions.transactionDate})::date`,
          category: transactions.category,
          total: sql<number>`sum(${transactions.amount})`,
        })
        .from(transactions)
        .where(
          and(
            eq(transactions.userId, ctx.dbUser.id),
            eq(transactions.status, "completed"),
          ),
        )
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
    },
  ),
});
