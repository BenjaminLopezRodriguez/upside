"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { InvoicesRib, formatCents } from "../rib";
import type { Invoice, InvoiceStatus, CreateInvoiceData, InvoiceLineItem } from "../rib";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
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
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { DetailRow } from "@/components/detail-row";
import {
  PlusSignIcon,
  Invoice01Icon,
  MailSend01Icon,
  Copy01Icon,
  Delete01Icon,
  CheckmarkCircle02Icon,
} from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";

const STATUS_CONFIG: Record<
  InvoiceStatus,
  { label: string; className: string }
> = {
  draft: {
    label: "Draft",
    className: "",
  },
  sent: {
    label: "Sent",
    className:
      "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800",
  },
  viewed: {
    label: "Viewed",
    className:
      "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/30 dark:text-violet-400 dark:border-violet-800",
  },
  paid: {
    label: "Paid",
    className:
      "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800",
  },
  overdue: {
    label: "Overdue",
    className:
      "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800",
  },
};

const STATUS_FILTER_OPTIONS: { label: string; value: InvoiceStatus | "all" }[] =
  [
    { label: "All", value: "all" },
    { label: "Draft", value: "draft" },
    { label: "Sent", value: "sent" },
    { label: "Viewed", value: "viewed" },
    { label: "Paid", value: "paid" },
    { label: "Overdue", value: "overdue" },
  ];

