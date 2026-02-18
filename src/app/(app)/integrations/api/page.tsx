"use client";

import { ApiIntegrationRib } from "@/ribs/integrations/api/rib";
import { ApiIntegrationView } from "@/ribs/integrations/api/views/api-view";

export default function ApiIntegrationPage() {
  return (
    <ApiIntegrationRib.Provider deps={{}}>
      <ApiIntegrationView />
    </ApiIntegrationRib.Provider>
  );
}
