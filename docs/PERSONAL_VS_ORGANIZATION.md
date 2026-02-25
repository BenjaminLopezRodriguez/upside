# Personal vs organization: current setup and analysis

This doc describes how **personal** vs **organization** mode works today (schema, layout, features) and how it aligns with the idea that personal is “receiving and simple interaction” and users can create their own organization.

---

## 1. Schema

### Users and organizations

- **`users`** – One row per human (Kinde auth). No direct “current org” column; context is client-side (mode + activeOrgId in layout).
- **`organizations`** – Two logical types, distinguished by **`type`**:
  - **`personal`** – Single-owner workspace created on first sign-in (`/auth/resolve`). Name: `"{User}'s Workspace"`. Slug: `personal-{userId}`. Used so every user has at least one membership; **not** switchable in the UI.
  - **`corporate`** – Company/team org. Created via “Create organization” or (conceptually) “Upgrade to company”. Can have multiple members. **`setupComplete`** drives post-create onboarding.
- **`organization_member`** – Links user ↔ org. **`role`**: `owner` | `admin` | `member`. Permissions: `canViewTransactions`, `canCreateCards`, `canSubmitReimbursements`, `canViewBills`, `canManageIntegrations`, `spendLimit`. Only **corporate** orgs appear in the org switcher/selector; personal org membership exists but is never selected as “Organization”.

### Data ownership

- **User-scoped (no org in query):**  
  **cards**, **transactions**, **bills**, **dashboard** (spend summary, spend by category, etc.). All keyed by **`userId`**. So in the app, “personal” data is “my cards, my transactions, my bills” — not “data in the personal org.”
- **Org-optional:**  
  **reimbursements** have optional **`orgId`**. In personal mode you submit without org; in org mode (as owner) you can scope to that org.
- **Org-scoped:**  
  **roles** (Hire), **company members**, **company cards** (issued to members), **organization** settings. Require **`activeOrgId`** (and usually org membership checks).

So today:

- **Personal mode** = use **only** the current user’s id for cards/transactions/bills/dashboard; the personal **org** row is mostly for membership consistency and is not used for these queries.
- **Organization mode** = use **activeOrgId** for company features (members, roles, company cards, org settings, and optionally reimbursements).

---

## 2. Layout and context

### App layout (`(app)/layout.tsx`)

- **Mode** and **activeOrgId** live in React state and **localStorage** (`deltra-mode`, `deltra-active-org`).
- **`OrgContext`** exposes: `mode`, `activeOrgId`, `activeMembership` (the membership row for the active org, when in org mode).
- Derived:
  - **`isOrgOwner`** = membership.role === `owner`
  - **`isCorporateOwner`** = owner of a **corporate** org (drives “Company” sidebar section).
  - **`isMember`** = in org mode but not owner (different header: avatar + org name).
- **Permission flags** (for sidebar visibility):
  - In **personal** mode: all sections visible (user’s own workspace).
  - In **org** mode: `canViewTransactions`, `canCreateCards`, etc. from **activeMembership** (or full access if owner).

### Org switcher (`org-switcher.tsx`)

- **Personal** tab → `onSelect("personal", null)`. Backend continues to use `ctx.dbUser.id` only for cards/transactions/etc.
- **Organization** tab:
  - Uses only **corporate** orgs: `corporateOrgs = myOrgs.filter(m => m.organization.type === "corporate")`.
  - If 0 corporate orgs → open “Create organization” dialog.
  - If 1 → switch to that org.
  - If 2+ → open org selector; “Create new organization” also available there.
- **“Find an organization”** (only when in personal mode) → **Join** flow: search by org name, join as **member** (no invite token).

So:

- **Creating your own organization** is already supported: “Organization” → Create org (or “Create new organization” in selector). You become owner of a **corporate** org.
- **Personal** is “me only” (no org selected); **Organization** is “acting as this company” (one of the user’s **corporate** orgs).

---

## 3. Auth and onboarding

### Post-login (`/auth/resolve`)

1. Ensure **user** exists (create from Kinde if first time).
2. If user **owns** a **corporate** org with **`setupComplete === false`** → redirect to **`/onboarding/company-setup`**.
3. If user has **any** org membership → redirect to **`/dashboard`**.
4. Otherwise (brand-new user): **create personal org** (type `personal`, name `"{Name}'s Workspace"`), add user as **owner**, then redirect to dashboard.

