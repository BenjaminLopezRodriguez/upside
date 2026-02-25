import { eq, desc } from "drizzle-orm";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { subMonths } from "date-fns";

import { db } from "@/server/db";
import { transactions } from "@/server/db/schema";
import { getDbUserFromKinde } from "@/server/deltra-auth";
import { computeSpendTrends } from "@/lib/deltra-trends";
import type { TransactionForTrend } from "@/lib/deltra-trends";

/**
 * GET /api/deltra/trends
 * Returns aggregated spend and trend data for the current user.
 * Callable "tool" for dashboards, Ask Deltra, or other consumers.
 */
export async function GET() {
  const { getUser, isAuthenticated } = getKindeServerSession();
  const [user, authenticated] = await Promise.all([getUser(), isAuthenticated()]);
  if (!authenticated || !user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dbUser = await getDbUserFromKinde({
    id: user.id ?? null,
    email: user.email ?? null,
    given_name: user.given_name ?? null,
    family_name: user.family_name ?? null,
  });
  if (!dbUser) {
    return Response.json({ error: "User not found" }, { status: 403 });
  }

  const since = subMonths(new Date(), 6);
  const txRows = await db.query.transactions.findMany({
    where: eq(transactions.userId, dbUser.id),
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
  return Response.json(trends);
}
