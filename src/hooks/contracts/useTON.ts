"use client";

import {
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
  useAccount,
} from "wagmi";
import { TON_ABI, TON_FAUCET_ABI } from "../../../shared/abi";
import { useContracts, formatUnits18 } from "./helpers";

export function useTONBalance(address?: string) {
  const { addresses, isDeployed } = useContracts();
  const { address: connectedAddress } = useAccount();
  const account = address ?? connectedAddress;

  const result = useReadContract({
    address: addresses.ton as `0x${string}`,
    abi: TON_ABI,
    functionName: "balanceOf",
    args: account ? [account as `0x${string}`] : undefined,
    query: { enabled: isDeployed && !!addresses.ton && !!account },
  });

  return {
    data: result.data != null ? formatUnits18(result.data as bigint) : undefined,
    isLoading: isDeployed ? result.isLoading : false,
    refetch: result.refetch,
  };
}

export function useTONAllowance(spender?: string) {
  const { addresses, isDeployed } = useContracts();
  const { address: connectedAddress } = useAccount();

  const result = useReadContract({
    address: addresses.ton as `0x${string}`,
    abi: TON_ABI,
    functionName: "allowance",
    args:
      connectedAddress && spender
        ? [connectedAddress as `0x${string}`, spender as `0x${string}`]
        : undefined,
    query: { enabled: isDeployed && !!addresses.ton && !!connectedAddress && !!spender },
  });

  return {
    data: result.data != null ? formatUnits18(result.data as bigint) : undefined,
    raw: result.data as bigint | undefined,
    isLoading: isDeployed ? result.isLoading : false,
    refetch: result.refetch,
  };
}

export function useApproveTON() {
  const { addresses, isDeployed } = useContracts();

  const { data: hash, isPending, writeContract, error, reset } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash });

  const approve = (spender: string, amount: bigint) => {
    if (!isDeployed || !addresses.ton) throw new Error("TON not deployed");
    writeContract({
      address: addresses.ton as `0x${string}`,
      abi: TON_ABI,
      functionName: "approve",
      args: [spender as `0x${string}`, amount],
    });
  };

  return {
    approve,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
    reset,
    isLoading: isPending || isConfirming,
  };
}

export function useTONFaucetClaim() {
  const { addresses, isDeployed } = useContracts();

  const config = useReadContract({
    address: addresses.tonFaucet as `0x${string}`,
    abi: TON_FAUCET_ABI,
    functionName: "claimAmount",
    query: { enabled: isDeployed && !!addresses.tonFaucet },
  });

  const paused = useReadContract({
    address: addresses.tonFaucet as `0x${string}`,
    abi: TON_FAUCET_ABI,
    functionName: "paused",
    query: { enabled: isDeployed && !!addresses.tonFaucet },
  });

  const { data: hash, isPending, writeContract, error, reset } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash });

  const claim = () => {
    if (!isDeployed || !addresses.tonFaucet) throw new Error("TON Faucet not deployed");
    writeContract({
      address: addresses.tonFaucet as `0x${string}`,
      abi: TON_FAUCET_ABI,
      functionName: "claim",
    });
  };

  return {
    claimAmount: config.data != null ? formatUnits18(config.data as bigint) : undefined,
    isPaused: (paused.data as boolean) ?? false,
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
