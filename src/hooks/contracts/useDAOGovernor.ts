"use client";

import { useMemo } from "react";
import {
  useReadContract,
  useReadContracts,
  useWriteContract,
  useBlock,
  useAccount,
  useWaitForTransactionReceipt,
} from "wagmi";
import { DAO_GOVERNOR_ABI } from "../../../shared/abi";
import { TIMELOCK_ABI } from "../../../shared/abi";
import { mapProposalState } from "../../../shared/types";
import type { ProposalState } from "../../../shared/types";
import {
  useContracts,
  formatUnits18,
  blockToTimestamp,
  extractTitle,
  BLOCK_TIME_SECONDS,
} from "./helpers";

/**
 * Hook to get all proposal IDs from the contract.
 */
export function useAllProposalIds() {
  const { addresses, isDeployed } = useContracts();

  const result = useReadContract({
    address: addresses.daoGovernor as `0x${string}`,
    abi: DAO_GOVERNOR_ABI,
    functionName: "getAllProposalIds",
    query: { enabled: isDeployed, staleTime: 30_000 },
  });

  return {
    data: result.data as bigint[] | undefined,
    isLoading: isDeployed ? result.isLoading : false,
    isError: isDeployed ? result.isError : false,
    error: isDeployed ? result.error : null,
    refetch: result.refetch,
  };
}

/**
 * Hook to get a single proposal by ID with its state.
 * Returns data in tako2's Proposal type format.
 */
export function useProposal(id: string) {
  const { addresses, isDeployed } = useContracts();
  const { data: block } = useBlock();

  const proposalId = BigInt(id);

  const results = useReadContracts({
    contracts: [
      {
        address: addresses.daoGovernor as `0x${string}`,
        abi: DAO_GOVERNOR_ABI,
        functionName: "getProposal",
        args: [proposalId],
      },
      {
        address: addresses.daoGovernor as `0x${string}`,
        abi: DAO_GOVERNOR_ABI,
        functionName: "state",
        args: [proposalId],
      },
      {
        address: addresses.daoGovernor as `0x${string}`,
        abi: DAO_GOVERNOR_ABI,
        functionName: "quorum",
      },
    ],
    query: { enabled: isDeployed },
  });

  const data = useMemo(() => {
    if (!results.data || !block) return undefined;
    const [proposalResult, stateResult, quorumResult] = results.data;
    if (proposalResult?.status !== "success" || stateResult?.status !== "success") return undefined;

    const p = proposalResult.result as {
      id: bigint;
      proposer: string;
      description: string;
      voteStart: bigint;
      voteEnd: bigint;
      forVotes: bigint;
      againstVotes: bigint;
      abstainVotes: bigint;
    };
    const state = stateResult.result as number;
    const quorum = quorumResult?.status === "success" ? (quorumResult.result as bigint) : BigInt(0);

    const currentBlock = block.number;
    const currentTimestamp = Number(block.timestamp);

    const forVotes = formatUnits18(p.forVotes);
    const againstVotes = formatUnits18(p.againstVotes);
    const abstainVotes = formatUnits18(p.abstainVotes);
    const totalVotingPower = forVotes + againstVotes + abstainVotes;

    return {
      id,
      proposer: p.proposer,
      title: extractTitle(p.description),
      description: p.description,
      status: mapProposalState(state as ProposalState),
      forVotes,
      againstVotes,
      abstainVotes,
      startTime: blockToTimestamp(p.voteStart, currentBlock, currentTimestamp),
      endTime: blockToTimestamp(p.voteEnd, currentBlock, currentTimestamp),
      quorum: Number(quorum) / 100, // basis points to percentage
      totalVotingPower,
    };
  }, [results.data, block, id]);

  return {
    data,
    isLoading: isDeployed ? results.isLoading : false,
    isError: isDeployed ? results.isError : false,
    error: isDeployed ? results.error : null,
  };
}

/**
 * Hook to get all proposals in ProposalListItem format.
 */
