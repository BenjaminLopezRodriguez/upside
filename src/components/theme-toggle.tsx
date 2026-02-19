"use client";

import { useEffect, useMemo, useState } from "react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { HugeiconsIcon } from "@hugeicons/react";
import { GibbousMoonIcon, Sun03Icon } from "@hugeicons/core-free-icons";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = resolvedTheme === "dark";
  const label = useMemo(() => (isDark ? "Switch to light" : "Switch to dark"), [isDark]);

  // Avoid hydration mismatch: server and first client paint have no resolvedTheme.
  // Render a stable placeholder until mounted, then show theme-dependent icon/label.
  const icon = mounted ? (isDark ? Sun03Icon : GibbousMoonIcon) : GibbousMoonIcon;
  const ariaLabel = mounted ? label : "Switch to dark";

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={ariaLabel}
              onClick={() => setTheme(mounted && isDark ? "light" : "dark")}
            />
          }
        >
          <HugeiconsIcon icon={icon} strokeWidth={2} />
        </TooltipTrigger>
        <TooltipContent side="bottom">{ariaLabel}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

