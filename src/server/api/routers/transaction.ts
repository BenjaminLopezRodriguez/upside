import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { transactions } from "@/server/db/schema";
import { eq, desc, and, ilike, gte, lte, sql } from "drizzle-orm";

export const transactionRouter = createTRPCRouter({
  list: publicProcedure
    .input(
      z.object({
        status: z.enum(["pending", "completed", "declined"]).optional(),
        category: z.string().optional(),
        search: z.string().optional(),
        from: z.date().optional(),
        to: z.date().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const conditions = [];
      if (input.status) conditions.push(eq(transactions.status, input.status));
      if (input.category)
        conditions.push(eq(transactions.category, input.category));
      if (input.from)
        conditions.push(gte(transactions.transactionDate, input.from));
      if (input.to)
        conditions.push(lte(transactions.transactionDate, input.to));
      if (input.search)
        conditions.push(ilike(transactions.memo, `%${input.search}%`));

      return ctx.db.query.transactions.findMany({
        where: conditions.length > 0 ? and(...conditions) : undefined,
        orderBy: [desc(transactions.transactionDate)],
        with: {
          merchant: true,
          user: true,
          card: true,
        },
      });
    }),

  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.query.transactions.findFirst({
        where: eq(transactions.id, input.id),
        with: {
          merchant: true,
          user: true,
          card: true,
        },
      });
    }),

  updateMemo: publicProcedure
    .input(z.object({ id: z.number(), memo: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(transactions)
        .set({ memo: input.memo })
        .where(eq(transactions.id, input.id));
    }),
});