export function InvoicesView() {
  const vm = InvoicesRib.useViewModel();
  const createRoute = InvoicesRib.useRoute("createInvoice");
  const detailRoute = InvoicesRib.useRoute("detail");

  return (
    <div className="animate-page-in space-y-8">
      <PageHeader
        title="Invoices"
        description="Create and send professional invoices via email or payment link."
        actions={
          <Button onClick={vm.openCreate}>
            <HugeiconsIcon
              icon={PlusSignIcon}
              strokeWidth={2}
              data-icon="inline-start"
            />
            New Invoice
          </Button>
        }
      />

      {/* Stats */}
      <div className="flex flex-wrap items-baseline gap-y-3 py-4">
        <StatSegment
          label="Outstanding"
          value={vm.totalOutstanding}
          className="animate-page-in stagger-1 min-w-0 flex-1"
        />
        <Separator orientation="vertical" className="h-8 shrink-0" />
        <StatSegment
          label="Collected"
          value={vm.totalPaid}
          className="animate-page-in stagger-2 min-w-0 flex-1"
        />
        <Separator orientation="vertical" className="h-8 shrink-0" />
        <StatSegment
          label="Overdue"
          value={String(vm.overdueCount)}
          highlight={vm.overdueCount > 0}
          className="animate-page-in stagger-3 min-w-0 flex-1"
        />
      </div>

      {/* Table */}
      <Card className="transition-[box-shadow] duration-200 ease-[var(--ease-out-smooth)] hover:shadow-[0_4px_12px_0_rgb(0_0_0/0.06),0_1px_3px_0_rgb(0_0_0/0.04)] dark:hover:shadow-[0_4px_16px_0_rgb(0_0_0/0.3),0_1px_4px_0_rgb(0_0_0/0.2)]">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>All Invoices</CardTitle>
            <CardDescription>
              {vm.filteredInvoices.length} invoice
              {vm.filteredInvoices.length !== 1 ? "s" : ""}
            </CardDescription>
          </div>
          <Select
            value={vm.statusFilter}
            onValueChange={(v) =>
              vm.setStatusFilter(v as InvoiceStatus | "all")
            }
            items={STATUS_FILTER_OPTIONS}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {STATUS_FILTER_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent className="p-0">
          {vm.filteredInvoices.length === 0 ? (
            <Empty className="border-border mx-4 mb-4 rounded-lg border border-dashed py-12">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <HugeiconsIcon icon={Invoice01Icon} className="size-6" />
                </EmptyMedia>
                <EmptyTitle>No invoices</EmptyTitle>
                <EmptyDescription>
                  Create your first invoice and send it directly from Deltra.
                </EmptyDescription>
              </EmptyHeader>
              <Button onClick={vm.openCreate}>
                <HugeiconsIcon
                  icon={PlusSignIcon}
                  strokeWidth={2}
                  data-icon="inline-start"
                />
                New Invoice
              </Button>
            </Empty>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Recipient</TableHead>
                  <TableHead className="hidden sm:table-cell">Issued</TableHead>
                  <TableHead className="hidden md:table-cell">Due</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="w-[100px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {vm.filteredInvoices.map((inv) => (
                  <InvoiceRow
                    key={inv.id}
                    invoice={inv}
                    onOpen={() => vm.openDetail(inv.id)}
                    onCopyLink={() => vm.copyPaymentLink(inv.id)}
                    onSend={() => vm.sendInvoice(inv.id)}
                    onMarkPaid={() => vm.markPaid(inv.id)}
                    onRemind={() => vm.sendReminder(inv.id)}
                  />
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Invoice detail sheet */}
      <Sheet
        open={detailRoute.attached}
        onOpenChange={(open) => { if (!open) vm.closeDetail(); }}
      >
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {vm.selectedInvoice && (
            <InvoiceDetail
              invoice={vm.selectedInvoice}
              onCopyLink={() => vm.copyPaymentLink(vm.selectedInvoice!.id)}
              onSend={() => vm.sendInvoice(vm.selectedInvoice!.id)}
              onMarkPaid={() => vm.markPaid(vm.selectedInvoice!.id)}
              onRemind={() => vm.sendReminder(vm.selectedInvoice!.id)}
            />
          )}
        </SheetContent>
      </Sheet>

      {/* Create invoice dialog */}
      <CreateInvoiceDialog
        open={createRoute.attached}
        onClose={vm.closeCreate}
        onCreate={vm.createInvoice}
      />
    </div>
  );
}

function StatSegment({
  label,
  value,
  highlight,
  className,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-0.5 pl-4 first:pl-0", className)}>
      <span className="text-muted-foreground text-sm">{label}</span>
      <span
        className={cn(
          "text-2xl font-bold tracking-tight tabular-nums",
          highlight && "text-destructive",
        )}
      >
        {value}
      </span>
    </div>
  );
}

function InvoiceRow({
  invoice,
  onOpen,
  onCopyLink,
  onSend,
  onMarkPaid,
  onRemind,
}: {
  invoice: Invoice;
  onOpen: () => void;
  onCopyLink: () => void;
  onSend: () => void;
  onMarkPaid: () => void;
  onRemind: () => void;
}) {
  const cfg = STATUS_CONFIG[invoice.status];

  return (
    <TableRow
      className="cursor-pointer"
      onClick={onOpen}
    >
      <TableCell>
        <span className="font-mono text-sm font-medium">
          {invoice.invoiceNumber}
        </span>
      </TableCell>
      <TableCell>
        <div className="space-y-0.5">
          <p className="font-medium text-sm">{invoice.recipientName}</p>
          <p className="text-xs text-muted-foreground">{invoice.recipientEmail}</p>
        </div>
      </TableCell>
      <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
        {new Intl.DateTimeFormat("en-US", {
          month: "short",
          day: "numeric",
        }).format(new Date(invoice.issuedDate))}
      </TableCell>
      <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
        {new Intl.DateTimeFormat("en-US", {
          month: "short",
          day: "numeric",
        }).format(new Date(invoice.dueDate))}
      </TableCell>
      <TableCell>
        <Badge variant="outline" className={cn("text-[10px]", cfg.className)}>
          {cfg.label}
        </Badge>
      </TableCell>
      <TableCell className="text-right tabular-nums font-medium">
        {formatCents(invoice.totalCents)}
      </TableCell>
      <TableCell onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={onCopyLink}
            aria-label="Copy payment link"
            title="Copy payment link"
          >
            <HugeiconsIcon icon={Copy01Icon} className="size-4" strokeWidth={2} />
          </Button>
          {invoice.status === "draft" && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onSend}
              aria-label="Send invoice"
              title="Send invoice"
            >
              <HugeiconsIcon icon={MailSend01Icon} className="size-4" strokeWidth={2} />
            </Button>
          )}
          {(invoice.status === "sent" || invoice.status === "viewed" || invoice.status === "overdue") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onMarkPaid}
              className="text-xs h-7"
            >
              Mark paid
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}

function InvoiceDetail({
  invoice,
  onCopyLink,
  onSend,
  onMarkPaid,
  onRemind,
}: {
  invoice: Invoice;
  onCopyLink: () => void;
  onSend: () => void;
  onMarkPaid: () => void;
  onRemind: () => void;
}) {
  const cfg = STATUS_CONFIG[invoice.status];

  return (
    <>
      <SheetHeader className="pb-4">
        <SheetTitle className="font-mono">{invoice.invoiceNumber}</SheetTitle>
        <SheetDescription>
          {invoice.recipientName} &middot; {invoice.recipientEmail}
        </SheetDescription>
      </SheetHeader>
      <div className="space-y-5">
        <div className="flex gap-2 flex-wrap">
          <Badge variant="outline" className={cn(cfg.className)}>
            {cfg.label}
          </Badge>
        </div>

        <div className="space-y-3">
          <DetailRow label="Issued" value={
            new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" }).format(new Date(invoice.issuedDate))
          } />
          <DetailRow label="Due Date" value={
            new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" }).format(new Date(invoice.dueDate))
          } />
          {invoice.paidDate && (
            <DetailRow label="Paid On" value={
              new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" }).format(new Date(invoice.paidDate))
            } />
          )}
        </div>

        <Separator />

        {/* Line items */}
        <div>
          <p className="text-sm font-medium mb-3">Line Items</p>
          <div className="space-y-2">
            {invoice.lineItems.map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-sm truncate">{item.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.quantity} × {formatCents(item.unitPrice)}
                  </p>
                </div>
                <span className="tabular-nums text-sm font-medium ml-4">
                  {formatCents(item.quantity * item.unitPrice)}
                </span>
              </div>
            ))}
          </div>
          <Separator className="mt-3" />
          <div className="flex items-center justify-between pt-3">
            <span className="font-semibold">Total</span>
            <span className="tabular-nums font-bold text-lg">
              {formatCents(invoice.totalCents)}
            </span>
          </div>
        </div>

        {invoice.notes && (
          <>
            <Separator />
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">Notes</p>
              <p className="text-sm text-muted-foreground">{invoice.notes}</p>
            </div>
          </>
        )}

        <Separator />

        {/* Payment link */}
        <div>
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-2">Payment Link</p>
          <div className="flex items-center gap-2 rounded-lg border bg-muted/40 px-3 py-2">
            <code className="text-xs font-mono text-muted-foreground flex-1 truncate">
              {invoice.paymentLink}
            </code>
            <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={onCopyLink}>
              <HugeiconsIcon icon={Copy01Icon} className="size-3.5" strokeWidth={2} />
            </Button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2 pt-2">
          {invoice.status === "draft" && (
            <Button onClick={onSend} className="gap-2">
              <HugeiconsIcon icon={MailSend01Icon} strokeWidth={2} className="size-4" />
              Send Invoice
            </Button>
          )}
          {(invoice.status === "sent" || invoice.status === "viewed" || invoice.status === "overdue") && (
            <>
              <Button onClick={onMarkPaid}>
                <HugeiconsIcon icon={CheckmarkCircle02Icon} strokeWidth={2} className="size-4 mr-1.5" />
                Mark as Paid
              </Button>
              <Button variant="outline" onClick={onRemind}>
                <HugeiconsIcon icon={MailSend01Icon} strokeWidth={2} className="size-4 mr-1.5" />
                Send Reminder
              </Button>
            </>
          )}
          <Button variant="outline" onClick={onCopyLink}>
            <HugeiconsIcon icon={Copy01Icon} strokeWidth={2} className="size-4 mr-1.5" />
            Copy Link
          </Button>
        </div>
      </div>
    </>
  );
}

