"use client";

import { BillsRib } from "@/ribs/bills/rib";
import { BillsView } from "@/ribs/bills/views/bills-view";

export default function BillsPage() {
  return (
    <BillsRib.Provider deps={{}}>
      <BillsView />
    </BillsRib.Provider>
  );
}
