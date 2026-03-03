import { VoteType, type DelegateInfo } from "../../../shared/types";

export const dummyDelegates: DelegateInfo[] = [
  {
    address: "0x1234567890abcdef1234567890abcdef12345678",
    name: "tokamak.eth",
    votingPower: 4_500_000,
    delegators: 156,
    statement:
      "I believe in progressive decentralization. I vote to strengthen protocol security while enabling innovation. Active in governance since day 1.",
    voteParticipation: 95,
    recentVotes: [
      { proposalId: "1", vote: VoteType.For },
      { proposalId: "3", vote: VoteType.For },
      { proposalId: "4", vote: VoteType.Against },
    ],
  },
  {
    address: "0xabcdef1234567890abcdef1234567890abcdef12",
    name: "layer2builder.eth",
    votingPower: 3_200_000,
    delegators: 89,
    statement:
      "Layer2 ecosystem growth is my priority. I carefully evaluate technical proposals and always simulate before voting.",
    voteParticipation: 88,
    recentVotes: [
      { proposalId: "1", vote: VoteType.For },
      { proposalId: "3", vote: VoteType.For },
      { proposalId: "5", vote: VoteType.For },
    ],
  },
  {
    address: "0x9876543210fedcba9876543210fedcba98765432",
    name: "defi-guardian.eth",
    votingPower: 2_800_000,
    delegators: 203,
    statement:
      "Security first, always. I specialize in auditing on-chain proposals and advocating for conservative parameter changes.",
    voteParticipation: 100,
    recentVotes: [
      { proposalId: "1", vote: VoteType.Against },
      { proposalId: "4", vote: VoteType.Against },
      { proposalId: "5", vote: VoteType.Abstain },
    ],
  },
  {
    address: "0xfedcba9876543210fedcba9876543210fedcba98",
    name: "Community Voice",
    votingPower: 1_900_000,
    delegators: 412,
    statement:
      "Representing the small holders. I engage with the community before every vote and publish my reasoning publicly.",
    voteParticipation: 78,
    recentVotes: [
      { proposalId: "1", vote: VoteType.For },
      { proposalId: "3", vote: VoteType.For },
    ],
  },
  {
    address: "0x1111222233334444555566667777888899990000",
    name: "Protocol Researcher",
    votingPower: 1_200_000,
    delegators: 67,
    statement:
      "I focus on economic analysis and long-term protocol sustainability. Each vote decision is backed by quantitative modeling.",
    voteParticipation: 92,
    recentVotes: [
      { proposalId: "1", vote: VoteType.For },
      { proposalId: "4", vote: VoteType.For },
      { proposalId: "5", vote: VoteType.For },
    ],
  },
];
