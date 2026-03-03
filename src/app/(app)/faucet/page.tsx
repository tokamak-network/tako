"use client";

import { FaucetCards } from "@/components/faucet/FaucetCard";

export default function FaucetPage() {
  return (
    <div className="space-y-[var(--space-6)]">
      <div>
        <h1 className="text-2xl font-bold">Testnet Faucet</h1>
        <p className="text-sm text-[var(--text-tertiary)] mt-1">
          Claim testnet tokens to participate in governance on Sepolia.
        </p>
      </div>
      <FaucetCards />
    </div>
  );
}
