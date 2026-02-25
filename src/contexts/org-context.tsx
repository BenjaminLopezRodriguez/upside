"use client";

/**
 * Shares the currently active org context (mode + activeMembership) with any
 * component inside the (app) layout — primarily the /company/* pages which need
 * the activeOrgId to call org-scoped mutations correctly.
 */

import { createContext, useContext } from "react";
import type { RouterOutputs } from "@/trpc/react";

export type OrgMembership = RouterOutputs["organization"]["listMyOrgs"][number];

interface OrgContextValue {
  mode: "personal" | "org";
  activeOrgId: number | null;
  /** Full membership row (with nested .organization) for the currently active org, or null. */
  activeMembership: OrgMembership | null;
  /** True when in org mode and the current membership role is "owner". */
  isOrgOwner: boolean;
}

export const OrgContext = createContext<OrgContextValue>({
  mode: "personal",
  activeOrgId: null,
  activeMembership: null,
  isOrgOwner: false,
});

export const useOrg = () => useContext(OrgContext);
