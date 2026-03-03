"use client";

import { useMemo } from "react";
import { usePublicClient } from "wagmi";
import { useQuery } from "@tanstack/react-query";
import { parseAbiItem } from "viem";
import { getLogsInChunks } from "@/lib/getLogs";
import { useContracts, formatUnits18 } from "./helpers";
import type { VoteType, DelegateVoteRecord } from "../../../shared/types";

const VOTE_CAST_EVENT = parseAbiItem(
  "event VoteCast(address indexed voter, uint256 indexed proposalId, uint8 support, uint256 weight, string reason)"
);

export function useDelegateVotingHistory(delegateAddress?: string) {
  const { addresses, isDeployed, deploymentBlock } = useContracts();
  const publicClient = usePublicClient();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["delegateVotingHistory", delegateAddress, addresses.daoGovernor],
    queryFn: async (): Promise<DelegateVoteRecord[]> => {
      if (!publicClient || !delegateAddress) return [];

      const logs = await getLogsInChunks(publicClient, {
        address: addresses.daoGovernor as `0x${string}`,
        event: VOTE_CAST_EVENT,
        args: { voter: delegateAddress as `0x${string}` },
        fromBlock: deploymentBlock,
        toBlock: "latest",
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return logs.map((log: any) => {
        const args = log.args as { voter: string; proposalId: bigint; support: number; weight: bigint; reason: string };
        return {
          proposalId: args.proposalId.toString(),
          voter: args.voter,
          support: args.support as VoteType,
          weight: formatUnits18(args.weight),
          reason: args.reason,
          blockNumber: Number(log.blockNumber),
        };
      });
    },
    enabled: isDeployed && !!delegateAddress && !!publicClient,
    staleTime: 60_000,
  });

  const stats = useMemo(() => {
    if (!data || data.length === 0) return { totalVotes: 0, forRate: 0, againstRate: 0, abstainRate: 0 };
    const total = data.length;
    const forVotes = data.filter((v) => v.support === 1).length;
    const againstVotes = data.filter((v) => v.support === 0).length;
    const abstainVotes = data.filter((v) => v.support === 2).length;
    return {
      totalVotes: total,
      forRate: Math.round((forVotes / total) * 100),
      againstRate: Math.round((againstVotes / total) * 100),
      abstainRate: Math.round((abstainVotes / total) * 100),
    };
  }, [data]);

  return {
    votes: data ?? [],
    stats,
    isLoading,
    isError,
    error,
  };
}
