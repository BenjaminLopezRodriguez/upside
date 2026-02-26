"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Building01Icon,
  ArrowDown01Icon,
  PlusSignIcon,
  SearchIcon,
  GlobeIcon,
  User02Icon,
  Tick01Icon,
  Cancel01Icon,
} from "@hugeicons/core-free-icons";
import { toast } from "sonner";

import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export type OrgMode = "personal" | "org";

interface OrgSwitcherProps {
  mode: OrgMode;
  activeOrgId: number | null;
  onSelect: (mode: OrgMode, orgId: number | null) => void;
}

export function OrgSwitcher({ mode, activeOrgId, onSelect }: OrgSwitcherProps) {
  const [createOpen, setCreateOpen] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);

  const { data: myOrgs, refetch: refetchOrgs } = api.organization.listMyOrgs.useQuery(undefined, {
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });

  // The membership object for the currently active org
  const activeMembership = myOrgs?.find((m) => m.organization.id === activeOrgId);
  const corporateOrgs = myOrgs?.filter((m) => m.organization.type === "corporate") ?? [];

  const triggerLabel =
    mode === "personal"
      ? "Me"
      : activeMembership
        ? activeMembership.organization.name
        : "Select company";

  return (
    <>
      {/* Single dropdown: "Who am I acting as?" */}
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <button
              type="button"
              className="flex min-w-0 max-w-56 shrink-0 items-center gap-2 rounded-lg border border-border/60 bg-sidebar-accent/40 px-2.5 py-1.5 text-left transition-colors hover:bg-sidebar-accent/70 sm:max-w-64"
              aria-label={
                mode === "personal"
                  ? "Viewing as you. Switch to a company or find one."
                  : activeMembership
                    ? `Viewing as ${activeMembership.organization.name}. Switch context.`
                    : "Select who you're acting as"
              }
            />
          }
        >
          <div className="flex size-6 shrink-0 items-center justify-center rounded bg-primary/15 text-primary">
            {mode === "personal" ? (
              <HugeiconsIcon icon={User02Icon} className="size-3.5" strokeWidth={2} />
            ) : activeMembership?.organization.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={activeMembership.organization.logoUrl}
                alt=""
                className="size-full rounded object-contain"
              />
            ) : (
              <HugeiconsIcon icon={Building01Icon} className="size-3.5" strokeWidth={2} />
            )}
          </div>
          <span className="min-w-0 truncate text-xs font-medium sm:text-sm">{triggerLabel}</span>
          <HugeiconsIcon
            icon={ArrowDown01Icon}
            className="size-3.5 shrink-0 text-muted-foreground"
            strokeWidth={2}
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="min-w-48">
          <DropdownMenuItem
            onClick={() => onSelect("personal", null)}
            className="gap-2.5"
          >
            <HugeiconsIcon icon={User02Icon} className="size-4" strokeWidth={2} />
            <span>Me</span>
            {mode === "personal" && (
              <HugeiconsIcon icon={Tick01Icon} className="ml-auto size-4 text-primary" strokeWidth={2} />
            )}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuLabel>Companies</DropdownMenuLabel>
            {corporateOrgs.length === 0 ? (
              <p className="px-3 py-2 text-xs text-muted-foreground">
                No companies yet. Create or find one below.
              </p>
            ) : (
              corporateOrgs.map((m) => (
                <DropdownMenuItem
                  key={m.organization.id}
                  onClick={() => onSelect("org", m.organization.id)}
                  className="gap-2.5"
                >
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                    {m.organization.logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={m.organization.logoUrl}
                        alt=""
                        className="size-full rounded-md object-contain"
                      />
                    ) : (
                      <HugeiconsIcon icon={Building01Icon} className="size-3.5" strokeWidth={2} />
                    )}
                  </div>
                  <span className="min-w-0 truncate">{m.organization.name}</span>
                  {mode === "org" && activeOrgId === m.organization.id && (
                    <HugeiconsIcon icon={Tick01Icon} className="ml-auto size-4 text-primary" strokeWidth={2} />
                  )}
                </DropdownMenuItem>
              ))
            )}
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setCreateOpen(true)} className="gap-2.5">
            <HugeiconsIcon icon={PlusSignIcon} className="size-4" strokeWidth={2} />
            Create company
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setJoinOpen(true)} className="gap-2.5">
            <HugeiconsIcon icon={SearchIcon} className="size-4" strokeWidth={2} />
            Find company
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* ── Create org dialog ────────────────────────────────────── */}
      <CreateOrgDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={(orgId) => {
          void refetchOrgs();
          onSelect("org", orgId);
          setCreateOpen(false);
        }}
      />

      {/* ── Join org dialog ──────────────────────────────────────── */}
      <JoinOrgDialog
        open={joinOpen}
        onClose={() => setJoinOpen(false)}
        onJoined={(orgId) => {
          void refetchOrgs();
          onSelect("org", orgId);
          setJoinOpen(false);
        }}
      />
    </>
  );
}

