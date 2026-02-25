import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { createTRPCRouter, protectedProcedureWithUser } from "@/server/api/trpc";
import { roles, organizationMembers } from "@/server/db/schema";

const JOB_BOARDS = ["LinkedIn", "Indeed", "Greenhouse"] as const;

async function ensureOrgMember(
  db: typeof import("@/server/db").db,
  userId: number,
  orgId: number,
) {
  const membership = await db.query.organizationMembers.findFirst({
    where: and(
      eq(organizationMembers.organizationId, orgId),
      eq(organizationMembers.userId, userId),
    ),
  });
  if (!membership) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "You must be a member of this organization to manage roles.",
    });
  }
}

export const roleRouter = createTRPCRouter({
  /** List all roles for an organization. Caller must be a member. */
  listByOrg: protectedProcedureWithUser
    .input(z.object({ orgId: z.number() }))
    .query(async ({ ctx, input }) => {
      await ensureOrgMember(ctx.db, ctx.dbUser.id, input.orgId);
      return ctx.db.query.roles.findMany({
        where: eq(roles.organizationId, input.orgId),
        orderBy: (r, { desc }) => [desc(r.createdAt)],
      });
    }),

  /** Create a role and optionally post to job boards (simulated). Caller must be a member. */
  create: protectedProcedureWithUser
    .input(
      z.object({
        orgId: z.number(),
        title: z.string().min(1).max(256),
        description: z.string().min(1),
        department: z.string().max(128).optional(),
        location: z.string().max(256).optional(),
        postToJobBoards: z.boolean().default(true),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ensureOrgMember(ctx.db, ctx.dbUser.id, input.orgId);

      const [role] = await ctx.db
        .insert(roles)
        .values({
          organizationId: input.orgId,
          createdBy: ctx.dbUser.id,
          title: input.title.trim(),
          description: input.description.trim(),
          department: input.department?.trim() || null,
          location: input.location?.trim() || null,
          status: "open",
          postedTo:
            input.postToJobBoards ? [...JOB_BOARDS] : [],
          postedAt: input.postToJobBoards ? new Date() : null,
        })
        .returning();

      if (!role) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create role" });
      return role;
    }),

  /** Update role status (e.g. open → closed). Caller must be org member. */
  updateStatus: protectedProcedureWithUser
    .input(
      z.object({
        roleId: z.number(),
        status: z.enum(["draft", "open", "closed"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const role = await ctx.db.query.roles.findFirst({
        where: eq(roles.id, input.roleId),
      });
      if (!role) throw new TRPCError({ code: "NOT_FOUND", message: "Role not found" });
      await ensureOrgMember(ctx.db, ctx.dbUser.id, role.organizationId);

      await ctx.db
        .update(roles)
        .set({ status: input.status })
        .where(eq(roles.id, input.roleId));
    }),
});
