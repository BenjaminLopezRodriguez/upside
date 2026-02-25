"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { Building01Icon } from "@hugeicons/core-free-icons";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";

/**
 * Shown in place of org-only page content when the user is in personal mode
 * or has no active organization selected.
 */
export function OrgRequiredEmptyState() {
  return (
    <div className="py-6">
      <Empty className="border border-dashed">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <HugeiconsIcon icon={Building01Icon} className="size-6" strokeWidth={2} />
          </EmptyMedia>
          <EmptyTitle>Organization required</EmptyTitle>
          <EmptyDescription>
            Use the switcher above to select an organization to access this section.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    </div>
  );
}
