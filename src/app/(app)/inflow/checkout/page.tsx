"use client";

import { PageHeader } from "@/components/page-header";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { HugeiconsIcon } from "@hugeicons/react";
import { ShoppingCartCheckOut01Icon } from "@hugeicons/core-free-icons";

export default function InflowCheckoutPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Checkout pages"
        description="Create hosted checkout pages to collect one-time or recurring payments. Share a link or embed on your site."
      />
      <Empty>
        <EmptyMedia>
          <HugeiconsIcon icon={ShoppingCartCheckOut01Icon} className="size-12 text-muted-foreground" strokeWidth={1.5} />
        </EmptyMedia>
        <EmptyHeader>
          <EmptyTitle>No checkout pages yet</EmptyTitle>
          <EmptyDescription>
            Create a checkout page to start accepting payments. You can customize amounts, descriptions, and success URLs.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    </div>
  );
}
