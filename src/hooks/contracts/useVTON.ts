"use client";

import { useReadContract } from "wagmi";
import { useAccount } from "wagmi";
import { VTON_ABI } from "../../../shared/abi";
import { useContracts, formatUnits18 } from "./helpers";

/**
 * Hook to get vTON total supply (as number, 18 decimals formatted).
 */
export function useTotalSupply() {
  const { addresses, isDeployed } = useContracts();

  const result = useReadContract({
    address: addresses.vton as `0x${string}`,
    abi: VTON_ABI,
    functionName: "totalSupply",
    query: { enabled: isDeployed },
  });

  return {
    data: result.data != null ? formatUnits18(result.data as bigint) : undefined,
    isLoading: isDeployed ? result.isLoading : false,
    isError: isDeployed ? result.isError : false,
    error: isDeployed ? result.error : null,
  };
}

/**
 * Hook to get vTON max supply.
 */
export function useMaxSupply() {
  const { addresses, isDeployed } = useContracts();

  const result = useReadContract({
    address: addresses.vton as `0x${string}`,
    abi: VTON_ABI,
    functionName: "MAX_SUPPLY",
    query: { enabled: isDeployed },
  });

  return {
    data: result.data != null ? formatUnits18(result.data as bigint) : undefined,
    isLoading: isDeployed ? result.isLoading : false,
    isError: isDeployed ? result.isError : false,
    error: isDeployed ? result.error : null,
  };
}

/**
 * Hook to get current halving epoch.
 */
export function useCurrentEpoch() {
  const { addresses, isDeployed } = useContracts();

  const result = useReadContract({
    address: addresses.vton as `0x${string}`,
    abi: VTON_ABI,
    functionName: "getCurrentEpoch",
    query: { enabled: isDeployed },
  });

  return {
    data: result.data != null ? Number(result.data as bigint) : undefined,
    isLoading: isDeployed ? result.isLoading : false,
    isError: isDeployed ? result.isError : false,
    error: isDeployed ? result.error : null,
  };
}

/**
 * Hook to get vTON balance for an address (defaults to connected wallet).
 */
export function useVTONBalance(address?: string) {
  const { addresses, isDeployed } = useContracts();
  const { address: connectedAddress } = useAccount();
  const target = address ?? connectedAddress;

  const result = useReadContract({
    address: addresses.vton as `0x${string}`,
    abi: VTON_ABI,
    functionName: "balanceOf",
    args: target ? [target as `0x${string}`] : undefined,
    query: { enabled: isDeployed && !!target },
  });

  return {
    data: result.data != null ? formatUnits18(result.data as bigint) : undefined,
    isLoading: isDeployed ? result.isLoading : false,
    isError: isDeployed ? result.isError : false,
    error: isDeployed ? result.error : null,
    refetch: result.refetch,
  };
}

/**
 * Hook to get voting power (getVotes) for an address (defaults to connected wallet).
 */
export function useVotingPower(address?: string) {
  const { addresses, isDeployed } = useContracts();
  const { address: connectedAddress } = useAccount();
  const target = address ?? connectedAddress;

  const result = useReadContract({
    address: addresses.vton as `0x${string}`,
    abi: VTON_ABI,
    functionName: "getVotes",
    args: target ? [target as `0x${string}`] : undefined,
    query: { enabled: isDeployed && !!target },
  });

  return {
    data: result.data != null ? formatUnits18(result.data as bigint) : undefined,
    isLoading: isDeployed ? result.isLoading : false,
    isError: isDeployed ? result.isError : false,
    error: isDeployed ? result.error : null,
  };
}
