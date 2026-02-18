"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";

import {
  Command,
  CommandDialog,
  CommandInput,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  DashboardSquare01Icon,
  ArrowLeftRightIcon,
  CreditCardIcon,
  MoneyReceiveSquareIcon,
  Invoice01Icon,
  SettingsIcon,
  Sun03Icon,
  GibbousMoonIcon,
  CommandIcon,
} from "@hugeicons/core-free-icons";

const NAV = [
  { label: "Dashboard", href: "/", icon: DashboardSquare01Icon, shortcut: "G D" },
  {
    label: "Transactions",
    href: "/transactions",
    icon: ArrowLeftRightIcon,
    shortcut: "G T",
  },
  { label: "Cards", href: "/cards", icon: CreditCardIcon, shortcut: "G C" },
  {
    label: "Reimbursements",
    href: "/reimbursements",
    icon: MoneyReceiveSquareIcon,
    shortcut: "G R",
  },
  { label: "Bill Pay", href: "/bills", icon: Invoice01Icon, shortcut: "G B" },
  { label: "Settings", href: "/settings", icon: SettingsIcon, shortcut: "G S" },
];

export function AppCommandMenu() {
  const router = useRouter();
  const { setTheme, resolvedTheme } = useTheme();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const isK = e.key.toLowerCase() === "k";
      if ((e.metaKey || e.ctrlKey) && isK) {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const themeLabel = useMemo(() => {
    if (resolvedTheme === "dark") return "Dark";
    if (resolvedTheme === "light") return "Light";
    return "System";
  }, [resolvedTheme]);

  return (
    <CommandDialog open={open} onOpenChange={setOpen} showCloseButton>
      <Command>
        <CommandInput placeholder="Type a command or search…" />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>

          <CommandGroup heading="Navigate">
            {NAV.map((item) => (
              <CommandItem
                key={item.href}
                value={item.label}
                onSelect={() => {
                  router.push(item.href);
                  setOpen(false);
                }}
              >
                <HugeiconsIcon icon={item.icon} strokeWidth={2} />
                {item.label}
                <CommandShortcut>{item.shortcut}</CommandShortcut>
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading={`Theme (${themeLabel})`}>
            <CommandItem
              value="theme-light"
              onSelect={() => {
                setTheme("light");
                setOpen(false);
              }}
            >
              <HugeiconsIcon icon={Sun03Icon} strokeWidth={2} />
              Light
            </CommandItem>
            <CommandItem
              value="theme-dark"
              onSelect={() => {
                setTheme("dark");
                setOpen(false);
              }}
            >
              <HugeiconsIcon icon={GibbousMoonIcon} strokeWidth={2} />
              Dark
            </CommandItem>
            <CommandItem
              value="theme-system"
              onSelect={() => {
                setTheme("system");
                setOpen(false);
              }}
            >
              <HugeiconsIcon icon={CommandIcon} strokeWidth={2} />
              System
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  );
}

