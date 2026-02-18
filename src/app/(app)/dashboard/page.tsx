"use client";

import { DashboardRib } from "@/ribs/dashboard/rib";
import { DashboardView } from "@/ribs/dashboard/views/dashboard-view";

export default function DashboardPage() {
  return (
    <DashboardRib.Provider deps={{}}>
      <DashboardView />
    </DashboardRib.Provider>
  );
}
