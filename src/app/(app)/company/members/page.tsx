"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  UserGroupIcon,
  UserAdd01Icon,
  Settings01Icon,
} from "@hugeicons/core-free-icons";
import { api } from "@/trpc/react";
import { useOrg } from "@/contexts/org-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function MembersPage() {
  const { activeOrgId } = useOrg();

  // Skip the query if we don't have an active org yet — avoids fetching members
  // of the wrong (or no) org.
  const { data: members, isLoading } = api.organization.listMembers.useQuery(
    { orgId: activeOrgId! },
    { enabled: activeOrgId != null },
  );

  return (
    <div className="space-y-6 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Members</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your team and their access permissions.
          </p>
        </div>
        <Button disabled>
          <HugeiconsIcon icon={UserAdd01Icon} strokeWidth={2} className="mr-2 size-4" />
          Invite member
        </Button>
      </div>

      <div className="divide-y rounded-xl border bg-card">
        {isLoading || activeOrgId == null ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-4">
              <Skeleton className="size-9 rounded-full" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
            </div>
          ))
        ) : members && members.length > 0 ? (
          members.map((m) => (
            <div key={m.id} className="flex items-center gap-4 px-5 py-4">
              <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                {m.user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium">{m.user.name}</p>
                <p className="truncate text-xs text-muted-foreground">{m.user.email}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={m.role === "owner" ? "default" : "secondary"}>
                  {m.role}
                </Badge>
                {m.role !== "owner" && (
                  <Button variant="ghost" size="icon" className="size-8" disabled>
                    <HugeiconsIcon icon={Settings01Icon} strokeWidth={2} className="size-4" />
                  </Button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center gap-3 px-5 py-12 text-center">
            <HugeiconsIcon
              icon={UserGroupIcon}
              strokeWidth={1.5}
              className="size-10 text-muted-foreground/50"
            />
            <p className="text-sm text-muted-foreground">
              No members yet. Invite your team to get started.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
