import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const STATUS_CONFIG: Record<
  string,
  { label: string; variant: "default" | "secondary" | "outline" | "destructive"; dotClass: string }
> = {
  // Transactions
  completed: { label: "Completed", variant: "secondary", dotClass: "bg-emerald-500" },
  pending: { label: "Pending", variant: "outline", dotClass: "bg-amber-500" },
  declined: { label: "Declined", variant: "destructive", dotClass: "bg-red-500" },

  // Cards
  active: { label: "Active", variant: "secondary", dotClass: "bg-emerald-500" },
  frozen: { label: "Frozen", variant: "outline", dotClass: "bg-sky-500" },
  cancelled: { label: "Cancelled", variant: "destructive", dotClass: "bg-red-500" },

  // Bills
  draft: { label: "Draft", variant: "outline", dotClass: "bg-zinc-400" },
  scheduled: { label: "Scheduled", variant: "secondary", dotClass: "bg-sky-500" },
  paid: { label: "Paid", variant: "secondary", dotClass: "bg-emerald-500" },
  // "pending" already defined above

  // Reimbursements
  approved: { label: "Approved", variant: "secondary", dotClass: "bg-emerald-500" },
  rejected: { label: "Rejected", variant: "destructive", dotClass: "bg-red-500" },
  // "pending" already defined above
};

export function StatusBadge({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  const config = STATUS_CONFIG[status] ?? {
    label: status.charAt(0).toUpperCase() + status.slice(1),
    variant: "outline" as const,
    dotClass: "bg-zinc-400",
  };

  return (
    <Badge variant={config.variant} className={cn("gap-1.5", className)}>
      <span
        className={cn("size-1.5 shrink-0 rounded-full", config.dotClass)}
        aria-hidden="true"
      />
      {config.label}
    </Badge>
  );
}
