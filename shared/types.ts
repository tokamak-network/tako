/**
 * Governance Types for vTON DAO
 * Single Source of Truth — derived from dao-v2 types
 * NOTE: proposal ID is string to avoid bigint serialization issues
 */

export type GovernanceSystem = "v1" | "v2";

export type ProposalStatus =
  | "active"
  | "pending"
  | "executed"
  | "defeated"
  | "canceled"
  | "queued"
  | "succeeded"
  | "expired";

export enum ProposalState {
  Pending = 0,
  Active = 1,
  Canceled = 2,
  Defeated = 3,
  Succeeded = 4,
  Queued = 5,
  Expired = 6,
  Executed = 7,
}

// IMPORTANT: Must match contract enum order (Against=0, For=1, Abstain=2)
export enum VoteType {
  Against = 0,
  For = 1,
  Abstain = 2,
}

export function mapProposalState(state: ProposalState): ProposalStatus {
  const map: Record<ProposalState, ProposalStatus> = {
    [ProposalState.Pending]: "pending",
    [ProposalState.Active]: "active",
    [ProposalState.Canceled]: "canceled",
    [ProposalState.Defeated]: "defeated",
    [ProposalState.Succeeded]: "succeeded",
    [ProposalState.Queued]: "queued",
    [ProposalState.Expired]: "expired",
    [ProposalState.Executed]: "executed",
  };
  return map[state] ?? "pending";
}

export interface Proposal {
  id: string;
  proposer: string;
  title: string;
  description: string;
  status: ProposalStatus;
  governanceSystem: GovernanceSystem;
  forVotes: number;
  againstVotes: number;
  abstainVotes: number;
  startTime: number; // unix timestamp
  endTime: number;
  eta?: number;
  quorum: number;
  totalVotingPower: number;
}

export interface ProposalListItem {
  id: string;
  title: string;
  status: ProposalStatus;
  governanceSystem: GovernanceSystem;
  proposer: string;
  forVotes: number;
  againstVotes: number;
  abstainVotes: number;
  startTime: number;
  endTime: number;
}

export interface DelegateInfo {
  address: string;
  name?: string;
  avatar?: string;
  votingPower: number;
  delegators: number;
  statement?: string;
  voteParticipation: number; // 0-100
  recentVotes: { proposalId: string; vote: VoteType }[];
}

export interface UserStatus {
  vtonBalance: number;
  delegatedTo?: string;
  delegatedAmount: number;
  receivedDelegations: number;
  votingPower: number;
}

export interface DAOParameters {
  quorum: number; // percentage (e.g., 4 = 4%)
  votingPeriod: number; // seconds
  votingDelay: number; // seconds
  proposalCreationCost: number; // TON
  timelockDelay: number; // seconds
}

export interface VTONInfo {
  totalSupply: number;
  maxSupply: number;
  currentEpoch: number;
}

export interface DashboardMetrics {
  totalVTONSupply: number;
  activeProposals: number;
  totalDelegates: number;
  totalDelegators: number;
  treasuryBalance: number;
  participationRate: number; // percentage
}

// --- Proposal calldata (decoded by agent) ---

export interface ProposalCalldata {
  targets: string[];
  values: string[];
  calldatas: string[];
}

// --- Delegate vote record ---

export interface DelegateVoteRecord {
  proposalId: string;
  voter: string;
  support: VoteType;
  weight: number;
  reason: string;
  blockNumber: number;
}

// --- Delegate profile (Supabase off-chain) ---

export interface DelegateProfile {
  address: string;
  name?: string;
  avatar?: string;
  bio?: string;
  twitter?: string;
  discord?: string;
  website?: string;
  updatedAt?: string;
}

// --- Forum types (from dao-agent) ---

export type ForumAgendaStatus = "draft" | "rfc" | "snapshot" | "review" | "onchain" | "executed" | "rejected" | "withdrawn";

export interface ForumAgendaListItem {
  id: number;
  tipNumber: string;
  title: string;
  status: ForumAgendaStatus;
  author: string;
  createdAt: string;
  updatedAt: string;
  commentCount: number;
  opinionCount: number;
}

export interface ForumAgenda extends ForumAgendaListItem {
  abstract: string;
  motivation: string;
  specification: string;
  rationale: string;
  securityConsiderations: string;
  expectedOutcomes: string;
  proposalId?: string;
  onchainProposalId?: string;
}

export interface ForumComment {
  id: number;
  agendaId: number;
  author: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

// --- Security Council types ---

export enum ActionType {
  CancelProposal = 0,
  PauseProtocol = 1,
  UnpauseProtocol = 2,
  EmergencyUpgrade = 3,
}

export interface EmergencyAction {
  id: number;
  actionType: ActionType;
  target: string;
  data: string;
  proposer: string;
  reason: string;
  approvalCount: number;
  executed: boolean;
  canceled: boolean;
  createdAt: number;
}