export function useProposals() {
  const { addresses, isDeployed } = useContracts();
  const { data: block } = useBlock();
  const { data: ids, isLoading: idsLoading } = useAllProposalIds();
  const proposalIds = ids ?? [];

  const proposalCalls = proposalIds.map((pid) => ({
    address: addresses.daoGovernor as `0x${string}`,
    abi: DAO_GOVERNOR_ABI,
    functionName: "getProposal" as const,
    args: [pid],
  }));

  const stateCalls = proposalIds.map((pid) => ({
    address: addresses.daoGovernor as `0x${string}`,
    abi: DAO_GOVERNOR_ABI,
    functionName: "state" as const,
    args: [pid],
  }));

  const { data: results, isLoading: detailsLoading, isError, error } = useReadContracts({
    contracts: [...proposalCalls, ...stateCalls],
    query: { enabled: isDeployed && proposalIds.length > 0 },
  });

  const data = useMemo(() => {
    if (!results || proposalIds.length === 0 || !block) return undefined;
    const currentBlock = block.number;
    const currentTimestamp = Number(block.timestamp);
    const items = [];

    for (let i = 0; i < proposalIds.length; i++) {
      const proposalResult = results[i];
      const stateResult = results[proposalIds.length + i];

      if (proposalResult?.status === "success" && stateResult?.status === "success") {
        const p = proposalResult.result as {
          id: bigint;
          proposer: string;
          description: string;
          voteStart: bigint;
          voteEnd: bigint;
          forVotes: bigint;
          againstVotes: bigint;
          abstainVotes: bigint;
        };
        const state = stateResult.result as number;

        items.push({
          id: proposalIds[i].toString(),
          title: extractTitle(p.description),
          status: mapProposalState(state as ProposalState),
          proposer: p.proposer,
          forVotes: formatUnits18(p.forVotes),
          againstVotes: formatUnits18(p.againstVotes),
          abstainVotes: formatUnits18(p.abstainVotes),
          startTime: blockToTimestamp(p.voteStart, currentBlock, currentTimestamp),
          endTime: blockToTimestamp(p.voteEnd, currentBlock, currentTimestamp),
        });
      }
    }
    return items;
  }, [results, proposalIds, block]);

  return {
    data,
    isLoading: isDeployed ? (idsLoading || detailsLoading) : false,
    isError: isDeployed ? isError : false,
    error: isDeployed ? error : null,
  };
}

/**
 * Hook to get governance parameters (quorum, votingPeriod, votingDelay, proposalCreationCost, timelockDelay).
 */
export function useGovernanceParams() {
  const { addresses, isDeployed } = useContracts();

  const results = useReadContracts({
    contracts: [
      {
        address: addresses.daoGovernor as `0x${string}`,
        abi: DAO_GOVERNOR_ABI,
        functionName: "quorum",
      },
      {
        address: addresses.daoGovernor as `0x${string}`,
        abi: DAO_GOVERNOR_ABI,
        functionName: "votingPeriod",
      },
      {
        address: addresses.daoGovernor as `0x${string}`,
        abi: DAO_GOVERNOR_ABI,
        functionName: "votingDelay",
      },
      {
        address: addresses.daoGovernor as `0x${string}`,
        abi: DAO_GOVERNOR_ABI,
        functionName: "proposalCreationCost",
      },
      {
        address: addresses.timelock as `0x${string}`,
        abi: TIMELOCK_ABI,
        functionName: "delay",
      },
    ],
    query: { enabled: isDeployed },
  });

  const data = useMemo(() => {
    if (!results.data) return undefined;
    const [quorumR, periodR, delayR, costR, timelockR] = results.data;

    const getValue = (r: typeof quorumR) =>
      r?.status === "success" ? (r.result as bigint) : undefined;

    const quorum = getValue(quorumR);
    const votingPeriod = getValue(periodR);
    const votingDelay = getValue(delayR);
    const cost = getValue(costR);
    const timelockDelay = getValue(timelockR);

    if (quorum == null || votingPeriod == null || votingDelay == null || cost == null || timelockDelay == null) {
      return undefined;
    }

    return {
      quorum: Number(quorum) / 100, // basis points → percentage
      votingPeriod: Number(votingPeriod) * BLOCK_TIME_SECONDS, // blocks → seconds
      votingDelay: Number(votingDelay) * BLOCK_TIME_SECONDS, // blocks → seconds
      proposalCreationCost: formatUnits18(cost),
      timelockDelay: Number(timelockDelay), // already in seconds
    };
  }, [results.data]);

  return {
    data,
    isLoading: isDeployed ? results.isLoading : false,
    isError: isDeployed ? results.isError : false,
    error: isDeployed ? results.error : null,
  };
}

/**
 * Hook to check if the connected account has voted on a proposal.
 */
export function useHasVoted(proposalId: string, address?: string) {
  const { addresses, isDeployed } = useContracts();
  const { address: connectedAddress } = useAccount();
  const account = address ?? connectedAddress;

  const result = useReadContract({
    address: addresses.daoGovernor as `0x${string}`,
    abi: DAO_GOVERNOR_ABI,
    functionName: "hasVoted",
    args: account ? [BigInt(proposalId), account as `0x${string}`] : undefined,
    query: { enabled: isDeployed && !!account },
  });

  return {
    data: (result.data as boolean) ?? false,
    isLoading: isDeployed ? result.isLoading : false,
    isError: isDeployed ? result.isError : false,
    error: isDeployed ? result.error : null,
  };
}

/**
 * Hook to cast a vote on a proposal.
 */
export function useCastVote() {
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

  const castVote = async (proposalId: string, support: number, reason?: string) => {
    if (!isDeployed) throw new Error("Contracts not deployed");
    if (reason) {
      writeContract({
        address: addresses.daoGovernor as `0x${string}`,
        abi: DAO_GOVERNOR_ABI,
        functionName: "castVoteWithReason",
        args: [BigInt(proposalId), support, reason],
      });
    } else {
      writeContract({
        address: addresses.daoGovernor as `0x${string}`,
        abi: DAO_GOVERNOR_ABI,
        functionName: "castVote",
        args: [BigInt(proposalId), support],
      });
    }
  };

  return {
    castVote,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
    reset,
    isLoading: isPending || isConfirming,
  };
}
