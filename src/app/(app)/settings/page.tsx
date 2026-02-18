"use client";

import { SettingsRib } from "@/ribs/settings/rib";
import { SettingsView } from "@/ribs/settings/views/settings-view";

export default function SettingsPage() {
  return (
    <SettingsRib.Provider deps={{}}>
      <SettingsView />
    </SettingsRib.Provider>
  );
}
