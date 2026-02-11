"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldContent,
  FieldGroup,
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

export default function CardIssuingWidget() {
  const [cardType, setCardType] = useState<string>("virtual");
  const [limit, setLimit] = useState("");
  const [name, setName] = useState("");

  return (
    <div className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-[var(--shadow-card)] ring-0 transition-shadow hover:shadow-[var(--shadow-card-hover)] md:flex">
      <div className="flex-1 p-6 sm:p-8 md:min-w-0">
        <p className="text-sm font-medium text-muted-foreground">
          Card issuing
        </p>
        <h3 className="mt-3 text-base font-semibold tracking-tight text-foreground">
          Issue a new card in minutes
        </h3>
        <form
          className="mt-7 space-y-5"
          onSubmit={(e) => e.preventDefault()}
        >
          <FieldGroup>
            <Field>
              <FieldTitle>Card type</FieldTitle>
              <FieldContent>
                <Select value={cardType} onValueChange={setCardType}>
                  <SelectTrigger className="w-full rounded-lg">
                    <SelectValue placeholder="Virtual or physical" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="virtual">Virtual</SelectItem>
                    <SelectItem value="physical">Physical</SelectItem>
                  </SelectContent>
                </Select>
              </FieldContent>
            </Field>
            <Field>
              <FieldTitle>Spend limit</FieldTitle>
              <FieldContent>
                <Input
                  type="text"
                  placeholder="e.g. 10,000 USD"
                  value={limit}
                  onChange={(e) => setLimit(e.target.value)}
                  className="rounded-lg"
                />
              </FieldContent>
            </Field>
            <Field>
              <FieldTitle>Card name</FieldTitle>
              <FieldContent>
                <Input
                  type="text"
                  placeholder="e.g. Marketing, Q1 campaign"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="rounded-lg"
                />
              </FieldContent>
            </Field>
          </FieldGroup>
          <Button type="submit" className="mt-1 rounded-full w-full sm:w-auto">
            Create card
          </Button>
          <p className="mt-3 text-xs text-muted-foreground">
            Demo. In production, cards are issued via API.
          </p>
        </form>
      </div>
      <div className="flex w-full items-center justify-center border-t border-border/50 bg-muted/20 p-8 md:w-1/3 md:min-w-[200px] md:border-t-0 md:border-l md:p-10">
        <div
          className="aspect-[1.586/1] w-full max-w-[180px] rounded-lg border border-border/40 bg-muted/60"
          aria-hidden
        />
      </div>
    </div>
  );
}
