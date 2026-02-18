"use client";

import { useState } from "react";
import { createRib } from "nextjs-ribs";
import { api } from "@/trpc/react";
import { format } from "date-fns";
import { toast } from "sonner";

export const ReimbursementsRib = createRib({
  name: "Reimbursements",

  interactor: (_deps: Record<string, never>) => {
    const [statusFilter, setStatusFilter] = useState<
      "pending" | "approved" | "rejected" | undefined
    >(undefined);
    const [selectedId, setSelectedId] = useState<number | null>(null);

    const list = api.reimbursement.list.useQuery({ status: statusFilter });
    const detail = api.reimbursement.getById.useQuery(
      { id: selectedId! },
      { enabled: selectedId !== null },
    );

    const utils = api.useUtils();

    const approve = api.reimbursement.approve.useMutation({
      onSuccess: () => {
        void utils.reimbursement.list.invalidate();
        void utils.reimbursement.getById.invalidate();
        toast.success("Reimbursement approved");
      },
      onError: (err) => {
        toast.error(err.message ?? "Failed to approve reimbursement");
      },
    });

    const reject = api.reimbursement.reject.useMutation({
      onSuccess: () => {
        void utils.reimbursement.list.invalidate();
        void utils.reimbursement.getById.invalidate();
        toast.success("Reimbursement rejected");
      },
      onError: (err) => {
        toast.error(err.message ?? "Failed to reject reimbursement");
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
      selectedReimbursement: detail.data ?? null,
      approve,
      reject,
    };
  },

  router: (state) => ({
    detail: state.selectedId !== null,
  }),

  presenter: (state) => ({
    ...state,
    items: state.list.map((r) => ({
      id: r.id,
      user: r.user.name,
      description: r.description,
      amount: formatCents(r.amount),
      status: r.status,
      category: r.category,
      date: format(new Date(r.submittedAt), "MMM d, yyyy"),
    })),
    detail: state.selectedReimbursement
      ? {
          id: state.selectedReimbursement.id,
          user: state.selectedReimbursement.user.name,
          description: state.selectedReimbursement.description,
          amount: formatCents(state.selectedReimbursement.amount),
          status: state.selectedReimbursement.status,
          category: state.selectedReimbursement.category,
          submittedAt: format(
            new Date(state.selectedReimbursement.submittedAt),
            "MMMM d, yyyy",
          ),
          reviewedAt: state.selectedReimbursement.reviewedAt
            ? format(
                new Date(state.selectedReimbursement.reviewedAt),
                "MMMM d, yyyy",
              )
            : null,
        }
      : null,
    openDetail: (id: number) => state.setSelectedId(id),
    closeDetail: () => state.setSelectedId(null),
    handleApprove: (id: number) => state.approve.mutate({ id }),
    handleReject: (id: number) => state.reject.mutate({ id }),
  }),
});

function formatCents(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}
