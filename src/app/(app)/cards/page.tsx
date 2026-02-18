"use client";

import { CardsRib } from "@/ribs/cards/rib";
import { CardsView } from "@/ribs/cards/views/cards-view";

export default function CardsPage() {
  return (
    <CardsRib.Provider deps={{}}>
      <CardsView />
    </CardsRib.Provider>
  );
}
