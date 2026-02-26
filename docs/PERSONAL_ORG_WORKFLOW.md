# Personal vs Organization Workflow

This document describes user personas, sidebar layout per mode/role, mode-switching behavior, deep-link behavior, and permission rules for the personal/organization dual-mode system.

See also: [PERSONAL_VS_ORGANIZATION.md](./PERSONAL_VS_ORGANIZATION.md) for schema, layout, and data-ownership details.

---

## User personas

| Persona | Description | Default mode |
|---|---|---|
| Individual | Manages their own cards, transactions, bills, and reimbursements. No org context needed. | Personal |
| Org member | Belongs to a corporate org but is not an owner. Can view/act on sections granted by their membership permissions. | Org (member) |
| Org owner | Owns a corporate org. Has full access to all org sections including Company management, Workforce, and Integrations. | Org (owner) |

---

## Sidebar map by mode and role

### Personal mode

| Section | Routes | Visible to |
|---|---|---|
| Overview | /dashboard | All |
| Cards | /cards | All |
| Payments | /reimbursements, /bills | All |
| Jobs | /jobs | All |
| Portals | /portals | All |

### Org mode — member (not owner)

| Section | Routes | Visible when |
|---|---|---|
| Overview | /dashboard | Always |
| Spend > Transactions | /transactions | canViewTransactions |
| Spend > Cards | /cards | canCreateCards |
| Finance > Reimbursements | /reimbursements | canSubmitReimbursements |
| Finance > Bill Pay | /bills | canViewBills |
| Finance > Invoices | /invoices | canViewBills |
| Integrations | /integrations/* | canManageIntegrations |

Workforce and Company sections are **not** shown to members — those require org ownership.

### Org mode — owner

Everything in the member sidebar, plus:

| Section | Routes | Visible when |
|---|---|---|
| Workforce > Hire | /workforce/hire | isOrgOwner |
| Workforce > Onboard | /workforce/onboard | isOrgOwner |
| Company > Members | /company/members | isCorporateOwner |
| Company > Cards | /company/cards | isCorporateOwner |
| Company > Settings | /company/settings | isCorporateOwner |

`isOrgOwner` = `activeMembership.role === "owner"` (any org type)
`isCorporateOwner` = `isOrgOwner && activeOrg.type === "corporate"`

---

## Mode switching

Mode and `activeOrgId` are persisted in `localStorage` (`deltra-mode`, `deltra-active-org`) and hydrated after mount in `(app)/layout.tsx`.

### Personal → org
- Click the **Organization** tab in the header switcher.
- 0 corporate orgs → Create org dialog opens.
- 1 corporate org → switches immediately.
- 2+ → org selector dialog opens.

### Org → personal
- Click the **Personal** tab → switches immediately, clears `activeOrgId`.

### Switching between orgs
- Click the active-org chip in the header (org mode only) → org selector dialog opens.

---

## Deep-link behavior

On page load, layout reads `localStorage` and restores mode + `activeOrgId`. This means:

- A bookmarked `/company/members` URL with `deltra-mode=org` and a valid `deltra-active-org` loads correctly.
- A bookmarked `/company/members` with `deltra-mode=personal` (or no localStorage) shows the `OrgRequiredEmptyState` inline. No redirect.

---

## Route guards

Pages in `/company/*` require an active org. If `mode === "personal"` or `activeOrgId == null`, they render `<OrgRequiredEmptyState />` instead of their content.

The guard is purely a UX affordance — the API layer independently enforces ownership checks before returning or mutating any data.

| Route | Guard | Notes |
|---|---|---|
| /company/members | `OrgRequiredEmptyState` | mode === "personal" or activeOrgId == null |
| /company/settings | `OrgRequiredEmptyState` | mode === "personal" or activeOrgId == null |
| /company/cards | `OrgRequiredEmptyState` | mode === "personal" or activeOrgId == null |
| /workforce/hire | Inline empty state | Checks `activeOrgId == null`; sidebar-gated to `isOrgOwner` |
| /workforce/onboard | None — intentional exception | Placeholder page; no queries or mutations; shown only to owners via sidebar gate |
| /integrations/* | None — intentional exception | Sidebar-gated to `canManageIntegrations`; data is user-scoped (no orgId required); no guard needed |

---

## Permission rules

### Client (sidebar visibility)
- Personal mode: all sections visible.
- Org mode: `canView*` flags from `activeMembership` gate Spend/Finance/Integrations.
- Workforce: `isOrgOwner` only.
- Company: `isCorporateOwner` only.

### Server (API)
- All sensitive mutations re-check ownership/membership server-side.
- Client permission gates are UX affordances only — they do not replace server checks.

### `OrgContext` values
`OrgContext` (from `src/contexts/org-context.tsx`) exposes:
- `mode` — `"personal"` | `"org"`
- `activeOrgId` — `number | null`
- `activeMembership` — full membership row or `null`
- `isOrgOwner` — `boolean` derived from `activeMembership.role === "owner"`

---

## Implemented — 2026-02-25

### Phase 1
- `OrgContext` extended with `isOrgOwner`
- `OrgRequiredEmptyState` component created (`src/components/org-required-empty-state.tsx`)
- Route guards added to `/company/members`, `/company/settings`, `/company/cards`
- Workforce sidebar section gated to `isOrgOwner` (was shown to all org members)
- Dashboard Earn section subtitle made mode-aware
- `OrgSelectorDialog` description copy updated ("manage" → "switch to")

### Phase 2
- **Member indicator** — a "Viewing as member" pill appears in the header (between the org chip and the right-side controls) when the user is in org mode as a non-owner. Implemented in `(app)/layout.tsx`.
- **Switcher helper copy** — Personal and Organization toggle buttons now have `title` tooltip text ("Personal — just you"; "Organization — acting as [Org name]" or "Organization — act as a company") and updated `aria-label` values. Implemented in `src/components/org-switcher.tsx`.
- **Copy pass** — Workforce/hire empty state copy updated from "Select an organization from the sidebar" → "Use the switcher above to select an organization" to match the `OrgRequiredEmptyState` pattern.
- **Pattern check** — All org-only routes reviewed. `/workforce/onboard` and `/integrations/*` are intentional exceptions (documented in the Route guards table above). No additional guards needed.
- **Deep-link auto-switch** — Not implemented. When a user with `deltra-mode=personal` in localStorage navigates directly to `/company/*`, they see `OrgRequiredEmptyState` and must switch manually. Auto-switching would require knowing which org to activate (ambiguous with multiple orgs) and adds layout complexity. The manual path (use the switcher) is low friction.
