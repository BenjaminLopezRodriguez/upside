"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
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
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
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
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/components/ui/avatar";
import { AppCommandMenu } from "@/components/app-command-menu";
import { OrgSwitcher, type OrgMode } from "@/components/org-switcher";
import { OrgContext } from "@/contexts/org-context";
import { api } from "@/trpc/react";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLanding = pathname === "/";

  // ── Mode & active org — persisted to localStorage ─────────────────
  const [mode, setMode] = useState<OrgMode>("personal");
  const [activeOrgId, setActiveOrgId] = useState<number | null>(null);

  useEffect(() => {
    const savedMode = localStorage.getItem("upside-mode") as OrgMode | null;
    const savedOrgId = localStorage.getItem("upside-active-org");
    if (savedMode) setMode(savedMode);
    if (savedOrgId) setActiveOrgId(Number(savedOrgId));
  }, []);

  const handleModeSelect = (newMode: OrgMode, orgId: number | null = null) => {
    setMode(newMode);
    setActiveOrgId(orgId);
    localStorage.setItem("upside-mode", newMode);
    localStorage.setItem("upside-active-org", orgId != null ? String(orgId) : "");
  };

  // ── Org data (only when not on landing to avoid 401 + console error) ──
  const { data: myOrgs } = api.organization.listMyOrgs.useQuery(undefined, {
    enabled: !isLanding,
  });

  const activeMembership =
    mode === "org" && activeOrgId
      ? (myOrgs?.find((m) => m.organization.id === activeOrgId) ?? null)
      : null;

  const isOrgOwner = activeMembership?.role === "owner";
  const activeOrg = activeMembership?.organization ?? null;
  const isCorporateOwner = isOrgOwner && activeOrg?.type === "corporate";
  const isMember = mode === "org" && activeMembership != null && !isOrgOwner;

  const { user: kindeUser } = useKindeBrowserClient();
  const memberInitials = kindeUser
    ? [kindeUser.given_name?.[0], kindeUser.family_name?.[0]]
        .filter(Boolean)
        .join("")
        .toUpperCase() ||
      kindeUser.email?.[0]?.toUpperCase() ||
      "U"
    : "U";
  const memberDisplayName = kindeUser
    ? [kindeUser.given_name, kindeUser.family_name].filter(Boolean).join(" ") ||
      kindeUser.email ||
      "You"
    : "";

  // Permission gates.
  // In personal mode: everything is visible (it's the user's own workspace).
  // In org mode: only show sections the membership explicitly grants.
  // If in org mode but no membership loaded yet (loading / no active org selected),
  // hide gated sections until we have a confirmed membership — avoids a flash
  // where a member briefly sees sections they shouldn't.
  const inPersonal = mode === "personal";
  const canViewTransactions = inPersonal || isOrgOwner || (activeMembership?.canViewTransactions ?? false);
  const canViewCards        = inPersonal || isOrgOwner || (activeMembership?.canCreateCards ?? false);
  const canViewReimbursements = inPersonal || isOrgOwner || (activeMembership?.canSubmitReimbursements ?? false);
  const canViewBills        = inPersonal || isOrgOwner || (activeMembership?.canViewBills ?? false);
  const canViewIntegrations = inPersonal || isOrgOwner || (activeMembership?.canManageIntegrations ?? false);

  if (isLanding) {
    return <>{children}</>;
  }

  // The logo/name shown in the sidebar header
  const displayName = mode === "org" && activeOrg ? activeOrg.name : "Upside";
  const displayLogoUrl = mode === "org" ? activeOrg?.logoUrl : null;

  return (
    <SidebarProvider>
      <Sidebar variant="inset">
        <SidebarHeader className="p-5 pb-3">
          {isMember ? (
            /* Member view: avatar with company logo badge + name / org */
            <div className="flex items-center gap-2.5 px-1 py-0.5">
              <div className="relative shrink-0">
                <Avatar size="default">
                  {kindeUser?.picture && (
                    <AvatarImage src={kindeUser.picture} alt={memberDisplayName} />
                  )}
                  <AvatarFallback>{memberInitials}</AvatarFallback>
                </Avatar>
                {activeOrg?.logoUrl && (
                  <div className="absolute -bottom-0.5 -right-0.5 size-[18px] overflow-hidden rounded-full bg-sidebar ring-2 ring-sidebar">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={activeOrg.logoUrl}
                      alt={activeOrg.name}
                      className="size-full object-cover"
                    />
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium leading-tight">
                  {memberDisplayName}
                </p>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {activeOrg?.name}
                </p>
              </div>
            </div>
          ) : (
            /* Default: logo link */
            <>
              <Link
                href="/"
                className="flex items-center gap-2.5 rounded-xl transition-opacity duration-200 hover:opacity-80 focus-visible:outline focus-visible:ring-2 focus-visible:ring-sidebar-ring"
              >
                {displayLogoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={displayLogoUrl}
                    alt={displayName}
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
              {mode === "org" && activeOrg && (
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {activeOrg.name}
                </p>
              )}
            </>
          )}
        </SidebarHeader>

        <SidebarContent className="px-1">
          {/* Overview — always visible */}
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

          {/* Spend — gated in org mode by member perms */}
          {(canViewTransactions || canViewCards) && (
            <SidebarGroup>
              <SidebarGroupLabel>Spend</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <Collapsible defaultOpen className="group/spend">
                    <SidebarMenuItem>
                      <CollapsibleTrigger
                        nativeButton={false}
                        render={
                          <span
                            data-slot="sidebar-menu-button"
                            data-sidebar="menu-button"
                            data-size="default"
                            data-active={
                              pathname.startsWith("/transactions") ||
                              pathname.startsWith("/cards")
                            }
                            className="ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground active:bg-sidebar-accent data-active:bg-sidebar-accent data-active:text-sidebar-accent-foreground data-open:hover:bg-sidebar-accent gap-2 rounded-lg px-3 py-2 h-9 text-sm text-left transition-[width,height,padding] group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-2! focus-visible:ring-2 data-active:font-medium flex w-full items-center overflow-hidden outline-hidden cursor-pointer [&>span:last-child]:truncate [&_svg]:size-4 [&_svg]:shrink-0"
                            tabIndex={0}
                            role="button"
                          />
                        }
                      >
                        <HugeiconsIcon icon={ArrowLeftRightIcon} strokeWidth={2} />
                        <span>Transactions</span>
                        <HugeiconsIcon
                          icon={ArrowDown01Icon}
                          strokeWidth={2}
                          className="ml-auto size-4 shrink-0 transition-transform duration-200 group-data-[state=open]/spend:rotate-180"
                        />
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {canViewTransactions && (
                            <SidebarMenuSubItem>
                              <SidebarMenuSubButton
                                render={<Link href="/transactions" />}
                                data-active={pathname.startsWith("/transactions")}
                              >
                                <span>All</span>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          )}
                          {canViewCards && (
                            <SidebarMenuSubItem>
                              <SidebarMenuSubButton
                                render={<Link href="/cards" />}
                                data-active={pathname.startsWith("/cards")}
                              >
                                <HugeiconsIcon icon={CreditCardIcon} strokeWidth={2} />
                                <span>Cards</span>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          )}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}

          {/* Finance — gated in org mode by member perms */}
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

          {/* Integrations — gated in org mode */}
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
                        <HugeiconsIcon
                          icon={ArrowDown01Icon}
                          strokeWidth={2}
                          className="ml-auto size-4 shrink-0 transition-transform duration-200 group-data-[state=open]/integrations:rotate-180"
                        />
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

          {/* Company — corporate owners in org mode only */}
          {mode === "org" && isCorporateOwner && (
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
                      render={<Link href="/company/cards" />}
                      data-active={pathname.startsWith("/company/cards")}
                      tooltip="Company Cards"
                    >
                      <HugeiconsIcon icon={CreditCardIcon} strokeWidth={2} />
                      <span>Cards</span>
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

        <SidebarFooter className="gap-1 px-3 pb-3">
          {/* Mode switcher */}
          <OrgSwitcher
            mode={mode}
            activeOrgId={activeOrgId}
            onSelect={handleModeSelect}
          />

          <SidebarMenu className="mt-1">
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
                  (props) =>
                    (
                      <LogoutLink {...props}>{props.children}</LogoutLink>
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
          <div className="mx-auto w-full max-w-6xl">
            <OrgContext.Provider value={{ mode, activeOrgId, activeMembership }}>
              {children}
            </OrgContext.Provider>
          </div>
        </div>
      </SidebarInset>

      <AppCommandMenu />
    </SidebarProvider>
  );
}
