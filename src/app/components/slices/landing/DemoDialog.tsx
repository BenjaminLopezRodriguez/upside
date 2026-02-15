"use client";

import { useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function DemoDialog({ children }: { children: ReactNode }) {
  const [submitted, setSubmitted] = useState(false);

  return (
    <Dialog onOpenChange={() => setSubmitted(false)}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl font-bold text-[var(--upside-purple)]">
            Request a demo
          </DialogTitle>
          <DialogDescription>
            See how Upside fits your card and receipt workflows. Our team will
            walk you through a personalized demo.
          </DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {!submitted ? (
            <motion.form
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onSubmit={(e) => {
                e.preventDefault();
                setSubmitted(true);
              }}
              className="flex flex-col gap-4"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="demo-name"
                  className="text-sm font-medium text-foreground"
                >
                    Full name
                  </label>
                  <Input
                    id="demo-name"
                    placeholder="Jane Smith"
                    required
                    className="h-12 rounded-xl border-2"
                    autoComplete="name"
                    aria-required="true"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="demo-company"
                  className="text-sm font-medium text-foreground"
                >
                    Company
                  </label>
                  <Input
                    id="demo-company"
                    placeholder="Acme Inc."
                    className="h-12 rounded-xl border-2"
                    autoComplete="organization"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="demo-email"
                  className="text-sm font-medium text-foreground"
                >
                  Work email
                </label>
                <Input
                  id="demo-email"
                  type="email"
                  placeholder="jane@acme.com"
                  required
                  className="h-12 rounded-xl border-2"
                  autoComplete="email"
                  aria-required="true"
                />
              </div>
              <Button
                type="submit"
                size="lg"
                className="tap-target mt-2 h-12 min-h-[48px] w-full rounded-xl bg-[var(--upside-purple)] text-white transition-colors hover:bg-[var(--upside-deep)] focus-visible:ring-2 focus-visible:ring-[var(--upside-purple)] focus-visible:ring-offset-2"
              >
                Schedule demo
              </Button>
            </motion.form>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-3 py-6 text-center"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--upside-lavender)]">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--upside-purple)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20,6 9,17 4,12" />
                </svg>
              </div>
              <p className="font-serif text-lg font-semibold text-[var(--upside-purple)]">
                We&apos;ll be in touch
              </p>
              <p className="text-sm text-muted-foreground">
                Expect to hear from our team within 24 hours.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
