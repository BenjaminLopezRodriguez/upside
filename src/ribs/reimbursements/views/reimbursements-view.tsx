"use client";

import { useState, useCallback } from "react";
import { ReimbursementsRib } from "../rib";
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
import {
  Download01Icon,
  MoneyReceiveSquareIcon,
  Refresh01Icon,
  Attachment01Icon,
  FileAttachmentIcon,
} from "@hugeicons/core-free-icons";
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
import { UploadDropzone } from "@/lib/uploadthing";

const tabs = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
] as const;

type UploadedReceipt = { name: string; url: string; size: number };

export function ReimbursementsView() {
  const vm = ReimbursementsRib.useViewModel();
  const route = ReimbursementsRib.useRoute("detail");
  const [confirmAction, setConfirmAction] = useState<{
    type: "approve" | "reject";
    id: number;
  } | null>(null);
  const [receipts, setReceipts] = useState<UploadedReceipt[]>([]);

  const handleConfirm = useCallback(() => {
    if (!confirmAction) return;
    if (confirmAction.type === "approve") vm.handleApprove(confirmAction.id);
    else vm.handleReject(confirmAction.id);
    setConfirmAction(null);
  }, [confirmAction, vm]);

  return (
    <div className="animate-page-in space-y-8">
      <PageHeader
        title="Reimbursements"
        description={vm.pageDescription}
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
                    : (v as "pending" | "approved" | "rejected"),
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
                {vm.isLoading ? "Loading…" : `${vm.items.length} requests`}
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
                    `reimbursements-${new Date().toISOString().slice(0, 10)}`,
                    vm.items.map((r) => ({
                      employee: r.user,
                      description: r.description,
                      category: r.category,
                      date: r.date,
                      status: r.status,
                      amount: r.amount,
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
                  <HugeiconsIcon icon={MoneyReceiveSquareIcon} className="size-6" />
                </EmptyMedia>
                <EmptyTitle>
                  {vm.statusFilter != null
                    ? `No ${vm.statusFilter} reimbursements`
                    : "No reimbursements yet"}
                </EmptyTitle>
                <EmptyDescription>
                  {vm.statusFilter != null
                    ? "Try another tab."
                    : "Reimbursement requests will show up here."}
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <>
              <Separator className="mb-4 bg-border/50" />
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vm.items.map((r) => (
                    <TableRow
                      key={r.id}
                      className="cursor-pointer"
                      tabIndex={0}
                      role="button"
                      onClick={() => vm.openDetail(r.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          vm.openDetail(r.id);
                        }
                      }}
                    >
                      <TableCell className="font-medium">{r.user}</TableCell>
                      <TableCell>{r.description}</TableCell>
                      <TableCell>{r.category}</TableCell>
                      <TableCell>{r.date}</TableCell>
                      <TableCell>
                        <StatusBadge status={r.status} />
                      </TableCell>
                      <TableCell className="text-right tabular-nums">{r.amount}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </>
          )}
        </CardContent>
      </Card>

      {/* Receipt Bin */}
      <Card>
        <CardHeader className="border-b border-border/60 pb-4">
          <div className="flex items-center gap-2">
            <HugeiconsIcon icon={Attachment01Icon} strokeWidth={2} className="size-4 text-muted-foreground" />
            <span className="text-sm font-medium">Receipt Bin</span>
            <span className="ml-auto text-xs text-muted-foreground">
              Images &amp; PDFs up to 8 MB each
            </span>
          </div>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          <UploadDropzone
            endpoint="receiptUpload"
            onClientUploadComplete={(files) => {
              setReceipts((prev) => [
                ...prev,
                ...files.map((f) => ({ name: f.name, url: f.url, size: f.size })),
              ]);
              toast.success(
                files.length === 1
                  ? "Receipt uploaded"
                  : `${files.length} receipts uploaded`,
              );
            }}
            onUploadError={(err) => { toast.error(err.message); }}
          />
          {receipts.length > 0 && (
            <ul className="divide-y rounded-xl border">
              {receipts.map((r, i) => (
                <li key={i} className="flex items-center gap-3 px-4 py-3">
                  <HugeiconsIcon
                    icon={FileAttachmentIcon}
                    strokeWidth={2}
                    className="size-4 shrink-0 text-muted-foreground"
                  />
                  <span className="min-w-0 flex-1 truncate text-sm">{r.name}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {(r.size / 1024).toFixed(0)} KB
                  </span>
                  <a
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 text-xs text-primary hover:underline"
                  >
                    View
                  </a>
                </li>
              ))}
            </ul>
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
                <SheetTitle>{vm.detail.description}</SheetTitle>
                <SheetDescription>
                  Submitted by {vm.detail.user}
                </SheetDescription>
              </SheetHeader>
              <div className="space-y-4 py-4">
                <DetailRow label="Amount" value={vm.detail.amount} />
                <DetailRow label="Status">
                  <StatusBadge status={vm.detail.status} />
                </DetailRow>
                <Separator />
                <DetailRow label="Category" value={vm.detail.category} />
                <DetailRow label="Submitted" value={vm.detail.submittedAt} />
                {vm.detail.reviewedAt && (
                  <DetailRow label="Reviewed" value={vm.detail.reviewedAt} />
                )}
                {vm.detail.status === "pending" && vm.canApprove && (
                  <>
                    <Separator />
                    <div className="flex gap-2 pt-2">
                      <Button
                        onClick={() =>
                          setConfirmAction({ type: "approve", id: vm.detail!.id })
                        }
                      >
                        Approve
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() =>
                          setConfirmAction({ type: "reject", id: vm.detail!.id })
                        }
                      >
                        Reject
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
        open={confirmAction !== null}
        onOpenChange={(open) => {
          if (!open) setConfirmAction(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmAction?.type === "approve"
                ? "Approve Reimbursement"
                : "Reject Reimbursement"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction?.type === "approve"
                ? "This will approve the reimbursement for payment."
                : "This will reject the reimbursement request. This action cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Go Back</AlertDialogCancel>
            <AlertDialogAction
              variant={confirmAction?.type === "reject" ? "destructive" : "default"}
              onClick={handleConfirm}
            >
              {confirmAction?.type === "approve" ? "Approve" : "Reject"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}


