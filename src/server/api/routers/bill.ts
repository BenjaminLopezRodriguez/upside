import { z } from "zod";
import { and, desc, eq } from "drizzle-orm";

import { createTRPCRouter, protectedProcedureWithUser } from "@/server/api/trpc";
import { bills } from "@/server/db/schema";

export const billRouter = createTRPCRouter({
  list: protectedProcedureWithUser
    .input(
      z.object({
        status: z
          .enum(["draft", "pending", "scheduled", "paid"])
          .optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const where = input.status
        ? and(eq(bills.userId, ctx.dbUser.id), eq(bills.status, input.status))
        : eq(bills.userId, ctx.dbUser.id);
      return ctx.db.query.bills.findMany({
        where,
        orderBy: [desc(bills.dueDate)],
      });
    }),

  getById: protectedProcedureWithUser
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.query.bills.findFirst({
        where: and(eq(bills.id, input.id), eq(bills.userId, ctx.dbUser.id)),
      });
    }),

  create: protectedProcedureWithUser
    .input(
      z.object({
        vendorName: z.string().min(1),
        amount: z.number().min(1),
        dueDate: z.date(),
        invoiceNumber: z.string().optional(),
        category: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [bill] = await ctx.db
        .insert(bills)
        .values({ ...input, userId: ctx.dbUser.id })
        .returning();
      return bill;
    }),

  markPaid: protectedProcedureWithUser
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(bills)
        .set({ status: "paid", paidAt: new Date() })
        .where(
          and(eq(bills.id, input.id), eq(bills.userId, ctx.dbUser.id)),
        );
    }),
});
