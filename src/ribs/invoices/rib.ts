"use client";

import { useState } from "react";
import { createRib } from "nextjs-ribs";
import { toast } from "sonner";

export type InvoiceStatus = "draft" | "sent" | "viewed" | "paid" | "overdue";

export type InvoiceLineItem = {
  description: string;
  quantity: number;
  unitPrice: number;
};

export type Invoice = {
  id: string;
  invoiceNumber: string;
  recipientName: string;
  recipientEmail: string;
  lineItems: InvoiceLineItem[];
  totalCents: number;
  status: InvoiceStatus;
  dueDate: string;
  issuedDate: string;
  paidDate: string | null;
  paymentLink: string;
  notes: string;
};

export type CreateInvoiceData = {
  recipientName: string;
  recipientEmail: string;
  lineItems: InvoiceLineItem[];
  dueDate: string;
  notes: string;
  sendNow: boolean;
};

const BASE_LINK = "https://pay.upside.com/inv";

const INITIAL_INVOICES: Invoice[] = [
  {
    id: "1",
    invoiceNumber: "INV-2026-001",
    recipientName: "Vercel Inc.",
    recipientEmail: "billing@vercel.com",
    lineItems: [
      { description: "Platform consulting – January", quantity: 1, unitPrice: 450000 },
      { description: "Integrations support", quantity: 3, unitPrice: 75000 },
    ],
    totalCents: 675000,
    status: "paid",
    dueDate: "2026-01-31",
    issuedDate: "2026-01-10",
    paidDate: "2026-01-28",
    paymentLink: `${BASE_LINK}/inv-2026-001-abc`,
    notes: "Net 30 terms.",
  },
  {
    id: "2",
    invoiceNumber: "INV-2026-002",
    recipientName: "Acme Corp.",
    recipientEmail: "ap@acme.com",
    lineItems: [
      { description: "Software subscription – February", quantity: 1, unitPrice: 120000 },
    ],
    totalCents: 120000,
    status: "sent",
    dueDate: "2026-02-28",
    issuedDate: "2026-02-01",
    paidDate: null,
    paymentLink: `${BASE_LINK}/inv-2026-002-xyz`,
    notes: "",
  },
  {
    id: "3",
    invoiceNumber: "INV-2026-003",
    recipientName: "Stripe Inc.",
    recipientEmail: "finance@stripe.com",
    lineItems: [
      { description: "API design review", quantity: 2, unitPrice: 200000 },
      { description: "Documentation sprint", quantity: 1, unitPrice: 80000 },
    ],
    totalCents: 480000,
    status: "overdue",
    dueDate: "2026-01-20",
    issuedDate: "2025-12-20",
    paidDate: null,
    paymentLink: `${BASE_LINK}/inv-2026-003-pqr`,
    notes: "Second reminder sent on Feb 3.",
  },
  {
    id: "4",
    invoiceNumber: "INV-2026-004",
    recipientName: "Linear Inc.",
    recipientEmail: "billing@linear.app",
    lineItems: [
      { description: "UX audit", quantity: 1, unitPrice: 350000 },
    ],
    totalCents: 350000,
    status: "viewed",
    dueDate: "2026-02-25",
    issuedDate: "2026-02-05",
    paidDate: null,
    paymentLink: `${BASE_LINK}/inv-2026-004-efg`,
    notes: "",
  },
  {
    id: "5",
    invoiceNumber: "INV-2026-005",
    recipientName: "Figma Inc.",
    recipientEmail: "ap@figma.com",
    lineItems: [
      { description: "Design system workshop", quantity: 1, unitPrice: 500000 },
      { description: "Asset export & delivery", quantity: 1, unitPrice: 100000 },
    ],
    totalCents: 600000,
    status: "draft",
    dueDate: "2026-03-15",
    issuedDate: "2026-02-17",
    paidDate: null,
    paymentLink: `${BASE_LINK}/inv-2026-005-hij`,
    notes: "Confirm scope before sending.",
  },
];

let invoiceCounter = 6;

