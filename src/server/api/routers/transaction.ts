import { z } from "zod";
import { and, desc, eq, gte, ilike, lte } from "drizzle-orm";
import { UTApi } from "uploadthing/server";

import { createTRPCRouter, protectedProcedureWithUser } from "@/server/api/trpc";
import { cards, merchants, transactions } from "@/server/db/schema";
import {
  normalizeCsvRow,
  parseAmountToCents,
  parseCsv,
  parseCsvDate,
} from "@/lib/parse-csv";

export const transactionRouter = createTRPCRouter({
  list: protectedProcedureWithUser
    .input(
      z.object({
        status: z.enum(["pending", "completed", "declined"]).optional(),
        category: z.string().optional(),
        search: z.string().optional(),
        from: z.date().optional(),
        to: z.date().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const conditions = [eq(transactions.userId, ctx.dbUser.id)];
      if (input.status) conditions.push(eq(transactions.status, input.status));
      if (input.category)
        conditions.push(eq(transactions.category, input.category));
      if (input.from)
        conditions.push(gte(transactions.transactionDate, input.from));
      if (input.to)
        conditions.push(lte(transactions.transactionDate, input.to));
      if (input.search)
        conditions.push(ilike(transactions.memo, `%${input.search}%`));

      return ctx.db.query.transactions.findMany({
        where: and(...conditions),
        orderBy: [desc(transactions.transactionDate)],
        with: {
          merchant: true,
          user: true,
          card: true,
        },
      });
    }),

  getById: protectedProcedureWithUser
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.query.transactions.findFirst({
        where: and(
          eq(transactions.id, input.id),
          eq(transactions.userId, ctx.dbUser.id),
        ),
        with: {
          merchant: true,
          user: true,
          card: true,
        },
      });
    }),

  updateMemo: protectedProcedureWithUser
    .input(z.object({ id: z.number(), memo: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(transactions)
        .set({ memo: input.memo })
        .where(
          and(
            eq(transactions.id, input.id),
            eq(transactions.userId, ctx.dbUser.id),
          ),
        );
    }),

  /** Import transactions from a CSV file uploaded to UploadThing. */
  importFromCsv: protectedProcedureWithUser
    .input(
      z.object({
        fileKey: z.string().min(1),
        cardId: z.number().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const utapi = new UTApi();
      const { data } = await utapi.getFileUrls(input.fileKey);
      const url = data?.[0]?.url ?? null;
      if (!url) {
        throw new Error("Could not get file URL from UploadThing");
      }
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`Failed to fetch CSV: ${res.status}`);
      }
      const csvText = await res.text();
      const rows = parseCsv(csvText);

      const uid = ctx.dbUser.id;

      let cardId = input.cardId;
      if (cardId == null) {
        const [firstCard] = await ctx.db
          .select()
          .from(cards)
          .where(
            and(eq(cards.userId, uid), eq(cards.status, "active")),
          )
          .limit(1);
        if (!firstCard) {
          throw new Error("No active card found. Create a card or specify cardId.");
        }
        cardId = firstCard.id;
      } else {
        const [card] = await ctx.db
          .select()
          .from(cards)
          .where(
            and(
              eq(cards.id, cardId),
              eq(cards.userId, uid),
            ),
          )
          .limit(1);
        if (!card) {
          throw new Error("Card not found or access denied.");
        }
      }

      const inserted: number[] = [];
      for (const row of rows) {
        const { date, amount, merchant, category, memo } = normalizeCsvRow(row);
        if (!merchant?.trim()) continue;
        const amountCents = parseAmountToCents(amount);
        if (amountCents <= 0) continue;
        const transactionDate = parseCsvDate(date) ?? new Date();

        let [existingMerchant] = await ctx.db
          .select()
          .from(merchants)
          .where(eq(merchants.name, merchant.trim().slice(0, 256)))
          .limit(1);
        if (!existingMerchant) {
          const [created] = await ctx.db
            .insert(merchants)
            .values({
              name: merchant.trim().slice(0, 256),
              category: (category || "Uncategorized").slice(0, 128),
            })
            .returning();
          existingMerchant = created!;
        }

        const [tx] = await ctx.db
          .insert(transactions)
          .values({
            cardId,
            merchantId: existingMerchant.id,
            userId: uid,
            amount: amountCents,
            category: (category || "Uncategorized").slice(0, 128),
            memo: memo?.slice(0, 512) ?? null,
            transactionDate,
            status: "completed",
          })
          .returning();
        if (tx) inserted.push(tx.id);
      }

      return { imported: inserted.length, ids: inserted };
    }),
});
