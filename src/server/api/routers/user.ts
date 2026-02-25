import { TRPCError } from "@trpc/server";
import { desc, eq } from "drizzle-orm";

import { createTRPCRouter, publicProcedure, protectedProcedureWithUser } from "@/server/api/trpc";
import {
  users,
  organizations,
  organizationMembers,
  transactions,
  cards,
  reimbursements,
  bills,
  integrationLinks,
  apiKeys,
  webhooks,
} from "@/server/db/schema";

export const userRouter = createTRPCRouter({
  list: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.query.users.findMany({
      orderBy: [desc(users.createdAt)],
    });
  }),

  /**
   * Permanently delete the current user's account and all associated data.
   * Fails if the user owns any organization (they must delete or transfer those first).
   */
  deleteAccount: protectedProcedureWithUser.mutation(async ({ ctx }) => {
    const ownedOrgs = await ctx.db.query.organizations.findMany({
      where: eq(organizations.ownerId, ctx.dbUser.id),
    });
    if (ownedOrgs.length > 0) {
      throw new TRPCError({
        code: "PRECONDITION_FAILED",
        message: "Transfer or delete all organizations you own before deleting your account.",
      });
    }

    const userId = ctx.dbUser.id;

    await ctx.db.delete(transactions).where(eq(transactions.userId, userId));
    await ctx.db.delete(cards).where(eq(cards.userId, userId));
    await ctx.db.delete(organizationMembers).where(eq(organizationMembers.userId, userId));
    await ctx.db.delete(reimbursements).where(eq(reimbursements.userId, userId));
    await ctx.db.delete(bills).where(eq(bills.userId, userId));
    await ctx.db.delete(integrationLinks).where(eq(integrationLinks.userId, userId));
    await ctx.db.delete(apiKeys).where(eq(apiKeys.userId, userId));
    await ctx.db.delete(webhooks).where(eq(webhooks.userId, userId));
    await ctx.db.delete(users).where(eq(users.id, userId));
  }),
});
