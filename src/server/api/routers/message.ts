import { z } from "zod";
import { and, desc, eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

import { createTRPCRouter, protectedProcedureWithUser } from "@/server/api/trpc";
import { inArray } from "drizzle-orm";
import {
  conversations,
  conversationParticipants,
  messages,
  users,
  organizationMembers,
} from "@/server/db/schema";
import { createNotification } from "@/server/notifications";

export const messageRouter = createTRPCRouter({
  /** Users the current user can start a conversation with (members of orgs they belong to). */
  getMessageableUsers: protectedProcedureWithUser
    .input(z.object({ orgId: z.number().optional() }).optional())
    .query(async ({ ctx, input }) => {
      if (input?.orgId != null) {
        const member = await ctx.db.query.organizationMembers.findFirst({
          where: and(
            eq(organizationMembers.organizationId, input.orgId),
            eq(organizationMembers.userId, ctx.dbUser.id),
          ),
        });
        if (!member) return [];
        const members = await ctx.db.query.organizationMembers.findMany({
          where: eq(organizationMembers.organizationId, input.orgId),
          with: { user: true },
        });
        return members
          .filter((m) => m.userId !== ctx.dbUser.id)
          .map((m) => ({ id: m.user.id, name: m.user.name, email: m.user.email }));
      }
      const myMemberships = await ctx.db.query.organizationMembers.findMany({
        where: eq(organizationMembers.userId, ctx.dbUser.id),
      });
      const orgIds = myMemberships.map((m) => m.organizationId);
      if (orgIds.length === 0) return [];
      const members = await ctx.db.query.organizationMembers.findMany({
        where: inArray(organizationMembers.organizationId, orgIds),
        with: { user: true },
      });
      const byId = new Map(
        members
          .filter((m) => m.userId !== ctx.dbUser.id)
          .map((m) => [m.user.id, { id: m.user.id, name: m.user.name, email: m.user.email }] as const),
      );
      return [...byId.values()];
    }),

  /** List conversations for the current user, with last message and other participant info. */
  listConversations: protectedProcedureWithUser.query(async ({ ctx }) => {
    const myParticipations = await ctx.db.query.conversationParticipants.findMany({
      where: eq(conversationParticipants.userId, ctx.dbUser.id),
      with: { conversation: true },
      orderBy: [desc(conversationParticipants.conversationId)],
    });

    const result = await Promise.all(
      myParticipations.map(async (p) => {
        const conv = p.conversation;
        const others = await ctx.db.query.conversationParticipants.findMany({
          where: eq(conversationParticipants.conversationId, conv.id),
          with: { user: true },
        });
        const otherUsers = others.filter((o) => o.userId !== ctx.dbUser.id);
        const lastMsg = await ctx.db.query.messages.findFirst({
          where: eq(messages.conversationId, conv.id),
          orderBy: [desc(messages.createdAt)],
          with: { sender: true },
        });
        return {
          id: conv.id,
          lastMessageAt: conv.lastMessageAt,
          otherParticipants: otherUsers.map((o) => ({
            id: o.user.id,
            name: o.user.name,
            email: o.user.email,
          })),
          lastMessage: lastMsg
            ? {
                id: lastMsg.id,
                body: lastMsg.body,
                createdAt: lastMsg.createdAt,
                senderName: lastMsg.sender.name,
              }
            : null,
        };
      }),
    );

    result.sort((a, b) => {
      const aTime = a.lastMessageAt?.getTime() ?? 0;
      const bTime = b.lastMessageAt?.getTime() ?? 0;
      return bTime - aTime;
    });
    return result;
  }),

  /** Get a single conversation with messages (paginated). */
  getConversation: protectedProcedureWithUser
    .input(
      z.object({
        conversationId: z.number(),
        limit: z.number().min(1).max(100).default(50),
        cursor: z.number().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const isParticipant = await ctx.db.query.conversationParticipants.findFirst({
        where: and(
          eq(conversationParticipants.conversationId, input.conversationId),
          eq(conversationParticipants.userId, ctx.dbUser.id),
        ),
      });
      if (!isParticipant) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not in this conversation" });
      }

      const msgs = await ctx.db.query.messages.findMany({
        where: eq(messages.conversationId, input.conversationId),
        orderBy: [desc(messages.createdAt)],
        limit: input.limit + 1,
        with: { sender: true },
      });

      const hasMore = msgs.length > input.limit;
      const list = hasMore ? msgs.slice(0, input.limit) : msgs;
      const nextCursor = hasMore ? list[list.length - 1]?.id : undefined;

      const others = await ctx.db.query.conversationParticipants.findMany({
        where: eq(conversationParticipants.conversationId, input.conversationId),
        with: { user: true },
      });
      const otherUsers = others.filter((o) => o.userId !== ctx.dbUser.id);

      return {
        conversationId: input.conversationId,
        otherParticipants: otherUsers.map((o) => ({
          id: o.user.id,
          name: o.user.name,
          email: o.user.email,
        })),
        messages: list.reverse(),
        nextCursor,
      };
    }),

  /** Get or create a direct conversation with another user. */
  getOrCreateDirectConversation: protectedProcedureWithUser
    .input(z.object({ otherUserId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      if (input.otherUserId === ctx.dbUser.id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot message yourself",
        });
      }

      const myConvs = await ctx.db.query.conversationParticipants.findMany({
        where: eq(conversationParticipants.userId, ctx.dbUser.id),
        with: { conversation: true },
      });

      for (const p of myConvs) {
        const participants = await ctx.db.query.conversationParticipants.findMany({
          where: eq(conversationParticipants.conversationId, p.conversationId),
        });
        if (
          participants.length === 2 &&
          participants.some((x) => x.userId === input.otherUserId)
        ) {
          return { conversationId: p.conversationId };
        }
      }

      const [conv] = await ctx.db
        .insert(conversations)
        .values({})
        .returning();
      if (!conv) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      await ctx.db.insert(conversationParticipants).values([
        { conversationId: conv.id, userId: ctx.dbUser.id },
        { conversationId: conv.id, userId: input.otherUserId },
      ]);

      return { conversationId: conv.id };
    }),

  sendMessage: protectedProcedureWithUser
    .input(
      z.object({
        conversationId: z.number(),
        body: z.string().min(1).max(10000),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const participants = await ctx.db.query.conversationParticipants.findMany({
        where: eq(conversationParticipants.conversationId, input.conversationId),
      });
      const isInConv = participants.some((p) => p.userId === ctx.dbUser.id);
      if (!isInConv) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not in this conversation" });
      }

      const now = new Date();
      const [msg] = await ctx.db
        .insert(messages)
        .values({
          conversationId: input.conversationId,
          senderId: ctx.dbUser.id,
          body: input.body,
        })
        .returning();
      if (!msg) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      await ctx.db
        .update(conversations)
        .set({ lastMessageAt: now })
        .where(eq(conversations.id, input.conversationId));

      const recipientIds = participants
        .filter((p) => p.userId !== ctx.dbUser.id)
        .map((p) => p.userId);

      const sender = await ctx.db.query.users.findFirst({
        where: eq(users.id, ctx.dbUser.id),
      });

      for (const recipientId of recipientIds) {
        await createNotification(ctx.db, {
          userId: recipientId,
          type: "message",
          title: `New message from ${sender?.name ?? "Someone"}`,
          body: input.body.slice(0, 200),
          link: `/messages?conversation=${input.conversationId}`,
        });
      }

      return {
        id: msg.id,
        conversationId: msg.conversationId,
        senderId: msg.senderId,
        body: msg.body,
        createdAt: msg.createdAt,
      };
    }),

  /** Mark conversation as read (update lastReadAt for current user). */
  markConversationRead: protectedProcedureWithUser
    .input(z.object({ conversationId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(conversationParticipants)
        .set({ lastReadAt: new Date() })
        .where(
          and(
            eq(conversationParticipants.conversationId, input.conversationId),
            eq(conversationParticipants.userId, ctx.dbUser.id),
          ),
        );
      return { ok: true };
    }),
});
