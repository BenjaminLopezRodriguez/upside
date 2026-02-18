import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import {
  users,
  cards,
  merchants,
  transactions,
  reimbursements,
  bills,
} from "./schema";

const DATABASE_URL =
  process.env.DATABASE_URL ??
  "postgresql://postgres:zg2Vm2_qDiIyicDO@localhost:5432/upside";

const conn = postgres(DATABASE_URL);
const db = drizzle(conn);

async function seed() {
  console.log("Seeding database...");

  // -----------------------------------------------------------------------
  // Clean existing seed data (so seed is re-runnable)
  // -----------------------------------------------------------------------
  console.log("  Clearing existing data...");
  await db.delete(transactions);
  await db.delete(reimbursements);
  await db.delete(bills);
  await db.delete(cards);
  await db.delete(merchants);
  await db.delete(users);

  // -----------------------------------------------------------------------
  // Users
  // -----------------------------------------------------------------------
  const insertedUsers = await db
    .insert(users)
    .values([
      {
        name: "Alex Johnson",
        email: "alex@upside.com",
        role: "admin",
        department: "Engineering",
      },
      {
        name: "Sarah Chen",
        email: "sarah@upside.com",
        role: "manager",
        department: "Marketing",
      },
      {
        name: "Marcus Williams",
        email: "marcus@upside.com",
        role: "employee",
        department: "Sales",
      },
      {
        name: "Priya Patel",
        email: "priya@upside.com",
        role: "employee",
        department: "Engineering",
      },
      {
        name: "Jordan Lee",
        email: "jordan@upside.com",
        role: "manager",
        department: "Finance",
      },
    ])
    .returning();
  console.log(`  Inserted ${insertedUsers.length} users`);

  // -----------------------------------------------------------------------
  // Merchants
  // -----------------------------------------------------------------------
  const insertedMerchants = await db
    .insert(merchants)
    .values([
      { name: "AWS", category: "Software" },
      { name: "Google Cloud", category: "Software" },
      { name: "Figma", category: "Software" },
      { name: "WeWork", category: "Office" },
      { name: "Delta Airlines", category: "Travel" },
      { name: "Hilton Hotels", category: "Travel" },
      { name: "Uber", category: "Travel" },
      { name: "Staples", category: "Office Supplies" },
      { name: "DoorDash", category: "Meals" },
      { name: "LinkedIn", category: "Advertising" },
    ])
    .returning();
  console.log(`  Inserted ${insertedMerchants.length} merchants`);

  // -----------------------------------------------------------------------
  // Cards
  // -----------------------------------------------------------------------
  const insertedCards = await db
    .insert(cards)
    .values([
      {
        userId: insertedUsers[0]!.id,
        last4: "4242",
        cardName: "Engineering Infra",
        type: "virtual",
        status: "active",
        spendLimit: 1000000,
        currentSpend: 456200,
      },
      {
        userId: insertedUsers[0]!.id,
        last4: "1234",
        cardName: "Alex's Physical Card",
        type: "physical",
        status: "active",
        spendLimit: 500000,
        currentSpend: 128900,
      },
      {
        userId: insertedUsers[1]!.id,
        last4: "5678",
        cardName: "Marketing Spend",
        type: "virtual",
        status: "active",
        spendLimit: 750000,
        currentSpend: 332100,
      },
      {
        userId: insertedUsers[1]!.id,
        last4: "9012",
        cardName: "Ad Campaigns",
        type: "virtual",
        status: "active",
        spendLimit: 2000000,
        currentSpend: 1245000,
      },
      {
        userId: insertedUsers[2]!.id,
        last4: "3456",
        cardName: "Sales Travel",
        type: "physical",
        status: "active",
        spendLimit: 800000,
        currentSpend: 445600,
      },
      {
        userId: insertedUsers[3]!.id,
        last4: "7890",
        cardName: "Dev Tools",
        type: "virtual",
        status: "frozen",
        spendLimit: 300000,
        currentSpend: 189000,
      },
      {
        userId: insertedUsers[4]!.id,
        last4: "2468",
        cardName: "Finance Ops",
        type: "virtual",
        status: "active",
        spendLimit: 400000,
        currentSpend: 76500,
      },
      {
        userId: insertedUsers[2]!.id,
        last4: "1357",
        cardName: "Client Dinners",
        type: "physical",
        status: "cancelled",
        spendLimit: 200000,
        currentSpend: 198700,
      },
    ])
    .returning();
  console.log(`  Inserted ${insertedCards.length} cards`);

  // -----------------------------------------------------------------------
  // Transaction dates: spread across the full year (12 months) for timeline graph
  // -----------------------------------------------------------------------
  const now = new Date();
  const transactionDates: Date[] = [];
  for (let monthsAgo = 0; monthsAgo < 12; monthsAgo++) {
    const year = now.getFullYear();
    const month = now.getMonth() - monthsAgo;
    for (const day of [3, 8, 14, 19, 25]) {
      transactionDates.push(new Date(year, month, day));
    }
  }
  transactionDates.sort((a, b) => a.getTime() - b.getTime());
  const monthCount = new Set(transactionDates.map((d) => d.toISOString().slice(0, 7))).size;
  console.log(`  Created ${transactionDates.length} transaction dates across ${monthCount} months`);

  // -----------------------------------------------------------------------
  // Transactions (enough to cover all dates so graph shows across the year)
  // -----------------------------------------------------------------------
  const txData: Array<{
    cardId: number;
    merchantId: number;
    userId: number;
    amount: number;
    status: "pending" | "completed" | "declined";
    category: string;
    memo: string | null;
    transactionDate: Date;
  }> = [];

  const statuses: Array<"pending" | "completed" | "declined"> = [
    "completed",
    "completed",
    "completed",
    "completed",
    "pending",
    "declined",
  ];
  const memos = [
    "Monthly subscription",
    "Team lunch",
    "Client meeting",
    "Office supplies restock",
    "Conference travel",
    null,
    null,
    "Q1 campaign spend",
    "Infrastructure costs",
    "Design tool licenses",
  ];

  const numTransactions = Math.max(80, transactionDates.length);
  for (let i = 0; i < numTransactions; i++) {
    const card = insertedCards[i % insertedCards.length]!;
    const merchant = insertedMerchants[i % insertedMerchants.length]!;
    const transactionDate = transactionDates[i % transactionDates.length]!;

    txData.push({
      cardId: card.id,
      merchantId: merchant.id,
      userId: card.userId,
      amount: Math.floor(Math.random() * 200000) + 500,
      status: statuses[i % statuses.length]!,
      category: merchant.category,
      memo: memos[i % memos.length] ?? null,
      transactionDate,
    });
  }

  const insertedTx = await db.insert(transactions).values(txData).returning();
  console.log(`  Inserted ${insertedTx.length} transactions`);

  // -----------------------------------------------------------------------
  // Reimbursements
  // -----------------------------------------------------------------------
  const reimbData: Array<{
    userId: number;
    amount: number;
    description: string;
    status: "pending" | "approved" | "rejected";
    category: string;
    submittedAt: Date;
    reviewedAt: Date | null;
  }> = [
    {
      userId: insertedUsers[2]!.id,
      amount: 4500,
      description: "Uber to client office",
      status: "pending",
      category: "Travel",
      submittedAt: daysAgo(2),
      reviewedAt: null,
    },
    {
      userId: insertedUsers[3]!.id,
      amount: 12900,
      description: "Conference registration - ReactConf",
      status: "pending",
      category: "Education",
      submittedAt: daysAgo(5),
      reviewedAt: null,
    },
    {
      userId: insertedUsers[0]!.id,
      amount: 3200,
      description: "Team lunch at Sweetgreen",
      status: "approved",
      category: "Meals",
      submittedAt: daysAgo(10),
      reviewedAt: daysAgo(8),
    },
    {
      userId: insertedUsers[2]!.id,
      amount: 45000,
      description: "Flight to NYC for sales summit",
      status: "approved",
      category: "Travel",
      submittedAt: daysAgo(15),
      reviewedAt: daysAgo(12),
    },
    {
      userId: insertedUsers[1]!.id,
      amount: 8900,
      description: "Photography for product launch",
      status: "approved",
      category: "Marketing",
      submittedAt: daysAgo(20),
      reviewedAt: daysAgo(18),
    },
    {
      userId: insertedUsers[3]!.id,
      amount: 2100,
      description: "USB-C hub and cables",
      status: "rejected",
      category: "Office Supplies",
      submittedAt: daysAgo(25),
      reviewedAt: daysAgo(22),
    },
    {
      userId: insertedUsers[4]!.id,
      amount: 15600,
      description: "Annual CPA exam prep materials",
      status: "pending",
      category: "Education",
      submittedAt: daysAgo(1),
      reviewedAt: null,
    },
    {
      userId: insertedUsers[0]!.id,
      amount: 6700,
      description: "Parking at downtown office",
      status: "approved",
      category: "Travel",
      submittedAt: daysAgo(30),
      reviewedAt: daysAgo(28),
    },
    {
      userId: insertedUsers[2]!.id,
      amount: 28400,
      description: "Client dinner - Nobu",
      status: "pending",
      category: "Meals",
      submittedAt: daysAgo(3),
      reviewedAt: null,
    },
    {
      userId: insertedUsers[1]!.id,
      amount: 19900,
      description: "Trade show booth materials",
      status: "approved",
      category: "Marketing",
      submittedAt: daysAgo(35),
      reviewedAt: daysAgo(32),
    },
  ];

  const insertedReimb = await db
    .insert(reimbursements)
    .values(reimbData)
    .returning();
  console.log(`  Inserted ${insertedReimb.length} reimbursements`);

  // -----------------------------------------------------------------------
  // Bills
  // -----------------------------------------------------------------------
  const billData: Array<{
    vendorName: string;
    amount: number;
    status: "draft" | "pending" | "scheduled" | "paid";
    dueDate: Date;
    invoiceNumber: string;
    category: string;
    paidAt: Date | null;
  }> = [
    {
      vendorName: "Amazon Web Services",
      amount: 1245000,
      status: "paid",
      dueDate: daysAgo(5),
      invoiceNumber: "AWS-2026-0142",
      category: "Software",
      paidAt: daysAgo(6),
    },
    {
      vendorName: "WeWork",
      amount: 850000,
      status: "pending",
      dueDate: daysFromNow(10),
      invoiceNumber: "WW-89234",
      category: "Office",
      paidAt: null,
    },
    {
      vendorName: "Figma Inc",
      amount: 45000,
      status: "scheduled",
      dueDate: daysFromNow(5),
      invoiceNumber: "FIG-2026-028",
      category: "Software",
      paidAt: null,
    },
    {
      vendorName: "Google Cloud Platform",
      amount: 678000,
      status: "pending",
      dueDate: daysFromNow(15),
      invoiceNumber: "GCP-INV-8821",
      category: "Software",
      paidAt: null,
    },
    {
      vendorName: "LinkedIn Advertising",
      amount: 250000,
      status: "paid",
      dueDate: daysAgo(10),
      invoiceNumber: "LI-ADS-5543",
      category: "Advertising",
      paidAt: daysAgo(11),
    },
    {
      vendorName: "Staples Business",
      amount: 32000,
      status: "draft",
      dueDate: daysFromNow(20),
      invoiceNumber: "STP-77812",
      category: "Office Supplies",
      paidAt: null,
    },
    {
      vendorName: "Stripe",
      amount: 15400,
      status: "paid",
      dueDate: daysAgo(2),
      invoiceNumber: "STRIPE-2026-FEB",
      category: "Software",
      paidAt: daysAgo(3),
    },
    {
      vendorName: "Greenhouse Software",
      amount: 120000,
      status: "scheduled",
      dueDate: daysFromNow(8),
      invoiceNumber: "GH-INV-3321",
      category: "Software",
      paidAt: null,
    },
  ];

  const insertedBills = await db.insert(bills).values(billData).returning();
  console.log(`  Inserted ${insertedBills.length} bills`);

  console.log("Seeding complete!");
  await conn.end();
}

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function daysFromNow(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
}

seed().catch((e) => {
  console.error("Seed failed:", e);
  process.exit(1);
});
