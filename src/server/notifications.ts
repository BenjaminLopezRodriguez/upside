import type { AppDb } from "@/server/db";
import { notifications } from "@/server/db/schema";

type CreateNotificationPayload = {
  userId: number;
  type?: string;
  title: string;
  body?: string | null;
  link?: string | null;
  organizationId?: number | null;
};

/**
 * Create a notification for a user. Call from other routers or server code.
 */
export async function createNotification(
  db: AppDb,
  payload: CreateNotificationPayload,
) {
  const [row] = await db
    .insert(notifications)
    .values({
      userId: payload.userId,
      type: payload.type ?? "system",
      title: payload.title,
      body: payload.body ?? null,
      link: payload.link ?? null,
      organizationId: payload.organizationId ?? null,
    })
    .returning();
  if (!row) throw new Error("Failed to create notification");
  return row;
}