function CreateInvoiceDialog({
  open,
  onClose,
  onCreate,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (data: CreateInvoiceData) => void;
}) {
  const [recipientName, setRecipientName] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [lineItems, setLineItems] = useState<InvoiceLineItem[]>([
    { description: "", quantity: 1, unitPrice: 0 },
  ]);
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [sendNow, setSendNow] = useState(true);

  const addLineItem = () => {
    setLineItems((prev) => [
      ...prev,
      { description: "", quantity: 1, unitPrice: 0 },
    ]);
  };

  const updateLineItem = (
    index: number,
    field: keyof InvoiceLineItem,
    value: string | number,
  ) => {
    setLineItems((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, [field]: value } : item,
      ),
    );
  };

  const removeLineItem = (index: number) => {
    if (lineItems.length <= 1) return;
    setLineItems((prev) => prev.filter((_, i) => i !== index));
  };

  const total = lineItems.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0,
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientName.trim() || !recipientEmail.trim() || !dueDate) return;
    onCreate({
      recipientName: recipientName.trim(),
      recipientEmail: recipientEmail.trim(),
      lineItems,
      dueDate,
      notes: notes.trim(),
      sendNow,
    });
    setRecipientName("");
    setRecipientEmail("");
    setLineItems([{ description: "", quantity: 1, unitPrice: 0 }]);
    setDueDate("");
    setNotes("");
    setSendNow(true);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>New Invoice</DialogTitle>
          <DialogDescription>
            Create and send an invoice via email or share the payment link directly.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel>Recipient Name</FieldLabel>
              <Input
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="Acme Corp."
                required
              />
            </Field>
            <Field>
              <FieldLabel>Recipient Email</FieldLabel>
              <Input
                type="email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                placeholder="billing@acme.com"
                required
              />
            </Field>
          </div>

          <Field>
            <FieldLabel>Line Items</FieldLabel>
            <div className="space-y-2 mt-1">
              {lineItems.map((item, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <Input
                    className="flex-1"
                    value={item.description}
                    onChange={(e) =>
                      updateLineItem(i, "description", e.target.value)
                    }
                    placeholder="Description"
                    required
                  />
                  <Input
                    className="w-16"
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) =>
                      updateLineItem(i, "quantity", Number(e.target.value))
                    }
                    placeholder="Qty"
                    required
                  />
                  <Input
                    className="w-28"
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.unitPrice / 100}
                    onChange={(e) =>
                      updateLineItem(
                        i,
                        "unitPrice",
                        Math.round(parseFloat(e.target.value) * 100),
                      )
                    }
                    placeholder="Unit $"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeLineItem(i)}
                    disabled={lineItems.length <= 1}
                    className="shrink-0 text-muted-foreground"
                  >
                    <HugeiconsIcon icon={Delete01Icon} className="size-4" strokeWidth={2} />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addLineItem}
                className="mt-1"
              >
                <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} data-icon="inline-start" />
                Add Item
              </Button>
            </div>
            {total > 0 && (
              <p className="text-right text-sm font-semibold tabular-nums mt-2">
                Total: {formatCents(total)}
              </p>
            )}
          </Field>

          <Field>
            <FieldLabel>Due Date</FieldLabel>
            <Input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              required
            />
          </Field>

          <Field>
            <FieldLabel>Notes (optional)</FieldLabel>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Payment terms, instructions, or any relevant details…"
              rows={2}
            />
          </Field>

          <label className="flex items-center gap-3 rounded-xl border px-4 py-3 cursor-pointer hover:bg-muted/50 transition-colors">
            <Checkbox
              checked={sendNow}
              onCheckedChange={(v) => setSendNow(Boolean(v))}
            />
            <div>
              <p className="text-sm font-medium">Send immediately</p>
              <p className="text-xs text-muted-foreground">
                Email the invoice to {recipientEmail || "the recipient"} right away. Uncheck to save as draft.
              </p>
            </div>
          </label>

          <DialogFooter>
            <Button variant="outline" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                !recipientName.trim() ||
                !recipientEmail.trim() ||
                !dueDate ||
                lineItems.some((item) => !item.description.trim())
              }
            >
              {sendNow ? (
                <>
                  <HugeiconsIcon icon={MailSend01Icon} strokeWidth={2} className="size-4 mr-1.5" />
                  Send Invoice
                </>
              ) : (
                "Save as Draft"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
