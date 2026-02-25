"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { CreditCardIcon, UserGroupIcon } from "@hugeicons/core-free-icons";
import { api } from "@/trpc/react";
import { useOrg } from "@/contexts/org-context";
import { OrgRequiredEmptyState } from "@/components/org-required-empty-state";
import { PaymentCard } from "@/components/payment-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import type { RouterOutputs } from "@/trpc/react";

type CardRequest = RouterOutputs["card"]["listCardRequestsForOrg"][number];

function ApproveRequestDialog({
  request,
  open,
  onOpenChange,
}: {
  request: CardRequest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const utils = api.useUtils();
  const [cardName, setCardName] = useState("");
  const [type, setType] = useState<"virtual" | "physical">("virtual");
  const [spendLimit, setSpendLimit] = useState("500");

  const approve = api.card.approveCardRequestAndIssue.useMutation({
    onSuccess: () => {
      toast.success(`Card issued to ${request?.user.name ?? "member"}`);
      void utils.card.listForOrg.invalidate();
      void utils.card.listCardRequestsForOrg.invalidate();
      onOpenChange(false);
      setCardName("");
      setSpendLimit("500");
    },
    onError: (e) => toast.error(e.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!request) return;
    const limitCents = Math.round(parseFloat(spendLimit) * 100);
    if (!cardName.trim() || isNaN(limitCents) || limitCents < 100) return;
    approve.mutate({
      requestId: request.id,
      cardName: cardName.trim(),
      type,
      spendLimit: limitCents,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Issue card to {request?.user.name}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          <div className="space-y-2">
            <Label htmlFor="req-card-name">Card name</Label>
            <Input
              id="req-card-name"
              value={cardName}
              onChange={(e) => setCardName(e.target.value)}
              placeholder="e.g. Travel expenses"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="req-card-type">Card type</Label>
            <Select value={type} onValueChange={(v) => setType(v as "virtual" | "physical")}>
              <SelectTrigger id="req-card-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="virtual">Virtual</SelectItem>
                <SelectItem value="physical">Physical</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="req-spend-limit">Spend limit ($)</Label>
            <Input
              id="req-spend-limit"
              type="number"
              min={1}
              step={1}
              value={spendLimit}
              onChange={(e) => setSpendLimit(e.target.value)}
              required
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={approve.isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={approve.isPending || !cardName.trim()}>
              {approve.isPending ? "Issuing…" : "Issue card"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function CompanyCardsPage() {
  const { activeOrgId, mode } = useOrg();
  const utils = api.useUtils();
  const [approvingRequest, setApprovingRequest] = useState<CardRequest | null>(null);

  const { data: cards, isLoading } = api.card.listForOrg.useQuery(
    { orgId: activeOrgId! },
    { enabled: activeOrgId != null },
  );

  const { data: requests = [] } = api.card.listCardRequestsForOrg.useQuery(
    { orgId: activeOrgId! },
    { enabled: activeOrgId != null },
  );

  const denyRequest = api.card.denyCardRequest.useMutation({
    onSuccess: () => {
      toast.success("Request denied");
      void utils.card.listCardRequestsForOrg.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  if (mode === "personal" || activeOrgId == null) {
    return <OrgRequiredEmptyState />;
  }

  return (
    <div className="space-y-6 py-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Company Cards</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          All cards issued to members of your organization.
        </p>
      </div>

      {requests.length > 0 && (
        <section className="rounded-xl border border-border bg-muted/30 p-5">
          <h2 className="text-sm font-semibold flex items-center gap-2 mb-3">
            <HugeiconsIcon icon={UserGroupIcon} className="size-4" strokeWidth={2} />
            Pending card requests
          </h2>
          <p className="text-muted-foreground text-sm mb-4">
            Members requested a card from their personal dashboard. Issue a card or deny the request.
          </p>
          <ul className="space-y-2">
            {requests.map((req) => (
              <li
                key={req.id}
                className="flex items-center justify-between gap-4 rounded-lg border border-border bg-background px-4 py-3"
              >
                <div>
                  <p className="font-medium">{req.user.name}</p>
                  <p className="text-muted-foreground text-xs">
                    Requested {new Date(req.requestedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => denyRequest.mutate({ requestId: req.id })}
                    disabled={denyRequest.isPending}
                  >
                    Deny
                  </Button>
                  <Button size="sm" onClick={() => setApprovingRequest(req)}>
                    Issue card
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <ApproveRequestDialog
        request={approvingRequest}
        open={approvingRequest != null}
        onOpenChange={(o) => !o && setApprovingRequest(null)}
      />

      {isLoading || activeOrgId == null ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[1.586] w-full rounded-2xl" />
          ))}
        </div>
      ) : cards && cards.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <div key={card.id} className="space-y-2">
              <PaymentCard
                cardName={card.cardName}
                last4={card.last4}
                type={card.type}
                status={card.status}
                spendLimitCents={card.spendLimit}
                currentSpendCents={card.currentSpend}
                cardColor={card.cardColor}
                issuerLogo={card.logoUrl ? <img src={card.logoUrl} alt="" className="h-full w-full object-contain" /> : undefined}
              />
              <p className="px-1 text-xs text-muted-foreground">{card.user.name}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed px-5 py-16 text-center">
          <HugeiconsIcon
            icon={CreditCardIcon}
            strokeWidth={1.5}
            className="size-10 text-muted-foreground/50"
          />
          <p className="text-sm text-muted-foreground">
            No cards issued yet. Use the Members page to issue cards to your
            team.
          </p>
        </div>
      )}
    </div>
  );
}
