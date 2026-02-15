"use client";

import Link from "next/link";
import { UpsideLogo } from "./utils";

const FOOTER_COLUMNS = [
  {
    title: "Product",
    links: [
      { label: "Spend Controls", href: "#features" },
      { label: "Receipt Tracking", href: "#features" },
      { label: "Invoicing", href: "#features" },
      { label: "Integrations", href: "#features" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Contact", href: "#contact" },
      { label: "Blog", href: "#" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "#" },
      { label: "Terms", href: "#" },
      { label: "Security", href: "#" },
      { label: "Compliance", href: "#" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-[var(--upside-lavender)] bg-[var(--upside-deep)] px-6 py-16 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link
              href="/"
              className="tap-target flex min-h-[44px] items-center gap-2.5 text-[var(--upside-on-dark)] transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--upside-on-dark-muted)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--upside-deep)] focus-visible:rounded-lg"
            >
              <UpsideLogo size={16} />
              <span className="text-base font-semibold tracking-tight">
                upside
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm text-[var(--upside-on-dark-muted)] leading-relaxed">
              Card issuing, receipt tracking, and invoicing for modern finance
              teams.
            </p>
          </div>

          {FOOTER_COLUMNS.map((col) => (
            <div key={col.title}>
              <span className="text-xs font-medium text-[var(--upside-on-dark-subtle)]">
                {col.title}
              </span>
              <ul className="mt-4 flex flex-col gap-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-[var(--upside-on-dark-muted)] transition-colors hover:text-[var(--upside-on-dark)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--upside-on-dark-muted)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--upside-deep)] focus-visible:rounded"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-[var(--upside-lavender)] pt-8 sm:flex-row">
          <p className="text-sm text-[var(--upside-on-dark-subtle)]">
            &copy; {new Date().getFullYear()} Upside
          </p>
          <div className="flex gap-8">
            {["Twitter", "LinkedIn", "GitHub"].map((social) => (
              <Link
                key={social}
                href="#"
                className="text-sm text-[var(--upside-on-dark-subtle)] transition-colors hover:text-[var(--upside-on-dark-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--upside-on-dark-muted)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--upside-deep)] focus-visible:rounded"
              >
                {social}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
