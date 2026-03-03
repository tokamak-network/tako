export interface ContractAddresses {
  vton: string;
  delegateRegistry: string;
  daoGovernor: string;
  timelock: string;
  securityCouncil: string;
  ton?: string;
  faucet?: string;
  tonFaucet?: string;
}

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000" as const;

// Deployment blocks by chain ID (for event log queries)
export const DEPLOYMENT_BLOCKS: Record<number, bigint> = {
  11155111: BigInt(10319391), // Sepolia
  1: BigInt(0), // Mainnet (placeholder)
};

// Contract addresses by chain ID
export const CONTRACT_ADDRESSES: Record<number, ContractAddresses> = {
  // Sepolia Testnet (deployed 2025-01-30)
  11155111: {
    ton: "0x8395F53A7EDdF64F3AC61540aCDe1c45418733E4",
    vton: "0xb36195D4DE194f0a4a08B8Ce5876548eDac41cb0",
    delegateRegistry: "0xb773666b4Cd1e376B71845a6B94CBEE46287462b",
    daoGovernor: "0xCe4a45E70E91bF715710461a5687D5Cf5EfE4e92",
    securityCouncil: "0x750143eA6a8C0B96AAEf6F04F873894BbE922F4E",
    timelock: "0x13608EfD349Fb47df19FDC1156146A79f231Ba62",
    faucet: "0xC02e7D6cA66A2860b1A4518be33865a137A69af6",
    tonFaucet: "0x67821E45321aB4f5c35b7236dc38E63192e5aCd6",
  },
  // Ethereum Mainnet (placeholder — not yet deployed)
  1: {
    vton: ZERO_ADDRESS,
    delegateRegistry: ZERO_ADDRESS,
    daoGovernor: ZERO_ADDRESS,
    securityCouncil: ZERO_ADDRESS,
    timelock: ZERO_ADDRESS,
  },
};

export function getContractAddresses(chainId: number): ContractAddresses {
  return CONTRACT_ADDRESSES[chainId] ?? CONTRACT_ADDRESSES[1];
}

export function areContractsDeployed(chainId: number): boolean {
  const addresses = getContractAddresses(chainId);
  return addresses.vton !== ZERO_ADDRESS;
}

export function getDeploymentBlock(chainId: number): bigint {
  return DEPLOYMENT_BLOCKS[chainId] ?? BigInt(0);
}
