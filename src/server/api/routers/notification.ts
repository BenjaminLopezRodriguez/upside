import { z } from "zod";
import { and, desc, eq, isNull, lt } from "drizzle-orm";

import { createTRPCRouter, protectedProcedureWithUser } from "@/server/api/trpc";
import { notifications } from "@/server/db/schema";

export const notificationRouter = createTRPCRouter({
  list: protectedProcedureWithUser
    .input(
      z
        .object({
          limit: z.number().min(1).max(50).default(20),
          cursor: z.number().optional(),
          unreadOnly: z.boolean().default(false),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const limit = input?.limit ?? 20;
      const cursor = input?.cursor;
      const unreadOnly = input?.unreadOnly ?? false;

      const whereClause =
        cursor != null
          ? unreadOnly
            ? and(
                eq(notifications.userId, ctx.dbUser.id),
                isNull(notifications.readAt),
                lt(notifications.id, cursor),
              )
            : and(
                eq(notifications.userId, ctx.dbUser.id),
                lt(notifications.id, cursor),
              )
          : unreadOnly
            ? and(
                eq(notifications.userId, ctx.dbUser.id),
                isNull(notifications.readAt),
              )
            : eq(notifications.userId, ctx.dbUser.id);

      const rows = await ctx.db.query.notifications.findMany({
        where: whereClause,
        orderBy: [desc(notifications.createdAt)],
        limit: limit + 1,
      });

      const hasMore = rows.length > limit;
      const list = hasMore ? rows.slice(0, limit) : rows;
      const nextCursor = hasMore ? list[list.length - 1]?.id : undefined;

      return { items: list, nextCursor };
    }),

  getUnreadCount: protectedProcedureWithUser.query(async ({ ctx }) => {
    const rows = await ctx.db
      .select({ id: notifications.id })
      .from(notifications)
      .where(
        and(
          eq(notifications.userId, ctx.dbUser.id),
          isNull(notifications.readAt),
        ),
      );
    return { count: rows.length };
  }),

  markRead: protectedProcedureWithUser
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(notifications)
        .set({ readAt: new Date() })
        .where(eq(notifications.id, input.id))
        .where(eq(notifications.userId, ctx.dbUser.id));
      return { ok: true };
    }),

  markAllRead: protectedProcedureWithUser.mutation(async ({ ctx }) => {
    await ctx.db
      .update(notifications)
      .set({ readAt: new Date() })
      .where(
        and(
          eq(notifications.userId, ctx.dbUser.id),
          isNull(notifications.readAt),
        ),
      );
    return { ok: true };
  }),
});
