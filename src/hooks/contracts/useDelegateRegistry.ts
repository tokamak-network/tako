"use client";

import { useMemo } from "react";
import {
  useReadContract,
  useReadContracts,
  useWriteContract,
  useWaitForTransactionReceipt,
  useAccount,
} from "wagmi";
import { DELEGATE_REGISTRY_ABI } from "../../../shared/abi";
import { VTON_ABI } from "../../../shared/abi";
import { useContracts, formatUnits18 } from "./helpers";

/**
 * Hook to get all registered delegate addresses.
 */
export function useAllDelegates() {
  const { addresses, isDeployed } = useContracts();

  const result = useReadContract({
    address: addresses.delegateRegistry as `0x${string}`,
    abi: DELEGATE_REGISTRY_ABI,
    functionName: "getAllDelegates",
    query: { enabled: isDeployed },
  });

  return {
    data: result.data as `0x${string}`[] | undefined,
    isLoading: isDeployed ? result.isLoading : false,
    isError: isDeployed ? result.isError : false,
    error: isDeployed ? result.error : null,
    refetch: result.refetch,
  };
}

/**
 * Hook to get detailed delegate info + total delegated for a single delegate.
 * Returns data mapped to tako2's DelegateInfo type.
 */
export function useDelegateInfo(address: string) {
  const { addresses, isDeployed } = useContracts();

  const results = useReadContracts({
    contracts: [
      {
        address: addresses.delegateRegistry as `0x${string}`,
        abi: DELEGATE_REGISTRY_ABI,
        functionName: "getDelegateInfo",
        args: [address as `0x${string}`],
      },
      {
        address: addresses.delegateRegistry as `0x${string}`,
        abi: DELEGATE_REGISTRY_ABI,
        functionName: "getTotalDelegated",
        args: [address as `0x${string}`],
      },
      {
        address: addresses.vton as `0x${string}`,
        abi: VTON_ABI,
        functionName: "getVotes",
        args: [address as `0x${string}`],
      },
    ],
    query: { enabled: isDeployed && !!address },
  });

  const data = useMemo(() => {
    if (!results.data) return undefined;
    const [infoR, totalR, votesR] = results.data;
    if (infoR?.status !== "success") return undefined;

    const info = infoR.result as {
      profile: string;
      votingPhilosophy: string;
      interests: string;
      registeredAt: bigint;
      isActive: boolean;
    };

    const totalDelegated = totalR?.status === "success" ? formatUnits18(totalR.result as bigint) : 0;
    const votingPower = votesR?.status === "success" ? formatUnits18(votesR.result as bigint) : 0;

    return {
      address,
      name: info.profile || undefined,
      statement: info.votingPhilosophy || undefined,
      votingPower,
      delegators: 0, // Not directly available from contract; would need event log query
      voteParticipation: 0, // Would need proposal voting history
      recentVotes: [],
    };
  }, [results.data, address]);

  return {
    data,
    isLoading: isDeployed ? results.isLoading : false,
    isError: isDeployed ? results.isError : false,
    error: isDeployed ? results.error : null,
  };
}

/**
 * Hook to get all delegates with their info.
 * Fetches all delegate addresses, then batch-reads info + totalDelegated + votes for each.
 */
export function useDelegates() {
  const { addresses, isDeployed } = useContracts();
  const { data: delegateAddresses, isLoading: addressesLoading } = useAllDelegates();
  const addrs = delegateAddresses ?? [];

  const infoCalls = addrs.map((addr) => ({
    address: addresses.delegateRegistry as `0x${string}`,
    abi: DELEGATE_REGISTRY_ABI,
    functionName: "getDelegateInfo" as const,
    args: [addr],
  }));

  const votesCalls = addrs.map((addr) => ({
    address: addresses.vton as `0x${string}`,
    abi: VTON_ABI,
    functionName: "getVotes" as const,
    args: [addr],
  }));

  const { data: results, isLoading: detailsLoading, isError, error } = useReadContracts({
    contracts: [...infoCalls, ...votesCalls],
    query: { enabled: isDeployed && addrs.length > 0 },
  });

  const data = useMemo(() => {
    if (!results || addrs.length === 0) return undefined;

    return addrs.map((addr, i) => {
      const infoR = results[i];
      const votesR = results[addrs.length + i];

      const info =
        infoR?.status === "success"
          ? (infoR.result as {
              profile: string;
              votingPhilosophy: string;
              interests: string;
              registeredAt: bigint;
              isActive: boolean;
            })
          : null;

      const votingPower = votesR?.status === "success" ? formatUnits18(votesR.result as bigint) : 0;

      return {
        address: addr,
        name: info?.profile || undefined,
        statement: info?.votingPhilosophy || undefined,
        votingPower,
        delegators: 0,
        voteParticipation: 0,
        recentVotes: [],
      };
    });
  }, [results, addrs]);

  return {
    data,
    isLoading: isDeployed ? (addressesLoading || detailsLoading) : false,
    isError: isDeployed ? isError : false,
    error: isDeployed ? error : null,
  };
}

