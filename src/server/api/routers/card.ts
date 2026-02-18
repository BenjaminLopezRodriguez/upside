import { z } from "zod";
import { and, eq } from "drizzle-orm";

import { createTRPCRouter, protectedProcedureWithUser } from "@/server/api/trpc";
import { cards } from "@/server/db/schema";

export const cardRouter = createTRPCRouter({
  list: protectedProcedureWithUser.query(async ({ ctx }) => {
    return ctx.db.query.cards.findMany({
      where: eq(cards.userId, ctx.dbUser.id),
      with: { user: true },
      orderBy: (cards, { desc }) => [desc(cards.createdAt)],
    });
  }),

  getById: protectedProcedureWithUser
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.query.cards.findFirst({
        where: and(eq(cards.id, input.id), eq(cards.userId, ctx.dbUser.id)),
        with: { user: true, transactions: { limit: 10 } },
      });
    }),

  create: protectedProcedureWithUser
    .input(
      z.object({
        cardName: z.string().min(1),
        type: z.enum(["virtual", "physical"]),
        spendLimit: z.number().min(100),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const last4 = String(Math.floor(1000 + Math.random() * 9000));
      const [card] = await ctx.db
        .insert(cards)
        .values({ ...input, userId: ctx.dbUser.id, last4 })
        .returning();
      return card;
    }),

  freeze: protectedProcedureWithUser
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(cards)
        .set({ status: "frozen" })
        .where(
          and(eq(cards.id, input.id), eq(cards.userId, ctx.dbUser.id)),
        );
    }),

  cancel: protectedProcedureWithUser
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(cards)
        .set({ status: "cancelled" })
        .where(
          and(eq(cards.id, input.id), eq(cards.userId, ctx.dbUser.id)),
        );
    }),
});
