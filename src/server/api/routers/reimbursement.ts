import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { reimbursements } from "@/server/db/schema";
import { eq, desc } from "drizzle-orm";

export const reimbursementRouter = createTRPCRouter({
  list: publicProcedure
    .input(
      z.object({
        status: z
          .enum(["pending", "approved", "rejected"])
          .optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      return ctx.db.query.reimbursements.findMany({
        where: input.status
          ? eq(reimbursements.status, input.status)
          : undefined,
        orderBy: [desc(reimbursements.submittedAt)],
        with: { user: true },
      });
    }),

  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.query.reimbursements.findFirst({
        where: eq(reimbursements.id, input.id),
        with: { user: true },
      });
    }),

  create: publicProcedure
    .input(
      z.object({
        userId: z.number(),
        amount: z.number().min(1),
        description: z.string().min(1),
        category: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [reimb] = await ctx.db
        .insert(reimbursements)
        .values(input)
        .returning();
      return reimb;
    }),

  approve: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(reimbursements)
        .set({ status: "approved", reviewedAt: new Date() })
        .where(eq(reimbursements.id, input.id));
    }),

  reject: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(reimbursements)
        .set({ status: "rejected", reviewedAt: new Date() })
        .where(eq(reimbursements.id, input.id));
    }),
});
