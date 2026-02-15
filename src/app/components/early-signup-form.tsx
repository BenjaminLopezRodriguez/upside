"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function EarlySignupForm() {
  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
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
        body: JSON.stringify({
          email: email.trim(),
          companyName: companyName.trim() || undefined,
        }),
      });
      const data = (await res.json()) as { success?: boolean; error?: string };
      if (!res.ok) {
        setStatus("error");
        setMessage(data.error ?? "Something went wrong.");
        return;
      }
      setStatus("success");
      setEmail("");
      setCompanyName("");
      setMessage("You're on the list. We'll notify you when we're live.");
    } catch {
      setStatus("error");
      setMessage("Something went wrong. Please try again.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch sm:justify-center">
        <div className="flex min-w-0 flex-1 flex-col gap-3 sm:max-w-md sm:flex-row">
          <label htmlFor="early-signup-company" className="sr-only">
            Company name
          </label>
          <Input
            id="early-signup-company"
            type="text"
            placeholder="Company name"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            disabled={status === "loading"}
            className="tap-target min-h-[48px] min-w-0 rounded-full border-2 border-border bg-background px-5 py-2.5 sm:max-w-[180px]"
            autoComplete="organization"
          />
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
            className="tap-target min-h-[48px] min-w-0 flex-1 rounded-full border-2 border-border bg-background px-5 py-2.5"
            autoComplete="email"
            required
            aria-required="true"
          />
        </div>
        <Button
          type="submit"
          disabled={status === "loading"}
          className="tap-target shrink-0 min-h-[48px] rounded-full bg-[var(--upside-purple)] px-6 font-medium text-white transition-colors hover:bg-[var(--upside-deep)] focus-visible:ring-2 focus-visible:ring-[var(--upside-purple)] focus-visible:ring-offset-2"
        >
          {status === "loading" ? "Joining…" : "Notify me"}
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
