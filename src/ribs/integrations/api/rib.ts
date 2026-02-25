"use client";

import { useState } from "react";
import { createRib } from "nextjs-ribs";
import { toast } from "sonner";

export type ApiKey = {
  id: string;
  name: string;
  prefix: string;
  createdAt: string;
  lastUsed: string | null;
  status: "active" | "revoked";
  scopes: string[];
};

export type Webhook = {
  id: string;
  url: string;
  events: string[];
  status: "active" | "failing" | "disabled";
  createdAt: string;
};

export type ApiEvent = {
  id: string;
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  endpoint: string;
  statusCode: number;
  duration: number;
  timestamp: string;
};

const INITIAL_KEYS: ApiKey[] = [
  {
    id: "1",
    name: "Production Backend",
    prefix: "upsd_live_k3m9",
    createdAt: "2025-11-01",
    lastUsed: "2026-02-16",
    status: "active",
    scopes: ["cards:read", "cards:write", "transactions:read", "rules:write"],
  },
  {
    id: "2",
    name: "Staging Environment",
    prefix: "upsd_test_x7p2",
    createdAt: "2025-12-15",
    lastUsed: "2026-02-10",
    status: "active",
    scopes: ["cards:read", "transactions:read"],
  },
  {
    id: "3",
    name: "Mobile App",
    prefix: "upsd_live_m4n8",
    createdAt: "2026-01-08",
    lastUsed: "2026-02-17",
    status: "active",
    scopes: ["cards:read", "transactions:read", "approvals:write"],
  },
  {
    id: "4",
    name: "Legacy Integration",
    prefix: "upsd_live_a1b2",
    createdAt: "2025-08-20",
    lastUsed: "2025-10-01",
    status: "revoked",
    scopes: ["cards:read"],
  },
];

const INITIAL_WEBHOOKS: Webhook[] = [
  {
    id: "1",
    url: "https://api.acme.com/webhooks/deltra",
    events: ["transaction.created", "transaction.declined", "card.frozen"],
    status: "active",
    createdAt: "2025-11-05",
  },
  {
    id: "2",
    url: "https://n8n.acme.io/webhook/approvals",
    events: [
      "reimbursement.submitted",
      "reimbursement.approved",
      "reimbursement.rejected",
    ],
    status: "failing",
    createdAt: "2025-12-20",
  },
  {
    id: "3",
    url: "https://hooks.slack.com/services/T00/B00/xxxxx",
    events: ["card.frozen", "rule.triggered"],
    status: "disabled",
    createdAt: "2026-01-15",
  },
];

const INITIAL_EVENTS: ApiEvent[] = [
  {
    id: "1",
    method: "GET",
    endpoint: "/v1/cards",
    statusCode: 200,
    duration: 45,
    timestamp: "2026-02-17T14:22:00",
  },
  {
    id: "2",
    method: "POST",
    endpoint: "/v1/transactions/tx_9x2/approve",
    statusCode: 200,
    duration: 112,
    timestamp: "2026-02-17T14:18:00",
  },
  {
    id: "3",
    method: "GET",
    endpoint: "/v1/cards/c_123/transactions",
    statusCode: 200,
    duration: 67,
    timestamp: "2026-02-17T13:55:00",
  },
  {
    id: "4",
    method: "POST",
    endpoint: "/v1/cards",
    statusCode: 422,
    duration: 23,
    timestamp: "2026-02-17T13:42:00",
  },
  {
    id: "5",
    method: "DELETE",
    endpoint: "/v1/rules/r_456",
    statusCode: 200,
    duration: 88,
    timestamp: "2026-02-17T12:30:00",
  },
  {
    id: "6",
    method: "POST",
    endpoint: "/v1/approvals",
    statusCode: 201,
    duration: 54,
    timestamp: "2026-02-17T11:15:00",
  },
  {
    id: "7",
    method: "GET",
    endpoint: "/v1/users",
    statusCode: 200,
    duration: 33,
    timestamp: "2026-02-17T10:45:00",
  },
  {
    id: "8",
    method: "PATCH",
    endpoint: "/v1/cards/c_456",
    statusCode: 200,
    duration: 71,
    timestamp: "2026-02-17T09:20:00",
  },
];

