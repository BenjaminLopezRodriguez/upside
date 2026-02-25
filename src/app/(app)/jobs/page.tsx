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
import { Briefcase01Icon } from "@hugeicons/core-free-icons";

export default function JobsPage() {
  return (
    <div className="animate-page-in space-y-8">
      <PageHeader
        title="Jobs"
        description="Roles you’ve applied to or saved from organizations you’re connected to."
        actions={
          <Button disabled>
            <HugeiconsIcon icon={Briefcase01Icon} strokeWidth={2} data-icon="inline-start" />
            Find roles
          </Button>
        }
      />
      <Empty className="rounded-xl border border-dashed border-border bg-muted/30 py-12">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <HugeiconsIcon icon={Briefcase01Icon} className="size-6" />
          </EmptyMedia>
          <EmptyTitle>Your jobs</EmptyTitle>
          <EmptyDescription>
            When you apply to roles or save jobs from organizations, they’ll appear here.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    </div>
  );
}
