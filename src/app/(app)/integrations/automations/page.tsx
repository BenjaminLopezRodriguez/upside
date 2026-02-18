"use client";

import { AutomationsRib } from "@/ribs/integrations/automations/rib";
import { AutomationsView } from "@/ribs/integrations/automations/views/automations-view";

export default function AutomationsPage() {
  return (
    <AutomationsRib.Provider deps={{}}>
      <AutomationsView />
    </AutomationsRib.Provider>
  );
}
