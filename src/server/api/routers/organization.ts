import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { createTRPCRouter, protectedProcedureWithUser } from "@/server/api/trpc";
import { organizations, organizationMembers } from "@/server/db/schema";

export const organizationRouter = createTRPCRouter({
  /** Get the current user's org membership with org details. */
  getMyOrg: protectedProcedureWithUser.query(async ({ ctx }) => {
    return ctx.db.query.organizationMembers.findFirst({
      where: eq(organizationMembers.userId, ctx.dbUser.id),
      with: { organization: true },
    }) ?? null;
  }),

  /** Update org name / logo (owner only). */
  updateOrg: protectedProcedureWithUser
    .input(
      z.object({
        name: z.string().min(1).max(256),
        logoUrl: z.string().url().nullish(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const org = await ctx.db.query.organizations.findFirst({
        where: eq(organizations.ownerId, ctx.dbUser.id),
      });
      if (!org) throw new TRPCError({ code: "FORBIDDEN", message: "Not an organization owner" });

      await ctx.db
        .update(organizations)
        .set({
          name: input.name,
          ...(input.logoUrl !== undefined && { logoUrl: input.logoUrl }),
        })
        .where(eq(organizations.id, org.id));
    }),

  /**
   * Complete the company setup wizard — sets name, optional logo, marks type as
   * 'corporate' and setupComplete = true.
   */
  completeSetup: protectedProcedureWithUser
    .input(
      z.object({
        name: z.string().min(1).max(256),
        logoUrl: z.string().url().nullish(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const org = await ctx.db.query.organizations.findFirst({
        where: eq(organizations.ownerId, ctx.dbUser.id),
      });
      if (!org) throw new TRPCError({ code: "FORBIDDEN", message: "Not an organization owner" });

      await ctx.db
        .update(organizations)
        .set({
          name: input.name,
          type: "corporate",
          setupComplete: true,
          ...(input.logoUrl !== undefined && { logoUrl: input.logoUrl }),
        })
        .where(eq(organizations.id, org.id));
    }),

  /** Upgrade a personal org to a corporate account (triggers company-setup on next route). */
  upgradeToCompany: protectedProcedureWithUser.mutation(async ({ ctx }) => {
    const org = await ctx.db.query.organizations.findFirst({
      where: eq(organizations.ownerId, ctx.dbUser.id),
    });
    if (!org) throw new TRPCError({ code: "NOT_FOUND", message: "Organization not found" });

    await ctx.db
      .update(organizations)
      .set({ type: "corporate", setupComplete: false })
      .where(eq(organizations.id, org.id));
  }),

  /** List all members of the current user's owned org (owner only). */
  listMembers: protectedProcedureWithUser.query(async ({ ctx }) => {
    const org = await ctx.db.query.organizations.findFirst({
      where: eq(organizations.ownerId, ctx.dbUser.id),
    });
    if (!org) return [];

    return ctx.db.query.organizationMembers.findMany({
      where: eq(organizationMembers.organizationId, org.id),
      with: { user: true },
    });
  }),

  /** Update a member's permission scopes (owner only). */
  updateMemberPermissions: protectedProcedureWithUser
    .input(
      z.object({
        memberId: z.number(),
        canViewTransactions: z.boolean(),
        canCreateCards: z.boolean(),
        canSubmitReimbursements: z.boolean(),
        canViewBills: z.boolean(),
        canManageIntegrations: z.boolean(),
        spendLimit: z.number().positive().nullish(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const org = await ctx.db.query.organizations.findFirst({
        where: eq(organizations.ownerId, ctx.dbUser.id),
      });
      if (!org) throw new TRPCError({ code: "FORBIDDEN", message: "Not an organization owner" });

      const { memberId, ...perms } = input;
      await ctx.db
        .update(organizationMembers)
        .set(perms)
        .where(eq(organizationMembers.id, memberId));
    }),
});
