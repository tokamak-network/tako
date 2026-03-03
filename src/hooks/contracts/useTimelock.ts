"use client";

import { useReadContract } from "wagmi";
import { TIMELOCK_ABI } from "../../../shared/abi";
import { useContracts } from "./helpers";

/**
 * Hook to get timelock delay in seconds.
 */
export function useTimelockDelay() {
  const { addresses, isDeployed } = useContracts();

  const result = useReadContract({
    address: addresses.timelock as `0x${string}`,
    abi: TIMELOCK_ABI,
    functionName: "delay",
    query: { enabled: isDeployed },
  });

  return {
    data: result.data != null ? Number(result.data as bigint) : undefined,
    isLoading: isDeployed ? result.isLoading : false,
    isError: isDeployed ? result.isError : false,
    error: isDeployed ? result.error : null,
  };
}
