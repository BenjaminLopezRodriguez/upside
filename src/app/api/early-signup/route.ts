import { Resend } from "resend";
import { z } from "zod";

import { db } from "@/server/db";
import { earlySignups } from "@/server/db/schema";
import { env } from "@/env";

const bodySchema = z.object({
  email: z.string().email("Please enter a valid email address."),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { error: parsed.error.flatten().fieldErrors.email?.[0] ?? "Invalid email." },
        { status: 400 }
      );
    }
    const { email } = parsed.data;

    const normalized = email.toLowerCase().trim();

    await db
      .insert(earlySignups)
      .values({ email: normalized })
      .onConflictDoNothing({ target: earlySignups.email });

    // Only call Resend when both API key and Audience ID are set (Audience ID is a UUID from Resend dashboard)
    if (env.RESEND_API_KEY && env.RESEND_AUDIENCE_ID) {
      try {
        const resend = new Resend(env.RESEND_API_KEY);
        await resend.contacts.create({
          audienceId: env.RESEND_AUDIENCE_ID,
          email: normalized,
          unsubscribed: false,
        });
      } catch (resendErr) {
        // Contact may already exist; still return success
        console.warn("[early-signup] Resend contact create:", resendErr);
      }
    }

    return Response.json({ success: true });
  } catch (err) {
    console.error("[early-signup]", err);
    return Response.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
