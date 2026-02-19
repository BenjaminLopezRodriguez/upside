"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { CreditCardIcon } from "@hugeicons/core-free-icons";
import { api } from "@/trpc/react";
import { useOrg } from "@/contexts/org-context";
import { PaymentCard } from "@/components/payment-card";
import { Skeleton } from "@/components/ui/skeleton";

export default function CompanyCardsPage() {
  const { activeOrgId } = useOrg();

  const { data: cards, isLoading } = api.card.listForOrg.useQuery(
    { orgId: activeOrgId! },
    { enabled: activeOrgId != null },
  );

  return (
    <div className="space-y-6 py-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Company Cards</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          All cards issued to members of your organization.
        </p>
      </div>

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
