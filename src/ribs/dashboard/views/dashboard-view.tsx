"use client";

import { DashboardRib } from "../rib";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import {
  Wallet01Icon,
  CreditCardIcon,
  MoneyReceiveSquareIcon,
  Invoice01Icon,
  ArrowRight01Icon,
  ArrowLeftRightIcon,
} from "@hugeicons/core-free-icons";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { cn } from "@/lib/utils";

const barChartConfig = {
  value: {
    label: "Spend",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

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

export function DashboardView() {
  const vm = DashboardRib.useViewModel();

  if (vm.isLoading) {
    return (
      <div className="animate-page-in space-y-8">
        <div className="h-14" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-80 rounded-2xl" />
        <Skeleton className="h-72 rounded-2xl" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="animate-page-in space-y-8">
      <PageHeader
        title="Dashboard"
        description="Company spending at a glance."
      />

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Spend"
          value={vm.formattedTotalSpend}
          icon={Wallet01Icon}
          className="animate-page-in stagger-1"
        />
        <StatCard
          title="Active Cards"
          value={String(vm.activeCards)}
          icon={CreditCardIcon}
          className="animate-page-in stagger-2"
        />
        <StatCard
          title="Pending Reimbursements"
          value={String(vm.pendingReimbursements)}
          icon={MoneyReceiveSquareIcon}
          className="animate-page-in stagger-3"
        />
        <StatCard
          title="Upcoming Bills"
          value={vm.formattedUpcomingBills}
          icon={Invoice01Icon}
          className="animate-page-in stagger-4"
        />
      </div>

      {/* Spending by category – bar chart */}
      <Card className="transition-[box-shadow] duration-200 ease-[var(--ease-out-smooth)] hover:shadow-[0_4px_12px_0_rgb(0_0_0/0.06),0_1px_3px_0_rgb(0_0_0/0.04)] dark:hover:shadow-[0_4px_16px_0_rgb(0_0_0/0.3),0_1px_4px_0_rgb(0_0_0/0.2)]">
        <CardHeader>
          <CardTitle>Spending by Category</CardTitle>
          <CardDescription>Total completed spend per category</CardDescription>
        </CardHeader>
        <CardContent>
          {vm.chartData.length > 0 ? (
            <ChartContainer config={barChartConfig} className="h-64 w-full">
              <BarChart data={vm.chartData} layout="vertical">
                <XAxis type="number" tickFormatter={(v: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(v)} />
                <YAxis type="category" dataKey="name" width={120} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="value" fill="var(--color-value)" radius={4} />
              </BarChart>
            </ChartContainer>
          ) : (
            <Empty className="py-12">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <HugeiconsIcon icon={Wallet01Icon} className="size-6" />
                </EmptyMedia>
                <EmptyTitle>No spending data yet</EmptyTitle>
                <EmptyDescription>
                  Category breakdowns will appear here once you have completed transactions.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
        </CardContent>
      </Card>

      {/* Spend over time */}
      <Card className="transition-[box-shadow] duration-200 ease-[var(--ease-out-smooth)] hover:shadow-[0_4px_12px_0_rgb(0_0_0/0.06),0_1px_3px_0_rgb(0_0_0/0.04)] dark:hover:shadow-[0_4px_16px_0_rgb(0_0_0/0.3),0_1px_4px_0_rgb(0_0_0/0.2)]">
        <CardHeader>
          <CardTitle>Spend Over Time</CardTitle>
          <CardDescription>
            Monthly spending breakdown across your top categories.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {vm.spendOverTimeLineData.length > 0 && vm.spendOverTimeCategories.length > 0 ? (
            <ChartContainer
              config={buildPercentageLineChartConfig(vm.spendOverTimeCategories)}
              className="h-72 w-full"
            >
              <LineChart
                data={vm.spendOverTimeLineData}
                margin={{ top: 8, right: 8, bottom: 8, left: 8 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="period"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
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
            <Empty className="py-12">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <HugeiconsIcon icon={ArrowLeftRightIcon} className="size-6" />
                </EmptyMedia>
                <EmptyTitle>No timeline data yet</EmptyTitle>
                <EmptyDescription>
                  Spending over time will appear here once you have completed transactions.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
        </CardContent>
      </Card>

      {/* Recent transactions */}
      <Card className="transition-[box-shadow] duration-200 ease-[var(--ease-out-smooth)] hover:shadow-[0_4px_12px_0_rgb(0_0_0/0.06),0_1px_3px_0_rgb(0_0_0/0.04)] dark:hover:shadow-[0_4px_16px_0_rgb(0_0_0/0.3),0_1px_4px_0_rgb(0_0_0/0.2)]">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Last 10 transactions across all cards</CardDescription>
          </div>
          <Link
            href="/transactions"
            className={buttonVariants({ variant: "ghost", size: "sm" })}
          >
            View all
            <HugeiconsIcon icon={ArrowRight01Icon} className="ml-1 size-4" />
          </Link>
        </CardHeader>
        <CardContent>
          {vm.recentTx.length === 0 ? (
            <Empty className="border-border rounded-lg border border-dashed py-12">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <HugeiconsIcon icon={ArrowLeftRightIcon} className="size-6" />
                </EmptyMedia>
                <EmptyTitle>No transactions yet</EmptyTitle>
                <EmptyDescription>
                  Transactions from your cards will show up here.
                </EmptyDescription>
              </EmptyHeader>
              <Link
                href="/transactions"
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                View Transactions
              </Link>
            </Empty>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Merchant</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vm.recentTx.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell className="font-medium">{tx.merchant}</TableCell>
                    <TableCell>{tx.user}</TableCell>
                    <TableCell>{tx.category}</TableCell>
                    <TableCell>{new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(tx.date))}</TableCell>
                    <TableCell>
                      <StatusBadge status={tx.status} />
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{tx.amount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  className,
}: {
  title: string;
  value: string;
  icon: IconSvgElement;
  className?: string;
}) {
  return (
    <Card className={cn("transition-[box-shadow,transform] duration-200 ease-[var(--ease-out-smooth)] hover:shadow-[0_4px_12px_0_rgb(0_0_0/0.06),0_1px_3px_0_rgb(0_0_0/0.04)] dark:hover:shadow-[0_4px_16px_0_rgb(0_0_0/0.3),0_1px_4px_0_rgb(0_0_0/0.2)] hover:-translate-y-0.5", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardDescription>{title}</CardDescription>
        <span className="text-muted-foreground" aria-hidden="true">
          <HugeiconsIcon icon={Icon} className="size-5" strokeWidth={1.5} />
        </span>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold tracking-tight tabular-nums">{value}</p>
      </CardContent>
    </Card>
  );
}

