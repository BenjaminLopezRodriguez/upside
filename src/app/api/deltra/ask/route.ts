import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { ChatOpenAI } from "@langchain/openai";
import {
  HumanMessage,
  SystemMessage,
  ToolMessage,
  AIMessage,
} from "@langchain/core/messages";

import { env } from "@/env";
import { db } from "@/server/db";
import { getDbUserFromKinde } from "@/server/deltra-auth";
import { createDeltraTools } from "@/lib/deltra-tools";

export const maxDuration = 30;

const SYSTEM_PROMPT = `You are Deltra, a helpful finance assistant for a spend management product. You have tools to both look up the user's data and perform actions on their behalf.

Lookup tools: spend trends, dashboard summary, transactions, cards, bills, reimbursements, profile, organizations. Use these to answer questions—call the relevant tool(s) first, then summarize in a concise, friendly way.

Action tools (use when the user asks you to do something):
- update_transaction_memo: add or change a note on a transaction (need transaction id and memo text).
- freeze_card / unfreeze_card: freeze or unfreeze a card (need card id from list_cards).
- mark_bill_paid: mark a bill as paid (need bill id from list_bills).
- create_bill: add a new bill (vendorName, amountDollars, dueDate YYYY-MM-DD, category; optional invoiceNumber).
- create_reimbursement: submit a reimbursement (amountDollars, description, category; optional orgId for org submission).
- approve_reimbursement / reject_reimbursement: as org owner, approve or reject a reimbursement (reimbursementId, orgId).

When the user asks you to do something (e.g. "freeze my card", "mark the AWS bill as paid", "submit a $50 reimbursement for lunch"), call the right action tool with the required ids/params. If you need an id, use a lookup tool first (e.g. list_cards to get card id, list_bills to get bill id). After the action, confirm what you did in plain language.

Keep answers to 2-4 sentences unless they ask for detail. Use dollar amounts from the data. Do not mention "the tool" or "according to the data"—just answer as Deltra. If the user asks about something you don't have (e.g. runway), say you don't have that and offer what you can do.`;

export async function POST(req: Request) {
  if (!env.OPENAI_API_KEY) {
    return Response.json(
      { error: "Ask Deltra is not configured. Set OPENAI_API_KEY." },
      { status: 503 }
    );
  }

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

  const body = await req.json().catch(() => ({}));
  const message = typeof body.message === "string" ? body.message.trim() : "";
  if (!message) {
    return Response.json({ error: "message is required" }, { status: 400 });
  }

  const tools = createDeltraTools({ db, userId: dbUser.id });
  const model = new ChatOpenAI({
    model: "gpt-4o-mini",
    temperature: 0.2,
  }).bindTools(tools);

  const toolMap = new Map(tools.map((t) => [t.name, t]));

  let messages: (SystemMessage | HumanMessage | AIMessage | ToolMessage)[] = [
    new SystemMessage(SYSTEM_PROMPT),
    new HumanMessage(message),
  ];

  const maxToolRounds = 5;
  let round = 0;
  let lastContent: string = "";

  try {
    while (round < maxToolRounds) {
      const response = (await model.invoke(messages)) as AIMessage;
      const toolCalls = response.tool_calls ?? [];
      lastContent =
        typeof response.content === "string"
          ? response.content
          : String(response.content ?? "");

      if (toolCalls.length === 0) {
        return Response.json({ reply: lastContent || "I don't have a reply for that." });
      }

      const toolMessages: ToolMessage[] = [];
      for (const tc of toolCalls) {
        const id = typeof tc === "object" && tc !== null && "id" in tc ? (tc as { id?: string }).id : undefined;
        const name = typeof tc === "object" && tc !== null && "name" in tc ? (tc as { name: string }).name : "";
        const args = typeof tc === "object" && tc !== null && "args" in tc ? (tc as { args: Record<string, unknown> }).args : {};
        const tool = toolMap.get(name);
        let result: string;
        try {
          result = tool
            ? await tool.invoke(args ?? {})
            : JSON.stringify({ error: `Unknown tool: ${name}` });
        } catch (e) {
          const err = e as Error;
          result = JSON.stringify({ error: err?.message ?? "Tool failed" });
        }
        toolMessages.push(
          new ToolMessage({
            content: typeof result === "string" ? result : JSON.stringify(result),
            tool_call_id: id ?? `call_${name}_${round}`,
          })
        );
      }

      messages = [
        ...messages,
        response,
        ...toolMessages,
      ];
      round++;
    }

    return Response.json({
      reply: lastContent || "I hit a limit on lookups. Try a simpler question.",
    });
  } catch (e) {
    const err = e as Error & { status?: number; code?: string };
    const errMessage = err?.message ?? String(e);
    console.error("[deltra/ask]", errMessage, e);
    const userMessage =
      env.NODE_ENV === "development"
        ? errMessage
        : err?.status === 429
          ? "Deltra is busy. Please try again in a moment."
          : err?.code === "content_filter"
            ? "That question couldn't be answered. Try rephrasing."
            : "Failed to get a reply from Deltra.";
    return Response.json({ error: userMessage }, { status: 500 });
  }
}
