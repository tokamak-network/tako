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

export interface QueryResult<T> {
  data: T | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch?: () => void;
}

export interface MutationResult {
  mutate: (...args: unknown[]) => void;
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  error: Error | null;
}

export interface GovernanceDataProvider {
  // Read
  useProposals(filter?: ProposalStatus): QueryResult<ProposalListItem[]>;
  useProposal(id: string): QueryResult<Proposal>;
  useDelegates(): QueryResult<DelegateInfo[]>;
  useDelegateInfo(address: string): QueryResult<DelegateInfo>;
  useUserStatus(address?: string): QueryResult<UserStatus>;
  useVotingPower(address?: string): QueryResult<number>;
  useDAOParameters(): QueryResult<DAOParameters>;
  useDashboardMetrics(): QueryResult<DashboardMetrics>;
  // Write
  useCastVote(): {
    castVote: (proposalId: string, vote: VoteType, reason?: string) => Promise<void>;
    isLoading: boolean;
  };
  useDelegation(): {
    delegate: (to: string) => Promise<void>;
    undelegate: () => Promise<void>;
    isLoading: boolean;
  };
  // Extended (optional — not all providers implement these)
  useProposalCalldata?(id: string): QueryResult<ProposalCalldata>;
  useDelegateVotes?(address: string): QueryResult<DelegateVoteRecord[]>;
}
