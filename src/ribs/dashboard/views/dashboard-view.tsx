"use client";

import { useState } from "react";
import { DashboardRib } from "../rib";
import { StatusBadge } from "@/components/status-badge";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Wallet01Icon,
  MoneyReceiveSquareIcon,
  Invoice01Icon,
  ArrowRight01Icon,
  ArrowLeftRightIcon,
  Building01Icon,
  CreditCardIcon,
} from "@hugeicons/core-free-icons";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PageHeader } from "@/components/page-header";
import { useOrg } from "@/contexts/org-context";
import { api } from "@/trpc/react";
import { toast } from "sonner";

const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

function buildSpendByCategoryConfig(data: { name: string; value: number }[]): ChartConfig {
  const config: ChartConfig = {};
  data.forEach((d, i) => {
    config[d.name] = {
      label: d.name,
      color: CHART_COLORS[i % CHART_COLORS.length],
    };
  });
  return config;
}

function buildPercentageLineChartConfig(
  categories: { key: string; label: string }[],
): ChartConfig {
  const config: ChartConfig = {};
  categories.forEach((c, i) => {
    config[c.key] = {
      label: c.label,
      color: CHART_COLORS[i % CHART_COLORS.length],
    };
  });
  return config;
}

function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export function DashboardView() {
  const vm = DashboardRib.useViewModel();
  const { mode } = useOrg();
  const inPersonal = mode === "personal";
  const { data: fromOrgs = [] } = api.organization.getPersonalFromOrgs.useQuery(undefined, {
    enabled: inPersonal,
  });
  const utils = api.useUtils();
  const [requestCardOrgId, setRequestCardOrgId] = useState<number | null>(null);

  const requestCard = api.card.requestCardFromOrg.useMutation({
    onSuccess: () => {
      toast.success("Card request sent. Your organization will review it.");
      void utils.organization.getPersonalFromOrgs.invalidate();
      setRequestCardOrgId(null);
    },
    onError: (e) => toast.error(e.message),
  });

  const spendByCategoryConfig = buildSpendByCategoryConfig(vm.chartData);

  if (vm.isLoading) {
    return (
      <div className="animate-page-in">
        <div className="h-14" />
        <div className="mt-10 flex flex-col md:flex-row gap-0">
          <div className="flex-1 min-w-0 space-y-8">
            <div className="space-y-3">
              <Skeleton className="h-3 w-12" />
              <Skeleton className="h-9 w-36" />
            </div>
            <Skeleton className="h-56 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
          <div className="my-10 border-t border-border md:my-0 md:mx-8 md:self-stretch md:border-t-0 md:border-l" />
          <div className="flex-1 min-w-0 space-y-8">
            <div className="space-y-3">
              <Skeleton className="h-3 w-12" />
              <Skeleton className="h-9 w-36" />
            </div>
            <Skeleton className="h-56 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-page-in">
      <PageHeader
        title="Dashboard"
        description={
          inPersonal
            ? "Your spending and what your organizations share with you."
            : "Company spending at a glance."
        }
      />

      {inPersonal && fromOrgs.length > 0 && (
        <section className="mt-8 rounded-xl border border-border bg-muted/30 p-5">
          <h3 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-4">
            From your organizations
          </h3>
          <p className="text-muted-foreground text-sm mb-4">
            Things your organizations have shared or that need your action.
          </p>
          <ul className="space-y-3">
            {fromOrgs.map((org) => (
              <li
                key={org.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-background px-4 py-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    {org.logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={org.logoUrl}
                        alt=""
                        className="size-full rounded-lg object-contain"
                      />
                    ) : (
                      <HugeiconsIcon icon={Building01Icon} className="size-5" strokeWidth={2} />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium truncate">{org.name}</p>
                    <p className="text-muted-foreground text-xs capitalize">{org.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {org.pendingReimbursements > 0 && (
                    <Link
                      href="/reimbursements"
                      className={buttonVariants({ variant: "outline", size: "sm" })}
                    >
                      {org.pendingReimbursements} pending reimbursement
                      {org.pendingReimbursements !== 1 ? "s" : ""}
                    </Link>
                  )}
                  {org.hasPendingCardRequest ? (
                    <span className="text-muted-foreground text-sm">Card request pending</span>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setRequestCardOrgId(org.id)}
                      className="gap-1.5"
                    >
                      <HugeiconsIcon icon={CreditCardIcon} className="size-4" strokeWidth={2} />
                      Request card
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
          <p className="text-muted-foreground text-xs mt-3">
            Switch to an organization in the sidebar to act as that org (e.g. approve requests, issue cards).
          </p>
        </section>
      )}

      <Dialog open={requestCardOrgId != null} onOpenChange={(o) => !o && setRequestCardOrgId(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Request a card</DialogTitle>
            <DialogDescription>
              Your organization will review the request and can issue you a card from their account.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRequestCardOrgId(null)} disabled={requestCard.isPending}>
              Cancel
            </Button>
            <Button
              onClick={() => requestCardOrgId != null && requestCard.mutate({ organizationId: requestCardOrgId })}
              disabled={requestCard.isPending}
            >
              {requestCard.isPending ? "Sending…" : "Send request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="mt-10 flex flex-col md:flex-row gap-0">
      {/* ── Spend ─────────────────────────────────────────────────── */}
      <section className="flex-1 min-w-0 space-y-8">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Spend
            </p>
            <p className="mt-1 text-3xl font-bold tabular-nums">
              {vm.formattedTotalSpend}
            </p>
          </div>
          <Link
            href="/transactions"
            className={buttonVariants({ variant: "ghost", size: "sm" })}
          >
            All transactions
            <HugeiconsIcon icon={ArrowRight01Icon} className="ml-1 size-4" />
          </Link>
        </div>

        {/* Spend over time chart */}
        {vm.spendOverTimeLineData.length > 0 && vm.spendOverTimeCategories.length > 0 ? (
          <ChartContainer
            config={buildPercentageLineChartConfig(vm.spendOverTimeCategories)}
            className="h-56 w-full"
          >
            <LineChart
              data={vm.spendOverTimeLineData}
              margin={{ top: 4, right: 4, bottom: 4, left: 4 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis
                dataKey="period"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                className="text-xs"
              />
              <YAxis
                tickFormatter={(v: number) =>
                  new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                    maximumFractionDigits: 0,
                  }).format(v)
                }
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                className="text-xs"
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(v) => [
                      new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "USD",
                        minimumFractionDigits: 2,
                      }).format(Number(v)),
                      undefined,
                    ]}
                  />
                }
              />
              <ChartLegend content={<ChartLegendContent />} />
              {vm.spendOverTimeCategories.map((cat) => (
                <Line
                  key={cat.key}
                  type="monotone"
                  dataKey={cat.key}
                  name={cat.label}
                  stroke={`var(--color-${cat.key})`}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                  connectNulls
                />
              ))}
            </LineChart>
          </ChartContainer>
        ) : (
          <Empty className="py-10">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <HugeiconsIcon icon={ArrowLeftRightIcon} className="size-6" />
              </EmptyMedia>
              <EmptyTitle>No timeline data yet</EmptyTitle>
              <EmptyDescription>
                Spending over time will appear once you have completed transactions.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}

        {/* Recent transactions list */}
        {vm.recentTx.length === 0 ? (
          <Empty className="py-10">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <HugeiconsIcon icon={ArrowLeftRightIcon} className="size-6" />
              </EmptyMedia>
              <EmptyTitle>No transactions yet</EmptyTitle>
              <EmptyDescription>
                Transactions from your cards will show up here.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Recent
            </p>
            <ul className="divide-y divide-border">
              {vm.recentTx.map((tx) => (
                <li
                  key={tx.id}
                  className="flex items-center justify-between gap-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{tx.merchant}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {tx.category} · {formatDate(tx.date)}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-semibold tabular-nums">{tx.amount}</p>
                    <div className="mt-0.5 flex justify-end">
                      <StatusBadge status={tx.status} />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* ── Divider ────────────────────────────────────────────────── */}
      <div className="my-10 border-t border-border md:my-0 md:mx-8 md:self-stretch md:border-t-0 md:border-l" />

      {/* ── Earn ──────────────────────────────────────────────────── */}
      <section className="flex-1 min-w-0 space-y-8">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Earn
            </p>
            <p className="mt-1 text-3xl font-bold tabular-nums">
              {vm.pendingReimbursements}{" "}
              <span className="text-xl font-medium text-muted-foreground">pending</span>
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {inPersonal
                ? "Pending reimbursements from your organizations"
                : "Your pending reimbursements"}
            </p>
          </div>
          <Link
            href="/reimbursements"
            className={buttonVariants({ variant: "ghost", size: "sm" })}
          >
            Reimbursements
            <HugeiconsIcon icon={ArrowRight01Icon} className="ml-1 size-4" />
          </Link>
        </div>

        {/* Spend by category chart */}
        {vm.chartData.length > 0 ? (
          <ChartContainer config={spendByCategoryConfig} className="h-56 w-full">
            <PieChart>
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(v) => [
                      new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "USD",
                        minimumFractionDigits: 2,
                      }).format(Number(v)),
                      undefined,
                    ]}
                  />
                }
              />
              <Pie
                data={vm.chartData}
                dataKey="value"
                nameKey="name"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                cornerRadius={4}
              >
                {vm.chartData.map((entry, index) => (
                  <Cell
                    key={entry.name}
                    fill={CHART_COLORS[index % CHART_COLORS.length]}
                  />
                ))}
              </Pie>
              <ChartLegend content={<ChartLegendContent nameKey="name" />} />
            </PieChart>
          </ChartContainer>
        ) : (
          <Empty className="py-10">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <HugeiconsIcon icon={Wallet01Icon} className="size-6" />
              </EmptyMedia>
              <EmptyTitle>No category data yet</EmptyTitle>
              <EmptyDescription>
                Category breakdowns appear once you have completed transactions.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}

        {/* Earn summary list */}
        <ul className="divide-y divide-border">
          <li className="flex items-center justify-between gap-4 py-3">
            <div className="flex items-center gap-3">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted/60 text-muted-foreground">
                <HugeiconsIcon
                  icon={MoneyReceiveSquareIcon}
                  className="size-4"
                  strokeWidth={1.5}
                />
              </span>
              <div>
                <p className="text-sm font-medium">Pending Reimbursements</p>
                <p className="text-xs text-muted-foreground">Awaiting approval</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm tabular-nums text-muted-foreground">
                {vm.pendingReimbursements} requests
              </span>
              <Link
                href="/reimbursements"
                className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
                aria-label="View reimbursements"
              >
                <HugeiconsIcon icon={ArrowRight01Icon} className="size-4" />
              </Link>
            </div>
          </li>
          <li className="flex items-center justify-between gap-4 py-3">
            <div className="flex items-center gap-3">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted/60 text-muted-foreground">
                <HugeiconsIcon
                  icon={Invoice01Icon}
                  className="size-4"
                  strokeWidth={1.5}
                />
              </span>
              <div>
                <p className="text-sm font-medium">Upcoming Bills</p>
                <p className="text-xs text-muted-foreground">Due this period</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm tabular-nums text-muted-foreground">
                {vm.formattedUpcomingBills}
              </span>
              <Link
                href="/bills"
                className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
                aria-label="View bills"
              >
                <HugeiconsIcon icon={ArrowRight01Icon} className="size-4" />
              </Link>
            </div>
          </li>
        </ul>
      </section>
      </div>
    </div>
  );
}
