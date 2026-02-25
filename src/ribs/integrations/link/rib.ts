"use client";

import { useState } from "react";
import { createRib } from "nextjs-ribs";
import { toast } from "sonner";

export type LinkType = "receipt_scanner" | "order_pool" | "fund_request";

export type IntegrationLink = {
  id: string;
  name: string;
  type: LinkType;
  url: string;
  createdBy: string;
  createdAt: string;
  status: "active" | "disabled" | "expired";
  submissions: number;
  expiresAt: string | null;
  description: string;
};

export type CreateLinkData = {
  name: string;
  type: LinkType;
  description: string;
  expiresAt: string | null;
};

const BASE_URL = "https://links.deltra.com";

const INITIAL_LINKS: IntegrationLink[] = [
  {
    id: "1",
    name: "Engineering Receipts – Q1 2026",
    type: "receipt_scanner",
    url: `${BASE_URL}/r/eng-q1-2026`,
    createdBy: "Alice Kim",
    createdAt: "2026-01-03",
    status: "active",
    submissions: 47,
    expiresAt: "2026-03-31",
    description: "Submit receipts for engineering team purchases.",
  },
  {
    id: "2",
    name: "Office Lunch – Feb 20",
    type: "order_pool",
    url: `${BASE_URL}/o/office-lunch-0220`,
    createdBy: "Marcus Lee",
    createdAt: "2026-02-14",
    status: "active",
    submissions: 12,
    expiresAt: "2026-02-20",
    description: "Group order from Chipotle. Add your items before noon.",
  },
  {
    id: "3",
    name: "Conference Travel Budget",
    type: "fund_request",
    url: `${BASE_URL}/f/conf-travel-q1`,
    createdBy: "Priya Patel",
    createdAt: "2026-01-20",
    status: "active",
    submissions: 8,
    expiresAt: null,
    description: "Request travel funds for approved conferences in Q1.",
  },
  {
    id: "4",
    name: "Design Sprint Supplies",
    type: "fund_request",
    url: `${BASE_URL}/f/design-sprint-jan`,
    createdBy: "Alice Kim",
    createdAt: "2025-12-18",
    status: "expired",
    submissions: 5,
    expiresAt: "2026-01-15",
    description: "Request supplies for the January design sprint.",
  },
  {
    id: "5",
    name: "Holiday Party Receipts",
    type: "receipt_scanner",
    url: `${BASE_URL}/r/holiday-party-25`,
    createdBy: "Priya Patel",
    createdAt: "2025-12-01",
    status: "disabled",
    submissions: 23,
    expiresAt: null,
    description: "Holiday party expense receipts.",
  },
];

export const LinkIntegrationRib = createRib({
  name: "LinkIntegration",

  interactor: (_deps: Record<string, never>) => {
    const [links, setLinks] = useState<IntegrationLink[]>(INITIAL_LINKS);
    const [isCreating, setIsCreating] = useState(false);
    const [filterType, setFilterType] = useState<LinkType | "all">("all");

    const createLink = (data: CreateLinkData) => {
      const slug = data.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .slice(0, 24);
      const prefix =
        data.type === "receipt_scanner"
          ? "r"
          : data.type === "order_pool"
            ? "o"
            : "f";
      const newLink: IntegrationLink = {
        id: String(Date.now()),
        name: data.name,
        type: data.type,
        url: `${BASE_URL}/${prefix}/${slug}-${Date.now().toString(36)}`,
        createdBy: "You",
        createdAt: new Date().toISOString().split("T")[0]!,
        status: "active",
        submissions: 0,
        expiresAt: data.expiresAt,
        description: data.description,
      };
      setLinks((prev) => [newLink, ...prev]);
      setIsCreating(false);
      toast.success("Link created");
    };

    const toggleLink = (id: string) => {
      setLinks((prev) =>
        prev.map((l) => {
          if (l.id !== id) return l;
          const next = l.status === "active" ? "disabled" : "active";
          return { ...l, status: next as IntegrationLink["status"] };
        }),
      );
    };

    const copyLink = (url: string) => {
      void navigator.clipboard.writeText(url).then(() => {
        toast.success("Link copied");
      });
    };

    return {
      links,
      isCreating,
      setIsCreating,
      filterType,
      setFilterType,
      createLink,
      toggleLink,
      copyLink,
    };
  },

  router: (state) => ({
    createLink: state.isCreating,
  }),

  presenter: (state) => ({
    ...state,
    filteredLinks:
      state.filterType === "all"
        ? state.links
        : state.links.filter((l) => l.type === state.filterType),
    activeCount: state.links.filter((l) => l.status === "active").length,
    totalSubmissions: state.links.reduce((sum, l) => sum + l.submissions, 0),
    openCreate: () => state.setIsCreating(true),
    closeCreate: () => state.setIsCreating(false),
  }),
});
