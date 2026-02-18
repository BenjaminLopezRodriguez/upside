"use client";

import { useState, useCallback } from "react";
import { CardsRib } from "../rib";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
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
  Sheet,
  SheetContent,
  SheetDescription,
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
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
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
import { DetailRow } from "@/components/detail-row";
import { HugeiconsIcon } from "@hugeicons/react";
import { PlusSignIcon, CreditCardIcon } from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";

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
        <p className="text-muted-foreground text-sm">
          {vm.cardList.length} cards
        </p>
      </div>

      {vm.isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-44" />
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
            <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} data-icon="inline-start" />
            New Card
          </Button>
        </Empty>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {vm.cardList.map((card) => (
            <Card
              key={card.id}
              className="cursor-pointer transition-[box-shadow,transform] duration-200 ease-[var(--ease-out-smooth)] hover:shadow-[0_4px_12px_0_rgb(0_0_0/0.06),0_1px_3px_0_rgb(0_0_0/0.04)] dark:hover:shadow-[0_4px_16px_0_rgb(0_0_0/0.3),0_1px_4px_0_rgb(0_0_0/0.2)] hover:-translate-y-0.5"
              tabIndex={0}
              role="button"
              onClick={() => vm.openDetail(card.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  vm.openDetail(card.id);
                }
              }}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{card.name}</CardTitle>
                  <StatusBadge status={card.status} />
                </div>
                <CardDescription>
                  ••{card.last4} &middot; {card.type} &middot; {card.holder}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground tabular-nums">
                    {card.currentSpend} / {card.spendLimit}
                  </span>
                  <span className={cn(
                    "font-medium tabular-nums",
                    card.spendPercent >= 90 ? "text-red-600 dark:text-red-400" : card.spendPercent >= 75 ? "text-amber-600 dark:text-amber-400" : ""
                  )}>{card.spendPercent}%</span>
                </div>
                <Progress
                  value={card.spendPercent}
                  className={cn(
                    card.spendPercent >= 90 && "[&_[data-slot=progress-indicator]]:bg-red-500",
                    card.spendPercent >= 75 && card.spendPercent < 90 && "[&_[data-slot=progress-indicator]]:bg-amber-500"
                  )}
                />
              </CardContent>
            </Card>
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
        <SheetContent>
          {vm.selectedCard && (
            <>
              <SheetHeader>
                <SheetTitle>{vm.selectedCard.cardName}</SheetTitle>
                <SheetDescription>
                  ••{vm.selectedCard.last4} &middot; {vm.selectedCard.type}
                </SheetDescription>
              </SheetHeader>
              <div className="space-y-4 py-4">
                <DetailRow label="Holder" value={vm.selectedCard.user.name} />
                <DetailRow label="Status">
                  <StatusBadge status={vm.selectedCard.status} />
                </DetailRow>
                <Separator />
                <DetailRow
                  label="Spend Limit"
                  value={formatCents(vm.selectedCard.spendLimit)}
                />
                <DetailRow
                  label="Current Spend"
                  value={formatCents(vm.selectedCard.currentSpend)}
                />
                <Separator />
                <div className="flex gap-2 pt-2">
                  {vm.selectedCard.status === "active" && (
                    <Button
                      variant="outline"
                      onClick={() =>
                        setConfirmAction({ type: "freeze", cardId: vm.selectedCard!.id })
                      }
                    >
                      Freeze
                    </Button>
                  )}
                  {vm.selectedCard.status !== "cancelled" && (
                    <Button
                      variant="destructive"
                      onClick={() =>
                        setConfirmAction({ type: "cancel", cardId: vm.selectedCard!.id })
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
              variant={confirmAction?.type === "cancel" ? "destructive" : "default"}
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
    userId: number;
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
      userId: 1,
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



function formatCents(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}
