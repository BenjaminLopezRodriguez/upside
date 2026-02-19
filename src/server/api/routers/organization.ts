import { TRPCError } from "@trpc/server";
import { and, eq, ilike } from "drizzle-orm";
import { z } from "zod";

import { createTRPCRouter, protectedProcedureWithUser } from "@/server/api/trpc";
import { organizations, organizationMembers } from "@/server/db/schema";

export const organizationRouter = createTRPCRouter({
  // ---------------------------------------------------------------------------
  // Queries
  // ---------------------------------------------------------------------------

  /**
   * All orgs the current user belongs to (personal owner, corporate owner, or
   * invited member). Returns full membership rows with nested org data.
   *
   * A single user can appear multiple times — once per org they belong to.
   */
  listMyOrgs: protectedProcedureWithUser.query(async ({ ctx }) => {
    return ctx.db.query.organizationMembers.findMany({
      where: eq(organizationMembers.userId, ctx.dbUser.id),
      with: { organization: true },
    });
  }),

  /** Members of a specific org. Only the org's owner may call this. */
  listMembers: protectedProcedureWithUser
    .input(z.object({ orgId: z.number() }))
    .query(async ({ ctx, input }) => {
      // Verify caller owns this org.
      const org = await ctx.db.query.organizations.findFirst({
        where: and(
          eq(organizations.id, input.orgId),
          eq(organizations.ownerId, ctx.dbUser.id),
        ),
      });
      if (!org) return [];

      return ctx.db.query.organizationMembers.findMany({
        where: eq(organizationMembers.organizationId, org.id),
        with: { user: true },
      });
    }),

  /**
   * Search orgs by name (case-insensitive), excluding orgs the user already
   * belongs to. Used by the "Join an organization" dialog.
   */
  searchOrgs: protectedProcedureWithUser
    .input(z.object({ query: z.string() }))
    .query(async ({ ctx, input }) => {
      if (!input.query.trim()) return [];

      const myMemberships = await ctx.db
        .select({ orgId: organizationMembers.organizationId })
        .from(organizationMembers)
        .where(eq(organizationMembers.userId, ctx.dbUser.id));

      const myOrgIds = new Set(myMemberships.map((m) => m.orgId));

      const results = await ctx.db.query.organizations.findMany({
        where: ilike(organizations.name, `%${input.query.trim()}%`),
        limit: 12,
      });

      return results.filter((org) => !myOrgIds.has(org.id));
    }),

  // ---------------------------------------------------------------------------
  // Mutations
  // ---------------------------------------------------------------------------

  /**
   * Update an org's name / logo. Caller must own the org (orgId required so
   * that owners of multiple orgs always target the right one).
   */
  updateOrg: protectedProcedureWithUser
    .input(
      z.object({
        orgId: z.number(),
        name: z.string().min(1).max(256),
        logoUrl: z.string().url().nullish(),
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

      await ctx.db
        .update(organizations)
        .set({
          name: input.name,
          ...(input.logoUrl !== undefined && { logoUrl: input.logoUrl }),
        })
        .where(eq(organizations.id, org.id));
    }),

  /**
   * Complete the onboarding wizard for a corporate org — sets name, optional
   * logo, and marks setupComplete = true.
   *
   * No orgId needed: at wizard time there is exactly one incomplete corporate
   * org for this user (the one they just created / upgraded to corporate).
   * Using an explicit findFirst with type+setupComplete guards this correctly.
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
        where: and(
          eq(organizations.ownerId, ctx.dbUser.id),
          eq(organizations.type, "corporate"),
          eq(organizations.setupComplete, false),
        ),
      });
      if (!org) throw new TRPCError({ code: "NOT_FOUND", message: "No pending org setup found" });

      await ctx.db
        .update(organizations)
        .set({
          name: input.name,
          setupComplete: true,
          ...(input.logoUrl !== undefined && { logoUrl: input.logoUrl }),
        })
        .where(eq(organizations.id, org.id));
    }),

  /**
   * Upgrade a specific personal org to corporate (marks type='corporate',
   * setupComplete=false so /auth/resolve sends the user to the wizard).
   * Requires explicit orgId — a user can only upgrade their own org.
   */
  upgradeToCompany: protectedProcedureWithUser
    .input(z.object({ orgId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const org = await ctx.db.query.organizations.findFirst({
        where: and(
          eq(organizations.id, input.orgId),
          eq(organizations.ownerId, ctx.dbUser.id),
        ),
      });
      if (!org) throw new TRPCError({ code: "NOT_FOUND", message: "Organization not found" });

      await ctx.db
        .update(organizations)
        .set({ type: "corporate", setupComplete: false })
        .where(eq(organizations.id, org.id));
    }),

  /** Create a new corporate organization. The caller becomes the owner. */
  createOrg: protectedProcedureWithUser
    .input(
      z.object({
        name: z.string().min(1).max(256),
        logoUrl: z.string().url().nullish(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const slug = `org-${ctx.dbUser.id}-${Date.now()}`;
      const [newOrg] = await ctx.db
        .insert(organizations)
        .values({
          name: input.name,
          slug,
          type: "corporate",
          ownerId: ctx.dbUser.id,
          setupComplete: true,
          ...(input.logoUrl ? { logoUrl: input.logoUrl } : {}),
        })
        .returning();

      await ctx.db.insert(organizationMembers).values({
        organizationId: newOrg!.id,
        userId: ctx.dbUser.id,
        role: "owner",
        canViewTransactions: true,
        canCreateCards: true,
        canSubmitReimbursements: true,
        canViewBills: true,
        canManageIntegrations: true,
      });

      return newOrg!;
    }),

  /** Join an existing org as a member. */
  joinOrg: protectedProcedureWithUser
    .input(z.object({ orgId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.query.organizationMembers.findFirst({
        where: and(
          eq(organizationMembers.organizationId, input.orgId),
          eq(organizationMembers.userId, ctx.dbUser.id),
        ),
      });
      if (existing) {
        throw new TRPCError({ code: "CONFLICT", message: "Already a member of this organization" });
      }

      await ctx.db.insert(organizationMembers).values({
        organizationId: input.orgId,
        userId: ctx.dbUser.id,
        role: "member",
      });
    }),

  /**
   * Update a member's permission scopes. Caller must own the org the member
   * belongs to (orgId required — a multi-org owner must target correctly).
   */
  updateMemberPermissions: protectedProcedureWithUser
    .input(
      z.object({
        orgId: z.number(),
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
      // Verify caller owns the org this member belongs to.
      const org = await ctx.db.query.organizations.findFirst({
        where: and(
          eq(organizations.id, input.orgId),
          eq(organizations.ownerId, ctx.dbUser.id),
        ),
      });
      if (!org) throw new TRPCError({ code: "FORBIDDEN", message: "Not an organization owner" });

      const { memberId, orgId: _, ...perms } = input;
      await ctx.db
        .update(organizationMembers)
        .set(perms)
        .where(
          and(
            eq(organizationMembers.id, memberId),
            eq(organizationMembers.organizationId, org.id),
          ),
        );
    }),
});
