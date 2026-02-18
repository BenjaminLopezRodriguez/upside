import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { bills } from "@/server/db/schema";
import { eq, desc } from "drizzle-orm";

export const billRouter = createTRPCRouter({
  list: publicProcedure
    .input(
      z.object({
        status: z
          .enum(["draft", "pending", "scheduled", "paid"])
          .optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      return ctx.db.query.bills.findMany({
        where: input.status ? eq(bills.status, input.status) : undefined,
        orderBy: [desc(bills.dueDate)],
      });
    }),

  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.query.bills.findFirst({
        where: eq(bills.id, input.id),
      });
    }),

  create: publicProcedure
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
      const [bill] = await ctx.db.insert(bills).values(input).returning();
      return bill;
    }),

  markPaid: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(bills)
        .set({ status: "paid", paidAt: new Date() })
        .where(eq(bills.id, input.id));
    }),
});
