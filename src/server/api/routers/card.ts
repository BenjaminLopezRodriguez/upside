import { z } from "zod";
import { and, desc, eq, inArray, isNotNull } from "drizzle-orm";

import { createTRPCRouter, protectedProcedureWithUser } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import {
  cards,
  cardRequests,
  organizations,
  organizationMembers,
  transactions,
} from "@/server/db/schema";
import {
  createLithicCard,
  provisionCardForWallet,
  isLithicConfigured,
  webProvisionApplePay,
  webProvisionGooglePay,
} from "@/server/lithic";

export const cardRouter = createTRPCRouter({
  list: protectedProcedureWithUser.query(async ({ ctx }) => {
    return ctx.db.query.cards.findMany({
      where: eq(cards.userId, ctx.dbUser.id),
      with: { user: true },
      orderBy: (cards, { desc }) => [desc(cards.createdAt)],
    });
  }),

  /** Cards issued to the current user by organizations (for personal Cards tab). */
  listIssuedToMe: protectedProcedureWithUser.query(async ({ ctx }) => {
    return ctx.db.query.cards.findMany({
      where: and(
        eq(cards.userId, ctx.dbUser.id),
        isNotNull(cards.organizationId),
      ),
      with: { user: true, organization: true },
      orderBy: (cards, { desc }) => [desc(cards.createdAt)],
    });
  }),

  getById: protectedProcedureWithUser
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.query.cards.findFirst({
        where: and(eq(cards.id, input.id), eq(cards.userId, ctx.dbUser.id)),
        with: {
          user: true,
          transactions: {
            limit: 7,
            orderBy: (tx, { desc: descOp }) => [descOp(tx.transactionDate)],
            with: { merchant: true },
          },
        },
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
      let last4: string;
      let lithicCardToken: string | null = null;

      if (isLithicConfigured()) {
        const lithicResult = await createLithicCard({
          type: input.type === "physical" ? "PHYSICAL" : "VIRTUAL",
          spendLimitCents: input.spendLimit,
          memo: input.cardName,
        });
        if (lithicResult) {
          last4 = lithicResult.lastFour;
          lithicCardToken = lithicResult.token;
        } else {
          last4 = String(Math.floor(1000 + Math.random() * 9000));
        }
      } else {
        last4 = String(Math.floor(1000 + Math.random() * 9000));
      }

      const [card] = await ctx.db
        .insert(cards)
        .values({
          ...rest,
          userId: ctx.dbUser.id,
          last4,
          cardColor,
          logoUrl,
          material,
          lithicCardToken,
        })
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

  /** Permanently delete a card and its transactions. */
  delete: protectedProcedureWithUser
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const card = await ctx.db.query.cards.findFirst({
        where: and(
          eq(cards.id, input.id),
          eq(cards.userId, ctx.dbUser.id),
        ),
      });
      if (!card) throw new TRPCError({ code: "NOT_FOUND", message: "Card not found" });
      await ctx.db
        .delete(transactions)
        .where(eq(transactions.cardId, input.id));
      await ctx.db
        .delete(cards)
        .where(and(eq(cards.id, input.id), eq(cards.userId, ctx.dbUser.id)));
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

      let last4: string;
      let lithicCardToken: string | null = null;

      if (isLithicConfigured()) {
        const lithicResult = await createLithicCard({
          type: input.type === "physical" ? "PHYSICAL" : "VIRTUAL",
          spendLimitCents: input.spendLimit,
          memo: input.cardName,
        });
        if (lithicResult) {
          last4 = lithicResult.lastFour;
          lithicCardToken = lithicResult.token;
        } else {
          last4 = String(Math.floor(1000 + Math.random() * 9000));
        }
      } else {
        last4 = String(Math.floor(1000 + Math.random() * 9000));
      }

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
          organizationId: input.orgId,
          last4,
          lithicCardToken,
        })
        .returning();
      return card;
    }),

  /**
   * Get provisioning payload for adding this card to Apple Pay or Google Pay.
   * Only available for cards created with Lithic (lithicCardToken set).
   */
  getWalletProvisioning: protectedProcedureWithUser
    .input(
      z.object({
        cardId: z.number(),
        digitalWallet: z.enum(["APPLE_PAY", "GOOGLE_PAY"]),
      }),
    )
    .query(async ({ ctx, input }) => {
      const card = await ctx.db.query.cards.findFirst({
        where: and(
          eq(cards.id, input.cardId),
          eq(cards.userId, ctx.dbUser.id),
        ),
      });
      if (!card) throw new TRPCError({ code: "NOT_FOUND", message: "Card not found" });
      if (!card.lithicCardToken) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            "This card cannot be added to a wallet. Wallet support requires Lithic integration.",
        });
      }

      const payload = await provisionCardForWallet(
        card.lithicCardToken,
        input.digitalWallet,
      );
      if (!payload) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Lithic provisioning is not configured.",
        });
      }
      return { provisioningPayload: payload };
    }),

  /**
   * Apple Pay Web Push: returns JWS + state for Apple's initAddToAppleWallet jwsResolver.
   * Frontend loads Apple's script and passes this when Apple requests the token.
   */
  getAppleWalletWebProvision: protectedProcedureWithUser
    .input(z.object({ cardId: z.number() }))
    .query(async ({ ctx, input }) => {
      const card = await ctx.db.query.cards.findFirst({
        where: and(
          eq(cards.id, input.cardId),
          eq(cards.userId, ctx.dbUser.id),
        ),
      });
      if (!card?.lithicCardToken) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Card not found or not eligible for Apple Pay" });
      }
      const result = await webProvisionApplePay(card.lithicCardToken);
      if (!result) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Lithic not configured" });
      return result;
    }),

  /**
   * Google Pay Web Push: pass session from onSessionCreated; returns credentials for pushPaymentCredentials.
   */
  getGoogleWalletWebProvision: protectedProcedureWithUser
    .input(
      z.object({
        cardId: z.number(),
        server_session_id: z.string().uuid(),
        client_device_id: z.string().uuid(),
        client_wallet_account_id: z.string().uuid(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const card = await ctx.db.query.cards.findFirst({
        where: and(
          eq(cards.id, input.cardId),
          eq(cards.userId, ctx.dbUser.id),
        ),
      });
      if (!card?.lithicCardToken) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Card not found or not eligible for Google Pay" });
      }
      const result = await webProvisionGooglePay(card.lithicCardToken, {
        server_session_id: input.server_session_id,
        client_device_id: input.client_device_id,
        client_wallet_account_id: input.client_wallet_account_id,
      });
      if (!result) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Lithic not configured" });
      return result;
    }),

  /** Request a card from an organization. Caller must be a member (non-owner). */
  requestCardFromOrg: protectedProcedureWithUser
    .input(z.object({ organizationId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const membership = await ctx.db.query.organizationMembers.findFirst({
        where: and(
          eq(organizationMembers.organizationId, input.organizationId),
          eq(organizationMembers.userId, ctx.dbUser.id),
        ),
      });
      if (!membership) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not a member of this organization" });
      }
      if (membership.role === "owner") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Owners issue cards from the organization view" });
      }

      const existing = await ctx.db.query.cardRequests.findFirst({
        where: and(
          eq(cardRequests.userId, ctx.dbUser.id),
          eq(cardRequests.organizationId, input.organizationId),
          eq(cardRequests.status, "pending"),
        ),
      });
      if (existing) {
        throw new TRPCError({ code: "CONFLICT", message: "You already have a pending card request for this organization" });
      }

      const [req] = await ctx.db
        .insert(cardRequests)
        .values({
          userId: ctx.dbUser.id,
          organizationId: input.organizationId,
          status: "pending",
        })
        .returning();
      return req!;
    }),

  /** List current user's card requests (for personal dashboard). */
  listMyCardRequests: protectedProcedureWithUser.query(async ({ ctx }) => {
    return ctx.db.query.cardRequests.findMany({
      where: eq(cardRequests.userId, ctx.dbUser.id),
      orderBy: (cardRequests, { desc }) => [desc(cardRequests.requestedAt)],
      with: { organization: true },
    });
  }),

  /** List pending card requests for an org. Caller must own the org. */
  listCardRequestsForOrg: protectedProcedureWithUser
    .input(z.object({ orgId: z.number() }))
    .query(async ({ ctx, input }) => {
      const org = await ctx.db.query.organizations.findFirst({
        where: and(
          eq(organizations.id, input.orgId),
          eq(organizations.ownerId, ctx.dbUser.id),
        ),
      });
      if (!org) throw new TRPCError({ code: "FORBIDDEN", message: "Not an organization owner" });

      return ctx.db.query.cardRequests.findMany({
        where: and(
          eq(cardRequests.organizationId, input.orgId),
          eq(cardRequests.status, "pending"),
        ),
        orderBy: (cardRequests, { desc }) => [desc(cardRequests.requestedAt)],
        with: { user: true, organization: true },
      });
    }),

  /** Approve a card request by issuing a card to the requester. Caller must own the org. */
  approveCardRequestAndIssue: protectedProcedureWithUser
    .input(
      z.object({
        requestId: z.number(),
        cardName: z.string().min(1),
        type: z.enum(["virtual", "physical"]),
        spendLimit: z.number().min(100),
        cardColor: z.string().max(32).optional(),
        logoUrl: z.string().url().max(512).optional(),
        material: z.string().max(32).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const req = await ctx.db.query.cardRequests.findFirst({
        where: eq(cardRequests.id, input.requestId),
        with: { user: true, organization: true },
      });
      if (!req || req.status !== "pending") {
        throw new TRPCError({ code: "NOT_FOUND", message: "Request not found or already processed" });
      }

      const org = await ctx.db.query.organizations.findFirst({
        where: and(
          eq(organizations.id, req.organizationId),
          eq(organizations.ownerId, ctx.dbUser.id),
        ),
      });
      if (!org) throw new TRPCError({ code: "FORBIDDEN", message: "Not an organization owner" });

      let last4: string;
      let lithicCardToken: string | null = null;

      if (isLithicConfigured()) {
        const lithicResult = await createLithicCard({
          type: input.type === "physical" ? "PHYSICAL" : "VIRTUAL",
          spendLimitCents: input.spendLimit,
          memo: input.cardName,
        });
        if (lithicResult) {
          last4 = lithicResult.lastFour;
          lithicCardToken = lithicResult.token;
        } else {
          last4 = String(Math.floor(1000 + Math.random() * 9000));
        }
      } else {
        last4 = String(Math.floor(1000 + Math.random() * 9000));
      }

      const [card] = await ctx.db
        .insert(cards)
        .values({
          cardName: input.cardName,
          type: input.type,
          spendLimit: input.spendLimit,
          cardColor: input.cardColor,
          logoUrl: input.logoUrl,
          material: input.material,
          userId: req.userId,
          organizationId: req.organizationId,
          last4,
          lithicCardToken,
        })
        .returning();

      await ctx.db
        .update(cardRequests)
        .set({
          status: "issued",
          processedAt: new Date(),
          processedBy: ctx.dbUser.id,
        })
        .where(eq(cardRequests.id, input.requestId));

      return card!;
    }),

  /** Deny a card request. Caller must own the org. */
  denyCardRequest: protectedProcedureWithUser
    .input(z.object({ requestId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const req = await ctx.db.query.cardRequests.findFirst({
        where: eq(cardRequests.id, input.requestId),
      });
      if (!req || req.status !== "pending") {
        throw new TRPCError({ code: "NOT_FOUND", message: "Request not found or already processed" });
      }

      const org = await ctx.db.query.organizations.findFirst({
        where: and(
          eq(organizations.id, req.organizationId),
          eq(organizations.ownerId, ctx.dbUser.id),
        ),
      });
      if (!org) throw new TRPCError({ code: "FORBIDDEN", message: "Not an organization owner" });

      await ctx.db
        .update(cardRequests)
        .set({
          status: "denied",
          processedAt: new Date(),
          processedBy: ctx.dbUser.id,
        })
        .where(eq(cardRequests.id, input.requestId));
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
