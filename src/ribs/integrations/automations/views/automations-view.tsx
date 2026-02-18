"use client";

import { useState } from "react";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import { AutomationsRib, CATEGORY_OPTIONS, TRIGGER_SUGGESTIONS, ACTION_SUGGESTIONS } from "../rib";
import type { AutomationRule, AutomationCategory, CreateRuleData } from "../rib";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  PlusSignIcon,
  FlowCircleIcon,
  CreditCardIcon,
  UserIcon,
  Delete01Icon,
  FlashIcon,
  ShieldIcon,
} from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";

const CATEGORY_ICONS: Record<
  Exclude<AutomationCategory, "all">,
  IconSvgElement
> = {
  cards: CreditCardIcon,
  accounts: ShieldIcon,
  roles: FlashIcon,
  users: UserIcon,
};

const CATEGORY_COLORS: Record<
  Exclude<AutomationCategory, "all">,
  string
> = {
  cards: "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/30 dark:text-violet-400 dark:border-violet-800",
  accounts: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800",
  roles: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800",
  users: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800",
};

const FILTER_TABS: { label: string; value: AutomationCategory }[] = [
  { label: "All", value: "all" },
  { label: "Cards", value: "cards" },
  { label: "Accounts", value: "accounts" },
  { label: "Roles", value: "roles" },
  { label: "Users", value: "users" },
];

export function AutomationsView() {
  const vm = AutomationsRib.useViewModel();
  const createRoute = AutomationsRib.useRoute("createRule");

  return (
    <div className="animate-page-in space-y-8">
      <PageHeader
        title="Automations"
        description="Define programmatic rules that trigger actions on cards, accounts, roles, and users."
        actions={
          <Button onClick={vm.openCreate}>
            <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} data-icon="inline-start" />
            New Rule
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Active Rules"
          value={String(vm.enabledCount)}
          icon={FlowCircleIcon}
          className="animate-page-in stagger-1"
        />
        <StatCard
          label="Total Rules"
          value={String(vm.rules.length)}
          icon={ShieldIcon}
          className="animate-page-in stagger-2"
        />
        <StatCard
          label="Times Triggered"
          value={String(vm.totalTriggers)}
          icon={FlashIcon}
          className="animate-page-in stagger-3"
        />
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 flex-wrap">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => vm.setActiveCategory(tab.value)}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors duration-150",
              vm.activeCategory === tab.value
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground hover:bg-muted",
            )}
          >
            {tab.label}
            {tab.value !== "all" && (
              <span className={cn(
                "ml-1.5 tabular-nums text-xs",
                vm.activeCategory === tab.value ? "opacity-70" : "opacity-50"
              )}>
                {vm.rules.filter((r) =>
                  tab.value === "all" ? true : r.category === tab.value,
                ).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Rules list */}
      {vm.filteredRules.length === 0 ? (
        <Empty className="border-border rounded-xl border border-dashed py-16">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <HugeiconsIcon icon={FlowCircleIcon} className="size-6" />
            </EmptyMedia>
            <EmptyTitle>No rules yet</EmptyTitle>
            <EmptyDescription>
              Create automation rules to enforce spending policies, manage access,
              and trigger workflows automatically.
            </EmptyDescription>
          </EmptyHeader>
          <Button onClick={vm.openCreate}>
            <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} data-icon="inline-start" />
            New Rule
          </Button>
        </Empty>
      ) : (
        <div className="space-y-3">
          {vm.filteredRules.map((rule, i) => (
            <RuleCard
              key={rule.id}
              rule={rule}
              className={cn("animate-page-in", `stagger-${Math.min(i + 1, 4)}`)}
              onToggle={() => vm.toggleRule(rule.id)}
              onDelete={() => vm.confirmDelete(rule.id)}
            />
          ))}
        </div>
      )}

      {/* Create rule dialog */}
      <CreateRuleDialog
        open={createRoute.attached}
        onClose={vm.closeCreate}
        onCreate={vm.createRule}
      />

      {/* Delete confirmation */}
      <AlertDialog
        open={vm.deleteTarget !== null}
        onOpenChange={(open) => { if (!open) vm.cancelDelete(); }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Rule</AlertDialogTitle>
            <AlertDialogDescription>
              This automation rule will be permanently deleted. Any active conditions it was monitoring will no longer trigger.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                if (vm.deleteTarget) vm.deleteRule(vm.deleteTarget);
              }}
            >
              Delete Rule
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

