import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { cards } from "@/server/db/schema";
import { eq } from "drizzle-orm";

export const cardRouter = createTRPCRouter({
  list: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.query.cards.findMany({
      with: { user: true },
      orderBy: (cards, { desc }) => [desc(cards.createdAt)],
    });
  }),

  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.query.cards.findFirst({
        where: eq(cards.id, input.id),
        with: { user: true, transactions: { limit: 10 } },
      });
    }),

  create: publicProcedure
    .input(
      z.object({
        userId: z.number(),
        cardName: z.string().min(1),
        type: z.enum(["virtual", "physical"]),
        spendLimit: z.number().min(100),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const last4 = String(Math.floor(1000 + Math.random() * 9000));
      const [card] = await ctx.db
        .insert(cards)
        .values({ ...input, last4 })
        .returning();
      return card;
    }),

  freeze: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(cards)
        .set({ status: "frozen" })
        .where(eq(cards.id, input.id));
    }),

  cancel: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(cards)
        .set({ status: "cancelled" })
        .where(eq(cards.id, input.id));
    }),
});