// ─── Create org ──────────────────────────────────────────────────────────────

interface CreateOrgDialogProps {
  open: boolean;
  onClose: () => void;
  onCreated: (orgId: number) => void;
}

function CreateOrgDialog({ open, onClose, onCreated }: CreateOrgDialogProps) {
  const [name, setName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");

  const createOrg = api.organization.createOrg.useMutation({
    onSuccess: (org) => {
      toast.success(`"${org.name}" created!`);
      setName("");
      setLogoUrl("");
      onCreated(org.id);
    },
    onError: (err) => toast.error(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    createOrg.mutate({ name: name.trim(), logoUrl: logoUrl.trim() || undefined });
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Create organization</DialogTitle>
          <DialogDescription>
            Set up a new organization. You&apos;ll become the owner.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          <div className="space-y-1.5">
            <Label htmlFor="new-org-name">Organization name *</Label>
            <Input
              id="new-org-name"
              placeholder="Acme Corp"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="new-org-logo">
              Logo URL{" "}
              <span className="font-normal text-muted-foreground">(optional)</span>
            </Label>
            <Input
              id="new-org-logo"
              type="url"
              placeholder="https://example.com/logo.png"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
            />
          </div>
          <div className="flex gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onClose}
              disabled={createOrg.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={createOrg.isPending || !name.trim()}
            >
              {createOrg.isPending ? "Creating…" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Join org ────────────────────────────────────────────────────────────────

interface JoinOrgDialogProps {
  open: boolean;
  onClose: () => void;
  onJoined: (orgId: number) => void;
}

function JoinOrgDialog({ open, onClose, onJoined }: JoinOrgDialogProps) {
  const [query, setQuery] = useState("");
  const [joiningId, setJoiningId] = useState<number | null>(null);

  const { data: results, isFetching } = api.organization.searchOrgs.useQuery(
    { query },
    { enabled: query.trim().length >= 1 },
  );

  const joinOrg = api.organization.joinOrg.useMutation({
    onSuccess: (_, vars) => {
      toast.success("Joined organization!");
      setQuery("");
      setJoiningId(null);
      onJoined(vars.orgId);
    },
    onError: (err) => {
      toast.error(err.message);
      setJoiningId(null);
    },
  });

  const handleJoin = (orgId: number) => {
    setJoiningId(orgId);
    joinOrg.mutate({ orgId });
  };

  const handleClose = () => {
    setQuery("");
    setJoiningId(null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Find an organization</DialogTitle>
          <DialogDescription>
            Search by name and join to access shared resources.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 pt-1">
          {/* Search input */}
          <div className="relative">
            <HugeiconsIcon
              icon={SearchIcon}
              className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              strokeWidth={2}
            />
            <Input
              placeholder="Search organizations…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9"
              autoFocus
            />
          </div>

          {/* Results */}
          <div className="min-h-[120px]">
            {!query.trim() ? (
              <div className="flex flex-col items-center gap-2 py-8 text-center">
                <HugeiconsIcon
                  icon={GlobeIcon}
                  className="size-8 text-muted-foreground/40"
                  strokeWidth={1.5}
                />
                <p className="text-xs text-muted-foreground">
                  Type to search for organizations
                </p>
              </div>
            ) : isFetching ? (
              <div className="space-y-2 py-1">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 px-1 py-2">
                    <Skeleton className="size-8 rounded-lg" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-3.5 w-32" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                ))}
              </div>
            ) : results && results.length > 0 ? (
              <div className="space-y-0.5">
                {results.map((org) => (
                  <div
                    key={org.id}
                    className="flex items-center gap-3 rounded-lg px-2 py-2.5 hover:bg-accent"
                  >
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      {org.logoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={org.logoUrl}
                          alt=""
                          className="size-full rounded-lg object-contain"
                        />
                      ) : (
                        <HugeiconsIcon icon={Building01Icon} className="size-4" strokeWidth={2} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-medium">{org.name}</p>
                      <p className="text-xs capitalize text-muted-foreground">{org.type}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 shrink-0 px-2.5 text-xs"
                      onClick={() => handleJoin(org.id)}
                      disabled={joiningId === org.id}
                    >
                      {joiningId === org.id ? (
                        <HugeiconsIcon icon={Cancel01Icon} className="size-3" strokeWidth={2} />
                      ) : (
                        "Join"
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <p className="text-sm text-muted-foreground">
                  No organizations found for &ldquo;{query}&rdquo;
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
