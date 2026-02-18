"use client";

import { useState } from "react";
import { createRib } from "nextjs-ribs";
import { api } from "@/trpc/react";

export const SettingsRib = createRib({
  name: "Settings",

  interactor: (_deps: Record<string, never>) => {
    const [activeTab, setActiveTab] = useState("company");
    const teamList = api.user.list.useQuery();

    return {
      activeTab,
      setActiveTab,
      team: teamList.data ?? [],
      isLoading: teamList.isLoading,
    };
  },

  presenter: (state) => ({
    ...state,
    teamMembers: state.team.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      department: u.department,
    })),
  }),
});
