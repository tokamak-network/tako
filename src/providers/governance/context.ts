"use client";

import { createContext, useContext } from "react";
import type { GovernanceDataProvider } from "./types";

export const GovernanceContext = createContext<GovernanceDataProvider | null>(null);

export function useGovernance() {
  const ctx = useContext(GovernanceContext);
  if (!ctx) throw new Error("useGovernance must be used within a GovernanceProvider");
  return ctx;
}
