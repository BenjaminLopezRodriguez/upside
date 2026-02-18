"use client";

import { useState, useCallback } from "react";
import { BillsRib } from "../rib";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { PageHeader } from "@/components/page-header";
import { DetailRow } from "@/components/detail-row";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { HugeiconsIcon } from "@hugeicons/react";
import { Download01Icon, Invoice01Icon, Refresh01Icon } from "@hugeicons/core-free-icons";
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
import { downloadCsv } from "@/lib/csv";
import { toast } from "sonner";

const tabs = [
  { label: "All", value: "all" },
  { label: "Draft", value: "draft" },
  { label: "Pending", value: "pending" },
  { label: "Scheduled", value: "scheduled" },
  { label: "Paid", value: "paid" },
] as const;

export function BillsView() {
  const vm = BillsRib.useViewModel();
  const route = BillsRib.useRoute("detail");
  const [confirmPaidId, setConfirmPaidId] = useState<number | null>(null);

  const handleConfirmPaid = useCallback(() => {
    if (confirmPaidId !== null) {
      vm.handleMarkPaid(confirmPaidId);
      setConfirmPaidId(null);
    }
  }, [confirmPaidId, vm]);

  return (
    <div className="animate-page-in space-y-8">
      <PageHeader
        title="Bill Pay"
        description="Track invoices by status, view details, and mark bills as paid."
      />

      <Card>
        <CardHeader className="border-b border-border/60 pb-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Tabs
              value={vm.statusFilter ?? "all"}
              onValueChange={(v) =>
                vm.setStatusFilter(
                  v === "all"
                    ? undefined
                    : (v as "draft" | "pending" | "scheduled" | "paid"),
                )
              }
            >
              <TabsList>
                {tabs.map((tab) => (
                  <TabsTrigger key={tab.value} value={tab.value}>
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            <div className="flex items-center gap-2">
              <div className="text-muted-foreground text-sm">
                {vm.isLoading ? "Loading…" : `${vm.items.length} bills`}
              </div>
              <Separator orientation="vertical" className="mx-1 h-4 bg-border/60" />
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  toast.promise(vm.refetch(), {
                    loading: "Refreshing…",
                    success: "Up to date",
                    error: "Failed to refresh",
                  })
                }
              >
                <HugeiconsIcon icon={Refresh01Icon} strokeWidth={2} data-icon="inline-start" />
                Refresh
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={vm.items.length === 0}
                onClick={() => {
                  downloadCsv(
                    `bills-${new Date().toISOString().slice(0, 10)}`,
                    vm.items.map((b) => ({
                      vendor: b.vendor,
                      invoice: b.invoiceNumber ?? "",
                      category: b.category,
                      dueDate: b.dueDate,
                      status: b.status,
                      amount: b.amount,
                    })),
                  );
                  toast.success("Downloaded CSV");
                }}
              >
                <HugeiconsIcon icon={Download01Icon} strokeWidth={2} data-icon="inline-start" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-4">
          {vm.isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : vm.items.length === 0 ? (
            <Empty className="border-border/80 rounded-xl border border-dashed py-16">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <HugeiconsIcon icon={Invoice01Icon} className="size-6" />
                </EmptyMedia>
                <EmptyTitle>
                  {vm.statusFilter != null
                    ? `No ${vm.statusFilter} bills`
                    : "No bills yet"}
                </EmptyTitle>
                <EmptyDescription>
                  {vm.statusFilter != null
                    ? "Try another tab or add a new bill."
                    : "Add bills to track and pay your vendors."}
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <>
              <Separator className="mb-4 bg-border/50" />
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vm.items.map((b) => (
                    <TableRow
                      key={b.id}
                      className="cursor-pointer"
                      tabIndex={0}
                      role="button"
                      onClick={() => vm.openDetail(b.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          vm.openDetail(b.id);
                        }
                      }}
                    >
                      <TableCell className="font-medium">{b.vendor}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {b.invoiceNumber ?? "—"}
                      </TableCell>
                      <TableCell>{b.category}</TableCell>
                      <TableCell>{b.dueDate}</TableCell>
                      <TableCell>
                        <StatusBadge status={b.status} />
                      </TableCell>
                      <TableCell className="text-right tabular-nums">{b.amount}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </>
          )}
        </CardContent>
      </Card>

      {/* Detail sheet */}
      <Sheet
        open={route.attached}
        onOpenChange={(open) => {
          if (!open) vm.closeDetail();
        }}
      >
        <SheetContent>
          {vm.detail && (
            <>
              <SheetHeader>
                <SheetTitle>{vm.detail.vendor}</SheetTitle>
                <SheetDescription>
                  {vm.detail.invoiceNumber ?? "No invoice number"}
                </SheetDescription>
              </SheetHeader>
              <div className="space-y-4 py-4">
                <DetailRow label="Amount" value={vm.detail.amount} />
                <DetailRow label="Status">
                  <StatusBadge status={vm.detail.status} />
                </DetailRow>
                <Separator />
                <DetailRow label="Category" value={vm.detail.category} />
                <DetailRow label="Due Date" value={vm.detail.dueDate} />
                {vm.detail.paidAt && (
                  <DetailRow label="Paid" value={vm.detail.paidAt} />
                )}
                {vm.detail.status !== "paid" && (
                  <>
                    <Separator />
                    <div className="pt-2">
                      <Button
                        onClick={() => setConfirmPaidId(vm.detail!.id)}
                      >
                        Mark as Paid
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <AlertDialog
        open={confirmPaidId !== null}
        onOpenChange={(open) => {
          if (!open) setConfirmPaidId(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mark as Paid</AlertDialogTitle>
            <AlertDialogDescription>
              This will record the bill as paid. Are you sure you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Go Back</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmPaid}>
              Mark as Paid
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

