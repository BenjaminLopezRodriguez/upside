"use client";

import { useState, useEffect } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Building01Icon,
  ArrowUpDownIcon,
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
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export type OrgMode = "personal" | "org";

interface OrgSwitcherProps {
  mode: OrgMode;
  activeOrgId: number | null;
  onSelect: (mode: OrgMode, orgId: number | null) => void;
}

export function OrgSwitcher({ mode, activeOrgId, onSelect }: OrgSwitcherProps) {
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);

  const { data: myOrgs, refetch: refetchOrgs } = api.organization.listMyOrgs.useQuery();

  // The membership object for the currently active org
  const activeMembership = myOrgs?.find((m) => m.organization.id === activeOrgId);
  const corporateOrgs = myOrgs?.filter((m) => m.organization.type === "corporate") ?? [];

  const handleOrgTabClick = () => {
    if (mode === "org") {
      // Already in org mode — open selector to switch
      setSelectorOpen(true);
      return;
    }
    if (corporateOrgs.length === 0) {
      // No orgs yet — go straight to create
      setCreateOpen(true);
    } else if (corporateOrgs.length === 1) {
      // Only one org — activate it directly
      onSelect("org", corporateOrgs[0]!.organization.id);
    } else {
      // Multiple orgs — open selector
      setSelectorOpen(true);
    }
  };

  const handlePersonalTabClick = () => {
    onSelect("personal", null);
  };

  return (
    <>
      {/* Find org (personal) + Segmented toggle */}
      <div className="flex min-w-0 flex-1 items-center gap-2">
        {mode === "personal" && (
          <>
            <button
              onClick={() => setJoinOpen(true)}
              className="flex shrink-0 items-center gap-1.5 rounded-md px-2 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              aria-label="Find an organization"
            >
              <HugeiconsIcon icon={SearchIcon} className="size-3.5 shrink-0" strokeWidth={2} />
              <span className="hidden sm:inline">Find an organization</span>
            </button>
            <div className="min-w-0 flex-1" aria-hidden />
          </>
        )}
        <div className="flex shrink-0 gap-0.5 rounded-lg bg-sidebar-accent/60 p-0.5">
          <button
            onClick={handlePersonalTabClick}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium transition-all",
              mode === "personal"
                ? "bg-sidebar text-sidebar-foreground shadow-sm"
                : "text-muted-foreground hover:text-sidebar-foreground",
            )}
            aria-label="Personal"
          >
            <HugeiconsIcon icon={User02Icon} className="size-3.5 shrink-0" strokeWidth={2} />
            <span className="hidden sm:inline">Personal</span>
          </button>
          <button
            onClick={handleOrgTabClick}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium transition-all",
              mode === "org"
                ? "bg-sidebar text-sidebar-foreground shadow-sm"
                : "text-muted-foreground hover:text-sidebar-foreground",
            )}
            aria-label="Organization"
          >
            <HugeiconsIcon icon={Building01Icon} className="size-3.5 shrink-0" strokeWidth={2} />
            <span className="hidden sm:inline">Organization</span>
          </button>
        </div>
      </div>

      {/* Active org chip (org mode) */}
      {mode === "org" && activeMembership && (
        <button
          onClick={() => setSelectorOpen(true)}
          className="mt-0.5 flex w-auto max-w-[13rem] shrink-0 items-center gap-1 rounded-md border border-border/60 bg-sidebar-accent/40 px-2 py-1.5 text-left transition-colors hover:bg-sidebar-accent/70 sm:mt-1"
          aria-label={`${activeMembership.organization.name}, ${activeMembership.role}. Switch organization`}
        >
          <div className="flex size-6 shrink-0 items-center justify-center rounded bg-primary/15 text-primary">
            {activeMembership.organization.logoUrl ? (
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
          <div className="hidden min-w-0 max-w-[7rem] shrink sm:block">
            <p className="truncate text-xs font-medium leading-tight">
              {activeMembership.organization.name}
            </p>
            <p className="truncate text-[10px] capitalize leading-tight text-muted-foreground">
              {activeMembership.role}
            </p>
          </div>
          <HugeiconsIcon
            icon={ArrowUpDownIcon}
            className="size-3.5 shrink-0 text-muted-foreground"
            strokeWidth={2}
          />
        </button>
      )}

      {/* ── Org selector dialog ─────────────────────────────────── */}
      <OrgSelectorDialog
        open={selectorOpen}
        onClose={() => setSelectorOpen(false)}
        orgs={corporateOrgs}
        activeOrgId={activeOrgId}
        onSelectOrg={(id) => {
          onSelect("org", id);
          setSelectorOpen(false);
        }}
        onCreateNew={() => {
          setSelectorOpen(false);
          setCreateOpen(true);
        }}
      />

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

// ─── Org selector ────────────────────────────────────────────────────────────

type OrgFilter = "owned" | "member";

interface OrgSelectorDialogProps {
  open: boolean;
  onClose: () => void;
  orgs: Array<{
    id: number;
    role: string;
    organization: { id: number; name: string; logoUrl: string | null; type: string };
  }>;
  activeOrgId: number | null;
  onSelectOrg: (id: number) => void;
  onCreateNew: () => void;
}

function OrgSelectorDialog({
  open,
  onClose,
  orgs,
  activeOrgId,
  onSelectOrg,
  onCreateNew,
}: OrgSelectorDialogProps) {
  const [filter, setFilter] = useState<OrgFilter>("owned");
  const [memberSearch, setMemberSearch] = useState("");

  useEffect(() => {
    if (filter === "owned") setMemberSearch("");
  }, [filter]);

  const filteredOrgs =
    filter === "owned"
      ? orgs.filter((m) => m.role === "owner")
      : orgs.filter((m) => m.role !== "owner");

  const displayedOrgs =
    filter === "member" && memberSearch.trim()
      ? filteredOrgs.filter((m) =>
          m.organization.name.toLowerCase().includes(memberSearch.trim().toLowerCase()),
        )
      : filteredOrgs;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Switch organization</DialogTitle>
          <DialogDescription>Select an organization to switch to.</DialogDescription>
        </DialogHeader>

        <div className="flex gap-0.5 rounded-lg bg-muted/60 p-0.5">
          <button
            type="button"
            onClick={() => setFilter("owned")}
            className={cn(
              "flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              filter === "owned"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            I own
          </button>
          <button
            type="button"
            onClick={() => setFilter("member")}
            className={cn(
              "flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              filter === "member"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            I&apos;m a member
          </button>
        </div>

        <div className="flex flex-col gap-1 py-1">
          {displayedOrgs.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">
              {filter === "owned"
                ? "You don't own any organizations yet."
                : filteredOrgs.length === 0
                  ? "You're not a member of any other organizations."
                  : "No organizations match your search."}
            </p>
          ) : (
            displayedOrgs.map((m) => (
              <button
                key={m.organization.id}
                onClick={() => onSelectOrg(m.organization.id)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-accent",
                  m.organization.id === activeOrgId && "bg-accent",
                )}
              >
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  {m.organization.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={m.organization.logoUrl}
                      alt=""
                      className="size-full rounded-lg object-contain"
                    />
                  ) : (
                    <HugeiconsIcon icon={Building01Icon} className="size-4" strokeWidth={2} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium">{m.organization.name}</p>
                  <p className="text-xs capitalize text-muted-foreground">{m.organization.type}</p>
                </div>
                {m.organization.id === activeOrgId && (
                  <HugeiconsIcon icon={Tick01Icon} className="size-4 shrink-0 text-primary" strokeWidth={2} />
                )}
              </button>
            ))
          )}
        </div>
        <div className="border-t pt-3">
          {filter === "owned" ? (
            <button
              onClick={onCreateNew}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <HugeiconsIcon icon={PlusSignIcon} className="size-4" strokeWidth={2} />
              Create new organization
            </button>
          ) : (
            <div className="relative">
              <HugeiconsIcon
                icon={SearchIcon}
                className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                strokeWidth={2}
              />
              <Input
                placeholder="Search organizations…"
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
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