export const ALL_SCOPES = [
  "cards:read",
  "cards:write",
  "transactions:read",
  "transactions:write",
  "approvals:write",
  "rules:read",
  "rules:write",
  "users:read",
  "reimbursements:read",
];

export const ALL_WEBHOOK_EVENTS = [
  "transaction.created",
  "transaction.declined",
  "transaction.completed",
  "card.frozen",
  "card.cancelled",
  "card.created",
  "reimbursement.submitted",
  "reimbursement.approved",
  "reimbursement.rejected",
  "rule.triggered",
  "user.created",
  "user.role_changed",
];

export const ApiIntegrationRib = createRib({
  name: "ApiIntegration",

  interactor: (_deps: Record<string, never>) => {
    const [keys, setKeys] = useState<ApiKey[]>(INITIAL_KEYS);
    const [webhooks, setWebhooks] = useState<Webhook[]>(INITIAL_WEBHOOKS);
    const [events] = useState<ApiEvent[]>(INITIAL_EVENTS);
    const [isCreatingKey, setIsCreatingKey] = useState(false);
    const [isAddingWebhook, setIsAddingWebhook] = useState(false);
    const [revealedKeyId, setRevealedKeyId] = useState<string | null>(null);

    const createKey = (data: { name: string; scopes: string[] }) => {
      const suffix = Math.random().toString(36).slice(2, 6);
      const newKey: ApiKey = {
        id: String(Date.now()),
        name: data.name,
        prefix: `upsd_live_${suffix}`,
        createdAt: new Date().toISOString().split("T")[0]!,
        lastUsed: null,
        status: "active",
        scopes: data.scopes,
      };
      setKeys((prev) => [newKey, ...prev]);
      setIsCreatingKey(false);
      toast.success("API key created");
    };

    const revokeKey = (id: string) => {
      setKeys((prev) =>
        prev.map((k) =>
          k.id === id ? { ...k, status: "revoked" as const } : k,
        ),
      );
      toast.success("API key revoked");
    };

    const addWebhook = (data: { url: string; events: string[] }) => {
      const newWebhook: Webhook = {
        id: String(Date.now()),
        url: data.url,
        events: data.events,
        status: "active",
        createdAt: new Date().toISOString().split("T")[0]!,
      };
      setWebhooks((prev) => [newWebhook, ...prev]);
      setIsAddingWebhook(false);
      toast.success("Webhook added");
    };

    const deleteWebhook = (id: string) => {
      setWebhooks((prev) => prev.filter((w) => w.id !== id));
      toast.success("Webhook removed");
    };

    const copyToClipboard = (text: string, label: string) => {
      void navigator.clipboard.writeText(text).then(() => {
        toast.success(`${label} copied`);
      });
    };

    return {
      keys,
      webhooks,
      events,
      isCreatingKey,
      setIsCreatingKey,
      isAddingWebhook,
      setIsAddingWebhook,
      revealedKeyId,
      setRevealedKeyId,
      createKey,
      revokeKey,
      addWebhook,
      deleteWebhook,
      copyToClipboard,
    };
  },

  router: (state) => ({
    createKey: state.isCreatingKey,
    addWebhook: state.isAddingWebhook,
  }),

  presenter: (state) => ({
    ...state,
    activeKeys: state.keys.filter((k) => k.status === "active").length,
    activeWebhooks: state.webhooks.filter((w) => w.status === "active").length,
    totalEvents: state.events.length,
    openCreateKey: () => state.setIsCreatingKey(true),
    closeCreateKey: () => state.setIsCreatingKey(false),
    openAddWebhook: () => state.setIsAddingWebhook(true),
    closeAddWebhook: () => state.setIsAddingWebhook(false),
    toggleReveal: (id: string) =>
      state.setRevealedKeyId((prev) => (prev === id ? null : id)),
  }),
});
