import { index, pgTableCreator, pgEnum, text } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
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

export const linkTypeEnum = pgEnum("upside_link_type", [
  "receipt_scanner",
  "order_pool",
  "fund_request",
]);

export const linkStatusEnum = pgEnum("upside_link_status", [
  "active",
  "disabled",
  "expired",
]);

export const apiKeyStatusEnum = pgEnum("upside_api_key_status", [
  "active",
  "revoked",
]);

export const webhookStatusEnum = pgEnum("upside_webhook_status", [
  "active",
  "failing",
  "disabled",
]);

// ---------------------------------------------------------------------------
// Tables
// ---------------------------------------------------------------------------

export const users = createTable(
  "user",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    kindeId: d.varchar({ length: 256 }).unique(),
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
  (t) => [
    index("user_email_idx").on(t.email),
    index("user_kinde_id_idx").on(t.kindeId),
  ],
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
    orgId: d.integer().references(() => organizations.id),
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
  (t) => [index("reimb_user_idx").on(t.userId), index("reimb_org_idx").on(t.orgId)],
);

export const bills = createTable(
  "bill",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    userId: d
      .integer()
      .notNull()
      .references(() => users.id),
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
  (t) => [
    index("bill_status_idx").on(t.status),
    index("bill_user_idx").on(t.userId),
  ],
);

export const integrationLinks = createTable(
  "integration_link",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    userId: d
      .integer()
      .notNull()
      .references(() => users.id),
    name: d.varchar({ length: 256 }).notNull(),
    type: linkTypeEnum().notNull(),
    description: d.varchar({ length: 512 }),
    slug: d.varchar({ length: 128 }).notNull(),
    status: linkStatusEnum().notNull().default("active"),
    submissions: d.integer().notNull().default(0),
    expiresAt: d.timestamp({ withTimezone: true }),
    createdAt: d
      .timestamp({ withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
  }),
  (t) => [
    index("integration_link_user_idx").on(t.userId),
    index("integration_link_slug_idx").on(t.slug),
  ],
);

export const apiKeys = createTable(
  "api_key",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    userId: d
      .integer()
      .notNull()
      .references(() => users.id),
    name: d.varchar({ length: 256 }).notNull(),
    keyPrefix: d.varchar({ length: 32 }).notNull(),
    status: apiKeyStatusEnum().notNull().default("active"),
    scopes: text("scopes").array().notNull().default(sql`'{}'::text[]`),
    lastUsedAt: d.timestamp({ withTimezone: true }),
    createdAt: d
      .timestamp({ withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
  }),
  (t) => [index("api_key_user_idx").on(t.userId)],
);

export const webhooks = createTable(
  "webhook",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    userId: d
      .integer()
      .notNull()
      .references(() => users.id),
    url: d.varchar({ length: 512 }).notNull(),
    events: text("events").array().notNull().default(sql`'{}'::text[]`),
    status: webhookStatusEnum().notNull().default("active"),
    createdAt: d
      .timestamp({ withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
  }),
  (t) => [index("webhook_user_idx").on(t.userId)],
);

export const organizations = createTable(
  "organization",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    name: d.varchar({ length: 256 }).notNull(),
    slug: d.varchar({ length: 256 }).notNull().unique(),
    logoUrl: d.varchar({ length: 512 }),
    // 'personal' = auto-created on first sign-in; 'corporate' = company account with full features
    type: d.varchar({ length: 32 }).notNull().default("personal"),
    ownerId: d
      .integer()
      .notNull()
      .references(() => users.id),
    setupComplete: d.boolean().notNull().default(false),
    createdAt: d
      .timestamp({ withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
  }),
  (t) => [
    index("org_owner_idx").on(t.ownerId),
    index("org_slug_idx").on(t.slug),
  ],
);

export const organizationMembers = createTable(
  "organization_member",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    organizationId: d
      .integer()
      .notNull()
      .references(() => organizations.id),
    userId: d
      .integer()
      .notNull()
      .references(() => users.id),
    // 'owner' | 'admin' | 'member'
    role: d.varchar({ length: 32 }).notNull().default("member"),
    // Permission scopes — owners always have full access; these apply to non-owner members
    canViewTransactions: d.boolean().notNull().default(true),
    canCreateCards: d.boolean().notNull().default(false),
    canSubmitReimbursements: d.boolean().notNull().default(true),
    canViewBills: d.boolean().notNull().default(false),
    canManageIntegrations: d.boolean().notNull().default(false),
    spendLimit: d.integer(), // null = use org default
    createdAt: d
      .timestamp({ withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
  }),
  (t) => [
    index("org_member_org_idx").on(t.organizationId),
    index("org_member_user_idx").on(t.userId),
  ],
);

// ---------------------------------------------------------------------------
// Relations
// ---------------------------------------------------------------------------

export const usersRelations = relations(users, ({ many }) => ({
  cards: many(cards),
  transactions: many(transactions),
  reimbursements: many(reimbursements),
  bills: many(bills),
  integrationLinks: many(integrationLinks),
  apiKeys: many(apiKeys),
  webhooks: many(webhooks),
  ownedOrganizations: many(organizations),
  organizationMemberships: many(organizationMembers),
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
    organization: one(organizations, {
      fields: [reimbursements.orgId],
      references: [organizations.id],
    }),
  }),
);

export const billsRelations = relations(bills, ({ one }) => ({
  user: one(users, { fields: [bills.userId], references: [users.id] }),
}));

export const integrationLinksRelations = relations(
  integrationLinks,
  ({ one }) => ({
    user: one(users, {
      fields: [integrationLinks.userId],
      references: [users.id],
    }),
  }),
);

export const apiKeysRelations = relations(apiKeys, ({ one }) => ({
  user: one(users, { fields: [apiKeys.userId], references: [users.id] }),
}));

export const webhooksRelations = relations(webhooks, ({ one }) => ({
  user: one(users, { fields: [webhooks.userId], references: [users.id] }),
}));

export const organizationsRelations = relations(organizations, ({ one, many }) => ({
  owner: one(users, { fields: [organizations.ownerId], references: [users.id] }),
  members: many(organizationMembers),
  reimbursements: many(reimbursements),
}));

export const organizationMembersRelations = relations(organizationMembers, ({ one }) => ({
  organization: one(organizations, {
    fields: [organizationMembers.organizationId],
    references: [organizations.id],
  }),
  user: one(users, { fields: [organizationMembers.userId], references: [users.id] }),
}));
