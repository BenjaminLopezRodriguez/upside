"use client";

import { useState } from "react";
import { createRib } from "nextjs-ribs";
import { api } from "@/trpc/react";
import { format } from "date-fns";
import { toast } from "sonner";

export const BillsRib = createRib({
  name: "Bills",

  interactor: (_deps: Record<string, never>) => {
    const [statusFilter, setStatusFilter] = useState<
      "draft" | "pending" | "scheduled" | "paid" | undefined
    >(undefined);
    const [selectedId, setSelectedId] = useState<number | null>(null);

    const list = api.bill.list.useQuery({ status: statusFilter });
    const detail = api.bill.getById.useQuery(
      { id: selectedId! },
      { enabled: selectedId !== null },
    );

    const utils = api.useUtils();

    const markPaid = api.bill.markPaid.useMutation({
      onSuccess: () => {
        void utils.bill.list.invalidate();
        void utils.bill.getById.invalidate();
        toast.success("Bill marked as paid");
      },
      onError: (err) => {
        toast.error(err.message ?? "Failed to mark bill as paid");
      },
    });

    return {
      list: list.data ?? [],
      isLoading: list.isLoading,
      refetch: list.refetch,
      statusFilter,
      setStatusFilter,
      selectedId,
      setSelectedId,
      selectedBill: detail.data ?? null,
      markPaid,
    };
  },

  router: (state) => ({
    detail: state.selectedId !== null,
  }),

  presenter: (state) => ({
    ...state,
    items: state.list.map((b) => ({
      id: b.id,
      vendor: b.vendorName,
      amount: formatCents(b.amount),
      status: b.status,
      category: b.category,
      dueDate: format(new Date(b.dueDate), "MMM d, yyyy"),
      invoiceNumber: b.invoiceNumber,
    })),
    detail: state.selectedBill
      ? {
          id: state.selectedBill.id,
          vendor: state.selectedBill.vendorName,
          amount: formatCents(state.selectedBill.amount),
          status: state.selectedBill.status,
          category: state.selectedBill.category,
          dueDate: format(new Date(state.selectedBill.dueDate), "MMMM d, yyyy"),
          invoiceNumber: state.selectedBill.invoiceNumber,
          paidAt: state.selectedBill.paidAt
            ? format(new Date(state.selectedBill.paidAt), "MMMM d, yyyy")
            : null,
        }
      : null,
    openDetail: (id: number) => state.setSelectedId(id),
    closeDetail: () => state.setSelectedId(null),
    handleMarkPaid: (id: number) => state.markPaid.mutate({ id }),
  }),
});

function formatCents(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}
