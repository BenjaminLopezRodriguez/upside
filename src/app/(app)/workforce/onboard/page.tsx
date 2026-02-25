"use client";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { Login01Icon } from "@hugeicons/core-free-icons";

export default function OnboardPage() {
  return (
    <div className="animate-page-in space-y-8">
      <PageHeader
        title="Onboard"
        description="Checklists, documents, and steps to get new hires up to speed."
        actions={
          <Button disabled>
            <HugeiconsIcon icon={Login01Icon} strokeWidth={2} data-icon="inline-start" />
            New checklist
          </Button>
        }
      />
      <div className="rounded-xl border border-dashed border-border bg-muted/30 py-12 text-center text-sm text-muted-foreground">
        Onboarding workflows coming soon. Manage checklists and documents here.
      </div>
    </div>
  );
}
