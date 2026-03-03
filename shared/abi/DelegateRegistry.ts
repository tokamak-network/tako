export const DELEGATE_REGISTRY_ABI = [
  // Read functions
  {
    name: "getAllDelegates",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "address[]" }],
  },
  {
    name: "getTotalDelegated",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "delegate", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "getDelegation",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "owner", type: "address" },
      { name: "delegate", type: "address" },
    ],
    outputs: [
      {
        name: "",
        type: "tuple",
        components: [
          { name: "delegate", type: "address" },
          { name: "amount", type: "uint256" },
          { name: "delegatedAt", type: "uint256" },
          { name: "expiresAt", type: "uint256" },
        ],
      },
    ],
  },
  {
    name: "getDelegateInfo",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "delegate", type: "address" }],
    outputs: [
      {
        name: "",
        type: "tuple",
        components: [
          { name: "profile", type: "string" },
          { name: "votingPhilosophy", type: "string" },
          { name: "interests", type: "string" },
          { name: "registeredAt", type: "uint256" },
          { name: "isActive", type: "bool" },
        ],
      },
    ],
  },
  {
    name: "isRegisteredDelegate",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "bool" }],
  },
  // Write functions
  {
    name: "delegate",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "delegate", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [],
  },
  {
    name: "undelegate",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "delegate", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [],
  },
  // Events
  {
    name: "Delegated",
    type: "event",
    inputs: [
      { name: "owner", type: "address", indexed: true },
      { name: "delegate", type: "address", indexed: true },
      { name: "amount", type: "uint256", indexed: false },
      { name: "expiresAt", type: "uint256", indexed: false },
    ],
  },
  {
    name: "Undelegated",
    type: "event",
    inputs: [
      { name: "owner", type: "address", indexed: true },
      { name: "delegate", type: "address", indexed: true },
      { name: "amount", type: "uint256", indexed: false },
    ],
  },
] as const;
