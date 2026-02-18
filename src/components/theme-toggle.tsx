"use client";

import { useMemo } from "react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { HugeiconsIcon } from "@hugeicons/react";
import { GibbousMoonIcon, Sun03Icon } from "@hugeicons/core-free-icons";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  const isDark = resolvedTheme === "dark";
  const label = useMemo(() => (isDark ? "Switch to light" : "Switch to dark"), [isDark]);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={label}
              onClick={() => setTheme(isDark ? "light" : "dark")}
            />
          }
        >
          <HugeiconsIcon icon={isDark ? Sun03Icon : GibbousMoonIcon} strokeWidth={2} />
        </TooltipTrigger>
        <TooltipContent side="bottom">{label}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

