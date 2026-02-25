"use client";

import { useState } from "react";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import { ApiIntegrationRib, ALL_SCOPES, ALL_WEBHOOK_EVENTS } from "../rib";
import type { ApiKey, Webhook, ApiEvent } from "../rib";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
import { Checkbox } from "@/components/ui/checkbox";
import {
  PlusSignIcon,
  Key01Icon,
  WebhookIcon,
  Copy01Icon,
  Delete01Icon,
  EyeIcon,
  Clock01Icon,
  ApiIcon,
  CheckmarkCircle02Icon,
  Alert02Icon,
  Cancel01Icon,
} from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";

export function ApiIntegrationView() {
  const vm = ApiIntegrationRib.useViewModel();
  const createKeyRoute = ApiIntegrationRib.useRoute("createKey");
  const addWebhookRoute = ApiIntegrationRib.useRoute("addWebhook");
  const [revokeTarget, setRevokeTarget] = useState<string | null>(null);
  const [deleteWebhookTarget, setDeleteWebhookTarget] = useState<string | null>(null);

  return (
    <div className="animate-page-in space-y-8">
      <PageHeader
        title="API"
        description="Connect your backend to Deltra. Manage API keys, configure webhooks, and monitor requests."
        actions={
          <>
            <Button variant="outline" onClick={vm.openAddWebhook}>
              <HugeiconsIcon icon={WebhookIcon} strokeWidth={2} data-icon="inline-start" />
              Add Webhook
            </Button>
            <Button onClick={vm.openCreateKey}>
              <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} data-icon="inline-start" />
              New API Key
            </Button>
          </>
        }
      />

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Active Keys"
          value={String(vm.activeKeys)}
          icon={Key01Icon}
          className="animate-page-in stagger-1"
        />
        <StatCard
          label="Active Webhooks"
          value={String(vm.activeWebhooks)}
          icon={WebhookIcon}
          className="animate-page-in stagger-2"
        />
        <StatCard
          label="API Calls Today"
          value={String(vm.totalEvents)}
          icon={ApiIcon}
          className="animate-page-in stagger-3"
        />
      </div>

      {/* API Keys */}
      <Card className="transition-[box-shadow] duration-200 ease-[var(--ease-out-smooth)] hover:shadow-[0_4px_12px_0_rgb(0_0_0/0.06),0_1px_3px_0_rgb(0_0_0/0.04)] dark:hover:shadow-[0_4px_16px_0_rgb(0_0_0/0.3),0_1px_4px_0_rgb(0_0_0/0.2)]">
        <CardHeader>
          <CardTitle>API Keys</CardTitle>
          <CardDescription>
            Keys authenticate your server-side requests. Never expose them client-side.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Key</TableHead>
                <TableHead className="hidden md:table-cell">Scopes</TableHead>
                <TableHead className="hidden sm:table-cell">Last Used</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {vm.keys.map((key) => (
                <ApiKeyRow
                  key={key.id}
                  apiKey={key}
                  revealed={vm.revealedKeyId === key.id}
                  onReveal={() => vm.toggleReveal(key.id)}
                  onCopy={() =>
                    vm.copyToClipboard(`${key.prefix}••••••••••••`, key.name)
                  }
                  onRevoke={() => setRevokeTarget(key.id)}
                />
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Code snippet */}
      <Card className="transition-[box-shadow] duration-200 ease-[var(--ease-out-smooth)] hover:shadow-[0_4px_12px_0_rgb(0_0_0/0.06),0_1px_3px_0_rgb(0_0_0/0.04)] dark:hover:shadow-[0_4px_16px_0_rgb(0_0_0/0.3),0_1px_4px_0_rgb(0_0_0/0.2)]">
        <CardHeader>
          <CardTitle>Quick Start</CardTitle>
          <CardDescription>
            Approve or decline transactions from your backend in seconds.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <CodeBlock
            label="Approve a transaction"
            code={`curl -X POST https://api.deltra.com/v1/transactions/tx_9x2/approve \\
  -H "Authorization: Bearer upsd_live_k3m9••••" \\
  -H "Content-Type: application/json" \\
  -d '{"memo": "Approved by finance team"}'`}
            onCopy={() =>
              vm.copyToClipboard(
                `curl -X POST https://api.deltra.com/v1/transactions/tx_9x2/approve`,
                "Code snippet",
              )
            }
          />
          <CodeBlock
            label="Create a rule via API"
            code={`curl -X POST https://api.deltra.com/v1/rules \\
  -H "Authorization: Bearer upsd_live_k3m9••••" \\
  -d '{"trigger":"spend_exceeds","threshold":5000,"action":"require_approval"}'`}
            onCopy={() =>
              vm.copyToClipboard(
                `curl -X POST https://api.deltra.com/v1/rules`,
                "Code snippet",
              )
            }
          />
        </CardContent>
      </Card>

      {/* Webhooks */}
      <Card className="transition-[box-shadow] duration-200 ease-[var(--ease-out-smooth)] hover:shadow-[0_4px_12px_0_rgb(0_0_0/0.06),0_1px_3px_0_rgb(0_0_0/0.04)] dark:hover:shadow-[0_4px_16px_0_rgb(0_0_0/0.3),0_1px_4px_0_rgb(0_0_0/0.2)]">
        <CardHeader>
          <CardTitle>Webhooks</CardTitle>
          <CardDescription>
            Receive real-time event notifications to your server when activity occurs.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {vm.webhooks.map((wh) => (
            <WebhookRow
              key={wh.id}
              webhook={wh}
              onCopy={() => vm.copyToClipboard(wh.url, "Webhook URL")}
              onDelete={() => setDeleteWebhookTarget(wh.id)}
            />
          ))}
        </CardContent>
      </Card>

      {/* Recent events */}
      <Card className="transition-[box-shadow] duration-200 ease-[var(--ease-out-smooth)] hover:shadow-[0_4px_12px_0_rgb(0_0_0/0.06),0_1px_3px_0_rgb(0_0_0/0.04)] dark:hover:shadow-[0_4px_16px_0_rgb(0_0_0/0.3),0_1px_4px_0_rgb(0_0_0/0.2)]">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Recent Events</CardTitle>
            <CardDescription>Last 24 hours of API activity</CardDescription>
          </div>
          <HugeiconsIcon icon={Clock01Icon} className="size-5 text-muted-foreground" strokeWidth={1.5} />
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Method</TableHead>
                <TableHead>Endpoint</TableHead>
                <TableHead className="hidden sm:table-cell">Status</TableHead>
                <TableHead className="hidden md:table-cell text-right">Duration</TableHead>
                <TableHead className="text-right">Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vm.events.map((event) => (
                <EventRow key={event.id} event={event} />
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create key dialog */}
      <CreateKeyDialog
        open={createKeyRoute.attached}
        onClose={vm.closeCreateKey}
        onCreate={vm.createKey}
      />

      {/* Add webhook dialog */}
      <AddWebhookDialog
        open={addWebhookRoute.attached}
        onClose={vm.closeAddWebhook}
        onAdd={vm.addWebhook}
      />

      {/* Revoke key confirmation */}
      <AlertDialog
        open={revokeTarget !== null}
        onOpenChange={(open) => { if (!open) setRevokeTarget(null); }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke API Key</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently invalidate the key. Any services using it will lose access immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                if (revokeTarget) vm.revokeKey(revokeTarget);
                setRevokeTarget(null);
              }}
            >
              Revoke Key
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete webhook confirmation */}
      <AlertDialog
        open={deleteWebhookTarget !== null}
        onOpenChange={(open) => { if (!open) setDeleteWebhookTarget(null); }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Webhook</AlertDialogTitle>
            <AlertDialogDescription>
              This webhook endpoint will stop receiving events. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                if (deleteWebhookTarget) vm.deleteWebhook(deleteWebhookTarget);
                setDeleteWebhookTarget(null);
              }}
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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

function ApiKeyRow({
  apiKey,
  revealed,
  onReveal,
  onCopy,
  onRevoke,
}: {
  apiKey: ApiKey;
  revealed: boolean;
  onReveal: () => void;
  onCopy: () => void;
  onRevoke: () => void;
}) {
  const isRevoked = apiKey.status === "revoked";

  return (
    <TableRow className={cn(isRevoked && "opacity-50")}>
      <TableCell className="font-medium">{apiKey.name}</TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <code className="bg-muted rounded px-1.5 py-0.5 text-xs font-mono">
            {revealed ? `${apiKey.prefix}••••••••••••` : `${apiKey.prefix.slice(0, 12)}••••`}
          </code>
          {!isRevoked && (
            <button
              onClick={onReveal}
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label={revealed ? "Hide key" : "Show key"}
            >
              <HugeiconsIcon icon={EyeIcon} className="size-3.5" strokeWidth={2} />
            </button>
          )}
        </div>
      </TableCell>
      <TableCell className="hidden md:table-cell">
        <div className="flex flex-wrap gap-1">
          {apiKey.scopes.slice(0, 2).map((scope) => (
            <Badge key={scope} variant="secondary" className="text-[10px] px-1.5 py-0">
              {scope}
            </Badge>
          ))}
          {apiKey.scopes.length > 2 && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
              +{apiKey.scopes.length - 2}
            </Badge>
          )}
        </div>
      </TableCell>
      <TableCell className="hidden sm:table-cell text-muted-foreground text-sm">
        {apiKey.lastUsed
          ? new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(
              new Date(apiKey.lastUsed),
            )
          : "Never"}
      </TableCell>
      <TableCell>
        <Badge
          variant={isRevoked ? "outline" : "default"}
          className={cn(
            !isRevoked &&
              "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800",
          )}
        >
          {isRevoked ? "Revoked" : "Active"}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex items-center justify-end gap-1">
          {!isRevoked && (
            <Button variant="ghost" size="icon" onClick={onCopy} aria-label="Copy key">
              <HugeiconsIcon icon={Copy01Icon} className="size-4" strokeWidth={2} />
            </Button>
          )}
          {!isRevoked && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onRevoke}
              className="text-destructive hover:text-destructive"
              aria-label="Revoke key"
            >
              <HugeiconsIcon icon={Delete01Icon} className="size-4" strokeWidth={2} />
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}

function WebhookRow({
  webhook,
  onCopy,
  onDelete,
}: {
  webhook: Webhook;
  onCopy: () => void;
  onDelete: () => void;
}) {
  const statusConfig = {
    active: {
      icon: CheckmarkCircle02Icon,
      label: "Active",
      className:
        "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800",
    },
    failing: {
      icon: Alert02Icon,
      label: "Failing",
      className:
        "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800",
    },
    disabled: {
      icon: Cancel01Icon,
      label: "Disabled",
      className: "",
    },
  };
  const config = statusConfig[webhook.status];

  return (
    <div className="flex items-start gap-3 rounded-xl border bg-card p-4">
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <code className="text-sm font-mono truncate max-w-xs">{webhook.url}</code>
          <Badge
            variant="outline"
            className={config.className}
          >
            {config.label}
          </Badge>
        </div>
        <div className="flex flex-wrap gap-1">
          {webhook.events.map((event) => (
            <Badge key={event} variant="secondary" className="text-[10px] px-1.5 py-0 font-mono">
              {event}
            </Badge>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          Added{" "}
          {new Intl.DateTimeFormat("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }).format(new Date(webhook.createdAt))}
        </p>
      </div>
      <div className="flex shrink-0 gap-1">
        <Button variant="ghost" size="icon" onClick={onCopy} aria-label="Copy URL">
          <HugeiconsIcon icon={Copy01Icon} className="size-4" strokeWidth={2} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onDelete}
          className="text-destructive hover:text-destructive"
          aria-label="Delete webhook"
        >
          <HugeiconsIcon icon={Delete01Icon} className="size-4" strokeWidth={2} />
        </Button>
      </div>
    </div>
  );
}

function EventRow({ event }: { event: ApiEvent }) {
  const methodColors: Record<ApiEvent["method"], string> = {
    GET: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800",
    POST: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800",
    PUT: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800",
    PATCH: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800",
    DELETE: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800",
  };

  const isError = event.statusCode >= 400;

  return (
    <TableRow>
      <TableCell>
        <Badge variant="outline" className={cn("text-[10px] font-mono px-1.5 py-0", methodColors[event.method])}>
          {event.method}
        </Badge>
      </TableCell>
      <TableCell>
        <code className="text-xs font-mono text-muted-foreground">{event.endpoint}</code>
      </TableCell>
      <TableCell className="hidden sm:table-cell">
        <span className={cn("text-sm font-mono font-medium tabular-nums", isError ? "text-destructive" : "text-emerald-600 dark:text-emerald-400")}>
          {event.statusCode}
        </span>
      </TableCell>
      <TableCell className="hidden md:table-cell text-right">
        <span className="text-xs text-muted-foreground tabular-nums">{event.duration}ms</span>
      </TableCell>
      <TableCell className="text-right">
        <span className="text-xs text-muted-foreground">
          {new Intl.DateTimeFormat("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          }).format(new Date(event.timestamp))}
        </span>
      </TableCell>
    </TableRow>
  );
}

function CodeBlock({
  label,
  code,
  onCopy,
}: {
  label: string;
  code: string;
  onCopy: () => void;
}) {
  return (
    <div className="rounded-xl border bg-muted/40 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/60">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <Button variant="ghost" size="sm" onClick={onCopy} className="h-6 gap-1 text-xs px-2">
          <HugeiconsIcon icon={Copy01Icon} className="size-3" strokeWidth={2} />
          Copy
        </Button>
      </div>
      <pre className="p-4 text-xs font-mono overflow-x-auto leading-relaxed whitespace-pre-wrap break-all">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function CreateKeyDialog({
  open,
  onClose,
  onCreate,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (data: { name: string; scopes: string[] }) => void;
}) {
  const [name, setName] = useState("");
  const [selectedScopes, setSelectedScopes] = useState<string[]>(["cards:read", "transactions:read"]);

  const toggleScope = (scope: string) => {
    setSelectedScopes((prev) =>
      prev.includes(scope) ? prev.filter((s) => s !== scope) : [...prev, scope],
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || selectedScopes.length === 0) return;
    onCreate({ name: name.trim(), scopes: selectedScopes });
    setName("");
    setSelectedScopes(["cards:read", "transactions:read"]);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create API Key</DialogTitle>
          <DialogDescription>
            Give this key a name and select the scopes it should have access to.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5">
          <Field>
            <FieldLabel>Key Name</FieldLabel>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Production Backend"
              required
            />
          </Field>
          <Field>
            <FieldLabel>Permissions</FieldLabel>
            <div className="grid grid-cols-2 gap-2 mt-1">
              {ALL_SCOPES.map((scope) => (
                <label
                  key={scope}
                  className="flex items-center gap-2 rounded-lg border px-3 py-2 cursor-pointer hover:bg-muted/50 transition-colors"
                >
                  <Checkbox
                    checked={selectedScopes.includes(scope)}
                    onCheckedChange={() => toggleScope(scope)}
                  />
                  <span className="text-xs font-mono">{scope}</span>
                </label>
              ))}
            </div>
          </Field>
          <DialogFooter>
            <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={!name.trim() || selectedScopes.length === 0}>
              Create Key
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function AddWebhookDialog({
  open,
  onClose,
  onAdd,
}: {
  open: boolean;
  onClose: () => void;
  onAdd: (data: { url: string; events: string[] }) => void;
}) {
  const [url, setUrl] = useState("");
  const [selectedEvents, setSelectedEvents] = useState<string[]>([
    "transaction.created",
    "transaction.declined",
  ]);

  const toggleEvent = (event: string) => {
    setSelectedEvents((prev) =>
      prev.includes(event) ? prev.filter((e) => e !== event) : [...prev, event],
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || selectedEvents.length === 0) return;
    onAdd({ url: url.trim(), events: selectedEvents });
    setUrl("");
    setSelectedEvents(["transaction.created", "transaction.declined"]);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Webhook</DialogTitle>
          <DialogDescription>
            We&apos;ll POST a signed JSON payload to your endpoint when selected events occur.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5">
          <Field>
            <FieldLabel>Endpoint URL</FieldLabel>
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://api.yourapp.com/webhooks/deltra"
              type="url"
              required
            />
          </Field>
          <Field>
            <FieldLabel>Events to Send</FieldLabel>
            <div className="space-y-1.5 mt-1">
              {ALL_WEBHOOK_EVENTS.map((event) => (
                <label
                  key={event}
                  className="flex items-center gap-2 rounded-lg border px-3 py-2 cursor-pointer hover:bg-muted/50 transition-colors"
                >
                  <Checkbox
                    checked={selectedEvents.includes(event)}
                    onCheckedChange={() => toggleEvent(event)}
                  />
                  <span className="text-xs font-mono">{event}</span>
                </label>
              ))}
            </div>
          </Field>
          <DialogFooter>
            <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={!url.trim() || selectedEvents.length === 0}>
              Add Webhook
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

