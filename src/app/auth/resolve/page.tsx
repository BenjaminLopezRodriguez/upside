/**
 * Post-auth organization context resolver.
 *
 * Kinde redirects here after successful sign-in (set KINDE_POST_LOGIN_REDIRECT_URL=/auth/resolve).
 * Resolves the user's org context and routes them to the correct destination:
 *
 *   Owner (corporate, setup pending) → /onboarding/company-setup
 *   Owner (personal or setup done)   → /dashboard
 *   Member (any role)                → /dashboard
 *   Neither                          → creates personal org → /dashboard
 */
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";

import { db } from "@/server/db";
import { users, organizations, organizationMembers } from "@/server/db/schema";

export default async function ResolvePage() {
  const { getUser, isAuthenticated } = getKindeServerSession();
  const [isAuth, kindeUser] = await Promise.all([isAuthenticated(), getUser()]);

  if (!isAuth || !kindeUser?.id) {
    redirect("/sign-in");
  }

  // Ensure the DB user exists (upsert on first sign-in).
  let dbUser = await db.query.users.findFirst({
    where: eq(users.kindeId, kindeUser.id),
  });

  if (!dbUser) {
    const name =
      kindeUser.given_name && kindeUser.family_name
        ? `${kindeUser.given_name} ${kindeUser.family_name}`.trim()
        : (kindeUser.given_name ?? kindeUser.family_name ?? kindeUser.email ?? "User");
    const email = kindeUser.email ?? `${kindeUser.id}@kinde.placeholder`;
    const [inserted] = await db
      .insert(users)
      .values({ kindeId: kindeUser.id, name, email })
      .returning();
    dbUser = inserted!;
  }

  // 1. Check if user is an org owner.
  const ownedOrg = await db.query.organizations.findFirst({
    where: eq(organizations.ownerId, dbUser.id),
  });

  if (ownedOrg) {
    // Corporate org not yet set up → send to wizard.
    if (ownedOrg.type === "corporate" && !ownedOrg.setupComplete) {
      redirect("/onboarding/company-setup");
    }
    redirect("/dashboard");
  }

  // 2. Check if user is a member of any org (invited by a company owner).
  const membership = await db.query.organizationMembers.findFirst({
    where: eq(organizationMembers.userId, dbUser.id),
  });

  if (membership) {
    redirect("/dashboard");
  }

  // 3. Neither — first-ever sign-in. Create a personal org and go to dashboard.
  const slug = `personal-${dbUser.id}`;
  const [newOrg] = await db
    .insert(organizations)
    .values({
      name: `${dbUser.name}'s Workspace`,
      slug,
      type: "personal",
      ownerId: dbUser.id,
      setupComplete: true,
    })
    .returning();

  await db.insert(organizationMembers).values({
    organizationId: newOrg!.id,
    userId: dbUser.id,
    role: "owner",
    canViewTransactions: true,
    canCreateCards: true,
    canSubmitReimbursements: true,
    canViewBills: true,
    canManageIntegrations: true,
  });

  redirect("/dashboard");
}
