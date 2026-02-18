"use client";

import { ReimbursementsRib } from "@/ribs/reimbursements/rib";
import { ReimbursementsView } from "@/ribs/reimbursements/views/reimbursements-view";

export default function ReimbursementsPage() {
  return (
    <ReimbursementsRib.Provider deps={{}}>
      <ReimbursementsView />
    </ReimbursementsRib.Provider>
  );
}
