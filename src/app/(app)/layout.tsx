"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  DashboardSquare01Icon,
  ArrowLeftRightIcon,
  CreditCardIcon,
  MoneyReceiveSquareIcon,
  Invoice01Icon,
  SettingsIcon,
} from "@hugeicons/core-free-icons";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { AppCommandMenu } from "@/components/app-command-menu";

const navItems = [
  {
    label: "Overview",
    items: [
      { title: "Dashboard", href: "/", icon: DashboardSquare01Icon },
    ],
  },
  {
    label: "Spend",
    items: [
      { title: "Transactions", href: "/transactions", icon: ArrowLeftRightIcon },
      { title: "Cards", href: "/cards", icon: CreditCardIcon },
    ],
  },
  {
    label: "Finance",
    items: [
      {
        title: "Reimbursements",
        href: "/reimbursements",
        icon: MoneyReceiveSquareIcon,
      },
      { title: "Bill Pay", href: "/bills", icon: Invoice01Icon },
    ],
  },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <SidebarProvider>
      <Sidebar variant="inset">
        <SidebarHeader className="p-5 pb-3">
          <Link
            href="/"
            className="flex items-center gap-2.5 rounded-xl transition-opacity duration-200 hover:opacity-80 focus-visible:outline focus-visible:ring-2 focus-visible:ring-sidebar-ring"
          >
            <div className="bg-primary text-primary-foreground flex size-9 items-center justify-center rounded-[10px] text-sm font-bold shadow-[0_2px_8px_-2px_rgb(0_0_0/0.12),inset_0_1px_0_0_rgb(255_255_255/0.1)]">
              U
            </div>
            <div className="flex flex-col">
              <span className="text-[15px] font-semibold leading-tight tracking-tight">Upside</span>
              <span className="text-[11px] text-muted-foreground leading-tight">Spend management</span>
            </div>
          </Link>
        </SidebarHeader>
        <SidebarContent className="px-1">
          {navItems.map((group) => (
            <SidebarGroup key={group.label}>
              <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.items.map((item) => {
                    const isActive =
                      item.href === "/"
                        ? pathname === "/"
                        : pathname.startsWith(item.href);
                    return (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton
                          render={<Link href={item.href} />}
                          data-active={isActive}
                          tooltip={item.title}
                        >
                          <HugeiconsIcon icon={item.icon} strokeWidth={2} />
                          <span>{item.title}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                render={<Link href="/settings" />}
                data-active={pathname.startsWith("/settings")}
                tooltip="Settings"
              >
                <HugeiconsIcon icon={SettingsIcon} strokeWidth={2} />
                <span>Settings</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 px-6">
          <SidebarTrigger className="-ml-1" aria-label="Toggle sidebar" />
          <div className="ml-auto flex items-center gap-1">
            <ThemeToggle />
          </div>
        </header>
        <div className="flex min-h-0 flex-1 flex-col overflow-auto px-6 pb-8">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </div>
      </SidebarInset>

      <AppCommandMenu />
    </SidebarProvider>
  );
}
