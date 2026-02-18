import { index, pgTableCreator, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

/**
 * Multi-project schema — all tables prefixed with `upside_`.
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `upside_${name}`);

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

export const cardTypeEnum = pgEnum("upside_card_type", [
  "virtual",
  "physical",
]);

export const cardStatusEnum = pgEnum("upside_card_status", [
  "active",
  "frozen",
  "cancelled",
]);

export const transactionStatusEnum = pgEnum("upside_transaction_status", [
  "pending",
  "completed",
  "declined",
]);

export const reimbursementStatusEnum = pgEnum("upside_reimbursement_status", [
  "pending",
  "approved",
  "rejected",
]);

export const billStatusEnum = pgEnum("upside_bill_status", [
  "draft",
  "pending",
  "scheduled",
  "paid",
]);

// ---------------------------------------------------------------------------
// Tables
// ---------------------------------------------------------------------------

export const users = createTable(
  "user",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    name: d.varchar({ length: 256 }).notNull(),
    email: d.varchar({ length: 256 }).notNull().unique(),
    role: d.varchar({ length: 64 }).notNull().default("employee"),
    department: d.varchar({ length: 128 }).notNull().default("General"),
    avatarUrl: d.varchar({ length: 512 }),
    createdAt: d
      .timestamp({ withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
  }),
  (t) => [index("user_email_idx").on(t.email)],
);

export const cards = createTable(
  "card",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    userId: d
      .integer()
      .notNull()
      .references(() => users.id),
    last4: d.varchar({ length: 4 }).notNull(),
    cardName: d.varchar({ length: 256 }).notNull(),
    type: cardTypeEnum().notNull().default("virtual"),
    status: cardStatusEnum().notNull().default("active"),
    spendLimit: d.integer().notNull().default(500000),
    currentSpend: d.integer().notNull().default(0),
    createdAt: d
      .timestamp({ withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
  }),
  (t) => [index("card_user_idx").on(t.userId)],
);

export const merchants = createTable("merchant", (d) => ({
  id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
  name: d.varchar({ length: 256 }).notNull(),
  category: d.varchar({ length: 128 }).notNull(),
  logoUrl: d.varchar({ length: 512 }),
}));

export const transactions = createTable(
  "transaction",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    cardId: d
      .integer()
      .notNull()
      .references(() => cards.id),
    merchantId: d
      .integer()
      .notNull()
      .references(() => merchants.id),
    userId: d
      .integer()
      .notNull()
      .references(() => users.id),
    amount: d.integer().notNull(),
    currency: d.varchar({ length: 3 }).notNull().default("USD"),
    status: transactionStatusEnum().notNull().default("completed"),
    category: d.varchar({ length: 128 }).notNull(),
    memo: d.varchar({ length: 512 }),
    receiptUrl: d.varchar({ length: 512 }),
    transactionDate: d
      .timestamp({ withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
  }),
  (t) => [
    index("tx_user_idx").on(t.userId),
    index("tx_card_idx").on(t.cardId),
    index("tx_date_idx").on(t.transactionDate),
  ],
);

export const reimbursements = createTable(
  "reimbursement",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    userId: d
      .integer()
      .notNull()
      .references(() => users.id),
    amount: d.integer().notNull(),
    description: d.varchar({ length: 512 }).notNull(),
    status: reimbursementStatusEnum().notNull().default("pending"),
    category: d.varchar({ length: 128 }).notNull(),
    receiptUrl: d.varchar({ length: 512 }),
    submittedAt: d
      .timestamp({ withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
    reviewedAt: d.timestamp({ withTimezone: true }),
  }),
  (t) => [index("reimb_user_idx").on(t.userId)],
);

export const bills = createTable(
  "bill",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    vendorName: d.varchar({ length: 256 }).notNull(),
    amount: d.integer().notNull(),
    status: billStatusEnum().notNull().default("pending"),
    dueDate: d.timestamp({ withTimezone: true }).notNull(),
    invoiceNumber: d.varchar({ length: 128 }),
    category: d.varchar({ length: 128 }).notNull(),
    paidAt: d.timestamp({ withTimezone: true }),
    createdAt: d
      .timestamp({ withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
  }),
  (t) => [index("bill_status_idx").on(t.status)],
);

// ---------------------------------------------------------------------------
// Relations
// ---------------------------------------------------------------------------

export const usersRelations = relations(users, ({ many }) => ({
  cards: many(cards),
  transactions: many(transactions),
  reimbursements: many(reimbursements),
}));

export const cardsRelations = relations(cards, ({ one, many }) => ({
  user: one(users, { fields: [cards.userId], references: [users.id] }),
  transactions: many(transactions),
}));

export const merchantsRelations = relations(merchants, ({ many }) => ({
  transactions: many(transactions),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  card: one(cards, { fields: [transactions.cardId], references: [cards.id] }),
  merchant: one(merchants, {
    fields: [transactions.merchantId],
    references: [merchants.id],
  }),
  user: one(users, { fields: [transactions.userId], references: [users.id] }),
}));

export const reimbursementsRelations = relations(
  reimbursements,
  ({ one }) => ({
    user: one(users, {
      fields: [reimbursements.userId],
      references: [users.id],
    }),
  }),
);