/**
 * Hook to get the connected user's delegations.
 * Checks all delegates to find where the user has delegated.
 */
export function useMyDelegations(ownerAddress?: string) {
  const { addresses, isDeployed } = useContracts();
  const { address: connectedAddress } = useAccount();
  const owner = ownerAddress ?? connectedAddress;
  const { data: allDelegateAddrs, isLoading: delegatesLoading } = useAllDelegates();
  const delegateList = allDelegateAddrs ?? [];

  const contracts = useMemo(() => {
    if (!isDeployed || !owner || delegateList.length === 0) return [];
    return delegateList.map((delegate) => ({
      address: addresses.delegateRegistry as `0x${string}`,
      abi: DELEGATE_REGISTRY_ABI,
      functionName: "getDelegation" as const,
      args: [owner as `0x${string}`, delegate] as const,
    }));
  }, [isDeployed, owner, delegateList, addresses.delegateRegistry]);

  const { data: delegationResults, isLoading: delegationsLoading } = useReadContracts({
    contracts,
    query: { enabled: contracts.length > 0 },
  });

  const delegations = useMemo(() => {
    if (!delegateList || !delegationResults) return [];

    const active: Array<{
      delegatee: string;
      amount: number;
    }> = [];

    delegationResults.forEach((result, index) => {
      if (result.status === "success" && result.result) {
        const delegation = result.result as {
          delegate: `0x${string}`;
          amount: bigint;
          delegatedAt: bigint;
          expiresAt: bigint;
        };
        if (delegation.amount > BigInt(0)) {
          active.push({
            delegatee: delegateList[index],
            amount: formatUnits18(delegation.amount),
          });
        }
      }
    });

    return active;
  }, [delegateList, delegationResults]);

  const primaryDelegation = delegations.length > 0 ? delegations[0] : null;
  const totalDelegatedAmount = delegations.reduce((sum, d) => sum + d.amount, 0);

  return {
    delegations,
    primaryDelegation,
    totalDelegatedAmount,
    isLoading: delegatesLoading || delegationsLoading,
  };
}

/**
 * Hook to delegate vTON.
 */
export function useDelegate() {
  const { addresses, isDeployed } = useContracts();

  const {
    data: hash,
    isPending,
    writeContract,
    error,
    reset,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash });

  const delegate = async (delegateAddr: string, amount: bigint) => {
    if (!isDeployed) throw new Error("Contracts not deployed");
    writeContract({
      address: addresses.delegateRegistry as `0x${string}`,
      abi: DELEGATE_REGISTRY_ABI,
      functionName: "delegate",
      args: [delegateAddr as `0x${string}`, amount],
    });
  };

  return {
    delegate,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
    reset,
    isLoading: isPending || isConfirming,
  };
}

/**
 * Hook to undelegate vTON.
 */
export function useUndelegate() {
  const { addresses, isDeployed } = useContracts();

  const {
    data: hash,
    isPending,
    writeContract,
    error,
    reset,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash });

  const undelegate = async (delegateAddr: string, amount: bigint) => {
    if (!isDeployed) throw new Error("Contracts not deployed");
    writeContract({
      address: addresses.delegateRegistry as `0x${string}`,
      abi: DELEGATE_REGISTRY_ABI,
      functionName: "undelegate",
      args: [delegateAddr as `0x${string}`, amount],
    });
  };

  return {
    undelegate,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
    reset,
    isLoading: isPending || isConfirming,
  };
}
