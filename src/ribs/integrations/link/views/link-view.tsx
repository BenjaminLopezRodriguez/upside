"use client";

import { useState } from "react";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import { LinkIntegrationRib } from "../rib";
import type { IntegrationLink, LinkType, CreateLinkData } from "../rib";
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
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
import {
  PlusSignIcon,
  Link01Icon,
  QrCode01Icon,
  ShoppingCart01Icon,
  MoneyReceiveSquareIcon,
  Copy01Icon,
  FilterIcon,
} from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";

const LINK_TYPE_CONFIG: Record<
  LinkType,
  {
    label: string;
    description: string;
    icon: IconSvgElement;
    badgeClass: string;
  }
> = {
  receipt_scanner: {
    label: "Receipt Scanner",
    description:
      "Workers scan a QR code to submit receipts directly to the platform. Tied to a card or cost center.",
    icon: QrCode01Icon,
    badgeClass:
      "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/30 dark:text-violet-400 dark:border-violet-800",
  },
  order_pool: {
    label: "Order Pool",
    description:
      "Share a link for teammates to add items to a group order. Submissions roll up into a single purchase request.",
    icon: ShoppingCart01Icon,
    badgeClass:
      "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800",
  },
  fund_request: {
    label: "Fund Request",
    description:
      "A shareable form for team members to request funds. Each submission creates an approval workflow.",
    icon: MoneyReceiveSquareIcon,
    badgeClass:
      "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800",
  },
};

const FILTER_OPTIONS: { label: string; value: LinkType | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Receipt Scanners", value: "receipt_scanner" },
  { label: "Order Pools", value: "order_pool" },
  { label: "Fund Requests", value: "fund_request" },
];

