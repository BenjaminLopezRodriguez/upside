"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { UpsideLogo } from "./utils";
import { NAV_LINKS } from "./constants";
import { IMAGES } from "./constants";
import { RibbonMenu } from "./RibbonMenu";

export function Nav({
  ribbonOpen = false,
  onRibbonToggle,
  onRibbonClose,
}: {
  ribbonOpen?: boolean;
  onRibbonToggle?: () => void;
  onRibbonClose?: () => void;
}) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
        <div className="flex items-center gap-4">
          <Sheet>
            <SheetTrigger asChild>
              <button
                className="tap-target flex h-10 w-10 items-center justify-center rounded-full bg-white text-[var(--upside-deep)] transition-colors hover:bg-white/95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f2030] md:hidden"
                aria-label="Open menu"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <line x1="4" y1="7" x2="20" y2="7" />
                  <line x1="4" y1="12" x2="20" y2="12" />
                  <line x1="4" y1="17" x2="20" y2="17" />
                </svg>
              </button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="flex w-[320px] flex-col border-r-0 bg-[var(--upside-deep)] sm:max-w-[360px]"
            >
              <SheetHeader className="pb-2">
                <SheetTitle className="flex items-center gap-2 text-white">
                  <UpsideLogo size={14} />
                  <span className="font-serif text-lg font-semibold tracking-tight">
                    upside
                  </span>
                </SheetTitle>
              </SheetHeader>
              <div className="divider-line mx-6 opacity-60" />
              <nav className="flex flex-col gap-1 px-6 pt-6">
                {NAV_LINKS.map((link) => (
                  <SheetClose key={link.href} asChild>
                    <Link
                      href={link.href}
                      className="group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-white/70 transition-all hover:bg-white/10 hover:text-white"
                    >
                      <span className="h-px w-4 bg-current opacity-40 transition-all group-hover:w-6 group-hover:opacity-100" />
                      {link.label}
                    </Link>
                  </SheetClose>
                ))}
                <Separator className="my-4 bg-white/10" />
                <span className="mb-2 px-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/30">
                  Resources
                </span>
                {["Documentation", "API Reference", "Changelog"].map((label) => (
                  <SheetClose key={label} asChild>
                    <Link
                      href="#"
                      className="rounded-xl px-4 py-2.5 text-sm text-white/50 transition-colors hover:bg-white/5 hover:text-white/70"
                    >
                      {label}
                    </Link>
                  </SheetClose>
                ))}
              </nav>
              <div className="mt-auto flex flex-col gap-3 p-6">
                <div className="relative h-24 overflow-hidden rounded-xl">
                  <Image
                    src={IMAGES.purpleGoldLiquid}
                    alt=""
                    fill
                    className="object-cover opacity-40"
                    aria-hidden
                  />
                  <div className="absolute inset-0 bg-[var(--upside-deep)]/60" />
                </div>
                <div className="divider-line opacity-60" />
                <p className="pt-2 text-[11px] leading-relaxed text-white/30">
                  Card issuing and receipt tracking
                  <br />
                  for modern business.
                </p>
              </div>
            </SheetContent>
          </Sheet>

          {onRibbonToggle && (
            <div className="relative hidden lg:block">
              <button
                onClick={onRibbonToggle}
                className="tap-target flex h-10 w-10 items-center justify-center rounded-full bg-white text-[var(--upside-deep)] transition-colors hover:bg-white/95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f2030]"
                aria-label={ribbonOpen ? "Close section menu" : "Open section menu"}
                aria-expanded={ribbonOpen}
              >
                {ribbonOpen ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <line x1="8" y1="6" x2="8" y2="18" />
                    <line x1="12" y1="6" x2="12" y2="18" />
                    <line x1="16" y1="6" x2="16" y2="18" />
                  </svg>
                )}
              </button>
              <RibbonMenu open={ribbonOpen} onClose={onRibbonClose} />
            </div>
          )}
          <Link
            href="/"
            className="tap-target flex min-h-[44px] items-center gap-1.5 rounded-full bg-white px-4 py-2.5 text-sm font-semibold tracking-tight text-[var(--upside-deep)] transition-colors hover:bg-white/95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f2030] focus-visible:rounded-full"
          >
            <UpsideLogo size={14} />
            upside
          </Link>
        </div>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="tap-target flex min-h-[44px] items-center rounded-full px-4 py-2 text-sm font-medium text-white/80 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f2030]"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
