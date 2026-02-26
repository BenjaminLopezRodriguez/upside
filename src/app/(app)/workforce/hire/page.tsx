"use client";

import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { useOrg } from "@/contexts/org-context";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import { UserAdd01Icon, UserGroupIcon } from "@hugeicons/core-free-icons";

export default function HirePage() {
  const { activeOrgId } = useOrg();
  const [createOpen, setCreateOpen] = useState(false);

  const { data: roles, isLoading } = api.role.listByOrg.useQuery(
    { orgId: activeOrgId! },
    { enabled: activeOrgId != null },
  );

  return (
    <div className="animate-page-in space-y-8">
      <PageHeader
        title="Hire"
        description="Create roles and post them to job boards automatically."
        actions={
          <Button
            onClick={() => setCreateOpen(true)}
            disabled={activeOrgId == null}
          >
            <HugeiconsIcon icon={UserAdd01Icon} strokeWidth={2} data-icon="inline-start" />
            New role
          </Button>
        }
      />

      {activeOrgId == null ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <HugeiconsIcon icon={UserGroupIcon} className="size-6" />
              </EmptyMedia>
              <EmptyTitle>Organization required</EmptyTitle>
              <EmptyDescription>
                Use the switcher above to select an organization to create and manage job roles.
              </EmptyDescription>
            </EmptyHeader>
          </CardContent>
        </Card>
      ) : (
        <Card className="transition-shadow duration-200 hover:shadow-md">
          <CardHeader>
            <CardTitle>Open roles</CardTitle>
            <CardDescription>
              {roles?.length ?? 0} role{(roles?.length ?? 0) !== 1 ? "s" : ""}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="border-border flex flex-col gap-0 border-t">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-4 px-6 py-4">
                    <div className="h-5 w-48 animate-pulse rounded bg-muted" />
                    <div className="h-5 w-24 animate-pulse rounded bg-muted" />
                    <div className="h-5 w-32 animate-pulse rounded bg-muted" />
                  </div>
                ))}
              </div>
            ) : roles && roles.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Role</TableHead>
                    <TableHead className="hidden sm:table-cell">Department</TableHead>
                    <TableHead className="hidden md:table-cell">Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Job boards</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roles.map((role) => (
                    <TableRow key={role.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{role.title}</p>
                          <p className="text-muted-foreground line-clamp-1 text-sm">
                            {role.description}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-muted-foreground text-sm">
                        {role.department ?? "—"}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                        {role.location ?? "—"}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={role.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        {role.postedTo.length > 0 ? (
                          <span className="text-muted-foreground text-xs">
                            Posted to {role.postedTo.join(", ")}
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-xs">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <Empty className="border-border mx-4 mb-4 rounded-lg border border-dashed py-12">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <HugeiconsIcon icon={UserAdd01Icon} className="size-6" />
                  </EmptyMedia>
                  <EmptyTitle>No roles yet</EmptyTitle>
                  <EmptyDescription>
                    Create your first role to post to LinkedIn, Indeed, and Greenhouse.
                  </EmptyDescription>
                </EmptyHeader>
                <Button onClick={() => setCreateOpen(true)}>
                  <HugeiconsIcon icon={UserAdd01Icon} strokeWidth={2} data-icon="inline-start" />
                  New role
                </Button>
              </Empty>
            )}
          </CardContent>
        </Card>
      )}

      <CreateRoleDialog
        orgId={activeOrgId}
        open={createOpen}
        onOpenChange={setCreateOpen}
      />
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: "draft" | "open" | "closed";
}) {
  const config = {
    draft: { label: "Draft", className: "bg-muted text-muted-foreground" },
    open: { label: "Open", className: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400" },
    closed: { label: "Closed", className: "bg-muted text-muted-foreground" },
  }[status];
  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
}

function CreateRoleDialog({
  orgId,
  open,
  onOpenChange,
}: {
  orgId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const utils = api.useUtils();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [department, setDepartment] = useState("");
  const [location, setLocation] = useState("");
  const [postToJobBoards, setPostToJobBoards] = useState(true);

  const create = api.role.create.useMutation({
    onSuccess: () => {
      toast.success("Role created and posted to job boards");
      void utils.role.listByOrg.invalidate();
      onOpenChange(false);
      setTitle("");
      setDescription("");
      setDepartment("");
      setLocation("");
      setPostToJobBoards(true);
    },
    onError: (e) => toast.error(e.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgId || !title.trim() || !description.trim()) return;
    create.mutate({
      orgId,
      title: title.trim(),
      description: description.trim(),
      department: department.trim() || undefined,
      location: location.trim() || undefined,
      postToJobBoards,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New role</DialogTitle>
          <DialogDescription>
            Create a role and post it to job boards (LinkedIn, Indeed, Greenhouse) automatically.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field>
            <FieldLabel>Title</FieldLabel>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Senior Software Engineer"
              required
            />
          </Field>
          <Field>
            <FieldLabel>Description</FieldLabel>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Responsibilities, requirements, and what you offer…"
              rows={4}
              required
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel>Department (optional)</FieldLabel>
              <Input
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g. Engineering"
              />
            </Field>
            <Field>
              <FieldLabel>Location (optional)</FieldLabel>
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Remote, NYC"
              />
            </Field>
          </div>
          <label className="flex items-center gap-3 rounded-xl border border-border px-4 py-3 cursor-pointer hover:bg-muted/50 transition-colors">
            <Checkbox
              checked={postToJobBoards}
              onCheckedChange={(v) => setPostToJobBoards(Boolean(v))}
            />
            <div>
              <p className="text-sm font-medium">Post to job boards</p>
              <p className="text-muted-foreground text-xs">
                Automatically publish this role to LinkedIn, Indeed, and Greenhouse.
              </p>
            </div>
          </label>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!orgId || !title.trim() || !description.trim() || create.isPending}
            >
              {create.isPending ? "Creating…" : "Create & post"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
