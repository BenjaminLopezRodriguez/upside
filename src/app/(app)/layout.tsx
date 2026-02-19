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
  Building01Icon,
  UserGroupIcon,
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
import { api } from "@/trpc/react";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLanding = pathname === "/";

  const { data: membership } = api.organization.getMyOrg.useQuery();

  const isOwner = membership?.role === "owner";
  const org = membership?.organization;
  const isCorporateOwner = isOwner && org?.type === "corporate";

  // For non-owner members, filter nav items based on granted permissions.
  const canViewTransactions = isOwner || (membership?.canViewTransactions ?? true);
  const canViewCards = isOwner || (membership?.canCreateCards ?? false);
  const canViewReimbursements = isOwner || (membership?.canSubmitReimbursements ?? true);
  const canViewBills = isOwner || (membership?.canViewBills ?? false);
  const canViewIntegrations = isOwner || (membership?.canManageIntegrations ?? false);

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
            {org?.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={org.logoUrl}
                alt={org.name}
                className="h-7 max-w-[108px] object-contain"
              />
            ) : (
              <Image
                src="/logo.svg"
                alt="Upside"
                width={108}
                height={29}
                className="dark:invert"
                priority
              />
            )}
          </Link>
          {org && (
            <p className="mt-1 truncate text-xs text-muted-foreground">{org.name}</p>
          )}
        </SidebarHeader>
        <SidebarContent className="px-1">
          {/* Overview — visible to everyone */}
          <SidebarGroup>
            <SidebarGroupLabel>Overview</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    render={<Link href="/dashboard" />}
                    data-active={pathname.startsWith("/dashboard")}
                    tooltip="Dashboard"
                  >
                    <HugeiconsIcon icon={DashboardSquare01Icon} strokeWidth={2} />
                    <span>Dashboard</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Spend — gated by member permissions */}
          {(canViewTransactions || canViewCards) && (
            <SidebarGroup>
              <SidebarGroupLabel>Spend</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {canViewTransactions && (
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        render={<Link href="/transactions" />}
                        data-active={pathname.startsWith("/transactions")}
                        tooltip="Transactions"
                      >
                        <HugeiconsIcon icon={ArrowLeftRightIcon} strokeWidth={2} />
                        <span>Transactions</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )}
                  {canViewCards && (
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        render={<Link href="/cards" />}
                        data-active={pathname.startsWith("/cards")}
                        tooltip="Cards"
                      >
                        <HugeiconsIcon icon={CreditCardIcon} strokeWidth={2} />
                        <span>Cards</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}

          {/* Finance — gated by member permissions */}
          {(canViewReimbursements || canViewBills) && (
            <SidebarGroup>
              <SidebarGroupLabel>Finance</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {canViewReimbursements && (
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        render={<Link href="/reimbursements" />}
                        data-active={pathname.startsWith("/reimbursements")}
                        tooltip="Reimbursements"
                      >
                        <HugeiconsIcon icon={MoneyReceiveSquareIcon} strokeWidth={2} />
                        <span>Reimbursements</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )}
                  {canViewBills && (
                    <>
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          render={<Link href="/bills" />}
                          data-active={pathname.startsWith("/bills")}
                          tooltip="Bill Pay"
                        >
                          <HugeiconsIcon icon={Invoice01Icon} strokeWidth={2} />
                          <span>Bill Pay</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          render={<Link href="/invoices" />}
                          data-active={pathname.startsWith("/invoices")}
                          tooltip="Invoices"
                        >
                          <HugeiconsIcon icon={InvoiceIcon} strokeWidth={2} />
                          <span>Invoices</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </>
                  )}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}

          {/* Integrations — gated by member permissions */}
          {canViewIntegrations && (
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
          )}

          {/* Company section — corporate owners only */}
          {isCorporateOwner && (
            <SidebarGroup>
              <SidebarGroupLabel>Company</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      render={<Link href="/company/members" />}
                      data-active={pathname.startsWith("/company/members")}
                      tooltip="Members"
                    >
                      <HugeiconsIcon icon={UserGroupIcon} strokeWidth={2} />
                      <span>Members</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      render={<Link href="/company/settings" />}
                      data-active={pathname.startsWith("/company/settings")}
                      tooltip="Company Settings"
                    >
                      <HugeiconsIcon icon={Building01Icon} strokeWidth={2} />
                      <span>Company Settings</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}
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
