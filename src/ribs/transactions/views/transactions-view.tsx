"use client";

import { useState } from "react";
import { TransactionsRib } from "../rib";
import { StatusBadge } from "@/components/status-badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
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
import { ArrowLeftRightIcon, Download01Icon, Refresh01Icon, Upload01Icon } from "@hugeicons/core-free-icons";
import { downloadCsv } from "@/lib/csv";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { UploadDropzone } from "@/lib/uploadthing";
import { api } from "@/trpc/react";

const statusOptions = [
  { label: "All", value: "all" },
  { label: "Completed", value: "completed" },
  { label: "Pending", value: "pending" },
  { label: "Declined", value: "declined" },
];

export function TransactionsView() {
  const vm = TransactionsRib.useViewModel();
  const route = TransactionsRib.useRoute("detail");
  const [importOpen, setImportOpen] = useState(false);
  const importFromCsv = api.transaction.importFromCsv.useMutation({
    onSuccess: (data) => {
      vm.refetch();
      toast.success(`Imported ${data.imported} transaction${data.imported === 1 ? "" : "s"}`);
      setImportOpen(false);
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  return (
    <div className="animate-page-in space-y-8">
      <PageHeader
        title="Transactions"
        description={
          <>
            Review card spend, search by memo, and drill into details. Tip:{" "}
            <span className="font-medium text-foreground">Cmd/Ctrl</span> +{" "}
            <span className="font-medium text-foreground">B</span> toggles the
            sidebar.
          </>
        }
      />

      <Card>
        <CardHeader className="border-b border-border/60 pb-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Input
                aria-label="Search transactions by memo"
                placeholder="Search by memo\u2026"
                value={vm.search}
                onChange={(e) => vm.setSearch(e.target.value)}
                className="w-full sm:w-80"
              />
              <Select
                items={statusOptions}
                value={vm.statusFilter ?? "all"}
                onValueChange={(v) =>
                  vm.setStatusFilter(
                    v === "all"
                      ? undefined
                      : (v as "pending" | "completed" | "declined"),
                  )
                }
              >
                <SelectTrigger className="w-full sm:w-44" aria-label="Filter by status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {statusOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <div className="text-muted-foreground text-sm">
                {vm.isLoading ? "Loading\u2026" : `${vm.transactions.length} transactions`}
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
                onClick={() => setImportOpen(true)}
              >
                <HugeiconsIcon icon={Upload01Icon} strokeWidth={2} data-icon="inline-start" />
                Import CSV
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={vm.transactions.length === 0}
                onClick={() => {
                  downloadCsv(
                    `transactions-${new Date().toISOString().slice(0, 10)}`,
                    vm.transactions.map((t) => ({
                      merchant: t.merchant,
                      user: t.user,
                      card: `••${t.cardLast4}`,
                      category: t.category,
                      date: t.date,
                      status: t.status,
                      amount: t.amount,
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
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : vm.transactions.length === 0 ? (
            <Empty className="border-border/80 rounded-xl border border-dashed py-16">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <HugeiconsIcon icon={ArrowLeftRightIcon} className="size-6" />
                </EmptyMedia>
                <EmptyTitle>
                  {vm.search || vm.statusFilter
                    ? "No matching transactions"
                    : "No transactions yet"}
                </EmptyTitle>
                <EmptyDescription>
                  {vm.search || vm.statusFilter
                    ? "Try adjusting your search or filter."
                    : "Transactions from your cards will appear here."}
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <>
              <Separator className="mb-4 bg-border/50" />
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Merchant</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Card</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vm.transactions.map((tx) => (
                    <TableRow
                      key={tx.id}
                      className="cursor-pointer"
                      tabIndex={0}
                      role="button"
                      onClick={() => vm.openDetail(tx.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          vm.openDetail(tx.id);
                        }
                      }}
                    >
                      <TableCell className="font-medium">
                        {tx.merchant}
                      </TableCell>
                      <TableCell>{tx.user}</TableCell>
                      <TableCell>••{tx.cardLast4}</TableCell>
                      <TableCell>{tx.category}</TableCell>
                      <TableCell>{tx.date}</TableCell>
                      <TableCell>
                        <StatusBadge status={tx.status} />
                      </TableCell>
                      <TableCell className="text-right tabular-nums">{tx.amount}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </>
          )}
        </CardContent>
      </Card>

      {/* Import CSV dialog */}
      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent className="sm:max-w-md" showCloseButton={true}>
          <DialogHeader>
            <DialogTitle>Import transactions from CSV</DialogTitle>
            <DialogDescription>
              Upload a CSV with columns: date, amount, merchant (or description), category, memo. Amount can be in dollars (e.g. 12.99) or cents.
            </DialogDescription>
          </DialogHeader>
          <UploadDropzone
            endpoint="transactionCsv"
            onClientUploadComplete={(res) => {
              const key = res[0]?.key;
              if (key) {
                importFromCsv.mutate({ fileKey: key });
              }
            }}
            onUploadError={(err) => {
              toast.error(err.message);
            }}
          />
          {importFromCsv.isPending && (
            <p className="text-muted-foreground text-sm">Importing transactions…</p>
          )}
        </DialogContent>
      </Dialog>

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
                <SheetTitle>{vm.detail.merchant}</SheetTitle>
                <SheetDescription>{vm.detail.date}</SheetDescription>
              </SheetHeader>
              <div className="space-y-4 py-4">
                <DetailRow label="Amount" value={vm.detail.amount} />
                <DetailRow label="Status">
                  <StatusBadge status={vm.detail.status} />
                </DetailRow>
                <Separator />
                <DetailRow label="Category" value={vm.detail.category} />
                <DetailRow label="Card" value={`${vm.detail.cardName} (••${vm.detail.cardLast4})`} />
                <DetailRow label="User" value={vm.detail.user} />
                <DetailRow label="Currency" value={vm.detail.currency} />
                {vm.detail.memo && (
                  <DetailRow label="Memo" value={vm.detail.memo} />
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}


