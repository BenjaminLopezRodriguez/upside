"use client";

import { LinkIntegrationRib } from "@/ribs/integrations/link/rib";
import { LinkIntegrationView } from "@/ribs/integrations/link/views/link-view";

export default function LinkIntegrationPage() {
  return (
    <LinkIntegrationRib.Provider deps={{}}>
      <LinkIntegrationView />
    </LinkIntegrationRib.Provider>
  );
}
