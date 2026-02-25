"use client";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { HugeiconsIcon } from "@hugeicons/react";
import { GlobeIcon } from "@hugeicons/core-free-icons";

export default function PortalsPage() {
  return (
    <div className="animate-page-in space-y-8">
      <PageHeader
        title="Portals"
        description="Quick access to forms, links, and tools shared with you by organizations."
        actions={
          <Button disabled>
            <HugeiconsIcon icon={GlobeIcon} strokeWidth={2} data-icon="inline-start" />
            Open portal
          </Button>
        }
      />
      <Empty className="rounded-xl border border-dashed border-border bg-muted/30 py-12">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <HugeiconsIcon icon={GlobeIcon} className="size-6" />
          </EmptyMedia>
          <EmptyTitle>No portals yet</EmptyTitle>
          <EmptyDescription>
            When organizations share portals with you (expense forms, request links, etc.), they’ll show up here.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    </div>
  );
}
