"use client";

import { useState } from "react";
import { createRib } from "nextjs-ribs";
import { api } from "@/trpc/react";
import { format } from "date-fns";

export const TransactionsRib = createRib({
  name: "Transactions",

  interactor: (_deps: Record<string, never>) => {
    const [statusFilter, setStatusFilter] = useState<
      "pending" | "completed" | "declined" | undefined
    >(undefined);
    const [search, setSearch] = useState("");
    const [selectedId, setSelectedId] = useState<number | null>(null);

    const list = api.transaction.list.useQuery({
      status: statusFilter,
      search: search || undefined,
    });

    const detail = api.transaction.getById.useQuery(
      { id: selectedId! },
      { enabled: selectedId !== null },
    );

    return {
      list: list.data ?? [],
      isLoading: list.isLoading,
      statusFilter,
      setStatusFilter,
      search,
      setSearch,
      selectedId,
      setSelectedId,
      selectedTransaction: detail.data ?? null,
      refetch: list.refetch,
    };
  },

  router: (state) => ({
    detail: state.selectedId !== null,
  }),

  presenter: (state) => ({
    ...state,
    transactions: state.list.map((tx) => ({
      id: tx.id,
      merchant: tx.merchant.name,
      user: tx.user.name,
      cardLast4: tx.card.last4,
      amount: formatCents(tx.amount),
      rawAmount: tx.amount,
      status: tx.status,
      category: tx.category,
      memo: tx.memo,
      date: format(new Date(tx.transactionDate), "MMM d, yyyy"),
    })),
    detail: state.selectedTransaction
      ? {
          id: state.selectedTransaction.id,
          merchant: state.selectedTransaction.merchant.name,
          user: state.selectedTransaction.user.name,
          cardName: state.selectedTransaction.card.cardName,
          cardLast4: state.selectedTransaction.card.last4,
          amount: formatCents(state.selectedTransaction.amount),
          status: state.selectedTransaction.status,
          category: state.selectedTransaction.category,
          memo: state.selectedTransaction.memo,
          date: format(
            new Date(state.selectedTransaction.transactionDate),
            "MMMM d, yyyy 'at' h:mm a",
          ),
          currency: state.selectedTransaction.currency,
        }
      : null,
    closeDetail: () => state.setSelectedId(null),
    openDetail: (id: number) => state.setSelectedId(id),
  }),
});

function formatCents(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}
