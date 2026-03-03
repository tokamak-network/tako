"use client";

import { useMemo } from "react";
import {
  useReadContract,
  useReadContracts,
  useWriteContract,
  useWaitForTransactionReceipt,
  useAccount,
} from "wagmi";
import { SECURITY_COUNCIL_ABI } from "../../../shared/abi";
import { useContracts } from "./helpers";
import type { EmergencyAction, ActionType } from "../../../shared/types";

export function useSecurityCouncilMembers() {
  const { addresses, isDeployed } = useContracts();

  const countResult = useReadContract({
    address: addresses.securityCouncil as `0x${string}`,
    abi: SECURITY_COUNCIL_ABI,
    functionName: "memberCount",
    query: { enabled: isDeployed },
  });

  const count = countResult.data != null ? Number(countResult.data) : 0;

  const memberCalls = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      address: addresses.securityCouncil as `0x${string}`,
      abi: SECURITY_COUNCIL_ABI,
      functionName: "members" as const,
      args: [BigInt(i)],
    }));
  }, [count, addresses.securityCouncil]);

  const membersResult = useReadContracts({
    contracts: memberCalls,
    query: { enabled: isDeployed && count > 0 },
  });

  const members = useMemo(() => {
    if (!membersResult.data) return [];
    return membersResult.data
      .filter((r) => r.status === "success")
      .map((r) => r.result as string);
  }, [membersResult.data]);

  return {
    members,
    count,
    isLoading: countResult.isLoading || membersResult.isLoading,
  };
}

export function useSecurityCouncilThreshold() {
  const { addresses, isDeployed } = useContracts();

  const result = useReadContract({
    address: addresses.securityCouncil as `0x${string}`,
    abi: SECURITY_COUNCIL_ABI,
    functionName: "threshold",
    query: { enabled: isDeployed },
  });

  return {
    data: result.data != null ? Number(result.data) : undefined,
    isLoading: isDeployed ? result.isLoading : false,
  };
}

export function useIsSCMember() {
  const { addresses, isDeployed } = useContracts();
  const { address } = useAccount();

  const result = useReadContract({
    address: addresses.securityCouncil as `0x${string}`,
    abi: SECURITY_COUNCIL_ABI,
    functionName: "isMember",
    args: address ? [address as `0x${string}`] : undefined,
    query: { enabled: isDeployed && !!address },
  });

  return {
    data: (result.data as boolean) ?? false,
    isLoading: isDeployed ? result.isLoading : false,
  };
}

export function usePendingActions() {
  const { addresses, isDeployed } = useContracts();

  const countResult = useReadContract({
    address: addresses.securityCouncil as `0x${string}`,
    abi: SECURITY_COUNCIL_ABI,
    functionName: "pendingActionCount",
    query: { enabled: isDeployed },
  });

  const count = countResult.data != null ? Number(countResult.data) : 0;

  const actionCalls = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      address: addresses.securityCouncil as `0x${string}`,
      abi: SECURITY_COUNCIL_ABI,
      functionName: "getAction" as const,
      args: [BigInt(i)],
    }));
  }, [count, addresses.securityCouncil]);

  const actionsResult = useReadContracts({
    contracts: actionCalls,
    query: { enabled: isDeployed && count > 0 },
  });

  const actions: EmergencyAction[] = useMemo(() => {
    if (!actionsResult.data) return [];
    return actionsResult.data
      .filter((r) => r.status === "success")
      .map((r) => {
        const a = r.result as {
          id: bigint;
          actionType: number;
          target: string;
          data: string;
          proposer: string;
          reason: string;
          approvalCount: bigint;
          executed: boolean;
          canceled: boolean;
          createdAt: bigint;
        };
        return {
          id: Number(a.id),
          actionType: a.actionType as ActionType,
          target: a.target,
          data: a.data,
          proposer: a.proposer,
          reason: a.reason,
          approvalCount: Number(a.approvalCount),
          executed: a.executed,
          canceled: a.canceled,
          createdAt: Number(a.createdAt),
        };
      });
  }, [actionsResult.data]);

  return {
    actions,
    count,
    isLoading: countResult.isLoading || actionsResult.isLoading,
    refetch: actionsResult.refetch,
  };
}

export function useProposeEmergencyAction() {
  const { addresses, isDeployed } = useContracts();

  const { data: hash, isPending, writeContract, error, reset } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash });

  const propose = (actionType: ActionType, target: string, data: string, reason: string) => {
    if (!isDeployed) throw new Error("Contracts not deployed");
    writeContract({
      address: addresses.securityCouncil as `0x${string}`,
      abi: SECURITY_COUNCIL_ABI,
      functionName: "proposeEmergencyAction",
      args: [actionType, target as `0x${string}`, data as `0x${string}`, reason],
    });
  };

  return { propose, hash, isPending, isConfirming, isConfirmed, error, reset, isLoading: isPending || isConfirming };
}

export function useApproveAction() {
  const { addresses, isDeployed } = useContracts();

  const { data: hash, isPending, writeContract, error, reset } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash });

  const approve = (actionId: number) => {
    if (!isDeployed) throw new Error("Contracts not deployed");
    writeContract({
      address: addresses.securityCouncil as `0x${string}`,
      abi: SECURITY_COUNCIL_ABI,
      functionName: "approveAction",
      args: [BigInt(actionId)],
    });
  };

  return { approve, hash, isPending, isConfirming, isConfirmed, error, reset, isLoading: isPending || isConfirming };
}

export function useExecuteAction() {
  const { addresses, isDeployed } = useContracts();

  const { data: hash, isPending, writeContract, error, reset } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash });

  const execute = (actionId: number) => {
    if (!isDeployed) throw new Error("Contracts not deployed");
    writeContract({
      address: addresses.securityCouncil as `0x${string}`,
      abi: SECURITY_COUNCIL_ABI,
      functionName: "executeAction",
      args: [BigInt(actionId)],
    });
  };

  return { execute, hash, isPending, isConfirming, isConfirmed, error, reset, isLoading: isPending || isConfirming };
}