export const InvoicesRib = createRib({
  name: "Invoices",

  interactor: (_deps: Record<string, never>) => {
    const [invoices, setInvoices] = useState<Invoice[]>(INITIAL_INVOICES);
    const [isCreating, setIsCreating] = useState(false);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState<InvoiceStatus | "all">("all");

    const createInvoice = (data: CreateInvoiceData) => {
      const num = String(invoiceCounter++).padStart(3, "0");
      const id = String(Date.now());
      const total = data.lineItems.reduce(
        (sum, item) => sum + item.quantity * item.unitPrice,
        0,
      );
      const newInvoice: Invoice = {
        id,
        invoiceNumber: `INV-2026-${num}`,
        recipientName: data.recipientName,
        recipientEmail: data.recipientEmail,
        lineItems: data.lineItems,
        totalCents: total,
        status: data.sendNow ? "sent" : "draft",
        dueDate: data.dueDate,
        issuedDate: new Date().toISOString().split("T")[0]!,
        paidDate: null,
        paymentLink: `${BASE_LINK}/inv-2026-${num}-${id.slice(-4)}`,
        notes: data.notes,
      };
      setInvoices((prev) => [newInvoice, ...prev]);
      setIsCreating(false);
      toast.success(
        data.sendNow
          ? `Invoice sent to ${data.recipientEmail}`
          : "Invoice saved as draft",
      );
    };

    const markPaid = (id: string) => {
      setInvoices((prev) =>
        prev.map((inv) =>
          inv.id === id
            ? {
                ...inv,
                status: "paid" as const,
                paidDate: new Date().toISOString().split("T")[0]!,
              }
            : inv,
        ),
      );
      toast.success("Invoice marked as paid");
    };

    const sendReminder = (id: string) => {
      const inv = invoices.find((i) => i.id === id);
      if (!inv) return;
      toast.success(`Reminder sent to ${inv.recipientEmail}`);
    };

    const sendInvoice = (id: string) => {
      setInvoices((prev) =>
        prev.map((inv) =>
          inv.id === id ? { ...inv, status: "sent" as const } : inv,
        ),
      );
      const inv = invoices.find((i) => i.id === id);
      toast.success(`Invoice sent to ${inv?.recipientEmail ?? "recipient"}`);
    };

    const copyPaymentLink = (id: string) => {
      const inv = invoices.find((i) => i.id === id);
      if (!inv) return;
      void navigator.clipboard.writeText(inv.paymentLink).then(() => {
        toast.success("Payment link copied");
      });
    };

    return {
      invoices,
      isCreating,
      setIsCreating,
      selectedId,
      setSelectedId,
      statusFilter,
      setStatusFilter,
      createInvoice,
      markPaid,
      sendReminder,
      sendInvoice,
      copyPaymentLink,
    };
  },

  router: (state) => ({
    createInvoice: state.isCreating,
    detail: state.selectedId !== null,
  }),

  presenter: (state) => {
    const filtered =
      state.statusFilter === "all"
        ? state.invoices
        : state.invoices.filter((inv) => inv.status === state.statusFilter);

    const totalOutstanding = state.invoices
      .filter((inv) => inv.status !== "paid" && inv.status !== "draft")
      .reduce((sum, inv) => sum + inv.totalCents, 0);

    const totalPaid = state.invoices
      .filter((inv) => inv.status === "paid")
      .reduce((sum, inv) => sum + inv.totalCents, 0);

    const overdueCount = state.invoices.filter(
      (inv) => inv.status === "overdue",
    ).length;

    return {
      ...state,
      filteredInvoices: filtered,
      selectedInvoice: state.selectedId
        ? (state.invoices.find((inv) => inv.id === state.selectedId) ?? null)
        : null,
      totalOutstanding: formatCents(totalOutstanding),
      totalPaid: formatCents(totalPaid),
      overdueCount,
      openCreate: () => state.setIsCreating(true),
      closeCreate: () => state.setIsCreating(false),
      openDetail: (id: string) => state.setSelectedId(id),
      closeDetail: () => state.setSelectedId(null),
    };
  },
});

export function formatCents(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(cents / 100);
}
