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

export const roleStatusEnum = pgEnum("upside_role_status", [
  "draft",
  "open",
  "closed",
]);

export const cardRequestStatusEnum = pgEnum("upside_card_request_status", [
  "pending",
  "issued",
  "denied",
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
    /** When set, this card was issued to the user by an organization (personal view shows only these). */
    organizationId: d.integer().references(() => organizations.id),
    last4: d.varchar({ length: 4 }).notNull(),
    cardName: d.varchar({ length: 256 }).notNull(),
    type: cardTypeEnum().notNull().default("virtual"),
    status: cardStatusEnum().notNull().default("active"),
    spendLimit: d.integer().notNull().default(500000),
    currentSpend: d.integer().notNull().default(0),
    cardColor: d.varchar({ length: 32 }),
    logoUrl: d.varchar({ length: 512 }),
    material: d.varchar({ length: 32 }),
    /** Lithic card token for wallet provisioning (Apple Pay / Google Pay). Null if card was created without Lithic. */
    lithicCardToken: d.varchar({ length: 64 }),
    createdAt: d
      .timestamp({ withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
  }),
  (t) => [
    index("card_user_idx").on(t.userId),
    index("card_org_idx").on(t.organizationId),
  ],
);

export const cardRequests = createTable(
  "card_request",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    userId: d
      .integer()
      .notNull()
      .references(() => users.id),
    organizationId: d
      .integer()
      .notNull()
      .references(() => organizations.id),
    status: cardRequestStatusEnum().notNull().default("pending"),
    requestedAt: d
      .timestamp({ withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
    processedAt: d.timestamp({ withTimezone: true }),
    processedBy: d.integer().references(() => users.id),
  }),
  (t) => [
    index("card_request_user_idx").on(t.userId),
    index("card_request_org_idx").on(t.organizationId),
  ],
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

export const roles = createTable(
  "role",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    organizationId: d
      .integer()
      .notNull()
      .references(() => organizations.id),
    createdBy: d
      .integer()
      .notNull()
      .references(() => users.id),
    title: d.varchar({ length: 256 }).notNull(),
    description: d.text().notNull(),
    department: d.varchar({ length: 128 }),
    location: d.varchar({ length: 256 }),
    status: roleStatusEnum().notNull().default("open"),
    /** Job board names this role was posted to (e.g. LinkedIn, Indeed). */
    postedTo: text("posted_to").array().notNull().default(sql`'{}'::text[]`),
    postedAt: d.timestamp({ withTimezone: true }),
    createdAt: d
      .timestamp({ withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
  }),
  (t) => [
    index("role_org_idx").on(t.organizationId),
    index("role_created_by_idx").on(t.createdBy),
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

// Notifications (in-app alerts; link optional for navigation)
export const notifications = createTable(
  "notification",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    userId: d
      .integer()
      .notNull()
      .references(() => users.id),
    organizationId: d.integer().references(() => organizations.id),
    type: d.varchar({ length: 64 }).notNull().default("system"),
    title: d.varchar({ length: 512 }).notNull(),
    body: d.text(),
    link: d.varchar({ length: 512 }),
    readAt: d.timestamp({ withTimezone: true }),
    createdAt: d
      .timestamp({ withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
  }),
  (t) => [
    index("notification_user_idx").on(t.userId),
    index("notification_read_idx").on(t.readAt),
    index("notification_created_idx").on(t.createdAt),
  ],
);

// Conversations (1:1 or future group; no subject for now)
export const conversations = createTable("conversation", (d) => ({
  id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
  lastMessageAt: d.timestamp({ withTimezone: true }),
  createdAt: d
    .timestamp({ withTimezone: true })
    .$defaultFn(() => new Date())
    .notNull(),
}));

// Who is in each conversation
export const conversationParticipants = createTable(
  "conversation_participant",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    conversationId: d
      .integer()
      .notNull()
      .references(() => conversations.id),
    userId: d
      .integer()
      .notNull()
      .references(() => users.id),
    lastReadAt: d.timestamp({ withTimezone: true }),
    joinedAt: d
      .timestamp({ withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
  }),
  (t) => [
    index("conv_part_conv_idx").on(t.conversationId),
    index("conv_part_user_idx").on(t.userId),
  ],
);

// Messages within a conversation
export const messages = createTable(
  "message",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    conversationId: d
      .integer()
      .notNull()
      .references(() => conversations.id),
    senderId: d
      .integer()
      .notNull()
      .references(() => users.id),
    body: d.text().notNull(),
    createdAt: d
      .timestamp({ withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
  }),
  (t) => [
    index("message_conv_idx").on(t.conversationId),
    index("message_created_idx").on(t.createdAt),
  ],
);

// ---------------------------------------------------------------------------
// Relations
// ---------------------------------------------------------------------------

export const rolesRelations = relations(roles, ({ one }) => ({
  organization: one(organizations, {
    fields: [roles.organizationId],
    references: [organizations.id],
  }),
  createdByUser: one(users, {
    fields: [roles.createdBy],
    references: [users.id],
  }),
}));

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
  rolesCreated: many(roles),
  cardRequestsRequested: many(cardRequests, {
    relationName: "cardRequestRequester",
  }),
  cardRequestsProcessed: many(cardRequests, {
    relationName: "cardRequestProcessor",
  }),
  notifications: many(notifications),
  conversationParticipations: many(conversationParticipants),
  messagesSent: many(messages),
}));

export const cardRequestsRelations = relations(cardRequests, ({ one }) => ({
  user: one(users, {
    fields: [cardRequests.userId],
    references: [users.id],
    relationName: "cardRequestRequester",
  }),
  organization: one(organizations, {
    fields: [cardRequests.organizationId],
    references: [organizations.id],
  }),
  processedByUser: one(users, {
    fields: [cardRequests.processedBy],
    references: [users.id],
    relationName: "cardRequestProcessor",
  }),
}));

export const cardsRelations = relations(cards, ({ one, many }) => ({
  user: one(users, { fields: [cards.userId], references: [users.id] }),
  organization: one(organizations, {
    fields: [cards.organizationId],
    references: [organizations.id],
  }),
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
  roles: many(roles),
  cardRequests: many(cardRequests),
  issuedCards: many(cards),
}));

export const organizationMembersRelations = relations(organizationMembers, ({ one }) => ({
  organization: one(organizations, {
    fields: [organizationMembers.organizationId],
    references: [organizations.id],
  }),
  user: one(users, { fields: [organizationMembers.userId], references: [users.id] }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, { fields: [notifications.userId], references: [users.id] }),
  organization: one(organizations, {
    fields: [notifications.organizationId],
    references: [organizations.id],
  }),
}));

export const conversationsRelations = relations(conversations, ({ many }) => ({
  participants: many(conversationParticipants),
  messages: many(messages),
}));

export const conversationParticipantsRelations = relations(
  conversationParticipants,
  ({ one }) => ({
    conversation: one(conversations, {
      fields: [conversationParticipants.conversationId],
      references: [conversations.id],
    }),
    user: one(users, {
      fields: [conversationParticipants.userId],
      references: [users.id],
    }),
  }),
);

export const messagesRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id],
  }),
  sender: one(users, { fields: [messages.senderId], references: [users.id] }),
}));
