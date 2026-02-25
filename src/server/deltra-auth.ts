import { eq } from "drizzle-orm";

import { db } from "@/server/db";
import { users } from "@/server/db/schema";

export type KindeUser = {
  id: string | null;
  email: string | null;
  given_name: string | null;
  family_name: string | null;
};

/**
 * Resolve Kinde user to our DB user (by kindeId). Creates or updates user if needed.
 * Used by API routes that need user-scoped data (e.g. Ask Deltra).
 */
export async function getDbUserFromKinde(kindeUser: KindeUser | null) {
  if (!kindeUser?.id) return null;
  const kindeId = kindeUser.id;
  let [dbUser] = await db
    .select()
    .from(users)
    .where(eq(users.kindeId, kindeId))
    .limit(1);
  if (!dbUser) {
    const name =
      kindeUser.given_name && kindeUser.family_name
        ? `${kindeUser.given_name} ${kindeUser.family_name}`.trim()
        : kindeUser.given_name ?? kindeUser.family_name ?? kindeUser.email ?? "User";
    const email = kindeUser.email ?? `${kindeId}@kinde.placeholder`;
    const [existingByEmail] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    if (existingByEmail) {
      await db
        .update(users)
        .set({ kindeId })
        .where(eq(users.id, existingByEmail.id));
      dbUser = { ...existingByEmail, kindeId };
    } else {
      const [inserted] = await db
        .insert(users)
        .values({
          kindeId,
          name,
          email,
        })
        .returning();
      dbUser = inserted!;
    }
  }
  return dbUser;
}
