import type { UserStatus } from "../../../shared/types";

export const dummyUserStatus: UserStatus = {
  vtonBalance: 15_000,
  delegatedTo: "0x1234567890abcdef1234567890abcdef12345678",
  delegatedAmount: 15_000,
  receivedDelegations: 0,
  votingPower: 15_000,
};

export const dummyDisconnectedUser: UserStatus = {
  vtonBalance: 0,
  delegatedAmount: 0,
  receivedDelegations: 0,
  votingPower: 0,
};
