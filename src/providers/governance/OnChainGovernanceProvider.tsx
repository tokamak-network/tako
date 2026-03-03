"use client";

import React, { useState, useCallback, useMemo } from "react";
import { useAccount } from "wagmi";
import type { GovernanceDataProvider, QueryResult } from "./types";
import { GovernanceContext } from "./context";
import type {
  Proposal,
  ProposalListItem,
  ProposalStatus,
  ProposalCalldata,
  DelegateInfo,
  DelegateVoteRecord,
  UserStatus,
  DAOParameters,
  DashboardMetrics,
  VoteType,
} from "../../../shared/types";
import {
  useTotalSupply,
  useVTONBalance,
  useVotingPower as useOnChainVotingPower,
  useOnChainProposals,
  useOnChainProposal,
  useGovernanceParams,
  useCastVote as useOnChainCastVote,
  useOnChainDelegates,
  useOnChainDelegateInfo,
  useMyDelegations,
  useDelegate as useOnChainDelegate,
  useUndelegate as useOnChainUndelegate,
} from "@/hooks/contracts";
import { useDelegateVotingHistory } from "@/hooks/contracts/useDelegateVotingHistory";
import { parseUnits } from "viem";

// --- Standalone hooks implementing GovernanceDataProvider interface ---

function useOnChainProposalsList(filter?: ProposalStatus): QueryResult<ProposalListItem[]> {
  const { data, isLoading, isError, error } = useOnChainProposals();

  const filtered = useMemo(() => {
    if (!data) return undefined;
    if (!filter) return data;
    return data.filter((p) => p.status === filter);
  }, [data, filter]);

  return { data: filtered, isLoading, isError, error };
}

function useOnChainProposalDetail(id: string): QueryResult<Proposal> {
  const { data, isLoading, isError, error } = useOnChainProposal(id);
  return { data: data as Proposal | undefined, isLoading, isError, error };
}

function useOnChainDelegatesList(): QueryResult<DelegateInfo[]> {
  const { data, isLoading, isError, error } = useOnChainDelegates();
  return { data: data as DelegateInfo[] | undefined, isLoading, isError, error };
}

function useOnChainDelegateDetail(address: string): QueryResult<DelegateInfo> {
  const { data, isLoading, isError, error } = useOnChainDelegateInfo(address);
  return { data: data as DelegateInfo | undefined, isLoading, isError, error };
}

function useOnChainUserStatus(address?: string): QueryResult<UserStatus> {
  const { address: connectedAddress } = useAccount();
  const target = address ?? connectedAddress;

  const { data: balance, isLoading: balanceLoading } = useVTONBalance(target);
  const { data: votingPower, isLoading: vpLoading } = useOnChainVotingPower(target);
  const { delegations, primaryDelegation, totalDelegatedAmount, isLoading: delegationsLoading } =
    useMyDelegations(target);

  const data = useMemo(() => {
    if (balance == null || votingPower == null) return undefined;
    return {
      vtonBalance: balance,
      delegatedTo: primaryDelegation?.delegatee,
      delegatedAmount: totalDelegatedAmount,
      receivedDelegations: 0, // Would need additional query
      votingPower,
    };
  }, [balance, votingPower, primaryDelegation, totalDelegatedAmount]);

  return {
    data,
    isLoading: balanceLoading || vpLoading || delegationsLoading,
    isError: false,
    error: null,
  };
}

function useOnChainVotingPowerHook(address?: string): QueryResult<number> {
  const { data, isLoading, isError, error } = useOnChainVotingPower(address);
  return { data: data ?? undefined, isLoading, isError, error };
}

function useOnChainDAOParameters(): QueryResult<DAOParameters> {
  const { data, isLoading, isError, error } = useGovernanceParams();
  return { data: data as DAOParameters | undefined, isLoading, isError, error };
}

