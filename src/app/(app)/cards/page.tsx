"use client";

import { useOrg } from "@/contexts/org-context";
import { CardsRib } from "@/ribs/cards/rib";
import { CardsView } from "@/ribs/cards/views/cards-view";

export default function CardsPage() {
  const { mode } = useOrg();
  const inPersonal = mode === "personal";

  return (
    <CardsRib.Provider deps={{ inPersonal }}>
      <CardsView />
    </CardsRib.Provider>
  );
}
