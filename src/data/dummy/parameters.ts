import type { DAOParameters, DashboardMetrics, VTONInfo } from "../../../shared/types";

export const dummyDAOParameters: DAOParameters = {
  quorum: 4, // 4%
  votingPeriod: 7 * 86400, // 7 days
  votingDelay: 86400, // 1 day
  proposalCreationCost: 10, // 10 TON
  timelockDelay: 7 * 86400, // 7 days
};

export const dummyVTONInfo: VTONInfo = {
  totalSupply: 45_000_000,
  maxSupply: 100_000_000,
  currentEpoch: 3,
};

export const dummyDashboardMetrics: DashboardMetrics = {
  totalVTONSupply: 45_000_000,
  activeProposals: 1,
  totalDelegates: 5,
  totalDelegators: 927,
  treasuryBalance: 12_500_000,
  participationRate: 42,
};
