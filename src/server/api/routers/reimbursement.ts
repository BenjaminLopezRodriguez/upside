import { z } from "zod";
import { and, desc, eq } from "drizzle-orm";

import { createTRPCRouter, protectedProcedureWithUser } from "@/server/api/trpc";
import { reimbursements } from "@/server/db/schema";

export const reimbursementRouter = createTRPCRouter({
  list: protectedProcedureWithUser
    .input(
      z.object({
        status: z
          .enum(["pending", "approved", "rejected"])
          .optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const where = input.status
        ? and(
            eq(reimbursements.userId, ctx.dbUser.id),
            eq(reimbursements.status, input.status),
          )
        : eq(reimbursements.userId, ctx.dbUser.id);
      return ctx.db.query.reimbursements.findMany({
        where,
        orderBy: [desc(reimbursements.submittedAt)],
        with: { user: true },
      });
    }),

  getById: protectedProcedureWithUser
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.query.reimbursements.findFirst({
        where: and(
          eq(reimbursements.id, input.id),
          eq(reimbursements.userId, ctx.dbUser.id),
        ),
        with: { user: true },
      });
    }),

  create: protectedProcedureWithUser
    .input(
      z.object({
        amount: z.number().min(1),
        description: z.string().min(1),
        category: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [reimb] = await ctx.db
        .insert(reimbursements)
        .values({ ...input, userId: ctx.dbUser.id })
        .returning();
      return reimb;
    }),

  approve: protectedProcedureWithUser
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(reimbursements)
        .set({ status: "approved", reviewedAt: new Date() })
        .where(
          and(
            eq(reimbursements.id, input.id),
            eq(reimbursements.userId, ctx.dbUser.id),
          ),
        );
    }),

  reject: protectedProcedureWithUser
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(reimbursements)
        .set({ status: "rejected", reviewedAt: new Date() })
        .where(
          and(
            eq(reimbursements.id, input.id),
            eq(reimbursements.userId, ctx.dbUser.id),
          ),
        );
    }),
});
