"use client";

import Image from "next/image";
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
  Share08Icon,
  CodeIcon,
  Link01Icon,
  FlowCircleIcon,
  ArrowDown01Icon,
  InvoiceIcon,
  Logout01Icon,
} from "@hugeicons/core-free-icons";
import { LogoutLink } from "@kinde-oss/kinde-auth-nextjs/components";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { AppCommandMenu } from "@/components/app-command-menu";

const navItems = [
  {
    label: "Overview",
    items: [
      { title: "Dashboard", href: "/dashboard", icon: DashboardSquare01Icon },
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
      { title: "Invoices", href: "/invoices", icon: InvoiceIcon },
    ],
  },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLanding = pathname === "/";

  if (isLanding) {
    return <>{children}</>;
  }

  return (
    <SidebarProvider>
      <Sidebar variant="inset">
        <SidebarHeader className="p-5 pb-3">
          <Link
            href="/"
            className="flex items-center gap-2.5 rounded-xl transition-opacity duration-200 hover:opacity-80 focus-visible:outline focus-visible:ring-2 focus-visible:ring-sidebar-ring"
          >
            <Image
              src="/logo.svg"
              alt="Upside"
              width={108}
              height={29}
              className="dark:invert"
              priority
            />
          </Link>
        </SidebarHeader>
        <SidebarContent className="px-1">
          {navItems.map((group) => (
            <SidebarGroup key={group.label}>
              <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.items.map((item) => {
                    const isActive = pathname.startsWith(item.href);
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
          <SidebarGroup>
            <SidebarGroupLabel>Integrations</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <Collapsible defaultOpen className="group/integrations">
                  <SidebarMenuItem>
                    <CollapsibleTrigger
                      nativeButton={false}
                      render={
                        <span
                          data-slot="sidebar-menu-button"
                          data-sidebar="menu-button"
                          data-size="default"
                          data-active={pathname.startsWith("/integrations")}
                          className="ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground active:bg-sidebar-accent data-active:bg-sidebar-accent data-active:text-sidebar-accent-foreground data-open:hover:bg-sidebar-accent gap-2 rounded-lg px-3 py-2 h-9 text-sm text-left transition-[width,height,padding] group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-2! focus-visible:ring-2 data-active:font-medium flex w-full items-center overflow-hidden outline-hidden cursor-pointer [&>span:last-child]:truncate [&_svg]:size-4 [&_svg]:shrink-0"
                          tabIndex={0}
                          role="button"
                        />
                      }
                    >
                      <HugeiconsIcon icon={Share08Icon} strokeWidth={2} />
                      <span>Integrations</span>
                      <HugeiconsIcon icon={ArrowDown01Icon} strokeWidth={2} className="ml-auto size-4 shrink-0 transition-transform duration-200 group-data-[state=open]/integrations:rotate-180" />
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton
                            render={<Link href="/integrations/api" />}
                            data-active={pathname.startsWith("/integrations/api")}
                          >
                            <HugeiconsIcon icon={CodeIcon} strokeWidth={2} />
                            <span>API</span>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton
                            render={<Link href="/integrations/link" />}
                            data-active={pathname.startsWith("/integrations/link")}
                          >
                            <HugeiconsIcon icon={Link01Icon} strokeWidth={2} />
                            <span>Link</span>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton
                            render={<Link href="/integrations/automations" />}
                            data-active={pathname.startsWith("/integrations/automations")}
                          >
                            <HugeiconsIcon icon={FlowCircleIcon} strokeWidth={2} />
                            <span>Automations</span>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
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
            <SidebarMenuItem>
              <SidebarMenuButton
                render={
                  (props) => (
                    <LogoutLink {...props}>
                      {props.children}
                    </LogoutLink>
                  ) as React.ReactElement
                }
                tooltip="Sign out"
                className="text-muted-foreground hover:text-foreground"
              >
                <HugeiconsIcon icon={Logout01Icon} strokeWidth={2} />
                <span>Sign out</span>
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
