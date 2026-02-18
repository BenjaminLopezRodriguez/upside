"use client";

import { TransactionsRib } from "@/ribs/transactions/rib";
import { TransactionsView } from "@/ribs/transactions/views/transactions-view";

export default function TransactionsPage() {
  return (
    <TransactionsRib.Provider deps={{}}>
      <TransactionsView />
    </TransactionsRib.Provider>
  );
}
