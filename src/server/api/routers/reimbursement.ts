import { TRPCError } from "@trpc/server";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";

import { createTRPCRouter, protectedProcedureWithUser } from "@/server/api/trpc";
import { organizations, organizationMembers, reimbursements } from "@/server/db/schema";

export const reimbursementRouter = createTRPCRouter({
  /** Own reimbursements (member / personal view). */
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

  /**
   * All reimbursements submitted under a specific org.
   * Only the org owner may call this.
   */
  listForOrg: protectedProcedureWithUser
    .input(
      z.object({
        orgId: z.number(),
        status: z.enum(["pending", "approved", "rejected"]).optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const org = await ctx.db.query.organizations.findFirst({
        where: and(
          eq(organizations.id, input.orgId),
          eq(organizations.ownerId, ctx.dbUser.id),
        ),
      });
      if (!org) return [];

      const where = input.status
        ? and(
            eq(reimbursements.orgId, input.orgId),
            eq(reimbursements.status, input.status),
          )
        : eq(reimbursements.orgId, input.orgId);

      return ctx.db.query.reimbursements.findMany({
        where,
        orderBy: [desc(reimbursements.submittedAt)],
        with: { user: true },
      });
    }),

  getById: protectedProcedureWithUser
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const reimb = await ctx.db.query.reimbursements.findFirst({
        where: eq(reimbursements.id, input.id),
        with: { user: true },
      });
      if (!reimb) return null;

      // Owner's own reimbursement
      if (reimb.userId === ctx.dbUser.id) return reimb;

      // Org owner reviewing a member's reimbursement
      if (reimb.orgId != null) {
        const org = await ctx.db.query.organizations.findFirst({
          where: and(
            eq(organizations.id, reimb.orgId),
            eq(organizations.ownerId, ctx.dbUser.id),
          ),
        });
        if (org) return reimb;
      }

      return null;
    }),

  create: protectedProcedureWithUser
    .input(
      z.object({
        amount: z.number().min(1),
        description: z.string().min(1),
        category: z.string().min(1),
        orgId: z.number().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (input.orgId != null) {
        const membership = await ctx.db.query.organizationMembers.findFirst({
          where: and(
            eq(organizationMembers.organizationId, input.orgId),
            eq(organizationMembers.userId, ctx.dbUser.id),
          ),
        });
        if (!membership) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Not a member of this organization" });
        }
        if (!membership.canSubmitReimbursements) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Not permitted to submit reimbursements" });
        }
      }

      const [reimb] = await ctx.db
        .insert(reimbursements)
        .values({
          amount: input.amount,
          description: input.description,
          category: input.category,
          userId: ctx.dbUser.id,
          ...(input.orgId != null ? { orgId: input.orgId } : {}),
        })
        .returning();
      return reimb;
    }),

  /**
   * Approve a member's reimbursement. Caller must be the org owner.
   */
  approve: protectedProcedureWithUser
    .input(z.object({ id: z.number(), orgId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const org = await ctx.db.query.organizations.findFirst({
        where: and(
          eq(organizations.id, input.orgId),
          eq(organizations.ownerId, ctx.dbUser.id),
        ),
      });
      if (!org) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not an organization owner" });
      }

      await ctx.db
        .update(reimbursements)
        .set({ status: "approved", reviewedAt: new Date() })
        .where(
          and(
            eq(reimbursements.id, input.id),
            eq(reimbursements.orgId, input.orgId),
          ),
        );
    }),

  /**
   * Reject a member's reimbursement. Caller must be the org owner.
   */
  reject: protectedProcedureWithUser
    .input(z.object({ id: z.number(), orgId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const org = await ctx.db.query.organizations.findFirst({
        where: and(
          eq(organizations.id, input.orgId),
          eq(organizations.ownerId, ctx.dbUser.id),
        ),
      });
      if (!org) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not an organization owner" });
      }

      await ctx.db
        .update(reimbursements)
        .set({ status: "rejected", reviewedAt: new Date() })
        .where(
          and(
            eq(reimbursements.id, input.id),
            eq(reimbursements.orgId, input.orgId),
          ),
        );
    }),
});