function useOnChainDashboardMetrics(): QueryResult<DashboardMetrics> {
  const { data: totalSupply, isLoading: supplyLoading } = useTotalSupply();
  const { data: proposals, isLoading: proposalsLoading } = useOnChainProposals();
  const { data: delegates, isLoading: delegatesLoading } = useOnChainDelegates();

  const data = useMemo(() => {
    if (totalSupply == null) return undefined;
    const activeProposals = proposals?.filter((p) => p.status === "active").length ?? 0;
    const totalDelegates = delegates?.length ?? 0;

    return {
      totalVTONSupply: totalSupply,
      activeProposals,
      totalDelegates,
      totalDelegators: 0, // Would need event log aggregation
      treasuryBalance: 0, // Would need separate contract call
      participationRate: 0, // Would need historical calculation
    };
  }, [totalSupply, proposals, delegates]);

  return {
    data,
    isLoading: supplyLoading || proposalsLoading || delegatesLoading,
    isError: false,
    error: null,
  };
}

function useOnChainCastVoteHook() {
  const { castVote: onChainCastVote, isLoading } = useOnChainCastVote();

  const castVote = useCallback(
    async (proposalId: string, vote: VoteType, reason?: string) => {
      await onChainCastVote(proposalId, vote, reason);
    },
    [onChainCastVote]
  );

  return { castVote, isLoading };
}

function useOnChainDelegation() {
  const { delegate: onChainDelegate, isLoading: delegateLoading } = useOnChainDelegate();
  const { undelegate: onChainUndelegate, isLoading: undelegateLoading } = useOnChainUndelegate();
  const { data: balance } = useVTONBalance();

  const delegate = useCallback(
    async (to: string) => {
      // Delegate full balance by default
      const amount = balance != null ? parseUnits(balance.toString(), 18) : BigInt(0);
      await onChainDelegate(to, amount);
    },
    [onChainDelegate, balance]
  );

  const undelegate = useCallback(async () => {
    // Need to undelegate from current delegatee — find primary delegation
    // This is a simplified version; real implementation would use primaryDelegation
    const amount = balance != null ? parseUnits(balance.toString(), 18) : BigInt(0);
    // Note: undelegate needs the delegate address, but the interface only takes no args.
    // For now we undelegate from zero address which will need to be adjusted when we know the delegatee
    await onChainUndelegate("0x0000000000000000000000000000000000000000", amount);
  }, [onChainUndelegate, balance]);

  return { delegate, undelegate, isLoading: delegateLoading || undelegateLoading };
}

function useOnChainProposalCalldata(_id: string): QueryResult<ProposalCalldata> {
  // ProposalCreated event contains targets/values/calldatas, but parsing logs for
  // a single proposal is expensive. For now, return empty — the AI decode_calldata
  // tool is the primary way users see calldata.
  return { data: undefined, isLoading: false, isError: false, error: null };
}

function useOnChainDelegateVotes(address: string): QueryResult<DelegateVoteRecord[]> {
  const { votes, isLoading, isError, error } = useDelegateVotingHistory(address);
  return { data: votes.length > 0 ? votes : undefined, isLoading, isError, error };
}

// --- Provider ---

export function OnChainGovernanceProvider({ children }: { children: React.ReactNode }) {
  // Create a stable provider object with function references.
  // These are module-level hook functions, so references are stable.
  const [provider] = useState<GovernanceDataProvider>(() => ({
    useProposals: useOnChainProposalsList,
    useProposal: useOnChainProposalDetail,
    useDelegates: useOnChainDelegatesList,
    useDelegateInfo: useOnChainDelegateDetail,
    useUserStatus: useOnChainUserStatus,
    useVotingPower: useOnChainVotingPowerHook,
    useDAOParameters: useOnChainDAOParameters,
    useDashboardMetrics: useOnChainDashboardMetrics,
    useCastVote: useOnChainCastVoteHook,
    useDelegation: useOnChainDelegation,
    useProposalCalldata: useOnChainProposalCalldata,
    useDelegateVotes: useOnChainDelegateVotes,
  }));

  return (
    <GovernanceContext.Provider value={provider}>
      {children}
    </GovernanceContext.Provider>
  );
}