export function LinkIntegrationView() {
  const vm = LinkIntegrationRib.useViewModel();
  const createRoute = LinkIntegrationRib.useRoute("createLink");

  return (
    <div className="animate-page-in space-y-8">
      <PageHeader
        title="Link"
        description="Create shareable links for receipt collection, group ordering, and fund requests."
        actions={
          <Button onClick={vm.openCreate}>
            <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} data-icon="inline-start" />
            Create Link
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Active Links"
          value={String(vm.activeCount)}
          icon={Link01Icon}
          className="animate-page-in stagger-1"
        />
        <StatCard
          label="Total Submissions"
          value={String(vm.totalSubmissions)}
          icon={QrCode01Icon}
          className="animate-page-in stagger-2"
        />
        <StatCard
          label="Link Types"
          value="3"
          icon={FilterIcon}
          className="animate-page-in stagger-3"
        />
      </div>

      {/* Type cards (info) */}
      <div className="grid gap-4 sm:grid-cols-3 animate-page-in stagger-4">
        {(["receipt_scanner", "order_pool", "fund_request"] as LinkType[]).map(
          (type) => {
            const cfg = LINK_TYPE_CONFIG[type];
            return (
              <Card
                key={type}
                className="transition-[box-shadow,transform] duration-200 ease-[var(--ease-out-smooth)] hover:shadow-[0_4px_12px_0_rgb(0_0_0/0.06),0_1px_3px_0_rgb(0_0_0/0.04)] dark:hover:shadow-[0_4px_16px_0_rgb(0_0_0/0.3),0_1px_4px_0_rgb(0_0_0/0.2)] hover:-translate-y-0.5"
              >
                <CardHeader className="pb-2">
                  <div className="mb-1 flex size-9 items-center justify-center rounded-xl bg-muted">
                    <HugeiconsIcon icon={cfg.icon} className="size-5 text-muted-foreground" strokeWidth={1.5} />
                  </div>
                  <CardTitle className="text-base">{cfg.label}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {cfg.description}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={() => {
                      vm.setFilterType(type);
                      vm.openCreate();
                    }}
                  >
                    <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} data-icon="inline-start" />
                    Create
                  </Button>
                </CardContent>
              </Card>
            );
          },
        )}
      </div>

      {/* Filter + table */}
      <Card className="transition-[box-shadow] duration-200 ease-[var(--ease-out-smooth)] hover:shadow-[0_4px_12px_0_rgb(0_0_0/0.06),0_1px_3px_0_rgb(0_0_0/0.04)] dark:hover:shadow-[0_4px_16px_0_rgb(0_0_0/0.3),0_1px_4px_0_rgb(0_0_0/0.2)]">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>All Links</CardTitle>
            <CardDescription>
              {vm.filteredLinks.length} link
              {vm.filteredLinks.length !== 1 ? "s" : ""}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Select
              value={vm.filterType}
              onValueChange={(v) => vm.setFilterType(v as LinkType | "all")}
              items={FILTER_OPTIONS}
            >
              <SelectTrigger className="w-[170px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {FILTER_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {vm.filteredLinks.length === 0 ? (
            <Empty className="border-border mx-4 mb-4 rounded-lg border border-dashed py-12">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <HugeiconsIcon icon={Link01Icon} className="size-6" />
                </EmptyMedia>
                <EmptyTitle>No links yet</EmptyTitle>
                <EmptyDescription>
                  Create your first link to start collecting receipts, pooling orders, or handling fund requests.
                </EmptyDescription>
              </EmptyHeader>
              <Button onClick={vm.openCreate}>
                <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} data-icon="inline-start" />
                Create Link
              </Button>
            </Empty>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden sm:table-cell">Type</TableHead>
                  <TableHead className="hidden md:table-cell">URL</TableHead>
                  <TableHead className="hidden lg:table-cell">Created By</TableHead>
                  <TableHead className="text-right">Submissions</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[80px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {vm.filteredLinks.map((link) => (
                  <LinkRow
                    key={link.id}
                    link={link}
                    onCopy={() => vm.copyLink(link.url)}
                    onToggle={() => vm.toggleLink(link.id)}
                  />
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <CreateLinkDialog
        open={createRoute.attached}
        defaultType={vm.filterType === "all" ? "receipt_scanner" : vm.filterType}
        onClose={vm.closeCreate}
        onCreate={vm.createLink}
      />
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  className,
}: {
  label: string;
  value: string;
  icon: IconSvgElement;
  className?: string;
}) {
  return (
    <Card className={cn("transition-[box-shadow,transform] duration-200 ease-[var(--ease-out-smooth)] hover:shadow-[0_4px_12px_0_rgb(0_0_0/0.06),0_1px_3px_0_rgb(0_0_0/0.04)] dark:hover:shadow-[0_4px_16px_0_rgb(0_0_0/0.3),0_1px_4px_0_rgb(0_0_0/0.2)] hover:-translate-y-0.5", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardDescription>{label}</CardDescription>
        <span className="text-muted-foreground" aria-hidden="true">
          <HugeiconsIcon icon={Icon} className="size-5" strokeWidth={1.5} />
        </span>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold tracking-tight tabular-nums">{value}</p>
      </CardContent>
    </Card>
  );
}

function LinkRow({
  link,
  onCopy,
  onToggle,
}: {
  link: IntegrationLink;
  onCopy: () => void;
  onToggle: () => void;
}) {
  const cfg = LINK_TYPE_CONFIG[link.type];
  const isExpired = link.status === "expired";
  const isDisabled = link.status === "disabled";

  return (
    <TableRow className={cn((isExpired || isDisabled) && "opacity-60")}>
      <TableCell>
        <div className="space-y-0.5">
          <p className="font-medium text-sm">{link.name}</p>
          <p className="text-xs text-muted-foreground line-clamp-1">{link.description}</p>
        </div>
      </TableCell>
      <TableCell className="hidden sm:table-cell">
        <Badge variant="outline" className={cn("text-[10px] gap-1", cfg.badgeClass)}>
          <HugeiconsIcon icon={cfg.icon} className="size-3" strokeWidth={2} />
          {cfg.label}
        </Badge>
      </TableCell>
      <TableCell className="hidden md:table-cell">
        <code className="text-xs font-mono text-muted-foreground truncate block max-w-[200px]">
          {link.url.replace("https://", "")}
        </code>
      </TableCell>
      <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
        {link.createdBy}
      </TableCell>
      <TableCell className="text-right tabular-nums font-medium text-sm">
        {link.submissions}
      </TableCell>
      <TableCell>
        <StatusBadge status={link.status} expiresAt={link.expiresAt} />
      </TableCell>
      <TableCell>
        <div className="flex items-center justify-end gap-1">
          <Button variant="ghost" size="icon" onClick={onCopy} aria-label="Copy link">
            <HugeiconsIcon icon={Copy01Icon} className="size-4" strokeWidth={2} />
          </Button>
          {!isExpired && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
              className="text-xs h-7"
            >
              {link.status === "active" ? "Disable" : "Enable"}
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}

function StatusBadge({
  status,
  expiresAt,
}: {
  status: IntegrationLink["status"];
  expiresAt: string | null;
}) {
  if (status === "expired") {
    return (
      <Badge variant="outline" className="text-[10px]">
        Expired
      </Badge>
    );
  }
  if (status === "disabled") {
    return (
      <Badge variant="secondary" className="text-[10px]">
        Disabled
      </Badge>
    );
  }
  const soon =
    expiresAt &&
    new Date(expiresAt).getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000;
  return (
    <Badge
      variant="outline"
      className={cn(
        "text-[10px]",
        soon
          ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800"
          : "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800",
      )}
    >
      {soon ? "Expiring soon" : "Active"}
    </Badge>
  );
}

function CreateLinkDialog({
  open,
  defaultType,
  onClose,
  onCreate,
}: {
  open: boolean;
  defaultType: LinkType;
  onClose: () => void;
  onCreate: (data: CreateLinkData) => void;
}) {
  const [name, setName] = useState("");
  const [type, setType] = useState<LinkType>(defaultType);
  const [description, setDescription] = useState("");
  const [expiresAt, setExpiresAt] = useState("");

  const typeOptions = [
    { label: "Receipt Scanner", value: "receipt_scanner" },
    { label: "Order Pool", value: "order_pool" },
    { label: "Fund Request", value: "fund_request" },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onCreate({
      name: name.trim(),
      type,
      description: description.trim(),
      expiresAt: expiresAt || null,
    });
    setName("");
    setDescription("");
    setExpiresAt("");
  };

  const cfg = LINK_TYPE_CONFIG[type];

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Link</DialogTitle>
          <DialogDescription>
            Generate a shareable link for your team.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field>
            <FieldLabel>Link Type</FieldLabel>
            <Select
              items={typeOptions}
              value={type}
              onValueChange={(v) => setType(v as LinkType)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {typeOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">{cfg.description}</p>
          </Field>
          <Field>
            <FieldLabel>Name</FieldLabel>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={
                type === "receipt_scanner"
                  ? "e.g. Engineering Receipts – Q1"
                  : type === "order_pool"
                    ? "e.g. Friday Lunch Order"
                    : "e.g. Conference Travel Budget"
              }
              required
            />
          </Field>
          <Field>
            <FieldLabel>Description</FieldLabel>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What should submitters know about this link?"
              rows={2}
            />
          </Field>
          <Field>
            <FieldLabel>Expiry Date (optional)</FieldLabel>
            <Input
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
            />
          </Field>
          <DialogFooter>
            <Button variant="outline" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim()}>
              Create Link
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
