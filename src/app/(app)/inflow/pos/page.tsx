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
import { Store01Icon } from "@hugeicons/core-free-icons";

export default function InflowPosPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="POS & menus"
        description="Connect point-of-sale systems, build digital menus, or integrate with ordering and table-service apps to accept payments in-person or online."
      />
      <Empty>
        <EmptyMedia>
          <HugeiconsIcon icon={Store01Icon} className="size-12 text-muted-foreground" strokeWidth={1.5} />
        </EmptyMedia>
        <EmptyHeader>
          <EmptyTitle>No POS or menu integrations yet</EmptyTitle>
          <EmptyDescription>
            Connect a POS, publish a menu, or add an ordering integration to accept payments at your location or through partners.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    </div>
  );
}
