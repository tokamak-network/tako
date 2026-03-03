"use client";

import { useAccount, useChainId } from "wagmi";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  useTONBalance,
  useVTONBalance,
  useTONFaucetClaim,
  useVTONFaucetConfig,
  useVTONFaucetClaim,
} from "@/hooks/contracts";
import { formatAddress, formatNumber } from "@/lib/utils";

function TokenFaucet({
  name,
  symbol,
  balance,
  claimAmount,
  isPaused,
  isLoading,
  isConfirmed,
  onClaim,
  hash,
}: {
  name: string;
  symbol: string;
  balance?: number;
  claimAmount?: number;
  isPaused: boolean;
  isLoading: boolean;
  isConfirmed: boolean;
  onClaim: () => void;
  hash?: string;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{name} Faucet</CardTitle>
          {isPaused && <Badge variant="warning" size="sm">Paused</Badge>}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-[var(--text-tertiary)]">Your Balance</span>
            <span className="text-[var(--text-primary)] font-medium">
              {balance != null ? `${formatNumber(balance)} ${symbol}` : "—"}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-[var(--text-tertiary)]">Claim Amount</span>
            <span className="text-[var(--text-secondary)]">
              {claimAmount != null ? `${formatNumber(claimAmount)} ${symbol}` : "—"}
            </span>
          </div>
          <Button
            onClick={onClaim}
            disabled={isPaused}
            loading={isLoading}
            className="w-full"
          >
            {isConfirmed ? `${symbol} Claimed!` : `Claim ${symbol}`}
          </Button>
          {isConfirmed && hash && (
            <p className="text-xs text-[var(--color-success-500)] text-center">
              Transaction confirmed
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function FaucetCards() {
  const { address } = useAccount();
  const chainId = useChainId();

  const { data: tonBalance, refetch: refetchTon } = useTONBalance();
  const { data: vtonBalance, refetch: refetchVton } = useVTONBalance();
  const { claimAmount: vtonClaimAmount, isPaused: vtonPaused } = useVTONFaucetConfig();
  const vtonFaucet = useVTONFaucetClaim();
  const tonFaucet = useTONFaucetClaim();

  const handleVtonClaim = () => {
    vtonFaucet.claim();
    setTimeout(() => refetchVton(), 3000);
  };

  const handleTonClaim = () => {
    tonFaucet.claim();
    setTimeout(() => refetchTon(), 3000);
  };

  if (!address) {
    return (
      <Card padding="lg">
        <p className="text-center text-[var(--text-tertiary)]">Connect your wallet to use the faucet</p>
      </Card>
    );
  }

  if (chainId !== 11155111) {
    return (
      <Card padding="lg">
        <p className="text-center text-[var(--text-tertiary)]">Faucet is only available on Sepolia testnet</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card variant="outlined" padding="sm">
        <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
          <span>Connected:</span>
          <span className="font-mono text-[var(--text-primary)]">{formatAddress(address)}</span>
          <Badge variant="outline" size="sm">Sepolia</Badge>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <TokenFaucet
          name="vTON"
          symbol="vTON"
          balance={vtonBalance}
          claimAmount={vtonClaimAmount}
          isPaused={vtonPaused}
          isLoading={vtonFaucet.isLoading}
          isConfirmed={vtonFaucet.isConfirmed}
          onClaim={handleVtonClaim}
          hash={vtonFaucet.hash}
        />
        <TokenFaucet
          name="TON"
          symbol="TON"
          balance={tonBalance}
          claimAmount={tonFaucet.claimAmount}
          isPaused={tonFaucet.isPaused}
          isLoading={tonFaucet.isLoading}
          isConfirmed={tonFaucet.isConfirmed}
          onClaim={handleTonClaim}
          hash={tonFaucet.hash}
        />
      </div>
    </div>
  );
}
