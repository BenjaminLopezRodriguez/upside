"use client";

import { useState } from "react";
import { createRib } from "nextjs-ribs";
import { api } from "@/trpc/react";
import { toast } from "sonner";

export type CardsRibDeps = { inPersonal?: boolean };

export const CardsRib = createRib({
  name: "Cards",

  interactor: (deps: CardsRibDeps) => {
    const inPersonal = deps.inPersonal ?? false;
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [isCreating, setIsCreating] = useState(false);

    const listAll = api.card.list.useQuery(undefined, { enabled: !inPersonal });
    const listIssued = api.card.listIssuedToMe.useQuery(undefined, { enabled: inPersonal });
    const list = inPersonal ? listIssued : listAll;
    const detail = api.card.getById.useQuery(
      { id: selectedId! },
      { enabled: selectedId !== null },
    );

    const utils = api.useUtils();

    const createCard = api.card.create.useMutation({
      onSuccess: () => {
        void utils.card.list.invalidate();
        if (inPersonal) void utils.card.listIssuedToMe.invalidate();
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
        if (inPersonal) void utils.card.listIssuedToMe.invalidate();
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
        if (inPersonal) void utils.card.listIssuedToMe.invalidate();
        void utils.card.getById.invalidate();
        setSelectedId(null);
        toast.success("Card cancelled");
      },
      onError: (err) => {
        toast.error(err.message ?? "Failed to cancel card");
      },
    });

    const deleteCard = api.card.delete.useMutation({
      onSuccess: () => {
        void utils.card.list.invalidate();
        if (inPersonal) void utils.card.listIssuedToMe.invalidate();
        void utils.card.getById.invalidate();
        setSelectedId(null);
        toast.success("Card deleted");
      },
      onError: (err) => {
        toast.error(err.message ?? "Failed to delete card");
      },
    });

    return {
      inPersonal,
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
      deleteCard,
    };
  },

  router: (state) => ({
    detail: state.selectedId !== null,
    createCard: state.isCreating,
  }),

  presenter: (state) => ({
    ...state,
    inPersonal: state.inPersonal,
    cardList: state.cards.map((c) => ({
      id: c.id,
      name: c.cardName,
      last4: c.last4,
      type: c.type,
      status: c.status,
      spendLimitCents: c.spendLimit,
      currentSpendCents: c.currentSpend,
      cardColor: c.cardColor,
      logoUrl: c.logoUrl,
      material: c.material,
    })),
    openDetail: (id: number) => state.setSelectedId(id),
    closeDetail: () => state.setSelectedId(null),
    openCreate: () => state.setIsCreating(true),
    closeCreate: () => state.setIsCreating(false),
    handleCreate: (data: {
      cardName: string;
      type: "virtual" | "physical";
      spendLimit: number;
      cardColor?: string;
      logoUrl?: string;
      material?: string;
    }) => state.createCard.mutate(data),
    handleFreeze: (id: number) => state.freezeCard.mutate({ id }),
    handleCancel: (id: number) => state.cancelCard.mutate({ id }),
    handleDelete: (id: number) => state.deleteCard.mutate({ id }),
  }),
});
