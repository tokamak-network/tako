"use client";

import React, { useState, useCallback, useMemo, useEffect, useRef } from "react";
import type { GovernanceDataProvider, QueryResult } from "./types";
import { GovernanceContext, useGovernance } from "./context";

// Re-export so existing imports don't break
export { useGovernance };
import type {
  Proposal,
  ProposalListItem,
  ProposalStatus,
  DelegateInfo,
  UserStatus,
  DAOParameters,
  DashboardMetrics,
  VoteType,
} from "../../../shared/types";
import { dummyProposals, dummyProposalsList } from "@/data/dummy/proposals";
import { dummyDelegates } from "@/data/dummy/delegates";
import { dummyUserStatus } from "@/data/dummy/user";
import { dummyDAOParameters, dummyDashboardMetrics } from "@/data/dummy/parameters";

// --- Dummy query helper ---
// Simulates loading on mount only; after that, passes data through directly.
function useDummyQuery<T>(data: T, delay = 800): QueryResult<T> {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), delay);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // mount only — delay is constant per call site

  return {
    data: isLoading ? undefined : data,
    isLoading,
    isError: false,
    error: null,
  };
}

// --- Provider ---
export function GovernanceProvider({ children }: { children: React.ReactNode }) {
  // Local state for write operations
  const [proposals, setProposals] = useState(dummyProposals);
  const [userStatus, setUserStatus] = useState(dummyUserStatus);

  const provider = useMemo<GovernanceDataProvider>(() => ({
    useProposals(filter?: ProposalStatus) {
      const filtered = filter
        ? proposals.filter((p) => p.status === filter)
        : proposals;
      const list: ProposalListItem[] = filtered.map(
        ({ id, title, status, governanceSystem, proposer, forVotes, againstVotes, abstainVotes, startTime, endTime }) => ({
          id, title, status, governanceSystem, proposer, forVotes, againstVotes, abstainVotes, startTime, endTime,
        })
      );
      // eslint-disable-next-line react-hooks/rules-of-hooks
      return useDummyQuery(list, 600);
    },

    useProposal(id: string) {
      const proposal = proposals.find((p) => p.id === id);
      // eslint-disable-next-line react-hooks/rules-of-hooks
      return useDummyQuery(proposal as Proposal, 500);
    },

    useDelegates() {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      return useDummyQuery(dummyDelegates, 700);
    },

    useDelegateInfo(address: string) {
      const delegate = dummyDelegates.find(
        (d) => d.address.toLowerCase() === address.toLowerCase()
      );
      // eslint-disable-next-line react-hooks/rules-of-hooks
      return useDummyQuery(delegate as DelegateInfo, 500);
    },

    useUserStatus() {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      return useDummyQuery(userStatus, 400);
    },

    useVotingPower() {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      return useDummyQuery(userStatus.votingPower, 400);
    },

    useDAOParameters() {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      return useDummyQuery(dummyDAOParameters, 300);
    },

    useDashboardMetrics() {
      const metrics: DashboardMetrics = {
        ...dummyDashboardMetrics,
        activeProposals: proposals.filter((p) => p.status === "active").length,
      };
      // eslint-disable-next-line react-hooks/rules-of-hooks
      return useDummyQuery(metrics, 500);
    },

    useCastVote() {
      const [isLoading, setIsLoading] = useState(false);

      const castVote = useCallback(
        async (proposalId: string, vote: VoteType) => {
          setIsLoading(true);
          await new Promise((r) => setTimeout(r, 1500));
          setProposals((prev) =>
            prev.map((p) => {
              if (p.id !== proposalId) return p;
              const votes = { ...p };
              const power = userStatus.votingPower;
              if (vote === 1) votes.forVotes += power;
              else if (vote === 0) votes.againstVotes += power;
              else votes.abstainVotes += power;
              return votes;
            })
          );
          setIsLoading(false);
        },
        [userStatus.votingPower]
      );

      return { castVote, isLoading };
    },

    useProposalCalldata(_id: string) {
      // Dummy data — targets/values/calldatas
      const dummy = {
        targets: ["0x0b55a0f463b6defb81c6063973763951712d0e5f"],
        values: ["0"],
        calldatas: ["0x"],
      };
      // eslint-disable-next-line react-hooks/rules-of-hooks
      return useDummyQuery(dummy, 400);
    },

    useDelegateVotes(address: string) {
      // Dummy delegate vote records
      const dummy = proposals.slice(0, 3).map((p, i) => ({
        proposalId: p.id,
        voter: address,
        support: (i % 3) as 0 | 1 | 2,
        weight: 1000 + i * 500,
        reason: i === 0 ? "Good proposal" : "",
        blockNumber: 1000000 + i * 100,
      }));
      // eslint-disable-next-line react-hooks/rules-of-hooks
      return useDummyQuery(dummy, 500);
    },

    useDelegation() {
      const [isLoading, setIsLoading] = useState(false);

      const delegate = useCallback(async (to: string) => {
        setIsLoading(true);
        await new Promise((r) => setTimeout(r, 1500));
        setUserStatus((prev) => ({ ...prev, delegatedTo: to, delegatedAmount: prev.vtonBalance }));
        setIsLoading(false);
      }, []);

      const undelegate = useCallback(async () => {
        setIsLoading(true);
        await new Promise((r) => setTimeout(r, 1500));
        setUserStatus((prev) => ({
          ...prev,
          delegatedTo: undefined,
          delegatedAmount: 0,
          votingPower: 0,
        }));
        setIsLoading(false);
      }, []);

      return { delegate, undelegate, isLoading };
    },
  }), [proposals, userStatus]);

  return (
    <GovernanceContext.Provider value={provider}>
      {children}
    </GovernanceContext.Provider>
  );
}
