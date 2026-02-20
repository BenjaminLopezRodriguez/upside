import { z } from "zod";
import { and, eq, inArray } from "drizzle-orm";

import { createTRPCRouter, protectedProcedureWithUser } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { cards, organizations, organizationMembers } from "@/server/db/schema";

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
        cardColor: z.string().max(32).optional(),
        logoUrl: z.string().url().max(512).optional(),
        material: z.string().max(32).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { cardColor, logoUrl, material, ...rest } = input;
      const last4 = String(Math.floor(1000 + Math.random() * 9000));
      const [card] = await ctx.db
        .insert(cards)
        .values({ ...rest, userId: ctx.dbUser.id, last4, cardColor, logoUrl, material })
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

  /** Issue a card to a specific org member. Caller must own the org. */
  issueForMember: protectedProcedureWithUser
    .input(
      z.object({
        orgId: z.number(),
        memberId: z.number(),
        cardName: z.string().min(1),
        type: z.enum(["virtual", "physical"]),
        spendLimit: z.number().min(100),
        cardColor: z.string().max(32).optional(),
        logoUrl: z.string().url().max(512).optional(),
        material: z.string().max(32).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const org = await ctx.db.query.organizations.findFirst({
        where: and(
          eq(organizations.id, input.orgId),
          eq(organizations.ownerId, ctx.dbUser.id),
        ),
      });
      if (!org) throw new TRPCError({ code: "FORBIDDEN", message: "Not an organization owner" });

      const membership = await ctx.db.query.organizationMembers.findFirst({
        where: and(
          eq(organizationMembers.id, input.memberId),
          eq(organizationMembers.organizationId, org.id),
        ),
      });
      if (!membership) throw new TRPCError({ code: "NOT_FOUND", message: "Member not found" });

      const last4 = String(Math.floor(1000 + Math.random() * 9000));
      const [card] = await ctx.db
        .insert(cards)
        .values({
          cardName: input.cardName,
          type: input.type,
          spendLimit: input.spendLimit,
          cardColor: input.cardColor,
          logoUrl: input.logoUrl,
          material: input.material,
          userId: membership.userId,
          last4,
        })
        .returning();
      return card;
    }),

  /** List all cards for members of an org. Caller must own the org. */
  listForOrg: protectedProcedureWithUser
    .input(z.object({ orgId: z.number() }))
    .query(async ({ ctx, input }) => {
      const org = await ctx.db.query.organizations.findFirst({
        where: and(
          eq(organizations.id, input.orgId),
          eq(organizations.ownerId, ctx.dbUser.id),
        ),
      });
      if (!org) throw new TRPCError({ code: "FORBIDDEN", message: "Not an organization owner" });

      const members = await ctx.db.query.organizationMembers.findMany({
        where: eq(organizationMembers.organizationId, org.id),
        with: { user: true },
      });

      const memberUserIds = members.map((m) => m.userId);
      if (memberUserIds.length === 0) return [];

      return ctx.db.query.cards.findMany({
        where: inArray(cards.userId, memberUserIds),
        with: { user: true },
        orderBy: (cards, { desc }) => [desc(cards.createdAt)],
      });
    }),
});
