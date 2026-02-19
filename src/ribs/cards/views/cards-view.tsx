"use client";

import { useState, useCallback } from "react";
import { CardsRib } from "../rib";
import { PaymentCard } from "@/components/payment-card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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
import { Skeleton } from "@/components/ui/skeleton";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
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
import { PageHeader } from "@/components/page-header";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  PlusSignIcon,
  CreditCardIcon,
  AppleIcon,
  GoogleIcon,
} from "@hugeicons/core-free-icons";

const typeOptions = [
  { label: "Virtual", value: "virtual" },
  { label: "Physical", value: "physical" },
];

export function CardsView() {
  const vm = CardsRib.useViewModel();
  const detailRoute = CardsRib.useRoute("detail");
  const createRoute = CardsRib.useRoute("createCard");
  const [confirmAction, setConfirmAction] = useState<{
    type: "freeze" | "cancel";
    cardId: number;
  } | null>(null);

  const handleConfirm = useCallback(() => {
    if (!confirmAction) return;
    if (confirmAction.type === "freeze") vm.handleFreeze(confirmAction.cardId);
    else vm.handleCancel(confirmAction.cardId);
    setConfirmAction(null);
  }, [confirmAction, vm]);

  return (
    <div className="animate-page-in space-y-8">
      <PageHeader
        title="Cards"
        description="Issue virtual/physical cards, monitor spend, and control access."
        actions={
          <Button onClick={vm.openCreate}>
            <HugeiconsIcon
              icon={PlusSignIcon}
              strokeWidth={2}
              data-icon="inline-start"
            />
            New Card
          </Button>
        }
      />

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {vm.cardList.length} {vm.cardList.length === 1 ? "card" : "cards"}
        </p>
      </div>

      {vm.isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[1.586] w-full rounded-2xl" />
          ))}
        </div>
      ) : vm.cardList.length === 0 ? (
        <Empty className="border-border rounded-lg border border-dashed py-16">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <HugeiconsIcon icon={CreditCardIcon} className="size-6" />
            </EmptyMedia>
            <EmptyTitle>No cards yet</EmptyTitle>
            <EmptyDescription>
              Create a virtual or physical card to start spending.
            </EmptyDescription>
          </EmptyHeader>
          <Button onClick={vm.openCreate}>
            <HugeiconsIcon
              icon={PlusSignIcon}
              strokeWidth={2}
              data-icon="inline-start"
            />
            New Card
          </Button>
        </Empty>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {vm.cardList.map((card) => (
            <PaymentCard
              key={card.id}
              cardName={card.name}
              last4={card.last4}
              type={card.type}
              status={card.status}
              spendLimitCents={card.spendLimitCents}
              currentSpendCents={card.currentSpendCents}
              onClick={() => vm.openDetail(card.id)}
            />
          ))}
        </div>
      )}

      {/* Create card dialog */}
      <CreateCardDialog
        open={createRoute.attached}
        onClose={vm.closeCreate}
        onCreate={vm.handleCreate}
      />

      {/* Detail sheet */}
      <Sheet
        open={detailRoute.attached}
        onOpenChange={(open) => {
          if (!open) vm.closeDetail();
        }}
      >
        <SheetContent className="flex flex-col gap-0">
          {vm.selectedCard && (
            <>
              <SheetHeader className="px-6 pb-4 pt-6">
                <SheetTitle>{vm.selectedCard.cardName}</SheetTitle>
              </SheetHeader>
              <div className="flex-1 overflow-y-auto px-6 pb-6">
                <PaymentCard
                  cardName={vm.selectedCard.cardName}
                  last4={vm.selectedCard.last4}
                  type={vm.selectedCard.type}
                  status={vm.selectedCard.status}
                  spendLimitCents={vm.selectedCard.spendLimit}
                  currentSpendCents={vm.selectedCard.currentSpend}
                />

                {/* Wallet buttons */}
                <div className="mt-4 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      toast.info("Apple Wallet integration coming soon.")
                    }
                    className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-black px-4 text-white transition-opacity hover:opacity-80 active:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/40"
                  >
                    <HugeiconsIcon
                      icon={AppleIcon}
                      className="size-4 shrink-0"
                      strokeWidth={0}
                    />
                    <span className="text-[13px] font-medium">
                      Add to Apple Wallet
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      toast.info("Google Wallet integration coming soon.")
                    }
                    className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                  >
                    <HugeiconsIcon
                      icon={GoogleIcon}
                      className="size-4 shrink-0"
                      strokeWidth={0}
                    />
                    <span className="text-[13px] font-medium">
                      Save to Google Wallet
                    </span>
                  </button>
                </div>

                <div className="mt-4 flex gap-2">
                  {vm.selectedCard.status === "active" && (
                    <Button
                      variant="outline"
                      onClick={() =>
                        setConfirmAction({
                          type: "freeze",
                          cardId: vm.selectedCard!.id,
                        })
                      }
                    >
                      Freeze
                    </Button>
                  )}
                  {vm.selectedCard.status !== "cancelled" && (
                    <Button
                      variant="destructive"
                      onClick={() =>
                        setConfirmAction({
                          type: "cancel",
                          cardId: vm.selectedCard!.id,
                        })
                      }
                    >
                      Cancel Card
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <AlertDialog
        open={confirmAction !== null}
        onOpenChange={(open) => {
          if (!open) setConfirmAction(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmAction?.type === "cancel" ? "Cancel Card" : "Freeze Card"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction?.type === "cancel"
                ? "This will permanently cancel the card. This action cannot be undone."
                : "This will temporarily freeze the card. You can unfreeze it later."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Go Back</AlertDialogCancel>
            <AlertDialogAction
              variant={
                confirmAction?.type === "cancel" ? "destructive" : "default"
              }
              onClick={handleConfirm}
            >
              {confirmAction?.type === "cancel" ? "Cancel Card" : "Freeze Card"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function CreateCardDialog({
  open,
  onClose,
  onCreate,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (data: {
    cardName: string;
    type: "virtual" | "physical";
    spendLimit: number;
  }) => void;
}) {
  const [name, setName] = useState("");
  const [type, setType] = useState<"virtual" | "physical">("virtual");
  const [limit, setLimit] = useState("5000");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate({
      cardName: name,
      type,
      spendLimit: Math.round(parseFloat(limit) * 100),
    });
    setName("");
    setLimit("5000");
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) onClose();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Card</DialogTitle>
          <DialogDescription>
            Issue a new virtual or physical card
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field>
            <FieldLabel>Card Name</FieldLabel>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Marketing Budget"
              required
            />
          </Field>
          <Field>
            <FieldLabel>Type</FieldLabel>
            <Select
              items={typeOptions}
              value={type}
              onValueChange={(v) => setType(v as "virtual" | "physical")}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {typeOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <FieldLabel>Spend Limit ($)</FieldLabel>
            <Input
              type="number"
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
              min="1"
              required
            />
          </Field>
          <DialogFooter>
            <Button variant="outline" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Create Card</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
