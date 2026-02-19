/**
 * Post-auth organization context resolver.
 *
 * Kinde redirects here after successful sign-in (set KINDE_POST_LOGIN_REDIRECT_URL=/auth/resolve).
 * Resolves the user's org context and routes them to the correct destination:
 *
 *   Has an incomplete corporate org  → /onboarding/company-setup
 *   Has any org membership           → /dashboard
 *   Brand-new user with no orgs      → create personal workspace → /dashboard
 *
 * A user can simultaneously:
 *  - Own a personal org (always created on first sign-in)
 *  - Own one or more corporate orgs
 *  - Be a non-owner member of other corporate orgs
 *
 * We must NOT rely on findFirst(ownerId) alone — that always returns the personal
 * org first and would skip the corporate-setup check for multi-org owners.
 */
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";

import { db } from "@/server/db";
import { users, organizations, organizationMembers } from "@/server/db/schema";

export default async function ResolvePage() {
  const { getUser, isAuthenticated } = getKindeServerSession();
  const [isAuth, kindeUser] = await Promise.all([isAuthenticated(), getUser()]);

  if (!isAuth || !kindeUser?.id) {
    redirect("/sign-in");
  }

  // ── 1. Ensure DB user exists (upsert on first sign-in) ───────────────────
  let dbUser = await db.query.users.findFirst({
    where: eq(users.kindeId, kindeUser.id),
  });

  if (!dbUser) {
    const name =
      kindeUser.given_name && kindeUser.family_name
        ? `${kindeUser.given_name} ${kindeUser.family_name}`.trim()
        : (kindeUser.given_name ?? kindeUser.family_name ?? kindeUser.email ?? "User");
    const email = kindeUser.email ?? `${kindeUser.id}@kinde.placeholder`;
    const existingByEmail = await db.query.users.findFirst({
      where: eq(users.email, email),
    });
    if (existingByEmail) {
      await db
        .update(users)
        .set({ kindeId: kindeUser.id })
        .where(eq(users.id, existingByEmail.id));
      dbUser = { ...existingByEmail, kindeId: kindeUser.id };
    } else {
      const [inserted] = await db
        .insert(users)
        .values({ kindeId: kindeUser.id, name, email })
        .returning();
      dbUser = inserted!;
    }
  }

  // ── 2. Any owned corporate org awaiting setup? ────────────────────────────
  // Must use explicit AND conditions — findFirst(ownerId) alone returns the
  // personal org first and would cause us to skip this branch.
  const incompleteCorporateOrg = await db.query.organizations.findFirst({
    where: and(
      eq(organizations.ownerId, dbUser.id),
      eq(organizations.type, "corporate"),
      eq(organizations.setupComplete, false),
    ),
  });

  if (incompleteCorporateOrg) {
    redirect("/onboarding/company-setup");
  }

  // ── 3. Any org membership at all (personal owner / corporate owner / member)? ──
  // If the user already has any membership row, they've been through this flow
  // before — send straight to the app.
  const anyMembership = await db.query.organizationMembers.findFirst({
    where: eq(organizationMembers.userId, dbUser.id),
  });

  if (anyMembership) {
    redirect("/dashboard");
  }

  // ── 4. Brand-new user — create a personal workspace and onboard them ──────
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
