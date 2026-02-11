import { randomBytes } from "node:crypto";
import { Resend } from "resend";
import { z } from "zod";

import { db } from "@/server/db";
import { earlySignups } from "@/server/db/schema";
import { env } from "@/env";

const bodySchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  companyName: z.string().max(256).optional(),
});

/** Short alphanumeric code for first-month-free redemption (e.g. A1B2C3D4). */
function generateFreeMonthCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = randomBytes(8);
  let code = "";
  for (let i = 0; i < 8; i++) code += chars[bytes[i]! % chars.length];
  return `UPSIDE-${code}`;
}

function confirmationEmailHtml(code: string, companyName: string | null): string {
  const greeting = companyName?.trim()
    ? `Thanks for signing up, ${companyName.trim()}.`
    : "Thanks for signing up.";
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>You're on the list</title>
</head>
<body style="margin:0; padding:0; background-color:#f1f5f9; font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f1f5f9; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 520px; background-color:#ffffff; border-radius: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04);">
          <tr>
            <td style="padding: 40px 40px 32px;">
              <p style="margin:0 0 32px; font-size: 18px; font-weight: 600; letter-spacing: -0.02em; color:#0f172a;">Upside</p>
              <h1 style="margin:0 0 12px; font-size: 22px; font-weight: 600; letter-spacing: -0.02em; color:#0f172a; line-height: 1.3;">You're on the list</h1>
              <p style="margin:0 0 20px; font-size: 15px; line-height: 1.6; color:#475569;">${greeting} We'll let you know as soon as we're live — and your first month is on us.</p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 28px; background-color:#f8fafc; border-radius: 12px; border: 1px solid #e2e8f0;">
                <tr>
                  <td style="padding: 20px 24px;">
                    <p style="margin:0 0 8px; font-size: 12px; font-weight: 600; letter-spacing: 0.02em; text-transform: uppercase; color:#64748b;">What Upside does for your business</p>
                    <p style="margin:0; font-size: 14px; line-height: 1.6; color:#334155;">Issue virtual or physical cards via API. Automatically capture and match receipts to every transaction. Give your team full control over spend so finance stays in control and audit is simple.</p>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 8px; font-size: 13px; font-weight: 500; color:#64748b;">Use this code when you sign up for your free month:</p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 12px 0 28px;">
                <tr>
                  <td style="background: linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%); border: 1px solid #c7d2fe; border-radius: 10px; padding: 16px 20px; text-align: center;">
                    <span style="font-family: ui-monospace, 'SF Mono', Monaco, monospace; font-size: 18px; font-weight: 600; letter-spacing: 0.12em; color:#4338ca;">${code}</span>
                  </td>
                </tr>
              </table>
              <p style="margin:0; font-size: 13px; line-height: 1.5; color:#94a3b8;">Keep this email — you'll need this code to claim your first month free when we launch.</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 24px 40px 32px; border-top: 1px solid #e2e8f0;">
              <p style="margin:0; font-size: 12px; color:#94a3b8;">— The Upside team</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

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
    const { email, companyName } = parsed.data;

    const normalized = email.toLowerCase().trim();
    const freeMonthCode = generateFreeMonthCode();
    const company = companyName?.trim() || null;

    const inserted = await db
      .insert(earlySignups)
      .values({ email: normalized, companyName: company, freeMonthCode })
      .onConflictDoNothing({ target: earlySignups.email })
      .returning({ freeMonthCode: earlySignups.freeMonthCode });

    const isNewSignup = inserted.length > 0;
    const codeToSend = inserted[0]?.freeMonthCode ?? freeMonthCode;

    // Only call Resend when both API key and Audience ID are set (Audience ID is a UUID from Resend dashboard)
    if (env.RESEND_API_KEY && env.RESEND_AUDIENCE_ID) {
      try {
        const resend = new Resend(env.RESEND_API_KEY);
        await resend.contacts.create({
          audienceId: env.RESEND_AUDIENCE_ID,
          email: normalized,
          unsubscribed: false,
        });

        // Send premium confirmation email only for new signups when from address is set
        if (isNewSignup && env.RESEND_FROM_EMAIL) {
          try {
            await resend.emails.send({
              from: env.RESEND_FROM_EMAIL,
              to: normalized,
              subject: "You're on the list — here's your code for a free month",
              html: confirmationEmailHtml(codeToSend, company),
            });
          } catch (sendErr) {
            console.warn("[early-signup] Resend confirmation email:", sendErr);
          }
        }
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