function RuleCard({
  rule,
  className,
  onToggle,
  onDelete,
}: {
  rule: AutomationRule;
  className?: string;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const catIcon = CATEGORY_ICONS[rule.category];
  const catColor = CATEGORY_COLORS[rule.category];
  const catLabel =
    CATEGORY_OPTIONS.find((c) => c.value === rule.category)?.label ?? rule.category;

  return (
    <Card className={cn(
      "transition-[box-shadow] duration-200 ease-[var(--ease-out-smooth)] hover:shadow-[0_4px_12px_0_rgb(0_0_0/0.06),0_1px_3px_0_rgb(0_0_0/0.04)] dark:hover:shadow-[0_4px_16px_0_rgb(0_0_0/0.3),0_1px_4px_0_rgb(0_0_0/0.2)]",
      !rule.enabled && "opacity-60",
      className,
    )}>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Toggle */}
          <div className="pt-0.5">
            <Switch
              checked={rule.enabled}
              onCheckedChange={onToggle}
              aria-label={`${rule.enabled ? "Disable" : "Enable"} rule: ${rule.name}`}
            />
          </div>

          {/* Body */}
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-medium text-sm">{rule.name}</span>
              <Badge variant="outline" className={cn("text-[10px] gap-1", catColor)}>
                <HugeiconsIcon icon={catIcon} className="size-2.5" strokeWidth={2} />
                {catLabel}
              </Badge>
              {!rule.enabled && (
                <Badge variant="secondary" className="text-[10px]">Paused</Badge>
              )}
            </div>

            <div className="grid gap-1.5 sm:grid-cols-2">
              <div className="flex items-start gap-2">
                <span className="mt-0.5 shrink-0 rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  When
                </span>
                <p className="text-xs text-muted-foreground leading-snug">
                  {rule.triggerLabel}
                </p>
              </div>
              <div className="flex items-start gap-2">
                <span className="mt-0.5 shrink-0 rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                  Then
                </span>
                <p className="text-xs text-muted-foreground leading-snug">
                  {rule.actionLabel}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-0.5">
              <span className="text-xs text-muted-foreground">
                Target: <span className="text-foreground">{rule.target}</span>
              </span>
              <span className="text-muted-foreground text-xs">·</span>
              <span className="text-xs text-muted-foreground tabular-nums">
                Triggered {rule.triggerCount}×
              </span>
              {rule.lastTriggered && (
                <>
                  <span className="text-muted-foreground text-xs">·</span>
                  <span className="text-xs text-muted-foreground">
                    Last{" "}
                    {new Intl.DateTimeFormat("en-US", {
                      month: "short",
                      day: "numeric",
                    }).format(new Date(rule.lastTriggered))}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Delete button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onDelete}
            className="shrink-0 text-muted-foreground hover:text-destructive"
            aria-label="Delete rule"
          >
            <HugeiconsIcon icon={Delete01Icon} className="size-4" strokeWidth={2} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function CreateRuleDialog({
  open,
  onClose,
  onCreate,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (data: CreateRuleData) => void;
}) {
  const [name, setName] = useState("");
  const [category, setCategory] =
    useState<Exclude<AutomationCategory, "all">>("cards");
  const [trigger, setTrigger] = useState("");
  const [action, setAction] = useState("");
  const [target, setTarget] = useState("");

  const suggestions = TRIGGER_SUGGESTIONS[category];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !trigger.trim() || !action.trim()) return;
    onCreate({
      name: name.trim(),
      category,
      triggerLabel: trigger.trim(),
      actionLabel: action.trim(),
      target: target.trim() || "All",
    });
    setName("");
    setTrigger("");
    setAction("");
    setTarget("");
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New Automation Rule</DialogTitle>
          <DialogDescription>
            Define a trigger condition and the action to take when it fires.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field>
            <FieldLabel>Rule Name</FieldLabel>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Freeze card on limit breach"
              required
            />
          </Field>
          <Field>
            <FieldLabel>Category</FieldLabel>
            <Select
              items={CATEGORY_OPTIONS}
              value={category}
              onValueChange={(v) => {
                setCategory(v as Exclude<AutomationCategory, "all">);
                setTrigger("");
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {CATEGORY_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <FieldLabel>Trigger — When this happens…</FieldLabel>
            <Input
              value={trigger}
              onChange={(e) => setTrigger(e.target.value)}
              placeholder="Describe the condition"
              required
            />
            <div className="mt-1.5 flex flex-wrap gap-1">
              {suggestions.slice(0, 3).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setTrigger(s)}
                  className="rounded-full border px-2.5 py-0.5 text-[11px] text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </Field>
          <Field>
            <FieldLabel>Action — Do this</FieldLabel>
            <Input
              value={action}
              onChange={(e) => setAction(e.target.value)}
              placeholder="Describe the action to take"
              required
            />
            <div className="mt-1.5 flex flex-wrap gap-1">
              {ACTION_SUGGESTIONS.slice(0, 4).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setAction(s)}
                  className="rounded-full border px-2.5 py-0.5 text-[11px] text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </Field>
          <Field>
            <FieldLabel>Target (optional)</FieldLabel>
            <Input
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="e.g. All virtual cards, Role: Manager"
            />
          </Field>
          <DialogFooter>
            <Button variant="outline" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!name.trim() || !trigger.trim() || !action.trim()}
            >
              Create Rule
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
