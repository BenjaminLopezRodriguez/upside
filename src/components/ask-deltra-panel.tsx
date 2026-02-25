"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type Message = { role: "user" | "assistant"; content: string };

export function AskDeltraPanel() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [open, messages]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", content: text }]);
    setLoading(true);
    try {
      const res = await fetch("/api/deltra/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessages((m) => [
          ...m,
          { role: "assistant", content: data.error ?? "Something went wrong." },
        ]);
        return;
      }
      setMessages((m) => [
        ...m,
        { role: "assistant", content: data.reply ?? "No reply." },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "Could not reach Deltra. Try again." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Ask Deltra"
              onClick={() => setOpen(true)}
            >
              <Image
                src="/icon.svg"
                alt=""
                width={20}
                height={20}
                className="size-5 dark:invert"
              />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Ask Deltra</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="right"
          className="flex w-full flex-col sm:max-w-md"
          showCloseButton
        >
          <SheetHeader className="border-b pb-4">
            <SheetTitle>Ask Deltra</SheetTitle>
          </SheetHeader>

          <div
            ref={listRef}
            className="min-h-0 flex-1 overflow-y-auto py-4"
          >
            {messages.length === 0 && (
              <p className="text-muted-foreground text-sm">
                Ask about your spending, trends, or categories. For example:
                &quot;What are my top categories?&quot; or &quot;How is my
                spend trending?&quot;
              </p>
            )}
            {messages.map((msg, i) => (
              <div
                key={i}
                className={cn(
                  "mb-4",
                  msg.role === "user"
                    ? "ml-6 text-right"
                    : "mr-6 text-left"
                )}
              >
                <span
                  className={cn(
                    "inline-block rounded-2xl px-3 py-2 text-sm",
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground"
                  )}
                >
                  {msg.content}
                </span>
              </div>
            ))}
            {loading && (
              <div className="mr-6 text-left">
                <span className="inline-block rounded-2xl bg-muted px-3 py-2 text-sm text-muted-foreground">
                  …
                </span>
              </div>
            )}
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex shrink-0 gap-2 border-t pt-4"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your spend…"
              disabled={loading}
              className="rounded-2xl"
            />
            <Button
              type="submit"
              size="default"
              disabled={loading || !input.trim()}
              className="shrink-0 rounded-2xl"
            >
              Send
            </Button>
          </form>
        </SheetContent>
      </Sheet>
    </>
  );
}
