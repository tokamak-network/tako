"use client";

import {
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { VTON_FAUCET_ABI } from "../../../shared/abi";
import { useContracts, formatUnits18 } from "./helpers";

export function useVTONFaucetConfig() {
  const { addresses, isDeployed } = useContracts();

  const amount = useReadContract({
    address: addresses.faucet as `0x${string}`,
    abi: VTON_FAUCET_ABI,
    functionName: "claimAmount",
    query: { enabled: isDeployed && !!addresses.faucet },
  });

  const paused = useReadContract({
    address: addresses.faucet as `0x${string}`,
    abi: VTON_FAUCET_ABI,
    functionName: "paused",
    query: { enabled: isDeployed && !!addresses.faucet },
  });

  return {
    claimAmount: amount.data != null ? formatUnits18(amount.data as bigint) : undefined,
    isPaused: (paused.data as boolean) ?? false,
    isLoading: amount.isLoading || paused.isLoading,
  };
}

export function useVTONFaucetClaim() {
  const { addresses, isDeployed } = useContracts();

  const { data: hash, isPending, writeContract, error, reset } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash });

  const claim = () => {
    if (!isDeployed || !addresses.faucet) throw new Error("vTON Faucet not deployed");
    writeContract({
      address: addresses.faucet as `0x${string}`,
      abi: VTON_FAUCET_ABI,
      functionName: "claim",
    });
  };

  return {
    claim,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
    reset,
    isLoading: isPending || isConfirming,
  };
}
