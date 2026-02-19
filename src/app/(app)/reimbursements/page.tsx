"use client";

import { useOrg } from "@/contexts/org-context";
import { ReimbursementsRib } from "@/ribs/reimbursements/rib";
import { ReimbursementsView } from "@/ribs/reimbursements/views/reimbursements-view";

export default function ReimbursementsPage() {
  const { mode, activeOrgId, activeMembership } = useOrg();
  const isOwner = mode === "org" && activeMembership?.role === "owner";

  return (
    <ReimbursementsRib.Provider deps={{ orgId: isOwner ? activeOrgId : null, isOwner }}>
      <ReimbursementsView />
    </ReimbursementsRib.Provider>
  );
}
