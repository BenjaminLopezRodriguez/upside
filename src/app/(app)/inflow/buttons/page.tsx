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
import { Cursor01Icon } from "@hugeicons/core-free-icons";

export default function InflowButtonsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Buttons"
        description="Create payment buttons and links to embed in emails, docs, or anywhere you share a link. One-click pay with preset amounts."
      />
      <Empty>
        <EmptyMedia>
          <HugeiconsIcon icon={Cursor01Icon} className="size-12 text-muted-foreground" strokeWidth={1.5} />
        </EmptyMedia>
        <EmptyHeader>
          <EmptyTitle>No buttons yet</EmptyTitle>
          <EmptyDescription>
            Add a payment button or link to let customers pay with a single click. Set a fixed amount or let them choose.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    </div>
  );
}