So every user ends up with at least one org (personal). The UI never shows “switch to my personal org”; it only shows the “Personal” tab, which means “no org, use my user id.”

---

## 4. Feature matrix (where data comes from)

| Feature            | Personal mode              | Org mode (owner)              | Org mode (member)                |
|--------------------|----------------------------|-------------------------------|----------------------------------|
| Dashboard          | My spend (userId)           | My spend (userId)              | My spend (userId)                 |
| Transactions       | My (userId)                 | My (userId)                   | My (userId)                      |
| Cards              | My cards (userId)           | My cards + company cards UI   | Per canCreateCards               |
| Reimbursements    | Submit (no org)             | Submit with orgId optional    | Per canSubmitReimbursements      |
| Bill pay / Invoices| My (userId)                 | My (userId)                   | Per canViewBills                 |
| Integrations       | My (userId)                 | My (userId)                   | Per canManageIntegrations        |
| Company (Members, Company cards, Settings) | Hidden | Shown (corporate owner) | Hidden |
| Workforce (Hire)   | Shown but “switch to org”   | Create/list roles (orgId)     | Create/list roles (orgId)        |

So in **personal** mode the product is “individual user” (their cards, transactions, reimbursements, etc.). In **org** mode the same user can **also** manage company-side things (members, roles, company cards) when they’re the corporate owner.

---

## 5. Gaps and “personal = receiving / simple interaction”

- **Current “personal”** is implemented as “my own workspace” (user-scoped data only). It is **not** currently framed as “I am an individual receiving things from an organization” (e.g. “reimbursements from my employer,” “card issued to me by my org”). So:
  - **Receiving**: Reimbursements and company-issued cards are already possible when you **switch to Organization** and are a member; in **Personal** you only see your own submissions and your own cards. To align “personal = receiving,” you’d want a clear story in Personal for “things sent to me by an org” (e.g. reimbursements approved by org, cards issued to me).
- **Simple interaction with an organization**: Today, “simple” interaction is: switch to **Organization** and use permissions (member vs owner). **Personal** doesn’t currently represent “I’m interacting with org X in a limited way”; it’s “I’m not in any org context.”
- **Making your own organization**: Already supported: **Organization** tab → Create organization (or Create new in selector). No change needed for “they should be able to make their own organization.”

If you want **personal** to behave more like “receiving and acting as simple interaction with an organization,” possible directions:

1. **Personal = “me + things from my orgs”**  
   In personal mode, still use userId for “my” data, but **also** show a slice of org-sourced data (e.g. “Reimbursements from Acme Corp,” “Card issued to you by Acme Corp”) without switching to Org mode. That would mean some queries taking both userId and “orgs I belong to” and merging.

2. **Personal = default org**  
   Treat “Personal” as “I’m in my personal org” and pass the personal org id into context (e.g. activeOrgId = personal org when mode === "personal"). Then all data could be org-scoped; personal org would hold only that user’s data. Bigger migration (cards/transactions today are user-scoped).

3. **Keep current model, clarify UX**  
   Keep personal = user-scoped, org = org-scoped, but in copy and navigation emphasize: “Personal = just you”; “Organization = act as a company (create or join).” Optionally add a “From your organizations” area on dashboard when in personal mode (e.g. pending reimbursements from orgs you’re a member of).

---

## 6. Summary

- **Schema**: Personal vs corporate is an **org type**; **personal org** is created on first sign-in and is not switchable; **corporate** orgs are created/joined and are switchable. Most “personal” data (cards, transactions, dashboard) is **user-scoped**, not org-scoped.
- **Layout**: Mode and activeOrgId in layout + OrgContext; sidebar and permission flags differ by mode and membership (owner vs member).
- **Creating an org**: Already available via Org switcher → Organization → Create (or Create new in selector).
- **Joining**: “Find an organization” (in personal mode) searches by name and joins as member.
- **”Personal = receiving / simple interaction”**: Not fully reflected today; personal is “just me.” To align, you’d add a “from organizations” view in personal and/or redefine personal as “default org” and migrate data to org-scoping.

---

For sidebar layout, mode-switching behavior, route guards, and permission rules see [PERSONAL_ORG_WORKFLOW.md](./PERSONAL_ORG_WORKFLOW.md).
