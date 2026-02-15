"use client";

import Link from "next/link";
import { NAV_LINKS } from "./constants";

export function RibbonMenu({ open = false, onClose }: { open?: boolean; onClose?: () => void }) {
  if (!open) return null;

  return (
    <aside
      className="absolute left-0 top-full z-50 mt-2 w-40 animate-in slide-in-from-top-2 fade-in duration-200"
      aria-label="Section navigation"
    >
      <nav className="rounded-xl border border-border bg-white py-2">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={onClose}
            className="block px-4 py-2 text-sm text-foreground transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:bg-muted/50"
            aria-label={link.label}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
