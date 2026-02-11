"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function EarlySignupForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("loading");
    setMessage("");
    try {
      const res = await fetch("/api/early-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = (await res.json()) as { success?: boolean; error?: string };
      if (!res.ok) {
        setStatus("error");
        setMessage(data.error ?? "Something went wrong.");
        return;
      }
      setStatus("success");
      setEmail("");
      setMessage("You're on the list. We'll notify you when we're live.");
    } catch {
      setStatus("error");
      setMessage("Something went wrong. Please try again.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <label htmlFor="early-signup-email" className="sr-only">
          Email for launch notification
        </label>
        <Input
          id="early-signup-email"
          type="email"
          placeholder="you@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={status === "loading"}
          className="min-w-0 rounded-md border-2 bg-background sm:max-w-[280px]"
          autoComplete="email"
          required
        />
        <Button
          type="submit"
          disabled={status === "loading"}
          className="shrink-0 rounded-md bg-primary px-6 font-medium text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring"
        >
          {status === "loading" ? "Joining…" : "Notify me when we're live"}
        </Button>
      </div>
      {message && (
        <p
          role="status"
          className={
            status === "success"
              ? "text-sm text-primary"
              : "text-sm text-destructive"
          }
        >
          {message}
        </p>
      )}
    </form>
  );
}
