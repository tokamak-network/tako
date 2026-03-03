"use client";

import { useChainId } from "wagmi";
import { useMemo } from "react";
import {
  getContractAddresses,
  areContractsDeployed,
  getDeploymentBlock,
  type ContractAddresses,
} from "../../../shared/addresses";

export { getContractAddresses, areContractsDeployed, getDeploymentBlock };
export type { ContractAddresses };

// Average block time in seconds (Sepolia/Ethereum ~12s)
export const BLOCK_TIME_SECONDS = 12;

/**
 * Hook to get contract addresses and deployment status for the current chain.
 */
export function useContracts() {
  const chainId = useChainId();

  return useMemo(() => {
    const addresses = getContractAddresses(chainId);
    const isDeployed = areContractsDeployed(chainId);
    const deploymentBlock = getDeploymentBlock(chainId);
    return { chainId, addresses, isDeployed, deploymentBlock };
  }, [chainId]);
}

/**
 * Convert block number to estimated timestamp relative to current block.
 */
export function blockToTimestamp(
  blockNumber: bigint,
  currentBlock: bigint,
  currentTimestamp: number
): number {
  const blockDiff = Number(blockNumber) - Number(currentBlock);
  return currentTimestamp + blockDiff * BLOCK_TIME_SECONDS;
}

/**
 * Extract title from proposal description (first markdown heading or first non-empty line).
 */
export function extractTitle(description: string): string {
  const lines = description.split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("# ")) {
      return trimmed.slice(2).trim();
    }
    if (trimmed.length > 0) {
      return trimmed;
    }
  }
  return "Untitled Proposal";
}

/**
 * Format bigint with 18 decimals to number.
 */
export function formatUnits18(value: bigint): number {
  return Number(value) / 1e18;
}
