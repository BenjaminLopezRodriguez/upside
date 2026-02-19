"use client";

import { useState } from "react";
import { createRib } from "nextjs-ribs";
import { api } from "@/trpc/react";
import { toast } from "sonner";

export const CardsRib = createRib({
  name: "Cards",

  interactor: (_deps: Record<string, never>) => {
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [isCreating, setIsCreating] = useState(false);

    const list = api.card.list.useQuery();
    const detail = api.card.getById.useQuery(
      { id: selectedId! },
      { enabled: selectedId !== null },
    );

    const utils = api.useUtils();

    const createCard = api.card.create.useMutation({
      onSuccess: () => {
        void utils.card.list.invalidate();
        setIsCreating(false);
        toast.success("Card created");
      },
      onError: (err) => {
        toast.error(err.message ?? "Failed to create card");
      },
    });

    const freezeCard = api.card.freeze.useMutation({
      onSuccess: () => {
        void utils.card.list.invalidate();
        void utils.card.getById.invalidate();
        toast.success("Card frozen");
      },
      onError: (err) => {
        toast.error(err.message ?? "Failed to freeze card");
      },
    });

    const cancelCard = api.card.cancel.useMutation({
      onSuccess: () => {
        void utils.card.list.invalidate();
        void utils.card.getById.invalidate();
        setSelectedId(null);
        toast.success("Card cancelled");
      },
      onError: (err) => {
        toast.error(err.message ?? "Failed to cancel card");
      },
    });

    return {
      cards: list.data ?? [],
      isLoading: list.isLoading,
      refetch: list.refetch,
      selectedId,
      setSelectedId,
      selectedCard: detail.data ?? null,
      isCreating,
      setIsCreating,
      createCard,
      freezeCard,
      cancelCard,
    };
  },

  router: (state) => ({
    detail: state.selectedId !== null,
    createCard: state.isCreating,
  }),

  presenter: (state) => ({
    ...state,
    cardList: state.cards.map((c) => ({
      id: c.id,
      name: c.cardName,
      last4: c.last4,
      type: c.type,
      status: c.status,
      spendLimitCents: c.spendLimit,
      currentSpendCents: c.currentSpend,
    })),
    openDetail: (id: number) => state.setSelectedId(id),
    closeDetail: () => state.setSelectedId(null),
    openCreate: () => state.setIsCreating(true),
    closeCreate: () => state.setIsCreating(false),
    handleCreate: (data: {
      cardName: string;
      type: "virtual" | "physical";
      spendLimit: number;
    }) => state.createCard.mutate(data),
    handleFreeze: (id: number) => state.freezeCard.mutate({ id }),
    handleCancel: (id: number) => state.cancelCard.mutate({ id }),
  }),
});
