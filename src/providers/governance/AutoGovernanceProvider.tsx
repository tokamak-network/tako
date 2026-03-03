"use client";

import React from "react";
import { useWalletConnection } from "@/hooks/useWalletConnection";
import { GovernanceProvider } from "./GovernanceProvider";
import { OnChainGovernanceProvider } from "./OnChainGovernanceProvider";

/**
 * Auto-switching provider:
 * - Wallet connected → OnChainGovernanceProvider (real contract data)
 * - Wallet disconnected → GovernanceProvider (dummy data)
 */
export function AutoGovernanceProvider({ children }: { children: React.ReactNode }) {
  const { isConnected } = useWalletConnection();

  if (isConnected) {
    return <OnChainGovernanceProvider>{children}</OnChainGovernanceProvider>;
  }
  return <GovernanceProvider>{children}</GovernanceProvider>;
}
