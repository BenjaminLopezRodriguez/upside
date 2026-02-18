"use client";

import { InvoicesRib } from "@/ribs/invoices/rib";
import { InvoicesView } from "@/ribs/invoices/views/invoices-view";

export default function InvoicesPage() {
  return (
    <InvoicesRib.Provider deps={{}}>
      <InvoicesView />
    </InvoicesRib.Provider>
  );
}
