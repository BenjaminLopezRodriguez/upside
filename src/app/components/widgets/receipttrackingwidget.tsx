"use client";

import { useMemo, useState } from "react";
import {
  Field,
  FieldContent,
  FieldTitle,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type ReceiptStatus = "matched" | "pending";
type ReceiptCategory = "Travel" | "Software" | "Meals" | "Office" | "Other";

interface DemoReceipt {
  id: string;
  merchant: string;
  amount: string;
  category: ReceiptCategory;
  status: ReceiptStatus;
}

const DEMO_RECEIPTS: DemoReceipt[] = [
  { id: "1", merchant: "AWS", amount: "$1,240.00", category: "Software", status: "matched" },
  { id: "2", merchant: "United Airlines", amount: "$456.80", category: "Travel", status: "matched" },
  { id: "3", merchant: "WeWork", amount: "$2,100.00", category: "Office", status: "pending" },
  { id: "4", merchant: "Slack", amount: "$125.00", category: "Software", status: "matched" },
  { id: "5", merchant: "Chipotle", amount: "$34.50", category: "Meals", status: "matched" },
  { id: "6", merchant: "Hertz", amount: "$189.00", category: "Travel", status: "pending" },
];

const CATEGORIES: Array<ReceiptCategory | "All"> = ["All", "Travel", "Software", "Meals", "Office", "Other"];

const VISIBLE_INITIAL = 4;

export default function ReceiptTrackingWidget() {
  const [category, setCategory] = useState<string>("All");
  const [search, setSearch] = useState("");
  const [showAll, setShowAll] = useState(false);

  const filteredReceipts = useMemo(() => {
    return DEMO_RECEIPTS.filter((r) => {
      const matchCategory = category === "All" || r.category === category;
      const matchSearch =
        !search.trim() ||
        r.merchant.toLowerCase().includes(search.trim().toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [category, search]);

  const visibleReceipts = showAll
    ? filteredReceipts
    : filteredReceipts.slice(0, VISIBLE_INITIAL);
  const hasMore = filteredReceipts.length > VISIBLE_INITIAL && !showAll;

  return (
    <div className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-[var(--shadow-card)] ring-0 transition-shadow hover:shadow-[var(--shadow-card-hover)] md:flex">
      <div className="flex flex-1 flex-col p-6 sm:p-8 md:min-w-0">
        <p className="text-sm font-medium text-muted-foreground">
          Receipt tracking
        </p>
        <h3 className="mt-3 text-base font-semibold tracking-tight text-foreground">
          Every transaction, one matched receipt
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Try filtering and searching below. In production, receipts sync from
          your cards and stay audit-ready.
        </p>

        <div className="mt-5 flex flex-wrap gap-4">
          <Field>
            <FieldTitle className="sr-only">Category</FieldTitle>
            <FieldContent>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-[130px] rounded-lg">
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FieldContent>
          </Field>
          <Field>
            <FieldTitle className="sr-only">Search merchant</FieldTitle>
            <FieldContent>
              <Input
                type="search"
                placeholder="Search by merchant..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full min-w-[140px] max-w-[180px] rounded-lg"
              />
            </FieldContent>
          </Field>
        </div>

        <ul className="mt-5 flex flex-col gap-2 rounded-lg border border-border/50 bg-muted/10 p-4">
          {filteredReceipts.length === 0 ? (
            <li className="py-6 text-center text-sm text-muted-foreground">
              No receipts match. Try a different category or search.
            </li>
          ) : (
            <>
              {visibleReceipts.map((r) => (
                <li
                  key={r.id}
                  className={cn(
                    "flex flex-wrap items-center justify-between gap-2 rounded-md px-3.5 py-2.5 text-sm",
                    "hover:bg-muted/50"
                  )}
                >
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <span className="font-medium text-foreground truncate">
                      {r.merchant}
                    </span>
                    <span className="text-muted-foreground">{r.amount}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant="secondary" className="rounded-md text-xs">
                      {r.category}
                    </Badge>
                    <Badge
                      variant={r.status === "matched" ? "default" : "outline"}
                      className="rounded-md text-xs"
                    >
                      {r.status === "matched" ? "Matched" : "Pending"}
                    </Badge>
                  </div>
                </li>
              ))}
              {hasMore && (
                <li className="border-t border-border/40 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowAll(true)}
                    className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-2 focus-visible:outline focus-visible:ring-2 focus-visible:ring-ring"
                    aria-expanded={showAll}
                  >
                    Show all {filteredReceipts.length} receipts
                  </button>
                </li>
              )}
            </>
          )}
        </ul>
      </div>
      <div className="flex w-full items-center justify-center border-t border-border/50 bg-muted/20 p-8 md:w-1/3 md:min-w-[200px] md:border-t-0 md:border-l md:p-10">
        <div
          className="h-[220px] w-full max-w-[95px] rounded-lg border border-border/40 bg-muted/60"
          aria-hidden
        />
      </div>
    </div>
  );
}
