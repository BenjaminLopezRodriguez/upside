"use client";

import { useState } from "react";
import { createRib } from "nextjs-ribs";
import { toast } from "sonner";

export type AutomationCategory = "all" | "cards" | "accounts" | "roles" | "users";

export type AutomationRule = {
  id: string;
  name: string;
  category: Exclude<AutomationCategory, "all">;
  triggerLabel: string;
  actionLabel: string;
  target: string;
  enabled: boolean;
  lastTriggered: string | null;
  triggerCount: number;
  createdAt: string;
};

export type CreateRuleData = {
  name: string;
  category: Exclude<AutomationCategory, "all">;
  triggerLabel: string;
  actionLabel: string;
  target: string;
};

const INITIAL_RULES: AutomationRule[] = [
  {
    id: "1",
    name: "Freeze card on limit breach",
    category: "cards",
    triggerLabel: "Card spend reaches 100% of limit",
    actionLabel: "Freeze card and notify cardholder",
    target: "All virtual cards",
    enabled: true,
    lastTriggered: "2026-02-15",
    triggerCount: 3,
    createdAt: "2025-11-10",
  },
  {
    id: "2",
    name: "Require approval for large transactions",
    category: "cards",
    triggerLabel: "Single transaction exceeds $500",
    actionLabel: "Require manager approval before clearing",
    target: "All cards",
    enabled: true,
    lastTriggered: "2026-02-17",
    triggerCount: 28,
    createdAt: "2025-11-15",
  },
  {
    id: "3",
    name: "Block entertainment spend for contractors",
    category: "roles",
    triggerLabel: "Transaction category is Entertainment",
    actionLabel: "Decline and send policy reminder",
    target: "Role: Contractor",
    enabled: true,
    lastTriggered: "2026-01-30",
    triggerCount: 5,
    createdAt: "2025-12-01",
  },
  {
    id: "4",
    name: "Alert on 80% account spend",
    category: "accounts",
    triggerLabel: "Spend account balance reaches 80% utilization",
    actionLabel: "Send alert to account owner and finance admin",
    target: "All spend accounts",
    enabled: true,
    lastTriggered: "2026-02-10",
    triggerCount: 7,
    createdAt: "2025-12-20",
  },
  {
    id: "5",
    name: "Auto-assign card on new hire",
    category: "users",
    triggerLabel: "New user is created with role Employee",
    actionLabel: "Issue virtual card with $500 default limit",
    target: "New employees",
    enabled: false,
    lastTriggered: null,
    triggerCount: 0,
    createdAt: "2026-01-05",
  },
  {
    id: "6",
    name: "Escalate reimbursements over $1k",
    category: "roles",
    triggerLabel: "Reimbursement request exceeds $1,000",
    actionLabel: "Route to VP approval instead of direct manager",
    target: "All roles",
    enabled: true,
    lastTriggered: "2026-02-12",
    triggerCount: 4,
    createdAt: "2026-01-12",
  },
  {
    id: "7",
    name: "Restrict travel spend outside policy",
    category: "accounts",
    triggerLabel: "Travel transaction exceeds per-diem rate",
    actionLabel: "Flag for review and hold clearance",
    target: "Travel budget accounts",
    enabled: false,
    lastTriggered: "2025-12-18",
    triggerCount: 11,
    createdAt: "2025-10-20",
  },
  {
    id: "8",
    name: "Downgrade card on role demotion",
    category: "users",
    triggerLabel: "User role changes to a lower tier",
    actionLabel: "Reduce spend limit to role default",
    target: "All users",
    enabled: true,
    lastTriggered: "2026-01-22",
    triggerCount: 2,
    createdAt: "2026-01-18",
  },
];

export const CATEGORY_OPTIONS: {
  label: string;
  value: Exclude<AutomationCategory, "all">;
}[] = [
  { label: "Cards", value: "cards" },
  { label: "Accounts", value: "accounts" },
  { label: "Roles", value: "roles" },
  { label: "Users", value: "users" },
];

export const TRIGGER_SUGGESTIONS: Record<
  Exclude<AutomationCategory, "all">,
  string[]
> = {
  cards: [
    "Card spend reaches 100% of limit",
    "Card spend reaches 80% of limit",
    "Single transaction exceeds $X",
    "Card is used at a specific merchant category",
    "Card is used outside business hours",
  ],
  accounts: [
    "Spend account balance reaches 80% utilization",
    "Monthly budget is exceeded",
    "Account balance drops below $X",
    "Transaction volume exceeds X per day",
  ],
  roles: [
    "User with role X submits a reimbursement",
    "Transaction category is Entertainment",
    "Reimbursement request exceeds $X",
    "Role-based spend limit is reached",
  ],
  users: [
    "New user is created with role Employee",
    "User role changes to a lower tier",
    "User is deactivated",
    "User has not logged in for 30 days",
  ],
};

export const ACTION_SUGGESTIONS: string[] = [
  "Freeze card and notify cardholder",
  "Require manager approval before clearing",
  "Send alert to account owner and finance admin",
  "Decline and send policy reminder",
  "Issue virtual card with default limit",
  "Reduce spend limit to role default",
  "Route to VP approval",
  "Flag for review and hold clearance",
  "Send webhook to backend",
  "Notify via email",
];

export const AutomationsRib = createRib({
  name: "Automations",

  interactor: (_deps: Record<string, never>) => {
    const [rules, setRules] = useState<AutomationRule[]>(INITIAL_RULES);
    const [isCreating, setIsCreating] = useState(false);
    const [activeCategory, setActiveCategory] =
      useState<AutomationCategory>("all");
    const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

    const toggleRule = (id: string) => {
      setRules((prev) =>
        prev.map((r) => {
          if (r.id !== id) return r;
          const next = !r.enabled;
          toast.success(next ? "Rule enabled" : "Rule paused");
          return { ...r, enabled: next };
        }),
      );
    };

    const deleteRule = (id: string) => {
      setRules((prev) => prev.filter((r) => r.id !== id));
      setDeleteTarget(null);
      toast.success("Rule deleted");
    };

    const createRule = (data: CreateRuleData) => {
      const newRule: AutomationRule = {
        id: String(Date.now()),
        name: data.name,
        category: data.category,
        triggerLabel: data.triggerLabel,
        actionLabel: data.actionLabel,
        target: data.target,
        enabled: true,
        lastTriggered: null,
        triggerCount: 0,
        createdAt: new Date().toISOString().split("T")[0]!,
      };
      setRules((prev) => [newRule, ...prev]);
      setIsCreating(false);
      toast.success("Automation rule created");
    };

    return {
      rules,
      isCreating,
      setIsCreating,
      activeCategory,
      setActiveCategory,
      deleteTarget,
      setDeleteTarget,
      toggleRule,
      deleteRule,
      createRule,
    };
  },

  router: (state) => ({
    createRule: state.isCreating,
  }),

  presenter: (state) => ({
    ...state,
    filteredRules:
      state.activeCategory === "all"
        ? state.rules
        : state.rules.filter((r) => r.category === state.activeCategory),
    enabledCount: state.rules.filter((r) => r.enabled).length,
    totalTriggers: state.rules.reduce((sum, r) => sum + r.triggerCount, 0),
    openCreate: () => state.setIsCreating(true),
    closeCreate: () => state.setIsCreating(false),
    confirmDelete: (id: string) => state.setDeleteTarget(id),
    cancelDelete: () => state.setDeleteTarget(null),
  }),
});
