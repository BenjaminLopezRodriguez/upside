import { and, desc, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { subMonths } from "date-fns";
import { DynamicStructuredTool } from "@langchain/core/tools";

import type { AppDb } from "@/server/db";
import {
  bills,
  cards,
  organizationMembers,
  organizations,
  reimbursements,
  transactions,
  users,
} from "@/server/db/schema";
import { computeSpendTrends } from "@/lib/deltra-trends";
import type { TransactionForTrend } from "@/lib/deltra-trends";

export type DeltraToolsContext = {
  db: AppDb;
  userId: number;
};

function formatCents(cents: number) {
  return (cents / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/** Convert dollars to cents for storage (amounts in DB are in cents). */
function dollarsToCents(dollars: number): number {
  return Math.round(dollars * 100);
}

/**
 * Creates a LangChain tools library: read-only access to the user's schema
 * plus complementary actions (update memo, freeze/unfreeze card, mark bill paid,
 * create bill/reimbursement, approve/reject reimbursement).
 */
export function createDeltraTools(ctx: DeltraToolsContext) {
  const { db, userId } = ctx;

  const tools: DynamicStructuredTool[] = [
    // ─── Spend & trends ─────────────────────────────────────────────────────
    new DynamicStructuredTool({
      name: "get_spend_trends",
      description:
        "Get aggregated spend and trend data: totals by category, by month, month-over-month change, top merchants. Use for questions about spending patterns, trends, or predictions.",
      schema: z.object({}),
      func: async () => {
        const since = subMonths(new Date(), 6);
        const txRows = await db.query.transactions.findMany({
          where: eq(transactions.userId, userId),
          orderBy: [desc(transactions.transactionDate)],
          limit: 2000,
          with: { merchant: true },
        });
        const forTrend: TransactionForTrend[] = txRows
          .filter((t) => new Date(t.transactionDate) >= since)
          .map((t) => ({
            amount: t.amount,
            category: t.category,
            transactionDate: t.transactionDate,
            merchant: t.merchant ? { name: t.merchant.name } : null,
          }));
        const trends = computeSpendTrends(forTrend, { windowMonths: 6 });
        return JSON.stringify(
          {
            summary: trends.summary,
            totalLast90DaysCents: trends.totalLast90DaysCents,
            monthOverMonthPct: trends.monthOverMonthPct,
            byCategory: trends.byCategory.slice(0, 15),
            byMonth: trends.byMonth.slice(-6),
            topMerchants: trends.topMerchants.slice(0, 10),
          },
          null,
          2
        );
      },
    }),

    new DynamicStructuredTool({
      name: "get_dashboard_summary",
      description:
        "Get high-level summary: total spend, number of pending reimbursements, active cards count, and upcoming bills total. Use for overview or 'how am I doing' questions.",
      schema: z.object({}),
      func: async () => {
        const [spend] = await db
          .select({ total: sql<number>`coalesce(sum(${transactions.amount}), 0)` })
          .from(transactions)
          .where(
            and(
              eq(transactions.userId, userId),
              eq(transactions.status, "completed")
            )
          );
        const [pendingReimb] = await db
          .select({ count: sql<number>`count(*)` })
          .from(reimbursements)
          .where(
            and(
              eq(reimbursements.userId, userId),
              eq(reimbursements.status, "pending")
            )
          );
        const [activeCards] = await db
          .select({ count: sql<number>`count(*)` })
          .from(cards)
          .where(and(eq(cards.userId, userId), eq(cards.status, "active")));
        const [upcomingBills] = await db
          .select({ total: sql<number>`coalesce(sum(${bills.amount}), 0)` })
          .from(bills)
          .where(
            and(eq(bills.userId, userId), eq(bills.status, "pending"))
          );
        return JSON.stringify({
          totalSpendCents: Number(spend?.total ?? 0),
          totalSpend: formatCents(Number(spend?.total ?? 0)),
          pendingReimbursementsCount: Number(pendingReimb?.count ?? 0),
          activeCardsCount: Number(activeCards?.count ?? 0),
          upcomingBillsCents: Number(upcomingBills?.total ?? 0),
          upcomingBills: formatCents(Number(upcomingBills?.total ?? 0)),
        });
      },
    }),

    new DynamicStructuredTool({
      name: "get_spend_by_category",
      description:
        "Get spend totals grouped by category. Use when the user asks about categories or where they spend.",
      schema: z.object({}),
      func: async () => {
        const result = await db
          .select({
            category: transactions.category,
            total: sql<number>`sum(${transactions.amount})`,
          })
          .from(transactions)
          .where(
            and(
              eq(transactions.userId, userId),
              eq(transactions.status, "completed")
            )
          )
          .groupBy(transactions.category)
          .orderBy(sql`sum(${transactions.amount}) desc`);
        return JSON.stringify(
          result.map((r) => ({
            category: r.category,
            totalCents: Number(r.total ?? 0),
            total: formatCents(Number(r.total ?? 0)),
          }))
        );
      },
    }),

    // ─── Transactions ───────────────────────────────────────────────────────
    new DynamicStructuredTool({
      name: "list_transactions",
      description:
        "List the user's transactions. Optional filters: category, status (pending/completed/declined), limit (default 20, max 100). Returns date, merchant, amount, category, memo.",
      schema: z.object({
        category: z.string().optional(),
        status: z.enum(["pending", "completed", "declined"]).optional(),
        limit: z.number().min(1).max(100).optional(),
      }),
      func: async (input) => {
        const limit = input.limit ?? 20;
        const conditions = [eq(transactions.userId, userId)];
        if (input.category) conditions.push(eq(transactions.category, input.category));
        if (input.status) conditions.push(eq(transactions.status, input.status));
        const rows = await db.query.transactions.findMany({
          where: and(...conditions),
          orderBy: [desc(transactions.transactionDate)],
          limit,
          with: { merchant: true },
        });
        return JSON.stringify(
          rows.map((t) => ({
            id: t.id,
            date: t.transactionDate,
            merchant: t.merchant?.name ?? "Unknown",
            amountCents: t.amount,
            amount: formatCents(t.amount),
            category: t.category,
            status: t.status,
            memo: t.memo,
          }))
        );
      },
    }),

    new DynamicStructuredTool({
      name: "get_recent_transactions",
      description: "Get the most recent transactions (default 10). Use for 'latest' or 'recent' spend.",
      schema: z.object({
        limit: z.number().min(1).max(50).optional(),
      }),
      func: async (input) => {
        const limit = input.limit ?? 10;
        const rows = await db.query.transactions.findMany({
          where: eq(transactions.userId, userId),
          orderBy: [desc(transactions.transactionDate)],
          limit,
          with: { merchant: true },
        });
        return JSON.stringify(
          rows.map((t) => ({
            date: t.transactionDate,
            merchant: t.merchant?.name ?? "Unknown",
            amount: formatCents(t.amount),
            category: t.category,
            memo: t.memo,
          }))
        );
      },
    }),

    // ─── Cards ───────────────────────────────────────────────────────────────
    new DynamicStructuredTool({
      name: "list_cards",
      description:
        "List the user's cards: last4, name, type (virtual/physical), status (active/frozen/cancelled), spend limit and current spend.",
      schema: z.object({}),
      func: async () => {
        const rows = await db.query.cards.findMany({
          where: eq(cards.userId, userId),
        });
        return JSON.stringify(
          rows.map((c) => ({
            id: c.id,
            last4: c.last4,
            cardName: c.cardName,
            type: c.type,
            status: c.status,
            spendLimitCents: c.spendLimit,
            spendLimit: formatCents(c.spendLimit),
            currentSpendCents: c.currentSpend,
            currentSpend: formatCents(c.currentSpend),
          }))
        );
      },
    }),

    // ─── Bills ───────────────────────────────────────────────────────────────
    new DynamicStructuredTool({
      name: "list_bills",
      description:
        "List the user's bills: vendor, amount, status (draft/pending/scheduled/paid), due date, category.",
      schema: z.object({
        status: z.enum(["draft", "pending", "scheduled", "paid"]).optional(),
      }),
      func: async (input) => {
        const conditions = [eq(bills.userId, userId)];
        if (input.status) conditions.push(eq(bills.status, input.status));
        const rows = await db.query.bills.findMany({
          where: and(...conditions),
        });
        return JSON.stringify(
          rows.map((b) => ({
            id: b.id,
            vendorName: b.vendorName,
            amountCents: b.amount,
            amount: formatCents(b.amount),
            status: b.status,
            dueDate: b.dueDate,
            category: b.category,
            paidAt: b.paidAt,
          }))
        );
      },
    }),

    // ─── Reimbursements ─────────────────────────────────────────────────────
    new DynamicStructuredTool({
      name: "list_reimbursements",
      description:
        "List the user's reimbursements: amount, description, status (pending/approved/rejected), category, submitted date.",
      schema: z.object({
        status: z.enum(["pending", "approved", "rejected"]).optional(),
      }),
      func: async (input) => {
        const conditions = [eq(reimbursements.userId, userId)];
        if (input.status) conditions.push(eq(reimbursements.status, input.status));
        const rows = await db.query.reimbursements.findMany({
          where: and(...conditions),
        });
        return JSON.stringify(
          rows.map((r) => ({
            id: r.id,
            amountCents: r.amount,
            amount: formatCents(r.amount),
            description: r.description,
            status: r.status,
            category: r.category,
            submittedAt: r.submittedAt,
            reviewedAt: r.reviewedAt,
          }))
        );
      },
    }),

    // ─── User profile (safe fields only) ─────────────────────────────────────
    new DynamicStructuredTool({
      name: "get_user_profile",
      description:
        "Get the current user's profile: name and email. Use when the user asks who they are or for account info.",
      schema: z.object({}),
      func: async () => {
        const [u] = await db
          .select({ name: users.name, email: users.email })
          .from(users)
          .where(eq(users.id, userId))
          .limit(1);
        return JSON.stringify(u ?? { name: null, email: null });
      },
    }),

    // ─── Organizations (user's orgs and memberships) ───────────────────────
    new DynamicStructuredTool({
      name: "list_my_organizations",
      description:
        "List organizations the user belongs to: name, slug, type (personal/corporate), role (owner/member).",
      schema: z.object({}),
      func: async () => {
        const memberships = await db.query.organizationMembers.findMany({
          where: eq(organizationMembers.userId, userId),
          with: { organization: true },
        });
        return JSON.stringify(
          memberships
            .filter((m) => m.organization != null)
            .map((m) => ({
              orgId: m.organization!.id,
              name: m.organization!.name,
              slug: m.organization!.slug,
              type: m.organization!.type,
              role: m.role,
            }))
        );
      },
    }),

    // ─── Actions (complimentary mutations the assistant can perform) ────────
    new DynamicStructuredTool({
      name: "update_transaction_memo",
      description:
        "Update the memo/note on one of the user's transactions. Use when the user asks to add a note, label, or reminder to a transaction. Requires transaction id (from list_transactions) and the new memo text (max 512 chars).",
      schema: z.object({
        transactionId: z.number().describe("The transaction id from list_transactions"),
        memo: z.string().max(512).describe("The note or label to set on the transaction"),
      }),
      func: async (input) => {
        const [row] = await db
          .update(transactions)
          .set({ memo: input.memo.slice(0, 512) })
          .where(
            and(
              eq(transactions.id, input.transactionId),
              eq(transactions.userId, userId)
            )
          )
          .returning({ id: transactions.id });
        if (!row) {
          return JSON.stringify({ success: false, error: "Transaction not found or not yours." });
        }
        return JSON.stringify({ success: true, message: "Memo updated." });
      },
    }),

    new DynamicStructuredTool({
      name: "freeze_card",
      description:
        "Freeze a card so it cannot be used for new purchases. Use when the user says to freeze a card, lock it, or pause it. Requires the card id (from list_cards).",
      schema: z.object({
        cardId: z.number().describe("The card id from list_cards"),
      }),
      func: async (input) => {
        const [row] = await db
          .update(cards)
          .set({ status: "frozen" })
          .where(
            and(eq(cards.id, input.cardId), eq(cards.userId, userId))
          )
          .returning({ id: cards.id });
        if (!row) {
          return JSON.stringify({ success: false, error: "Card not found or not yours." });
        }
        return JSON.stringify({ success: true, message: "Card frozen." });
      },
    }),

    new DynamicStructuredTool({
      name: "unfreeze_card",
      description:
        "Unfreeze a card so it can be used again. Use when the user says to unfreeze, unlock, or resume a card. Requires the card id (from list_cards).",
      schema: z.object({
        cardId: z.number().describe("The card id from list_cards"),
      }),
      func: async (input) => {
        const [row] = await db
          .update(cards)
          .set({ status: "active" })
          .where(
            and(eq(cards.id, input.cardId), eq(cards.userId, userId))
          )
          .returning({ id: cards.id });
        if (!row) {
          return JSON.stringify({ success: false, error: "Card not found or not yours." });
        }
        return JSON.stringify({ success: true, message: "Card unfrozen." });
      },
    }),

    new DynamicStructuredTool({
      name: "mark_bill_paid",
      description:
        "Mark a bill as paid. Use when the user says they paid a bill or to record that a bill was paid. Requires the bill id (from list_bills).",
      schema: z.object({
        billId: z.number().describe("The bill id from list_bills"),
      }),
      func: async (input) => {
        const [row] = await db
          .update(bills)
          .set({ status: "paid", paidAt: new Date() })
          .where(
            and(eq(bills.id, input.billId), eq(bills.userId, userId))
          )
          .returning({ id: bills.id });
        if (!row) {
          return JSON.stringify({ success: false, error: "Bill not found or not yours." });
        }
        return JSON.stringify({ success: true, message: "Bill marked as paid." });
      },
    }),

    new DynamicStructuredTool({
      name: "create_bill",
      description:
        "Create a new bill for the user. Use when the user wants to add a bill, track a vendor payment, or record an upcoming bill. Amount is in dollars (e.g. 99.50). dueDate is ISO date string (YYYY-MM-DD).",
      schema: z.object({
        vendorName: z.string().min(1).describe("Name of the vendor or payee"),
        amountDollars: z.number().positive().describe("Amount in dollars (e.g. 99.50)"),
        dueDate: z.string().describe("Due date as YYYY-MM-DD"),
        category: z.string().min(1).describe("Category for the bill"),
        invoiceNumber: z.string().optional().describe("Optional invoice or reference number"),
      }),
      func: async (input) => {
        const due = new Date(input.dueDate);
        if (Number.isNaN(due.getTime())) {
          return JSON.stringify({ success: false, error: "Invalid due date. Use YYYY-MM-DD." });
        }
        const amountCents = dollarsToCents(input.amountDollars);
        const [bill] = await db
          .insert(bills)
          .values({
            userId,
            vendorName: input.vendorName.slice(0, 256),
            amount: amountCents,
            dueDate: due,
            category: input.category.slice(0, 128),
            status: "pending",
            invoiceNumber: input.invoiceNumber?.slice(0, 128),
          })
          .returning({ id: bills.id, vendorName: bills.vendorName, amount: bills.amount, dueDate: bills.dueDate });
        if (!bill) {
          return JSON.stringify({ success: false, error: "Failed to create bill." });
        }
        return JSON.stringify({
          success: true,
          message: "Bill created.",
          bill: { id: bill.id, vendorName: bill.vendorName, amount: formatCents(bill.amount), dueDate: bill.dueDate },
        });
      },
    }),

    new DynamicStructuredTool({
      name: "create_reimbursement",
      description:
        "Submit a reimbursement request for the user. Use when the user wants to submit or create a reimbursement. Amount is in dollars. Optionally pass orgId (from list_my_organizations) to submit to an organization; omit for personal.",
      schema: z.object({
        amountDollars: z.number().positive().describe("Amount in dollars to be reimbursed"),
        description: z.string().min(1).describe("Description of the expense"),
        category: z.string().min(1).describe("Category for the reimbursement"),
        orgId: z.number().optional().describe("Organization id from list_my_organizations if submitting to an org"),
      }),
      func: async (input) => {
        if (input.orgId != null) {
          const membership = await db.query.organizationMembers.findFirst({
            where: and(
              eq(organizationMembers.organizationId, input.orgId),
              eq(organizationMembers.userId, userId)
            ),
          });
          if (!membership) {
            return JSON.stringify({ success: false, error: "Not a member of this organization." });
          }
          if (!membership.canSubmitReimbursements) {
            return JSON.stringify({ success: false, error: "You cannot submit reimbursements for this organization." });
          }
        }
        const amountCents = dollarsToCents(input.amountDollars);
        const [reimb] = await db
          .insert(reimbursements)
          .values({
            userId,
            amount: amountCents,
            description: input.description.slice(0, 512),
            category: input.category.slice(0, 128),
            status: "pending",
            ...(input.orgId != null ? { orgId: input.orgId } : {}),
          })
          .returning({ id: reimbursements.id, amount: reimbursements.amount, description: reimbursements.description });
        if (!reimb) {
          return JSON.stringify({ success: false, error: "Failed to create reimbursement." });
        }
        return JSON.stringify({
          success: true,
          message: "Reimbursement submitted.",
          reimbursement: { id: reimb.id, amount: formatCents(reimb.amount), description: reimb.description },
        });
      },
    }),

    new DynamicStructuredTool({
      name: "approve_reimbursement",
      description:
        "Approve a reimbursement request. Only call if the user is the organization owner and wants to approve a member's reimbursement. Requires reimbursement id and orgId (from list_my_organizations where role is owner).",
      schema: z.object({
        reimbursementId: z.number().describe("The reimbursement id to approve"),
        orgId: z.number().describe("Organization id (user must be owner)"),
      }),
      func: async (input) => {
        const org = await db.query.organizations.findFirst({
          where: and(
            eq(organizations.id, input.orgId),
            eq(organizations.ownerId, userId)
          ),
        });
        if (!org) {
          return JSON.stringify({ success: false, error: "Organization not found or you are not the owner." });
        }
        const [row] = await db
          .update(reimbursements)
          .set({ status: "approved", reviewedAt: new Date() })
          .where(
            and(
              eq(reimbursements.id, input.reimbursementId),
              eq(reimbursements.orgId, input.orgId)
            )
          )
          .returning({ id: reimbursements.id });
        if (!row) {
          return JSON.stringify({ success: false, error: "Reimbursement not found in this organization." });
        }
        return JSON.stringify({ success: true, message: "Reimbursement approved." });
      },
    }),

    new DynamicStructuredTool({
      name: "reject_reimbursement",
      description:
        "Reject a reimbursement request. Only call if the user is the organization owner and wants to reject a member's reimbursement. Requires reimbursement id and orgId.",
      schema: z.object({
        reimbursementId: z.number().describe("The reimbursement id to reject"),
        orgId: z.number().describe("Organization id (user must be owner)"),
      }),
      func: async (input) => {
        const org = await db.query.organizations.findFirst({
          where: and(
            eq(organizations.id, input.orgId),
            eq(organizations.ownerId, userId)
          ),
        });
        if (!org) {
          return JSON.stringify({ success: false, error: "Organization not found or you are not the owner." });
        }
        const [row] = await db
          .update(reimbursements)
          .set({ status: "rejected", reviewedAt: new Date() })
          .where(
            and(
              eq(reimbursements.id, input.reimbursementId),
              eq(reimbursements.orgId, input.orgId)
            )
          )
          .returning({ id: reimbursements.id });
        if (!row) {
          return JSON.stringify({ success: false, error: "Reimbursement not found in this organization." });
        }
        return JSON.stringify({ success: true, message: "Reimbursement rejected." });
      },
    }),
  ];

  return tools;
}
