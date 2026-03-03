export const SECURITY_COUNCIL_ABI = [
  // Read
  {
    name: "members",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "index", type: "uint256" }],
    outputs: [{ name: "", type: "address" }],
  },
  {
    name: "memberCount",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "threshold",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "isMember",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    name: "pendingActionCount",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "getAction",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "actionId", type: "uint256" }],
    outputs: [
      {
        name: "",
        type: "tuple",
        components: [
          { name: "id", type: "uint256" },
          { name: "actionType", type: "uint8" },
          { name: "target", type: "address" },
          { name: "data", type: "bytes" },
          { name: "proposer", type: "address" },
          { name: "reason", type: "string" },
          { name: "approvalCount", type: "uint256" },
          { name: "executed", type: "bool" },
          { name: "canceled", type: "bool" },
          { name: "createdAt", type: "uint256" },
        ],
      },
    ],
  },
  {
    name: "hasApproved",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "actionId", type: "uint256" },
      { name: "member", type: "address" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  // Write
  {
    name: "proposeEmergencyAction",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "actionType", type: "uint8" },
      { name: "target", type: "address" },
      { name: "data", type: "bytes" },
      { name: "reason", type: "string" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "approveAction",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "actionId", type: "uint256" }],
    outputs: [],
  },
  {
    name: "executeAction",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "actionId", type: "uint256" }],
    outputs: [],
  },
  {
    name: "cancelAction",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "actionId", type: "uint256" }],
    outputs: [],
  },
  // Events
  {
    name: "EmergencyActionProposed",
    type: "event",
    inputs: [
      { name: "actionId", type: "uint256", indexed: true },
      { name: "proposer", type: "address", indexed: true },
      { name: "actionType", type: "uint8", indexed: false },
      { name: "reason", type: "string", indexed: false },
    ],
  },
  {
    name: "ActionApproved",
    type: "event",
    inputs: [
      { name: "actionId", type: "uint256", indexed: true },
      { name: "member", type: "address", indexed: true },
    ],
  },
  {
    name: "ActionExecuted",
    type: "event",
    inputs: [
      { name: "actionId", type: "uint256", indexed: true },
    ],
  },
] as const;
